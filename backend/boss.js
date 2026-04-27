import express from 'express';
import { query } from './db.js';
import { authenticate, optionalAuthenticate } from './middleware.js';
import { autoGrantPendingChests } from './utils/bossRewards.js';

import { getRandomPhrase } from './utils/bossPhrases.js';
import { getLocalDateString } from './utils/date.js';

const router = express.Router();

// Get active or upcoming boss
router.get('/active', optionalAuthenticate, async (req, res) => {
  try {
    // Current boss is the one with the lowest order_index that is not defeated
    let bossRes = await query(
      `SELECT * FROM boss_fights 
       WHERE status != 'defeated' 
       ORDER BY order_index ASC LIMIT 1`
    );

    // AUTO-RESET LOOP: If all bosses are defeated, reset them all to active
    if (bossRes.rows.length === 0) {
      await query('BEGIN');
      try {
        // Reset all bosses to active and full HP
        await query(`UPDATE boss_fights SET status = 'active', current_hp = total_hp`);
        // Reset all participants damage and claims for the new loop
        await query(`UPDATE event_participants SET damage_dealt = 0, chests_claimed = 0`);
        await query('COMMIT');
        
        // Re-fetch the first boss
        bossRes = await query(
          `SELECT * FROM boss_fights 
           WHERE status != 'defeated' 
           ORDER BY order_index ASC LIMIT 1`
        );
      } catch (err) {
        await query('ROLLBACK');
        throw err;
      }
    }

    if (bossRes.rows.length === 0) {
      return res.json(null);
    }
    
    const boss = bossRes.rows[0];

    // Get Next Boss preview
    const nextBossRes = await query(
      `SELECT name, image_url FROM boss_fights 
       WHERE order_index > $1 AND status != 'defeated'
       ORDER BY order_index ASC LIMIT 1`,
      [boss.order_index]
    );
    const next_boss = nextBossRes.rows[0] || null;

    // User-specific data (only if logged in)
    let personal_damage = 0;
    let daily_damage = 0;
    let chests_claimed = 0;
    let boss_chests = 0;
    let epic_chests = 0;
    let legendary_chests = 0;

    if (req.user) {
      // Get user's personal participation and chest status
      const participantRes = await query(
        `SELECT p.damage_dealt, p.chests_claimed, u.daily_boss_damage, u.last_boss_damage_date 
         FROM event_participants p 
         JOIN users u ON u.id = p.user_id
         WHERE p.boss_fight_id = $1 AND p.user_id = $2`,
        [boss.id, req.user.id]
      );

      let participant = participantRes.rows[0];
      
      // If no record in event_participants yet, still need to check daily_boss_damage from users table
      if (!participant) {
        const userRes = await query('SELECT daily_boss_damage, last_boss_damage_date FROM users WHERE id = $1', [req.user.id]);
        const user = userRes.rows[0];
        participant = { 
          damage_dealt: 0, 
          chests_claimed: 0, 
          daily_boss_damage: user.daily_boss_damage, 
          last_boss_damage_date: user.last_boss_damage_date 
        };
      }

      const isToday = getLocalDateString(participant.last_boss_damage_date) === getLocalDateString();
      daily_damage = isToday ? participant.daily_boss_damage : 0;
      personal_damage = participant.damage_dealt;
      chests_claimed = participant.chests_claimed;

      // AUTO-GRANT CHESTS FOR PREVIOUS DEFEATED BOSSES
      await autoGrantPendingChests(req.user.id);

      // Refresh user chest count
      const finalUserRes = await query('SELECT boss_chests, epic_chests, legendary_chests FROM users WHERE id = $1', [req.user.id]);
      boss_chests = finalUserRes.rows[0]?.boss_chests || 0;
      epic_chests = finalUserRes.rows[0]?.epic_chests || 0;
      legendary_chests = finalUserRes.rows[0]?.legendary_chests || 0;
    }

    // Get Top Damage Dealer for this boss
    const topParticipantRes = await query(
      `SELECT u.name, u.avatar_url, p.damage_dealt
       FROM event_participants p
       JOIN users u ON p.user_id = u.id
       WHERE p.boss_fight_id = $1
       ORDER BY p.damage_dealt DESC
       LIMIT 1`,
      [boss.id]
    );
    const top_damage_dealer = topParticipantRes.rows[0] || null;

    res.json({
      boss: { 
        ...boss, 
        starts_in: null,
        active_phrase: getRandomPhrase(boss.name)
      },
      next_boss: req.user ? next_boss : null,
      personal_damage,
      daily_damage,
      chests_claimed,
      boss_chests,
      epic_chests,
      legendary_chests,
      top_damage_dealer: req.user ? top_damage_dealer : null
    });
  } catch (error) {
    console.error('Error fetching boss:', error);
    res.status(500).json({ message: 'Error fetching boss data' });
  }
});

// Claim chest with Smart Reward Logic
router.post('/claim-chest/:bossId', authenticate, async (req, res) => {
  const bossId = parseInt(req.params.bossId);
  const userId = req.user.id;

  try {
    const bossRes = await query('SELECT * FROM boss_fights WHERE id = $1', [bossId]);
    if (bossRes.rows.length === 0) return res.status(404).json({ message: 'Boss not found' });
    const boss = bossRes.rows[0];

    const isDefeated = boss.current_hp <= 0 || boss.status === 'defeated';
    if (!isDefeated) return res.status(400).json({ message: 'El boss aún no ha sido derrotado' });

    const partRes = await query('SELECT chests_claimed, damage_dealt FROM event_participants WHERE boss_fight_id = $1 AND user_id = $2', [bossId, userId]);
    if (partRes.rows.length === 0 || partRes.rows[0].damage_dealt <= 0) {
      return res.status(403).json({ message: 'Debes participar al menos con 1 repetición para reclamar el cofre' });
    }
    
    const participant = partRes.rows[0];
    if (participant.chests_claimed >= 1) {
      return res.status(400).json({ message: 'Ya has reclamado el cofre de este boss' });
    }

    await query('BEGIN');
    if (boss.is_legendary) {
      await query('UPDATE users SET legendary_chests = legendary_chests + 1 WHERE id = $1', [userId]);
    } else if (boss.is_epic) {
      await query('UPDATE users SET epic_chests = epic_chests + 1 WHERE id = $1', [userId]);
    } else {
      await query('UPDATE users SET boss_chests = boss_chests + 1 WHERE id = $1', [userId]);
    }
    await query('UPDATE event_participants SET chests_claimed = 1 WHERE boss_fight_id = $1 AND user_id = $2', [bossId, userId]);
    await query('COMMIT');

    const chestType = boss.is_legendary ? 'legendary' : (boss.is_epic ? 'epic' : 'normal');

    res.json({ 
      message: boss.is_legendary ? '¡Cofre LEGENDARIO reclamado!' : (boss.is_epic ? '¡Cofre ÉPICO reclamado!' : '¡Cofre reclamado!'),
      new_chests_claimed: 1,
      chest_type: chestType
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error claiming chest:', error);
    res.status(500).json({ message: 'Error al reclamar el cofre' });
  }
});

// Open Chest - Clash Royale Style (1-3 items + Gold)
router.post('/open-chest', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const userRes = await query('SELECT boss_chests FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0 || userRes.rows[0].boss_chests <= 0) {
      return res.status(400).json({ message: 'No tienes cofres para abrir' });
    }

    await query('BEGIN');

    // 1. Determine number of item rewards (1 to 3)
    const numItems = Math.floor(Math.random() * 3) + 1;
    const rewards = [];
    let totalCoins = 0;

    // 2. Base Gold (always given)
    const baseGold = 500;
    totalCoins += baseGold;
    rewards.push({ type: 'coins', amount: baseGold, message: 'Oro garantizado' });

    for (let i = 0; i < numItems; i++) {
        // Random rarity weighted logic
        const rand = Math.random();
        let targetRarity = 'common';
        if (rand < 0.05) targetRarity = 'calistenico';
        else if (rand < 0.15) targetRarity = 'legendary';
        else if (rand < 0.35) targetRarity = 'especial';
        else if (rand < 0.65) targetRarity = 'rare';

        // Try to find an unowned item of that rarity
        let itemRes = await query(`
            SELECT * FROM items 
            WHERE rarity = $1 
            AND type != 'bundle'
            AND is_seasonal = TRUE
            AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $2 AND item_id = items.id)
            ORDER BY RANDOM() LIMIT 1
        `, [targetRarity, userId]);

        if (itemRes.rows.length > 0) {
            const rewardItem = itemRes.rows[0];
            rewards.push({ type: 'item', data: rewardItem });
            await query(`
                INSERT INTO user_items (user_id, item_id, is_new)
                VALUES ($1, $2, TRUE)
                ON CONFLICT (user_id, item_id) DO NOTHING
            `, [userId, rewardItem.id]);
        } else {
            // User owns all items of this rarity. Try to find ANY unowned item.
            let fallbackRes = await query(`
                SELECT * FROM items 
                WHERE type != 'bundle'
                AND is_seasonal = TRUE
                AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = items.id)
                ORDER BY RANDOM() LIMIT 1
            `, [userId]);

            if (fallbackRes.rows.length > 0) {
                const rewardItem = fallbackRes.rows[0];
                rewards.push({ type: 'item', data: rewardItem, message: `Reemplazo de ${targetRarity}` });
                await query(`
                    INSERT INTO user_items (user_id, item_id, is_new)
                    VALUES ($1, $2, TRUE)
                    ON CONFLICT (user_id, item_id) DO NOTHING
                `, [userId, rewardItem.id]);
            } else {
                // User owns EVERYTHING? Give gold compensation proportional to price of a random item of targetRarity
                const priceRes = await query(`
                    SELECT price FROM items 
                    WHERE rarity = $1 AND type != 'bundle'
                    ORDER BY RANDOM() LIMIT 1
                `, [targetRarity]);
                
                const goldAmount = priceRes.rows[0]?.price || (targetRarity === 'calistenico' ? 5000 : 500);
                totalCoins += goldAmount;
                rewards.push({ 
                    type: 'coins', 
                    amount: goldAmount, 
                    message: `Compensación: ${targetRarity.toUpperCase()} duplicado` 
                });
            }
        }
    }

    await query('UPDATE users SET boss_chests = boss_chests - 1, reppy_coins = reppy_coins + $1 WHERE id = $2', [totalCoins, userId]);

    // Reel items for legacy animation support
    const dummiesRes = await query(`SELECT name, type, rarity FROM items WHERE type != 'bundle' ORDER BY RANDOM() LIMIT 40`);

    await query('COMMIT');

    // For backward compatibility, pick the first item as 'main'
    const firstItem = rewards.find(r => r.type === 'item');

    res.json({ 
      success: true,
      reward: {
        item: firstItem ? firstItem.data : null,
        coins: totalCoins,
        message: `Has recuperado ${numItems} artefactos del boss.`,
        rewards // New field for updated UI
      },
      rewards, 
      totalCoins,
      reel_items: dummiesRes.rows
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error opening chest:', error);
    res.status(500).json({ message: 'Error al abrir el cofre' });
  }
});

// Open Legendary Chest - Guaranteed Legendary + Usual Drops
router.post('/open-legendary-chest', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const userRes = await query('SELECT legendary_chests FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0 || userRes.rows[0].legendary_chests <= 0) {
      return res.status(400).json({ message: 'No tienes cofres legendarios para abrir' });
    }

    await query('BEGIN');

    const rewards = [];
    let totalCoins = 0;

    // 1. Base Gold
    const baseGold = 1000; // Legendary chest gives more base gold
    totalCoins += baseGold;
    rewards.push({ type: 'coins', amount: baseGold, message: 'Oro Legendario' });

    // 2. GUARANTEED LEGENDARY ITEM
    let legItemRes = await query(`
        SELECT * FROM items 
        WHERE rarity = 'legendary' AND type != 'bundle'
        AND is_seasonal = TRUE
        AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = items.id)
        ORDER BY RANDOM() LIMIT 1
    `, [userId]);

    if (legItemRes.rows.length > 0) {
        const rewardItem = legItemRes.rows[0];
        rewards.push({ type: 'item', data: rewardItem, message: 'LEGENDARIO GARANTIZADO' });
        await query(`INSERT INTO user_items (user_id, item_id, is_new) VALUES ($1, $2, TRUE)`, [userId, rewardItem.id]);
    } else {
        // User has all legendaries? Give huge gold compensation
        totalCoins += 2500;
        rewards.push({ type: 'coins', amount: 2500, message: 'Compensación: Todos los Legendarios obtenidos' });
    }

    // 3. 1-3 additional items (standard drops)
    const extraItems = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < extraItems; i++) {
        const rand = Math.random();
        let targetRarity = 'common';
        if (rand < 0.10) targetRarity = 'calistenico';
        else if (rand < 0.25) targetRarity = 'legendary';
        else if (rand < 0.50) targetRarity = 'especial';
        else if (rand < 0.75) targetRarity = 'rare';

        let itemRes = await query(`
            SELECT * FROM items 
            WHERE rarity = $1 AND type != 'bundle'
            AND is_seasonal = TRUE
            AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $2 AND item_id = items.id)
            ORDER BY RANDOM() LIMIT 1
        `, [targetRarity, userId]);

        if (itemRes.rows.length > 0) {
            const rewardItem = itemRes.rows[0];
            rewards.push({ type: 'item', data: rewardItem });
            await query(`INSERT INTO user_items (user_id, item_id, is_new) VALUES ($1, $2, TRUE)`, [userId, rewardItem.id]);
        } else {
             // Fallback gold
             totalCoins += 500;
             rewards.push({ type: 'coins', amount: 500, message: 'Botín extra en oro' });
        }
    }

    await query('UPDATE users SET legendary_chests = legendary_chests - 1, reppy_coins = reppy_coins + $1 WHERE id = $2', [totalCoins, userId]);
    
    const dummiesRes = await query(`SELECT name, type, rarity FROM items WHERE type != 'bundle' ORDER BY RANDOM() LIMIT 40`);
    await query('COMMIT');

    const firstItem = rewards.find(r => r.type === 'item');

    res.json({ 
      success: true,
      reward: {
        item: firstItem ? firstItem.data : null,
        coins: totalCoins,
        message: `¡Cofre Legendario abierto!`,
        rewards
      },
      rewards, 
      totalCoins,
      reel_items: dummiesRes.rows
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error opening legendary chest:', error);
    res.status(500).json({ message: 'Error al abrir el cofre legendario' });
  }
});
// Open Epic Chest - Guaranteed Special + Usual Drops
router.post('/open-epic-chest', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const userRes = await query('SELECT epic_chests FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0 || userRes.rows[0].epic_chests <= 0) {
      return res.status(400).json({ message: 'No tienes cofres épicos para abrir' });
    }

    await query('BEGIN');

    const rewards = [];
    let totalCoins = 0;

    // 1. Base Gold
    const baseGold = 800; 
    totalCoins += baseGold;
    rewards.push({ type: 'coins', amount: baseGold, message: 'Oro Épico' });

    // 2. GUARANTEED SPECIAL ITEM
    let epicItemRes = await query(`
        SELECT * FROM items 
        WHERE rarity = 'especial' AND type != 'bundle'
        AND is_seasonal = TRUE
        AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = items.id)
        ORDER BY RANDOM() LIMIT 1
    `, [userId]);

    if (epicItemRes.rows.length > 0) {
        const rewardItem = epicItemRes.rows[0];
        rewards.push({ type: 'item', data: rewardItem, message: 'EPICO GARANTIZADO' });
        await query(`INSERT INTO user_items (user_id, item_id, is_new) VALUES ($1, $2, TRUE)`, [userId, rewardItem.id]);
    } else {
        // Fallback gold
        totalCoins += 1200;
        rewards.push({ type: 'coins', amount: 1200, message: 'Compensación: Todos los Épicos obtenidos' });
    }

    // 3. 1-2 additional items
    const extraItems = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < extraItems; i++) {
        const rand = Math.random();
        let targetRarity = 'common';
        if (rand < 0.10) targetRarity = 'legendary';
        else if (rand < 0.30) targetRarity = 'especial';
        else if (rand < 0.60) targetRarity = 'rare';

        let itemRes = await query(`
            SELECT * FROM items 
            WHERE rarity = $1 AND type != 'bundle'
            AND is_seasonal = TRUE
            AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $2 AND item_id = items.id)
            ORDER BY RANDOM() LIMIT 1
        `, [targetRarity, userId]);

        if (itemRes.rows.length > 0) {
            const rewardItem = itemRes.rows[0];
            rewards.push({ type: 'item', data: rewardItem });
            await query(`INSERT INTO user_items (user_id, item_id, is_new) VALUES ($1, $2, TRUE)`, [userId, rewardItem.id]);
        } else {
             totalCoins += 400;
             rewards.push({ type: 'coins', amount: 400, message: 'Botín extra en oro' });
        }
    }

    await query('UPDATE users SET epic_chests = epic_chests - 1, reppy_coins = reppy_coins + $1 WHERE id = $2', [totalCoins, userId]);
    
    const dummiesRes = await query(`SELECT name, type, rarity FROM items WHERE type != 'bundle' ORDER BY RANDOM() LIMIT 40`);
    await query('COMMIT');

    const firstItem = rewards.find(r => r.type === 'item');

    res.json({ 
      success: true,
      reward: {
        item: firstItem ? firstItem.data : null,
        coins: totalCoins,
        message: `¡Cofre Épico abierto!`,
        rewards
      },
      rewards, 
      totalCoins,
      reel_items: dummiesRes.rows
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error opening epic chest:', error);
    res.status(500).json({ message: 'Error al abrir el cofre épico' });
  }
});

router.post('/open-level-chest', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const userRes = await query('SELECT level_chests FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0 || userRes.rows[0].level_chests <= 0) {
      return res.status(400).json({ message: 'No tienes cofres de nivel para abrir' });
    }

    await query('BEGIN');

    // Level chest always gives 1 item + coins
    let rewardItem = null;
    let rewardCoins = 200;
    let message = '';

    // Try to find a random unowned Common/Rare item
    const itemRes = await query(`
      SELECT * FROM items
      WHERE rarity IN ('common', 'rare')
      AND type != 'bundle'
      AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = items.id)
      ORDER BY RANDOM() LIMIT 1
    `, [userId]);

    if (itemRes.rows.length > 0) {
      rewardItem = itemRes.rows[0];
      message = `¡Recompensa de Nivel recibida! Has obtenido: ${rewardItem.name}`;
      await query(
        `INSERT INTO user_items (user_id, item_id, is_new) 
         VALUES ($1, $2, TRUE) 
         ON CONFLICT (user_id, item_id) DO NOTHING`, 
        [userId, rewardItem.id]
      );
    } else {
      rewardCoins += 800;
      message = '¡Ya tienes todas las recompensas de nivel! Has recibido Reppy Coins adicionales.';
    }

    await query('UPDATE users SET level_chests = level_chests - 1, reppy_coins = reppy_coins + $1 WHERE id = $2', [rewardCoins, userId]);
    
    const dummiesRes = await query(`
      SELECT name, type, rarity FROM items 
      WHERE rarity = 'common'
      ORDER BY RANDOM() LIMIT 40
    `);

    await query('COMMIT');

    res.json({ 
      success: true,
      reward: {
        item: rewardItem,
        coins: rewardCoins,
        message
      },
      reel_items: dummiesRes.rows
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error opening level-up chest:', error);
    res.status(500).json({ message: 'Error al abrir el cofre de nivel' });
  }
});

// Get history of contributors for a specific boss
router.get('/history/:bossId', authenticate, async (req, res) => {
  const bossId = parseInt(req.params.bossId);
  try {
    const historyRes = await query(
      `SELECT u.id, u.name, u.avatar_url, p.damage_dealt, u.equipped_title_id, u.equipped_border_id, u.equipped_avatar_id
       FROM event_participants p
       JOIN users u ON p.user_id = u.id
       WHERE p.boss_fight_id = $1
       ORDER BY p.damage_dealt DESC`,
      [bossId]
    );

    // Get the boss name/info for the header
    const bossInfoRes = await query(
      `SELECT name, image_url, total_hp, current_hp FROM boss_fights WHERE id = $1`,
      [bossId]
    );

    res.json({
      boss: bossInfoRes.rows[0] || null,
      contributors: historyRes.rows
    });
  } catch (error) {
    console.error('Error fetching boss history:', error);
    res.status(500).json({ message: 'Error fetching boss history' });
  }
});

export default router;

import express from 'express';
import { query, withTransaction } from './db.js';
import { authenticate, optionalAuthenticate } from './middleware.js';
import { autoGrantPendingChests, grantAllPendingChestsBeforeReset } from './utils/bossRewards.js';

// Arbitrary constant key for the advisory lock that serializes the boss-loop reset.
const BOSS_RESET_LOCK = 919191;

import { getRandomPhrase } from './utils/bossPhrases.js';
import { getLocalDateString } from './utils/date.js';
import { getPerkBonuses } from './utils/perks.js';

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
      // CRITICAL: grant chests to every participant BEFORE wiping event_participants.
      // If we reset first, autoGrantPendingChests finds no 'defeated' bosses → 0 chests.
      // (autoGrantPendingChests is now idempotent, so a concurrent /active call
      // running this too cannot double-grant.)
      await grantAllPendingChestsBeforeReset();

      await withTransaction(async (client) => {
        // Serialize the reset across all concurrent /active callers so the loop
        // is reset exactly once. The advisory lock is released at COMMIT.
        await client.query('SELECT pg_advisory_xact_lock($1)', [BOSS_RESET_LOCK]);

        // Re-check under the lock: another request may have already reset.
        const stillNone = await client.query(`SELECT 1 FROM boss_fights WHERE status != 'defeated' LIMIT 1`);
        if (stillNone.rowCount === 0) {
          await client.query(`UPDATE boss_fights SET status = 'active', current_hp = total_hp`);
          await client.query(`UPDATE event_participants SET damage_dealt = 0, chests_claimed = 0`);
        }
      });

      // Re-fetch the first boss
      bossRes = await query(
        `SELECT * FROM boss_fights
         WHERE status != 'defeated'
         ORDER BY order_index ASC LIMIT 1`
      );
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
    let personal_rank = null;
    let total_participants = 0;

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

      // RANK: position among damage-dealers for this boss (1 = top). Only
      // meaningful once the user has dealt damage; otherwise stays null ("—").
      const totalRes = await query(
        `SELECT COUNT(*)::int AS total FROM event_participants
         WHERE boss_fight_id = $1 AND damage_dealt > 0`,
        [boss.id]
      );
      total_participants = totalRes.rows[0]?.total || 0;
      if (personal_damage > 0) {
        const rankRes = await query(
          `SELECT COUNT(*)::int + 1 AS rank FROM event_participants
           WHERE boss_fight_id = $1 AND damage_dealt > $2`,
          [boss.id, personal_damage]
        );
        personal_rank = rankRes.rows[0]?.rank || null;
      }
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
      personal_rank,
      total_participants,
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

    const result = await withTransaction(async (client) => {
      // ATOMIC CLAIM GATE: flip chests_claimed 0->1 only if the user participated
      // (damage_dealt > 0) and hasn't claimed yet. Concurrent claims for the same
      // boss serialize on this row; the loser matches 0 rows and gets no chest.
      const claimRes = await client.query(
        `UPDATE event_participants
         SET chests_claimed = 1
         WHERE boss_fight_id = $1 AND user_id = $2
           AND damage_dealt > 0
           AND chests_claimed < 1
         RETURNING 1`,
        [bossId, userId]
      );

      if (claimRes.rowCount === 0) {
        // Disambiguate: never participated vs. already claimed.
        const partRes = await client.query(
          'SELECT chests_claimed, damage_dealt FROM event_participants WHERE boss_fight_id = $1 AND user_id = $2',
          [bossId, userId]
        );
        if (partRes.rowCount === 0 || partRes.rows[0].damage_dealt <= 0) {
          return { status: 403, body: { message: 'Debes participar al menos con 1 repetición para reclamar el cofre' } };
        }
        return { status: 400, body: { message: 'Ya has reclamado el cofre de este boss' } };
      }

      // We own the claim — grant exactly one chest of the right type.
      if (boss.is_legendary) {
        await client.query('UPDATE users SET legendary_chests = legendary_chests + 1 WHERE id = $1', [userId]);
      } else if (boss.is_epic) {
        await client.query('UPDATE users SET epic_chests = epic_chests + 1 WHERE id = $1', [userId]);
      } else {
        await client.query('UPDATE users SET boss_chests = boss_chests + 1 WHERE id = $1', [userId]);
      }

      const chestType = boss.is_legendary ? 'legendary' : (boss.is_epic ? 'epic' : 'normal');
      return {
        status: 200,
        body: {
          message: boss.is_legendary ? '¡Cofre LEGENDARIO reclamado!' : (boss.is_epic ? '¡Cofre ÉPICO reclamado!' : '¡Cofre reclamado!'),
          new_chests_claimed: 1,
          chest_type: chestType
        }
      };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Error claiming chest:', error);
    res.status(500).json({ message: 'Error al reclamar el cofre' });
  }
});

// Open Chest - Clash Royale Style (1-3 items + Gold)
router.post('/open-chest', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Determine number of item rewards (1 to 2) - slight nerf for normal chest
    const numItems = Math.floor(Math.random() * 2) + 1;

    const result = await withTransaction(async (client) => {
      // ATOMIC GATE: spend one chest first. The guarded decrement can't drive the
      // count negative, and a loser of the race matches 0 rows — so loot is only
      // ever generated once per chest, even under concurrent open requests.
      const spendRes = await client.query(
        'UPDATE users SET boss_chests = boss_chests - 1 WHERE id = $1 AND boss_chests > 0 RETURNING boss_chests, skill_perks',
        [userId]
      );
      if (spendRes.rowCount === 0) {
        return { status: 400, body: { message: 'No tienes cofres para abrir' } };
      }

      // Skill perks: chest_bounty (+% coins), chest_luck (better rarity odds),
      // treasure (chance of an extra item).
      const { chestCoinPct, chestLuck, chestItemChance } = getPerkBonuses(spendRes.rows[0].skill_perks);
      const luckMult = 1 + chestLuck;
      const itemCount = numItems + (Math.random() < chestItemChance ? 1 : 0);

      const rewards = [];
      let totalCoins = 0;

      // 2. Base Gold (always given)
      const baseGold = 200;
      totalCoins += baseGold;
      rewards.push({ type: 'coins', amount: baseGold, message: 'Oro garantizado' });

      for (let i = 0; i < itemCount; i++) {
        // Random rarity weighted logic — chest_luck widens the higher-rarity bands.
        const rand = Math.random();
        let targetRarity = 'common';
        if (rand < 0.005 * luckMult) targetRarity = 'calistenico';
        else if (rand < 0.03 * luckMult) targetRarity = 'legendary';
        else if (rand < 0.12 * luckMult) targetRarity = 'especial';
        else if (rand < 0.35 * luckMult) targetRarity = 'rare';

        // Try to find an unowned item of that rarity
        let itemRes = await client.query(`
            SELECT * FROM items
            WHERE rarity = $1
            AND type != 'bundle'
            AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $2 AND item_id = items.id)
            ORDER BY RANDOM() LIMIT 1
        `, [targetRarity, userId]);

        if (itemRes.rows.length > 0) {
            const rewardItem = itemRes.rows[0];
            rewards.push({ type: 'item', data: rewardItem });
            await client.query(`
                INSERT INTO user_items (user_id, item_id, is_new)
                VALUES ($1, $2, TRUE)
                ON CONFLICT (user_id, item_id) DO NOTHING
            `, [userId, rewardItem.id]);
        } else {
            // User owns all items of this rarity. Try to find ANY unowned item.
            let fallbackRes = await client.query(`
                SELECT * FROM items
                WHERE type != 'bundle'
                AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = items.id)
                ORDER BY RANDOM() LIMIT 1
            `, [userId]);

            if (fallbackRes.rows.length > 0) {
                const rewardItem = fallbackRes.rows[0];
                rewards.push({ type: 'item', data: rewardItem, message: `Reemplazo de ${targetRarity}` });
                await client.query(`
                    INSERT INTO user_items (user_id, item_id, is_new)
                    VALUES ($1, $2, TRUE)
                    ON CONFLICT (user_id, item_id) DO NOTHING
                `, [userId, rewardItem.id]);
            } else {
                // User owns EVERYTHING? Give gold compensation proportional to price of a random item of targetRarity
                const priceRes = await client.query(`
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

      // chest_bounty perk: boost the total gold from this chest.
      totalCoins = Math.round(totalCoins * (1 + chestCoinPct));
      // Add the coins won (the chest was already spent by the gate above).
      await client.query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [totalCoins, userId]);

      // Reel items for legacy animation support
      const dummiesRes = await client.query(`SELECT name, type, rarity FROM items WHERE type != 'bundle' ORDER BY RANDOM() LIMIT 40`);

      return { status: 200, rewards, totalCoins, reelItems: dummiesRes.rows };
    });

    if (result.status !== 200) return res.status(result.status).json(result.body);

    // For backward compatibility, pick the first item as 'main'
    const firstItem = result.rewards.find(r => r.type === 'item');

    res.json({
      success: true,
      reward: {
        item: firstItem ? firstItem.data : null,
        coins: result.totalCoins,
        message: `Has recuperado ${numItems} artefactos del boss.`,
        rewards: result.rewards // New field for updated UI
      },
      rewards: result.rewards,
      totalCoins: result.totalCoins,
      reel_items: result.reelItems
    });
  } catch (error) {
    console.error('Error opening chest:', error);
    res.status(500).json({ message: 'Error al abrir el cofre' });
  }
});

// Open Legendary Chest - Guaranteed Legendary + Usual Drops
router.post('/open-legendary-chest', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await withTransaction(async (client) => {
      // ATOMIC GATE: spend one legendary chest before generating any loot.
      const spendRes = await client.query(
        'UPDATE users SET legendary_chests = legendary_chests - 1 WHERE id = $1 AND legendary_chests > 0 RETURNING legendary_chests',
        [userId]
      );
      if (spendRes.rowCount === 0) {
        return { status: 400, body: { message: 'No tienes cofres legendarios para abrir' } };
      }

      const rewards = [];
      let totalCoins = 0;

      // 1. Base Gold
      const baseGold = 1000; // Legendary chest gives more base gold
      totalCoins += baseGold;
      rewards.push({ type: 'coins', amount: baseGold, message: 'Oro Legendario' });

      // 2. GUARANTEED LEGENDARY ITEM
      let legItemRes = await client.query(`
        SELECT * FROM items
        WHERE rarity = 'legendary' AND type != 'bundle'
        AND is_seasonal = TRUE
        AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = items.id)
        ORDER BY RANDOM() LIMIT 1
      `, [userId]);

      if (legItemRes.rows.length > 0) {
          const rewardItem = legItemRes.rows[0];
          rewards.push({ type: 'item', data: rewardItem, message: 'LEGENDARIO GARANTIZADO' });
          await client.query(`INSERT INTO user_items (user_id, item_id, is_new) VALUES ($1, $2, TRUE) ON CONFLICT (user_id, item_id) DO NOTHING`, [userId, rewardItem.id]);
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

          let itemRes = await client.query(`
              SELECT * FROM items
              WHERE rarity = $1 AND type != 'bundle'
              AND is_seasonal = TRUE
              AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $2 AND item_id = items.id)
              ORDER BY RANDOM() LIMIT 1
          `, [targetRarity, userId]);

          if (itemRes.rows.length > 0) {
              const rewardItem = itemRes.rows[0];
              rewards.push({ type: 'item', data: rewardItem });
              await client.query(`INSERT INTO user_items (user_id, item_id, is_new) VALUES ($1, $2, TRUE) ON CONFLICT (user_id, item_id) DO NOTHING`, [userId, rewardItem.id]);
          } else {
               // Fallback gold
               totalCoins += 500;
               rewards.push({ type: 'coins', amount: 500, message: 'Botín extra en oro' });
          }
      }

      await client.query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [totalCoins, userId]);

      const dummiesRes = await client.query(`SELECT name, type, rarity FROM items WHERE type != 'bundle' ORDER BY RANDOM() LIMIT 40`);

      return { status: 200, rewards, totalCoins, reelItems: dummiesRes.rows };
    });

    if (result.status !== 200) return res.status(result.status).json(result.body);

    const firstItem = result.rewards.find(r => r.type === 'item');

    res.json({
      success: true,
      reward: {
        item: firstItem ? firstItem.data : null,
        coins: result.totalCoins,
        message: `¡Cofre Legendario abierto!`,
        rewards: result.rewards
      },
      rewards: result.rewards,
      totalCoins: result.totalCoins,
      reel_items: result.reelItems
    });
  } catch (error) {
    console.error('Error opening legendary chest:', error);
    res.status(500).json({ message: 'Error al abrir el cofre legendario' });
  }
});
// Open Epic Chest - Guaranteed Special + Usual Drops
router.post('/open-epic-chest', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await withTransaction(async (client) => {
      // ATOMIC GATE: spend one epic chest before generating any loot.
      const spendRes = await client.query(
        'UPDATE users SET epic_chests = epic_chests - 1 WHERE id = $1 AND epic_chests > 0 RETURNING epic_chests',
        [userId]
      );
      if (spendRes.rowCount === 0) {
        return { status: 400, body: { message: 'No tienes cofres épicos para abrir' } };
      }

      const rewards = [];
      let totalCoins = 0;

      // 1. Base Gold
      const baseGold = 800;
      totalCoins += baseGold;
      rewards.push({ type: 'coins', amount: baseGold, message: 'Oro Épico' });

      // 2. GUARANTEED SPECIAL ITEM
      let epicItemRes = await client.query(`
        SELECT * FROM items
        WHERE rarity = 'especial' AND type != 'bundle'
        AND is_seasonal = TRUE
        AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = items.id)
        ORDER BY RANDOM() LIMIT 1
      `, [userId]);

      if (epicItemRes.rows.length > 0) {
          const rewardItem = epicItemRes.rows[0];
          rewards.push({ type: 'item', data: rewardItem, message: 'EPICO GARANTIZADO' });
          await client.query(`INSERT INTO user_items (user_id, item_id, is_new) VALUES ($1, $2, TRUE) ON CONFLICT (user_id, item_id) DO NOTHING`, [userId, rewardItem.id]);
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

          let itemRes = await client.query(`
              SELECT * FROM items
              WHERE rarity = $1 AND type != 'bundle'
              AND is_seasonal = TRUE
              AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $2 AND item_id = items.id)
              ORDER BY RANDOM() LIMIT 1
          `, [targetRarity, userId]);

          if (itemRes.rows.length > 0) {
              const rewardItem = itemRes.rows[0];
              rewards.push({ type: 'item', data: rewardItem });
              await client.query(`INSERT INTO user_items (user_id, item_id, is_new) VALUES ($1, $2, TRUE) ON CONFLICT (user_id, item_id) DO NOTHING`, [userId, rewardItem.id]);
          } else {
               totalCoins += 400;
               rewards.push({ type: 'coins', amount: 400, message: 'Botín extra en oro' });
          }
      }

      await client.query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [totalCoins, userId]);

      const dummiesRes = await client.query(`SELECT name, type, rarity FROM items WHERE type != 'bundle' ORDER BY RANDOM() LIMIT 40`);

      return { status: 200, rewards, totalCoins, reelItems: dummiesRes.rows };
    });

    if (result.status !== 200) return res.status(result.status).json(result.body);

    const firstItem = result.rewards.find(r => r.type === 'item');

    res.json({
      success: true,
      reward: {
        item: firstItem ? firstItem.data : null,
        coins: result.totalCoins,
        message: `¡Cofre Épico abierto!`,
        rewards: result.rewards
      },
      rewards: result.rewards,
      totalCoins: result.totalCoins,
      reel_items: result.reelItems
    });
  } catch (error) {
    console.error('Error opening epic chest:', error);
    res.status(500).json({ message: 'Error al abrir el cofre épico' });
  }
});

router.post('/open-level-chest', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await withTransaction(async (client) => {
      // ATOMIC GATE: spend one level chest before generating any loot.
      const spendRes = await client.query(
        'UPDATE users SET level_chests = level_chests - 1 WHERE id = $1 AND level_chests > 0 RETURNING level_chests',
        [userId]
      );
      if (spendRes.rowCount === 0) {
        return { status: 400, body: { message: 'No tienes cofres de nivel para abrir' } };
      }

      // Level chest always gives 1 item + coins
      let rewardItem = null;
      let rewardCoins = 200;
      let message = '';

      // Try to find a random unowned Common/Rare item
      const itemRes = await client.query(`
        SELECT * FROM items
        WHERE rarity IN ('common', 'rare')
        AND type != 'bundle'
        AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = items.id)
        ORDER BY RANDOM() LIMIT 1
      `, [userId]);

      if (itemRes.rows.length > 0) {
        rewardItem = itemRes.rows[0];
        message = `¡Recompensa de Nivel recibida! Has obtenido: ${rewardItem.name}`;
        await client.query(
          `INSERT INTO user_items (user_id, item_id, is_new)
           VALUES ($1, $2, TRUE)
           ON CONFLICT (user_id, item_id) DO NOTHING`,
          [userId, rewardItem.id]
        );
      } else {
        rewardCoins += 800;
        message = '¡Ya tienes todas las recompensas de nivel! Has recibido Reppy Coins adicionales.';
      }

      await client.query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [rewardCoins, userId]);

      const dummiesRes = await client.query(`
        SELECT name, type, rarity FROM items
        WHERE rarity = 'common'
        ORDER BY RANDOM() LIMIT 40
      `);

      return { status: 200, rewardItem, rewardCoins, message, reelItems: dummiesRes.rows };
    });

    if (result.status !== 200) return res.status(result.status).json(result.body);

    res.json({
      success: true,
      reward: {
        item: result.rewardItem,
        coins: result.rewardCoins,
        message: result.message
      },
      reel_items: result.reelItems
    });
  } catch (error) {
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
      `SELECT b.*, u.name as last_hit_user_name 
       FROM boss_fights b
       LEFT JOIN users u ON b.last_hit_user_id = u.id
       WHERE b.id = $1`,
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

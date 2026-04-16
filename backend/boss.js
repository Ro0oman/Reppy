import express from 'express';
import { query } from './db.js';
import { authenticate, optionalAuthenticate } from './middleware.js';
import { autoGrantPendingChests } from './utils/bossRewards.js';
import { trackCoinTransaction } from './utils/transactions.js';

import { getRandomPhrase } from './utils/bossPhrases.js';

const router = express.Router();

// Get active or upcoming boss
router.get('/active', optionalAuthenticate, async (req, res) => {
  console.log('[BOSS_API] Hit, user:', req.user ? req.user.id : 'GUEST');
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
      const finalUserRes = await query('SELECT boss_chests FROM users WHERE id = $1', [req.user.id]);
      boss_chests = finalUserRes.rows[0]?.boss_chests || 0;
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
    await query('UPDATE users SET boss_chests = boss_chests + 1 WHERE id = $2', [userId]);
    await query('UPDATE event_participants SET chests_claimed = 1 WHERE boss_fight_id = $1 AND user_id = $2', [bossId, userId]);
    await query('COMMIT');

    res.json({ 
      message: '¡Cofre reclamado con éxito! Ve a tu inventario para abrirlo.',
      new_chests_claimed: 1 
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error claiming chest:', error);
    res.status(500).json({ message: 'Error al reclamar el cofre' });
  }
});

// Open Chest - CS:GO Style Reward Logic
router.post('/open-chest', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const userRes = await query('SELECT boss_chests FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0 || userRes.rows[0].boss_chests <= 0) {
      return res.status(400).json({ message: 'No tienes cofres para abrir' });
    }

    await query('BEGIN');

    let rewardItem = null;
    let rewardCoins = 250; // Base coins if no item
    let message = '';

    // 1. Try to find a random unowned Seasonal item
    const seasonalRes = await query(`
      SELECT c.* FROM cosmetics c
      WHERE c.is_seasonal = TRUE
      AND NOT EXISTS (SELECT 1 FROM user_inventory ui WHERE ui.cosmetic_id = c.id AND ui.user_id = $1)
      ORDER BY RANDOM() LIMIT 1
    `, [userId]);

    if (seasonalRes.rows.length > 0) {
      rewardItem = seasonalRes.rows[0];
      message = `¡Increíble! Has obtenido un objeto de TEMPORADA: ${rewardItem.name}`;
      rewardCoins = 100; // Bonus coins
    } else {
      // 2. Try to find a random unowned Normal item
      const normalRes = await query(`
        SELECT c.* FROM cosmetics c
        WHERE c.is_seasonal = FALSE
        AND NOT EXISTS (SELECT 1 FROM user_inventory ui WHERE ui.cosmetic_id = c.id AND ui.user_id = $1)
        ORDER BY RANDOM() LIMIT 1
      `, [userId]);

      if (normalRes.rows.length > 0) {
        rewardItem = normalRes.rows[0];
        message = `¡Genial! Has obtenido: ${rewardItem.name}`;
        rewardCoins = 50; // Bonus coins
      } else {
        // 3. Give coins only
        rewardCoins = 1000;
        message = '¡Ya tienes todos los cosméticos disponibles! Has recibido Reppy Coins adicionales.';
      }
    }

    // Process Reward
    if (rewardItem) {
      await query(
        `INSERT INTO user_inventory (user_id, cosmetic_id, is_new) 
         VALUES ($1, $2, TRUE) 
         ON CONFLICT (user_id, cosmetic_id) DO NOTHING`, 
        [userId, rewardItem.id]
      );
    }

    await query('UPDATE users SET boss_chests = boss_chests - 1, reppy_coins = reppy_coins + $1 WHERE id = $2', [rewardCoins, userId]);
    
    // Log the transaction
    await trackCoinTransaction(userId, rewardCoins, 'CHEST_BOSS', rewardItem ? `Botín de Cofre: ${rewardItem.name}` : 'Recompensa de Cofre de Boss');

    // Get dummy items for the reel animation
    const dummiesRes = await query(`
      SELECT name, type, css_value, is_seasonal FROM cosmetics 
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
      reel_items: dummiesRes.rows // Used for CS:GO animation
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error opening chest:', error);
    res.status(500).json({ message: 'Error al abrir el cofre' });
  }
});

// Open Level-up Chest - Restricted to Common Items
router.post('/open-level-chest', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const userRes = await query('SELECT level_chests FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0 || userRes.rows[0].level_chests <= 0) {
      return res.status(400).json({ message: 'No tienes cofres de nivel para abrir' });
    }

    await query('BEGIN');

    let rewardItem = null;
    let rewardCoins = 0;
    let message = '';

    // 1. Try to find a random unowned Common (non-seasonal) item
    const commonRes = await query(`
      SELECT c.* FROM cosmetics c
      WHERE c.is_seasonal = FALSE
      AND NOT EXISTS (SELECT 1 FROM user_inventory ui WHERE ui.cosmetic_id = c.id AND ui.user_id = $1)
      ORDER BY RANDOM() LIMIT 1
    `, [userId]);

    if (commonRes.rows.length > 0) {
      rewardItem = commonRes.rows[0];
      message = `¡Protocolo de Nivel completado! Has obtenido: ${rewardItem.name}`;
      rewardCoins = 100; // Bonus coins
    } else {
      // 2. Give coins only (higher amount as consolation)
      rewardCoins = 1000;
      message = '¡Ya tienes todas las recompensas comunes disponibles! Has recibido Reppy Coins de alto nivel.';
    }

    // Process Reward
    if (rewardItem) {
      await query(
        `INSERT INTO user_inventory (user_id, cosmetic_id, is_new) 
         VALUES ($1, $2, TRUE) 
         ON CONFLICT (user_id, cosmetic_id) DO NOTHING`, 
        [userId, rewardItem.id]
      );
    }

    await query('UPDATE users SET level_chests = level_chests - 1, reppy_coins = reppy_coins + $1 WHERE id = $2', [rewardCoins, userId]);
    
    // Log the transaction
    await trackCoinTransaction(userId, rewardCoins, 'CHEST_LVL', rewardItem ? `Recompensa de Nivel: ${rewardItem.name}` : 'Bono por subida de Nivel');

    // Get dummy items for the reel animation (filtered to common items for thematic consistency)
    const dummiesRes = await query(`
      SELECT name, type, css_value, is_seasonal FROM cosmetics 
      WHERE is_seasonal = FALSE
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

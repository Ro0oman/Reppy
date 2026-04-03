import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Get active or upcoming boss
router.get('/active', authenticate, async (req, res) => {
  try {
    // Priority: 1. Active boss, 2. Upcoming boss starting soonest
    const bossRes = await query(
      `SELECT *, 
       CASE 
         WHEN status = 'active' AND start_date <= CURRENT_TIMESTAMP AND end_date >= CURRENT_TIMESTAMP THEN 1
         WHEN status = 'active' AND start_date > CURRENT_TIMESTAMP THEN 2
         ELSE 3
       END as priority
       FROM boss_fights 
       WHERE (status = 'active' OR status = 'defeated')
       ORDER BY priority ASC, start_date ASC LIMIT 1`
    );

    if (bossRes.rows.length === 0) {
      return res.json(null);
    }
    
    const boss = bossRes.rows[0];

    // Calculate starts_in if upcoming
    let starts_in = null;
    const now = new Date();
    const start = new Date(boss.start_date);
    if (start > now) {
      starts_in = Math.max(0, Math.floor((start - now) / 1000));
    }

    // Get user's personal participation and chest status
    const participantRes = await query(
      'SELECT damage_dealt, chests_claimed FROM event_participants WHERE boss_fight_id = $1 AND user_id = $2',
      [boss.id, req.user.id]
    );

    const participant = participantRes.rows[0] || { damage_dealt: 0, chests_claimed: 0 };

    res.json({
      boss: { ...boss, starts_in },
      personal_damage: participant.damage_dealt,
      chests_claimed: participant.chests_claimed
    });
  } catch (error) {
    console.error('Error fetching boss:', error);
    res.status(500).json({ message: 'Error fetching boss data' });
  }
});


// ... inside claim-chest
router.post('/claim-chest/:bossId', authenticate, async (req, res) => {
  const bossId = parseInt(req.params.bossId);
  const userId = req.user.id;

  try {
    const bossRes = await query('SELECT * FROM boss_fights WHERE id = $1', [bossId]);
    if (bossRes.rows.length === 0) return res.status(404).json({ message: 'Boss not found' });
    const boss = bossRes.rows[0];

    const damagePercent = ((boss.total_hp - boss.current_hp) / boss.total_hp) * 100;
    const isDefeated = boss.current_hp <= 0 || boss.status === 'defeated';
    
    let unlockedChests = 0;
    if (damagePercent >= 33.3) unlockedChests = 1;
    if (damagePercent >= 66.6) unlockedChests = 2;
    if (isDefeated) unlockedChests = 3;

    const partRes = await query('SELECT chests_claimed, damage_dealt FROM event_participants WHERE boss_fight_id = $1 AND user_id = $2', [bossId, userId]);
    if (partRes.rows.length === 0) return res.status(403).json({ message: 'No participation recorded' });
    
    const participant = partRes.rows[0];
    const claimed = participant.chests_claimed;
    
    // Chest 3 is available to all participants if boss is defeated
    if (claimed >= unlockedChests) {
      return res.status(400).json({ message: 'No chests available to claim right now' });
    }

    // Determine reward based on chests_claimed
    const rewardsMap = {
      0: 'Aura de Pascua',
      1: 'Rabbit Slayer',
      2: 'Easter Celebration'
    };
    const itemName = rewardsMap[claimed];
    
    await query('BEGIN');
    
    // 1. Get cosmetic ID
    const cosRes = await query('SELECT id, type FROM cosmetics WHERE name = $1', [itemName]);
    if (cosRes.rows.length > 0) {
      const cosmetic = cosRes.rows[0];
      // 2. Award item (ignore if already owned, though unlikely here)
      await query(
        `INSERT INTO user_inventory (user_id, cosmetic_id, is_new) 
         VALUES ($1, $2, TRUE) 
         ON CONFLICT (user_id, cosmetic_id) DO UPDATE SET is_new = TRUE`, 
        [userId, cosmetic.id]
      );
    }

    const bonusCoins = 50 + Math.floor(Math.random() * 100);
    await query('UPDATE event_participants SET chests_claimed = chests_claimed + 1 WHERE boss_fight_id = $1 AND user_id = $2', [bossId, userId]);
    await query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [bonusCoins, userId]);
    await query('COMMIT');

    res.json({ 
      message: '¡Cofre abierto!', 
      rewardCoins: bonusCoins, 
      rewardItem: itemName,
      rewardType: cosRes.rows[0]?.type,
      new_chests_claimed: claimed + 1 
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error claiming chest:', error);
    res.status(500).json({ message: 'Error claiming chest' });
  }
});

export default router;

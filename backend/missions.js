import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Get all active missions and user progress (Infinite Pool Logic)
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    // 1. Get currently active missions for this user
    let activeMissions = await query(`
      SELECT m.*, 
             um.current_value,
             um.is_completed,
             um.is_claimed
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = $1 AND um.is_active = true
      ORDER BY m.is_daily DESC, m.id ASC
    `, [userId]);

    let dailyActive = activeMissions.rows.filter(m => m.is_daily);
    let specialActive = activeMissions.rows.filter(m => !m.is_daily);

    // 2. Refill Daily if needed (Limit 2)
    if (dailyActive.length < 2) {
      const needed = 2 - dailyActive.length;
      // Pick random daily missions that are NOT currently active
      const newDailies = await query(`
        SELECT id FROM missions 
        WHERE is_daily = true 
        AND id NOT IN (
          SELECT mission_id FROM user_missions 
          WHERE user_id = $1 AND is_active = true
        )
        ORDER BY RANDOM()
        LIMIT $2
      `, [userId, needed]);

      for (const m of newDailies.rows) {
        await query(`
          INSERT INTO user_missions (user_id, mission_id, is_active, is_completed, is_claimed, current_value)
          VALUES ($1, $2, true, false, false, 0)
          ON CONFLICT (user_id, mission_id) DO UPDATE SET
            is_active = true,
            is_completed = false,
            is_claimed = false,
            current_value = 0,
            last_updated = CURRENT_TIMESTAMP
        `, [userId, m.id]);
      }
    }

    // 3. Refill Special if needed (Limit 1)
    if (specialActive.length < 1) {
      // Pick random special missions that are NOT currently active
      const newSpecial = await query(`
        SELECT id FROM missions 
        WHERE is_daily = false
        AND id NOT IN (
          SELECT mission_id FROM user_missions 
          WHERE user_id = $1 AND is_active = true
        )
        ORDER BY RANDOM()
        LIMIT 1
      `, [userId]);

      if (newSpecial.rows.length > 0) {
        const m = newSpecial.rows[0];
        await query(`
          INSERT INTO user_missions (user_id, mission_id, is_active, is_completed, is_claimed, current_value)
          VALUES ($1, $2, true, false, false, 0)
          ON CONFLICT (user_id, mission_id) DO UPDATE SET
            is_active = true,
            is_completed = false,
            is_claimed = false,
            current_value = 0,
            last_updated = CURRENT_TIMESTAMP
        `, [userId, m.id]);
      }
    }

    // 4. Fetch final set of active missions
    const finalMissions = await query(`
      SELECT m.*, 
             COALESCE(um.current_value, 0) as current_value,
             COALESCE(um.is_completed, false) as is_completed,
             COALESCE(um.is_claimed, false) as is_claimed
      FROM user_missions um
      JOIN missions m ON um.mission_id = m.id
      WHERE um.user_id = $1 AND um.is_active = true
      ORDER BY m.is_daily DESC, m.id ASC
    `, [userId]);
    
    res.json(finalMissions.rows);
  } catch (error) {
    console.error('Error fetching/refilling missions:', error);
    res.status(500).json({ message: 'Error fetching missions' });
  }
});

// Claim a completed mission
router.post('/claim/:missionId', authenticate, async (req, res) => {
  const userId = req.user.id;
  const missionId = req.params.missionId;

  try {
    const missionRes = await query(`
      SELECT m.*, um.is_completed, um.is_claimed
      FROM missions m
      JOIN user_missions um ON m.id = um.mission_id
      WHERE um.user_id = $1 AND um.mission_id = $2
    `, [userId, missionId]);

    if (missionRes.rows.length === 0) {
      return res.status(404).json({ message: 'Mission not found or not started' });
    }

    const mission = missionRes.rows[0];

    if (!mission.is_completed) {
      return res.status(400).json({ message: 'Mission not completed yet' });
    }

    if (mission.is_claimed) {
      return res.status(400).json({ message: 'Reward already claimed' });
    }

    // Start transaction
    await query('BEGIN');

    // Mark as claimed and DEACTIVATE (to allow refill)
    await query(`
      UPDATE user_missions SET is_claimed = true, is_active = false, last_updated = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND mission_id = $2
    `, [userId, missionId]);

    // Give rewards
    await query(`
      UPDATE users 
      SET reppy_coins = reppy_coins + $1,
          reppy_gems = reppy_gems + $2
      WHERE id = $3
    `, [mission.reward_coins, mission.reward_gems, userId]);

    // Record gem transaction if any
    if (mission.reward_gems > 0) {
      await query(`
        INSERT INTO gem_transactions (user_id, amount, source, description)
        VALUES ($1, $2, 'mission', $3)
      `, [userId, mission.reward_gems, `Mission completed: ${mission.title_key}`]);
    }

    // TODO: Add Battle Pass XP reward here when implemented

    await query('COMMIT');

    res.json({ 
      message: 'Reward claimed successfully', 
      reward_coins: mission.reward_coins, 
      reward_gems: mission.reward_gems 
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error claiming mission:', error);
    res.status(500).json({ message: 'Error claiming reward' });
  }
});

export default router;

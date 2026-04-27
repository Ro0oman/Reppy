import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Get all missions and user progress
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const missionsResult = await query(`
      SELECT m.*, 
             COALESCE(um.current_value, 0) as current_value,
             COALESCE(um.is_completed, false) as is_completed,
             COALESCE(um.is_claimed, false) as is_claimed
      FROM missions m
      LEFT JOIN user_missions um ON m.id = um.mission_id AND um.user_id = $1
      ORDER BY m.is_daily DESC, m.id ASC
    `, [userId]);
    
    res.json(missionsResult.rows);
  } catch (error) {
    console.error('Error fetching missions:', error);
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

    // Mark as claimed
    await query(`
      UPDATE user_missions SET is_claimed = true, last_updated = CURRENT_TIMESTAMP
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

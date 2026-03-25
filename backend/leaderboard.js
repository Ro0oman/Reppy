import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Get start date based on timeframe
const getStartDate = (timeframe) => {
  const now = new Date();
  switch (timeframe) {
    case 'today':
      return new Date(now.setHours(0, 0, 0, 0));
    case 'week':
      const day = now.getDay() || 7;
      if (day !== 1) now.setHours(-24 * (day - 1));
      return new Date(now.setHours(0, 0, 0, 0));
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null; // All time
  }
};

// Global leaderboard
router.get('/global', async (req, res) => {
  const { timeframe } = req.query;
  const startDate = getStartDate(timeframe);

  try {
    let queryStr;
    let params = [];

    if (startDate) {
      queryStr = `
        SELECT u.id, u.name, u.avatar_url, COALESCE(SUM(r.count), 0) as total_reps 
        FROM users u
        LEFT JOIN reps r ON u.id = r.user_id AND r.date >= $1
        WHERE u.is_private = false
        GROUP BY u.id
        ORDER BY total_reps DESC
        LIMIT 20
      `;
      params = [startDate];
    } else {
      queryStr = 'SELECT id, name, avatar_url, total_reps FROM users WHERE is_private = false ORDER BY total_reps DESC LIMIT 20';
    }

    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// Friends leaderboard
router.get('/friends', authenticate, async (req, res) => {
  const { timeframe } = req.query;
  const startDate = getStartDate(timeframe);

  try {
    let queryStr;
    let params = [req.user.id];

    if (startDate) {
      queryStr = `
        SELECT u.id, u.name, u.avatar_url, COALESCE(SUM(r.count), 0) as total_reps 
        FROM users u
        LEFT JOIN reps r ON u.id = r.user_id AND r.date >= $2
        WHERE u.id = $1 OR u.id IN (
          SELECT user_id_1 FROM friendships WHERE user_id_2 = $1
          UNION
          SELECT user_id_2 FROM friendships WHERE user_id_1 = $1
        )
        GROUP BY u.id
        ORDER BY total_reps DESC
      `;
      params.push(startDate);
    } else {
      queryStr = `
        SELECT id, name, avatar_url, total_reps 
        FROM users 
        WHERE id = $1 OR id IN (
          SELECT user_id_1 FROM friendships WHERE user_id_2 = $1
          UNION
          SELECT user_id_2 FROM friendships WHERE user_id_1 = $1
        )
        ORDER BY total_reps DESC
      `;
    }

    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching friends leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

export default router;

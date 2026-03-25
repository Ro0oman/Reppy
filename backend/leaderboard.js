import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Global leaderboard
router.get('/global', async (req, res) => {
  const { timeframe } = req.query;

  try {
    let queryStr;
    let dateFilter = '';

    switch (timeframe) {
      case 'today':
        dateFilter = 'AND r.date = CURRENT_DATE';
        break;
      case 'week':
        dateFilter = "AND r.date >= date_trunc('week', CURRENT_DATE)";
        break;
      case 'month':
        dateFilter = "AND r.date >= date_trunc('month', CURRENT_DATE)";
        break;
      case 'year':
        dateFilter = "AND r.date >= date_trunc('year', CURRENT_DATE)";
        break;
      default:
        dateFilter = '';
    }

    if (dateFilter) {
      queryStr = `
        SELECT u.id, u.name, u.avatar_url, COALESCE(SUM(r.count), 0) as total_reps 
        FROM users u
        LEFT JOIN reps r ON u.id = r.user_id ${dateFilter}
        WHERE u.is_private = false
        GROUP BY u.id
        HAVING COALESCE(SUM(r.count), 0) > 0
        ORDER BY total_reps DESC
        LIMIT 20
      `;
    } else {
      queryStr = 'SELECT id, name, avatar_url, total_reps FROM users WHERE is_private = false ORDER BY total_reps DESC LIMIT 20';
    }

    const result = await query(queryStr);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// Friends leaderboard
router.get('/friends', authenticate, async (req, res) => {
  const { timeframe } = req.query;

  try {
    let queryStr;
    let dateFilter = '';

    switch (timeframe) {
      case 'today':
        dateFilter = 'AND r.date = CURRENT_DATE';
        break;
      case 'week':
        dateFilter = "AND r.date >= date_trunc('week', CURRENT_DATE)";
        break;
      case 'month':
        dateFilter = "AND r.date >= date_trunc('month', CURRENT_DATE)";
        break;
      case 'year':
        dateFilter = "AND r.date >= date_trunc('year', CURRENT_DATE)";
        break;
      default:
        dateFilter = '';
    }

    if (dateFilter) {
      queryStr = `
        SELECT u.id, u.name, u.avatar_url, COALESCE(SUM(r.count), 0) as total_reps 
        FROM users u
        LEFT JOIN reps r ON u.id = r.user_id ${dateFilter}
        WHERE u.id = $1 OR u.id IN (
          SELECT user_id_1 FROM friendships WHERE user_id_2 = $1
          UNION
          SELECT user_id_2 FROM friendships WHERE user_id_1 = $1
        )
        GROUP BY u.id
        HAVING COALESCE(SUM(r.count), 0) > 0
        ORDER BY total_reps DESC
      `;
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

    const result = await query(queryStr, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching friends leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

export default router;

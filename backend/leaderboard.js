import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Global leaderboard
router.get('/global', async (req, res) => {
  const { timeframe, type = 'pullups' } = req.query;

  try {
    let dateFilter = '';
    switch (timeframe) {
      case 'today': dateFilter = 'AND r.date = CURRENT_DATE'; break;
      case 'week': dateFilter = "AND r.date >= date_trunc('week', CURRENT_DATE)"; break;
      case 'month': dateFilter = "AND r.date >= date_trunc('month', CURRENT_DATE)"; break;
      case 'year': dateFilter = "AND r.date >= date_trunc('year', CURRENT_DATE)"; break;
    }

    const typeFilter = type === 'all' ? '' : 'AND r.exercise_type = $1';
    const queryParams = type === 'all' ? [] : [type];

    const queryStr = `
      SELECT u.id, u.name, u.avatar_url, u.reppy_coins,
             COALESCE(SUM(r.count), 0) as total_reps,
             COALESCE(SUM(r.count * (COALESCE(u.body_weight, 75.0) + COALESCE(r.added_weight, 0))), 0) as total_volume,
             t.name as title_name, t.css_value as title_css,
             b.css_value as border_css,
             a.css_value as avatar_css,
             u.current_level
      FROM users u
      LEFT JOIN reps r ON u.id = r.user_id ${typeFilter} ${dateFilter}
      LEFT JOIN cosmetics t ON u.equipped_title_id = t.id
      LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
      LEFT JOIN cosmetics a ON u.equipped_avatar_id = a.id
      WHERE u.is_private = false
      GROUP BY u.id, u.name, u.avatar_url, u.reppy_coins, t.name, t.css_value, b.css_value, a.css_value, u.current_level
      HAVING COALESCE(SUM(r.count), 0) > 0
      ORDER BY total_reps DESC
      LIMIT 20
    `;

    const result = await query(queryStr, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// Friends leaderboard
router.get('/friends', authenticate, async (req, res) => {
  const { timeframe, type = 'pullups' } = req.query;

  try {
    let dateFilter = '';
    switch (timeframe) {
      case 'today': dateFilter = 'AND r.date = CURRENT_DATE'; break;
      case 'week': dateFilter = "AND r.date >= date_trunc('week', CURRENT_DATE)"; break;
      case 'month': dateFilter = "AND r.date >= date_trunc('month', CURRENT_DATE)"; break;
      case 'year': dateFilter = "AND r.date >= date_trunc('year', CURRENT_DATE)"; break;
    }

    const typeFilter = type === 'all' ? '' : 'AND r.exercise_type = $2';
    const queryParams = type === 'all' ? [req.user.id] : [req.user.id, type];

    const queryStr = `
      SELECT u.id, u.name, u.avatar_url, u.reppy_coins,
             COALESCE(SUM(r.count), 0) as total_reps,
             COALESCE(SUM(r.count * (COALESCE(u.body_weight, 75.0) + COALESCE(r.added_weight, 0))), 0) as total_volume,
             t.name as title_name, t.css_value as title_css,
             b.css_value as border_css,
             a.css_value as avatar_css,
             u.current_level
      FROM users u
      LEFT JOIN reps r ON u.id = r.user_id ${typeFilter} ${dateFilter}
      LEFT JOIN cosmetics t ON u.equipped_title_id = t.id
      LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
      LEFT JOIN cosmetics a ON u.equipped_avatar_id = a.id
      WHERE u.id = $1 OR u.id IN (
        SELECT user_id_1 FROM friendships WHERE user_id_2 = $1
        UNION
        SELECT user_id_2 FROM friendships WHERE user_id_1 = $1
      )
      GROUP BY u.id, u.name, u.avatar_url, u.reppy_coins, t.name, t.css_value, b.css_value, a.css_value, u.current_level
      HAVING COALESCE(SUM(r.count), 0) > 0
      ORDER BY total_reps DESC
      LIMIT 50
    `;

    const result = await query(queryStr, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching friends leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

export default router;

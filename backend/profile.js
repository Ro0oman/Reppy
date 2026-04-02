import express from 'express';
import { query } from './db.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  const { type = 'pullups' } = req.query;
  console.log(`[PROFILE_API] INCOMING - ID: ${userId}, TYPE: ${type}`);

  try {
    const userResult = await query(`
        SELECT u.id, u.name, u.email, u.avatar_url, u.reppy_coins, u.daily_goal,
               u.str_xp, u.pwr_xp, u.end_xp, u.agi_xp, u.body_weight, u.is_private,
               u.equipped_title_id, u.equipped_border_id,
               cTitle.name as title_name, cTitle.css_value as title_css,
               cBorder.name as border_name, cBorder.css_value as border_css
        FROM users u
        LEFT JOIN cosmetics cTitle ON u.equipped_title_id = cTitle.id AND cTitle.type = 'title'
        LEFT JOIN cosmetics cBorder ON u.equipped_border_id = cBorder.id AND cBorder.type = 'border'
        WHERE u.id = $1
      `, [userId]);

    if (!userResult || userResult.rowCount === 0) {
      console.log(`[PROFILE_API] User ${userId} not found`);
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userResult.rows[0];

    const heatmapResult = await query(
      `SELECT date, count FROM reps 
       WHERE user_id = $1 AND exercise_type = $2 AND date > CURRENT_DATE - INTERVAL '1 year'
       ORDER BY date ASC`,
      [userId, type]
    );

    const totalRes = await query(
      'SELECT SUM(count) as total FROM reps WHERE user_id = $1 AND exercise_type = $2',
      [userId, type]
    );
    const totalRepsValue = totalRes.rows[0]?.total;
    const totalReps = totalRepsValue ? parseInt(totalRepsValue) : 0;

    const recentLogs = await query(
      'SELECT id, date, count FROM reps WHERE user_id = $1 AND exercise_type = $2 ORDER BY date DESC LIMIT 20',
      [userId, type]
    );

    console.log(`[PROFILE_API] SUCCESS - Sending data for ${user.name}`);
    res.json({
      user,
      heatmap: heatmapResult.rows || [],
      stats: {
        totalReps,
      },
      recentLogs: recentLogs.rows || []
    });
  } catch (error) {
    console.error('CRITICAL ERROR IN /api/profile/[id]:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

export default router;

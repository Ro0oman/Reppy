import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Get reps for a user
router.get('/', authenticate, async (req, res) => {
  try {
    const repsResult = await query(
      'SELECT id, count, date FROM reps WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json(repsResult.rows);
  } catch (error) {
    console.error('Error fetching reps:', error);
    res.status(500).json({ message: 'Error fetching reps' });
  }
});

// Add or update reps for a date
router.post('/', authenticate, async (req, res) => {
  const { count, date } = req.body;
  const userId = req.user.id;

  try {
    // Insert or update reps for the specific date
    const result = await query(
      `INSERT INTO reps (user_id, count, date) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, date) 
       DO UPDATE SET count = reps.count + EXCLUDED.count 
       RETURNING *`,
      [userId, count, date || new Date()]
    );

    // Update user's total_reps
    await query(
      'UPDATE users SET total_reps = (SELECT SUM(count) FROM reps WHERE user_id = $1) WHERE id = $1',
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding reps:', error);
    res.status(500).json({ message: 'Error adding reps' });
  }
});

// Get heatmap data (reps per day for the last year)
router.get('/heatmap', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT date, count FROM reps 
       WHERE user_id = $1 AND date > CURRENT_DATE - INTERVAL '1 year'
       ORDER BY date ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ message: 'Error fetching heatmap' });
  }
});

export default router;

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

// Get stats for dashboard
router.get('/stats', authenticate, async (req, res) => {
  try {
    const totalResult = await query(
      'SELECT SUM(count) as total FROM reps WHERE user_id = $1',
      [req.user.id]
    );
    // Rough calculation for streak and top month
    res.json({
      totalReps: parseInt(totalResult.rows[0].total) || 0,
      streak: 5, // Mock streak for now
      topMonth: 'March', // Mock for now
      topMonthCount: 142
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Edit reps by ID (New requirement)
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { count } = req.body;
  const userId = req.user.id;

  try {
    // Verify ownership
    const checkResult = await query(
      'SELECT * FROM reps WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized or not found' });
    }

    // Update count
    const updateResult = await query(
      'UPDATE reps SET count = $1 WHERE id = $2 RETURNING *',
      [count, id]
    );

    // Update user's total_reps cache
    await query(
      'UPDATE users SET total_reps = (SELECT SUM(count) FROM reps WHERE user_id = $1) WHERE id = $1',
      [userId]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating reps:', error);
    res.status(500).json({ message: 'Error updating reps' });
  }
});

export default router;

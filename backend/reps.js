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
  const userId = req.user.id;
  try {
    // 1. Total Reps & Daily Goal
    const userRes = await query('SELECT total_reps, daily_goal FROM users WHERE id = $1', [userId]);
    const { total_reps, daily_goal } = userRes.rows[0];

    // 2. Top Month
    const topMonthRes = await query(
      `SELECT TO_CHAR(date, 'Month') as month, SUM(count) as total 
       FROM reps 
       WHERE user_id = $1 
       GROUP BY TO_CHAR(date, 'Month'), date_trunc('month', date)
       ORDER BY total DESC, date_trunc('month', date) DESC 
       LIMIT 1`,
      [userId]
    );
    const topMonth = topMonthRes.rows[0]?.month?.trim() || 'N/A';
    const topMonthCount = parseInt(topMonthRes.rows[0]?.total) || 0;

    // 3. Current Streak
    // Fetch unique dates where reps were recorded, sorted descending
    const datesRes = await query(
      'SELECT DISTINCT date FROM reps WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    
    let streak = 0;
    if (datesRes.rows.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const lastRepDate = new Date(datesRes.rows[0].date);
      lastRepDate.setHours(0,0,0,0);
      
      const diffDays = Math.floor((today - lastRepDate) / (1000 * 60 * 60 * 24));
      
      // Streak continues if last rep was today or yesterday
      if (diffDays <= 1) {
        streak = 1;
        for (let i = 0; i < datesRes.rows.length - 1; i++) {
          const current = new Date(datesRes.rows[i].date);
          const next = new Date(datesRes.rows[i+1].date);
          const d = Math.floor((current - next) / (1000 * 60 * 60 * 24));
          if (d === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    res.json({
      totalReps: total_reps,
      streak,
      topMonth,
      topMonthCount,
      dailyGoal: daily_goal
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

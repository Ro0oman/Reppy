import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Global leaderboard
router.get('/global', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, avatar_url, total_reps FROM users ORDER BY total_reps DESC LIMIT 20'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// Friends leaderboard
router.get('/friends', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.avatar_url, u.total_reps 
       FROM users u
       WHERE u.id = $1 OR u.id IN (
         SELECT user_id_1 FROM friendships WHERE user_id_2 = $1
         UNION
         SELECT user_id_2 FROM friendships WHERE user_id_1 = $1
       )
       ORDER BY total_reps DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching friends leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

export default router;

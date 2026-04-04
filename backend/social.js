import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Search users by name or email
router.get('/search', authenticate, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const result = await query(
      `SELECT u.id, u.name, u.avatar_url, u.total_reps,
              b.css_value as border_css,
              a.css_value as avatar_css
       FROM users u
       LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
       LEFT JOIN cosmetics a ON u.equipped_avatar_id = a.id
       WHERE (u.name ILIKE $1 OR u.email ILIKE $1) AND u.id != $2 LIMIT 10`,
      [`%${q}%`, req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
});

// Add a friend
router.post('/add', authenticate, async (req, res) => {
  const { friendId } = req.body;
  const userId = req.user.id;

  if (userId === friendId) return res.status(400).json({ message: 'Cannot add yourself' });

  try {
    // Check if already friends
    const existing = await query(
      'SELECT * FROM friendships WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)',
      [userId, friendId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Already friends' });
    }

    await query(
      'INSERT INTO friendships (user_id_1, user_id_2) VALUES ($1, $2)',
      [userId, friendId]
    );

    res.json({ message: 'Friend added' });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ message: 'Error adding friend' });
  }
});

// Get friends list
router.get('/list', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.avatar_url, u.total_reps,
              b.css_value as border_css,
              a.css_value as avatar_css
       FROM users u
       JOIN friendships f ON (f.user_id_1 = u.id OR f.user_id_2 = u.id)
       LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
       LEFT JOIN cosmetics a ON u.equipped_avatar_id = a.id
       WHERE (f.user_id_1 = $1 OR f.user_id_2 = $1) AND u.id != $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Error fetching friends' });
  }
});

export default router;

import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

/**
 * Get recent notifications for the authenticated user
 */
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await query(
      `SELECT n.*, u.name as actor_name, u.avatar_url as actor_avatar 
       FROM notifications n
       LEFT JOIN users u ON n.actor_id = u.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 30`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('[NOTIFICATIONS_GET] Error:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

/**
 * Mark a single notification as read
 */
router.put('/read/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('[NOTIFICATIONS_READ] Error:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

/**
 * Mark all notifications as read for the current user
 */
router.put('/read-all', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
      [userId]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('[NOTIFICATIONS_READ_ALL] Error:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

export default router;

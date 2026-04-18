import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';
import { recalculateUserStats } from './utils/stats.js';

const router = express.Router();

// Record a blog read event
router.post('/read', authenticate, async (req, res) => {
  const { slug } = req.body;
  const userId = req.user.id;

  if (!slug) {
    return res.status(400).json({ message: 'Slug is required' });
  }

  try {
    // 1. Record the read event (ignore if already read)
    await query(
      `INSERT INTO user_read_blogs (user_id, post_slug) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, post_slug) DO NOTHING`,
      [userId, slug]
    );

    // 2. Add INT XP (e.g., 50 XP per unique post read)
    // We don't do it directly here, we tell recalculateUserStats to handle it 
    // based on the count of read blogs.
    await recalculateUserStats(userId);

    res.json({ message: 'Blog read recorded' });
  } catch (error) {
    console.error('Error recording blog read:', error);
    res.status(500).json({ message: 'Error recording blog read' });
  }
});

export default router;

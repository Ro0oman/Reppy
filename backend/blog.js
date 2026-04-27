import express from 'express';
import { query } from './db.js';
import { authenticate, optionalAuthenticate } from './middleware.js';
import { recalculateUserStats } from './utils/stats.js';
import { blogData } from './blogData.js';

const router = express.Router();

// Record a blog read event
router.post('/read', optionalAuthenticate, async (req, res) => {
  const { slug } = req.body;
  const userId = req.user?.id; // Optional

  if (!slug) {
    return res.status(400).json({ message: 'Slug is required' });
  }

  try {
    // 0. Validate slug against blogData
    const isValid = blogData.some(p => p.slug === slug);
    if (!isValid) {
      console.log('Invalid slug request:', slug);
      console.log('Available slugs:', blogData.map(p => p.slug).join(', '));
      return res.status(404).json({ message: 'Invalid blog slug' });
    }

    // If not logged in, just return success but no XP
    if (!userId) {
      return res.json({ message: 'Blog read seen (guest)', isFirstRead: false });
    }

    // 1. Record the read event (ignore if already read)
    const readRes = await query(
      `INSERT INTO user_read_blogs (user_id, post_slug) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, post_slug) DO NOTHING
       RETURNING id`,
      [userId, slug]
    );

    const isFirstRead = readRes.rows.length > 0;

    // 2. Add INT XP (e.g., 100 XP per unique post read)
    // Only recalculate if it's the first time they read this post
    if (isFirstRead) {
      const newStats = await recalculateUserStats(userId);
      return res.json({ 
        message: 'Blog read recorded! INT XP awarded.', 
        isFirstRead: true,
        intXP: newStats.intXP,
        totalXP: newStats.totalXP 
      });
    }

    res.json({ message: 'Blog read recorded (already read)', isFirstRead: false });
  } catch (error) {
    console.error('Error recording blog read:', error);
    res.status(500).json({ message: 'Error recording blog read' });
  }
});

export default router;

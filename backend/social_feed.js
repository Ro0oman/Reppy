import express from 'express';
import { query } from './db.js';
import pool from './db.js';
import { authenticate } from './middleware.js';
import { createNotification } from './utils/notifications.js';

const router = express.Router();

/**
 * GET /api/social/feed
 * Returns the activity feed (daily summaries of reps).
 * Supports filters: 'global' (all) or 'following' (friends only).
 * Supports pagination via 'page'.
 */
router.get('/feed', authenticate, async (req, res) => {
  const { filter = 'global', page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;
  const userId = req.user.id;

  try {
    let whereClause = '';
    let params = [userId, offset];

    if (filter === 'following') {
      whereClause = `
        WHERE u.id IN (
          SELECT user_id_1 FROM friendships WHERE user_id_2 = $1 AND status = 'accepted'
          UNION
          SELECT user_id_2 FROM friendships WHERE user_id_1 = $1 AND status = 'accepted'
        ) OR u.id = $1
      `;
    }

    const feedRes = await query(`
      SELECT 
          u.id as user_id,
          u.name as user_name,
          u.avatar_url,
          u.current_level,
          b.css_value as border_css,
          a.css_value as avatar_css,
          pb.css_value as post_background_css,
          TO_CHAR(r.date, 'YYYY-MM-DD') as date,
          ds.id as summary_id,
          ds.title,
          ds.description,
          JSON_AGG(JSON_BUILD_OBJECT(
              'exercise_type', r.exercise_type,
              'count', r.count,
              'boss_damage', r.boss_damage_dealt,
              'historical_total', (SELECT SUM(count) FROM reps WHERE user_id = r.user_id AND exercise_type = r.exercise_type AND date <= r.date)
          )) as exercises,
          (SELECT COUNT(*) FROM summary_interactions WHERE summary_id = ds.id AND type = 'LIKE') as like_count,
          (SELECT COUNT(*) FROM summary_interactions WHERE summary_id = ds.id AND type = 'COMMENT') as comment_count,
          EXISTS(SELECT 1 FROM summary_interactions WHERE summary_id = ds.id AND user_id = $1 AND type = 'LIKE') as user_has_liked
      FROM reps r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN daily_summaries ds ON ds.user_id = r.user_id AND ds.date = r.date
      LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
      LEFT JOIN cosmetics a ON u.equipped_avatar_id = a.id
      LEFT JOIN cosmetics pb ON u.equipped_post_background_id = pb.id
      ${whereClause}
      GROUP BY u.id, r.date, ds.id, b.css_value, a.css_value, pb.css_value
      ORDER BY r.date DESC, MAX(r.created_at) DESC
      LIMIT ${limit} OFFSET $2
    `, params);

    res.json(feedRes.rows);
  } catch (error) {
    console.error('Error fetching social feed:', error);
    res.status(500).json({ message: 'Error fetching social feed' });
  }
});

/**
 * POST /api/social/like
 * Toggles a like on a daily summary.
 * If the summary record doesn't exist, it creates one first.
 */
router.post('/like', authenticate, async (req, res) => {
  const { userId: TargetUserId, date } = req.body;
  const myUserId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Ensure summary exists
    let summaryRes = await client.query(
      'SELECT id FROM daily_summaries WHERE user_id = $1 AND date = $2',
      [TargetUserId, date]
    );

    let summaryId;
    if (summaryRes.rows.length === 0) {
      const newSummary = await client.query(
        'INSERT INTO daily_summaries (user_id, date) VALUES ($1, $2) RETURNING id',
        [TargetUserId, date]
      );
      summaryId = newSummary.rows[0].id;
    } else {
      summaryId = summaryRes.rows[0].id;
    }

    // 2. Toggle Like
    const existingLike = await client.query(
      'SELECT 1 FROM summary_interactions WHERE summary_id = $1 AND user_id = $2 AND type = $3',
      [summaryId, myUserId, 'LIKE']
    );

    if (existingLike.rows.length > 0) {
      await client.query(
        'DELETE FROM summary_interactions WHERE summary_id = $1 AND user_id = $2 AND type = $3',
        [summaryId, myUserId, 'LIKE']
      );
      await client.query('COMMIT');
      return res.json({ liked: false });
    } else {
      await client.query(
        'INSERT INTO summary_interactions (summary_id, user_id, type) VALUES ($1, $2, $3)',
        [summaryId, myUserId, 'LIKE']
      );
      await client.query('COMMIT');
      
      const cleanDate = typeof date === 'string' ? date.substring(0, 10) : date;

      // Trigger Notification (Safe to do after commit and with local query)
      await createNotification(
        TargetUserId, 
        'LIKE', 
        myUserId, 
        'le ha dado like a tu entrenamiento', 
        cleanDate,
        TargetUserId
      );

      return res.json({ liked: true });
    }
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Error toggling like' });
  } finally {
    client.release();
  }
});

/**
 * POST /api/social/comment
 * Adds a comment to a daily summary.
 */
router.post('/comment', authenticate, async (req, res) => {
  const { targetUserId, date, content } = req.body;
  const myUserId = req.user.id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'Comment cannot be empty' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Ensure summary exists
    let summaryRes = await client.query(
      'SELECT id FROM daily_summaries WHERE user_id = $1 AND date = $2',
      [targetUserId, date]
    );

    let summaryId;
    if (summaryRes.rows.length === 0) {
      const newSummary = await client.query(
        'INSERT INTO daily_summaries (user_id, date) VALUES ($1, $2) RETURNING id',
        [targetUserId, date]
      );
      summaryId = newSummary.rows[0].id;
    } else {
      summaryId = summaryRes.rows[0].id;
    }

    // 2. Insert Comment
    const result = await client.query(
      `INSERT INTO summary_interactions (summary_id, user_id, type, content) 
       VALUES ($1, $2, 'COMMENT', $3) RETURNING *`,
      [summaryId, myUserId, content]
    );

    const userRes = await client.query('SELECT name FROM users WHERE id = $1', [myUserId]);
    
    await client.query('COMMIT');

    const cleanDate = typeof date === 'string' ? date.substring(0, 10) : date;

    // 3. Notify Owner (if not self)
    if (targetUserId !== myUserId) {
      await createNotification(
        targetUserId,
        'COMMENT',
        myUserId,
        'ha comentado en tu publicación',
        cleanDate,
        targetUserId
      );
    }

    res.json({ 
      ...result.rows[0], 
      user_name: userRes.rows[0].name 
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/social/comments/:summaryId
 */
router.get('/comments/:summaryId', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, u.name as user_name, u.avatar_url, b.css_value as border_css
       FROM summary_interactions c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
       WHERE c.summary_id = $1 AND c.type = 'COMMENT'
       ORDER BY c.created_at ASC`,
      [req.params.summaryId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

/**
 * PUT /api/social/summary
 * Allows a user to set title/description for their own summary on a specific date.
 */
router.put('/summary', authenticate, async (req, res) => {
  const { date, title, description } = req.body;
  const userId = req.user.id;

  try {
    const result = await query(
      `INSERT INTO daily_summaries (user_id, date, title, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, date) 
       DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description
       RETURNING *`,
      [userId, date || getLocalDateString(), title, description]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating daily summary:', error);
    res.status(500).json({ message: 'Error updating daily summary' });
  }
});

export default router;

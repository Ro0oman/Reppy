import express from 'express';
import { query } from './db.js';
import pool from './db.js';
import { authenticate } from './middleware.js';
import { createNotification } from './utils/notifications.js';
import { recalculateUserStats } from './utils/stats.js';
import { getLocalDateString } from './utils/date.js';

const router = express.Router();
const SOCIAL_XP_DAILY_CAP = 200;

// Ensure local xp rewards tracking table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS social_xp_rewards (
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    summary_id INTEGER REFERENCES daily_summaries(id) ON DELETE CASCADE,
    action_type VARCHAR(50), -- 'LIKE', 'COMMENT'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, summary_id, action_type)
  )
`).catch(err => console.error('Error creating social_xp_rewards table:', err));

/**
 * GET /api/social-feed/stats
 * Returns general stats for the social hub header.
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userCountRes = await query('SELECT COUNT(*) as count FROM users');
    const activeBossRes = await query(`
      SELECT name, status 
      FROM boss_fights 
      WHERE status = 'active' 
      ORDER BY order_index ASC 
      LIMIT 1
    `);

    res.json({
      activeUsers: parseInt(userCountRes.rows[0].count),
      raidStatus: activeBossRes.rows.length > 0 ? 'ACTIVE' : 'IDLE',
      bossName: activeBossRes.rows.length > 0 ? activeBossRes.rows[0].name : null
    });
  } catch (error) {
    console.error('Error fetching social stats:', error);
    res.status(500).json({ message: 'Error fetching social stats' });
  }
});

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
      WITH daily_stats AS (
        -- Calculate total reps and damage for every user/date combination
        SELECT 
          user_id, 
          date, 
          SUM(count)::int as day_reps,
          SUM(boss_damage_dealt)::int as day_damage
        FROM reps
        GROUP BY user_id, date
      ),
      feed_base AS (
        SELECT 
            u.id as user_id,
            u.name as user_name,
            u.avatar_url,
            u.current_level,
            u.total_reps,
            b.css_value as border_css,
            a.css_value as avatar_css,
            pb.css_value as post_background_css,
            TO_CHAR(r.date, 'YYYY-MM-DD') as date,
            ds.id as summary_id,
            ds.title,
            ds.description,
            u.cha_xp,
            (SELECT COUNT(*) 
             FROM reps r2 
             WHERE r2.user_id = u.id AND r2.date > r.date - INTERVAL '7 days' AND r2.date < r.date
            ) as activity_7d,
            JSON_AGG(JSON_BUILD_OBJECT(
                'exercise_type', r.exercise_type,
                'count', r.count,
                'boss_damage', r.boss_damage_dealt,
                'base_damage', r.base_damage,
                'gear_bonus', r.gear_bonus,
                'buff_bonus', r.buff_bonus,
                'active_multiplier', r.active_multiplier,
                'historical_total', (SELECT SUM(count) FROM reps WHERE user_id = r.user_id AND exercise_type = r.exercise_type AND date <= r.date),
                'is_pr', NOT EXISTS (
                    SELECT 1 FROM reps r_old 
                    WHERE r_old.user_id = u.id 
                    AND r_old.exercise_type = r.exercise_type 
                    AND r_old.date < r.date 
                    AND r_old.count >= r.count
                )
            )) as exercises,
            -- Equipped items info
            JSON_BUILD_OBJECT(
                'head', JSON_BUILD_OBJECT('name', iHead.name, 'rarity', iHead.rarity),
                'weapon', JSON_BUILD_OBJECT('name', iWeapon.name, 'rarity', iWeapon.rarity),
                'armor', JSON_BUILD_OBJECT('name', iArmor.name, 'rarity', iArmor.rarity),
                'boots', JSON_BUILD_OBJECT('name', iBoots.name, 'rarity', iBoots.rarity)
            ) as equipment,
            (SELECT COUNT(*) FROM summary_interactions WHERE summary_id = ds.id AND type = 'LIKE') as like_count,
            (SELECT COUNT(*) FROM summary_interactions WHERE summary_id = ds.id AND type = 'COMMENT') as comment_count,
            EXISTS(SELECT 1 FROM summary_interactions WHERE summary_id = ds.id AND user_id = $1 AND type = 'LIKE') as user_has_liked,
            (SELECT name FROM boss_fights WHERE status = 'active' ORDER BY order_index ASC LIMIT 1) as active_boss_name,
            MAX(r.created_at) as created_at
        FROM reps r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN daily_summaries ds ON ds.user_id = r.user_id AND ds.date::date = r.date::date
        LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
        LEFT JOIN cosmetics a ON u.equipped_avatar_id = a.id
        LEFT JOIN cosmetics pb ON u.equipped_post_background_id = pb.id
        LEFT JOIN items iHead ON u.equipped_head_id = iHead.id
        LEFT JOIN items iWeapon ON u.equipped_weapon_id = iWeapon.id
        LEFT JOIN items iArmor ON u.equipped_armor_id = iArmor.id
        LEFT JOIN items iBoots ON u.equipped_boots_id = iBoots.id
        ${whereClause}
        GROUP BY 
          u.id, r.date, ds.id, ds.title, ds.description,
          b.css_value, a.css_value, pb.css_value, 
          u.name, u.avatar_url, u.current_level, u.total_reps, u.cha_xp,
          iHead.name, iHead.rarity, iWeapon.name, iWeapon.rarity, iArmor.name, iArmor.rarity, iBoots.name, iBoots.rarity
      )
      SELECT 
        f.*,
        -- Total Reps Today
        (SELECT SUM(count) FROM reps WHERE user_id = f.user_id AND date = f.date::date) as total_reps_today,
        -- Total Damage Today
        (SELECT SUM(boss_damage_dealt) FROM reps WHERE user_id = f.user_id AND date = f.date::date) as total_damage_today,
        -- Damage Breakdown Today
        (SELECT SUM(base_damage) FROM reps WHERE user_id = f.user_id AND date = f.date::date) as total_base_damage_today,
        (SELECT SUM(gear_bonus) FROM reps WHERE user_id = f.user_id AND date = f.date::date) as total_gear_bonus_today,
        (SELECT SUM(buff_bonus) FROM reps WHERE user_id = f.user_id AND date = f.date::date) as total_buff_bonus_today,
        -- Global Rank (Position 1, 2, 3...) based on total_reps (ALL exercises, lifetime)
        (SELECT COUNT(*) FROM users u2 
         WHERE u2.total_reps > f.total_reps AND u2.is_private = false
        ) + 1 as global_rank,
        -- Percentile Ranking (Global)
        COALESCE(
          ROUND(100.0 * (
            SELECT COUNT(*) FROM users u3 
            WHERE u3.total_reps < f.total_reps AND u3.is_private = false
          ) / NULLIF((SELECT COUNT(*) FROM users u4 WHERE u4.is_private = false), 0)),
          10
        ) as global_rank_percentile,
        -- Positions Climbed (Rank before this session vs Rank after)
        GREATEST(0, (
            (SELECT COUNT(*) FROM users u_climb 
             WHERE u_climb.total_reps > (f.total_reps - (SELECT COALESCE(SUM(count), 0) FROM reps WHERE user_id = f.user_id AND date = f.date::date))
             AND u_climb.is_private = false
            ) + 1
        ) - (
            (SELECT COUNT(*) FROM users u_climb2 
             WHERE u_climb2.total_reps > f.total_reps
             AND u_climb2.is_private = false
            ) + 1
        )) as rank_climb,
        -- Personal Best (PB) check: Are today's reps higher than any previous day?
        EXISTS (
          SELECT 1 
          FROM daily_stats ds_pb 
          WHERE ds_pb.user_id = f.user_id 
          AND ds_pb.date < f.date::date
          HAVING (SELECT SUM(count) FROM reps WHERE user_id = f.user_id AND date = f.date::date) > COALESCE(MAX(ds_pb.day_reps), 0)
        ) as is_personal_best,
        -- Current Streak Calculation (Real consecutive days until this post)
        (
          WITH RECURSIVE streak_calc AS (
            SELECT f.date::date as streak_date
            UNION
            SELECT (sc.streak_date - INTERVAL '1 day')::date
            FROM streak_calc sc
            JOIN daily_stats ds ON ds.user_id = f.user_id AND ds.date = (sc.streak_date - INTERVAL '1 day')::date
          )
          SELECT COUNT(*) FROM streak_calc
        ) as real_streak
      FROM feed_base f
      ORDER BY f.date DESC, f.summary_id DESC
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
      // Check daily cap and unique reward eligibility
      const dailyXpRes = await client.query(
        `SELECT COALESCE(SUM(xp_amount), 0) as total 
         FROM (
           SELECT 5 as xp_amount FROM social_xp_rewards WHERE user_id = $1 AND action_type = 'LIKE' AND created_at > CURRENT_DATE
           UNION ALL
           SELECT 20 as xp_amount FROM social_xp_rewards WHERE user_id = $1 AND action_type = 'COMMENT' AND created_at > CURRENT_DATE
         ) as daily_xp`,
        [myUserId]
      );
      
      const currentDailyXp = parseInt(dailyXpRes.rows[0].total);
      
      if (currentDailyXp < SOCIAL_XP_DAILY_CAP) {
        // Try to record reward (will fail if already rewarded for this summary due to PK)
        try {
          await client.query(
            'INSERT INTO social_xp_rewards (user_id, summary_id, action_type) VALUES ($1, $2, $3)',
            [myUserId, summaryId, 'LIKE']
          );
          
          // Reward Charisma XP
          await client.query('UPDATE users SET cha_xp = cha_xp + 5 WHERE id = $1', [myUserId]);
          // Note: we'll recalculate after commit
          await client.query('COMMIT');
          await recalculateUserStats(myUserId);
          
          const cleanDate = typeof date === 'string' ? date.substring(0, 10) : date;
          await createNotification(TargetUserId, 'LIKE', myUserId, 'le ha dado like a tu entrenamiento', cleanDate, TargetUserId);
          
          return res.json({ liked: true, rewarded: true });
        } catch (e) {
          // Already rewarded for this post, just commit the like but no XP
          await client.query('COMMIT');
          const cleanDate = typeof date === 'string' ? date.substring(0, 10) : date;
          await createNotification(TargetUserId, 'LIKE', myUserId, 'le ha dado like a tu entrenamiento', cleanDate, TargetUserId);
          return res.json({ liked: true, rewarded: false });
        }
      } else {
        // Cap reached, no XP
        await client.query('COMMIT');
        return res.json({ liked: true, rewarded: false, cap_reached: true });
      }
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
    
    // Check daily cap and unique reward eligibility for commenting
    const dailyXpRes = await client.query(
        `SELECT COALESCE(SUM(xp_amount), 0) as total 
         FROM (
           SELECT 5 as xp_amount FROM social_xp_rewards WHERE user_id = $1 AND action_type = 'LIKE' AND created_at > CURRENT_DATE
           UNION ALL
           SELECT 20 as xp_amount FROM social_xp_rewards WHERE user_id = $1 AND action_type = 'COMMENT' AND created_at > CURRENT_DATE
         ) as daily_xp`,
        [myUserId]
    );
    
    const currentDailyXp = parseInt(dailyXpRes.rows[0].total);
    let rewarded = false;

    if (currentDailyXp < SOCIAL_XP_DAILY_CAP) {
        try {
            await client.query(
                'INSERT INTO social_xp_rewards (user_id, summary_id, action_type) VALUES ($1, $2, $3)',
                [myUserId, summaryId, 'COMMENT']
            );
            await client.query('UPDATE users SET cha_xp = cha_xp + 20 WHERE id = $1', [myUserId]);
            rewarded = true;
        } catch (e) {
            // Already rewarded for this post's comments
        }
    }

    await client.query('COMMIT');

    if (rewarded) {
        await recalculateUserStats(myUserId);
    }

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

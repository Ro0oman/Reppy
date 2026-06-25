import express from 'express';
import { query } from './db.js';
import pool from './db.js';
import { authenticate, optionalAuthenticate } from './middleware.js';
import { createNotification } from './utils/notifications.js';
import { recalculateUserStats } from './utils/stats.js';
import { updateMissionProgress } from './utils/missions.js';
import { getLocalDateString } from './utils/date.js';
import { triggerFightCleanup } from './utils/pvp_cleanup.js';

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

// Boss kill community posts
pool.query(`
  CREATE TABLE IF NOT EXISTS boss_kill_posts (
    id SERIAL PRIMARY KEY,
    boss_fight_id INTEGER REFERENCES boss_fights(id) ON DELETE CASCADE,
    boss_name VARCHAR(255),
    boss_image TEXT,
    killer_user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    killer_name VARCHAR(255),
    top3 JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(boss_fight_id)
  )
`).catch(err => console.error('Error creating boss_kill_posts table:', err));

// Users subscribed to comment updates per summary thread
pool.query(`
  CREATE TABLE IF NOT EXISTS summary_comment_subscribers (
    summary_id INTEGER REFERENCES daily_summaries(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (summary_id, user_id)
  )
`).catch(err => console.error('Error creating summary_comment_subscribers table:', err));

/**
 * GET /api/social-feed/stats
 * Returns general stats for the social hub header.
 */
router.get('/stats', optionalAuthenticate, async (req, res) => {
  try {
    const [userCountRes, activeBossRes] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query(`SELECT name, status FROM boss_fights WHERE status = 'active' ORDER BY order_index ASC LIMIT 1`)
    ]);

    let rivalry = null;

    // If authenticated, find the user just above them in the weekly ranking (FOMO trigger)
    if (req.user) {
      try {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekStartStr = weekStart.toISOString().slice(0, 10);

        // Get current user's weekly reps
        // Timed exercises (unit='seconds') store seconds in r.count and must not
        // be summed as reps in the weekly ranking — same rule as the leaderboard.
        const myWeekRes = await query(
          `SELECT COALESCE(SUM(CASE WHEN COALESCE(e.unit, 'reps') = 'seconds' THEN 0 ELSE r.count END), 0)::int AS weekly_reps
           FROM reps r
           LEFT JOIN exercises e ON e.slug = r.exercise_type
           WHERE r.user_id = $1 AND r.date >= $2`,
          [req.user.id, weekStartStr]
        );
        const myWeeklyReps = parseInt(myWeekRes.rows[0]?.weekly_reps || 0);

        // Get global rank + the person just above (the "rival")
        const rivalRes = await query(
          `WITH weekly AS (
             SELECT u.id, u.name, u.avatar_url,
                    COALESCE(SUM(CASE WHEN COALESCE(e.unit, 'reps') = 'seconds' THEN 0 ELSE r.count END), 0)::int AS weekly_reps,
                    RANK() OVER (ORDER BY COALESCE(SUM(CASE WHEN COALESCE(e.unit, 'reps') = 'seconds' THEN 0 ELSE r.count END), 0) DESC) AS rank
             FROM users u
             LEFT JOIN reps r ON r.user_id = u.id AND r.date >= $2
             LEFT JOIN exercises e ON e.slug = r.exercise_type
             WHERE u.is_private = false
             GROUP BY u.id, u.name, u.avatar_url
           )
           SELECT w.rank AS my_rank,
                  r.name AS rival_name,
                  r.rank AS rival_rank,
                  (r.weekly_reps - $3)::int AS reps_diff
           FROM weekly w
           LEFT JOIN weekly r ON r.rank = w.rank - 1
           WHERE w.id = $1`,
          [req.user.id, weekStartStr, myWeeklyReps]
        );

        if (rivalRes.rows.length > 0) {
          const row = rivalRes.rows[0];
          rivalry = {
            myRank: parseInt(row.my_rank),
            myWeeklyReps,
            rivalName: row.rival_name || null,
            rivalRank: row.rival_rank ? parseInt(row.rival_rank) : null,
            repsDiff: row.reps_diff ? parseInt(row.reps_diff) : null,
          };
        }
      } catch (rivalErr) {
        // Non-critical — don't fail the whole stats call
        console.error('[social stats] rivalry calc error:', rivalErr.message);
      }
    }

    res.json({
      activeUsers: parseInt(userCountRes.rows[0].count),
      raidStatus: activeBossRes.rows.length > 0 ? 'ACTIVE' : 'IDLE',
      bossName: activeBossRes.rows.length > 0 ? activeBossRes.rows[0].name : null,
      rivalry,
    });
  } catch (error) {
    console.error('Error fetching social stats:', error);
    res.status(500).json({ message: 'Error fetching social stats' });
  }
});

/**
 * GET /api/social-feed/personal-insight
 * Returns a private, user-only motivation card based on the latest logged exercise.
 * This is never part of the public feed payload.
 */
router.get('/personal-insight', authenticate, async (req, res) => {
  try {
    const insightRes = await query(`
      WITH last_rep AS (
        SELECT
          r.id,
          r.exercise_type,
          r.count,
          r.date AS rep_date,
          r.created_at,
          COALESCE(r.boss_damage_dealt, 0)::int AS boss_damage,
          COALESCE(r.added_weight, 0)::float AS added_weight,
          COALESCE(e.title_key, r.exercise_type) AS title_key,
          COALESCE(e.unit, 'reps') AS unit
        FROM reps r
        LEFT JOIN exercises e ON e.slug = r.exercise_type
        WHERE r.user_id = $1
          AND COALESCE(e.unit, 'reps') != 'seconds'
          AND r.count > 0
        ORDER BY r.date DESC, r.created_at DESC, r.id DESC
        LIMIT 1
      ),
      same_exercise_history AS (
        SELECT
          r.id,
          r.count,
          r.date,
          r.created_at,
          COALESCE(r.boss_damage_dealt, 0)::int AS boss_damage
        FROM reps r
        JOIN last_rep lr ON lr.exercise_type = r.exercise_type
        LEFT JOIN exercises e ON e.slug = r.exercise_type
        WHERE r.user_id = $1
          AND r.id <> lr.id
          AND r.count > 0
          AND COALESCE(e.unit, 'reps') != 'seconds'
      ),
      previous_rep AS (
        SELECT count AS previous_count, date AS previous_date
        FROM same_exercise_history
        ORDER BY date DESC, created_at DESC, id DESC
        LIMIT 1
      ),
      history_stats AS (
        SELECT
          COUNT(h.count)::int AS history_count,
          COALESCE(ROUND(AVG(h.count))::int, 0) AS average_count,
          COALESCE(ROUND((percentile_cont(0.5) WITHIN GROUP (ORDER BY h.count))::numeric)::int, 0) AS median_count,
          COALESCE(MAX(h.count)::int, 0) AS previous_best,
          COALESCE(MIN(h.count)::int, 0) AS previous_low,
          COALESCE(SUM(h.count)::int, 0) AS historical_total,
          COALESCE(SUM(CASE WHEN h.count < lr.count THEN 1 ELSE 0 END)::int, 0) AS lower_count,
          COALESCE(SUM(CASE WHEN h.count <= lr.count THEN 1 ELSE 0 END)::int, 0) AS lower_or_equal_count,
          COALESCE(SUM(CASE WHEN h.count > lr.count THEN 1 ELSE 0 END)::int, 0) AS higher_count
        FROM last_rep lr
        LEFT JOIN same_exercise_history h ON true
      ),
      recent_stats AS (
        SELECT
          COUNT(*)::int AS recent_sample,
          COALESCE(ROUND(AVG(count))::int, 0) AS recent_average
        FROM (
          SELECT count
          FROM same_exercise_history
          ORDER BY date DESC, created_at DESC, id DESC
          LIMIT 5
        ) recent
      ),
      day_stats AS (
        SELECT
          COALESCE(SUM(CASE WHEN COALESCE(e.unit, 'reps') = 'seconds' THEN 0 ELSE r.count END), 0)::int AS day_total_reps,
          COALESCE(SUM(r.boss_damage_dealt), 0)::int AS day_damage
        FROM reps r
        JOIN last_rep lr ON r.date = lr.rep_date
        LEFT JOIN exercises e ON e.slug = r.exercise_type
        WHERE r.user_id = $1
      )
      SELECT
        lr.*,
        TO_CHAR(lr.rep_date, 'YYYY-MM-DD') AS date,
        hs.*,
        rs.recent_sample,
        rs.recent_average,
        pr.previous_count,
        TO_CHAR(pr.previous_date, 'YYYY-MM-DD') AS previous_date,
        ds.day_total_reps,
        ds.day_damage
      FROM last_rep lr
      CROSS JOIN history_stats hs
      CROSS JOIN recent_stats rs
      CROSS JOIN day_stats ds
      LEFT JOIN previous_rep pr ON true
    `, [req.user.id]);

    if (insightRes.rows.length === 0) {
      return res.json(null);
    }

    const row = insightRes.rows[0];
    const count = Number(row.count || 0);
    const historyCount = Number(row.history_count || 0);
    const average = Number(row.average_count || 0);
    const recentAverage = Number(row.recent_average || 0);
    const previousCount = Number(row.previous_count || 0);
    const previousBest = Number(row.previous_best || 0);
    const delta = average > 0 ? count - average : 0;
    const recentDelta = recentAverage > 0 ? count - recentAverage : null;
    const previousDelta = previousCount > 0 ? count - previousCount : null;
    const percentOverAverage = average > 0 ? Math.round((delta / average) * 100) : null;
    const sampleSize = historyCount + 1;
    const percentile = historyCount > 0
      ? Math.min(100, Math.max(1, Math.round(((Number(row.lower_or_equal_count || 0) + 1) / sampleSize) * 100)))
      : null;
    const topPercent = historyCount > 0
      ? Math.min(100, Math.max(1, Math.round(((Number(row.higher_count || 0) + 1) / sampleSize) * 100)))
      : null;

    const daysSincePrevious = row.previous_date
      ? Math.max(0, Math.round((new Date(row.date) - new Date(row.previous_date)) / 86400000))
      : null;

    let insightType = 'baseline';
    if (previousBest > 0 && count > previousBest) {
      insightType = 'record';
    } else if (average > 0 && delta > 0) {
      insightType = 'above_average';
    } else if (previousDelta !== null && previousDelta > 0) {
      insightType = 'beat_previous';
    } else if (recentDelta !== null && recentDelta > 0) {
      insightType = 'trend_up';
    } else if (historyCount > 0) {
      insightType = 'steady';
    }

    res.json({
      id: row.id,
      exerciseType: row.exercise_type,
      titleKey: row.title_key,
      unit: row.unit,
      count,
      date: row.date,
      bossDamage: Number(row.boss_damage || 0),
      addedWeight: Number(row.added_weight || 0),
      averageCount: average,
      medianCount: Number(row.median_count || 0),
      previousBest,
      previousLow: Number(row.previous_low || 0),
      previousCount,
      previousDate: row.previous_date || null,
      historyCount,
      historicalTotal: Number(row.historical_total || 0),
      recentAverage,
      recentSample: Number(row.recent_sample || 0),
      dayTotalReps: Number(row.day_total_reps || 0),
      dayDamage: Number(row.day_damage || 0),
      delta,
      recentDelta,
      previousDelta,
      percentOverAverage,
      percentile,
      topPercent,
      daysSincePrevious,
      insightType,
      isPersonalRecord: previousBest > 0 ? count > previousBest : false,
    });
  } catch (error) {
    console.error('Error fetching personal insight:', error);
    res.status(500).json({ message: 'Error fetching personal insight' });
  }
});

/**
 * GET /api/social/feed
 * Returns the activity feed (daily summaries of reps).
 * Supports filters: 'global' (all) or 'following' (friends only).
 * Supports pagination via 'page'.
 */
router.get('/feed', optionalAuthenticate, async (req, res) => {
  const { filter = 'global', page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;
  const userId = req.user?.id || null;
  
  // Kick off expired-fight cleanup in the background (throttled, never awaited)
  // so this hot read path doesn't pay for it. See issue #263.
  triggerFightCleanup();


  try {
    let whereClause = 'WHERE u.is_private = false';
    let params = [userId, offset];

    if (filter === 'following' && userId) {
      whereClause = `
        WHERE u.is_private = false
          AND (
            u.id IN (
              SELECT user_id_1 FROM friendships WHERE user_id_2 = $1 AND status = 'accepted'
              UNION
              SELECT user_id_2 FROM friendships WHERE user_id_1 = $1 AND status = 'accepted'
            )
            OR u.id = $1
          )
      `;
    }

    const feedRes = await query(`
      WITH feed_keys AS MATERIALIZED (
        -- Cheap pass: pick exactly the page of posts we will render, then compute
        -- the rich per-row stats below only for these (instead of all of history).
        SELECT 'reps'::text AS post_type, r.user_id, r.date AS post_date,
               NULL::int AS ref_id, MAX(r.created_at) AS created_at
        FROM reps r
        JOIN users u ON r.user_id = u.id
        ${whereClause}
        GROUP BY r.user_id, r.date

        UNION ALL
        SELECT 'pvp'::text, f.challenger_id, f.created_at::date, f.id, f.created_at
        FROM pvp_fights f
        JOIN users u1 ON f.challenger_id = u1.id
        JOIN users u2 ON f.challenged_id = u2.id
        WHERE f.status != 'pending' AND u1.is_private = false AND u2.is_private = false

        UNION ALL
        SELECT 'challenge'::text, ac.challenger_id,
               COALESCE(ac.resolved_at, ac.expires_at, ac.created_at)::date, ac.id,
               COALESCE(ac.resolved_at, ac.expires_at, ac.created_at)
        FROM async_challenges ac
        JOIN users u1 ON u1.id = ac.challenger_id
        JOIN users u2 ON u2.id = ac.challenged_id
        WHERE ac.status IN ('active', 'finished') AND u1.is_private = false AND u2.is_private = false

        UNION ALL
        SELECT 'boss_kill'::text, bkp.killer_user_id, bkp.created_at::date, bkp.id, bkp.created_at
        FROM boss_kill_posts bkp
        WHERE bkp.created_at >= NOW() - INTERVAL '48 hours'

        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET $2
      ),
      exercise_rankings AS MATERIALIZED (
        -- Global per-exercise leaderboard, computed once per request (was a
        -- full-table window scan re-run for every feed row).
        SELECT exercise_type, user_id, rank FROM (
          SELECT exercise_type, user_id,
                 RANK() OVER (PARTITION BY exercise_type ORDER BY SUM(count) DESC) AS rank
          FROM reps
          GROUP BY exercise_type, user_id
        ) all_ranks
        WHERE rank <= 10
      ),
      daily_stats AS (
        SELECT
          r.user_id,
          r.date,
          SUM(CASE WHEN COALESCE(e.unit, 'reps') = 'seconds' THEN 0 ELSE r.count END)::int as day_reps,
          SUM(r.boss_damage_dealt)::int as day_damage
        FROM reps r
        LEFT JOIN exercises e ON e.slug = r.exercise_type
        WHERE r.user_id IN (SELECT user_id FROM feed_keys)
        GROUP BY r.user_id, r.date
      ),
      reps_feed AS (
        SELECT 
            u.id as user_id,
            u.name as user_name,
            u.avatar_url,
            u.current_level,
            u.total_reps,
            u.str_xp, u.end_xp, u.agi_xp, u.dex_xp, u.vig_xp, u.int_xp, u.fth_xp,
            b.css_value as border_css,
            a.css_value as avatar_css,
            pb.css_value as post_background_css,
            TO_CHAR(r.date, 'YYYY-MM-DD') as date,
            ds.id as summary_id,
            ds.title,
            ds.description,
            u.cha_xp,
            t.name as title_name,
            (SELECT name FROM boss_fights bf WHERE bf.id = MAX(r.boss_fight_id)) as boss_name,
            (SELECT image_url FROM boss_fights bf WHERE bf.id = MAX(r.boss_fight_id)) as boss_image,
            JSON_AGG(JSON_BUILD_OBJECT(
                'exercise_type', r.exercise_type,
                'count', r.count,
                'is_crit', COALESCE(r.is_crit, false),
                'unit', (SELECT unit FROM exercises WHERE slug = r.exercise_type),
                'title_key', (SELECT title_key FROM exercises WHERE slug = r.exercise_type),
                'boss_damage', r.boss_damage_dealt,
                'base_damage', r.base_damage,
                'gear_bonus', r.gear_bonus,
                'buff_bonus', r.buff_bonus,
                'active_multiplier', r.active_multiplier,
                'is_pr', NOT EXISTS (
                    SELECT 1 FROM reps r_old 
                    WHERE r_old.user_id = u.id 
                    AND r_old.exercise_type = r.exercise_type 
                    AND r_old.date < r.date 
                    AND r_old.count >= r.count
                )
            )) as exercises,
            JSON_BUILD_OBJECT(
                'head', JSON_BUILD_OBJECT(
                    'id', iHead.id, 'name', iHead.name, 'rarity', iHead.rarity, 
                    'type', iHead.type, 'svg_key', iHead.svg_key, 'css_value', iHead.css_value,
                    'stats', iHead.stats, 'description', iHead.description
                ),
                'weapon', JSON_BUILD_OBJECT(
                    'id', iWeapon.id, 'name', iWeapon.name, 'rarity', iWeapon.rarity, 
                    'type', iWeapon.type, 'svg_key', iWeapon.svg_key, 'css_value', iWeapon.css_value,
                    'stats', iWeapon.stats, 'description', iWeapon.description
                ),
                'armor', JSON_BUILD_OBJECT(
                    'id', iArmor.id, 'name', iArmor.name, 'rarity', iArmor.rarity, 
                    'type', iArmor.type, 'svg_key', iArmor.svg_key, 'css_value', iArmor.css_value,
                    'stats', iArmor.stats, 'description', iArmor.description
                ),
                'boots', JSON_BUILD_OBJECT(
                    'id', iBoots.id, 'name', iBoots.name, 'rarity', iBoots.rarity, 
                    'type', iBoots.type, 'svg_key', iBoots.svg_key, 'css_value', iBoots.css_value,
                    'stats', iBoots.stats, 'description', iBoots.description
                )
            ) as equipment,
            (SELECT COUNT(*) FROM summary_interactions WHERE summary_id = ds.id AND type = 'LIKE') as like_count,
            (SELECT COUNT(*) FROM summary_interactions WHERE summary_id = ds.id AND type = 'COMMENT') as comment_count,
            EXISTS(SELECT 1 FROM summary_interactions WHERE summary_id = ds.id AND user_id = $1 AND type = 'LIKE') as user_has_liked,
            MAX(r.created_at) as created_at,
            'reps' as post_type,
            NULL::json as pvp_data
        FROM reps r
        JOIN users u ON r.user_id = u.id
        JOIN feed_keys fk ON fk.post_type = 'reps' AND fk.user_id = u.id AND fk.post_date = r.date
        LEFT JOIN daily_summaries ds ON ds.user_id = r.user_id AND ds.date::date = r.date::date
        LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
        LEFT JOIN cosmetics a ON u.equipped_avatar_id = a.id
        LEFT JOIN cosmetics pb ON u.equipped_post_background_id = pb.id
        LEFT JOIN cosmetics t ON u.equipped_title_id = t.id
        LEFT JOIN items iHead ON u.equipped_head_id = iHead.id
        LEFT JOIN items iWeapon ON u.equipped_weapon_id = iWeapon.id
        LEFT JOIN items iArmor ON u.equipped_armor_id = iArmor.id
        LEFT JOIN items iBoots ON u.equipped_boots_id = iBoots.id
        GROUP BY
          u.id, r.date, ds.id, ds.title, ds.description,
          b.css_value, a.css_value, pb.css_value, t.name,
          u.name, u.avatar_url, u.current_level, u.total_reps, u.cha_xp,
          iHead.id, iWeapon.id, iArmor.id, iBoots.id
      ),
      pvp_feed AS (
        SELECT 
            u1.id as user_id,
            u1.name as user_name,
            u1.avatar_url,
            u1.current_level,
            u1.total_reps,
            u1.str_xp, u1.end_xp, u1.agi_xp, u1.dex_xp, u1.vig_xp, u1.int_xp, u1.fth_xp,
            b.css_value as border_css,
            NULL as avatar_css,
            NULL as post_background_css,
            TO_CHAR(f.created_at, 'YYYY-MM-DD') as date,
            NULL::int as summary_id,
            CASE WHEN f.status = 'active' THEN 'COMBATE EN VIVO ⚔' ELSE 'COMBATE FINALIZADO ⚔' END as title,
            u1.name || ' vs ' || u2.name as description,
            u1.cha_xp,
            t.name as title_name,
            NULL as boss_name,
            NULL as boss_image,
            '[]'::json as exercises,
            '{}'::json as equipment,
            0::bigint as like_count,
            0::bigint as comment_count,
            false as user_has_liked,
            f.created_at as created_at,
            'pvp' as post_type,
            JSON_BUILD_OBJECT(
                'id', f.id,
                'challenger_id', f.challenger_id,
                'challenged_id', f.challenged_id,
                'challenger_name', u1.name,
                'challenged_name', u2.name,
                'status', f.status,
                'winner_id', f.winner_id,
                'damage1', f.damage1,
                'damage2', f.damage2,
                'hp1', f.hp1,
                'hp2', f.hp2,
                'max_hp', f.max_hp,
                'started_at', f.started_at,
                'time_limit', f.time_limit,
                'battlefield', f.battlefield
            ) as pvp_data
        FROM pvp_fights f
        JOIN feed_keys fk ON fk.post_type = 'pvp' AND fk.ref_id = f.id
        JOIN users u1 ON f.challenger_id = u1.id
        JOIN users u2 ON f.challenged_id = u2.id
        LEFT JOIN cosmetics b ON u1.equipped_border_id = b.id
        LEFT JOIN cosmetics t ON u1.equipped_title_id = t.id
        WHERE f.status != 'pending'
          AND u1.is_private = false
          AND u2.is_private = false
      ),
      challenge_feed AS (
        SELECT
          u1.id as user_id,
          u1.name as user_name,
          u1.avatar_url,
          u1.current_level,
          u1.total_reps,
          u1.str_xp, u1.end_xp, u1.agi_xp, u1.dex_xp, u1.vig_xp, u1.int_xp, u1.fth_xp,
          b.css_value as border_css,
          NULL as avatar_css,
          NULL as post_background_css,
          TO_CHAR(COALESCE(ac.resolved_at, ac.expires_at, ac.created_at), 'YYYY-MM-DD') as date,
          NULL::int as summary_id,
          CASE ac.status
            WHEN 'active'   THEN 'RETO 24H EN CURSO ⚔️'
            WHEN 'finished' THEN 'RETO 24H FINALIZADO 🏆'
          END as title,
          u1.name || ' vs ' || u2.name as description,
          u1.cha_xp,
          ti.name as title_name,
          NULL as boss_name,
          NULL as boss_image,
          '[]'::json as exercises,
          '{}'::json as equipment,
          0::bigint as like_count,
          0::bigint as comment_count,
          false as user_has_liked,
          COALESCE(ac.resolved_at, ac.expires_at, ac.created_at) as created_at,
          'challenge' as post_type,
          JSON_BUILD_OBJECT(
            'id', ac.id,
            'challenger_id', ac.challenger_id,
            'challenged_id', ac.challenged_id,
            'challenger_name', u1.name,
            'challenged_name', u2.name,
            'challenger_avatar', u1.avatar_url,
            'challenged_avatar', u2.avatar_url,
            'challenger_score', ac.challenger_score,
            'challenged_score', ac.challenged_score,
            'goal_type', ac.goal_type,
            'goal_value', ac.goal_value,
            'status', ac.status,
            'winner_id', ac.winner_id,
            'expires_at', ac.expires_at,
            'reward_coins', ac.reward_coins,
            'reward_gems', ac.reward_gems
          ) as pvp_data
        FROM async_challenges ac
        JOIN feed_keys fk ON fk.post_type = 'challenge' AND fk.ref_id = ac.id
        JOIN users u1 ON u1.id = ac.challenger_id
        JOIN users u2 ON u2.id = ac.challenged_id
        LEFT JOIN cosmetics b  ON u1.equipped_border_id = b.id
        LEFT JOIN cosmetics ti ON u1.equipped_title_id  = ti.id
        WHERE ac.status IN ('active', 'finished')
          AND u1.is_private = false
          AND u2.is_private = false
      ),
      boss_kill_feed AS (
        SELECT
          bkp.killer_user_id           AS user_id,
          bkp.killer_name              AS user_name,
          NULL                         AS avatar_url,
          NULL::int                    AS current_level,
          NULL::int                    AS total_reps,
          NULL::int AS str_xp, NULL::int AS end_xp, NULL::int AS agi_xp,
          NULL::int AS dex_xp, NULL::int AS vig_xp, NULL::int AS int_xp, NULL::int AS fth_xp,
          NULL                         AS border_css,
          NULL                         AS avatar_css,
          NULL                         AS post_background_css,
          TO_CHAR(bkp.created_at, 'YYYY-MM-DD') AS date,
          NULL::int                    AS summary_id,
          '☠️ BOSS DERROTADO'          AS title,
          bkp.boss_name                AS description,
          NULL::int                    AS cha_xp,
          NULL                         AS title_name,
          bkp.boss_name                AS boss_name,
          bkp.boss_image               AS boss_image,
          '[]'::json                   AS exercises,
          '{}'::json                   AS equipment,
          0::bigint                    AS like_count,
          0::bigint                    AS comment_count,
          false                        AS user_has_liked,
          bkp.created_at               AS created_at,
          'boss_kill'                  AS post_type,
          JSON_BUILD_OBJECT(
            'id',            bkp.id,
            'boss_fight_id', bkp.boss_fight_id,
            'boss_name',     bkp.boss_name,
            'boss_image',    bkp.boss_image,
            'killer_id',     bkp.killer_user_id,
            'killer_name',   bkp.killer_name,
            'top3',          bkp.top3,
            'created_at',    bkp.created_at
          )                            AS pvp_data
        FROM boss_kill_posts bkp
        JOIN feed_keys fk ON fk.post_type = 'boss_kill' AND fk.ref_id = bkp.id
        WHERE bkp.created_at >= NOW() - INTERVAL '48 hours'
      ),
      feed_base AS (
        SELECT * FROM reps_feed
        UNION ALL
        SELECT * FROM pvp_feed
        UNION ALL
        SELECT * FROM challenge_feed
        UNION ALL
        SELECT * FROM boss_kill_feed
      )
      SELECT 
        f.*,
        COALESCE(EXISTS (SELECT 1 FROM reps rc WHERE rc.user_id = f.user_id AND rc.date = f.date::date AND rc.is_crit = true), false) as has_crit,
        COALESCE((
          SELECT SUM(r2.count)
          FROM reps r2
          LEFT JOIN exercises e2 ON e2.slug = r2.exercise_type
          WHERE r2.user_id = f.user_id
            AND r2.date = f.date::date
            AND COALESCE(e2.unit, 'reps') != 'seconds'
        ), 0) as total_reps_today,
        COALESCE((SELECT SUM(boss_damage_dealt) FROM reps WHERE user_id = f.user_id AND date = f.date::date), 0) as total_damage_today,
        -- Dominant stat calculation
        (SELECT 
            CASE 
                WHEN GREATEST(str_xp, end_xp, agi_xp) = str_xp THEN 'str'
                WHEN GREATEST(str_xp, end_xp, agi_xp) = end_xp THEN 'end'
                ELSE 'agi'
            END
         FROM users WHERE id = f.user_id
        ) as dominant_stat,
        (SELECT COUNT(*) FROM users u2 WHERE u2.total_reps > f.total_reps AND u2.is_private = false) + 1 as global_rank,
        -- Rivalry: Find user just above in rank
        (SELECT JSON_BUILD_OBJECT('name', u_rival.name, 'reps_diff', u_rival.total_reps - f.total_reps)
         FROM users u_rival 
         WHERE u_rival.total_reps > f.total_reps AND u_rival.is_private = false
         ORDER BY u_rival.total_reps ASC LIMIT 1
        ) as next_rank_rival,
        COALESCE(EXISTS (
          SELECT 1 FROM daily_stats ds_pb WHERE ds_pb.user_id = f.user_id AND ds_pb.date < f.date::date
          HAVING (
            SELECT SUM(r3.count)
            FROM reps r3
            LEFT JOIN exercises e3 ON e3.slug = r3.exercise_type
            WHERE r3.user_id = f.user_id
              AND r3.date = f.date::date
              AND COALESCE(e3.unit, 'reps') != 'seconds'
          ) > COALESCE(MAX(ds_pb.day_reps), 0)
        ), false) as is_personal_best,
        COALESCE((
          WITH RECURSIVE streak_calc AS (
            SELECT f.date::date as streak_date
            UNION
            SELECT (sc.streak_date - INTERVAL '1 day')::date
            FROM streak_calc sc
            JOIN daily_stats ds ON ds.user_id = f.user_id AND ds.date = (sc.streak_date - INTERVAL '1 day')::date
          )
          SELECT COUNT(*) FROM streak_calc
        ), 0) as real_streak,
        (
          SELECT JSON_AGG(r_stats) FROM (
            SELECT exercise_type, rank
            FROM exercise_rankings er
            WHERE er.user_id = f.user_id
            LIMIT 3
          ) r_stats
        ) as exercise_ranks
      FROM feed_base f
      ORDER BY f.created_at DESC
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
          
          // Reward Charisma XP to Liker
          await client.query('UPDATE users SET cha_xp = cha_xp + 5 WHERE id = $1', [myUserId]);
          
          // Reward Reppy Coins to Author (Buff for interaction)
          await client.query('UPDATE users SET reppy_coins = reppy_coins + 5 WHERE id = $1', [TargetUserId]);

          // Mission: Social Likes
          await updateMissionProgress(myUserId, 'social_likes', 1);

          // Note: we'll recalculate after commit
          await client.query('COMMIT');
          await recalculateUserStats(myUserId);
          await recalculateUserStats(TargetUserId);
          
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

    // 2. Prevent duplicate comments (same user, same content, same summary, within 5 seconds)
    const duplicateCheck = await client.query(
      `SELECT 1 FROM summary_interactions 
       WHERE summary_id = $1 AND user_id = $2 AND content = $3 AND type = 'COMMENT'
       AND created_at > CURRENT_TIMESTAMP - INTERVAL '5 seconds'`,
      [summaryId, myUserId, content]
    );

    if (duplicateCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'DUPLICATE COMMENT' });
    }

    // 3. Insert Comment
    const result = await client.query(
      `INSERT INTO summary_interactions (summary_id, user_id, type, content) 
       VALUES ($1, $2, 'COMMENT', $3) RETURNING *`,
      [summaryId, myUserId, content]
    );

    // Auto-subscribe commenter and post owner to comment thread updates.
    await client.query(
      `INSERT INTO summary_comment_subscribers (summary_id, user_id)
       VALUES ($1, $2), ($1, $3)
       ON CONFLICT (summary_id, user_id) DO NOTHING`,
      [summaryId, myUserId, targetUserId]
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

    // Notify Owner (if not self)
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

    // Notify other subscribed users in the same thread (excluding actor and owner).
    const subscribersRes = await query(
      `SELECT user_id
       FROM summary_comment_subscribers
       WHERE summary_id = $1
       AND user_id <> $2
       AND user_id <> $3`,
      [summaryId, myUserId, targetUserId]
    );

    for (const row of subscribersRes.rows) {
      await createNotification(
        row.user_id,
        'COMMENT',
        myUserId,
        'ha respondido en una publicación que sigues',
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
router.get('/comments/:summaryId', optionalAuthenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, u.name as user_name, u.avatar_url, b.css_value as border_css
       FROM summary_interactions c
       JOIN daily_summaries ds ON c.summary_id = ds.id
       JOIN users owner ON ds.user_id = owner.id
       JOIN users u ON c.user_id = u.id
       LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
       WHERE c.summary_id = $1
         AND c.type = 'COMMENT'
         AND owner.is_private = false
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

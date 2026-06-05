import express from 'express';
import { query } from './db.js';
import { authenticate, isAdmin } from './middleware.js';

const router = express.Router();

// --- Cosmetics Management ---

// Create cosmetic
router.post('/cosmetics', authenticate, isAdmin, async (req, res) => {
  const { name, description, type, price, css_value, is_seasonal, rarity } = req.body;
  try {
    const result = await query(
      'INSERT INTO items (name, description, type, price, css_value, is_seasonal, rarity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description, type, price, css_value, is_seasonal || false, rarity || 'common']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating cosmetic' });
  }
});

// Update cosmetic
router.put('/cosmetics/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, type, price, css_value, is_seasonal, rarity } = req.body;
  try {
    const result = await query(
      'UPDATE items SET name=$1, description=$2, type=$3, price=$4, css_value=$5, is_seasonal=$6, rarity=$7 WHERE id=$8 RETURNING *',
      [name, description, type, price, css_value, is_seasonal || false, rarity || 'common', id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cosmetic' });
  }
});

// Delete cosmetic
router.delete('/cosmetics/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM items WHERE id = $1', [id]);
    res.json({ message: 'Cosmetic deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting cosmetic' });
  }
});

// --- Boss Management ---

// Get all bosses
router.get('/bosses', authenticate, isAdmin, async (req, res) => {
  try {
    const result = await query('SELECT * FROM boss_fights ORDER BY start_date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bosses' });
  }
});

// Create/Spawn Boss
router.post('/bosses', authenticate, isAdmin, async (req, res) => {
  const { name, description, total_hp, start_date, end_date, image_url, order_index } = req.body;
  try {
    const result = await query(
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, image_url, order_index)
       VALUES ($1, $2, $3, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, total_hp, start_date || new Date(), end_date || new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), image_url, order_index || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating boss:', error);
    res.status(500).json({ message: 'Error creating boss' });
  }
});

// Update Boss
router.put('/bosses/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, total_hp, current_hp, start_date, end_date, image_url, status, order_index } = req.body;
  try {
    // Get current boss data to fill missing fields
    const currentBossRes = await query('SELECT * FROM boss_fights WHERE id = $1', [id]);
    if (currentBossRes.rows.length === 0) return res.status(404).json({ message: 'Boss not found' });
    const b = currentBossRes.rows[0];

    const result = await query(
      `UPDATE boss_fights SET 
        name=$1, 
        description=$2, 
        total_hp=$3, 
        current_hp=$4, 
        start_date=$5, 
        end_date=$6, 
        image_url=$7, 
        status=$8,
        order_index=$9
       WHERE id=$10 RETURNING *`,
      [
        name || b.name, 
        description || b.description, 
        total_hp ?? b.total_hp, 
        current_hp ?? b.current_hp, 
        start_date || b.start_date, 
        end_date || b.end_date, 
        image_url ?? b.image_url, 
        status || b.status, 
        order_index ?? b.order_index,
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating boss:', error);
    res.status(500).json({ message: 'Error updating boss', detail: error.message });
  }
});

// Delete Boss
router.delete('/bosses/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM boss_fights WHERE id = $1', [id]);
    res.json({ message: 'Boss event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting boss' });
  }
});


// --- Analytics ---

router.get('/analytics', authenticate, isAdmin, async (req, res) => {
  try {
    const [
      funnelRes,
      retentionRes,
      weeklyRes,
      prevWeeklyRes,
      dailySignupsRes,
      dailyActiveRes,
    ] = await Promise.all([

      // Funnel: signup → first rep → mission claimed → D1 return
      query(`
        SELECT
          COUNT(*)::int AS total_signups,
          COUNT(DISTINCT r.user_id)::int AS users_with_reps,
          (SELECT COUNT(DISTINCT user_id)::int FROM user_missions WHERE is_claimed = true) AS users_mission_claimed,
          (SELECT COUNT(DISTINCT u2.id)::int
           FROM users u2
           WHERE u2.created_at <= NOW() - INTERVAL '2 days'
             AND EXISTS (
               SELECT 1 FROM reps r2
               WHERE r2.user_id = u2.id
                 AND r2.date = DATE(u2.created_at AT TIME ZONE 'UTC') + 1
             )
          ) AS d1_returned
        FROM users u
        LEFT JOIN reps r ON r.user_id = u.id
      `),

      // D1 / D7 retention rates
      query(`
        SELECT
          (SELECT COUNT(*)::int FROM users WHERE created_at <= NOW() - INTERVAL '2 days') AS d1_cohort,
          (SELECT COUNT(DISTINCT u.id)::int
           FROM users u
           WHERE u.created_at <= NOW() - INTERVAL '2 days'
             AND EXISTS (
               SELECT 1 FROM reps r WHERE r.user_id = u.id
                 AND r.date = DATE(u.created_at AT TIME ZONE 'UTC') + 1
             )
          ) AS d1_retained,
          (SELECT COUNT(*)::int FROM users WHERE created_at <= NOW() - INTERVAL '8 days') AS d7_cohort,
          (SELECT COUNT(DISTINCT u.id)::int
           FROM users u
           WHERE u.created_at <= NOW() - INTERVAL '8 days'
             AND EXISTS (
               SELECT 1 FROM reps r WHERE r.user_id = u.id
                 AND r.date BETWEEN DATE(u.created_at AT TIME ZONE 'UTC')
                               AND DATE(u.created_at AT TIME ZONE 'UTC') + 7
             )
          ) AS d7_retained
      `),

      // This week
      query(`
        SELECT
          (SELECT COUNT(*)::int FROM users WHERE created_at >= DATE_TRUNC('week', NOW())) AS new_signups,
          (SELECT COUNT(DISTINCT user_id)::int FROM reps WHERE date >= DATE_TRUNC('week', NOW())) AS active_users,
          (SELECT COALESCE(SUM(count),0)::int FROM reps WHERE date >= DATE_TRUNC('week', NOW())) AS total_reps,
          (SELECT COUNT(*)::int FROM user_missions WHERE is_claimed = true AND last_updated >= DATE_TRUNC('week', NOW())) AS missions_claimed
      `),

      // Last week
      query(`
        SELECT
          (SELECT COUNT(*)::int FROM users WHERE created_at >= DATE_TRUNC('week', NOW()) - INTERVAL '7 days' AND created_at < DATE_TRUNC('week', NOW())) AS new_signups,
          (SELECT COUNT(DISTINCT user_id)::int FROM reps WHERE date >= DATE_TRUNC('week', NOW()) - INTERVAL '7 days' AND date < DATE_TRUNC('week', NOW())) AS active_users,
          (SELECT COALESCE(SUM(count),0)::int FROM reps WHERE date >= DATE_TRUNC('week', NOW()) - INTERVAL '7 days' AND date < DATE_TRUNC('week', NOW())) AS total_reps,
          (SELECT COUNT(*)::int FROM user_missions WHERE is_claimed = true AND last_updated >= DATE_TRUNC('week', NOW()) - INTERVAL '7 days' AND last_updated < DATE_TRUNC('week', NOW())) AS missions_claimed
      `),

      // Daily signups last 14 days
      query(`
        SELECT DATE(created_at AT TIME ZONE 'UTC') AS day, COUNT(*)::int AS count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '14 days'
        GROUP BY day ORDER BY day
      `),

      // Daily active users last 14 days
      query(`
        SELECT date AS day, COUNT(DISTINCT user_id)::int AS count
        FROM reps
        WHERE date >= NOW() - INTERVAL '14 days'
        GROUP BY date ORDER BY date
      `),
    ]);

    const funnel = funnelRes.rows[0];
    const retention = retentionRes.rows[0];
    const week = weeklyRes.rows[0];
    const prevWeek = prevWeeklyRes.rows[0];

    const pct = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0;
    const delta = (a, b) => b > 0 ? Math.round(((a - b) / b) * 100) : null;

    res.json({
      funnel: {
        signups: funnel.total_signups,
        activated: funnel.users_with_reps,
        activated_pct: pct(funnel.users_with_reps, funnel.total_signups),
        mission_claimed: funnel.users_mission_claimed,
        mission_pct: pct(funnel.users_mission_claimed, funnel.users_with_reps),
        d1_returned: funnel.d1_returned,
        d1_pct: pct(funnel.d1_returned, funnel.total_signups),
      },
      retention: {
        d1_rate: pct(retention.d1_retained, retention.d1_cohort),
        d1_cohort: retention.d1_cohort,
        d1_retained: retention.d1_retained,
        d7_rate: pct(retention.d7_retained, retention.d7_cohort),
        d7_cohort: retention.d7_cohort,
        d7_retained: retention.d7_retained,
      },
      weekly: {
        this_week: week,
        last_week: prevWeek,
        delta: {
          signups: delta(week.new_signups, prevWeek.new_signups),
          active_users: delta(week.active_users, prevWeek.active_users),
          total_reps: delta(week.total_reps, prevWeek.total_reps),
          missions_claimed: delta(week.missions_claimed, prevWeek.missions_claimed),
        },
      },
      charts: {
        daily_signups: dailySignupsRes.rows,
        daily_active: dailyActiveRes.rows,
      },
    });
  } catch (err) {
    console.error('[ANALYTICS]', err);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// Give an item to a user by item name
router.post('/give-item', authenticate, isAdmin, async (req, res) => {
  const { user_id, item_name } = req.body;
  if (!user_id || !item_name) return res.status(400).json({ message: 'user_id and item_name required' });
  try {
    const itemRes = await query('SELECT id, name, type FROM items WHERE LOWER(name) = LOWER($1)', [item_name]);
    if (itemRes.rows.length === 0) return res.status(404).json({ message: `Item "${item_name}" not found` });
    const item = itemRes.rows[0];
    await query(
      `INSERT INTO user_items (user_id, item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [user_id, item.id]
    );
    res.json({ ok: true, item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Give gems/coins to a user by ID
router.post('/give-currency', authenticate, isAdmin, async (req, res) => {
  const { user_id, gems, coins } = req.body;
  if (!user_id) return res.status(400).json({ message: 'user_id required' });
  try {
    const gemAmount  = parseInt(gems  || 0, 10);
    const coinAmount = parseInt(coins || 0, 10);
    const result = await query(
      `UPDATE users
         SET reppy_gems  = reppy_gems  + $1,
             reppy_coins = reppy_coins + $2
       WHERE id = $3
       RETURNING id, reppy_gems, reppy_coins`,
      [gemAmount, coinAmount, user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ ok: true, ...result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

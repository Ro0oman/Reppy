import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Whitelist of feature keys the UI may flag as "NEW". Keeping it server-side
// prevents the table from filling up with arbitrary client-supplied keys.
// `ranking_*` is allowed dynamically (one key per ISO week) for the ranking dot.
const KNOWN_FEATURE_KEYS = new Set([
  'battle_view',
  'camp_redesign',
  'quick_potions',
  'campaign_v1',
]);

function isAllowedKey(key) {
  return KNOWN_FEATURE_KEYS.has(key) || /^ranking_\d{4}-\d{1,2}$/.test(key);
}

// GET /api/features/seen → ["battle_view", ...] the user has already seen.
router.get('/seen', authenticate, async (req, res) => {
  try {
    const r = await query(
      'SELECT feature_key FROM user_feature_seen WHERE user_id = $1',
      [req.user.id]
    );
    res.json(r.rows.map((row) => row.feature_key));
  } catch (error) {
    console.error('Error fetching seen features:', error);
    res.status(500).json({ message: 'Error fetching seen features' });
  }
});

// POST /api/features/seen/:key → mark a feature as seen (idempotent upsert).
router.post('/seen/:key', authenticate, async (req, res) => {
  const key = String(req.params.key || '').slice(0, 64);
  if (!isAllowedKey(key)) {
    return res.status(400).json({ message: 'Unknown feature key' });
  }
  try {
    await query(
      `INSERT INTO user_feature_seen (user_id, feature_key)
       VALUES ($1, $2)
       ON CONFLICT (user_id, feature_key) DO NOTHING`,
      [req.user.id, key]
    );
    res.json({ message: 'Marked as seen', feature_key: key });
  } catch (error) {
    console.error('Error marking feature seen:', error);
    res.status(500).json({ message: 'Error marking feature seen' });
  }
});

// GET /api/features/badges → aggregate counts/flags that drive the red dots on
// the player card (Misiones / Cofres / Ranking) and the inventory tab.
router.get('/badges', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    // Chests: sum of the four pending-chest counters.
    const chestsRes = await query(
      `SELECT COALESCE(boss_chests, 0) + COALESCE(epic_chests, 0)
            + COALESCE(legendary_chests, 0) + COALESCE(level_chests, 0) AS total
       FROM users WHERE id = $1`,
      [userId]
    );
    const chests_total = chestsRes.rows[0]?.total || 0;

    // Missions completed but not yet claimed.
    let missions_claimable = 0;
    try {
      const mRes = await query(
        `SELECT COUNT(*)::int AS n FROM user_missions
         WHERE user_id = $1 AND is_completed = true AND is_claimed = false`,
        [userId]
      );
      missions_claimable = mRes.rows[0]?.n || 0;
    } catch (e) {
      // user_missions may not exist in some envs — degrade gracefully.
      missions_claimable = 0;
    }

    // Any unseen inventory item.
    let inventory_new = false;
    try {
      const iRes = await query(
        `SELECT EXISTS(
           SELECT 1 FROM user_items WHERE user_id = $1 AND is_new = TRUE
         ) AS has_new`,
        [userId]
      );
      inventory_new = !!iRes.rows[0]?.has_new;
    } catch (e) {
      inventory_new = false;
    }

    // Ranking dot: "new" until the user opens the ranking this ISO week.
    const rankingKey = `ranking_${isoWeekKey()}`;
    let ranking_new = true;
    try {
      const rRes = await query(
        'SELECT 1 FROM user_feature_seen WHERE user_id = $1 AND feature_key = $2',
        [userId, rankingKey]
      );
      ranking_new = rRes.rowCount === 0;
    } catch (e) {
      ranking_new = false;
    }

    res.json({
      chests_total,
      missions_claimable,
      inventory_new,
      ranking_new,
      ranking_key: rankingKey,
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ message: 'Error fetching badges' });
  }
});

// ISO-week key like "2026-26" for the weekly ranking dot.
function isoWeekKey() {
  const d = new Date();
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-${week}`;
}

export default router;

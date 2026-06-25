import { query } from '../db.js';
import { broadcastPvP } from '../socketManager.js';

const CLEANUP_THROTTLE_MS = 2 * 60 * 1000; // run at most once every 2 minutes
let lastCleanupAt = 0;
let cleanupInFlight = false;

/**
 * Non-blocking, throttled trigger for hot read paths (e.g. GET /feed). Callers
 * must NOT await this — it kicks off cleanup in the background at most once per
 * throttle window, so requests never pay the cost while expired fights still
 * get finalized within ~2 minutes of activity. On a long-running server the
 * cron in index.js drives it independently of traffic. See issue #263.
 */
export function triggerFightCleanup() {
  const now = Date.now();
  if (cleanupInFlight || now - lastCleanupAt < CLEANUP_THROTTLE_MS) return;
  lastCleanupAt = now;
  cleanupInFlight = true;
  autoFinishExpiredFights()
    .catch((e) => console.error('triggerFightCleanup error:', e))
    .finally(() => { cleanupInFlight = false; });
}

/**
 * Automatically finishes PvP fights that have exceeded their time limit.
 */
export async function autoFinishExpiredFights() {
  try {
    // 1. Find all active fights that have exceeded their time limit
    const expiredRes = await query(`
      SELECT id, challenger_id, challenged_id, hp1, hp2, damage1, damage2, started_at, time_limit
      FROM pvp_fights
      WHERE status = 'active' 
      AND (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) > time_limit)
    `);

    if (expiredRes.rows.length === 0) return;

    console.log(`Auto-finishing ${expiredRes.rows.length} expired PvP fights...`);

    for (const fight of expiredRes.rows) {
      // Determination logic (matches /api/pvp/:id/finish)
      let winnerId = null;
      if (fight.hp1 > fight.hp2) winnerId = fight.challenger_id;
      else if (fight.hp2 > fight.hp1) winnerId = fight.challenged_id;
      else {
        if (fight.damage1 > fight.damage2) winnerId = fight.challenger_id;
        else if (fight.damage2 > fight.damage1) winnerId = fight.challenged_id;
      }

      // Update DB
      await query(
        `UPDATE pvp_fights SET status = 'completed', winner_id = $1, ended_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [winnerId, fight.id]
      );

      // Record Event
      await query(
        'INSERT INTO pvp_events (fight_id, type, payload) VALUES ($1, $2, $3)',
        [fight.id, 'finish', JSON.stringify({ winnerId, reason: 'timeout_auto' })]
      );

      // Broadcast to any listeners
      broadcastPvP(fight.id, 'finish', { winnerId });
    }
  } catch (error) {
    console.error('Error in autoFinishExpiredFights:', error);
  }
}

import { query } from '../db.js';
import { sendPushNotification } from './pushNotifications.js';

/**
 * Daily "your rival overtook you" push (FOMO / winback-lite).
 *
 * Reuses the exact weekly-ranking rivalry logic that already powers
 * GET /social-feed/stats (social_feed.js): for each user, the "rival" is the
 * person one rank above them in this week's reps ranking. Here it is computed
 * set-based for ALL eligible users in a single query instead of per-request.
 *
 * Only notifies users who: have push enabled, are public, trained this week
 * (weekly_reps > 0 — relevant and active), are not rank 1, and whose rival is
 * genuinely ahead. RANK() (not DENSE_RANK) matches the live endpoint's
 * semantics exactly.
 */
export async function runRivalReminders() {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    const res = await query(
      `WITH weekly AS (
         SELECT u.id, u.name,
                COALESCE(SUM(CASE WHEN COALESCE(e.unit, 'reps') = 'seconds' THEN 0 ELSE r.count END), 0)::int AS weekly_reps,
                RANK() OVER (ORDER BY COALESCE(SUM(CASE WHEN COALESCE(e.unit, 'reps') = 'seconds' THEN 0 ELSE r.count END), 0) DESC) AS rank
         FROM users u
         LEFT JOIN reps r ON r.user_id = u.id AND r.date >= $1
         LEFT JOIN exercises e ON e.slug = r.exercise_type
         WHERE u.is_private = false
         GROUP BY u.id, u.name
       )
       SELECT DISTINCT ON (me.id)
              me.id AS user_id,
              riv.name AS rival_name,
              (riv.weekly_reps - me.weekly_reps)::int AS reps_diff
       FROM weekly me
       JOIN weekly riv ON riv.rank = me.rank - 1
       JOIN push_subscriptions ps ON ps.user_id = me.id
       JOIN users u ON u.id = me.id
       WHERE COALESCE(u.push_disabled, false) = false
         AND me.rank > 1
         AND me.weekly_reps > 0
         AND riv.weekly_reps > me.weekly_reps
       ORDER BY me.id, (riv.weekly_reps - me.weekly_reps) ASC`,
      [weekStartStr]
    );

    console.log(`[RIVAL_REMINDER] Elegibles: ${res.rows.length} usuarios.`);
    let sent = 0;

    for (const row of res.rows) {
      const diff = row.reps_diff;
      await sendPushNotification(row.user_id, {
        title: '¡Te han adelantado! 😤',
        body: `${row.rival_name} te saca ${diff} reps esta semana. ¿Vas a dejar que gane?`,
        data: { url: '/social', type: 'RIVAL_OVERTAKE' },
      });
      sent += 1;
    }

    console.log(`[RIVAL_REMINDER] Enviadas ${sent} notificaciones.`);
    return sent;
  } catch (error) {
    console.error('[RIVAL_REMINDER] Error:', error);
    throw error;
  }
}

import { query } from '../db.js';
import { sendPushNotification } from './pushNotifications.js';

/**
 * Winback pushes for lapsed users, at day 3 / 7 / 14 of inactivity.
 *
 * Today a user who misses a single day gets nothing ever again (D30 ≈ 3-8%).
 * This nudges them back with THEIR real data: the streak they had when they
 * stopped (computed via gaps-and-islands over their rep dates), falling back to
 * lifetime reps.
 *
 * Fires once a day (cron). A user hits each milestone exactly once because the
 * cron runs daily and the query targets `days_inactive IN (3,7,14)` — the day
 * the count equals 3, then 7, then 14. Users who never logged a rep are
 * excluded (no history to hook onto — winback is for people who engaged once).
 */
const WINBACK_STAGES = [3, 7, 14];

function buildMessage(name, stage, prevStreak, totalReps) {
  const who = name || 'Atleta';
  const streakHook = prevStreak >= 2;
  if (stage === 3) {
    return streakHook
      ? `${who}, hace 3 días que no entrenas. Tenías una racha de ${prevStreak} días — aún estás a tiempo de retomarla. 💪`
      : `${who}, hace 3 días que no entrenas. Una serie corta y vuelves al ruedo. 💪`;
  }
  if (stage === 7) {
    return `${who}, una semana sin entrenar. Tus ${totalReps} reps en Reppy te esperan. ¡Vuelve a la barra!`;
  }
  // stage 14
  return streakHook
    ? `${who}, dos semanas fuera. Tu yo de ${prevStreak} días de racha no se rendiría. Vuelve hoy.`
    : `${who}, dos semanas fuera. Un último empujón: retoma tu entrenamiento hoy.`;
}

// Length of the consecutive-day island that ends on the user's most recent rep
// date = the streak they had when they stopped training.
async function streakBeforeBreak(userId) {
  const res = await query(
    `WITH d AS (SELECT DISTINCT date FROM reps WHERE user_id = $1),
          grp AS (
            SELECT date,
                   date - (ROW_NUMBER() OVER (ORDER BY date))::int * INTERVAL '1 day' AS island
            FROM d
          )
     SELECT COUNT(*)::int AS streak
     FROM grp
     WHERE island = (SELECT island FROM grp ORDER BY date DESC LIMIT 1)`,
    [userId]
  );
  return res.rows[0]?.streak || 0;
}

export async function runWinbackReminders() {
  try {
    const result = await query(
      `SELECT ps.user_id, u.name, u.total_reps,
              (CURRENT_DATE - MAX(r.date))::int AS days_inactive
       FROM push_subscriptions ps
       JOIN users u ON ps.user_id = u.id
       JOIN reps r ON r.user_id = u.id
       WHERE COALESCE(u.push_disabled, false) = false
       GROUP BY ps.user_id, u.name, u.total_reps
       HAVING (CURRENT_DATE - MAX(r.date))::int = ANY($1)`,
      [WINBACK_STAGES]
    );

    console.log(`[WINBACK] Elegibles: ${result.rows.length} usuarios (D3/D7/D14).`);
    let sentCount = 0;

    for (const row of result.rows) {
      const stage = row.days_inactive;
      const prevStreak = await streakBeforeBreak(row.user_id);
      await sendPushNotification(row.user_id, {
        title: '¿Te has perdido? 🏋️',
        body: buildMessage(row.name, stage, prevStreak, row.total_reps || 0),
        data: { url: '/dashboard?log=1', type: 'WINBACK', stage },
      });
      sentCount += 1;
    }

    console.log(`[WINBACK] Enviadas ${sentCount} notificaciones.`);
    return sentCount;
  } catch (error) {
    console.error('[WINBACK] Error:', error);
    throw error;
  }
}

import { query } from '../db.js';
import { sendPushNotification } from './pushNotifications.js';
import { getStreakStatus } from './streak.js';

/**
 * Checks for users whose active streak is at risk and sends a focused reminder.
 */
export async function runStreakReminders() {
  try {
    const result = await query(`
      SELECT DISTINCT ps.user_id, u.name
      FROM push_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      WHERE COALESCE(u.push_disabled, false) = false
    `);

    console.log(`[STREAK_REMINDER] Revisando ${result.rows.length} usuarios con push activo.`);
    let sentCount = 0;

    for (const row of result.rows) {
      const status = await getStreakStatus(row.user_id);
      if (!status.showRisk) continue;

      await sendPushNotification(row.user_id, {
        title: 'Racha en riesgo',
        body: `${row.name}, te quedan ${status.hoursLeftToday} h para salvar tu racha de ${status.streak} dias.`,
        data: {
          url: '/dashboard?log=1',
          type: 'STREAK_REMINDER'
        }
      });
      sentCount += 1;
    }

    return sentCount;
  } catch (error) {
    console.error('[STREAK_REMINDER] Error:', error);
    throw error;
  }
}

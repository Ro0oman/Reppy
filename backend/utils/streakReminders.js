import { query } from '../db.js';
import { sendPushNotification } from './pushNotifications.js';

/**
 * Checks for users who haven't trained today and sends a reminder
 */
export async function runStreakReminders() {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Find users who have a push subscription but HAVEN'T trained today
    const result = await query(`
      SELECT DISTINCT ps.user_id, u.name 
      FROM push_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      WHERE ps.user_id NOT IN (
        SELECT user_id FROM reps WHERE date = $1
      )
    `, [today]);

    console.log(`[STREAK_REMINDER] Encontrados ${result.rows.length} usuarios para recordar.`);

    for (const row of result.rows) {
      // Logic: Only notify if they have a streak > 0 (to avoid spamming inactive users)
      // or just notify everyone with a sub. Let's stick to everyone with a sub for now.
      
      await sendPushNotification(row.user_id, {
        title: '🔥 ¡MANTÉN LA RACHA!',
        body: `${row.name}, aún no has registrado tus repeticiones de hoy. ¡No te rindas!`,
        data: {
          url: '/dashboard',
          type: 'STREAK_REMINDER'
        }
      });
    }

    return result.rows.length;
  } catch (error) {
    console.error('[STREAK_REMINDER] Error:', error);
    throw error;
  }
}

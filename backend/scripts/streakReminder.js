import { query } from '../db.js';
import { sendPushNotification } from '../utils/pushNotifications.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Checks for users who haven't trained today and sends a reminder
 */
async function runStreakReminders() {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Find users who have trained in the last 48h but NOT today
    // and have a push subscription
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
      console.log(`[STREAK_REMINDER] Enviando recordatorio a ${row.name} (${row.user_id})...`);
      
      await sendPushNotification(row.user_id, {
        title: '🔥 ¡NO PIERDAS TU RACHA!',
        body: `${row.name}, aún no has registrado tus repeticiones de hoy. ¡Dale caña!`,
        data: {
          url: '/dashboard',
          type: 'STREAK_REMINDER'
        }
      });
    }

    console.log('[STREAK_REMINDER] Proceso completado.');
    process.exit(0);
  } catch (error) {
    console.error('[STREAK_REMINDER] Error:', error);
    process.exit(1);
  }
}

runStreakReminders();

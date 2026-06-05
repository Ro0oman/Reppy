import { query } from '../db.js';
import { sendPushNotification } from './pushNotifications.js';

export async function runReferralReminders() {
  try {
    const result = await query(`
      SELECT DISTINCT ps.user_id
      FROM push_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      WHERE COALESCE(u.push_disabled, false) = false
    `);

    console.log(`[REFERRAL_REMINDER] Enviando a ${result.rows.length} usuarios.`);
    let sentCount = 0;

    for (const row of result.rows) {
      await sendPushNotification(row.user_id, {
        title: '¡Gana 50 gemas gratis!',
        body: 'Invita a amigos desde tu perfil, sección "Invita amigos", para ganar 50 gemas.',
        data: {
          url: '/profile',
          type: 'REFERRAL_REMINDER'
        }
      });
      sentCount += 1;
    }

    console.log(`[REFERRAL_REMINDER] Enviadas ${sentCount} notificaciones.`);
    return sentCount;
  } catch (error) {
    console.error('[REFERRAL_REMINDER] Error:', error);
    throw error;
  }
}

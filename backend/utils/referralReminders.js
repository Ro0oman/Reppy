import { query } from '../db.js';
import { sendPushNotification } from './pushNotifications.js';

export async function runReferralReminders() {
  try {
    // Segmented, one-shot referral nudge (was: blast to EVERY push-enabled user
    // twice a month — spam that burns the push channel). Only target users who:
    //   - have push enabled,
    //   - registered more than 7 days ago (established, not brand-new),
    //   - have trained in the last 14 days (active, not churned — winback owns those),
    //   - have never successfully referred anyone,
    //   - have not already received this reminder (referral_reminder_sent).
    // The `referral_reminder_sent` flag guarantees at most one send per user
    // ever, even though the cron fires twice a month.
    const result = await query(`
      SELECT DISTINCT ps.user_id
      FROM push_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      WHERE COALESCE(u.push_disabled, false) = false
        AND COALESCE(u.referral_reminder_sent, false) = false
        AND u.created_at < NOW() - INTERVAL '7 days'
        AND NOT EXISTS (SELECT 1 FROM users r WHERE r.referred_by = u.id)
        AND EXISTS (
          SELECT 1 FROM reps rp
          WHERE rp.user_id = u.id AND rp.date >= (CURRENT_DATE - INTERVAL '14 days')
        )
    `);

    console.log(`[REFERRAL_REMINDER] Elegibles: ${result.rows.length} usuarios.`);
    let sentCount = 0;
    const sentIds = [];

    for (const row of result.rows) {
      await sendPushNotification(row.user_id, {
        title: '¡Gana 50 gemas gratis!',
        body: 'Invita a amigos desde tu perfil, sección "Invita amigos", para ganar 50 gemas.',
        data: {
          url: '/profile',
          type: 'REFERRAL_REMINDER'
        }
      });
      sentIds.push(row.user_id);
      sentCount += 1;
    }

    // Mark as sent so no user ever receives this reminder twice.
    if (sentIds.length > 0) {
      await query(
        'UPDATE users SET referral_reminder_sent = true WHERE id = ANY($1)',
        [sentIds]
      );
    }

    console.log(`[REFERRAL_REMINDER] Enviadas ${sentCount} notificaciones.`);
    return sentCount;
  } catch (error) {
    console.error('[REFERRAL_REMINDER] Error:', error);
    throw error;
  }
}

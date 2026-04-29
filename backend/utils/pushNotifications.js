import webpush from 'web-push';
import dotenv from 'dotenv';
import { query } from '../db.js';

dotenv.config();

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@reppy.com';

if (!publicVapidKey || !privateVapidKey) {
  console.warn('[PUSH_NOTIFICATIONS] VAPID keys not found in environment variables.');
} else {
  webpush.setVapidDetails(
    vapidEmail,
    publicVapidKey,
    privateVapidKey
  );
}

/**
 * Sends a push notification to all subscriptions of a specific user.
 * 
 * @param {string} userId - ID of the user to notify.
 * @param {Object} payload - Notification data (title, body, icon, data).
 */
export async function sendPushNotification(userId, payload) {
  try {
    // 1. Get all subscriptions for this user
    const result = await query(
      'SELECT id, subscription_json FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return; // No subscriptions for this user
    }

    const payloadString = JSON.stringify(payload);

    // 2. Send to each subscription
    const sendPromises = result.rows.map(async (row) => {
      try {
        const subscription = JSON.parse(row.subscription_json);
        await webpush.sendNotification(subscription, payloadString);
      } catch (error) {
        // If subscription is expired or invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`[PUSH_NOTIFICATIONS] Subscription ${row.id} is invalid/expired. Removing.`);
          await query('DELETE FROM push_subscriptions WHERE id = $1', [row.id]);
        } else {
          console.error(`[PUSH_NOTIFICATIONS] Error sending to sub ${row.id}:`, error);
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    console.error('[PUSH_NOTIFICATIONS] Failed to process push notifications:', error);
  }
}

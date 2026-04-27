import { query } from '../db.js';
import { sendToUser } from '../socketManager.js';

/**
 * Creates a persistent notification for a user.
 * 
 * @param {string} userId - Recipient of the notification.
 * @param {string} type - 'LIKE', 'COMMENT', 'LEVEL_UP', 'NEW_CHEST', 'BOSS_DEFEATED'.
 * @param {string|null} actorId - ID of the user who triggered it.
 * @param {string} content - Message details.
 * @param {string|null} targetId - ID of the related object (date, item, etc).
 * @param {string|null} targetUserId - Owner of the activity (for deep-linking).
 */
export async function createNotification(userId, type, actorId, content, targetId = null, targetUserId = null) {
  // Don't notify yourself for your own actions (likes/comments)
  if (actorId && userId === actorId) return;

  try {
    await query(
      `INSERT INTO notifications (user_id, type, actor_id, content, target_id, target_user_id) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, type, actorId, content, targetId, targetUserId || userId]
    );

    // Emit live notification
    sendToUser(userId, 'notification', { type, actorId, content, targetId, targetUserId });
  } catch (error) {
    console.error('[NOTIFICATION_UTILS] Failed to create notification:', error);
  }
}

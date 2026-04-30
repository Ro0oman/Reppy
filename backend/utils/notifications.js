import { query } from '../db.js';
import { sendToUser } from '../socketManager.js';
import { sendPushNotification } from './pushNotifications.js';

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
    // 1. Fetch Actor Details (if actorId is present)
    let actorName = 'Reppy';
    let actorAvatar = null;
    
    if (actorId) {
      const actorRes = await query('SELECT name, avatar_url FROM users WHERE id = $1', [actorId]);
      if (actorRes.rows.length > 0) {
        actorName = actorRes.rows[0].name;
        actorAvatar = actorRes.rows[0].avatar_url;
      }
    }

    // 2. Save persistent notification
    await query(
      `INSERT INTO notifications (user_id, type, actor_id, content, target_id, target_user_id) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, type, actorId, content, targetId, targetUserId || userId]
    );

    // 3. Emit live notification (Socket)
    sendToUser(userId, 'notification', { type, actorId, content, targetId, targetUserId, actor_name: actorName, actor_avatar: actorAvatar });

    // 4. Send Web Push Notification with personality
    const typeConfigs = {
      'LIKE': { emoji: '💪', title: '¡Nuevo Like!' },
      'COMMENT': { emoji: '💬', title: 'Nuevo Comentario' },
      'LEVEL_UP': { emoji: '⭐', title: '¡Subida de Nivel!' },
      'NEW_CHEST': { emoji: '🎁', title: '¡Nuevo Cofre!' },
      'BOSS_DEFEATED': { emoji: '⚔️', title: '¡Jefe Derrotado!' },
      'PVP_CHALLENGE': { emoji: '🥊', title: 'Desafío PVP' }
    };

    const config = typeConfigs[type] || { emoji: '🔔', title: 'Reppy' };
    
    // Construct better push body
    let pushTitle = `${config.emoji} ${config.title}`;
    let pushBody = content;

    // If it's a LIKE or COMMENT, prefix with actor name if it's not already there
    if ((type === 'LIKE' || type === 'COMMENT') && actorName !== 'Reppy') {
      if (!pushBody.includes(actorName)) {
        pushBody = `${actorName} ${content}`;
      }
    }

    sendPushNotification(userId, {
      title: pushTitle,
      body: pushBody,
      icon: actorAvatar || 'https://reppy-weld.vercel.app/logo_reppy.png',
      badge: 'https://reppy-weld.vercel.app/logo_reppy_badge.png',
      data: {
        url: `/profile/${targetUserId || userId}`,
        type: type
      }
    });
  } catch (error) {
    console.error('[NOTIFICATION_UTILS] Failed to create notification:', error);
  }
}

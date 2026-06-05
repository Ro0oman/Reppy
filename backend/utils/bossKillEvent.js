import { query } from '../db.js';
import { sendPushNotification } from './pushNotifications.js';
import { broadcastBossKill } from '../socketManager.js';

/**
 * Called (fire-and-forget) right after a boss is defeated.
 * Creates the boss_kill_posts record, pushes to all subscribed users,
 * and broadcasts via Socket/Pusher.
 */
export async function createBossKillEvent(bossId, bossName, bossImage, killerUserId, killerName) {
  try {
    // 1. Top 3 damage dealers for this fight
    const top3Res = await query(
      `SELECT u.id, u.name, u.avatar_url, ep.damage_dealt
       FROM event_participants ep
       JOIN users u ON ep.user_id = u.id
       WHERE ep.boss_fight_id = $1
       ORDER BY ep.damage_dealt DESC
       LIMIT 3`,
      [bossId]
    );
    const top3 = top3Res.rows;

    // 2. Insert boss_kill_posts record
    const insertRes = await query(
      `INSERT INTO boss_kill_posts
         (boss_fight_id, boss_name, boss_image, killer_user_id, killer_name, top3)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (boss_fight_id) DO NOTHING
       RETURNING id, created_at`,
      [bossId, bossName, bossImage, killerUserId, killerName, JSON.stringify(top3)]
    );

    if (!insertRes.rows.length) return; // already processed (duplicate)

    const postId = insertRes.rows[0].id;
    const createdAt = insertRes.rows[0].created_at;

    const payload = {
      postId,
      bossId,
      bossName,
      bossImage,
      killerUserId,
      killerName,
      top3,
      createdAt,
    };

    // 3. Real-time broadcast to all connected clients
    broadcastBossKill(payload);

    // 4. Push to all subscribed users (fire and forget per user)
    const subsRes = await query(
      `SELECT DISTINCT user_id FROM push_subscriptions ps
       JOIN users u ON u.id = ps.user_id
       WHERE u.push_disabled IS NOT TRUE`,
      []
    );

    const pushPayload = {
      title: `☠️ ${bossName} ha caído`,
      body: `${killerName} dio el último golpe. ¡Ve a reclamar tu recompensa!`,
      icon: '/icon-192.png',
      data: { url: '/comunidad' },
    };

    // Send in parallel but don't block
    subsRes.rows.forEach(({ user_id }) => {
      sendPushNotification(user_id, pushPayload).catch(() => {});
    });
  } catch (err) {
    console.error('[BOSS_KILL_EVENT] Error creating boss kill event:', err);
  }
}

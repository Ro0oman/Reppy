import getPusher from './pusher.js';

// In-memory presence tracker (best-effort): entries older than 60s are filtered
// out on each broadcast. Real-time presence on the client is driven by Pusher's
// native `presence-global` channel; the `presence_update` event below is only a
// secondary/fallback signal. Socket.io was removed — it never worked on Vercel's
// serverless functions (no persistent connections), Pusher handles everything.
const activeUsers = new Map(); // userId -> { id, name, avatar_url, lastActive }

export const updatePresence = (user) => {
  if (!user || !user.id) return;
  activeUsers.set(user.id, {
    id: user.id,
    name: user.name,
    avatar_url: user.avatar_url,
    lastActive: Date.now()
  });
  broadcastPresence();
};

export const broadcastPresence = () => {
  const users = Array.from(activeUsers.values()).filter(u => Date.now() - u.lastActive < 60000);

  const pusher = getPusher();
  if (pusher) {
    pusher.trigger("presence-global", "presence_update", users).catch(err => {
      console.error('[PUSHER] Error broadcasting presence:', err.message);
    });
  }
};

export const sendToUser = (userId, event, data) => {
  const pusher = getPusher();
  if (pusher) {
    pusher.trigger(`private-user-${userId}`, event, data).catch(err => {
      console.warn('[PUSHER] Error sending to user:', err.message);
    });
  }
};

export const broadcastPvP = (fightId, type, data) => {
  const payload = { type, ...data };
  const pusher = getPusher();
  if (pusher) {
    pusher.trigger(`presence-pvp-${fightId}`, "pvp_event", payload).catch(err => {
      console.error('[PUSHER] Error broadcasting PvP:', err.message);
    });
  }
};

export const broadcastDamage = (damageData) => {
  const pusher = getPusher();
  if (pusher) {
    pusher.trigger("global-events", "boss_damage", damageData).catch(err => {
      console.warn('[PUSHER] Error broadcasting damage:', err.message);
    });
  }

  if (damageData.userId && activeUsers.has(damageData.userId)) {
    const user = activeUsers.get(damageData.userId);
    user.lastActive = Date.now();
    broadcastPresence();
  }
};

export const broadcastBossKill = (payload) => {
  const pusher = getPusher();
  if (pusher) {
    pusher.trigger('global-events', 'boss_kill', payload).catch(err => {
      console.warn('[PUSHER] Error broadcasting boss_kill:', err.message);
    });
  }
};

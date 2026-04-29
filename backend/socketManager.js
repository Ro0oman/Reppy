import { Server } from 'socket.io';
import pusher from './pusher.js';

let io;
const activeUsers = new Map(); // userId -> { name, lastActive }
const userSockets = new Map(); // userId -> Set of socketIds

export const initSocket = (server) => {
  // We keep Socket.io for local development compatibility if needed
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_battle', (user) => {
      if (user && user.id) {
        socket.userId = user.id;
        
        if (!userSockets.has(user.id)) {
          userSockets.set(user.id, new Set());
        }
        userSockets.get(user.id).add(socket.id);

        activeUsers.set(user.id, { 
          id: user.id,
          name: user.name, 
          avatar_url: user.avatar_url,
          lastActive: Date.now() 
        });
        broadcastPresence();
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        if (userSockets.has(socket.userId)) {
          userSockets.get(socket.userId).delete(socket.id);
          if (userSockets.get(socket.userId).size === 0) {
            userSockets.delete(socket.userId);
          }
        }

        setTimeout(() => {
            const user = activeUsers.get(socket.userId);
            if (user && Date.now() - user.lastActive > 30000) {
                activeUsers.delete(socket.userId);
                broadcastPresence();
            }
        }, 30000);
      }
    });
  });

  return io;
};

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

// --- PUSHER INTEGRATION ---
// We use Pusher for production broadcasts
export const broadcastPresence = () => {
  const users = Array.from(activeUsers.values()).filter(u => Date.now() - u.lastActive < 60000);
  
  // Broadcast via Socket.io (local)
  if (io) io.emit('presence_update', users);
  
  // Broadcast via Pusher (production)
  pusher.trigger("presence-global", "presence_update", users).catch(err => {
    console.error('[PUSHER] Error broadcasting presence:', err.message);
  });
};

export const sendToUser = (userId, event, data) => {
  // Send via Socket.io
  if (io && userSockets.has(userId)) {
    const sockets = userSockets.get(userId);
    sockets.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
  }
  
  // Send via Pusher (private channel)
  pusher.trigger(`private-user-${userId}`, event, data).catch(err => {
    console.warn('[PUSHER] Error sending to user:', err.message);
  });
};

export const broadcastPvP = (fightId, type, data) => {
  const payload = { type, ...data };
  if (io) io.to(`pvp_${fightId}`).emit('pvp_event', payload);
  
  pusher.trigger(`presence-pvp-${fightId}`, "pvp_event", payload).catch(err => {
    console.error('[PUSHER] Error broadcasting PvP:', err.message);
  });
};

export const broadcastDamage = (damageData) => {
  if (io) io.emit('boss_damage', damageData);
  
  pusher.trigger("global-events", "boss_damage", damageData).catch(err => {
    console.warn('[PUSHER] Error broadcasting damage:', err.message);
  });
  
  if (damageData.userId && activeUsers.has(damageData.userId)) {
    const user = activeUsers.get(damageData.userId);
    user.lastActive = Date.now();
    broadcastPresence();
  }
};

export const getIO = () => io;

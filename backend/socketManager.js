import { Server } from 'socket.io';

let io;
const activeUsers = new Map(); // userId -> { name, lastActive }
const userSockets = new Map(); // userId -> Set of socketIds

export const initSocket = (server) => {
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
        
        // Track socket for targeted messaging
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

    // PvP Room logic
    socket.on('join_pvp', (fightId) => {
      socket.join(`pvp_${fightId}`);
      console.log(`User joined PvP room: pvp_${fightId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (socket.userId) {
        // Remove socket from tracking
        if (userSockets.has(socket.userId)) {
          userSockets.get(socket.userId).delete(socket.id);
          if (userSockets.get(socket.userId).size === 0) {
            userSockets.delete(socket.userId);
          }
        }

        // We could keep them for a while, but for "live" we can remove or set timeout
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

export const broadcastPresence = () => {
  if (!io) return;
  const users = Array.from(activeUsers.values()).filter(u => Date.now() - u.lastActive < 60000);
  io.emit('presence_update', users);
};

export const sendToUser = (userId, event, data) => {
  if (io && userSockets.has(userId)) {
    const sockets = userSockets.get(userId);
    sockets.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
  }
};

export const broadcastPvP = (fightId, type, data) => {
  if (io) {
    io.to(`pvp_${fightId}`).emit('pvp_event', { type, ...data });
  }
};

export const broadcastDamage = (damageData) => {
  if (!io) return;
  io.emit('boss_damage', damageData);
  
  // Also update lastActive for the user who did damage
  if (damageData.userId && activeUsers.has(damageData.userId)) {
    const user = activeUsers.get(damageData.userId);
    user.lastActive = Date.now();
    broadcastPresence();
  }
};

export const getIO = () => io;

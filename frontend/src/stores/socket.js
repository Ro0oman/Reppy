import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { useAuthStore } from './auth';
import { useDamageStore } from './damage';
import { useNotificationStore } from './notification';

export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: null,
    connected: false,
    activeOperatives: []
  }),
  actions: {
    init() {
      if (this.socket) return;

      const authStore = useAuthStore();
      // Use VITE_API_URL if available, otherwise fallback to same host
      const apiURL = import.meta.env.VITE_API_URL || '';
      const socketHost = apiURL || (window.location.origin.includes('localhost') 
        ? 'http://localhost:5000' 
        : window.location.origin);

      this.socket = io(socketHost, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        this.connected = true;
        if (authStore.user) {
          this.socket.emit('join_battle', {
            id: authStore.user.id,
            name: authStore.user.name,
            avatar_url: authStore.user.avatar_url
          });
        }
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
      });

      this.socket.on('presence_update', (users) => {
        this.activeOperatives = users;
      });

      this.socket.on('boss_damage', (data) => {
        const authStore = useAuthStore();
        const damageStore = useDamageStore();
        
        // Only show damage from OTHER users to avoid double numbers
        if (data.userId !== authStore.user?.id) {
          // Trigger the global damage animation
          damageStore.addDamage(data.amount, data.exerciseType, undefined, undefined, data.isCrit, data.userName, data.userId);
        }
      });

      this.socket.on('notification', (data) => {
        const notificationStore = useNotificationStore();
        // Format the message nicely for the toast
        const message = `${data.content}`;
        notificationStore.notify(message, 'info');
      });
    },
    disconnect() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.connected = false;
      }
    }
  }
});

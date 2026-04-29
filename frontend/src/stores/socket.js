import { defineStore } from 'pinia';
import Pusher from 'pusher-js';
import { useAuthStore } from './auth';
import { useDamageStore } from './damage';
import { useNotificationStore } from './notification';

export const useSocketStore = defineStore('socket', {
  state: () => ({
    pusher: null,
    connected: false,
    activeOperatives: [],
    channels: {}
  }),
  actions: {
    init() {
      if (this.pusher) return;

      const authStore = useAuthStore();
      const apiURL = import.meta.env.VITE_API_URL || '';
      
      this.pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        forceTLS: true,
        authEndpoint: `${apiURL}/api/pusher/auth`,
        auth: {
          params: {
            user_id: authStore.user?.id,
            user_name: authStore.user?.name
          }
        }
      });

      this.pusher.connection.bind('connected', () => {
        this.connected = true;
        console.log('[PUSHER] Connected');
        
        // Signal presence to backend (since Pusher doesn't have a direct "join" event like Socket.io)
        // We do this via a regular API call or just by being active
        if (authStore.user) {
          this.syncPresence();
        }
      });

      this.pusher.connection.bind('disconnected', () => {
        this.connected = false;
      });

      // 1. Global Presence Channel
      const presenceChannel = this.pusher.subscribe('reppy-global-presence');
      this.channels.presence = presenceChannel;
      
      presenceChannel.bind('presence_update', (users) => {
        this.activeOperatives = users;
      });

      // 2. Global Events (Boss Damage)
      const eventsChannel = this.pusher.subscribe('global-events');
      this.channels.events = eventsChannel;
      
      eventsChannel.bind('boss_damage', (data) => {
        const damageStore = useDamageStore();
        if (data.userId !== authStore.user?.id) {
          damageStore.addDamage(data.amount, data.exerciseType, undefined, undefined, data.isCrit, data.userName, data.userId);
        }
      });

      // 3. Private User Channel
      if (authStore.user) {
        const userChannel = this.pusher.subscribe(`private-user-${authStore.user.id}`);
        this.channels.user = userChannel;
        
        userChannel.bind('notification', (data) => {
          const notificationStore = useNotificationStore();
          notificationStore.notify(data.content, 'info');
        });
      }
    },

    async syncPresence() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;
      
      // We can use a lightweight endpoint just to say "I'm here"
      try {
        await fetch(`${import.meta.env.VITE_API_URL || ''}/api/test/ping`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({ userId: authStore.user.id })
        });
      } catch (e) {
        console.warn('[PUSHER] Failed to sync presence:', e);
      }
    },

    disconnect() {
      if (this.pusher) {
        Object.values(this.channels).forEach(channel => {
          this.pusher.unsubscribe(channel.name);
        });
        this.pusher.disconnect();
        this.pusher = null;
        this.connected = false;
        this.channels = {};
      }
    }
  }
});

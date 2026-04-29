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
            user_name: authStore.user?.name,
            avatar_url: authStore.user?.avatar_url
          }
        }
      });

      this.pusher.connection.bind('connected', () => {
        this.connected = true;
        console.log('[PUSHER] Connected');
        if (authStore.user) {
          this.syncPresence();
        }
      });

      this.pusher.connection.bind('disconnected', () => {
        this.connected = false;
      });

      // 1. Global Presence Channel (NATIVE)
      const presenceChannel = this.pusher.subscribe('presence-global');
      this.channels.presence = presenceChannel;
      
      const updateActiveOperatives = () => {
        const members = [];
        presenceChannel.members.each((member) => {
          members.push({
            id: member.id,
            name: member.info.name,
            avatar_url: member.info.avatar_url,
            lastActive: Date.now()
          });
        });
        this.activeOperatives = members;
      };

      presenceChannel.bind('pusher:subscription_succeeded', updateActiveOperatives);
      presenceChannel.bind('pusher:member_added', updateActiveOperatives);
      presenceChannel.bind('pusher:member_removed', updateActiveOperatives);
      
      // Fallback for manual updates if needed
      presenceChannel.bind('presence_update', (users) => {
        if (!this.activeOperatives.length) this.activeOperatives = users;
      });

      // 2. Global Events (Boss Damage)
      const eventsChannel = this.pusher.subscribe('global-events');
      this.channels.events = eventsChannel;
      
      eventsChannel.bind('boss_damage', (data) => {
        const damageStore = useDamageStore();
        const notificationStore = useNotificationStore();

        if (data.type === 'LAST_HIT') {
          const isMe = data.userId === authStore.user?.id;
          const msg = isMe 
            ? `¡HAS ASESADO EL GOLPE DE GRACIA! ${data.reward?.message || ''}`
            : `¡${data.userName} ha asestado el GOLPE DE GRACIA a ${data.bossName}!`;
          
          notificationStore.notify(msg, isMe ? 'success' : 'info', 10000);
          return;
        }

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

    subscribeToPvp(fightId, onEvent) {
      if (!this.pusher) this.init();
      const channelName = `presence-pvp-${fightId}`;
      const channel = this.pusher.subscribe(channelName);
      channel.bind('pvp_event', onEvent);
      this.channels[channelName] = channel;
      return channel;
    },

    unsubscribeFromPvp(fightId) {
      const channelName = `presence-pvp-${fightId}`;
      if (this.pusher && this.channels[channelName]) {
        this.pusher.unsubscribe(channelName);
        delete this.channels[channelName];
      }
    },

    async syncPresence() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;
      
      try {
        await fetch(`${import.meta.env.VITE_API_URL || ''}/api/test/ping`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({ 
            userId: authStore.user.id,
            avatar_url: authStore.user.avatar_url 
          })
        });
      } catch (e) {
        console.warn('[PUSHER] Failed to sync presence:', e);
      }
    },

    disconnect() {
      if (this.pusher) {
        Object.keys(this.channels).forEach(name => {
          this.pusher.unsubscribe(name);
        });
        this.pusher.disconnect();
        this.pusher = null;
        this.connected = false;
        this.channels = {};
      }
    }
  }
});

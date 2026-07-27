import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import { useDamageStore } from './damage';
import { useNotificationStore } from './notification';

// Conexión en curso, compartida entre llamadas. `init()` dejó de ser síncrona al
// pasar pusher-js a import diferido, así que un simple flag booleano no bastaba:
// quien llama mientras la conexión está en vuelo tiene que poder esperarla (es lo
// que hace `subscribeToPvp`, que si no se encontraba `pusher` todavía a null).
let connectPromise = null;

// Cada `disconnect()` invalida las conexiones en vuelo. Sin esto, un logout
// ocurrido mientras se resuelve el import dejaría montada la conexión anterior
// (autenticada con el token viejo) al terminar `connect()`.
let generation = 0;

export const useSocketStore = defineStore('socket', {
  state: () => ({
    pusher: null,
    connected: false,
    activeOperatives: [],
    channels: {}
  }),
  actions: {
    // Devuelve siempre una promesa que resuelve cuando `this.pusher` está listo
    // (o cuando se sabe que no va a estarlo). Es idempotente y seguro en paralelo.
    init() {
      if (this.pusher) return Promise.resolve();
      if (!connectPromise) {
        connectPromise = this.connect().finally(() => { connectPromise = null; });
      }
      return connectPromise;
    },

    async connect() {
      // pusher-js (~60 KB) se carga bajo demanda: si estuviera en el import
      // estático entraría en el chunk `vendor` que precargan TODAS las páginas,
      // incluidas la landing y el blog públicos. Aquí sale del camino crítico.
      const myGeneration = generation;
      let Pusher;
      try {
        ({ default: Pusher } = await import('pusher-js'));
      } catch (err) {
        console.error('[PUSHER] No se pudo cargar pusher-js:', err);
        return;
      }
      // Hubo un disconnect() mientras cargaba el módulo: esta conexión ya no vale.
      if (myGeneration !== generation) return;

      const authStore = useAuthStore();
      // Use relative path in production, or the env var in development
      const apiURL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || '');
      
      console.log(`[PUSHER v6] Initializing with User: ${authStore.user?.name} (ID: ${authStore.user?.id})`);

      const pusherKey = import.meta.env.VITE_PUSHER_KEY || 'dummy_key';
      this.pusher = new Pusher(pusherKey, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'mt1',
        forceTLS: true,
        authEndpoint: `${apiURL}/api/pusher/auth`,
        auth: {
          // The backend now derives identity from this JWT, not from body
          // params, so a client cannot impersonate another user on realtime
          // channels. Identity params are intentionally no longer sent.
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      });


      console.log('[PUSHER] Instance created, auth endpoint:', `${apiURL}/api/pusher/auth`);

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
      console.log('[PUSHER] Attempting to subscribe to presence-global...');
      const presenceChannel = this.pusher.subscribe('presence-global');
      this.channels.presence = presenceChannel;
      
      const updateActiveOperatives = () => {
        const members = [];
        console.log(`[PUSHER PRESENCE] Member update event. Current count: ${presenceChannel.members.count}`);
        presenceChannel.members.each((member) => {
          console.log(`[PUSHER MEMBER] Online: ${member.info.name} (ID: ${member.id})`, member.info.avatar_url ? 'With Avatar' : 'No Avatar');
          members.push({
            id: member.id,
            name: member.info.name,
            avatar_url: member.info.avatar_url,
            level: member.info.level || 1,
            lastActive: Date.now()
          });

        });

        this.activeOperatives = members;
      };

      presenceChannel.bind('pusher:subscription_succeeded', () => {
        console.log('[PUSHER] Subscription to presence-global SUCCEEDED');
        updateActiveOperatives();
      });
      
      presenceChannel.bind('pusher:member_added', (member) => {
        console.log(`[PUSHER] Member ADDED: ${member.info.name}`);
        updateActiveOperatives();
      });
      
      presenceChannel.bind('pusher:member_removed', (member) => {
        console.log(`[PUSHER] Member REMOVED: ${member.info.name}`);
        updateActiveOperatives();
      });
      
      presenceChannel.bind('pusher:subscription_error', (error) => {
        console.error('[PUSHER PRESENCE ERROR] Subscription failed:', error);
      });
      
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

      // 3. Boss Kill Event
      eventsChannel.bind('boss_kill', (data) => {
        const notificationStore = useNotificationStore();
        const isKiller = data.killerUserId === authStore.user?.id;
        const msg = isKiller
          ? `👑 ¡Has dado el último golpe a ${data.bossName}! Mira el feed.`
          : `☠️ ¡${data.bossName} ha caído! ${data.killerName} asestó el golpe final.`;
        notificationStore.notify(msg, isKiller ? 'success' : 'info', 8000);
      });

      // 4. Private User Channel
      if (authStore.user) {
        const userChannel = this.pusher.subscribe(`private-user-${authStore.user.id}`);
        this.channels.user = userChannel;
        
        userChannel.bind('notification', (data) => {
          const notificationStore = useNotificationStore();
          notificationStore.notify(data.content, 'info');
        });
      }
    },

    // async porque `init()` ahora carga pusher-js en diferido: sin el await,
    // `this.pusher` seguiría a null aquí y el subscribe reventaría.
    async subscribeToPvp(fightId, onEvent) {
      if (!this.pusher) await this.init();
      if (!this.pusher) {
        console.error('[PVP] Sin conexión de Pusher, no se puede suscribir al combate');
        return null;
      }
      const channelName = `presence-pvp-${fightId}`;
      const channel = this.pusher.subscribe(channelName);
      channel.bind('pvp_event', onEvent);
      this.channels[channelName] = channel;
      console.log(`[PVP] Subscribed to channel: ${channelName}`);
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
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/test/ping`, {
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
        if (res.ok) {
          console.log('[PRESENCE] Sync successful');
        } else {
          console.warn('[PRESENCE] Sync failed with status:', res.status);
        }
      } catch (e) {
        console.warn('[PUSHER] Failed to sync presence:', e);
      }
    },

    disconnect() {
      generation += 1;
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

<template>
  <div class="p-0 border border-border bg-surface backdrop-blur-3xl rounded-[2rem] w-[400px] max-w-[calc(100vw-40px)] shadow-2xl relative transition-all flex flex-col overflow-hidden">
    <div class="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-foreground/[0.02]">
      <div class="flex items-center gap-3">
        <Bell class="w-4 h-4 text-primary-500" />
        <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">NOTIFICATIONS.LOG</h3>
      </div>
      <button 
        v-if="store.unreadCount > 0"
        @click="store.markAllAsRead" 
        class="text-[9px] font-black text-primary-500 uppercase tracking-widest hover:text-primary-400 transition-colors"
      >
        Limpiar todo
      </button>
    </div>

    <div class="max-h-[450px] overflow-y-auto custom-scrollbar">
      <div v-if="store.loading && store.notifications.length === 0" class="p-12 flex flex-col items-center justify-center gap-4">
        <div class="w-6 h-6 border-2 border-primary-500/20 border-t-primary-500 animate-spin rounded-full"></div>
      </div>

      <div v-else-if="store.notifications.length === 0" class="p-16 text-center space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-surface/5 flex items-center justify-center mx-auto">
          <PartyPopper class="w-6 h-6 text-muted/20" />
        </div>
        <p class="text-[9px] font-black text-muted uppercase tracking-[0.4em]">Zero anomalies detected</p>
      </div>

      <TransitionGroup name="list">
        <div v-for="notif in store.notifications" :key="notif.id"
          class="px-6 py-5 border-b border-border/10 last:border-0 hover:bg-foreground/[0.03] transition-all relative flex gap-4 items-start cursor-pointer"
          @click="handleNotifClick(notif)"
        >
          <!-- Unread Indicator -->
          <div v-if="!notif.is_read" class="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-full"></div>

          <!-- Actor Avatar or Type Icon -->
          <div class="relative shrink-0">
            <template v-if="notif.actor_avatar">
              <AvatarFrame :src="notif.actor_avatar" :size="36" />
            </template>
            <div v-else class="w-9 h-9 rounded-xl bg-surface/5 flex items-center justify-center border border-border/50">
              <component :is="getIcon(notif.type)" class="w-4 h-4" :class="getIconColor(notif.type)" />
            </div>
          </div>

          <!-- Content -->
          <div class="space-y-1 py-1 flex-1" :class="{ 'opacity-60': notif.is_read }">
            <p class="text-[11px] font-semibold leading-relaxed text-foreground">
              <span v-if="notif.actor_name" class="font-black uppercase tracking-tight text-primary-500 mr-1">{{ notif.actor_name }}</span>
              {{ notif.content }}
            </p>
            <p class="text-[9px] font-black text-muted uppercase tracking-widest opacity-40">{{ formatTime(notif.created_at) }}</p>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Footer: System Link -->
    <button 
      @click="handleRegistryClick" 
      class="w-full py-5 text-center bg-surface/5 hover:bg-surface/10 border-t border-border transition-all cursor-pointer group"
    >
       <span class="text-[9px] font-black text-muted group-hover:text-primary-500 uppercase tracking-[0.3em] transition-colors">ACCEDER AL REGISTRO CENTRAL</span>
    </button>
  </div>
</template>

<script setup>
import { Bell, BicepsFlexed, MessageSquare, Trophy, Package, Swords, PartyPopper } from 'lucide-vue-next';
import { useNotificationsStore } from '../stores/notifications';
import { useI18nStore } from '../stores/i18n';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { es, enUS } from 'date-fns/locale';
import AvatarFrame from './AvatarFrame.vue';

const store = useNotificationsStore();
const i18n = useI18nStore();
const authStore = useAuthStore();
const router = useRouter();

const emit = defineEmits(['close']);

const getIcon = (type) => {
  switch (type) {
    case 'LIKE': return BicepsFlexed;
    case 'COMMENT': return MessageSquare;
    case 'LEVEL_UP': return Trophy;
    case 'NEW_CHEST': return Package;
    case 'BOSS_DEFEATED': return Swords;
    case 'PVP_CHALLENGE': return Swords;
    case 'MISSION_COMPLETED': return Target;
    default: return Bell;
  }
};

const getIconColor = (type) => {
  switch (type) {
    case 'LIKE': return 'text-amber-500';
    case 'COMMENT': return 'text-blue-500';
    case 'LEVEL_UP': return 'text-yellow-500';
    case 'NEW_CHEST': return 'text-primary-500';
    case 'PVP_CHALLENGE': return 'text-primary-500';
    case 'MISSION_COMPLETED': return 'text-emerald-500';
    default: return 'text-muted';
  }
};

const formatTime = (date) => {
  return formatDistanceToNow(new Date(date), { 
    addSuffix: true,
    locale: i18n.locale === 'es' ? es : enUS
  });
};

const handleNotifClick = (notif) => {
  store.markAsRead(notif.id);
  
  if (notif.type === 'LIKE' || notif.type === 'COMMENT') {
    const targetUser = notif.target_user_id || notif.user_id;

    router.push({ 
      name: 'social', 
      query: { 
        date: notif.target_id, 
        user: targetUser,
        action: notif.type === 'COMMENT' ? 'comment' : null
      } 
    });
  } else if (notif.type === 'NEW_CHEST') {
    router.push('/inventory');
  } else if (notif.type === 'LEVEL_UP') {
    router.push('/profile');
  } else if (notif.type === 'BOSS_DEFEATED') {
    router.push('/dashboard');
  } else if (notif.type === 'PVP_CHALLENGE') {
    router.push({ name: 'pvp', params: { id: notif.target_id } });
  } else if (notif.type === 'MISSION_COMPLETED') {
    router.push('/missions');
  }

  emit('close');
};

const handleRegistryClick = () => {
    emit('close');
    router.push('/notifications');
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--primary-500-rgb), 0.1);
  border-radius: 10px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>

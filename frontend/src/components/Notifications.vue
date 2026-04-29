<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="mb-12 space-y-2">
      <h1 class="text-4xl font-black text-foreground uppercase italic tracking-tighter">NOTIFICACIONES</h1>
      <p class="text-[12px] font-black text-muted uppercase tracking-[0.4em]">REGISTRO CENTRAL DE INTERACCIONES</p>
    </div>

    <div class="card-stats p-0 border-border bg-surface/20 backdrop-blur-3xl overflow-hidden min-h-[600px]">
      <div class="px-8 py-6 border-b border-border/40 flex items-center justify-between bg-foreground/[0.02]">
        <div class="flex items-center gap-4">
          <Bell class="w-5 h-5 text-primary-500" />
          <span class="text-xs font-black uppercase tracking-widest text-foreground">{{ i18n.t('notif_anomalies') }}: {{ store.unreadCount }}</span>
        </div>
        <button 
          v-if="store.unreadCount > 0"
          @click="store.markAllAsRead" 
          class="px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Limpiar todos los registros
        </button>
      </div>

      <div v-if="store.loading && store.notifications.length === 0" class="py-32 flex flex-col items-center justify-center gap-6">
        <div class="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 animate-spin rounded-full"></div>
        <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Sincronizando log...</p>
      </div>

      <div v-else-if="store.notifications.length === 0" class="py-32 text-center space-y-6">
        <div class="w-16 h-16 rounded-3xl bg-surface/5 flex items-center justify-center mx-auto border border-border/20">
          <PartyPopper class="w-8 h-8 text-muted/20" />
        </div>
        <p class="text-xs font-black text-muted uppercase tracking-[0.4em]">Sin actividad reciente en el registro</p>
      </div>

      <div class="divide-y divide-border/20">
        <div v-for="notif in store.notifications" :key="notif.id"
          class="px-8 py-6 hover:bg-foreground/[0.03] transition-all relative flex gap-6 items-center cursor-pointer"
          :class="!notif.is_read ? 'bg-primary-500/[0.03]' : 'opacity-60'"
          @click="handleNotifClick(notif)"
        >
          <div v-if="!notif.is_read" class="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 shadow-[0_0_15px_rgba(255,69,0,0.5)]"></div>

          <div class="relative shrink-0">
            <template v-if="notif.actor_avatar">
              <AvatarFrame :src="notif.actor_avatar" :size="48" />
            </template>
            <div v-else class="w-12 h-12 rounded-2xl bg-surface/5 flex items-center justify-center border border-border/50">
              <component :is="getIcon(notif.type)" class="w-5 h-5" :class="getIconColor(notif.type)" />
            </div>
          </div>

          <div class="flex-1 space-y-1">
            <p class="text-sm font-medium leading-relaxed text-foreground">
              <span v-if="notif.actor_name" class="font-black uppercase tracking-tight text-primary-500 mr-2">{{ notif.actor_name }}</span>
              {{ notif.content }}
            </p>
            <p class="text-[10px] font-black text-muted uppercase tracking-widest opacity-50">{{ formatTime(notif.created_at) }}</p>
          </div>
          
          <ChevronRight class="w-5 h-5 text-muted/30 group-hover:text-primary-500 transition-colors" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Bell, BicepsFlexed, MessageSquare, Trophy, Package, Swords, PartyPopper, ChevronRight } from 'lucide-vue-next';
import { useNotificationsStore } from '../stores/notifications';
import { useI18nStore } from '../stores/i18n';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { es } from 'date-fns/locale/es';
import { enUS } from 'date-fns/locale/en-US';
import AvatarFrame from './AvatarFrame.vue';

const store = useNotificationsStore();
const i18n = useI18nStore();
const router = useRouter();
const route = useRoute();
const emit = defineEmits(['start', 'viewProfile']);

const getIcon = (type) => {
  switch (type) {
    case 'LIKE': return BicepsFlexed;
    case 'COMMENT': return MessageSquare;
    case 'LEVEL_UP': return Trophy;
    case 'NEW_CHEST': return Package;
    case 'BOSS_DEFEATED': return Swords;
    case 'PVP_CHALLENGE': return Swords;
    default: return Bell;
  }
};

const getIconColor = (type) => {
  switch (type) {
    case 'LIKE': return 'text-amber-500';
    case 'COMMENT': return 'text-primary-500';
    case 'LEVEL_UP': return 'text-yellow-500';
    case 'NEW_CHEST': return 'text-green-500';
    case 'PVP_CHALLENGE': return 'text-primary-500';
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
    router.push({ 
      name: 'social', 
      query: { 
        date: notif.target_id, 
        user: notif.target_user_id || notif.user_id,
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
    const lang = route.params.lang || i18n.locale || 'es';
    router.push(`/${lang}/pvp/${notif.target_id}`);
  }
};

onMounted(() => {
  store.fetchNotifications();
});
</script>

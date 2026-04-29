<template>
  <div class="flex flex-col gap-4 p-2 relative">
    
    <!-- Timeframe & Filter Controls (Tactical & Compact) -->
    <div class="flex flex-col sm:flex-row items-center gap-2 relative z-10 px-1">
      <!-- Friends vs Global -->
      <div v-if="authStore.isAuthenticated" class="flex p-0.5 bg-foreground/5 rounded-lg border border-border/40 w-full sm:w-auto">
        <button 
          @click="type = 'friends'"
          class="flex-1 sm:px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-md relative z-10"
          :class="type === 'friends' ? 'text-primary-400 bg-foreground/5 shadow-sm' : 'text-muted/60 hover:text-foreground'"
        >
          {{ i18n.t('lb_friends') }}
        </button>
        <button 
          @click="type = 'global'"
          class="flex-1 sm:px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-md relative z-10"
          :class="type === 'global' ? 'text-primary-400 bg-foreground/5 shadow-sm' : 'text-muted/60 hover:text-foreground'"
        >
          {{ i18n.t('lb_global') }}
        </button>
      </div>

      <!-- Timeframe -->
      <div class="flex flex-1 p-0.5 bg-foreground/5 border border-border/40 rounded-lg overflow-x-auto no-scrollbar w-full">
        <button 
          v-for="tf in ['today', 'week', 'month', 'year', 'all']" 
          :key="tf"
          @click="timeframe = tf"
          class="flex-1 min-w-[50px] py-1.5 text-[8px] font-black uppercase tracking-widest transition-all rounded-md relative z-10"
          :class="timeframe === tf ? 'text-primary-400 bg-foreground/5 shadow-sm' : 'text-muted/60 hover:text-foreground'"
        >
          {{ i18n.t('tf_' + tf) }}
        </button>
      </div>
    </div>

    <!-- Podium Section (Flatter & Horizontal) -->
    <div v-if="!loading && podiumUsers.length > 0" class="flex items-center justify-center gap-4 sm:gap-12 py-4 mb-2 relative z-10 bg-foreground/[0.02] rounded-2xl border border-border/40">
      <!-- 2nd Place -->
      <button v-if="podiumUsers[1]" 
        @click="$emit('viewProfile', podiumUsers[1].id)"
        class="flex flex-col items-center group cursor-pointer transition-all active:scale-95 outline-none rounded-xl p-1">
        <div class="relative mb-2">
          <div class="p-0.5 rounded-full bg-zinc-500/20 ring-1 ring-zinc-500/40">
            <AvatarFrame :src="podiumUsers[1].avatar_url" :border-css="podiumUsers[1].border_css" :avatar-css="podiumUsers[1].avatar_css" :size="48" />
          </div>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-zinc-600 rounded-full flex items-center justify-center border border-background shadow-lg">
             <span class="text-[8px] font-black text-white">2</span>
          </div>
        </div>
        <p class="text-[9px] font-black text-muted uppercase tracking-tighter truncate w-16 text-center leading-none">{{ podiumUsers[1].name }}</p>
        <span class="text-xs font-black text-foreground italic mt-1">{{ podiumUsers[1].total_reps }}</span>
      </button>

      <!-- 1st Place -->
      <button v-if="podiumUsers[0]" 
        @click="$emit('viewProfile', podiumUsers[0].id)"
        class="flex flex-col items-center group cursor-pointer transition-all active:scale-95 outline-none rounded-xl p-1 scale-110">
        <div class="relative mb-2">
          <div class="absolute -top-4 left-1/2 -translate-x-1/2 text-xl drop-shadow-lg">👑</div>
          <div class="p-1 rounded-full bg-primary-500/20 ring-2 ring-primary-500/40 shadow-[0_0_20px_rgba(255,69,0,0.15)]">
            <AvatarFrame :src="podiumUsers[0].avatar_url" :border-css="podiumUsers[0].border_css" :avatar-css="podiumUsers[0].avatar_css" :size="60" />
          </div>
          <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center border-2 border-background shadow-xl">
             <span class="text-[10px] font-black text-white">1</span>
          </div>
        </div>
        <p class="text-[10px] font-black text-foreground uppercase tracking-widest truncate w-20 text-center leading-none">{{ podiumUsers[0].name }}</p>
        <span class="text-lg font-black text-primary-500 italic drop-shadow-lg leading-none mt-1">{{ podiumUsers[0].total_reps }}</span>
      </button>

      <!-- 3rd Place -->
      <button v-if="podiumUsers[2]" 
        @click="$emit('viewProfile', podiumUsers[2].id)"
        class="flex flex-col items-center group cursor-pointer transition-all active:scale-95 outline-none rounded-xl p-1">
        <div class="relative mb-2">
          <div class="p-0.5 rounded-full bg-orange-900/20 ring-1 ring-orange-900/40">
            <AvatarFrame :src="podiumUsers[2].avatar_url" :border-css="podiumUsers[2].border_css" :avatar-css="podiumUsers[2].avatar_css" :size="48" />
          </div>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-800 rounded-full flex items-center justify-center border border-background shadow-lg">
             <span class="text-[8px] font-black text-white">3</span>
          </div>
        </div>
        <p class="text-[9px] font-black text-muted uppercase tracking-tighter truncate w-16 text-center leading-none">{{ podiumUsers[2].name }}</p>
        <span class="text-xs font-black text-foreground italic mt-1">{{ podiumUsers[2].total_reps }}</span>
      </button>
    </div>
    
    <!-- Regular List (Ranks 4+) -->
    <div class="space-y-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10 px-2 max-h-[400px] lg:max-h-[600px]">
      <button 
        v-for="(user, index) in regularUsers" :key="user.id" 
        @click="$emit('viewProfile', user.id)"
        :title="i18n.locale === 'es' ? `Ver perfil de ${user.name}` : `View ${user.name}'s profile`"
        class="w-full group flex items-center justify-between p-3 rounded-xl bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-all duration-300 border border-transparent hover:border-border active:scale-[0.99] outline-none focus:ring-2 focus:ring-primary-500/30"
        :class="{'!bg-primary-500/5 !border-primary-500/20' : user.id === authStore.user?.id}"
      >
        <div class="flex items-center gap-4 min-w-0 flex-1">
          <!-- Position Badge -->
          <div class="w-10 flex-shrink-0">
            <span class="text-[11px] font-black text-muted tracking-tighter font-precision italic">#{{ String(index + 4).padStart(2, '0') }}</span>
          </div>

          <!-- Avatar -->
          <div class="relative flex-shrink-0 transition-transform">
            <AvatarFrame :src="user.avatar_url" :border-css="user.border_css" :avatar-css="user.avatar_css" :size="42" />
            <div v-if="user.id === authStore.user?.id" class="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-background z-10 animate-pulse"></div>
          </div>

          <!-- User Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 min-w-0 font-tight">
              <div class="text-sm font-black text-foreground truncate group-hover:text-primary-400 transition-colors tracking-tight uppercase italic leading-none font-tight text-left">
                {{ user.id === authStore.user?.id ? i18n.t('lb_you') : user.name }}
              </div>
              <div class="flex items-center gap-1 bg-foreground/5 px-1.5 py-0.5 rounded border border-border/30 shrink-0">
                <span class="text-[6px] font-black text-primary-500/80 tracking-widest">LVL</span>
                <span class="text-[8px] font-black text-foreground italic">{{ user.current_level }}</span>
              </div>
              <span v-if="user.title_name" class="hidden xs:inline-block text-[7px] uppercase tracking-widest px-2 py-0.5 rounded-md bg-foreground/5 border border-border font-black shrink-0" :class="user.title_css">
                {{ user.title_name }}
              </span>
            </div>
            <p class="text-[8px] text-muted font-bold uppercase tracking-widest mt-1 text-left">
              {{ i18n.t('lb_pro_athlete') }}
            </p>
          </div>
        </div>
        
        <!-- Total Reps Stats -->
        <div class="flex flex-col items-end leading-none translate-y-[2px] ml-4">
          <span class="text-xl font-black text-foreground group-hover:text-primary-500 transition-colors italic text-precision leading-none">
            {{ user.total_reps }}
          </span>
          <p class="text-[7px] font-black text-muted uppercase tracking-widest mt-1 opacity-60 leading-none">{{ i18n.t('stats_reps') }}</p>
        </div>
      </button>
      
      <!-- Loading & Empty States -->
      <div v-if="loading" class="space-y-1">
        <div v-for="i in 8" :key="'skeleton-' + i" 
             class="w-full flex items-center justify-between p-3 rounded-xl bg-foreground/[0.01] border border-transparent animate-skeleton">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-10 h-4 bg-foreground/10 rounded"></div>
            <div class="w-[42px] h-[42px] rounded-full bg-foreground/10"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-32 bg-foreground/10 rounded"></div>
              <div class="h-3 w-16 bg-foreground/5 rounded"></div>
            </div>
          </div>
          <div class="h-6 w-12 bg-foreground/10 rounded"></div>
        </div>
      </div>
      
      <div v-if="!loading && users.length === 0" class="py-24 text-center opacity-30">
        <Users class="w-10 h-10 mx-auto mb-4 text-muted" />
        <p class="text-[10px] font-black text-muted uppercase tracking-widest leading-none">{{ i18n.t('lb_data_null') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { Users } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import AvatarFrame from './AvatarFrame.vue';

const authStore = useAuthStore();
const i18n = useI18nStore();

const props = defineProps({
  limit: { type: Number, default: 20 },
  exerciseType: { type: String, default: 'pullups' }
});

const emit = defineEmits(['viewProfile']);

const type = ref('global');
const timeframe = ref('all');
const users = ref([]);
const loading = ref(false);

const podiumUsers = computed(() => users.value.slice(0, 3));
const regularUsers = computed(() => users.value.slice(3));

const fetchLeaderboard = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/api/leaderboard/${type.value}`, {
      params: { 
        timeframe: timeframe.value,
        type: props.exerciseType
      }
    });
    users.value = response.data.sort((a, b) => b.total_reps - a.total_reps);
  } catch (error) {
    console.error('Leaderboard sync error:', error);
  } finally {
    loading.value = false;
  }
};

watch([type, timeframe, () => props.exerciseType], () => {
  if (!import.meta.env.SSR) fetchLeaderboard();
});
onMounted(() => {
  if (!import.meta.env.SSR) fetchLeaderboard();
});

defineExpose({ refresh: fetchLeaderboard });
</script>

<style scoped>
.font-tight { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

@keyframes skeleton-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}
.animate-skeleton {
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

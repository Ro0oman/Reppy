<template>
  <div class="glass glass-hover flex flex-col gap-3 sm:gap-5 p-3 sm:p-7 rounded-3xl shadow-2xl">
    <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">
      <button 
        @click="type = 'friends'"
        class="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-all rounded-xl"
        :class="type === 'friends' ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 shadow-lg' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300'"
      >
        {{ i18n.t('lb_friends') }}
      </button>
      <button 
        @click="type = 'global'"
        class="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-all rounded-xl"
        :class="type === 'global' ? 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 shadow-lg' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300'"
      >
        {{ i18n.t('lb_global') }}
      </button>
    </div>
    <div v-else class="text-center py-2">
      <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500/50">{{ i18n.t('lb_global') }}</h4>
    </div>

    <!-- Timeframe Selector (Scrollable with explicit padding for visibility) -->
    <div class="relative mb-6">
      <div class="flex gap-1.5 p-1 bg-zinc-100/50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth px-3 py-1">
        <button 
          v-for="tf in ['today', 'week', 'month', 'year', 'all']" 
          :key="tf"
          @click="timeframe = tf"
          class="flex-shrink-0 min-w-[85px] py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl whitespace-nowrap"
          :class="timeframe === tf ? 'text-primary-500 bg-white dark:bg-zinc-800 shadow-md shadow-primary-500/5 scale-[0.98]' : 'text-zinc-500 hover:text-zinc-400'"
        >
          {{ i18n.t('tf_' + tf) }}
        </button>
      </div>
      <!-- Enhanced scroll hint gradient -->
      <div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-950/80 via-zinc-950/40 to-transparent pointer-events-none rounded-r-2xl sm:hidden"></div>
      <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none sm:hidden">
         <span class="text-[10px] text-zinc-500 animate-pulse">▶</span>
      </div>
    </div>

    <!-- Podium Section (Top 3) -->
    <div v-if="!loading && podiumUsers.length > 0" class="flex items-end justify-center gap-2 sm:gap-6 mb-12 px-2">
      <!-- 2nd Place -->
      <div v-if="podiumUsers[1]" 
        @click="$emit('viewProfile', podiumUsers[1].id)"
        class="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105 active:scale-95">
        <div class="relative mb-3">
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">🥈</div>
          <div class="p-1 rounded-full bg-gradient-to-b from-slate-300 to-slate-500 shadow-lg">
            <AvatarFrame :src="podiumUsers[1].avatar_url" :border-css="podiumUsers[1].border_css" :avatar-css="podiumUsers[1].avatar_css" :size="windowWidth < 640 ? 56 : 72" />
          </div>
          <div class="absolute -bottom-2 -right-1 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center border-2 border-[#09090b] text-[10px] font-black text-white">2</div>
        </div>
        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-tighter line-clamp-2 w-[60px] sm:w-[80px] text-center leading-tight mb-1">{{ podiumUsers[1].name }}</p>
        <span class="text-xs sm:text-sm font-black text-white italic tracking-tighter">{{ podiumUsers[1].total_reps }}</span>
      </div>

      <!-- 1st Place (Center) -->
      <div v-if="podiumUsers[0]" 
        @click="$emit('viewProfile', podiumUsers[0].id)"
        class="flex flex-col items-center group cursor-pointer transition-transform hover:scale-110 active:scale-95 -mt-6">
        <div class="relative mb-4">
          <div class="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl drop-shadow-2xl animate-bounce duration-[2000ms]">👑</div>
          <div class="p-1.5 rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-orange-500 shadow-2xl shadow-yellow-500/20 ring-4 ring-yellow-500/20">
            <AvatarFrame :src="podiumUsers[0].avatar_url" :border-css="podiumUsers[0].border_css" :avatar-css="podiumUsers[0].avatar_css" :size="windowWidth < 640 ? 80 : 100" />
          </div>
          <div class="absolute -bottom-2 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-4 border-[#09090b] text-xs font-black text-zinc-950">1</div>
          <!-- Glimmer Effect -->
          <div class="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
             <div class="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-30deg] animate-glimmer"></div>
          </div>
        </div>
        <p class="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest line-clamp-2 w-[80px] sm:w-[100px] text-center leading-tight mb-1">{{ podiumUsers[0].name }}</p>
        <span class="text-lg sm:text-xl font-black text-yellow-500 italic tracking-tighter drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">{{ podiumUsers[0].total_reps }}</span>
      </div>

      <!-- 3rd Place -->
      <div v-if="podiumUsers[2]" 
        @click="$emit('viewProfile', podiumUsers[2].id)"
        class="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105 active:scale-95">
        <div class="relative mb-3">
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">🥉</div>
          <div class="p-1 rounded-full bg-gradient-to-b from-orange-400 to-amber-800 shadow-lg">
            <AvatarFrame :src="podiumUsers[2].avatar_url" :border-css="podiumUsers[2].border_css" :avatar-css="podiumUsers[2].avatar_css" :size="windowWidth < 640 ? 56 : 72" />
          </div>
          <div class="absolute -bottom-2 -right-1 w-6 h-6 bg-orange-700 rounded-full flex items-center justify-center border-2 border-[#09090b] text-[10px] font-black text-white">3</div>
        </div>
        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-tighter line-clamp-2 w-[60px] sm:w-[80px] text-center leading-tight mb-1">{{ podiumUsers[2].name }}</p>
        <span class="text-xs sm:text-sm font-black text-white italic tracking-tighter">{{ podiumUsers[2].total_reps }}</span>
      </div>
    </div>
    
    <!-- Regular List (Ranks 4+) -->
    <div class="p-0 sm:p-2 space-y-2 max-h-[500px] overflow-y-auto no-scrollbar scroll-smooth">
      <div 
        v-for="(user, index) in regularUsers" :key="user.id" 
        @click="$emit('viewProfile', user.id)"
        class="group flex items-center justify-between p-3.5 rounded-[1.25rem] hover:bg-zinc-100/50 dark:hover:bg-white/[0.03] transition-all duration-300 border border-transparent hover:border-zinc-200 dark:hover:border-white/5 active:scale-98"
        :class="{'bg-primary-500/10 border-primary-500/20 !border shadow-lg shadow-primary-500/10 ring-1 ring-primary-500/30' : user.id === authStore.user?.id}"
      >
        <div class="flex flex-1 items-center gap-2 sm:gap-4 min-w-0">
          <div class="w-6 sm:w-8 flex-shrink-0 flex justify-center">
            <span class="text-[10px] sm:text-xs font-black text-zinc-500 dark:text-zinc-600 tracking-tighter">#{{ index + 4 }}</span>
          </div>
          <div class="relative flex-shrink-0">
            <AvatarFrame :src="user.avatar_url" :border-css="user.border_css" :avatar-css="user.avatar_css" :size="windowWidth < 400 ? 32 : 40" />
            <div v-if="user.id === authStore.user?.id" class="absolute -top-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-primary-500 rounded-full border-2 border-[#09090b] z-10 animate-pulse"></div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1 sm:gap-2">
              <p class="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-primary-400 transition-colors">
                {{ user.id === authStore.user?.id ? 'Tu' : user.name }}
              </p>
              <span v-if="user.title_name" class="hidden xs:inline-block text-[7px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full bg-white/5 border border-zinc-200 dark:border-white/10 font-black shrink-0" :class="user.title_css">
                {{ user.title_name }}
              </span>
            </div>
            <div class="flex items-center gap-2 sm:gap-3">
               <p class="text-[8px] sm:text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest truncate">{{ timeframe === 'all' ? 'Leyenda' : 'Héroe del Mes' }}</p>
               <span v-if="user.total_volume" class="xs:hidden text-[8px] font-black text-emerald-400 tabular-nums">🧪 {{ Math.round(user.total_volume / 1000) }}k</span>
            </div>
          </div>
        </div>
        
        <div class="text-right flex items-center gap-4 sm:gap-6 flex-shrink-0 ml-2">
          <div v-if="user.total_volume" class="hidden sm:flex flex-col items-end leading-none">
            <span class="text-[10px] sm:text-[11px] font-black text-emerald-400 tracking-tighter tabular-nums">{{ Math.round(user.total_volume).toLocaleString() }}</span>
            <span class="text-[7px] font-black text-emerald-600/50 uppercase tracking-[0.2em]">KG VOL</span>
          </div>
          <div class="flex flex-col items-end leading-tight min-w-[45px] sm:min-w-[50px]">
            <span class="text-base sm:text-lg font-black text-zinc-900 dark:text-white tracking-tight tabular-nums group-hover:text-primary-500 transition-colors">{{ user.total_reps }}</span>
            <p class="text-[7px] sm:text-[8px] font-black text-zinc-500 uppercase tracking-widest">{{ i18n.t('stats_reps') }}</p>
          </div>
        </div>
      </div>
      
      <!-- Loading & Empty States -->
      <div v-if="loading" class="py-16 flex justify-center">
        <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div v-if="!loading && podiumUsers.length === 0 && regularUsers.length === 0" class="py-20 text-center">
        <div class="inline-flex p-4 rounded-3xl bg-zinc-100 dark:bg-white/5 mb-4 mb-4 ring-1 ring-zinc-200 dark:ring-white/5">
           <Users class="w-8 h-8 text-zinc-400" />
        </div>
        <p class="text-sm font-bold text-zinc-500 italic">{{ i18n.t('lb_empty') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
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

const type = ref(authStore.isAuthenticated ? 'friends' : 'global');
const timeframe = ref('all');
const users = ref([]);
const loading = ref(false);
const windowWidth = ref(window.innerWidth);

const podiumUsers = computed(() => {
  return users.value.slice(0, 3);
});

const regularUsers = computed(() => {
  return users.value.slice(3);
});

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
    console.error('Error fetching leaderboard:', error);
  } finally {
    loading.value = false;
  }
};

watch([type, timeframe, () => props.exerciseType], fetchLeaderboard);

onMounted(() => {
  fetchLeaderboard();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

defineExpose({ refresh: fetchLeaderboard });
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes glimmer {
  0% { transform: translateX(-100%) skewX(-30deg); }
  10% { transform: translateX(100%) skewX(-30deg); }
  100% { transform: translateX(100%) skewX(-30deg); }
}
.animate-glimmer {
  animation: glimmer 4s infinite linear;
}

@keyframes bounce {
  0%, 100% { transform: translate(-50%, -10%); }
  50% { transform: translate(-50%, 0); }
}

.animate-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom breakpoints for XS mobile */
@media (max-width: 400px) {
  .xs\:hidden {
    display: none;
  }
}
@media (min-width: 401px) {
  .xs\:inline-block {
    display: inline-block;
  }
  .xs\:flex {
    display: flex;
  }
}
</style>

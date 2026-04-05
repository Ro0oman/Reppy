<template>
  <div class="glass flex flex-col gap-4 sm:gap-6 p-2 sm:p-7 rounded-[2.5rem] shadow-2xl overflow-hidden relative border-zinc-200 dark:border-white/5 animate-in">
    <!-- Background Decoration -->
    <div class="absolute -right-24 -top-24 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none"></div>

    <!-- Friends vs Global Switcher -->
    <div v-if="authStore.isAuthenticated" class="flex p-1.5 bg-zinc-100 dark:bg-black/40 rounded-2xl border border-zinc-200 dark:border-white/5 relative z-10 mx-2">
      <button 
        @click="type = 'friends'"
        class="flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl relative z-10"
        :class="type === 'friends' ? 'text-zinc-900 dark:text-white shadow-xl translate-y-[-1px]' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500'"
      >
        <span v-if="type === 'friends'" class="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-lg -z-10 animate-scale-in"></span>
        {{ i18n.t('lb_friends') }}
      </button>
      <button 
        @click="type = 'global'"
        class="flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl relative z-10"
        :class="type === 'global' ? 'text-zinc-900 dark:text-white shadow-xl translate-y-[-1px]' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500'"
      >
        <span v-if="type === 'global'" class="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-lg -z-10 animate-scale-in"></span>
        {{ i18n.t('lb_global') }}
      </button>
    </div>
    <div v-else class="text-center pt-2 relative z-10">
      <h4 class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500/60 drop-shadow-sm">{{ i18n.t('lb_global') }}</h4>
    </div>

    <!-- Timeframe Selector (Premium Segmented Control) -->
    <div class="relative px-2 mb-8 z-10">
      <div class="flex gap-1 p-1 bg-zinc-100 dark:bg-black/60 border border-zinc-200 dark:border-white/5 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth">
        <button 
          v-for="tf in ['today', 'week', 'month', 'year', 'all']" 
          :key="tf"
          @click="timeframe = tf"
          class="flex-shrink-0 min-w-[70px] xs:min-w-[85px] py-2.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl whitespace-nowrap relative z-10"
          :class="timeframe === tf ? 'text-primary-500' : 'text-zinc-500 hover:text-zinc-400'"
        >
          <span v-if="timeframe === tf" class="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-md -z-10 animate-scale-in"></span>
          {{ i18n.t('tf_' + tf) }}
        </button>
      </div>
      <!-- Enhanced scroll hint gradient -->
      <div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-950/80 via-zinc-950/40 to-transparent pointer-events-none rounded-r-2xl sm:hidden"></div>
    </div>

    <!-- Podium Section (Top 3) -->
    <div v-if="!loading && podiumUsers.length > 0" class="flex items-end justify-center gap-1 sm:gap-6 mb-14 px-1 relative z-10">
      <!-- 2nd Place -->
      <div v-if="podiumUsers[1]" 
        @click="$emit('viewProfile', podiumUsers[1].id)"
        class="flex flex-col items-center group cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95">
        <div class="relative mb-3">
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl drop-shadow-lg opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500">🥈</div>
          <div class="p-1 rounded-full bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 shadow-xl ring-2 ring-slate-400/20">
            <AvatarFrame :src="podiumUsers[1].avatar_url" :border-css="podiumUsers[1].border_css" :avatar-css="podiumUsers[1].avatar_css" :size="windowWidth < 640 ? 52 : 72" />
          </div>
          <div class="absolute -bottom-2 -right-1 w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center border-2 border-[#09090b] shadow-lg">
             <span class="text-[10px] font-black text-white">2</span>
          </div>
        </div>
        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-tighter line-clamp-1 w-[70px] sm:w-[80px] text-center mb-0.5">{{ podiumUsers[1].name }}</p>
        <span class="text-xs sm:text-sm font-black text-white italic tracking-tighter">{{ podiumUsers[1].total_reps }}</span>
      </div>

      <!-- 1st Place (Center) -->
      <div v-if="podiumUsers[0]" 
        @click="$emit('viewProfile', podiumUsers[0].id)"
        class="flex flex-col items-center group cursor-pointer transition-all duration-700 hover:scale-110 active:scale-95 -mt-6">
        <div class="relative mb-4">
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 text-4xl drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-crown duration-[2000ms]">👑</div>
          <div class="p-1.5 rounded-full bg-gradient-to-br from-amber-200 via-yellow-500 to-orange-600 shadow-[0_0_30px_rgba(234,179,8,0.2)] ring-4 ring-yellow-500/20">
            <AvatarFrame :src="podiumUsers[0].avatar_url" :border-css="podiumUsers[0].border_css" :avatar-css="podiumUsers[0].avatar_css" :size="windowWidth < 640 ? 80 : 100" />
          </div>
          <div class="absolute -bottom-2 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-4 border-[#09090b] shadow-xl">
             <span class="text-xs font-black text-zinc-950">1</span>
          </div>
          <!-- Glimmer Effect -->
          <div class="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
             <div class="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-30deg] animate-glimmer"></div>
          </div>
        </div>
        <p class="text-[11px] sm:text-xs font-black text-white uppercase tracking-widest line-clamp-1 w-[90px] sm:w-[110px] text-center mb-0.5 leading-tight">{{ podiumUsers[0].name }}</p>
        <span class="text-xl sm:text-2xl font-black text-yellow-500 italic tracking-tighter drop-shadow-[0_4px_10px_rgba(234,179,8,0.3)]">{{ podiumUsers[0].total_reps }}</span>
      </div>

      <!-- 3rd Place -->
      <div v-if="podiumUsers[2]" 
        @click="$emit('viewProfile', podiumUsers[2].id)"
        class="flex flex-col items-center group cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95">
        <div class="relative mb-3">
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl drop-shadow-lg opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500">🥉</div>
          <div class="p-1 rounded-full bg-gradient-to-b from-orange-400 via-orange-600 to-amber-900 shadow-xl ring-2 ring-orange-400/20">
            <AvatarFrame :src="podiumUsers[2].avatar_url" :border-css="podiumUsers[2].border_css" :avatar-css="podiumUsers[2].avatar_css" :size="windowWidth < 640 ? 52 : 72" />
          </div>
          <div class="absolute -bottom-2 -right-1 w-6 h-6 bg-orange-800 rounded-full flex items-center justify-center border-2 border-[#09090b] shadow-lg">
             <span class="text-[10px] font-black text-white">3</span>
          </div>
        </div>
        <p class="text-[9px] font-black text-zinc-400 uppercase tracking-tighter line-clamp-1 w-[70px] sm:w-[80px] text-center mb-0.5">{{ podiumUsers[2].name }}</p>
        <span class="text-xs sm:text-sm font-black text-white italic tracking-tighter">{{ podiumUsers[2].total_reps }}</span>
      </div>
    </div>
    
    <!-- Regular List (Ranks 4+) -->
    <div class="p-0 sm:px-2 space-y-1.5 max-h-[550px] overflow-y-auto no-scrollbar scroll-smooth relative z-10">
      <div 
        v-for="(user, index) in regularUsers" :key="user.id" 
        @click="$emit('viewProfile', user.id)"
        class="group flex items-center justify-between p-3 sm:px-4 sm:py-3.5 rounded-[1.35rem] bg-white/[0.01] hover:bg-zinc-100/50 dark:hover:bg-white/[0.04] transition-all duration-300 border border-transparent hover:border-zinc-200 dark:hover:border-white/5 active:scale-98"
        :class="{'bg-primary-500/[0.08] !border-primary-500/20 shadow-xl shadow-primary-500/5 ring-1 ring-primary-500/20' : user.id === authStore.user?.id}"
      >
        <div class="flex items-center gap-3 sm:gap-5 min-w-0 flex-1">
          <!-- Position Badge (Fixed width) -->
          <div class="w-7 sm:w-10 flex-shrink-0 flex items-center justify-center">
            <span class="text-[11px] sm:text-[13px] font-black text-zinc-500 dark:text-zinc-600 tracking-tighter font-mono italic">#{{ index + 4 }}</span>
          </div>

          <!-- Avatar -->
          <div class="relative flex-shrink-0 group-hover:scale-105 transition-transform">
            <AvatarFrame :src="user.avatar_url" :border-css="user.border_css" :avatar-css="user.avatar_css" :size="windowWidth < 400 ? 36 : 42" />
            <div v-if="user.id === authStore.user?.id" class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary-500 rounded-full border-2 border-[#09090b] z-10 animate-pulse shadow-lg"></div>
          </div>

          <!-- User Info (Flexible) -->
          <div class="min-w-0 flex-1 overflow-hidden">
            <div class="flex flex-col sm:flex-row sm:items-center items-start gap-1">
              <h4 class="text-xs sm:text-[14px] font-black text-zinc-900 dark:text-zinc-100 truncate group-hover:text-primary-400 transition-colors tracking-tight uppercase italic leading-none">
                {{ user.id === authStore.user?.id ? 'Tu' : user.name }}
              </h4>
              <span v-if="user.title_name" class="xs:inline-block text-[7px] hidden uppercase tracking-[0.2em] px-2 py-0.5 rounded-md bg-white/5 border border-zinc-200 dark:border-white/10 font-black shrink-0 shadow-sm" :class="user.title_css">
                {{ user.title_name }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-0.5">
               <p class="text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest truncate">
                 {{ exerciseType === 'all' ? 'Atleta Global' : (timeframe === 'all' ? 'Guerrero Ancestral' : 'Atleta del Rango') }}
               </p>
               <span v-if="user.total_volume" class="xs:hidden text-[8px] font-black text-emerald-400/80 bg-emerald-400/5 px-1 rounded-sm border border-emerald-400/10 tabular-nums">📦 {{ (user.total_volume/1000).toFixed(1) }}k</span>
            </div>
          </div>
        </div>
        
        <!-- Stats Section (Fixed-Right) -->
        <div class="flex items-center gap-4 sm:gap-8 flex-shrink-0 ml-2">
          <!-- KG VOL Data Pill (Emerald Pillar) -->
          <div v-if="user.total_volume" class="hidden xs:flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 shadow-sm ring-1 ring-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors">
            <span class="text-[10px] sm:text-[12px] font-black text-emerald-400 tracking-tighter tabular-nums leading-none">{{ Math.round(user.total_volume).toLocaleString() }}</span>
            <span class="text-[6px] font-black text-emerald-600 opacity-60 uppercase tracking-[0.2em] mt-0.5">KG VOL</span>
          </div>

          <!-- Total Reps (Primary Stat) -->
          <div class="flex flex-col items-end leading-none min-w-[40px] sm:min-w-[60px] translate-y-[2px]">
            <span class="text-[18px] sm:text-[22px] font-black text-zinc-900 dark:text-white tracking-tighter tabular-nums group-hover:text-primary-500 transition-colors italic leading-none">{{ user.total_reps }}</span>
            <p class="text-[7px] sm:text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1 opacity-60 leading-none">{{ i18n.t('stats_reps') }}</p>
          </div>
        </div>
      </div>
      
      <!-- Loading & Empty States -->
      <div v-if="loading" class="py-24 flex justify-center">
        <div class="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
      </div>
      
      <div v-if="!loading && podiumUsers.length === 0 && regularUsers.length === 0" class="py-24 text-center">
        <div class="inline-flex p-6 rounded-[2rem] bg-zinc-100 dark:bg-white/5 mb-6 ring-1 ring-zinc-200 dark:ring-white/10 shadow-xl opacity-30">
           <Users class="w-10 h-10 text-zinc-400" />
        </div>
        <p class="text-sm font-black text-zinc-500 uppercase tracking-widest italic opacity-50">{{ i18n.t('lb_empty') }}</p>
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
  15% { transform: translateX(100%) skewX(-30deg); }
  100% { transform: translateX(100%) skewX(-30deg); }
}
.animate-glimmer {
  animation: glimmer 6s infinite ease-out;
}

@keyframes crown {
  0%, 100% { transform: translate(-50%, -15%) rotate(-2deg); }
  50% { transform: translate(-50%, 0) rotate(2deg); }
}
.animate-crown {
  animation: crown 3s ease-in-out infinite;
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom breakpoints and mobile tweaks */
@media (max-width: 400px) {
  .xs\:hidden {
    display: none;
  }
  .xs\:inline-block {
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

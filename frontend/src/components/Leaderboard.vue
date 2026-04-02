<template>
  <div class="glass glass-hover flex flex-col gap-5 p-7 rounded-3xl shadow-2xl">
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

    <!-- Timeframe Selector -->
    <div class="flex gap-1 p-1 bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-2xl mb-6 overflow-x-auto no-scrollbar">
      <button 
        v-for="tf in ['today', 'week', 'month', 'year', 'all']" 
        :key="tf"
        @click="timeframe = tf"
        class="px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter transition-all rounded-lg whitespace-nowrap"
        :class="timeframe === tf ? 'text-primary-400 bg-primary-500/10' : 'text-zinc-600 hover:text-zinc-400 dark:text-zinc-500 dark:text-zinc-400'"
      >
        {{ i18n.t('tf_' + tf) }}
      </button>
    </div>
    
    <div class="p-4 space-y-1">
      <div 
        v-for="(user, index) in sortedUsers" :key="user.id" 
        @click="$emit('viewProfile', user.id)"
        class="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100/50 dark:hover:bg-white/[0.03] hover:scale-[1.02] cursor-pointer transition-all duration-300"
        :class="{'bg-primary-500/10 border border-primary-500/20': user.id === authStore.user?.id}"
      >
        <div class="flex items-center gap-4">
          <div class="w-6 flex justify-center">
            <span v-if="index === 0" class="text-lg">🥇</span>
            <span v-else-if="index === 1" class="text-lg">🥈</span>
            <span v-else-if="index === 2" class="text-lg">🥉</span>
            <span v-else class="text-[10px] font-black text-zinc-600 tracking-tighter">{{ index + 1 }}</span>
          </div>
          <div class="relative">
            <img :src="user.avatar_url" class="w-9 h-9 rounded-full border border-zinc-700/50" :class="user.border_css" />
            <div v-if="user.id === authStore.user?.id" class="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-[#09090b]"></div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-bold text-zinc-200 group-hover:text-zinc-900 dark:text-white transition-colors">
                {{ user.id === authStore.user?.id ? 'You' : user.name }}
              </p>
              <span v-if="user.title_name" class="text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-zinc-200 dark:border-white/10 font-bold" :class="user.title_css">
                {{ user.title_name }}
              </span>
            </div>
            <p class="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{{ i18n.t('lb_rank') }} #{{ index + 1 }}</p>
          </div>
        </div>
        <div class="text-right flex flex-col items-end justify-center">
          <div class="flex flex-col items-end leading-none">
            <span class="text-lg font-black text-zinc-900 dark:text-white tracking-tight">{{ user.total_reps }}</span>
            <p class="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{{ i18n.t('stats_reps') }}</p>
          </div>
          <div v-if="user.total_volume" class="mt-1.5 px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/10 rounded-md flex flex-col items-end leading-none">
            <span class="text-[10px] font-black text-emerald-400 tracking-tighter">{{ Math.round(user.total_volume).toLocaleString() }}</span>
            <span class="text-[6px] font-bold text-emerald-600 uppercase tracking-[0.2em]">KG VOL</span>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="py-12 flex justify-center">
        <div class="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div v-if="!loading && sortedUsers.length === 0" class="py-12 text-center">
        <Users class="w-8 h-8 text-zinc-800 mx-auto mb-2" />
        <p class="text-xs text-zinc-600 italic">{{ i18n.t('lb_empty') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Users } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';

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
const sortedUsers = ref([]);

const fetchLeaderboard = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/api/leaderboard/${type.value}`, {
      params: { 
        timeframe: timeframe.value,
        type: props.exerciseType
      }
    });
    users.value = response.data;
    sortedUsers.value = [...users.value].sort((a, b) => b.total_reps - a.total_reps);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  } finally {
    loading.value = false;
  }
};

watch([type, timeframe, () => props.exerciseType], fetchLeaderboard);
onMounted(fetchLeaderboard);

defineExpose({ refresh: fetchLeaderboard });
</script>

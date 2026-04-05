<template>
  <div class="max-w-7xl mx-auto w-full px-4 space-y-8 pb-32 pt-0">
    <!-- Top Header: Tools & Boss -->
    <ExerciseSelector v-model="activeExercise" class="w-full" />

    <!-- Dashboard Core Strategy (50/50 Split) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <!-- Phase 0: Tactical Heatmap (Priority View) -->
      <div class="space-y-4">
        <h3 class="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500 px-2">
          <Activity class="w-4 h-4 text-primary-500" />
          {{ i18n.t('activity_stream') }}
        </h3>
        <Heatmap 
          :data="heatmapData" 
          :key="`${activeExercise}-${activeYear}`" 
          :loading="isLoading"
          :selected-year="activeYear"
          :exercise-label="activeExerciseLabel"
          class="card-stats !p-8 h-full transition-opacity duration-300" 
          :class="isLoading ? 'opacity-50' : 'opacity-100'"
        />
      </div>

      <!-- Tactical Status (Community Boss) -->
      <div class="space-y-4">
        <h3 class="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500 px-2">
          <Zap class="w-4 h-4 text-primary-500" />
          ESTADO DEL BOSS
        </h3>
        <BossHealth ref="bossHealthRef" />
      </div>
    </div>

    <!-- Core Operational Layer (50/50 Action/Stats Grid) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <!-- 1. Action Center (Reps Input) -->
      <div class="space-y-4">
        <h3 class="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500 px-2">
          <Zap class="w-4 h-4 text-primary-500" />
          REGISTRO DE VOLUMEN
        </h3>
        <div v-if="activeExercise === 'all'" class="card-stats p-8 flex flex-col items-center justify-center text-center space-y-4 opacity-50 border-dashed border-white/10 min-h-[360px]">
          <Globe class="w-12 h-12 text-zinc-600" />
          <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-relaxed">
            Global view active. <br /> Select a protocol to log volume.
          </p>
        </div>
        <RepsInput v-else :exercise-type="activeExercise" @updated="fetchData" class="min-h-[360px]" />

        <!-- Supporting Stats (Optional row for balance) -->
        <div class="grid grid-cols-2 gap-4">
           <div class="card-stats p-4 flex flex-col justify-between">
              <span class="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Global Vol</span>
              <p class="text-xl font-black text-white italic text-precision">{{ (stats.totalVolume / 1000).toFixed(1) }} <span class="text-[10px]">TONS</span></p>
           </div>
           <div class="card-stats p-4 flex flex-col justify-between">
              <span class="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Weight</span>
              <p class="text-xl font-black text-white italic text-precision">{{ stats.bodyWeight }} <span class="text-[10px]">KG</span></p>
           </div>
        </div>
      </div>

      <!-- 2. The Bento Analytics (Stats) -->
      <div class="space-y-4">
        <h3 class="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500 px-2">
          <Target class="w-4 h-4 text-primary-500" />
          PROGRESO DIARIO
        </h3>
        <div class="bento-grid !grid-cols-1 xl:!grid-cols-2">
          <!-- 1. Primary Progress (Full wide in its container) -->
          <div class="card-stats xl:col-span-2 xl:row-span-2 flex flex-col items-center justify-center gap-6 group/goal min-h-[360px]">
            <RadialProgress :progress="(todayProgress / stats.dailyGoal) * 100" :size="200">
              <div class="flex flex-col items-center">
                <span class="text-5xl font-black text-precision transition-transform group-hover/goal:scale-110 tracking-tighter">
                  {{ todayProgress }}
                </span>
                <span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">/ {{ stats.dailyGoal }} REPS</span>
              </div>
            </RadialProgress>
            <p class="text-[10px] font-bold text-zinc-400 text-center px-4">
              {{ todayProgress >= stats.dailyGoal ? 'Goal achieved.' : 'Analyzing performance...' }}
            </p>
          </div>

          <!-- 2. Streak -->
          <div class="card-stats flex flex-col justify-between group/streak min-h-[160px]">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Streak</span>
              <Flame class="w-4 h-4 text-primary-500" />
            </div>
            <div class="mt-4">
              <span class="text-5xl font-black text-precision text-white tracking-tighter">{{ stats.streak }}</span>
              <p class="text-[10px] font-black text-primary-500 uppercase tracking-widest">Active Days</p>
            </div>
          </div>

          <!-- 3. Peak Volume -->
          <div class="card-stats flex flex-col justify-between group/pb min-h-[160px]">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Peak Vol</span>
              <Zap class="w-4 h-4 text-neon-lime" />
            </div>
            <div class="mt-4">
              <span class="text-4xl font-black text-precision text-white tracking-tighter">{{ stats.topMonthCount }}</span>
              <p class="text-[10px] font-black text-neon-lime uppercase tracking-widest">Month Max</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phase 2: Live Rankings -->
    <div class="space-y-4">
      <h3 class="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500 px-2">
        <BarChart3 class="w-4 h-4 text-primary-500" />
        {{ activeExerciseLabel }} <span class="text-zinc-600">Protocol Leaderboard</span>
      </h3>
      <div class="card-stats !p-0 overflow-hidden">
        <div class="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div class="flex items-center gap-3">
             <BarChart3 class="w-5 h-5 text-primary-500" />
             <h3 class="text-lg font-black text-industrial uppercase text-white tracking-tight">
               Ranking <span class="text-zinc-600">Protocolo</span>
             </h3>
          </div>
        </div>
        <Leaderboard 
          ref="leaderboardRef" 
          :exercise-type="activeExercise"
          @viewProfile="$emit('viewProfile', $event)"
        />
      </div>
    </div>

    <!-- Phase 3: Historical Stream -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Logs -->
      <div class="space-y-4">
        <h3 class="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500 px-2">
          <History class="w-4 h-4 text-primary-500" />
          LOG HISTORY
        </h3>
        <div class="card-stats !p-0 h-[380px] overflow-hidden flex flex-col shadow-2xl">
          <div class="overflow-y-auto scrollbar-hide flex-1">
            <table class="w-full text-left">
              <thead class="sticky top-0 bg-steel-grey/90 backdrop-blur-md z-10">
                <tr class="text-zinc-600 text-[9px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                  <th class="px-8 py-5">Timestamp</th>
                  <th class="px-8 py-5 text-right">Magnitude</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.03]">
                <tr v-for="rep in reps" :key="rep.id" class="group hover:bg-white/[0.02] transition-colors">
                  <td class="px-8 py-4">
                    <span class="text-xs font-bold text-zinc-500 uppercase italic group-hover:text-white transition-colors">
                      {{ formatDate(rep.date) }}
                    </span>
                  </td>
                  <td class="px-8 py-4 text-right">
                    <div v-if="editingId === rep.id" class="flex items-center justify-end gap-3">
                      <input v-model.number="editValue" type="number"
                        class="w-20 bg-black/40 border border-primary-500/50 rounded-lg px-2 py-1 text-right text-precision focus:outline-none"
                        @keyup.enter="saveEdit(rep.id)" />
                      <button @click="saveEdit(rep.id)" class="text-primary-500"><Check class="w-4 h-4" /></button>
                    </div>
                    <div v-else class="flex items-center justify-end gap-4">
                      <span @click="startEdit(rep)" class="text-xl font-black text-precision text-white cursor-pointer hover:text-primary-500">
                        {{ rep.count }}
                      </span>
                      <button @click="confirmDelete(rep.id)" class="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="reps.length === 0">
                  <td colspan="2" class="py-20 text-center opacity-20">
                    <Inbox class="w-10 h-10 mx-auto mb-4" />
                    <span class="text-[10px] font-black uppercase tracking-widest">Protocol Null</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive, watch } from 'vue';
import axios from 'axios';
import {
  Trophy, Target, Flame, Zap, Activity, History, Inbox,
  BarChart3, Check, X, Trash2, Globe
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import { useNotificationStore } from '../stores/notification';
import Heatmap from './Heatmap.vue';
import RepsInput from './RepsInput.vue';
import Leaderboard from './Leaderboard.vue';
import ExerciseSelector from './ExerciseSelector.vue';
import BossHealth from './BossHealth.vue';
import RadialProgress from './RadialProgress.vue';

const emit = defineEmits(['viewProfile']);
const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();

const reps = ref([]);
const heatmapData = ref([]);
const totalReps = ref(0);
const activeExercise = ref('all');
const editingId = ref(null);
const editValue = ref(0);
const leaderboardRef = ref(null);
const bossHealthRef = ref(null);
const isLoading = ref(false);
const activeYear = ref(2026);

const stats = reactive({
  streak: 0,
  topMonth: 'N/A',
  topMonthCount: 0,
  dailyGoal: 50,
  totalVolume: 0,
  bodyWeight: 75
});

const activeExerciseLabel = computed(() => {
  const map = {
    all: 'Global',
    pullups: 'Pullups',
    muscleups: 'Muscle Ups',
    dips: 'Dips',
    pushups: 'Pushups',
    weighted_pullups: 'Weighted'
  };
  return map[activeExercise.value] || activeExercise.value;
});

const todayProgress = computed(() => {
  const today = new Date().toLocaleDateString('en-CA');
  return reps.value
    .filter(r => new Date(r.date).toLocaleDateString('en-CA') === today)
    .reduce((acc, curr) => acc + Number(curr.count), 0);
});

const fetchData = async () => {
  isLoading.value = true;
  try {
    const params = { 
      type: activeExercise.value,
      year: activeYear.value 
    };
    const [repsRes, heatmapRes, statsRes] = await Promise.all([
      axios.get('/api/reps', { params }),
      axios.get('/api/reps/heatmap', { params }),
      axios.get('/api/reps/stats', { params }),
      authStore.fetchProfile()
    ]);

    reps.value = repsRes.data;
    heatmapData.value = heatmapRes.data;
    totalReps.value = statsRes.data.totalReps;
    stats.streak = statsRes.data.streak;
    stats.topMonth = statsRes.data.topMonth;
    stats.topMonthCount = statsRes.data.topMonthCount;
    stats.dailyGoal = statsRes.data.dailyGoal || 50;
    stats.totalVolume = statsRes.data.totalVolume || 0;
    stats.bodyWeight = statsRes.data.bodyWeight || 75;

    if (leaderboardRef.value) leaderboardRef.value.refresh();
    if (bossHealthRef.value) bossHealthRef.value.refresh();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric'
  });
};

const startEdit = (rep) => {
  editingId.value = rep.id;
  editValue.value = rep.count;
};

const saveEdit = async (id) => {
  try {
    await axios.put(`/api/reps/${id}`, { count: editValue.value });
    editingId.value = null;
    notificationStore.notify('Entry updated', 'success');
    fetchData();
  } catch (err) {
    notificationStore.notify('Update failed', 'error');
  }
};

// Update data when exercise type changes
watch(activeExercise, () => {
  fetchData();
});

const confirmDelete = (id) => {
  notificationStore.confirm(
    'Delete Log',
    'Are you sure you want to delete this entry?',
    async () => {
      try {
        await axios.delete(`/api/reps/${id}`);
        notificationStore.notify('Entry deleted', 'success');
        fetchData();
      } catch (err) {
        notificationStore.notify('Delete failed', 'error');
      }
    }
  );
};

let refreshInterval = null;

onMounted(() => {
  fetchData();
  // Auto-refresh every 60 seconds to keep boss HP and leaderboard updated
  refreshInterval = setInterval(fetchData, 60000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>

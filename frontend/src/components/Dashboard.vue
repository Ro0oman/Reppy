<template>
  <div class="max-w-7xl mx-auto w-full px-4 space-y-8 pb-32 pt-6">
    <!-- Top Header: Tools & Boss -->
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <button @click="fetchData"
          class="p-3 bg-steel-grey/40 hover:bg-steel-grey/60 border border-white/5 rounded-xl transition-all group"
          title="Refresh protocol">
          <RotateCw class="w-5 h-5 text-zinc-500 group-hover:text-primary-500 group-hover:rotate-180 transition-all duration-700" />
        </button>
      </div>

      <!-- Exercise Selector (The Dock) -->
      <div class="flex justify-center">
        <ExerciseSelector v-model="activeExercise" @update:modelValue="fetchData" />
      </div>
    </div>

    <!-- Phase 0: Tactical Heatmap (Priority View) -->
    <div class="space-y-4">
      <h3 class="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500 px-2">
        <Activity class="w-4 h-4 text-primary-500" />
        {{ i18n.t('activity_stream') }}
      </h3>
      <Heatmap :data="heatmapData" class="card-stats !p-8" />
    </div>

    <!-- Phase 1: The Bento Analytics -->
    <div class="bento-grid">
      <!-- 1. Primary Progress (2x2) -->
      <div class="card-stats md:col-span-2 md:row-span-2 flex flex-col items-center justify-center gap-6 group/goal">
        <div class="absolute top-6 left-6 flex items-center gap-2">
          <Target class="w-4 h-4 text-primary-500" />
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{{ i18n.t('goal_progress') }}</span>
        </div>
        
        <RadialProgress :progress="(todayProgress / stats.dailyGoal) * 100" :size="240">
          <div class="flex flex-col items-center">
            <span class="text-6xl font-black text-precision transition-transform group-hover/goal:scale-110 tracking-tighter">
              {{ todayProgress }}
            </span>
            <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">/ {{ stats.dailyGoal }} REPS</span>
          </div>
        </RadialProgress>

        <div class="text-center">
          <p class="text-xs font-bold text-zinc-400 max-w-[200px]">
            {{ todayProgress >= stats.dailyGoal ? 'Protocol established. Goal achieved.' : 'Analyzing performance... Goal pending.' }}
          </p>
        </div>
      </div>

      <!-- 2. Streak (1x1) -->
      <div class="card-stats flex flex-col justify-between group/streak">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Streak</span>
          <Flame class="w-5 h-5 text-primary-500 group-hover/streak:animate-bounce" />
        </div>
        <div class="mt-4">
          <span class="text-6xl font-black text-precision text-white tracking-tighter">{{ stats.streak }}</span>
          <p class="text-[10px] font-black text-primary-500 uppercase tracking-widest">Active Days</p>
        </div>
        <div class="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div class="h-full bg-primary-500 transition-all duration-1000" :style="{ width: '80%' }"></div>
        </div>
      </div>

      <!-- 3. Personal Best (1x1) -->
      <div class="card-stats flex flex-col justify-between group/pb">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Peak Volume</span>
          <Zap class="w-5 h-5 text-neon-lime group-hover/pb:scale-125 transition-transform" />
        </div>
        <div class="mt-4">
          <span class="text-4xl font-black text-precision text-white tracking-tighter">{{ stats.topMonthCount }}</span>
          <p class="text-[10px] font-black text-neon-lime uppercase tracking-widest">Month Max</p>
        </div>
        <p class="text-[10px] font-bold text-zinc-600 uppercase mt-2">{{ stats.topMonth }}</p>
      </div>

      <!-- 4. Weight (1x1) -->
      <div class="card-stats flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Body Weight</span>
          <Activity class="w-5 h-5 text-blue-500" />
        </div>
        <div class="mt-4">
          <span class="text-5xl font-black text-precision text-white tracking-tighter">{{ stats.bodyWeight }}</span>
          <span class="text-xs font-black text-zinc-600 ml-2">KG</span>
        </div>
        <div class="flex items-center gap-1 mt-2">
          <div v-for="i in 5" :key="i" :class="['h-1 flex-1 rounded-full', i <= 3 ? 'bg-blue-500/40' : 'bg-white/5']"></div>
        </div>
      </div>

      <!-- 5. Total Volume (1x1) -->
      <div class="card-stats flex flex-col justify-between group/vol">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Volume</span>
          <Trophy class="w-5 h-5 text-yellow-500 group-hover/vol:rotate-12 transition-transform" />
        </div>
        <div class="mt-4">
          <span class="text-4xl font-black text-precision text-white tracking-tighter">{{ (stats.totalVolume / 1000).toFixed(1) }}</span>
          <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Metric Tons</p>
        </div>
        <div class="mt-2 text-[10px] font-bold text-yellow-500/50 tabular-nums">{{ stats.totalVolume.toLocaleString() }} KG</div>
      </div>
    </div>

    <!-- Phase 1.5: Community Boss Battle -->
    <BossHealth ref="bossHealthRef" />

    <!-- Phase 2: Action & Competition -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Input Center -->
      <div class="lg:col-span-1">
        <RepsInput :exercise-type="activeExercise" @updated="fetchData" />
      </div>

      <!-- Live Rankings -->
      <div class="lg:col-span-2">
        <div class="card-stats h-full !p-0">
          <div class="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div class="flex items-center gap-3">
              <BarChart3 class="w-5 h-5 text-primary-500" />
              <h3 class="text-lg font-black text-industrial uppercase text-white tracking-tight">
                {{ activeExerciseLabel }} <span class="text-zinc-600">Protocol</span>
              </h3>
            </div>
            <div class="px-3 py-1 bg-primary-500/10 rounded-full border border-primary-500/20">
              <span class="text-[9px] font-black text-primary-500 uppercase tracking-widest">Live Feed</span>
            </div>
          </div>
          <div class="p-4 bg-black/20">
            <Leaderboard 
              ref="leaderboardRef" 
              :exercise-type="activeExercise"
              @viewProfile="$emit('viewProfile', $event)"
            />
          </div>
        </div>
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
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import {
  Trophy, Target, Flame, Zap, Activity, History, Inbox,
  RotateCw, BarChart3, Check, X, Trash2
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
const activeExercise = ref('pullups');
const editingId = ref(null);
const editValue = ref(0);
const leaderboardRef = ref(null);
const bossHealthRef = ref(null);

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
  const todayEntry = reps.value.find(r => new Date(r.date).toLocaleDateString('en-CA') === today);
  return todayEntry ? todayEntry.count : 0;
});

const fetchData = async () => {
  try {
    const params = { type: activeExercise.value };
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

onMounted(fetchData);
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>

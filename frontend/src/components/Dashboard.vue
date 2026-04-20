<template>
  <div class="max-w-7xl mx-auto w-full px-4 space-y-12 pb-32 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- 1. Mission Control Header -->
    <header class="flex flex-col gap-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-6">
          <!-- Compact Daily Progress -->
          <div class="relative shrink-0 transition-transform duration-500 hover:scale-105">
             <RadialProgress 
              :progress="(todayProgress / stats.dailyGoal) * 100" 
              :size="80"
              class="drop-shadow-[0_0_20px_rgba(255,69,0,0.1)]"
            >
              <div class="flex flex-col items-center">
                <span class="text-xl font-black tracking-tighter text-white italic leading-none">
                  {{ Math.round((todayProgress / stats.dailyGoal) * 100) }}%
                </span>
                <span class="text-[7px] font-black text-primary-500 uppercase tracking-widest mt-0.5">OBJETIVO</span>
              </div>
            </RadialProgress>
          </div>

          <div>
            <h2 class="text-4xl font-black tracking-tighter text-foreground italic uppercase leading-none">Command Hub</h2>
            <div class="flex items-center gap-2 mt-2">
              <div class="flex items-center gap-1.5 bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-500/20">
                <Target class="w-3 h-3 text-primary-500" />
                <span class="text-[9px] font-black text-primary-500 uppercase tracking-widest">{{ todayProgress }} / {{ stats.dailyGoal }} REPS</span>
              </div>
            </div>
          </div>
        </div>
        <ExerciseSelector v-model="activeExercise" class="w-full md:w-auto" />
      </div>
    </header>

    <!-- 2. The Hero: Active Session -->
    <section class="max-w-4xl mx-auto w-full">
      <div v-if="activeExercise === 'all'" class="bg-surface/10 backdrop-blur-2xl border border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center text-center p-20 opacity-40">
        <Globe class="w-16 h-16 text-muted mb-6" />
        <h3 class="text-xl font-black uppercase tracking-tighter">{{ i18n.t('dash_global_view_active') }}</h3>
        <p class="text-xs text-muted/60 max-w-[200px] mx-auto mt-2 italic">Select a specific protocol to log data</p>
      </div>
      <RepsInput v-else :exercise-type="activeExercise" @updated="fetchData" class="w-full" />
    </section>

    <!-- 3. Global Intel & Metrics -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <!-- Boss Intel -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center gap-3 px-2">
          <Zap class="w-4 h-4 text-primary-500" />
          <h3 class="text-xs font-black uppercase tracking-widest text-muted/60">{{ i18n.t('dash_boss_status') }}</h3>
        </div>
        <BossHealth ref="bossHealthRef" />
      </div>

      <!-- Quick Metrics Bento -->
      <div class="grid grid-cols-1 gap-4 h-full">
         <!-- Streak -->
         <div class="bg-surface/10 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between group">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-muted/40 uppercase tracking-widest">{{ i18n.t('dash_streak') }}</span>
              <Flame class="w-4 h-4 text-primary-500" />
            </div>
            <div class="mt-4">
              <span class="text-5xl font-black text-white italic tracking-tighter">{{ stats.streak }}</span>
              <p class="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-1">{{ i18n.t('stats_days') }}</p>
            </div>
         </div>

         <div class="grid grid-cols-2 gap-4">
            <!-- Peak -->
            <div class="bg-surface/10 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between group">
              <Activity class="w-3.5 h-3.5 text-accent mb-4" />
              <div>
                <span class="text-3xl font-black text-white italic tracking-tighter">{{ stats.topMonthCount }}</span>
                <p class="text-[9px] font-black text-muted/40 uppercase tracking-widest mt-1">{{ i18n.t('dash_max_month') }}</p>
              </div>
            </div>
            <!-- Tonnage -->
            <div class="bg-surface/10 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between group">
              <Trophy class="w-3.5 h-3.5 text-primary-500 mb-4" />
              <div>
                <span class="text-3xl font-black text-white italic tracking-tighter">{{ ((stats.totalVolume || 0) / 1000).toFixed(1) }}</span>
                <p class="text-[9px] font-black text-muted/40 uppercase tracking-widest mt-1">{{ i18n.t('dash_tons_moved') }}</p>
              </div>
            </div>
         </div>
      </div>
    </section>

    <!-- 4. Combat Analytics (Tabbed) -->
    <section class="space-y-6">
      <div class="flex items-center justify-center p-1 bg-surface/20 backdrop-blur-xl border border-white/5 rounded-2xl w-fit mx-auto">
        <button 
          @click="activeTab = 'heatmap'"
          class="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          :class="activeTab === 'heatmap' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-muted/40 hover:text-foreground'"
        >
          {{ i18n.t('activity_stream') }}
        </button>
        <button 
          @click="activeTab = 'history'"
          class="px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          :class="activeTab === 'history' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-muted/40 hover:text-foreground'"
        >
          {{ i18n.t('dash_history_title') }}
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="activeTab === 'heatmap'" key="heatmap" class="bg-surface/5 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 sm:p-12">
          <Heatmap 
            :data="heatmapData" 
            :key="`${activeExercise}-${activeYear}`" 
            :loading="isLoading"
            :selected-year="activeYear"
            :exercise-label="activeExerciseLabel"
            class="transition-opacity duration-300"
            :class="isLoading ? 'opacity-50' : 'opacity-100'"
          />
        </div>

        <div v-else key="history" class="bg-surface/5 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-muted/40 text-[9px] uppercase font-black tracking-[0.3em] border-b border-white/5">
                  <th class="px-10 py-6">Timestamp</th>
                  <th class="px-10 py-6 text-right">Magnitude</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.02]">
                <tr v-for="rep in reps" :key="rep.id" class="group hover:bg-white/[0.02] transition-colors">
                  <td class="px-10 py-6">
                    <span class="text-xs font-bold text-muted/60 group-hover:text-foreground transition-colors uppercase tracking-tight">
                      {{ formatDate(rep.date) }}
                    </span>
                  </td>
                  <td class="px-10 py-6 text-right">
                    <div v-if="editingId === rep.id" class="flex items-center justify-end gap-3">
                      <input v-model.number="editValue" type="number"
                        class="w-20 bg-surface/60 border border-primary-500/30 rounded-xl px-2 py-1.5 text-right font-black italic focus:outline-none text-foreground"
                        @keyup.enter="saveEdit(rep.id)" />
                      <button @click="saveEdit(rep.id)" class="text-primary-500"><Check class="w-4 h-4" /></button>
                    </div>
                    <div v-else class="flex items-center justify-end gap-6">
                      <span @click="startEdit(rep)" class="text-2xl font-black italic tracking-tighter text-white cursor-pointer hover:text-primary-500 transition-colors">
                        {{ rep.count }}
                      </span>
                      <button @click="confirmDelete(rep.id)" class="opacity-0 group-hover:opacity-100 text-muted/20 hover:text-red-500 transition-all">
                        <Trash2 class="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="reps.length === 0">
                  <td colspan="2" class="py-24 text-center">
                    <Inbox class="w-12 h-12 mx-auto mb-4 text-muted/20" />
                    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-muted/20">{{ i18n.t('dash_protocol_null') }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </transition>
    </section>

    <!-- Battle Overhaul Welcome Modal -->
    <DamageOverhaulModal 
      :show="showDamageModal" 
      @close="handleCloseDamageModal" 
    />
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
import ExerciseSelector from './ExerciseSelector.vue';
import BossHealth from './BossHealth.vue';
import RadialProgress from './RadialProgress.vue';
import DamageOverhaulModal from './DamageOverhaulModal.vue';
import { getLocalDateString } from '../utils/dateUtils.js';

const emit = defineEmits(['viewProfile', 'start']);
const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();

const reps = ref([]);
const heatmapData = ref([]);
const totalReps = ref(0);
const activeExercise = ref('pullups');
const editingId = ref(null);
const editValue = ref(0);
const bossHealthRef = ref(null);
const isLoading = ref(false);
const activeYear = ref(2026);
const showDamageModal = ref(false);
const activeTab = ref('heatmap');

// Scroll lock when damage modal is active
watch(showDamageModal, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

const stats = reactive({
  streak: 0,
  topMonth: 'N/A',
  topMonthCount: 0,
  dailyGoal: 50,
  totalVolume: 0,
  bodyWeight: 75
});

const activeExerciseLabel = computed(() => {
  return i18n.t(activeExercise.value);
});

const todayProgress = computed(() => {
  const today = getLocalDateString();
  return reps.value
    .filter(r => getLocalDateString(r.date) === today)
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

    if (bossHealthRef.value) bossHealthRef.value.refresh();

    // Check for damage overhaul modal
    if (authStore.user && !authStore.user.has_seen_damage_overhaul) {
      showDamageModal.value = true;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateStr) => {
  // Use '/' instead of '-' to force local timezone parsing if it's a YYYY-MM-DD string
  const normalizedDate = typeof dateStr === 'string' ? dateStr.replace(/-/g, '/') : dateStr;
  return new Date(normalizedDate).toLocaleDateString(undefined, {
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

const handleCloseDamageModal = () => {
  showDamageModal.value = false;
  if (authStore.user) {
    authStore.user.has_seen_damage_overhaul = true;
  }
};

onMounted(() => {
  // Check for exercise pre-selection from query params
  const urlParams = new URLSearchParams(window.location.search);
  const exerciseParam = urlParams.get('exercise');
  if (exerciseParam) {
    activeExercise.value = exerciseParam;
  }

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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

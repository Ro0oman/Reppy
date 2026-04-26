<template>
  <div class="card-stats border-white/5 bg-white/[0.02] p-4 rounded-3xl backdrop-blur-xl relative overflow-hidden group">
    <!-- Background Glow -->
    <div class="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000"></div>
    
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <Flame class="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h4 class="text-[10px] font-black text-muted uppercase tracking-[0.3em] font-industrial">{{ i18n.t('ui_op_consistency') }}</h4>
          <div class="flex items-center gap-2">
            <p class="text-xs font-black text-foreground uppercase tracking-widest italic">{{ i18n.t('ui_eff_protocol') }}</p>
            <span class="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">{{ i18n.t('ui_verified') }}</span>
          </div>
        </div>
      </div>

      <!-- Heatmap Cells Row -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full py-2 px-1">
        <div v-for="day in last30Days" :key="day.date" 
             class="w-3 h-3 rounded-sm transition-all duration-500 hover:scale-125 cursor-help shrink-0"
             :class="getDayClass(day.count)"
             :title="`${day.date}: ${day.count} reps`"
        ></div>
        
        <div class="ml-4 flex flex-col items-end shrink-0">
           <span class="text-xl font-black text-foreground italic tabular-nums leading-none">{{ currentStreak }}</span>
           <span class="text-[7px] font-bold text-muted uppercase tracking-tighter">{{ i18n.t('stats_streak') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { Flame } from 'lucide-vue-next';
import { getLocalDateString } from '../utils/dateUtils.js';
import { useI18nStore } from '../stores/i18n';

const i18n = useI18nStore();

const heatmapData = ref([]);
const loading = ref(true);

const fetchHeatmap = async () => {
  try {
    const res = await axios.get('/api/reps/heatmap', { params: { type: 'all' } });
    heatmapData.value = res.data;
  } catch (e) {
    console.error('Error fetching mini heatmap:', e);
  } finally {
    loading.value = false;
  }
};

const last30Days = computed(() => {
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dStr = getLocalDateString(d);
    const activity = heatmapData.value.find(h => getLocalDateString(new Date(h.date)) === dStr);
    days.push({
      date: dStr,
      count: activity ? activity.count : 0
    });
  }
  return days;
});

const currentStreak = computed(() => {
  let streak = 0;
  const dates = heatmapData.value.map(h => getLocalDateString(new Date(h.date)));
  let checkDate = new Date();
  
  // If not trained today, check yesterday to keep streak alive
  if (!dates.includes(getLocalDateString(checkDate))) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (dates.includes(getLocalDateString(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
});

const getDayClass = (count) => {
  if (count === 0) return 'bg-white/5 border border-white/5';
  if (count < 10) return 'bg-emerald-500/20 border border-emerald-500/30';
  if (count < 30) return 'bg-emerald-500/40 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
  if (count < 60) return 'bg-emerald-500/70 border border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse';
  return 'bg-emerald-500 border border-white/20 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse';
};

onMounted(fetchHeatmap);
</script>

<style scoped>
.font-industrial { font-family: 'Industrial', sans-serif; }
</style>

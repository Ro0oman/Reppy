<template>
  <div class="flex flex-col gap-6 p-8 bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl shadow-2xl">
    <!-- Header: Total contributions -->
    <div class="flex items-center justify-between px-2">
      <div class="flex flex-col">
        <h3 class="text-xl font-black text-white leading-none mb-1">{{ totalYearReps }} {{ i18n.t('stats_reps') || 'Reps' }}</h3>
        <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{{ i18n.t('in_the_last_year') || 'in the last year' }}</p>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-white/5 rounded-full text-[10px] font-black text-zinc-400 hover:text-white transition-colors cursor-pointer">
        <span>{{ i18n.t('contribution_settings') || 'Settings' }}</span>
        <ChevronDown class="w-3 h-3" />
      </div>
    </div>

    <div class="flex gap-4">
      <!-- Main Activity Grid Area -->
      <div class="flex-1 min-w-0 p-8 bg-zinc-900/40 border-2 border-white/5 rounded-[2rem] relative overflow-hidden group/board">
        <!-- Background Glow -->
        <div class="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover/board:bg-emerald-500/10 transition-colors duration-700"></div>

        <div class="flex relative z-10">
          <!-- Weekday Labels -->
          <div class="flex flex-col gap-1.5 pr-6 justify-center text-[9px] font-black text-zinc-600 uppercase tracking-tighter mt-6">
            <span class="h-[11px] leading-[11px]"></span>
            <span class="h-[11px] leading-[11px] text-zinc-400 opacity-40">Mon</span>
            <span class="h-[11px] leading-[11px]"></span>
            <span class="h-[11px] leading-[11px] text-zinc-400 opacity-40">Wed</span>
            <span class="h-[11px] leading-[11px]"></span>
            <span class="h-[11px] leading-[11px] text-zinc-400 opacity-40">Fri</span>
            <span class="h-[11px] leading-[11px]"></span>
          </div>

          <div class="flex-1 overflow-x-auto scrollbar-hide">
            <!-- Month Labels -->
            <div class="flex gap-1.5 mb-3 h-4 relative">
              <span 
                v-for="month in monthLabels" :key="month.key" 
                class="absolute text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] whitespace-nowrap"
                :style="{ left: `${month.offset * 12.5}px` }"
              >
                {{ month.name }}
              </span>
            </div>

            <!-- The Grid -->
            <div class="flex gap-1.5 pb-2">
              <div v-for="(week, wIndex) in weeks" :key="wIndex" class="flex flex-col gap-1.5">
                <div 
                  v-for="(day, dIndex) in week" :key="dIndex"
                  class="w-[11px] h-[11px] rounded-[3px] transition-all duration-500 relative group/day"
                  :class="[
                    getColorClass(day),
                    activeDay?.date === day.date ? 'ring-2 ring-white scale-125 z-20 shadow-[0_0_20px_rgba(255,255,255,0.5)]' : '',
                    day.isOutsideYear ? 'opacity-0 pointer-events-none' : 'cursor-pointer hover:ring-2 hover:ring-white/40 hover:scale-150 hover:z-30 hover:shadow-2xl'
                  ]"
                  @mouseenter="!day.isOutsideYear && (hoveredDay = day)"
                  @mouseleave="hoveredDay = null"
                  @click="!day.isOutsideYear && (clickedDay = clickedDay?.date === day.date ? null : day)"
                >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Legend -->
        <div class="flex items-center justify-between mt-8 px-4 relative z-10">
          <p class="text-[9px] font-black text-zinc-600 uppercase tracking-widest opacity-40">{{ i18n.t('progress_metrics') || 'Volume Metrics' }}</p>
          <div class="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/5">
            <span class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Less</span>
            <div class="flex gap-1.5">
              <div class="w-2.5 h-2.5 rounded-[2px] bg-zinc-800/40"></div>
              <div class="w-2.5 h-2.5 rounded-[2px] bg-indigo-900/60"></div>
              <div class="w-2.5 h-2.5 rounded-[2px] bg-blue-600/80"></div>
              <div class="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
              <div class="w-2.5 h-2.5 rounded-[2px] bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
              <div class="w-2.5 h-2.5 rounded-[2px] bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"></div>
            </div>
            <span class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">More</span>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

const i18n = useI18nStore();
const hoveredDay = ref(null);
const clickedDay = ref(null);

const activeDay = computed(() => hoveredDay.value || clickedDay.value);

const totalYearReps = computed(() => {
  return props.data.reduce((acc, curr) => acc + curr.count, 0);
});

// Helper to get YYYY-MM-DD in local time
const toLocalDateStr = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const monthLabels = computed(() => {
  const labels = [];
  const today = new Date();
  const year = today.getFullYear();
  
  // Find the exact start date of the grid (same logic as weeks computed)
  const Jan1 = new Date(year, 0, 1);
  const dayOfJan1 = Jan1.getDay();
  // Monday as start of week: Mon=1, Sun=0
  const startDiff = dayOfJan1 === 0 ? -6 : 1 - dayOfJan1;
  const firstGridDate = new Date(year, 0, 1 + startDiff);

  for (let m = 0; m < 12; m++) {
    const startOfMonth = new Date(year, m, 1);
    // Week offset from firstGridDate
    const diffDays = Math.floor((startOfMonth - firstGridDate) / (24 * 60 * 60 * 1000));
    const diffWeeks = Math.floor(diffDays / 7);
    
    labels.push({
      key: m,
      name: startOfMonth.toLocaleString('default', { month: 'short' }),
      offset: diffWeeks
    });
  }
  return labels;
});

const weeks = computed(() => {
  const result = [];
  const today = new Date();
  const year = today.getFullYear();
  
  const Jan1 = new Date(year, 0, 1);
  const dayOfJan1 = Jan1.getDay();
  const startOffset = dayOfJan1 === 0 ? -6 : 1 - dayOfJan1;
  const currentDate = new Date(year, 0, 1 + startOffset);

  // Align end date to the end of the week (Sunday)
  const lastDate = new Date(year, 11, 31);
  const lastDay = lastDate.getDay();
  const endOffset = lastDay === 0 ? 0 : 7 - lastDay;
  const finalDate = new Date(year, 11, 31 + endOffset);

  // Normalize data dates to a quick lookup map
  const dataMap = props.data.reduce((acc, curr) => {
    const dStr = toLocalDateStr(curr.date);
    acc[dStr] = (acc[dStr] || 0) + curr.count;
    return acc;
  }, {});

  let currentWeek = [];

  while (currentDate <= finalDate) {
    const dateStr = toLocalDateStr(currentDate);
    const count = dataMap[dateStr] || 0;
    const isWithinYear = currentDate.getFullYear() === year;
    const isFuture = currentDate > today;
    
    currentWeek.push({
      date: isWithinYear ? dateStr : '',
      count: count,
      isFuture,
      isOutsideYear: !isWithinYear
    });

    if (currentWeek.length === 7) {
      result.push(currentWeek);
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
});

const getColorClass = (day) => {
  if (day.isOutsideYear) return 'bg-transparent';
  if (day.isFuture) return 'bg-zinc-800/10 border border-white/5';
  if (day.count === 0) return 'bg-zinc-800/40';
  if (day.count < 10) return 'bg-indigo-900/60';
  if (day.count < 20) return 'bg-blue-600/80';
  if (day.count < 30) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
  if (day.count < 40) return 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]';
  return 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px) scale(0.9);
}
</style>

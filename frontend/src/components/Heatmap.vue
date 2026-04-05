<template>
  <div class="relative flex flex-col gap-6">
    <!-- Header: Total performance -->
    <div class="flex items-end justify-between px-2">
      <div class="flex flex-col gap-1">
        <p class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] leading-none">
          {{ i18n.t('stats_last_year') }}
        </p>
        <h3 class="text-3xl font-black text-white leading-none tracking-tighter">
          {{ totalYearReps }} <span class="text-primary-500">{{ i18n.t('stats_reps') }}</span>
        </h3>
      </div>
      
      <!-- Legend (Compact) -->
      <div class="flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
        <span class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{{ i18n.t('stats_less') }}</span>
        <div class="flex gap-1">
          <div v-for="level in 5" :key="level" 
            class="w-2.5 h-2.5 rounded-[2px] transition-colors duration-500"
            :class="getLevelClass(level - 1)">
          </div>
        </div>
        <span class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{{ i18n.t('stats_more') }}</span>
      </div>
    </div>

    <!-- Main Activity Grid Area -->
    <div class="relative bg-black/20 border border-white/5 rounded-[2rem] p-8 overflow-hidden group/board">
      <!-- Tooltip -->
      <transition name="tooltip">
        <div v-if="hoveredDay" 
          class="absolute z-[100] px-4 py-2 bg-zinc-900 text-white text-[10px] font-black rounded-xl shadow-2xl pointer-events-none whitespace-nowrap -translate-x-1/2 -translate-y-[calc(100%+12px)] border border-white/10"
          :style="tooltipPosition"
        >
          <div class="flex flex-col items-center gap-0.5 relative">
            <span class="text-zinc-400 font-bold mb-0.5">{{ formatDate(hoveredDay.date) }}</span>
            <span class="text-emerald-400">
              {{ hoveredDay.count > 0 ? `${hoveredDay.count} ${i18n.t('heatmap_reps')}` : i18n.t('heatmap_no_reps') }}
            </span>
            <div class="w-2 h-2 bg-zinc-900 rotate-45 absolute -bottom-3 left-1/2 -translate-x-1/2 border-b border-r border-white/10"></div>
          </div>
        </div>
      </transition>

      <div class="flex relative">
        <!-- Weekday Labels -->
        <div class="flex flex-col gap-[3px] pr-4 justify-start text-[9px] font-black text-zinc-600 uppercase mt-7">
          <span class="h-2.5 leading-[10px]">&nbsp;</span>
          <span class="h-2.5 leading-[10px] opacity-40">{{ i18n.t('day_mon') }}</span>
          <span class="h-2.5 leading-[10px]">&nbsp;</span>
          <span class="h-2.5 leading-[10px] opacity-40">{{ i18n.t('day_wed') }}</span>
          <span class="h-2.5 leading-[10px]">&nbsp;</span>
          <span class="h-2.5 leading-[10px] opacity-40">{{ i18n.t('day_fri') }}</span>
          <span class="h-2.5 leading-[10px]">&nbsp;</span>
        </div>

        <div class="flex-1 overflow-x-auto scrollbar-hide relative min-h-[140px]" ref="gridContainer">
          <!-- Month Labels -->
          <div class="flex h-5 mb-2 relative w-full">
            <span 
              v-for="month in monthLabels" :key="month.key" 
              class="absolute text-[9px] font-black text-zinc-600 uppercase tracking-widest whitespace-nowrap"
              :style="{ left: `${month.offset * 13}px` }"
            >
              {{ month.name }}
            </span>
          </div>

          <!-- The Grid -->
          <div class="flex gap-[3px]">
            <div v-for="(week, wIndex) in weeks" :key="wIndex" class="flex flex-col gap-[3px]">
              <div 
                v-for="(day, dIndex) in week" :key="dIndex"
                class="w-[10px] h-[10px] rounded-[2px] transition-all duration-300 relative group/day"
                :class="[
                  getColorClass(day),
                  activeDay?.date === day.date ? 'ring-1 ring-white/50 scale-110 z-20' : '',
                  day.isOutsideRange ? 'opacity-0 pointer-events-none' : 'cursor-pointer hover:ring-2 hover:ring-white/40 hover:scale-125 hover:z-30'
                ]"
                @mouseenter="handleMouseEnter($event, day)"
                @mouseleave="hoveredDay = null"
                @click="!day.isOutsideRange && (clickedDay = clickedDay?.date === day.date ? null : day)"
              >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
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
const gridContainer = ref(null);
const tooltipPos = ref({ top: 0, left: 0 });

const activeDay = computed(() => hoveredDay.value || clickedDay.value);

const handleMouseEnter = (event, day) => {
  if (day.isOutsideRange || day.isFuture) return;
  
  hoveredDay.value = day;
  
  const rect = event.target.getBoundingClientRect();
  const parentRect = event.target.closest('.group\\/board').getBoundingClientRect();
  
  tooltipPos.value = {
    top: rect.top - parentRect.top,
    left: rect.left - parentRect.left + (rect.width / 2)
  };
};

const tooltipPosition = computed(() => ({
  top: `${tooltipPos.value.top}px`,
  left: `${tooltipPos.value.left}px`
}));

const totalYearReps = computed(() => {
  return props.data.reduce((acc, curr) => acc + curr.count, 0);
});

// Trailing Year Calculation Logic
const weeks = computed(() => {
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Set the end of the grid to the end of the current week (Saturday)
  const endOfGrid = new Date(today);
  const dayOfWeek = endOfGrid.getDay(); // 0 is Sunday, 6 is Saturday
  endOfGrid.setDate(today.getDate() + (6 - dayOfWeek));

  // The grid spans 53 weeks to ensure we cover the 365 days fully
  const totalDays = 53 * 7;
  const startOfGrid = new Date(endOfGrid);
  startOfGrid.setDate(endOfGrid.getDate() - (totalDays - 1));

  // Map input data for O(1) lookup
  const dataMap = props.data.reduce((acc, curr) => {
    const dStr = new Date(curr.date).toISOString().split('T')[0];
    acc[dStr] = (acc[dStr] || 0) + curr.count;
    return acc;
  }, {});

  const currentDate = new Date(startOfGrid);
  let currentWeek = [];

  for (let i = 0; i < totalDays; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const isFuture = currentDate > today;
    const isOutsideRange = currentDate < new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    currentWeek.push({
      date: dateStr,
      count: dataMap[dateStr] || 0,
      isFuture,
      isOutsideRange: false // We show all days in the 53 week window
    });

    if (currentWeek.length === 7) {
      result.push(currentWeek);
      currentWeek = [];
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
});

const monthLabels = computed(() => {
  const labels = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (weeks.value.length === 0) return [];

  weeks.value.forEach((week, index) => {
    // Check if the first day of this week is the beginning of a month
    const date = new Date(week[0].date);
    const dayOfMonth = date.getDate();
    
    // If we're at the start of a month, or it's the first week and we want a label
    if (dayOfMonth <= 7) {
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      
      // Don't repeat labels if they are too close
      const lastLabel = labels[labels.length - 1];
      if (!lastLabel || index - lastLabel.offset > 3) {
        labels.push({
          key: `${monthName}-${index}`,
          name: monthName,
          offset: index
        });
      }
    }
  });

  return labels;
});

const getLevelClass = (level) => {
  const levels = {
    0: 'bg-zinc-800/50',
    1: 'bg-emerald-900/40',
    2: 'bg-emerald-700/60',
    3: 'bg-emerald-500/80',
    4: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
  };
  return levels[level] || levels[0];
};

const getColorClass = (day) => {
  if (day.isFuture) return 'bg-zinc-900/40 border border-white/5';
  if (day.count === 0) return 'bg-zinc-800/50';
  if (day.count < 10) return 'bg-emerald-900/40';
  if (day.count < 30) return 'bg-emerald-700/60';
  if (day.count < 50) return 'bg-emerald-500/80';
  return 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

onMounted(() => {
  // Scroll to end of grid on mount
  if (gridContainer.value) {
    gridContainer.value.scrollLeft = gridContainer.value.scrollWidth;
  }
});
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
  transition: all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translate(-50%, 4px) scale(0.9);
}
</style>

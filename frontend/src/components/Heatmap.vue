<template>
  <div class="relative flex flex-col gap-2 transition-opacity duration-500" :class="{ 'opacity-40 pointer-events-none': loading }">
    <p class="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1 mb-1">
      <span class="text-white">{{ totalYearReps }}</span> {{ exerciseLabel }} {{ i18n.locale === 'es' ? 'en' : 'in' }} {{ selectedYear }}
    </p>
    
    <!-- GitHub-Style Activity Box -->
    <div class="relative bg-[#0d1117] border border-zinc-800 rounded-md p-4 lg:p-6 group/board">
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
        <div class="flex flex-col gap-[3px] pr-2 text-[9px] font-medium text-zinc-500 mt-6">
          <span class="h-[10px] leading-[10px]">&nbsp;</span>
          <span class="h-[10px] leading-[10px]">{{ i18n.t('day_mon') }}</span>
          <span class="h-[10px] leading-[10px]">&nbsp;</span>
          <span class="h-[10px] leading-[10px]">{{ i18n.t('day_wed') }}</span>
          <span class="h-[10px] leading-[10px]">&nbsp;</span>
          <span class="h-[10px] leading-[10px]">{{ i18n.t('day_fri') }}</span>
          <span class="h-[10px] leading-[10px]">&nbsp;</span>
        </div>

        <div class="flex-1 overflow-x-auto scrollbar-custom relative pb-2" ref="gridContainer">
          <!-- Month Labels -->
          <div class="flex h-4 mb-2 relative min-w-max">
            <span 
              v-for="month in monthLabels" :key="month.key" 
              class="absolute text-[9px] font-medium text-zinc-500 whitespace-nowrap"
              :style="{ left: `${month.offset * 14}px` }"
            >
              {{ month.name }}
            </span>
          </div>

          <!-- The Grid -->
          <div class="flex gap-[3px] min-w-max">
            <div v-for="(week, wIndex) in weeks" :key="wIndex" class="w-[11px] flex flex-col gap-[3px] shrink-0">
              <div 
                v-for="(day, dIndex) in week" :key="dIndex"
                class="w-full aspect-square rounded-[2px] transition-all duration-300 relative group/day"
                :class="[
                  getColorClass(day),
                  activeDay?.date === day.date ? 'ring-1 ring-white/50 z-20' : '',
                  day.isOutsideRange ? 'opacity-0 pointer-events-none' : 'cursor-pointer hover:ring-1 hover:ring-white/40 hover:z-30'
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

      <!-- Footer: Legend -->
      <div class="flex items-center justify-between mt-4 px-1">
        <a href="#" class="text-[10px] text-zinc-500 hover:text-blue-400 transition-colors">
          Learn how we count contributions
        </a>
        
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-zinc-500">Less</span>
          <div class="flex gap-[3px]">
            <div v-for="level in 5" :key="level" 
              class="w-[10px] h-[10px] rounded-[2px]"
              :class="getLevelClass(level - 1)">
            </div>
          </div>
          <span class="text-[10px] text-zinc-500">More</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useI18nStore } from '../stores/i18n';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedYear: {
    type: Number,
    default: new Date().getFullYear()
  },
  exerciseLabel: {
    type: String,
    default: 'Reps'
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
  return props.data.reduce((acc, curr) => acc + Number(curr.count), 0);
});

// Calendar Year Calculation Logic
const weeks = computed(() => {
  const result = [];
  const year = props.selectedYear;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start of Grid: Sunday of the week containing Jan 1st
  const startOfYear = new Date(year, 0, 1);
  const startOfGrid = new Date(startOfYear);
  const startDay = startOfYear.getDay();
  startOfGrid.setDate(startOfYear.getDate() - startDay);

  // End of Grid: Saturday of the week containing Dec 31st
  const endOfYear = new Date(year, 11, 31);
  const endOfGrid = new Date(endOfYear);
  const endDay = endOfYear.getDay();
  endOfGrid.setDate(endOfYear.getDate() + (6 - endDay));

  const totalDays = Math.round((endOfGrid - startOfGrid) / (1000 * 60 * 60 * 24)) + 1;

  const dataMap = props.data.reduce((acc, curr) => {
    // Backend uses YYYY-MM-DD
    const dStr = new Date(curr.date).toISOString().split('T')[0];
    acc[dStr] = (acc[dStr] || 0) + Number(curr.count);
    return acc;
  }, {});

  let currentDate = new Date(startOfGrid);
  let currentWeek = [];

  for (let i = 0; i < totalDays; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const isFuture = currentDate > today;
    const isOutsideYear = currentDate.getFullYear() !== year;

    currentWeek.push({
      date: dateStr,
      count: dataMap[dateStr] || 0,
      isFuture,
      isOutsideRange: isOutsideYear
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
    0: 'bg-[#161b22]',
    1: 'bg-[#0e4429]',
    2: 'bg-[#006d32]',
    3: 'bg-[#26a641]',
    4: 'bg-[#39d353]'
  };
  return levels[level] || levels[0];
};

const getColorClass = (day) => {
  if (day.isOutsideRange) return 'bg-transparent pointer-events-none opacity-0';
  if (day.isFuture) return 'bg-[#0d1117] border border-zinc-800/50';
  if (day.count === 0) return 'bg-[#161b22]';
  if (day.count < 10) return 'bg-[#0e4429]';
  if (day.count < 30) return 'bg-[#006d32]';
  if (day.count < 50) return 'bg-[#26a641]';
  return 'bg-[#39d353]';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

const scrollToToday = () => {
  if (gridContainer.value) {
    const today = new Date();
    const startOfYear = new Date(props.selectedYear, 0, 1);
    const diffDays = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(diffDays / 7);
    
    // Each week is 11px wide + 3px gap = 14px
    const scrollPos = Math.max(0, (weekIndex * 14) - 100); // 100px offset to show some context
    gridContainer.value.scrollLeft = scrollPos;
  }
};

onMounted(() => {
  scrollToToday();
});

// Re-scroll when data changes
watch(() => props.data, () => {
  scrollToToday();
}, { deep: true });
</script>

<style scoped>
.scrollbar-custom::-webkit-scrollbar {
  height: 4px;
}
.scrollbar-custom::-webkit-scrollbar-track {
  @apply bg-zinc-900 rounded-full;
}
.scrollbar-custom::-webkit-scrollbar-thumb {
  @apply bg-zinc-700 rounded-full hover:bg-primary-500 transition-colors cursor-pointer;
}
.scrollbar-custom {
  scrollbar-width: thin;
  scrollbar-color: #3f3f46 #18181b;
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

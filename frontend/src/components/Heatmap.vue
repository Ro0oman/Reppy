<template>
  <div class="flex flex-col gap-3 p-5 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl shadow-xl">
    <div class="flex items-center gap-2 mb-1">
      <CalendarDays class="w-4 h-4 text-primary-400" />
      <span class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Activity Graph</span>
    </div>
    
    <div class="relative group/heatmap">
      <div class="flex justify-between items-center overflow-x-auto pb-4 scrollbar-hide">
        <div v-for="(week, wIndex) in weeks" :key="wIndex" class="flex flex-col gap-1.5 px-0.5">
          <div 
            v-for="(day, dIndex) in week" :key="dIndex"
            class="w-[11px] h-[11px] rounded-[2px] transition-all duration-300 relative"
            :class="[
              getColorClass(day),
              activeDay?.date === day.date ? 'ring-2 ring-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : '',
              day.isOutsideYear ? 'opacity-0 pointer-events-none' : 'cursor-pointer hover:scale-125 hover:z-10'
            ]"
            @mouseenter="!day.isOutsideYear && (hoveredDay = day)"
            @mouseleave="hoveredDay = null"
            @click="!day.isOutsideYear && (clickedDay = clickedDay?.date === day.date ? null : day)"
          >
            <!-- Tiny Active Indicator -->
            <div v-if="activeDay?.date === day.date" class="absolute -inset-1 border border-white/20 rounded-[4px] animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Enhanced Tooltip -->
      <Transition name="tooltip">
        <div 
          v-if="activeDay && activeDay.date"
          class="absolute -top-12 left-1/2 -translate-x-1/2 glass px-4 py-2.5 rounded-2xl border-white/10 shadow-2xl pointer-events-none z-30 min-w-[120px] text-center"
        >
          <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-b border-r border-white/10 rotate-45"></div>
          <p class="text-[9px] font-black uppercase tracking-[0.2em] text-primary-500 mb-0.5">{{ formatDate(activeDay.date) }}</p>
          <p class="text-sm font-black text-white italic">{{ activeDay.count }} <span class="text-[10px] opacity-40 uppercase not-italic">Reps</span></p>
        </div>
      </Transition>
    </div>

    <div class="flex justify-between items-center text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-2 px-1">
      <span>{{ i18n.t('stats_less') || 'Less' }}</span>
      <div class="flex gap-1.5 grayscale opacity-50 contrast-125">
        <div class="w-2.5 h-2.5 rounded-[2px] bg-zinc-800/30"></div>
        <div class="w-2.5 h-2.5 rounded-[2px] bg-primary-900/40"></div>
        <div class="w-2.5 h-3 bg-primary-500 rounded-[2px]"></div>
        <div class="w-2.5 h-2.5 rounded-[2px] bg-primary-400"></div>
      </div>
      <span>{{ i18n.t('stats_more') || 'More' }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { CalendarDays } from 'lucide-vue-next';
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

const weeks = computed(() => {
  const result = [];
  const today = new Date();
  const year = today.getFullYear();
  
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  // Align start date to the beginning of the week (Monday)
  const startDay = startDate.getDay();
  const startDiff = startDate.getDate() - (startDay === 0 ? 6 : startDay - 1);
  const currentDate = new Date(year, 0, startDiff);

  // Align end date to the end of the week (Sunday)
  const lastDate = new Date(year, 11, 31);
  const lastDay = lastDate.getDay();
  const lastDiff = lastDay === 0 ? 0 : 7 - lastDay;
  const finalDate = new Date(year, 11, 31 + lastDiff);

  let currentWeek = [];

  while (currentDate <= finalDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayData = props.data.find(d => d.date.split('T')[0] === dateStr);
    const isWithinYear = currentDate.getFullYear() === year;
    const isFuture = currentDate > today;
    
    currentWeek.push({
      date: isWithinYear ? dateStr : '',
      count: dayData ? dayData.count : 0,
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
  if (day.count === 0) return 'bg-zinc-800/30';
  if (day.count < 10) return 'bg-primary-900/40';
  if (day.count < 20) return 'bg-primary-700/50';
  if (day.count < 30) return 'bg-primary-500/60 shadow-[0_0_15px_rgba(249,115,22,0.1)]';
  return 'bg-primary-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]';
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

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

    <div class="flex gap-6">
      <!-- Main Activity Grid Area -->
      <div class="flex-1 min-w-0 p-6 bg-zinc-900/30 border border-white/5 rounded-2xl relative">
        <div class="flex">
          <!-- Weekday Labels -->
          <div class="flex flex-col gap-1.5 pr-4 justify-center text-[9px] font-black text-zinc-600 uppercase tracking-tighter mt-6">
            <span class="h-[11px] leading-[11px]"></span>
            <span class="h-[11px] leading-[11px]">Mon</span>
            <span class="h-[11px] leading-[11px]"></span>
            <span class="h-[11px] leading-[11px]">Wed</span>
            <span class="h-[11px] leading-[11px]"></span>
            <span class="h-[11px] leading-[11px]">Fri</span>
            <span class="h-[11px] leading-[11px]"></span>
          </div>

          <div class="flex-1 overflow-x-auto scrollbar-hide">
            <!-- Month Labels -->
            <div class="flex gap-1.5 mb-2 h-4 relative">
              <span 
                v-for="month in monthLabels" :key="month.key" 
                class="absolute text-[9px] font-black text-zinc-600 uppercase tracking-widest whitespace-nowrap"
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
                  class="w-[11px] h-[11px] rounded-[2px] transition-all duration-300 relative group/day"
                  :class="[
                    getColorClass(day),
                    activeDay?.date === day.date ? 'ring-2 ring-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : '',
                    day.isOutsideYear ? 'opacity-0 pointer-events-none' : 'cursor-pointer hover:ring-2 hover:ring-white/20 hover:scale-110 hover:z-10'
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
        <div class="flex items-center justify-between mt-4 px-2">
          <p class="text-[9px] font-bold text-zinc-500">{{ i18n.t('how_we_count') || 'Learn how we count contributions' }}</p>
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Less</span>
            <div class="flex gap-1">
              <div class="w-2.5 h-2.5 rounded-[1px] bg-zinc-800/30"></div>
              <div class="w-2.5 h-2.5 rounded-[1px] bg-emerald-900/40"></div>
              <div class="w-2.5 h-2.5 rounded-[1px] bg-emerald-800/50"></div>
              <div class="w-2.5 h-2.5 rounded-[1px] bg-emerald-700/60"></div>
              <div class="w-2.5 h-2.5 rounded-[1px] bg-emerald-500/80 shadow-[0_0_10px_rgba(52,211,153,0.2)]"></div>
              <div class="w-2.5 h-2.5 rounded-[1px] bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]"></div>
            </div>
            <span class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">More</span>
          </div>
        </div>

        <!-- Tooltip -->
        <Transition name="tooltip">
          <div 
            v-if="activeDay && activeDay.date"
            class="absolute top-0 right-6 glass px-3 py-2 rounded-xl border-white/10 shadow-2xl pointer-events-none z-30 min-w-[100px] text-center"
          >
            <p class="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-0.5">{{ formatDate(activeDay.date) }}</p>
            <p class="text-xs font-black text-white">{{ activeDay.count }} <span class="opacity-40 font-bold uppercase text-[8px]">Reps</span></p>
          </div>
        </Transition>
      </div>

      <!-- Year Selector -->
      <div class="flex flex-col gap-2 min-w-[80px]">
        <div 
          v-for="y in [2026, 2025, 2024, 2023, 2022]" :key="y"
          class="px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center"
          :class="y === 2026 ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'"
        >
          {{ y }}
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

const monthLabels = computed(() => {
  const labels = [];
  const today = new Date();
  const year = today.getFullYear();
  
  for (let m = 0; m < 12; m++) {
    const startOfMonth = new Date(year, m, 1);
    // Calculate week offset
    const Jan1 = new Date(year, 0, 1);
    const dayOfJan1 = Jan1.getDay();
    const firstMonday = new Date(year, 0, 1 - (dayOfJan1 === 0 ? 6 : dayOfJan1 - 1));
    
    const diffWeeks = Math.floor((startOfMonth - firstMonday) / (7 * 24 * 60 * 60 * 1000));
    
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
  
  const startDate = new Date(year, 0, 1);
  
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
  if (day.count === 0) return 'bg-zinc-800/20';
  if (day.count < 10) return 'bg-emerald-900/40';
  if (day.count < 20) return 'bg-emerald-800/60';
  if (day.count < 30) return 'bg-emerald-700/70 border border-white/5';
  if (day.count < 40) return 'bg-emerald-600/80 shadow-[0_0_10px_rgba(52,211,153,0.1)]';
  if (day.count < 50) return 'bg-emerald-500/90 shadow-[0_0_15px_rgba(52,211,153,0.2)]';
  return 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]';
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

<template>
  <div class="relative flex flex-col gap-4 shadow transition-opacity duration-500 " :class="{ 'opacity-40 pointer-events-none': loading }">
    <!-- Calendar Header -->
    <div class="flex items-center justify-between px-1 ">
      <div class="flex flex-col">
        <h3 class="text-xl font-black uppercase tracking-tighter ">{{ currentMonthName }} {{ displayYear }}</h3>
        <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <span class="text-primary">{{ monthReps }}</span> {{ i18n.t('stats_reps') }} {{ i18n.locale === 'es' ? 'este mes' : 'this month' }}
        </p>
      </div>
      
      <div class="flex items-center gap-2 bg-surface/50 p-1 rounded-xl border border-white/5">
        <button @click="prevMonth" 
                :title="i18n.locale === 'es' ? 'Mes Anterior' : 'Previous Month'"
                :aria-label="i18n.locale === 'es' ? 'Mes Anterior' : 'Previous Month'"
                class="p-2 transition-colors text-zinc-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button @click="goToToday" 
                :title="i18n.locale === 'es' ? 'Ir a hoy' : 'Go to today'"
                class="px-3 py-1 text-[10px] font-black uppercase tracking-tight bg-white/5 rounded-md transition-colors  border border-white/10 hover:bg-white/10">
          {{ i18n.locale === 'es' ? 'Hoy' : 'Today' }}
        </button>
        <button @click="nextMonth" 
                :title="i18n.locale === 'es' ? 'Siguiente Mes' : 'Next Month'"
                :aria-label="i18n.locale === 'es' ? 'Siguiente Mes' : 'Next Month'"
                class="p-2 rounded-lg transition-colors text-zinc-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="relative bg-surface/30 border border-white/5 rounded-2xl p-4 group/board backdrop-blur-md overflow-x-auto custom-scrollbar min-w-0">
      <div class="min-w-[300px]"> <!-- Ensure a minimum readable width for the grid -->
        <!-- Day Detail Modal (Centered) -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="selectedDay" class="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-xl" @click="selectedDay = null"></div>
          
          <!-- Modal Card -->
          <div class="relative w-full max-w-[320px] bg-zinc-950/90 border border-white/10 rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.4)] p-10 overflow-hidden animate-in zoom-in duration-300 backdrop-blur-md">
            <!-- Premium Glow Effects -->
            <div class="absolute -top-20 -right-20 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
            <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>

            <!-- Close Button -->
            <button @click="selectedDay = null" 
                    class="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <XIcon class="w-5 h-5" />
            </button>
            
            <div class="relative flex flex-col items-center gap-6">
              <div class="flex flex-col items-center text-center">
                <span class="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">
                  {{ formatDate(selectedDay.date, true) }}
                </span>
                <h4 class="text-3xl font-black uppercase tracking-tighter text-white italic">
                  {{ formatDate(selectedDay.date, false) }}
                </h4>
              </div>

              <div class="w-full flex flex-col items-center gap-3 bg-white/[0.03] p-10 rounded-[2rem] border border-white/5 shadow-inner">
                <span class="text-6xl font-black text-primary leading-none tabular-nums italic drop-shadow-[0_0_20px_rgba(255,69,0,0.3)]">
                  {{ selectedDay.count }}
                </span>
                <span class="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">
                  {{ i18n.t('stats_reps').toUpperCase() }} TOTAL
                </span>
              </div>

              <!-- Exercise Breakdown List -->
              <div v-if="selectedDay.breakdown?.length > 0" class="w-full space-y-3">
                 <div class="flex items-center gap-2 px-1">
                    <div class="w-1 h-3 bg-primary/40 rounded-full"></div>
                    <p class="text-[9px] font-black text-muted uppercase tracking-widest leading-none">Protocol Breakdown</p>
                 </div>
                 
                 <div class="space-y-2">
                    <div v-for="item in selectedDay.breakdown" :key="item.type" 
                         class="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:border-white/10 transition-all">
                       <div class="flex items-center gap-4">
                          <div class="p-2 bg-surface/10 rounded-lg group-hover/item:text-primary transition-colors">
                            <component :is="getIconForType(item.type)" class="w-4 h-4 text-primary/60" />
                          </div>
                          <span class="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{{ i18n.t(item.type) }}</span>
                       </div>
                       <span class="text-lg font-black text-white tabular-nums">{{ item.count }}</span>
                    </div>
                 </div>
              </div>

              <button 
                @click="selectedDay = null"
                :title="i18n.locale === 'es' ? 'Cerrar Detalle' : 'Close Detail'"
                class="w-full py-5 text-[10px] font-black uppercase tracking-widest bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5 mt-2"
              >
                {{ i18n.locale === 'es' ? 'Cerrar' : 'Close' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

      <!-- Weekday Headers -->
      <div class="grid grid-cols-7 mb-4 ">
        <div v-for="day in weekdays" :key="day" class="text-center text-[10px] font-black uppercase tracking-widest text-zinc-500 pb-2">
          {{ day }}
        </div>
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-7 gap-1.5 sm:gap-2 lg:gap-3 rounded-2xl ">
        <button 
          v-for="(day, index) in calendarDays" 
          :key="day.date || index"
          class="aspect-square relative flex items-center justify-center rounded-xl transition-all duration-400 group/day hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
          :class="[
            day.isCurrentMonth ? 'cursor-pointer' : 'opacity-20 pointer-events-none grayscale',
            day.isToday ? 'ring-2 ring-primary/50 bg-primary/5' : ''
          ]"
          @click="day.isCurrentMonth && (selectedDay = day)"
          :title="day.isCurrentMonth ? `${day.dayNumber} ${currentMonthName}: ${day.count} reps` : ''"
        >
          <!-- Activity Indicator (Background Circle) -->
          <div 
            v-if="day.isCurrentMonth"
            class="absolute inset-1 rounded-lg transition-transform duration-500"
            :class="getColorClass(day)"
          ></div>

          <!-- Day Number -->
          <span 
            class="relative z-10 text-[11px] lg:text-sm font-black transition-colors"
            :class="[
              day.count > 0 ? 'text-white' : 'text-zinc-500',
              day.isToday ? 'text-primary' : ''
            ]"
          >
            {{ day.dayNumber }}
          </span>
        </button>
      </div>
    </div>
  </div>

    <!-- Mini Legend -->
    <div class="flex items-center justify-end gap-3 px-1 opacity-60 hover:opacity-100 transition-opacity">
      <span class="text-[9px] font-black uppercase tracking-widest text-zinc-500">Intensidad</span>
      <div class="flex gap-1.5">
        <div v-for="level in 4" :key="level" 
          class="w-2.5 h-2.5 rounded-full"
          :class="getLevelClass(level)">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18nStore } from '../stores/i18n';
import { Dumbbell, Zap, Flame, Target, Trophy, Globe, X as XIcon } from 'lucide-vue-next';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const i18n = useI18nStore();
const selectedDay = ref(null);

// State for navigation
const today = new Date();
const currentMonth = ref(today.getMonth());
const displayYear = ref(today.getFullYear());

const weekdays = computed(() => [
  i18n.t('day_mon'), i18n.t('day_tue'), i18n.t('day_wed'), 
  i18n.t('day_thu'), i18n.t('day_fri'), i18n.t('day_sat'), i18n.t('day_sun')
]);

const currentMonthName = computed(() => {
  const months = i18n.locale === 'es' 
    ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[currentMonth.value];
});

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    displayYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    displayYear.value++;
  } else {
    currentMonth.value++;
  }
};

const goToToday = () => {
  currentMonth.value = today.getMonth();
  displayYear.value = today.getFullYear();
};

const dataMap = computed(() => {
  return props.data.reduce((acc, curr) => {
    const dStr = new Date(curr.date).toISOString().split('T')[0];
    if (!acc[dStr]) {
      acc[dStr] = { total: 0, breakdown: [] };
    }
    acc[dStr].total += Number(curr.count);
    acc[dStr].breakdown.push({ type: curr.exercise_type, count: Number(curr.count) });
    return acc;
  }, {});
});

const monthReps = computed(() => {
  return calendarDays.value
    .filter(d => d.isCurrentMonth)
    .reduce((acc, curr) => acc + curr.count, 0);
});

const calendarDays = computed(() => {
  const days = [];
  const startOfMonth = new Date(displayYear.value, currentMonth.value, 1);
  const endOfMonth = new Date(displayYear.value, currentMonth.value + 1, 0);
  
  // Get Mon-Sun padding (Mon is 1 in JS, but 1 is Monday, 0 is Sunday)
  let firstDayIdx = startOfMonth.getDay() - 1;
  if (firstDayIdx === -1) firstDayIdx = 6; // Sunday fix

  // Padding days from prev month
  const prevMonthEnd = new Date(displayYear.value, currentMonth.value, 0);
  for (let i = firstDayIdx - 1; i >= 0; i--) {
    const d = new Date(prevMonthEnd);
    d.setDate(prevMonthEnd.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      count: 0
    });
  }

  // Days of current month
  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    const d = new Date(displayYear.value, currentMonth.value, i);
    const dStr = d.toISOString().split('T')[0];
    days.push({
      date: dStr,
      dayNumber: i,
      isCurrentMonth: true,
      count: dataMap.value[dStr]?.total || 0,
      breakdown: dataMap.value[dStr]?.breakdown || [],
      isToday: dStr === today.toISOString().split('T')[0]
    });
  }

  // Fill end of grid
  const remainingCells = 42 - days.length; // Standard 6 weeks grid
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(displayYear.value, currentMonth.value + 1, i);
    days.push({
      date: d.toISOString().split('T')[0],
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      count: 0
    });
  }

  return days;
});

const getLevelClass = (level) => {
  const levels = {
    1: 'bg-primary/10 border border-primary/20',
    2: 'bg-primary/30 border border-primary/40',
    3: 'bg-primary/60 border border-primary/80 shadow-[0_0_15px_hsla(var(--primary)/0.3)]',
    4: 'bg-primary border border-white/20 shadow-[0_0_20px_hsla(var(--primary)/0.5)]'
  };
  return levels[level] || 'bg-white/5 border border-white/5';
};

const getColorClass = (day) => {
  if (day.count === 0) return 'bg-white/[0.03] border border-white/[0.05]';
  if (day.count < 10) return getLevelClass(1);
  if (day.count < 30) return getLevelClass(2);
  if (day.count < 50) return getLevelClass(3);
  return getLevelClass(4);
};

const formatDate = (dateStr, isSecondary = false) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isSecondary) {
    return d.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric'
    });
  }
  return d.toLocaleDateString(undefined, { 
    month: 'long', 
    day: 'numeric' 
  });
};

const getIconForType = (type) => {
  const icons = {
    pullups: Dumbbell,
    pushups: Flame,
    muscleups: Zap,
    dips: Target,
    weighted_pullups: Trophy,
    all: Globe
  };
  return icons[type] || Dumbbell;
};
</script>

<style scoped>
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


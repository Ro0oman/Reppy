<template>
  <div class="flex flex-col gap-3 p-5 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl shadow-xl">
    <div class="flex items-center gap-2 mb-1">
      <CalendarDays class="w-4 h-4 text-primary-400" />
      <span class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Activity Graph</span>
    </div>
    
    <div class="flex justify-between items-center overflow-x-auto pb-2 scrollbar-hide">
      <div v-for="(week, wIndex) in weeks" :key="wIndex" class="flex flex-col gap-1.5">
        <div 
          v-for="(day, dIndex) in week" :key="dIndex"
          class="w-[11px] h-[11px] rounded-[2px] cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-white/20"
          :class="getColorClass(day.count)"
          :title="day.date ? `${day.date}: ${day.count} reps` : ''"
        ></div>
      </div>
    </div>

    <div class="flex justify-between items-center text-[10px] text-zinc-500 font-medium">
      <span>Less</span>
      <div class="flex gap-1.5">
        <div class="w-2.5 h-2.5 rounded-[2px] bg-zinc-800/50"></div>
        <div class="w-2.5 h-2.5 rounded-[2px] bg-primary-900/60"></div>
        <div class="w-2.5 h-2.5 rounded-[2px] bg-primary-700/60"></div>
        <div class="w-2.5 h-2.5 rounded-[2px] bg-primary-500/60"></div>
        <div class="w-2.5 h-2.5 rounded-[2px] bg-primary-300/60"></div>
      </div>
      <span>More</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { CalendarDays } from 'lucide-vue-next';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});

const weeks = computed(() => {
  const result = [];
  const today = new Date();
  const startDate = new Date();
  startDate.setFullYear(today.getFullYear() - 1);
  
  const dayOfWeek = startDate.getDay();
  const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  startDate.setDate(diff);

  let currentWeek = [];
  const currentDate = new Date(startDate);

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayData = props.data.find(d => d.date.split('T')[0] === dateStr);
    
    currentWeek.push({
      date: dateStr,
      count: dayData ? dayData.count : 0
    });

    if (currentWeek.length === 7) {
      result.push(currentWeek);
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', count: 0 });
    }
    result.push(currentWeek);
  }

  return result;
});

const getColorClass = (count) => {
  if (count === 0) return 'bg-zinc-800/30';
  if (count < 10) return 'bg-primary-900/60';
  if (count < 20) return 'bg-primary-700/60';
  if (count < 30) return 'bg-primary-500/60';
  return 'bg-primary-300/60';
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
</style>

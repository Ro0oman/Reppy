<template>
  <div class="flex flex-wrap items-center justify-between gap-1.5 p-1.5 bg-surface/40 backdrop-blur-3xl   rounded-[1.5rem] shadow-xl">
    <button 
      v-for="ex in exercises" :key="ex.id"
      @click="$emit('update:modelValue', ex.id)"
      class="group relative flex-1 flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl transition-all duration-400 overflow-hidden min-w-[130px]"
      :class="modelValue === ex.id 
        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 z-10' 
        : 'text-muted hover:text-foreground hover:bg-surface/10'"
    >
      <!-- Background Shimmer on Hover -->
      <div v-if="modelValue !== ex.id" class="absolute inset-x-0 bottom-0 h-0.5 bg-primary-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
       <component :is="ex.icon" :class="['w-4 h-4 transition-transform duration-500', modelValue === ex.id ? '' : 'group-hover:scale-110']" />
      <span class="text-[12px] font-bold tracking-tight font-tight">{{ i18n.t(ex.id) }}</span>
    </button>
  </div>
</template>

<script setup>
import { Dumbbell, Zap, Flame, Target, Trophy, Globe } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
 
const i18n = useI18nStore();

defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

defineEmits(['update:modelValue']);

const exercises = [
  { id: 'all', label: 'Global', icon: Globe },
  { id: 'pullups', label: 'Pullups', icon: Dumbbell },
  { id: 'muscleups', label: 'Muscle Ups', icon: Zap },
  { id: 'dips', label: 'Dips', icon: Target },
  { id: 'pushups', label: 'Pushups', icon: Flame },
  { id: 'weighted_pullups', label: 'Weighted', icon: Trophy },
];
</script>

<style scoped>
.font-tight { font-family: 'Inter Tight', sans-serif; }
</style>

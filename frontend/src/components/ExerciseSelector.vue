<template>
  <div class="flex flex-wrap items-center justify-between gap-1 p-1 bg-surface/40 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl">
    <button 
      v-for="ex in exercises" :key="ex.id"
      @click="$emit('update:modelValue', ex.id)"
      class="group relative flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden min-w-[120px]"
      :class="modelValue === ex.id 
        ? 'bg-primary-500 text-white shadow-[0_0_20px_rgba(255,69,0,0.3)] scale-[1.02] z-10' 
        : 'text-muted hover:text-foreground hover:bg-foreground/5'"
    >
      <!-- Background Shimmer on Hover -->
      <div v-if="modelValue !== ex.id" class="absolute inset-x-0 bottom-0 h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      
      <component :is="ex.icon" :class="['w-4 h-4 transition-transform duration-500', modelValue === ex.id ? 'scale-110' : 'group-hover:rotate-12']" />
      <span class="text-[11px] font-black uppercase tracking-[0.15em] font-tight">{{ ex.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { Dumbbell, Zap, Flame, Target, Trophy, Globe } from 'lucide-vue-next';

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

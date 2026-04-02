<template>
  <div class="flex flex-wrap gap-2 p-1.5 bg-black/5 dark:bg-black/40 backdrop-blur-xl border border-zinc-200 dark:border-white/5 rounded-2xl">
    <button 
      v-for="ex in exercises" :key="ex.id"
      @click="$emit('update:modelValue', ex.id)"
      class="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
      :class="modelValue === ex.id 
        ? 'bg-primary-600 text-zinc-900 dark:text-white shadow-lg shadow-primary-900/40 scale-105' 
        : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 hover:bg-white/5'"
    >
      <component :is="ex.icon" class="w-3.5 h-3.5" />
      <span>{{ ex.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { Dumbbell, Zap, Flame, Target, Trophy } from 'lucide-vue-next';

defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

defineEmits(['update:modelValue']);

const exercises = [
  { id: 'pullups', label: 'Dominadas', icon: Dumbbell },
  { id: 'muscleups', label: 'Muscle Ups', icon: Zap },
  { id: 'dips', label: 'Fondos', icon: Target },
  { id: 'pushups', label: 'Flexiones', icon: Flame },
  { id: 'weighted_pullups', label: 'Dominadas Lastre', icon: Trophy },
];
</script>

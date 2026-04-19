<template>
  <div class="relative group/selector">
    <div class="flex items-center justify-start gap-1 p-1 bg-surface/20 backdrop-blur-xl rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide mask-fade-right">
      <button 
        v-for="ex in exercises" :key="ex.id"
        @click="$emit('update:modelValue', ex.id)"
        :title="i18n.locale === 'es' ? `Filtrar por ${i18n.t(ex.id)}` : `Filter by ${i18n.t(ex.id)}`"
        class="group relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap"
        :class="modelValue === ex.id 
          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
          : 'text-muted/60 hover:text-foreground hover:bg-white/5'"
      >
        <component :is="ex.icon" :class="['w-4 h-4 transition-transform duration-300', modelValue === ex.id ? 'scale-110' : 'group-hover:scale-110']" />
        <span class="text-[11px] font-bold tracking-tight uppercase">{{ i18n.t(ex.id) }}</span>
      </button>
    </div>
    <!-- Simple right arrow indicator on mobile if scrolled (optional, but gradient is better) -->
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
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.mask-fade-right {
  mask-image: linear-gradient(to right, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
}

@media (min-width: 768px) {
  .mask-fade-right {
    mask-image: none;
    -webkit-mask-image: none;
  }
}
</style>

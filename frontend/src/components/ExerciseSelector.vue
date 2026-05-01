<template>
  <div v-if="compact" class="space-y-2">
    <div class="flex items-center justify-between px-1">
      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted/50">
        {{ isEs ? 'Ejercicio' : 'Exercise' }}
      </p>
      <p class="text-[10px] font-black uppercase tracking-tight text-primary-500">
        {{ currentExerciseLabel }}
      </p>
    </div>
    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      <button
        v-for="ex in exercises"
        :key="`compact-${ex.id}`"
        @click="$emit('update:modelValue', ex.id)"
        :aria-pressed="modelValue === ex.id"
        class="touch-action-manipulation shrink-0 h-10 px-3.5 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-wide transition-all active:scale-[0.98]"
        :class="modelValue === ex.id
          ? 'bg-primary-500/15 border-primary-500/40 text-foreground'
          : 'bg-surface/10 border-white/10 text-muted/80'"
      >
        <component :is="ex.icon" class="w-3.5 h-3.5" :class="modelValue === ex.id ? 'text-primary-500' : ''" />
        <span>{{ labelFor(ex.id, ex.fallbackEs, ex.fallbackEn) }}</span>
      </button>
    </div>
  </div>

  <div v-else class="space-y-3">
    <div class="flex items-center justify-between px-1">
      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted/50">
        {{ isEs ? 'Ejercicio activo' : 'Active exercise' }}
      </p>
      <p class="text-[11px] font-black uppercase tracking-tight text-primary-500">
        {{ currentExerciseLabel }}
      </p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <button
        v-for="ex in exercises"
        :key="ex.id"
        @click="$emit('update:modelValue', ex.id)"
        :title="isEs ? `Cambiar a ${labelFor(ex.id, ex.fallbackEs, ex.fallbackEn)}` : `Switch to ${labelFor(ex.id, ex.fallbackEs, ex.fallbackEn)}`"
        :aria-pressed="modelValue === ex.id"
        class="touch-action-manipulation rounded-2xl border p-3 text-left transition-all active:scale-[0.98]"
        :class="modelValue === ex.id
          ? 'bg-primary-500/15 border-primary-500/40 shadow-[0_0_20px_rgba(255,69,0,0.2)]'
          : 'bg-surface/10 border-white/10 hover:border-primary-500/25 hover:bg-white/[0.03]'"
      >
        <div class="flex items-start justify-between gap-2">
          <component
            :is="ex.icon"
            class="w-4.5 h-4.5 transition-transform"
            :class="modelValue === ex.id ? 'text-primary-500 scale-110' : 'text-muted/70'"
          />
          <span
            v-if="modelValue === ex.id"
            class="text-[8px] font-black uppercase tracking-wider text-primary-500"
          >
            {{ isEs ? 'Activo' : 'Active' }}
          </span>
        </div>
        <p
          class="mt-2 text-[12px] font-black uppercase tracking-tight leading-tight"
          :class="modelValue === ex.id ? 'text-foreground' : 'text-foreground/85'"
        >
          {{ labelFor(ex.id, ex.fallbackEs, ex.fallbackEn) }}
        </p>
        <p class="mt-1 text-[9px] font-bold tracking-tight text-muted/60">
          {{ isEs ? ex.hintEs : ex.hintEn }}
        </p>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Dumbbell, Zap, Flame, Target, Trophy, Globe } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';

const i18n = useI18nStore();

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update:modelValue']);

const isEs = computed(() => i18n.locale !== 'en');

const exercises = [
  {
    id: 'all',
    icon: Globe,
    fallbackEs: 'Resumen',
    fallbackEn: 'Overview',
    hintEs: 'Vista global del progreso',
    hintEn: 'Global progress view',
  },
  {
    id: 'pullups',
    icon: Dumbbell,
    fallbackEs: 'Dominadas',
    fallbackEn: 'Pull-ups',
    hintEs: 'Fuerza de traccion',
    hintEn: 'Pulling strength',
  },
  {
    id: 'pushups',
    icon: Flame,
    fallbackEs: 'Flexiones',
    fallbackEn: 'Push-ups',
    hintEs: 'Volumen rapido diario',
    hintEn: 'Quick daily volume',
  },
  {
    id: 'dips',
    icon: Target,
    fallbackEs: 'Fondos',
    fallbackEn: 'Dips',
    hintEs: 'Control y rango',
    hintEn: 'Control and range',
  },
  {
    id: 'muscleups',
    icon: Zap,
    fallbackEs: 'Muscle Ups',
    fallbackEn: 'Muscle Ups',
    hintEs: 'Explosividad tecnica',
    hintEn: 'Technical explosiveness',
  },
  {
    id: 'weighted_pullups',
    icon: Trophy,
    fallbackEs: 'Dominadas con Lastre',
    fallbackEn: 'Weighted Pull-ups',
    hintEs: 'Maxima intensidad',
    hintEn: 'Maximum intensity',
  },
];

const safeTranslate = (key) => {
  const translated = i18n.t(key);
  return translated === key ? null : translated;
};

const labelFor = (id, fallbackEs, fallbackEn) => {
  return safeTranslate(id) || (isEs.value ? fallbackEs : fallbackEn);
};

const currentExerciseLabel = computed(() => {
  const active = exercises.find((e) => e.id === props.modelValue);
  if (!active) return '';
  return labelFor(active.id, active.fallbackEs, active.fallbackEn);
});
</script>

<style scoped>
.touch-action-manipulation {
  touch-action: manipulation;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

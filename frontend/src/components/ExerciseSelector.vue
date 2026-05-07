<template>
<div>
  <div v-if="compact" class="space-y-2">
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-2">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted/50">
          {{ isEs ? 'Ejercicio' : 'Exercise' }}
        </p>
        <button type="button" @click="isModalOpen = true" class="text-[9px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-400 transition flex items-center gap-1 select-none">
          <Star class="w-3 h-3 fill-primary-500" />
          {{ isEs ? 'Editar favoritos' : 'Edit favorites' }}
        </button>
      </div>
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
        <span v-if="typeof ex.icon === 'string'" class="text-sm">{{ ex.icon }}</span>
        <component v-else :is="ex.icon" class="w-3.5 h-3.5" :class="modelValue === ex.id ? 'text-primary-500' : ''" />
        <span>{{ labelFor(ex.id, ex.fallbackEs, ex.fallbackEn) }}</span>
      </button>
    </div>
  </div>

  <div v-else class="space-y-3">
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-3">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted/50">
          {{ isEs ? 'Ejercicio activo' : 'Active exercise' }}
        </p>
        <button type="button" @click="isModalOpen = true" class="text-[9px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-400 transition flex items-center gap-1">
          <Star class="w-3 h-3 fill-primary-500" />
          {{ isEs ? 'Editar favoritos' : 'Edit favorites' }}
        </button>
      </div>
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
          <span v-if="typeof ex.icon === 'string'" class="text-base">{{ ex.icon }}</span>
          <component
            v-else
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

  <!-- Favorites Modal -->
  <FavoritesModal
    :is-open="isModalOpen"
    @close="isModalOpen = false"
    @saved="fetchFavorites"
  />
</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { Dumbbell, Zap, Flame, Target, Trophy, Globe, Star } from 'lucide-vue-next';
import FavoritesModal from './FavoritesModal.vue';
import { useI18nStore } from '../stores/i18n';
import { useAuthStore } from '../stores/auth';

const i18n = useI18nStore();
const authStore = useAuthStore();

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

const customFavorites = ref([]);
const isModalOpen = ref(false);

const fetchFavorites = async () => {
  try {
    const res = await fetch('/api/exercises/favorites', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        customFavorites.value = data;
      }
    }
  } catch (error) {
    console.error('Error fetching favorites:', error);
  }
};

onMounted(() => {
  fetchFavorites();
});

const defaultExercises = [
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
  {
    id: 'legs',
    icon: '🦵',
    fallbackEs: 'Pierna',
    fallbackEn: 'Legs',
    hintEs: 'Sentadillas y tren inferior',
    hintEn: 'Squats and lower body',
  },
];

const exercises = computed(() => {
  if (customFavorites.value && customFavorites.value.length > 0) {
    return [
      {
        id: 'all',
        icon: Globe,
        fallbackEs: 'Resumen',
        fallbackEn: 'Overview',
        hintEs: 'Vista global del progreso',
        hintEn: 'Global progress view',
      },
      ...customFavorites.value.map(f => ({
        id: f.slug,
        icon: f.slug === 'muscleups' ? Zap : f.slug === 'weighted_pullups' ? Trophy : f.slug === 'pushups' ? Flame : f.slug === 'legs' ? '🦵' : Dumbbell,
        fallbackEs: f.title_key.startsWith('ex_') ? i18n.t(f.title_key) : f.title_key,
        fallbackEn: f.title_key.startsWith('ex_') ? i18n.t(f.title_key) : f.title_key,
        hintEs: f.description_key,
        hintEn: f.description_key,
      }))
    ];
  }
  return defaultExercises;
});

const safeTranslate = (key) => {
  const translated = i18n.t(key);
  return translated === key ? null : translated;
};

const labelFor = (id, fallbackEs, fallbackEn) => {
  return safeTranslate(id) || (isEs.value ? fallbackEs : fallbackEn);
};

const currentExerciseLabel = computed(() => {
  const active = exercises.value.find((e) => e.id === props.modelValue);
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

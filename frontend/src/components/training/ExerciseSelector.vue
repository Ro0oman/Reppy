<template>
<div class="min-w-0 max-w-full">
  <!-- Compact mode (mobile Dashboard) -->
  <div v-if="compact" class="space-y-2">
    <!-- Header: just the label + edit link, minimal -->
    <div class="flex items-center justify-between px-0.5">
      <p class="text-xs font-semibold text-muted">{{ isEs ? 'Ejercicio' : 'Exercise' }}</p>
      <button type="button" @click="isModalOpen = true"
        class="favorites-chip favorites-chip-compact">
        <Star class="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
        <span>{{ isEs ? 'Favoritos' : 'Favorites' }}</span>
      </button>
    </div>
    <!-- Always-visible icon grid -->
    <div class="grid grid-cols-4 gap-1.5">
      <button
        v-for="ex in exercises"
        :key="`compact-${ex.id}`"
        @click="$emit('update:modelValue', ex.id)"
        :aria-pressed="modelValue === ex.id"
        class="touch-action-manipulation flex flex-col items-center justify-center gap-1 rounded-xl border py-2 px-1 text-center transition-all active:scale-[0.97]"
        :class="modelValue === ex.id
          ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20'
          : 'bg-foreground/[0.04] border-border text-muted hover:text-foreground hover:border-primary-500/30'"
      >
        <span v-if="typeof ex.icon === 'string'" class="text-base leading-none">{{ ex.icon }}</span>
        <component v-else :is="ex.icon" class="w-4 h-4 shrink-0" />
        <span class="w-full truncate text-[10px] font-semibold leading-tight">{{ labelFor(ex.id, ex.fallbackEs, ex.fallbackEn) }}</span>
      </button>
    </div>
  </div>

  <div v-else class="space-y-3">
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-3">
        <p class="text-[10px] font-semibold uppercase tracking-wide text-muted/60">
          {{ isEs ? 'Ejercicio activo' : 'Active exercise' }}
        </p>
        <button type="button" @click="isModalOpen = true" class="favorites-chip">
          <Star class="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          {{ isEs ? 'Editar favoritos' : 'Edit favorites' }}
        </button>
      </div>
      <p class="text-[11px] font-semibold text-primary-500">
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
          ? 'bg-primary-500/15 border-primary-500/40 shadow-sm'
          : 'bg-surface/10 border-border hover:border-primary-500/25 hover:bg-foreground/[0.03]'"
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
            class="text-[10px] font-semibold uppercase tracking-wide text-primary-500"
          >
            {{ isEs ? 'Activo' : 'Active' }}
          </span>
        </div>
        <p
          class="mt-2 text-[12px] font-semibold tracking-tight leading-tight"
          :class="modelValue === ex.id ? 'text-foreground' : 'text-foreground/85'"
        >
          {{ labelFor(ex.id, ex.fallbackEs, ex.fallbackEn) }}
        </p>
        <p class="mt-1 text-xs font-bold tracking-tight text-muted/60">
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
import FavoritesModal from '@/components/modals/FavoritesModal.vue';
import { useI18nStore } from '@/stores/i18n';
import { useAuthStore } from '@/stores/auth';

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
  // Hide the "Resumen"/overview ('all') entry. Used by the Dashboard quick-log,
  // where picking "all" is a dead-end (you can't log reps for "all exercises").
  hideOverview: {
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
  let list;
  if (customFavorites.value && customFavorites.value.length > 0) {
    list = [
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
  } else {
    list = defaultExercises;
  }
  return props.hideOverview ? list.filter(ex => ex.id !== 'all') : list;
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

.favorites-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(245 158 11 / 0.38);
  background:
    linear-gradient(135deg, rgb(245 158 11 / 0.16), rgb(99 102 241 / 0.12)),
    rgb(255 255 255 / 0.04);
  padding: 0.35rem 0.6rem;
  color: rgb(253 230 138);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0;

  
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease, color 160ms ease;
}

.favorites-chip:hover {
  border-color: rgb(251 191 36 / 0.7);
  color: rgb(254 243 199);
  
  transform: translateY(-1px);
}

.favorites-chip:active {
  transform: scale(0.96);
}

.favorites-chip-compact {
  min-height: 1.8rem;
  padding: 0.28rem 0.5rem;
  font-size: 0.65rem;
  letter-spacing: 0.02em;
}
</style>

<template>
  <div class="os-input-panel p-3 backdrop-blur-md">
    <!-- Header: COMBAT INPUT + racha (naranja = urgencia) -->
    <div class="mb-2.5 flex items-center justify-between gap-2">
      <div class="flex min-w-0 items-center gap-1.5">
        <Swords class="h-4 w-4 shrink-0" style="color: var(--os-cyan)" />
        <h3 class="os-label truncate">{{ i18n.t('battle_register_reps') }}</h3>
      </div>
      <span v-if="streak > 0" class="os-streak-chip os-num flex shrink-0 items-center gap-1 whitespace-nowrap">
        🔥 {{ streak }} {{ i18n.locale === 'es' ? 'días' : 'days' }}
      </span>
    </div>

    <!-- Exercise tabs (favorites) -->
    <div class="mb-1.5 flex items-center justify-between px-0.5">
      <span class="os-label os-label--muted">{{ i18n.t('battle_exercise') }}</span>
      <button @click="showFavorites = true"
        class="os-edit-chip flex items-center gap-1 transition active:scale-95">
        <Star class="h-3 w-3" />
        {{ isEs ? 'Editar' : 'Edit' }}
      </button>
    </div>
    <div class="grid grid-cols-4 gap-1">
      <button v-for="ex in exercises" :key="ex.id" @click="exerciseType = ex.id"
        class="os-ex-tab flex flex-col items-center gap-0.5 py-1.5 px-1 transition-all active:scale-95"
        :class="exerciseType === ex.id ? 'os-ex-tab--active' : ''">
        <span v-if="typeof ex.icon === 'string'" class="text-base leading-none">{{ ex.icon }}</span>
        <component v-else :is="ex.icon" class="h-4 w-4" />
        <span class="w-full truncate text-[9px] font-bold leading-tight">{{ ex.label }}</span>
      </button>

      <!-- Fill the last row so it never looks ragged; tapping edits favorites -->
      <button v-for="n in emptyExerciseSlots" :key="'ex-empty-' + n" @click="showFavorites = true"
        class="os-ex-tab os-ex-tab--empty flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 transition-all active:scale-95">
        <Plus class="h-4 w-4" />
      </button>
    </div>

    <FavoritesModal :is-open="showFavorites" @close="showFavorites = false" @saved="fetchFavorites" />

    <!-- Quantity stepper (48px táctil) -->
    <p class="os-label os-label--muted mt-2.5 mb-1 px-1">{{ i18n.t('battle_quantity') }}</p>
    <div class="grid items-center gap-2" style="grid-template-columns: 3rem 1fr 3rem">
      <button @click="dec" :disabled="quantity <= 1"
        class="os-stepper flex h-12 items-center justify-center transition-colors active:scale-95 disabled:opacity-30">
        <Minus class="h-5 w-5" />
      </button>
      <input v-model.number="quantity" type="number" min="1" inputmode="numeric"
        class="os-qty h-12 w-full min-w-0 text-center focus:outline-none" />
      <button @click="inc"
        class="os-stepper os-stepper--inc flex h-12 items-center justify-center transition-colors active:scale-95">
        <Plus class="h-5 w-5" />
      </button>
    </div>

    <!-- Quick add -->
    <div class="mt-2 grid grid-cols-4 gap-2">
      <button v-for="q in quickAdd" :key="q" @click="add(q)"
        class="os-quick os-num h-11 transition-all active:scale-95">
        +{{ q }}
      </button>
    </div>

    <!-- TRAIN: la acción dominante, azul de sistema -->
    <button @click="onTrain" :disabled="loading || quantity < 1"
      class="os-command mt-3 w-full disabled:opacity-50" style="min-height: 56px;">
      <div v-if="loading" class="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
      <Swords v-else class="h-5 w-5" />
      <span>{{ i18n.t('battle_train_cta') }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Swords, Plus, Minus, Dumbbell, Flame, Target, Zap, Trophy, Star } from 'lucide-vue-next';
import { useI18nStore } from '@/stores/i18n';
import { useAuthStore } from '@/stores/auth';
import FavoritesModal from '@/components/modals/FavoritesModal.vue';

const props = defineProps({
  loading: { type: Boolean, default: false },
  streak: { type: Number, default: 0 },
});
const emit = defineEmits(['train']);

const i18n = useI18nStore();
const authStore = useAuthStore();
const isEs = computed(() => i18n.locale !== 'en');

const exerciseType = ref('pullups');
const quantity = ref(10);
const quickAdd = [5, 10, 20, 50];

const showFavorites = ref(false);
const customFavorites = ref([]);

const iconForSlug = (slug) =>
  slug === 'muscleups' ? Zap
  : slug === 'weighted_pullups' ? Trophy
  : slug === 'pushups' ? Flame
  : slug === 'dips' ? Target
  : slug === 'legs' ? '🦵'
  : Dumbbell;

const defaultExercises = [
  { id: 'pullups', icon: Dumbbell, label: isEs.value ? 'Dominadas' : 'Pull-ups' },
  { id: 'pushups', icon: Flame, label: isEs.value ? 'Flexiones' : 'Push-ups' },
  { id: 'dips', icon: Target, label: isEs.value ? 'Fondos' : 'Dips' },
  { id: 'muscleups', icon: Zap, label: 'Muscle Ups' },
];

const exercises = computed(() => {
  if (customFavorites.value.length > 0) {
    return customFavorites.value.slice(0, 8).map((f) => ({
      id: f.slug,
      icon: iconForSlug(f.slug),
      label: f.title_key?.startsWith('ex_') ? i18n.t(f.title_key) : f.title_key,
    }));
  }
  return defaultExercises;
});

// Number of dashed "+" cells needed to complete the last row of 4.
const emptyExerciseSlots = computed(() => (4 - (exercises.value.length % 4)) % 4);

const fetchFavorites = async () => {
  try {
    const res = await fetch('/api/exercises/favorites', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) customFavorites.value = data;
    }
  } catch (e) {
    console.error('Error fetching favorites:', e);
  }
  // Keep selection valid against the (possibly new) list.
  if (!exercises.value.some((e) => e.id === exerciseType.value)) {
    exerciseType.value = exercises.value[0]?.id || 'pullups';
  }
};

onMounted(fetchFavorites);

const normalized = computed(() => Math.max(1, Math.floor(Number(quantity.value) || 0)));

const inc = () => { quantity.value = normalized.value + 1; };
const dec = () => { quantity.value = Math.max(1, normalized.value - 1); };
const add = (n) => { quantity.value = normalized.value + n; };

const onTrain = () => {
  if (props.loading) return;
  emit('train', { exerciseType: exerciseType.value, count: normalized.value });
};
</script>

<style scoped>
.os-input-panel {
  background: rgba(8, 13, 21, 0.88);
  border: 1px solid var(--os-line);
  border-radius: 2px;
}
.os-streak-chip {
  border: 1px solid rgba(255, 106, 50, 0.4);
  border-radius: 2px;
  background: #1a1410;
  padding: 3px 8px;
  font: 500 10px var(--os-font-mono);
  letter-spacing: 0.8px;
  color: #ff8a4d;
}
.os-edit-chip {
  border: 1px solid var(--os-line);
  border-radius: 2px;
  background: var(--os-panel-raised);
  padding: 3px 8px;
  font: 500 10px var(--os-font-mono);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--os-muted);
}
.os-edit-chip:hover { color: var(--os-text); border-color: var(--os-line-strong); }
.os-ex-tab {
  border: 1px solid var(--os-line);
  border-radius: 2px;
  background: var(--os-panel);
  color: var(--os-muted);
}
.os-ex-tab:hover { color: var(--os-text); }
.os-ex-tab--active {
  border-color: var(--os-cyan);
  background: #12336e;
  color: #fff;
}
.os-ex-tab--empty {
  border-style: dashed;
  background: transparent;
  color: rgba(137, 149, 170, 0.4);
}
.os-stepper {
  border: 1px solid var(--os-line-strong);
  border-radius: 2px;
  background: transparent;
  color: var(--os-text);
}
.os-stepper--inc { border-color: var(--os-blue); color: #7db2ff; }
.os-qty {
  border: 1px solid var(--os-line-strong);
  border-radius: 2px;
  background: var(--os-ink);
  color: var(--os-text);
  font: 700 2rem / 1 var(--os-font-display);
  font-variant-numeric: tabular-nums;
}
.os-qty:focus { border-color: var(--os-cyan); }
.os-quick {
  border: 1px solid var(--os-line);
  border-radius: 2px;
  background: var(--os-panel);
  color: rgba(243, 246, 251, 0.8);
  font: 500 12px var(--os-font-mono);
}
.os-quick:hover { border-color: var(--os-line-strong); color: var(--os-text); }

.h-13 { height: 3.25rem; }
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type='number'] { -moz-appearance: textfield; appearance: textfield; }
</style>

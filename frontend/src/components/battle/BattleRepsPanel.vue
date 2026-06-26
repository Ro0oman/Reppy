<template>
  <div class="rounded-3xl border border-white/10 bg-black/30 p-3 backdrop-blur-md">
    <!-- Header: title + streak -->
    <div class="mb-2 flex items-center justify-between gap-2">
      <div class="flex min-w-0 items-center gap-1.5">
        <Swords class="h-4 w-4 shrink-0 text-orange-400" />
        <h3 class="truncate text-[11px] font-black uppercase tracking-[0.12em] text-white/80">{{ i18n.t('battle_register_reps') }}</h3>
      </div>
      <span v-if="streak > 0" class="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-orange-400/30 bg-orange-500/10 px-2 py-1 text-[11px] font-bold text-orange-200">
        🔥 {{ streak }} {{ i18n.locale === 'es' ? 'días' : 'days' }}
      </span>
    </div>

    <!-- Exercise tabs (favorites) -->
    <div class="mb-1.5 flex items-center justify-between px-0.5">
      <span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{{ i18n.t('battle_exercise') }}</span>
      <button @click="showFavorites = true"
        class="flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-200 transition active:scale-95 hover:bg-amber-500/20">
        <Star class="h-3 w-3 fill-amber-300 text-amber-300" />
        {{ isEs ? 'Editar' : 'Edit' }}
      </button>
    </div>
    <div class="grid grid-cols-4 gap-1">
      <button v-for="ex in exercises" :key="ex.id" @click="exerciseType = ex.id"
        class="flex flex-col items-center gap-0.5 rounded-xl border py-1.5 px-1 transition-all active:scale-95"
        :class="exerciseType === ex.id
          ? 'border-orange-400/50 bg-orange-500/15 text-orange-200'
          : 'border-white/10 bg-white/5 text-white/55 hover:text-white'">
        <span v-if="typeof ex.icon === 'string'" class="text-base leading-none">{{ ex.icon }}</span>
        <component v-else :is="ex.icon" class="h-4 w-4" />
        <span class="w-full truncate text-[9px] font-bold leading-tight">{{ ex.label }}</span>
      </button>

      <!-- Fill the last row so it never looks ragged; tapping edits favorites -->
      <button v-for="n in emptyExerciseSlots" :key="'ex-empty-' + n" @click="showFavorites = true"
        class="flex flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-1.5 px-1 text-white/25 transition-all active:scale-95 hover:border-amber-400/30 hover:text-amber-300/60">
        <Plus class="h-4 w-4" />
      </button>
    </div>

    <FavoritesModal :is-open="showFavorites" @close="showFavorites = false" @saved="fetchFavorites" />

    <!-- Quantity stepper -->
    <p class="mt-2 mb-1 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{{ i18n.t('battle_quantity') }}</p>
    <div class="grid items-center gap-2" style="grid-template-columns: 2.75rem 1fr 2.75rem">
      <button @click="dec" :disabled="quantity <= 1"
        class="flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors active:scale-95 disabled:opacity-30">
        <Minus class="h-5 w-5" />
      </button>
      <input v-model.number="quantity" type="number" min="1" inputmode="numeric"
        class="h-10 w-full min-w-0 rounded-2xl border border-white/10 bg-black/40 text-center text-2xl font-black text-white focus:border-orange-400/50 focus:outline-none" />
      <button @click="inc"
        class="flex h-10 items-center justify-center rounded-2xl border border-orange-400/40 bg-orange-500/10 text-orange-300 transition-colors active:scale-95">
        <Plus class="h-5 w-5" />
      </button>
    </div>

    <!-- Quick add -->
    <div class="mt-2 grid grid-cols-4 gap-2">
      <button v-for="q in quickAdd" :key="q" @click="add(q)"
        class="h-9 rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-white/80 transition-all active:scale-95 hover:border-orange-400/40">
        +{{ q }}
      </button>
    </div>

    <!-- TRAIN -->
    <button @click="onTrain" :disabled="loading || quantity < 1"
      class="mt-3 flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-50">
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
.h-13 { height: 3.25rem; }
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type='number'] { -moz-appearance: textfield; appearance: textfield; }
</style>

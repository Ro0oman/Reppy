<template>
  <div class="flex flex-col gap-3">

    <!-- Exercise label + damage chip (subtle, not prominent) -->
    <div class="flex items-center justify-between px-1">
      <p class="text-sm font-semibold text-muted">{{ activeLabel }}</p>
      <div v-if="damagePreview.total > 0" class="flex items-center gap-1.5 text-xs text-muted/60">
        <Zap class="w-3.5 h-3.5 text-primary-500/60" />
        <span class="tabular-nums">{{ damagePreview.total }} dmg</span>
      </div>
    </div>

    <!-- Quick presets -->
    <div class="grid grid-cols-4 gap-2">
      <button
        v-for="preset in quickPresets"
        :key="preset"
        @click="setReps(preset)"
        :disabled="loading"
        class="touch-action-manipulation h-14 rounded-2xl border text-lg font-bold transition-all active:scale-95"
        :class="selectedReps === preset
          ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/25'
          : 'bg-foreground/[0.04] border-border text-foreground hover:border-primary-500/40 hover:bg-foreground/[0.07]'"
      >
        {{ preset }}
      </button>
    </div>

    <!-- Custom counter -->
    <!-- grid garantiza que el + nunca se empuje fuera, sin importar el min-width del input -->
    <div class="grid items-center gap-2" style="grid-template-columns: 3.5rem 1fr 3.5rem">
      <button
        @click="decrementReps"
        :disabled="loading || selectedReps <= 1"
        class="touch-action-manipulation h-14 w-full rounded-2xl border border-border/80 bg-foreground/[0.08] text-foreground font-bold active:scale-95 disabled:opacity-30 flex items-center justify-center hover:bg-foreground/[0.12] transition-colors"
        aria-label="Quitar rep"
      >
        <Minus class="w-5 h-5" />
      </button>
      <input
        v-model.number="selectedReps"
        type="number"
        min="1"
        inputmode="numeric"
        pattern="[0-9]*"
        class="touch-action-manipulation h-14 w-full min-w-0 rounded-2xl border border-border bg-foreground/[0.03] px-2 text-center text-3xl font-bold text-foreground focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
      />
      <button
        @click="incrementReps"
        :disabled="loading"
        class="touch-action-manipulation h-14 w-full rounded-2xl border border-primary-500/40 bg-primary-500/10 text-primary-500 font-bold active:scale-95 disabled:opacity-30 flex items-center justify-center hover:bg-primary-500/20 transition-colors"
        aria-label="Añadir rep"
      >
        <Plus class="w-5 h-5" />
      </button>
    </div>

    <!-- Extra weight for weighted pullups -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-1 opacity-0"
    >
      <div v-if="exerciseType === 'weighted_pullups'" class="flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/5 px-4 py-3">
        <p class="text-xs font-semibold text-accent/80 shrink-0">{{ uiText.extraWeight }}</p>
        <div class="relative flex-1">
          <input
            v-model.number="addedWeight"
            type="number" min="0" step="0.5" inputmode="decimal" placeholder="0"
            class="h-10 w-full rounded-xl border border-accent/20 bg-black/10 px-3 pr-10 text-sm font-bold text-accent focus:outline-none focus:border-accent/50"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-accent/60">KG</span>
        </div>
      </div>
    </transition>

    <!-- CTA -->
    <button
      @click="submitReps"
      :disabled="!canSubmit"
      class="touch-action-manipulation h-14 w-full rounded-2xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-40 disabled:grayscale text-white font-bold text-base tracking-tight transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-lg shadow-primary-500/20"
    >
      <Check v-if="!loading" class="w-5 h-5" />
      <div v-else class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      <span>{{ ctaText }}</span>
    </button>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Zap, Check, Sword, Plus, Minus } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { useRepLogger } from '@/composables/useRepLogger';
import { estimateDamage } from '@/utils/damageCalculator';

const { loading, logReps } = useRepLogger();
const authStore = useAuthStore();
const props = defineProps({
  exerciseType: {
    type: String,
    default: 'pullups'
  }
});

const i18n = useI18nStore();
const emit = defineEmits(['updated']);
const selectedReps = ref(10);
const addedWeight = ref(null);
const quickPresets = [1, 5, 10, 20];

const isEs = computed(() => i18n.locale !== 'en');

const uiText = computed(() => isEs.value
  ? { extraWeight: 'Lastre adicional', cta: 'Registrar' }
  : { extraWeight: 'Extra weight', cta: 'Log' });

const activeLabel = computed(() => {
  return i18n.t(props.exerciseType);
});

const damagePreview = computed(() => {
  const reps = Number(selectedReps.value) || 0;
  return estimateDamage(authStore.user, reps, props.exerciseType);
});

const normalizedReps = computed(() => {
  const parsed = Number(selectedReps.value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
});

const canSubmit = computed(() => normalizedReps.value > 0 && !loading.value);

const ctaText = computed(() => `${uiText.value.cta} ${Math.max(1, normalizedReps.value)} ${i18n.t('ui_reps')}`);

const setReps = (value) => {
  selectedReps.value = value;
};

const incrementReps = () => {
  selectedReps.value = Math.max(1, normalizedReps.value + 1);
};

const decrementReps = () => {
  selectedReps.value = Math.max(1, normalizedReps.value - 1);
};

const submitReps = async () => {
  const repsToSubmit = Math.max(1, normalizedReps.value);
  const res = await logReps({
    count: repsToSubmit,
    exerciseType: props.exerciseType,
    addedWeight: addedWeight.value || 0,
  });
  if (res) emit('updated');
};
</script>

<style scoped>
.touch-action-manipulation { touch-action: manipulation; }

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>

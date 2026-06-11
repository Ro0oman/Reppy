<template>
  <div class="flex flex-col gap-3">

    <!-- Exercise label + damage chip (subtle pill) -->
    <div class="flex items-center justify-between gap-3">
      <p class="text-base font-semibold tracking-tight text-foreground">{{ activeLabel }}</p>
      <div v-if="damagePreview.total > 0" class="flex items-center gap-1.5 rounded-full bg-primary-500/10 px-2.5 py-1 text-[11px] font-semibold text-primary-400">
        <Zap class="w-3 h-3" />
        <span class="tabular-nums">{{ damagePreview.total }} dmg</span>
      </div>
    </div>

    <!-- Custom counter: circular −/+ around a clean number -->
    <div class="grid items-center gap-3 py-1" style="grid-template-columns: 3.5rem 1fr 3.5rem">
      <button
        @click="decrementReps"
        :disabled="loading || selectedReps <= 1"
        class="touch-action-manipulation h-14 w-14 rounded-full border border-foreground/10 bg-foreground/[0.04] text-foreground active:scale-95 disabled:opacity-30 flex items-center justify-center hover:bg-foreground/[0.08] transition-colors"
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
        class="touch-action-manipulation h-16 w-full min-w-0 bg-transparent px-2 text-center text-5xl font-bold tabular-nums text-foreground focus:outline-none"
      />
      <button
        @click="incrementReps"
        :disabled="loading"
        class="touch-action-manipulation h-14 w-14 rounded-full bg-primary-500 text-white active:scale-95 disabled:opacity-30 flex items-center justify-center hover:bg-primary-400 transition-colors"
        aria-label="Añadir rep"
      >
        <Plus class="w-5 h-5" />
      </button>
    </div>

    <!-- Quick presets: segmented pill chips -->
    <div class="grid grid-cols-4 gap-2">
      <button
        v-for="preset in quickPresets"
        :key="preset"
        @click="setReps(preset)"
        :disabled="loading"
        class="touch-action-manipulation h-11 rounded-full border text-base font-semibold tabular-nums transition-all active:scale-95"
        :class="selectedReps === preset
          ? 'bg-primary-500 text-white border-primary-500'
          : 'bg-transparent border-foreground/10 text-muted hover:text-foreground hover:border-primary-500/40'"
      >
        {{ preset }}
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
import axios from 'axios';
import { Zap, Check, Sword, Plus, Minus } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';
import { useDamageStore } from '@/stores/damage';
import { getLocalDateString } from '@/utils/dateUtils.js';
import { markPushPromptEligible } from '@/utils/pushEligibility.js';
import { useAudio } from '@/composables/useAudio';
import { estimateDamage } from '@/utils/damageCalculator';

const { playHit } = useAudio();
const authStore = useAuthStore();
const props = defineProps({
  exerciseType: {
    type: String,
    default: 'pullups'
  }
});

const i18n = useI18nStore();
const notificationStore = useNotificationStore();
const emit = defineEmits(['updated']);
const selectedReps = ref(10);
const addedWeight = ref(null);
const quickPresets = [1, 5, 10, 20];

const isEs = computed(() => i18n.locale !== 'en');

const uiText = computed(() => {
  if (isEs.value) {
    return {
      title: 'Registra tus reps',
      subtitle: 'Rapido, claro y pensado para movil',
      impact: 'Daño mínimo',
      quickPresets: 'Presets rapidos',
      repsLabel: 'Repeticiones',
      extraWeight: 'Lastre adicional',
      cta: 'Registrar',
    };
  }
  return {
    title: 'Log your reps',
    subtitle: 'Fast, clear and mobile-first',
    impact: 'Minimum damage',
    quickPresets: 'Quick presets',
    repsLabel: 'Repetitions',
    extraWeight: 'Extra weight',
    cta: 'Log',
  };
});

const activeLabel = computed(() => {
  return i18n.t(props.exerciseType);
});

const loading = ref(false);

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

const addReps = async (count) => {
  if (!count || loading.value) return;
  
  loading.value = true;
  playHit();
  try {
    const today = getLocalDateString();
    const res = await axios.post('/api/reps', {
      count,
      date: today,
      exercise_type: props.exerciseType,
      added_weight: addedWeight.value || 0
    });
    
    // Damage animation
    const damageToAnimate = res.data.damage_dealt_this_set ?? res.data.boss_damage_dealt;
    if (damageToAnimate > 0) {
      const damageStore = useDamageStore();
      damageStore.addDamage(damageToAnimate, props.exerciseType, undefined, undefined, res.data.is_crit);
    }

    // ── 5/7 JACKPOT feedback ──────────────────────────────────────────
    if (res.data.jackpot_awarded) {
      const jackpotMsg = i18n.locale === 'es'
        ? `🎉 ¡Bonus semanal! +${res.data.jackpot_coins} RC por entrenar ${5} días esta semana`
        : `🎉 Weekly bonus! +${res.data.jackpot_coins} RC for training ${5} days this week`;
      notificationStore.notify(jackpotMsg, 'success');
      // Big confetti burst
      try {
        const { default: confetti } = await import('canvas-confetti');
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ['#3b82f6','#60a5fa','#34d399','#fbbf24'] });
      } catch (_) {}
    } else {
      const msg = i18n.locale === 'es' ? `+${count} reps registradas` : `+${count} reps logged`;
      notificationStore.notify(msg, 'success');
    }
    // ─────────────────────────────────────────────────────────────────

    // Refresh global user state to sync header level/XP
    const authStore = useAuthStore();
    await authStore.fetchProfile();
    markPushPromptEligible();

    emit('updated');
  } catch (error) {
    console.error('Error logging reps:', error);
    notificationStore.notify('Failed to log reps', 'error');
  } finally {
    loading.value = false;
  }
};

const submitReps = async () => {
  const repsToSubmit = Math.max(1, normalizedReps.value);
  await addReps(repsToSubmit);
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

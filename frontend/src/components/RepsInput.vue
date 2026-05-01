<template>
  <div class="relative overflow-hidden group transition-all duration-500">
    <div class="bg-surface/10 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-3 sm:p-8 relative overflow-hidden transition-all hover:bg-surface/20">
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary-500/10 transition-all duration-700"></div>

      <div class="relative z-10 flex flex-col gap-4 sm:gap-6">
        <header class="space-y-1.5">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted/40">
            {{ activeLabel }}
          </p>
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-none">
              {{ uiText.title }}
            </h3>
            <div v-if="damagePreview.total > 0" class="shrink-0 text-right">
              <p class="text-[8px] font-black uppercase tracking-wider text-muted/50">
                {{ uiText.impact }}
              </p>
              <div class="mt-0.5 flex items-center justify-end gap-1">
                <span class="text-base sm:text-xl font-black italic tracking-tight text-foreground">{{ damagePreview.total }}</span>
                <Sword class="w-3.5 h-3.5 text-primary-500 animate-pulse" />
              </div>
            </div>
            <div v-else class="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20 shrink-0">
              <Zap class="w-4 h-4 text-primary-500" />
            </div>
          </div>
          <p class="text-[10px] sm:text-xs text-muted/70">
            {{ uiText.subtitle }}
          </p>
        </header>

        <section class="space-y-2">
          <p class="text-[10px] font-black uppercase tracking-wider text-muted/50">{{ uiText.quickPresets }}</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              v-for="preset in quickPresets"
              :key="preset"
              @click="setReps(preset)"
              :disabled="loading"
              class="touch-action-manipulation h-12 rounded-xl border text-base font-black transition-all active:scale-95"
              :class="selectedReps === preset ? 'bg-primary-500 text-white border-primary-400 shadow-[0_0_18px_rgba(255,69,0,0.35)]' : 'bg-white/[0.02] border-white/10 text-foreground hover:border-primary-500/40'"
            >
              {{ preset }}
            </button>
          </div>
        </section>

        <section class="rounded-2xl border border-white/10 bg-black/10 p-2.5 sm:p-4">
          <p class="text-[10px] font-black uppercase tracking-wider text-muted/50">{{ uiText.repsLabel }}</p>
          <div class="mt-2 grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-2">
            <button
              @click="decrementReps"
              :disabled="loading || selectedReps <= 1"
              class="touch-action-manipulation h-12 w-12 rounded-xl border border-white/10 bg-white/[0.04] text-foreground font-black text-2xl leading-none active:scale-95 disabled:opacity-30"
              aria-label="Decrease reps"
            >
              <Minus class="w-5 h-5 mx-auto" />
            </button>
            <input
              v-model.number="selectedReps"
              type="number"
              min="1"
              inputmode="numeric"
              pattern="[0-9]*"
              class="h-12 flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-center text-2xl font-black italic tracking-tight text-foreground focus:outline-none focus:border-primary-500/40"
            />
            <button
              @click="incrementReps"
              :disabled="loading"
              class="touch-action-manipulation h-12 w-12 rounded-xl border border-white/10 bg-white/[0.04] text-foreground font-black text-2xl leading-none active:scale-95 disabled:opacity-30"
              aria-label="Increase reps"
            >
              <Plus class="w-5 h-5 mx-auto" />
            </button>
          </div>
        </section>

        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <section v-if="exerciseType === 'weighted_pullups'" class="rounded-2xl border border-accent/20 bg-accent/5 p-2.5 sm:p-4">
            <p class="text-[10px] font-black uppercase tracking-wider text-accent/80">{{ uiText.extraWeight }}</p>
            <div class="mt-2 relative">
              <input
                v-model.number="addedWeight"
                type="number"
                min="0"
                step="0.5"
                inputmode="decimal"
                placeholder="0"
                class="h-11 w-full rounded-xl border border-accent/20 bg-black/10 px-4 pr-12 text-base font-black text-accent focus:outline-none focus:border-accent/40"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-accent/70">KG</span>
            </div>
          </section>
        </transition>

        <footer class="pb-[calc(0.25rem+env(safe-area-inset-bottom))]">
          <button
            @click="submitReps"
            :disabled="!canSubmit"
            class="touch-action-manipulation h-12 w-full rounded-xl bg-primary-500 hover:bg-primary-400 disabled:opacity-30 disabled:grayscale text-white font-black uppercase tracking-wider text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Check v-if="!loading" class="w-4.5 h-4.5" />
            <div v-else class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            <span>{{ ctaText }}</span>
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { Zap, Check, Sword, Plus, Minus } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import { useNotificationStore } from '../stores/notification';
import { useDamageStore } from '../stores/damage';
import { getLocalDateString } from '../utils/dateUtils.js';
import { useAudio } from '../composables/useAudio';
import { estimateDamage } from '../utils/damageCalculator';

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
      impact: 'Impacto estimado',
      quickPresets: 'Presets rapidos',
      repsLabel: 'Repeticiones',
      extraWeight: 'Lastre adicional',
      cta: 'Registrar',
    };
  }
  return {
    title: 'Log your reps',
    subtitle: 'Fast, clear and mobile-first',
    impact: 'Estimated impact',
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
    
    let msg = `+${count} logged`;
    notificationStore.notify(msg, 'success');
    
    // Trigger JRPG damage animation if boss damage was dealt
    const damageToAnimate = res.data.damage_dealt_this_set ?? res.data.boss_damage_dealt;
    if (damageToAnimate > 0) {
      const damageStore = useDamageStore();
      damageStore.addDamage(damageToAnimate, props.exerciseType, undefined, undefined, res.data.is_crit);
    }
    
    // Refresh global user state to sync header level/XP
    const authStore = useAuthStore();
    await authStore.fetchProfile();
    
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
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
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

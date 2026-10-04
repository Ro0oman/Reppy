<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="cursor-pointer fixed inset-0 z-[140] flex items-end sm:items-center justify-center p-2 sm:p-6 bg-background/90 backdrop-blur-md"
      @click.self="closeModal"
    >
      <div
        class="w-full max-w-lg max-h-[92vh] overflow-y-auto cursor-default rounded-xl border border-white/10 bg-surface/95 shadow-2xl"
        role="dialog"
        aria-modal="true"
        :aria-label="i18n.t('qs_title')"
      >
        <div class="relative p-5 sm:p-7">
          <div class="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary-500/10 blur-[100px] pointer-events-none"></div>

          <div class="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-wide text-primary-500">{{ i18n.t('qs_kicker') }}</p>
              <h3 class="mt-1.5 text-2xl font-bold tracking-tight text-foreground leading-tight">
                {{ i18n.t('qs_title') }}
              </h3>
            </div>
            <button
              type="button"
              @click="closeModal"
              class="shrink-0 min-h-[44px] min-w-[44px] grid place-items-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              :aria-label="i18n.t('qs_close')"
            >
              <X class="w-5 h-5 text-foreground" />
            </button>
          </div>

          <div class="relative z-10 mt-5 flex items-center gap-2" aria-hidden="true">
            <div
              v-for="n in 3"
              :key="n"
              class="h-1.5 rounded-full transition-all duration-300"
              :class="step >= n - 1 ? 'bg-primary-500 w-14' : 'bg-white/10 w-8'"
            />
          </div>

          <section class="mt-5 min-h-[300px] relative z-10">
            <!-- Paso 1: qué es Reppy -->
            <div v-if="step === 0" class="space-y-3">
              <p class="text-base font-bold text-foreground">{{ i18n.t('qs_step1_title') }}</p>
              <p class="text-sm text-muted leading-relaxed">{{ i18n.t('qs_step1_desc') }}</p>
              <div class="grid grid-cols-2 gap-2 pt-1">
                <div
                  v-for="card in featureCards"
                  :key="card.title"
                  class="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <component :is="card.icon" class="h-4 w-4 text-primary-500" />
                  <p class="mt-2 text-xs font-bold text-foreground">{{ card.title }}</p>
                  <p class="mt-1 text-xs leading-snug text-muted/80">{{ card.desc }}</p>
                </div>
              </div>
            </div>

            <!-- Paso 2: punto de partida (opcional) -->
            <div v-else-if="step === 1" class="space-y-4">
              <p class="text-base font-bold text-foreground">{{ i18n.t('qs_step2_title') }}</p>
              <p class="text-sm text-muted leading-relaxed">{{ i18n.t('qs_step2_desc') }}</p>

              <div class="space-y-2">
                <p class="text-xs font-bold text-muted/80">{{ i18n.t('onb_level_label') }}</p>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="level in levelOptions"
                    :key="level.id"
                    type="button"
                    @click="selectLevel(level)"
                    class="min-h-[56px] rounded-lg border px-1 py-2 text-center transition-all"
                    :class="selectedLevel === level.id ? 'bg-primary-500 text-white border-primary-400' : 'bg-white/[0.03] border-white/10 text-foreground'"
                  >
                    <span class="block text-sm font-bold">{{ i18n.t(level.key) }}</span>
                    <span class="block text-xs opacity-80">{{ i18n.t('onb_level_goal', { n: level.goal }) }}</span>
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-xs font-bold text-muted/80">{{ i18n.t('qs_exercise') }}</p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="option in exerciseOptions"
                    :key="option.id"
                    type="button"
                    @click="selectedExercise = option.id"
                    class="min-h-[44px] rounded-lg border text-sm font-semibold transition-all"
                    :class="selectedExercise === option.id ? 'bg-primary-500 text-white border-primary-400' : 'bg-white/[0.03] border-white/10 text-foreground'"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Paso 3: cómo empezar (nada se registra sin decidirlo) -->
            <div v-else class="space-y-3">
              <p class="text-base font-bold text-foreground">{{ i18n.t('qs_step3_title') }}</p>
              <p class="text-sm text-muted leading-relaxed">{{ i18n.t('qs_step3_desc') }}</p>

              <div class="rounded-lg border border-primary-500/40 bg-primary-500/10 p-4 space-y-3">
                <div class="flex items-center gap-3">
                  <Dumbbell class="h-5 w-5 text-primary-500 shrink-0" />
                  <div>
                    <p class="text-sm font-bold text-foreground">{{ i18n.t('qs_opt_log_t') }}</p>
                    <p class="text-xs text-muted/80">{{ i18n.t('qs_opt_log_d') }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-2" role="group" :aria-label="i18n.t('qs_reps')">
                  <button
                    v-for="rep in repOptions"
                    :key="rep"
                    type="button"
                    @click="selectedReps = rep"
                    :disabled="submitting"
                    class="min-h-[44px] rounded-lg border text-sm font-bold transition-all"
                    :class="selectedReps === rep ? 'bg-primary-500 text-white border-primary-400' : 'bg-white/[0.03] border-white/10 text-foreground'"
                  >
                    {{ rep }}
                  </button>
                </div>
                <button
                  type="button"
                  @click="submitFirstReps"
                  :disabled="submitting"
                  class="w-full min-h-[48px] rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <div v-if="submitting" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>{{ i18n.t('qs_log_cta', { n: selectedReps }) }}</span>
                </button>
              </div>

              <button
                type="button"
                @click="chooseGuide"
                :disabled="submitting"
                class="w-full min-h-[56px] rounded-lg border border-white/10 bg-white/[0.03] hover:border-white/25 p-3 flex items-center gap-3 text-left transition-colors disabled:opacity-60"
              >
                <Target class="h-5 w-5 text-primary-500 shrink-0" />
                <span>
                  <span class="block text-sm font-bold text-foreground">{{ i18n.t('qs_opt_guide_t') }}</span>
                  <span class="block text-xs text-muted/80">{{ i18n.t('qs_opt_guide_d') }}</span>
                </span>
              </button>

              <button
                type="button"
                @click="chooseExplore"
                :disabled="submitting"
                class="w-full min-h-[56px] rounded-lg border border-white/10 bg-white/[0.03] hover:border-white/25 p-3 flex items-center gap-3 text-left transition-colors disabled:opacity-60"
              >
                <Compass class="h-5 w-5 text-emerald-400 shrink-0" />
                <span>
                  <span class="block text-sm font-bold text-foreground">{{ i18n.t('qs_opt_explore_t') }}</span>
                  <span class="block text-xs text-muted/80">{{ i18n.t('qs_opt_explore_d') }}</span>
                </span>
              </button>
            </div>
          </section>

          <div v-if="step < 2" class="mt-6 flex items-center justify-between gap-3 relative z-10">
            <button
              v-if="step > 0"
              type="button"
              @click="step--"
              class="min-h-[44px] px-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-semibold text-foreground transition-colors"
            >
              {{ i18n.t('qs_back') }}
            </button>
            <button
              v-else
              type="button"
              @click="closeModal"
              class="min-h-[44px] px-4 rounded-lg text-sm font-semibold text-muted hover:text-foreground transition-colors"
            >
              {{ i18n.t('qs_skip') }}
            </button>
            <button
              type="button"
              @click="step++"
              class="min-h-[44px] min-w-[140px] px-5 rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-sm font-bold transition-colors"
            >
              {{ i18n.t('qs_next') }}
            </button>
          </div>
          <div v-else class="mt-4 relative z-10">
            <button
              type="button"
              @click="step--"
              :disabled="submitting"
              class="min-h-[44px] px-4 rounded-lg text-sm font-semibold text-muted hover:text-foreground transition-colors disabled:opacity-40"
            >
              {{ i18n.t('qs_back') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import axios from 'axios';
import { Compass, Dumbbell, Sword, Target, Trophy, Users, X } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useI18nStore } from '@/stores/i18n';
import { getLocalDateString } from '@/utils/dateUtils.js';
import { markPushPromptEligible } from '@/utils/pushEligibility.js';

const props = defineProps({
  show: { type: Boolean, default: false },
});

// close: se cierra sin más · start: ha registrado la primera serie ·
// guide: quiere una guía (el panel abre el selector de planes).
const emit = defineEmits(['close', 'start', 'guide']);
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const i18n = useI18nStore();

const step = ref(0);
const submitting = ref(false);
const selectedExercise = ref('pullups');
const selectedReps = ref(10);
const repOptions = [5, 10, 20];

// Nivel declarado (opcional): fija la meta diaria en vez de dejar los 50 por defecto
// del esquema para todo el mundo, y propone un tamaño de primera serie.
const levelOptions = [
  { id: 'beginner', key: 'onb_level_beginner', goal: 20, reps: 5 },
  { id: 'intermediate', key: 'onb_level_intermediate', goal: 50, reps: 10 },
  { id: 'advanced', key: 'onb_level_advanced', goal: 100, reps: 20 },
];
const selectedLevel = ref(null);
const selectLevel = (level) => {
  selectedLevel.value = level.id;
  selectedReps.value = level.reps;
};

const featureCards = computed(() => [
  { icon: Dumbbell, title: i18n.t('qs_card_log_t'), desc: i18n.t('qs_card_log_d') },
  { icon: Trophy, title: i18n.t('qs_card_rank_t'), desc: i18n.t('qs_card_rank_d') },
  { icon: Users, title: i18n.t('qs_card_friends_t'), desc: i18n.t('qs_card_friends_d') },
  { icon: Sword, title: i18n.t('qs_card_boss_t'), desc: i18n.t('qs_card_boss_d') },
]);

const exerciseOptions = computed(() => [
  { id: 'pullups', label: i18n.t('pullups') },
  { id: 'pushups', label: i18n.t('pushups') },
  { id: 'dips', label: i18n.t('dips') },
  { id: 'squats', label: i18n.t('qs_ex_squats') },
]);

watch(
  () => props.show,
  (isVisible) => {
    if (isVisible) {
      step.value = 0;
      selectedExercise.value = 'pullups';
      selectedReps.value = 10;
      selectedLevel.value = null;
      submitting.value = false;
    }
  }
);

// La meta diaria elegida se guarda al terminar, sea cual sea la opción final.
// No es crítico: si falla, el usuario conserva la meta por defecto.
const saveLevelGoal = async () => {
  const level = levelOptions.find(l => l.id === selectedLevel.value);
  if (!level) return;
  try { await axios.patch('/api/users/profile', { daily_goal: level.goal }); } catch (_) {}
};

const closeModal = () => emit('close');

const chooseExplore = async () => {
  await saveLevelGoal();
  await authStore.fetchProfile(true).catch(() => {});
  emit('close');
};

const chooseGuide = async () => {
  await saveLevelGoal();
  emit('guide');
};

const submitFirstReps = async () => {
  if (submitting.value) return;
  submitting.value = true;
  try {
    await axios.post('/api/reps', {
      count: selectedReps.value,
      date: getLocalDateString(),
      exercise_type: selectedExercise.value,
      added_weight: 0,
    });
    await saveLevelGoal();
    await authStore.fetchProfile(true);
    markPushPromptEligible();
    notificationStore.notify(i18n.t('replog_reps', { n: selectedReps.value }), 'success');
    emit('start', {
      exerciseType: selectedExercise.value,
      reps: selectedReps.value,
    });
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || i18n.t('qs_log_error'), 'error');
  } finally {
    submitting.value = false;
  }
};
</script>

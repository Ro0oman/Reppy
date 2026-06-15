<template>
  <section class="w-full rounded-2xl border border-primary-500/30 bg-primary-500/[0.07] p-4 sm:p-6">
    <div v-if="completedToday" class="space-y-4">
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
          {{ i18n.locale === 'es' ? 'Día completado' : 'Day completed' }}
        </p>
        <h3 class="mt-2 text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
          {{ completedTitle }}
        </h3>
        <p class="mt-2 text-sm font-bold text-muted/70">
          {{ i18n.locale === 'es' ? 'Mañana sigues. La próxima misión queda bloqueada hasta el nuevo día.' : 'Continue tomorrow. The next mission unlocks on the next day.' }}
        </p>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:max-w-sm">
        <div class="rounded-2xl border border-border bg-deep-abyss/75 p-4 text-center">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            {{ i18n.locale === 'es' ? 'Vuelves en' : 'Come back in' }}
          </p>
          <p class="mt-1 text-2xl font-bold text-primary-500">{{ unlockHours }}</p>
          <p class="text-[10px] font-semibold uppercase tracking-wide text-muted">h</p>
        </div>
        <div class="rounded-2xl border border-border bg-deep-abyss/75 p-4 text-center">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            {{ i18n.locale === 'es' ? 'Minutos' : 'Minutes' }}
          </p>
          <p class="mt-1 text-2xl font-bold text-primary-500">{{ unlockMinutes }}</p>
          <p class="text-[10px] font-semibold uppercase tracking-wide text-muted">min</p>
        </div>
      </div>
      <div v-if="nextWorkoutPreview" class="rounded-2xl border border-border bg-foreground/[0.04] p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted">
          {{ i18n.locale === 'es' ? 'Próxima misión' : 'Next mission' }}
        </p>
        <p class="mt-1 text-lg font-bold text-foreground">
          {{ i18n.t(nextWorkoutPreview.day.titleKey) }}
        </p>
        <p class="mt-1 text-xs font-bold text-muted/70">
          {{ i18n.t(nextWorkoutPreview.plan.titleKey) }} · {{ i18n.locale === 'es' ? 'Día' : 'Day' }} {{ nextWorkoutPreview.day.dayNumber }}/{{ nextWorkoutPreview.plan.durationDays }}
        </p>
      </div>
    </div>

    <template v-else-if="workout">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0">
        <p class="text-[10px] font-semibold uppercase tracking-wide text-primary-500">
          {{ i18n.t('today_workout_title') }}
        </p>
        <h3 class="mt-2 text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
          {{ i18n.t(workout.day.titleKey) }}
        </h3>
        <p class="mt-1 text-sm font-bold text-muted/70">
          {{ i18n.t(workout.plan.titleKey) }} · {{ i18n.locale === 'es' ? 'Día' : 'Day' }} {{ workout.day.dayNumber }}/{{ workout.plan.durationDays }}
        </p>
      </div>

      <div class="grid grid-cols-3 gap-2 text-center lg:min-w-[280px]">
        <div class="rounded-xl border border-border bg-foreground/[0.04] px-3 py-2">
          <Clock class="mx-auto h-4 w-4 text-primary-500" />
          <p class="mt-1 text-xs font-bold text-foreground">{{ workout.day.estimatedMinutes }}m</p>
        </div>
        <div class="rounded-xl border border-border bg-foreground/[0.04] px-3 py-2">
          <Sparkles class="mx-auto h-4 w-4 text-amber-400" />
          <p class="mt-1 text-xs font-bold text-foreground">{{ workout.day.rewardXp }} XP</p>
        </div>
        <div class="rounded-xl border border-border bg-foreground/[0.04] px-3 py-2">
          <Coins class="mx-auto h-4 w-4 text-primary-500" />
          <p class="mt-1 text-xs font-bold text-foreground">{{ workout.day.rewardCoins }} RC</p>
        </div>
      </div>
    </div>

    <div v-if="!session" class="mt-5">
      <button
        type="button"
        class="btn-reppy w-full !py-4 sm:w-auto sm:px-8"
        :disabled="loading"
        @click="startWorkout"
      >
        <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
        <span v-else>{{ i18n.t('today_start_workout') }}</span>
      </button>
    </div>

    <div v-else class="mt-5 space-y-3">
      <!-- Overall session progress -->
      <div class="rounded-2xl border border-primary-500/25 bg-primary-500/[0.06] p-4">
        <div class="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
          <span class="text-muted">{{ i18n.locale === 'es' ? 'Progreso de la sesión' : 'Session progress' }}</span>
          <span class="text-primary-500 tabular-nums">{{ completedSetsCount }}/{{ totalSetsCount }} sets</span>
        </div>
        <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-foreground/10">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="setsProgress >= 100 ? 'bg-emerald-500' : 'bg-primary-500'"
            :style="{ width: setsProgress + '%' }"
          ></div>
        </div>
      </div>

      <article
        v-for="block in workout.blocks"
        :key="block.id"
        class="rounded-2xl border border-border bg-deep-abyss/70 p-4"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-primary-500">{{ block.blockType }}</p>
            <h4 class="mt-1 text-lg font-bold text-foreground cursor-pointer hover:text-primary-500 transition flex items-center gap-2 select-none" @click="openExerciseDetail(block.exerciseType || 'pullups')">
              {{ block.title }}
              <Info class="h-3.5 w-3.5 opacity-40 hover:opacity-100 transition" />
            </h4>
            <p class="mt-1 text-sm font-semibold leading-relaxed text-muted/70">{{ block.instructions }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
            <TimerReset class="h-4 w-4 text-primary-500" />
            {{ block.restSeconds }}s
          </div>
        </div>

        <div class="mt-4 space-y-2">
          <div
            v-for="set in setsForBlock(block.id)"
            :key="`${block.id}-${set.setIndex}`"
            class="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-border bg-foreground/[0.03] p-3"
          >
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                Set {{ set.setIndex }} · {{ set.targetReps }} {{ unitLabel(set.unit) }}
              </p>
              <p class="mt-1 text-lg font-bold text-foreground">{{ formatSetValue(set.actualReps, set.unit) }}</p>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" class="icon-btn" @click="decrement(set)" :aria-label="isTimedSet(set) ? 'Restar tiempo' : 'Restar rep'">
                <Minus class="h-4 w-4" />
              </button>
              <button type="button" class="icon-btn" @click="increment(set)" :aria-label="isTimedSet(set) ? 'Sumar tiempo' : 'Sumar rep'">
                <Plus class="h-4 w-4" />
              </button>
              <button
                v-if="isTimedSet(set)"
                type="button"
                class="inline-flex h-10 min-w-[5rem] items-center justify-center gap-1 rounded-xl border border-primary-500/30 bg-primary-500/10 px-3 text-[10px] font-semibold uppercase tracking-wide text-primary-400 transition hover:bg-primary-500/20 active:scale-95"
                @click="toggleWorkTimer(set)"
                :aria-label="set.workTimerActive ? 'Parar contador' : 'Iniciar contador'"
              >
                <Square v-if="set.workTimerActive" class="h-3.5 w-3.5" />
                <Play v-else class="h-3.5 w-3.5" />
                {{ set.workTimerActive ? 'Stop' : 'Start' }}
              </button>
               <button
                type="button"
                class="rounded-xl px-3 py-2 text-[10px] font-semibold uppercase tracking-wide transition active:scale-95"
                :class="set.completed ? 'bg-emerald-500 text-white' : 'bg-foreground/10 text-foreground hover:bg-foreground/15'"
                @click="markDone(set)"
              >
                <Check class="h-4 w-4" />
              </button>
            </div>
            <div v-if="isTimedSet(set)" class="col-span-2 h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <div
                class="h-full rounded-full bg-primary-500 transition-all"
                :style="{ width: `${timedProgress(set)}%` }"
              ></div>
            </div>

            <!-- Rest countdown: progress bar + countdown + ±15s controls -->
            <div
              v-if="set.timerActive"
              class="col-span-2 mt-1 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] p-3"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                  <Clock class="h-3.5 w-3.5 animate-pulse" />
                  {{ i18n.locale === 'es' ? 'Descanso' : 'Rest' }}
                </span>
                <span class="text-lg font-black tabular-nums text-amber-200">{{ set.restTimer }}s</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-amber-950/40">
                <div
                  class="h-full rounded-full bg-amber-400 transition-all duration-1000 ease-linear"
                  :style="{ width: `${restProgress(set)}%` }"
                ></div>
              </div>
              <div class="mt-3 flex items-center gap-2">
                <button type="button" class="rest-btn" @click="adjustRest(set, -15)">−15s</button>
                <button type="button" class="rest-btn" @click="adjustRest(set, 15)">+15s</button>
                <button type="button" class="rest-btn ml-auto !text-amber-200" @click="skipRest(set)">
                  {{ i18n.locale === 'es' ? 'Saltar' : 'Skip' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div class="sticky bottom-3 z-10 rounded-2xl border border-border bg-deep-abyss/95 p-3 backdrop-blur-xl sm:static sm:bg-transparent sm:p-0 sm:backdrop-blur-0">
        <div class="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted sm:hidden">
          <span>{{ totalProgressLabel }}</span>
          <span>{{ completionRate }}%</span>
        </div>
        <p
          v-if="incompleteSets.length"
          class="mb-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-amber-300"
        >
          {{ incompleteSetsLabel }}
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-2xl border border-border bg-foreground/[0.04] px-4 py-4 text-[10px] font-semibold uppercase tracking-wide text-muted transition hover:border-red-500/30 hover:text-red-300 active:scale-95 disabled:opacity-40"
            :disabled="loading"
            @click="abandonSession"
          >
            {{ i18n.locale === 'es' ? 'Salir' : 'Exit' }}
          </button>
          <button
            type="button"
            class="btn-reppy flex-1 !py-4 disabled:opacity-40"
            :disabled="loading"
            @click="finishWorkout"
          >
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            <span v-else>{{ i18n.t('today_finish_workout') }}</span>
          </button>
        </div>
      </div>
    </div>

    </template>

    <!-- Exercise Detail Modal -->
    <ExerciseDetailModal
      :is-open="detailModalOpen"
      :exercise-slug="selectedExerciseSlug"
      @close="detailModalOpen = false"
    />

    <!-- Post-workout overview (becomes the published post) -->
    <WorkoutSummaryModal
      :show="summaryOpen"
      :exercises="summaryExercises"
      :stats="summaryStats"
      :title="summaryTitle"
      @close="summaryOpen = false"
    />
  </section>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { Check, Clock, Coins, Loader2, Minus, Play, Plus, Sparkles, Square, TimerReset, Info } from 'lucide-vue-next';
import ExerciseDetailModal from '@/components/modals/ExerciseDetailModal.vue';
import WorkoutSummaryModal from '@/components/training/WorkoutSummaryModal.vue';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';
import { useTrainingStore } from '@/stores/training';
import { markPushPromptEligible } from '@/utils/pushEligibility.js';

const props = defineProps({
  workout: { type: Object, default: null },
  completedToday: { type: Boolean, default: false },
  nextWorkoutPreview: { type: Object, default: null },
  activePlan: { type: Object, default: null },
});

const emit = defineEmits(['completed']);

const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();
const trainingStore = useTrainingStore();

const session = ref(null);
const setLogs = ref([]);
const detailModalOpen = ref(false);
const selectedExerciseSlug = ref('');
const summaryOpen = ref(false);
const summaryExercises = ref([]);
const summaryStats = ref({});
const summaryTitle = ref('');

const openExerciseDetail = (slug) => {
  selectedExerciseSlug.value = slug;
  detailModalOpen.value = true;
};
const loading = ref(false);
const now = ref(Date.now());
let unlockTicker = null;

const completedTitle = computed(() => {
  const plan = props.activePlan || props.nextWorkoutPreview?.plan;
  const day = plan?.lastCompletedDay || Math.max(1, Number(plan?.currentDay || 1) - 1);
  const duration = plan?.durationDays || props.nextWorkoutPreview?.plan?.durationDays || 0;
  return i18n.locale === 'es'
    ? `Día ${day}/${duration} completado`
    : `Day ${day}/${duration} completed`;
});

const unlockTarget = computed(() => {
  if (props.nextWorkoutPreview || props.completedToday) {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    return tomorrow.getTime();
  }
  return now.value;
});

const unlockRemainingMs = computed(() => Math.max(0, unlockTarget.value - now.value));
const unlockHours = computed(() => String(Math.floor(unlockRemainingMs.value / 3600000)).padStart(2, '0'));
const unlockMinutes = computed(() => String(Math.floor((unlockRemainingMs.value % 3600000) / 60000)).padStart(2, '0'));

watch(
  () => props.completedToday,
  (isCompleted) => {
    if (isCompleted && !unlockTicker) {
      now.value = Date.now();
      unlockTicker = setInterval(() => {
        now.value = Date.now();
      }, 30000);
    } else if (!isCompleted && unlockTicker) {
      clearInterval(unlockTicker);
      unlockTicker = null;
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (unlockTicker) clearInterval(unlockTicker);
  clearAllTimers();
});

const createSetLogs = () => {
  if (!props.workout) {
    setLogs.value = [];
    return;
  }
  setLogs.value = props.workout.blocks.flatMap((block) => {
    const count = Math.max(1, Number(block.targetSets || 1));
    const unit = block.unit || 'reps';
    const target = Number(block.targetReps || 0);
    return Array.from({ length: count }, (_, index) => ({
      blockId: block.id,
      setIndex: index + 1,
      exerciseType: block.exerciseType || 'pullups',
      targetReps: target,
      actualReps: unit === 'seconds' ? 0 : target,
      completed: false,
      unit,
      restSeconds: Number(block.restSeconds || 60),
      restTimer: 0,
      restTotal: 0,
      timerActive: false,
      intervalId: null,
      workTimerActive: false,
      workIntervalId: null
    }));
  });
};

watch(() => props.workout?.day?.id, () => {
  session.value = null;
  createSetLogs();
}, { immediate: true });

const setsForBlock = (blockId) => setLogs.value.filter(set => set.blockId === blockId);

const totalActualReps = computed(() => setLogs.value.reduce((sum, set) => sum + Number(set.actualReps || 0), 0));
const totalTargetReps = computed(() => setLogs.value.reduce((sum, set) => sum + Number(set.targetReps || 0), 0));
const unitLabel = (unit) => {
  if (unit === 'seconds') return i18n.locale === 'es' ? 'seg' : 'sec';
  return i18n.t('ui_reps');
};
const isTimedSet = (set) => (set?.unit || 'reps') === 'seconds';
const formatSetValue = (value, unit) => unit === 'seconds' ? `${Number(value || 0)}s` : Number(value || 0);
const timedProgress = (set) => {
  const target = Number(set?.targetReps || 0);
  if (!target) return 0;
  return Math.max(0, Math.min(100, Math.round((Number(set.actualReps || 0) / target) * 100)));
};
const totalProgressLabel = computed(() => {
  const totals = setLogs.value.reduce((acc, set) => {
    const unit = set.unit || 'reps';
    acc[unit] = (acc[unit] || 0) + Number(set.actualReps || 0);
    return acc;
  }, {});
  const parts = [];
  if (totals.reps) parts.push(`${totals.reps} ${unitLabel('reps')}`);
  if (totals.seconds) parts.push(`${totals.seconds} ${unitLabel('seconds')}`);
  return parts.join(' | ') || `0 ${unitLabel('reps')}`;
});
const completionRate = computed(() => {
  if (!totalTargetReps.value) return 0;
  return Math.max(0, Math.min(100, Math.round((totalActualReps.value / totalTargetReps.value) * 100)));
});
const setTargetValue = (set) => Number(set.targetReps || 0);
const setActualValue = (set) => Number(set.actualReps || 0);
const setIsComplete = (set) => !!set.completed && setActualValue(set) >= setTargetValue(set);
const incompleteSets = computed(() => setLogs.value.filter(set => !setIsComplete(set)));
const totalSetsCount = computed(() => setLogs.value.length);
const completedSetsCount = computed(() => setLogs.value.filter(setIsComplete).length);
const setsProgress = computed(() => totalSetsCount.value ? Math.round((completedSetsCount.value / totalSetsCount.value) * 100) : 0);
const incompleteSetsLabel = computed(() => {
  const count = incompleteSets.value.length;
  if (!count) return '';
  if (i18n.locale === 'es') {
    return count === 1
      ? 'Te falta 1 set para completar la misión'
      : `Te faltan ${count} sets para completar la misión`;
  }
  return count === 1
    ? '1 set left to complete the mission'
    : `${count} sets left to complete the mission`;
});

const increment = (set) => {
  set.actualReps += isTimedSet(set) ? 5 : 1;
};

const decrement = (set) => {
  set.actualReps = Math.max(0, set.actualReps - (isTimedSet(set) ? 5 : 1));
  if (setActualValue(set) < setTargetValue(set)) set.completed = false;
};

import { useAudio } from '@/composables/useAudio';

const stopWorkTimer = (set) => {
  if (set?.workIntervalId) {
    clearInterval(set.workIntervalId);
    set.workIntervalId = null;
  }
  if (set) set.workTimerActive = false;
};

const toggleWorkTimer = (set) => {
  if (!isTimedSet(set)) return;

  if (set.workTimerActive) {
    stopWorkTimer(set);
    if (setActualValue(set) >= setTargetValue(set)) set.completed = true;
    return;
  }

  set.completed = false;
  set.workTimerActive = true;
  set.workIntervalId = setInterval(() => {
    set.actualReps += 1;
  }, 1000);
};

const clearAllTimers = () => {
  setLogs.value.forEach(s => {
    stopWorkTimer(s);
    s.restTimer = 0;
    s.timerActive = false;
    if (s.intervalId) {
      clearInterval(s.intervalId);
      s.intervalId = null;
    }
  });
};

const markDone = (set) => {
  stopWorkTimer(set);
  if (set.actualReps === 0) set.actualReps = set.targetReps;

  if (setActualValue(set) < setTargetValue(set)) {
    set.completed = false;
    notificationStore.notify(
      i18n.locale === 'es'
        ? `Completa el objetivo del set: ${setTargetValue(set)} ${unitLabel(set.unit)}`
        : `Hit the set target first: ${setTargetValue(set)} ${unitLabel(set.unit)}`,
      'error'
    );
    return;
  }

  set.completed = true;

  clearAllTimers();

  // No rest configured → don't start a countdown.
  if (!set.restSeconds || set.restSeconds <= 0) return;

  set.restTimer = set.restSeconds;
  set.restTotal = set.restSeconds;
  set.timerActive = true;
  if (set.intervalId) clearInterval(set.intervalId);

  set.intervalId = setInterval(() => {
    if (set.restTimer > 1) {
      set.restTimer -= 1;
    } else {
      set.restTimer = 0;
      set.timerActive = false;
      clearInterval(set.intervalId);
      set.intervalId = null;
      try {
        const { playClickBlip } = useAudio();
        playClickBlip();
      } catch (e) {
        console.error(e);
      }
    }
  }, 1000);
};

const stopRest = (set) => {
  if (set.intervalId) {
    clearInterval(set.intervalId);
    set.intervalId = null;
  }
  set.restTimer = 0;
  set.timerActive = false;
};

// Elapsed-rest percentage for the countdown progress bar.
const restProgress = (set) => {
  const total = Number(set?.restTotal || 0);
  if (total <= 0) return 0;
  const remaining = Math.max(0, Number(set.restTimer || 0));
  return Math.max(0, Math.min(100, Math.round(((total - remaining) / total) * 100)));
};

// Let the user add/remove 15s from the running rest countdown.
const adjustRest = (set, delta) => {
  if (!set.timerActive) return;
  const next = Number(set.restTimer || 0) + delta;
  if (next <= 0) { stopRest(set); return; }
  set.restTimer = next;
  if (next > Number(set.restTotal || 0)) set.restTotal = next;
};

const skipRest = (set) => stopRest(set);

const abandonSession = () => {
  notificationStore.confirm(
    i18n.locale === 'es' ? 'Salir del entrenamiento' : 'Exit workout',
    i18n.locale === 'es' ? 'Tu progreso de esta sesión no se guardará.' : 'Your progress for this session will not be saved.',
    async () => {
      clearAllTimers();
      const currentSessionId = session.value?.id;
      session.value = null;
      if (currentSessionId) {
        trainingStore.cancelSession(currentSessionId).catch(() => {});
      }
    }
  );
};

const startWorkout = async () => {
  loading.value = true;
  try {
    session.value = await trainingStore.startSession(props.workout.day.id);
  } catch (error) {
    notificationStore.notify(i18n.locale === 'es' ? 'No se pudo iniciar la misión' : 'Mission could not start', 'error');
  } finally {
    loading.value = false;
  }
};

const finishWorkout = async () => {
  if (!session.value?.id) return;

  setLogs.value.forEach((set) => {
    if (set.workTimerActive) {
      stopWorkTimer(set);
      if (setActualValue(set) >= setTargetValue(set)) set.completed = true;
    }
  });

  if (incompleteSets.value.length > 0) {
    notificationStore.notify(incompleteSetsLabel.value, 'error');
    return;
  }

  clearAllTimers();

  loading.value = true;
  try {
    const finishedLabel = totalProgressLabel.value;
    // Snapshot what was performed before we reset the session, for the overview/post.
    const performed = setLogs.value;
    const result = await trainingStore.completeSession(session.value.id, performed);

    notificationStore.notify(
      i18n.locale === 'es'
        ? `Misión completada: ${finishedLabel} registrados`
        : `Mission completed: ${finishedLabel} logged`,
      'success'
    );

    // Build the workout overview (muscle map + totals) shown as the post preview.
    const byExercise = new Map();
    for (const set of performed) {
      const slug = set.exerciseType || 'pullups';
      const entry = byExercise.get(slug) || { exercise_type: slug, count: 0, unit: set.unit || 'reps' };
      entry.count += Number(set.actualReps || 0);
      byExercise.set(slug, entry);
    }
    summaryExercises.value = Array.from(byExercise.values());
    summaryStats.value = {
      reps: Number(result?.totalReps ?? result?.total_reps ?? 0),
      seconds: performed.filter(s => (s.unit || 'reps') === 'seconds').reduce((sum, s) => sum + Number(s.actualReps || 0), 0),
      damage: Number(result?.totalDamage ?? 0),
      coins: Number(result?.earnedCoins ?? 0),
    };
    summaryTitle.value = props.workout?.day?.titleKey ? i18n.t(props.workout.day.titleKey) : '';
    summaryOpen.value = true;

    await authStore.fetchProfile(true);
    markPushPromptEligible();
    session.value = null;
    emit('completed', result);
  } catch (error) {
    const errorCode = error?.response?.data?.code;
    const missingSets = Number(error?.response?.data?.missingSets || 0);
    if (errorCode === 'WORKOUT_INCOMPLETE') {
      notificationStore.notify(
        i18n.locale === 'es'
          ? `Completa todos los sets antes de terminar${missingSets ? ` (${missingSets} pendientes)` : ''}`
          : `Complete every set before finishing${missingSets ? ` (${missingSets} left)` : ''}`,
        'error'
      );
      return;
    }
    notificationStore.notify(i18n.locale === 'es' ? 'No se pudo completar la rutina' : 'Workout could not be completed', 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.icon-btn {
  display: grid;
  height: 2.5rem;
  width: 2.5rem;
  place-items: center;
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--border));
  background: hsla(var(--foreground) / 0.05);
  color: hsla(var(--foreground) / 0.8);
  transition: transform 0.15s ease, background 0.15s ease;
}

.icon-btn:active {
  transform: scale(0.95);
}

.icon-btn:hover {
  background: hsla(var(--foreground) / 0.1);
}

.rest-btn {
  border-radius: 0.6rem;
  border: 1px solid hsl(45 93% 47% / 0.35);
  background: hsl(45 93% 47% / 0.12);
  padding: 0.4rem 0.7rem;
  font-size: 0.7rem;
  font-weight: 800;
  color: hsl(45 93% 70%);
  transition: background 0.15s ease, transform 0.15s ease;
}
.rest-btn:hover { background: hsl(45 93% 47% / 0.22); }
.rest-btn:active { transform: scale(0.95); }
</style>

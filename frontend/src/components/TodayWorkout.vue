<template>
  <section class="w-full rounded-[1.5rem] border border-primary-500/30 bg-primary-500/10 p-4 shadow-[0_0_35px_rgba(255,69,0,0.08)] sm:p-6">
    <div v-if="completedToday" class="space-y-4">
      <div>
        <p class="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">
          {{ i18n.locale === 'es' ? 'Dia completado' : 'Day completed' }}
        </p>
        <h3 class="mt-2 text-2xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-3xl">
          {{ completedTitle }}
        </h3>
        <p class="mt-2 text-sm font-bold text-muted/70">
          {{ i18n.locale === 'es' ? 'Manana sigues. La proxima mision queda bloqueada hasta el nuevo dia.' : 'Continue tomorrow. The next mission unlocks on the next day.' }}
        </p>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:max-w-sm">
        <div class="rounded-2xl border border-white/10 bg-deep-abyss/75 p-4 text-center">
          <p class="text-[9px] font-black uppercase tracking-widest text-muted">
            {{ i18n.locale === 'es' ? 'Vuelves en' : 'Come back in' }}
          </p>
          <p class="mt-1 text-2xl font-black text-primary-500">{{ unlockHours }}</p>
          <p class="text-[10px] font-black uppercase tracking-widest text-muted">h</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-deep-abyss/75 p-4 text-center">
          <p class="text-[9px] font-black uppercase tracking-widest text-muted">
            {{ i18n.locale === 'es' ? 'Minutos' : 'Minutes' }}
          </p>
          <p class="mt-1 text-2xl font-black text-primary-500">{{ unlockMinutes }}</p>
          <p class="text-[10px] font-black uppercase tracking-widest text-muted">min</p>
        </div>
      </div>
      <div v-if="nextWorkoutPreview" class="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p class="text-[9px] font-black uppercase tracking-widest text-muted">
          {{ i18n.locale === 'es' ? 'Proxima mision' : 'Next mission' }}
        </p>
        <p class="mt-1 text-lg font-black text-foreground">
          {{ i18n.t(nextWorkoutPreview.day.titleKey) }}
        </p>
        <p class="mt-1 text-xs font-bold text-muted/70">
          {{ i18n.t(nextWorkoutPreview.plan.titleKey) }} · {{ i18n.locale === 'es' ? 'Dia' : 'Day' }} {{ nextWorkoutPreview.day.dayNumber }}/{{ nextWorkoutPreview.plan.durationDays }}
        </p>
      </div>
    </div>

    <template v-else-if="workout">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0">
        <p class="text-[10px] font-black uppercase tracking-[0.22em] text-primary-500">
          {{ i18n.t('today_workout_title') }}
        </p>
        <h3 class="mt-2 text-2xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-3xl">
          {{ i18n.t(workout.day.titleKey) }}
        </h3>
        <p class="mt-1 text-sm font-bold text-muted/70">
          {{ i18n.t(workout.plan.titleKey) }} · {{ i18n.locale === 'es' ? 'Dia' : 'Day' }} {{ workout.day.dayNumber }}/{{ workout.plan.durationDays }}
        </p>
      </div>

      <div class="grid grid-cols-3 gap-2 text-center lg:min-w-[280px]">
        <div class="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <Clock class="mx-auto h-4 w-4 text-primary-500" />
          <p class="mt-1 text-xs font-black text-foreground">{{ workout.day.estimatedMinutes }}m</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <Sparkles class="mx-auto h-4 w-4 text-amber-400" />
          <p class="mt-1 text-xs font-black text-foreground">{{ workout.day.rewardXp }} XP</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <Coins class="mx-auto h-4 w-4 text-primary-500" />
          <p class="mt-1 text-xs font-black text-foreground">{{ workout.day.rewardCoins }} RC</p>
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
      <article
        v-for="block in workout.blocks"
        :key="block.id"
        class="rounded-2xl border border-white/10 bg-deep-abyss/70 p-4"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="text-[9px] font-black uppercase tracking-widest text-primary-500">{{ block.blockType }}</p>
            <h4 class="mt-1 text-lg font-black text-foreground cursor-pointer hover:text-primary-500 transition flex items-center gap-2 select-none" @click="openExerciseDetail(block.exerciseType || 'pullups')">
              {{ block.title }}
              <Info class="h-3.5 w-3.5 opacity-40 hover:opacity-100 transition" />
            </h4>
            <p class="mt-1 text-sm font-semibold leading-relaxed text-muted/70">{{ block.instructions }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted">
            <TimerReset class="h-4 w-4 text-primary-500" />
            {{ block.restSeconds }}s
          </div>
        </div>

        <div class="mt-4 space-y-2">
          <div
            v-for="set in setsForBlock(block.id)"
            :key="`${block.id}-${set.setIndex}`"
            class="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
          >
            <div>
              <p class="text-xs font-black uppercase tracking-widest text-muted">
                Set {{ set.setIndex }} · {{ set.targetReps }} {{ unitLabel(set.unit) }}
              </p>
              <p class="mt-1 text-lg font-black text-foreground">{{ formatSetValue(set.actualReps, set.unit) }}</p>
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
                class="inline-flex h-10 min-w-[5rem] items-center justify-center gap-1 rounded-xl border border-primary-500/30 bg-primary-500/10 px-3 text-[10px] font-black uppercase tracking-widest text-primary-400 transition hover:bg-primary-500/20 active:scale-95"
                @click="toggleWorkTimer(set)"
                :aria-label="set.workTimerActive ? 'Parar contador' : 'Iniciar contador'"
              >
                <Square v-if="set.workTimerActive" class="h-3.5 w-3.5" />
                <Play v-else class="h-3.5 w-3.5" />
                {{ set.workTimerActive ? 'Stop' : 'Start' }}
              </button>
               <button
                type="button"
                class="rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest transition active:scale-95"
                :class="set.completed ? 'bg-emerald-500 text-white' : 'bg-white/10 text-foreground hover:bg-white/15'"
                @click="markDone(set)"
              >
                <Check class="h-4 w-4" />
              </button>
              <div
                v-if="set.timerActive"
                class="rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1 select-none"
              >
                <Clock class="h-3.5 w-3.5 animate-pulse" />
                {{ set.restTimer }}s
              </div>
            </div>
            <div v-if="isTimedSet(set)" class="col-span-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                class="h-full rounded-full bg-primary-500 transition-all"
                :style="{ width: `${timedProgress(set)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </article>

      <div class="sticky bottom-3 z-10 rounded-2xl border border-white/10 bg-deep-abyss/95 p-3 backdrop-blur-xl sm:static sm:bg-transparent sm:p-0 sm:backdrop-blur-0">
        <div class="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-widest text-muted sm:hidden">
          <span>{{ totalProgressLabel }}</span>
          <span>{{ completionRate }}%</span>
        </div>
        <p
          v-if="incompleteSets.length"
          class="mb-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-amber-300"
        >
          {{ incompleteSetsLabel }}
        </p>
        <button
          type="button"
          class="btn-reppy w-full !py-4 disabled:opacity-40"
          :disabled="loading"
          @click="finishWorkout"
        >
          <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
          <span v-else>{{ i18n.t('today_finish_workout') }}</span>
        </button>
      </div>
    </div>

    </template>

    <!-- Exercise Detail Modal -->
    <ExerciseDetailModal
      :is-open="detailModalOpen"
      :exercise-slug="selectedExerciseSlug"
      @close="detailModalOpen = false"
    />
  </section>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { Check, Clock, Coins, Loader2, Minus, Play, Plus, Sparkles, Square, TimerReset, Info } from 'lucide-vue-next';
import ExerciseDetailModal from './ExerciseDetailModal.vue';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import { useNotificationStore } from '../stores/notification';
import { useTrainingStore } from '../stores/training';

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
    ? `Dia ${day}/${duration} completado`
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
const incompleteSetsLabel = computed(() => {
  const count = incompleteSets.value.length;
  if (!count) return '';
  if (i18n.locale === 'es') {
    return count === 1
      ? 'Te falta 1 set para completar la mision'
      : `Te faltan ${count} sets para completar la mision`;
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

import { useAudio } from '../composables/useAudio';

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

  set.restTimer = set.restSeconds;
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

const startWorkout = async () => {
  loading.value = true;
  try {
    session.value = await trainingStore.startSession(props.workout.day.id);
  } catch (error) {
    notificationStore.notify(i18n.locale === 'es' ? 'No se pudo iniciar la mision' : 'Mission could not start', 'error');
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
    const result = await trainingStore.completeSession(session.value.id, setLogs.value);

    notificationStore.notify(
      i18n.locale === 'es'
        ? `Mision completada: ${finishedLabel} registrados`
        : `Mission completed: ${finishedLabel} logged`,
      'success'
    );

    await authStore.fetchProfile(true);
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
  border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(255 255 255 / 0.05);
  color: rgb(255 255 255 / 0.8);
  transition: transform 0.15s ease, background 0.15s ease;
}

.icon-btn:active {
  transform: scale(0.95);
}

.icon-btn:hover {
  background: rgb(255 255 255 / 0.1);
}
</style>

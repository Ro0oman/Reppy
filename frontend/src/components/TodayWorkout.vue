<template>
  <section class="w-full rounded-[1.5rem] border border-primary-500/30 bg-primary-500/10 p-4 shadow-[0_0_35px_rgba(255,69,0,0.08)] sm:p-6">
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
            <h4 class="mt-1 text-lg font-black text-foreground">{{ block.title }}</h4>
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
                Set {{ set.setIndex }} · {{ set.targetReps }} {{ i18n.t('ui_reps') }}
              </p>
              <p class="mt-1 text-lg font-black text-foreground">{{ set.actualReps }}</p>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" class="icon-btn" @click="decrement(set)" aria-label="Restar rep">
                <Minus class="h-4 w-4" />
              </button>
              <button type="button" class="icon-btn" @click="increment(set)" aria-label="Sumar rep">
                <Plus class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest transition active:scale-95"
                :class="set.completed ? 'bg-emerald-500 text-white' : 'bg-white/10 text-foreground hover:bg-white/15'"
                @click="markDone(set)"
              >
                {{ set.completed ? 'OK' : 'Hecho' }}
              </button>
              <button type="button" class="icon-btn" @click="markMissed(set)" aria-label="No pude">
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </article>

      <div class="sticky bottom-3 z-10 rounded-2xl border border-white/10 bg-deep-abyss/95 p-3 backdrop-blur-xl sm:static sm:bg-transparent sm:p-0 sm:backdrop-blur-0">
        <div class="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-widest text-muted sm:hidden">
          <span>{{ totalActualReps }} reps</span>
          <span>{{ completionRate }}%</span>
        </div>
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
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { Clock, Coins, Loader2, Minus, Plus, Sparkles, TimerReset, X } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import { useNotificationStore } from '../stores/notification';
import { useTrainingStore } from '../stores/training';

const props = defineProps({
  workout: { type: Object, required: true },
});

const emit = defineEmits(['completed']);

const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();
const trainingStore = useTrainingStore();

const session = ref(null);
const setLogs = ref([]);
const loading = ref(false);

const createSetLogs = () => {
  setLogs.value = props.workout.blocks.flatMap((block) => {
    const count = Math.max(1, Number(block.targetSets || 1));
    return Array.from({ length: count }, (_, index) => ({
      blockId: block.id,
      setIndex: index + 1,
      exerciseType: block.exerciseType || 'pullups',
      targetReps: Number(block.targetReps || 0),
      actualReps: Number(block.targetReps || 0),
      completed: false,
    }));
  });
};

watch(() => props.workout.day.id, () => {
  session.value = null;
  createSetLogs();
}, { immediate: true });

const setsForBlock = (blockId) => setLogs.value.filter(set => set.blockId === blockId);

const totalActualReps = computed(() => setLogs.value.reduce((sum, set) => sum + Number(set.actualReps || 0), 0));
const totalTargetReps = computed(() => setLogs.value.reduce((sum, set) => sum + Number(set.targetReps || 0), 0));
const completionRate = computed(() => {
  if (!totalTargetReps.value) return 0;
  return Math.max(0, Math.min(100, Math.round((totalActualReps.value / totalTargetReps.value) * 100)));
});

const increment = (set) => {
  set.actualReps += 1;
};

const decrement = (set) => {
  set.actualReps = Math.max(0, set.actualReps - 1);
  if (set.actualReps === 0) set.completed = false;
};

const markDone = (set) => {
  set.completed = true;
  if (set.actualReps === 0) set.actualReps = set.targetReps;
};

const markMissed = (set) => {
  set.completed = false;
  set.actualReps = 0;
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

  loading.value = true;
  try {
    const result = await trainingStore.completeSession(session.value.id, setLogs.value);

    notificationStore.notify(
      `Mision completada: +${result.total_reps || result.totalReps || 0} reps registradas`,
      'success'
    );

    await authStore.fetchProfile(true);
    session.value = null;
    emit('completed', result);
  } catch (error) {
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

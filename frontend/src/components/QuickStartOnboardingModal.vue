<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[140] flex items-end sm:items-center justify-center p-2 sm:p-6 bg-background/90 backdrop-blur-md"
      @click.self="closeModal"
    >
      <div class="w-full max-w-lg rounded-[2rem] border border-white/10 bg-surface/95 shadow-2xl overflow-hidden">
        <div class="relative p-5 sm:p-7">
          <div class="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary-500/10 blur-[100px] pointer-events-none"></div>

          <div class="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.24em] text-primary-500">
                {{ isEs ? 'Onboarding 60s' : '60s Onboarding' }}
              </p>
              <h3 class="mt-2 text-2xl sm:text-3xl font-black italic tracking-tight text-foreground leading-none">
                {{ isEs ? 'Empieza en menos de 1 minuto' : 'Start in under 1 minute' }}
              </h3>
            </div>
            <button
              @click="closeModal"
              class="shrink-0 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              :aria-label="isEs ? 'Cerrar' : 'Close'"
            >
              <X class="w-5 h-5 text-foreground" />
            </button>
          </div>

          <div class="mt-5 flex items-center gap-2">
            <div
              v-for="n in 4"
              :key="n"
              class="h-1.5 rounded-full transition-all duration-300"
              :class="step >= n - 1 ? 'bg-primary-500 w-14 sm:w-16' : 'bg-white/10 w-8 sm:w-10'"
            />
          </div>

          <section class="mt-5 min-h-[300px] sm:min-h-[320px] relative z-10">
            <div v-if="step === 0" class="space-y-3">
              <p class="text-base font-black text-foreground">
                {{ isEs ? '1) Que puedes hacer en Reppy' : '1) What you can do in Reppy' }}
              </p>
              <p class="text-sm text-muted leading-relaxed">
                {{ isEs ? 'Reppy convierte tus entrenos en progreso visible: reps, XP, ranking, amigos, bosses y recompensas.' : 'Reppy turns workouts into visible progress: reps, XP, rankings, friends, bosses and rewards.' }}
              </p>
              <div class="grid grid-cols-2 gap-2 pt-1">
                <div
                  v-for="feature in possibilityCards"
                  :key="feature.title"
                  class="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <component :is="feature.icon" class="h-4 w-4 text-primary-500" />
                  <p class="mt-2 text-[10px] font-black uppercase tracking-wide text-foreground">
                    {{ feature.title }}
                  </p>
                  <p class="mt-1 text-[10px] font-semibold leading-snug text-muted/70">
                    {{ feature.desc }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else-if="step === 1" class="space-y-3">
              <p class="text-base font-black text-foreground">
                {{ isEs ? '2) Tu objetivo hoy' : '2) Your goal today' }}
              </p>
              <p class="text-sm text-muted leading-relaxed">
                {{ isEs ? 'Haz tu primer registro para activar tu racha, ganar XP y entrar en el circuito global.' : 'Log your first set to activate your streak, earn XP and enter the global circuit.' }}
              </p>
              <div class="grid grid-cols-1 gap-2 pt-1">
                <div class="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p class="text-[11px] font-black uppercase tracking-wide text-foreground">
                    {{ isEs ? 'Progreso instantaneo' : 'Instant progress' }}
                  </p>
                  <p class="mt-1 text-[10px] font-semibold text-muted/70">
                    {{ isEs ? 'Cada serie suma a tus stats y actividad diaria.' : 'Every set feeds your stats and daily activity.' }}
                  </p>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p class="text-[11px] font-black uppercase tracking-wide text-foreground">
                    {{ isEs ? 'Recompensa diaria' : 'Daily reward' }}
                  </p>
                  <p class="mt-1 text-[10px] font-semibold text-muted/70">
                    {{ isEs ? 'Gana Reppy Coins, cofres y avances de mision.' : 'Earn Reppy Coins, chests and mission progress.' }}
                  </p>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p class="text-[11px] font-black uppercase tracking-wide text-foreground">
                    {{ isEs ? 'Sube tu status' : 'Level up your status' }}
                  </p>
                  <p class="mt-1 text-[10px] font-semibold text-muted/70">
                    {{ isEs ? 'Tu perfil muestra lo que entrenas y hasta donde llegas.' : 'Your profile shows what you train and how far you go.' }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else-if="step === 2" class="space-y-3">
              <p class="text-base font-black text-foreground">
                {{ isEs ? '3) Ranking, amigos y comunidad' : '3) Rankings, friends and community' }}
              </p>
              <p class="text-sm text-muted leading-relaxed">
                {{ isEs ? 'La parte social empieza cuando tienes a alguien cerca en el ranking: puedes compararte, picarte y celebrar logros en el feed.' : 'The social loop starts when someone is close to you in the ranking: compare, compete and celebrate wins in the feed.' }}
              </p>
              <div class="space-y-2 pt-1">
                <div
                  v-for="loop in socialLoops"
                  :key="loop.title"
                  class="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <component :is="loop.icon" class="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                  <div>
                    <p class="text-[11px] font-black uppercase tracking-wide text-foreground">
                      {{ loop.title }}
                    </p>
                    <p class="mt-1 text-[10px] font-semibold leading-snug text-muted/70">
                      {{ loop.desc }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2 pt-2">
                <div class="h-10 rounded-xl border border-primary-500/30 bg-primary-500/10 flex items-center justify-center text-xs font-black text-primary-500">+5</div>
                <div class="h-10 rounded-xl border border-primary-500/30 bg-primary-500/10 flex items-center justify-center text-xs font-black text-primary-500">+10</div>
                <div class="h-10 rounded-xl border border-primary-500/30 bg-primary-500/10 flex items-center justify-center text-xs font-black text-primary-500">+20</div>
              </div>
            </div>

            <div v-else class="space-y-4">
              <p class="text-base font-black text-foreground">
                {{ isEs ? '4) Registra tus primeras reps' : '4) Log your first reps' }}
              </p>

              <div class="space-y-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-muted/70">
                  {{ isEs ? 'Ejercicio' : 'Exercise' }}
                </p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="option in exerciseOptions"
                    :key="option.id"
                    @click="selectedExercise = option.id"
                    :disabled="submitting"
                    class="h-10 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all"
                    :class="selectedExercise === option.id ? 'bg-primary-500 text-white border-primary-400' : 'bg-white/[0.03] border-white/10 text-foreground'"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-muted/70">
                  {{ isEs ? 'Reps' : 'Reps' }}
                </p>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="rep in repOptions"
                    :key="rep"
                    @click="selectedReps = rep"
                    :disabled="submitting"
                    class="h-10 rounded-xl border text-xs font-black transition-all"
                    :class="selectedReps === rep ? 'bg-primary-500 text-white border-primary-400' : 'bg-white/[0.03] border-white/10 text-foreground'"
                  >
                    {{ rep }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div class="mt-6 flex items-center justify-between gap-3 relative z-10">
            <button
              v-if="step > 0"
              @click="step--"
              :disabled="submitting"
              class="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-wider text-foreground transition-colors disabled:opacity-40"
            >
              {{ isEs ? 'Atras' : 'Back' }}
            </button>
            <div v-else />

            <div class="flex items-center gap-2">
              <button
                @click="closeModal"
                :disabled="submitting"
                class="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-wider text-muted transition-colors disabled:opacity-40"
              >
                {{ isEs ? 'Saltar' : 'Skip' }}
              </button>
              <button
                @click="handlePrimaryAction"
                :disabled="submitting"
                class="min-w-[170px] px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-[11px] font-black uppercase tracking-wider transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <div v-if="submitting" class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>
                  {{
                    step < 3
                      ? (isEs ? 'Continuar' : 'Continue')
                      : (isEs ? 'Registrar primeras reps' : 'Log first reps')
                  }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import axios from 'axios';
import { Dumbbell, Flame, MessageCircle, Sword, Trophy, Users, X } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { getLocalDateString } from '../utils/dateUtils.js';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  locale: {
    type: String,
    default: 'es',
  },
});

const emit = defineEmits(['close', 'start']);
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const step = ref(0);
const submitting = ref(false);
const selectedExercise = ref('pullups');
const selectedReps = ref(10);
const repOptions = [5, 10, 20];

const isEs = computed(() => props.locale !== 'en');

const possibilityCards = computed(() => {
  if (isEs.value) {
    return [
      { icon: Dumbbell, title: 'Registra reps', desc: 'Flexiones, dominadas, fondos o sentadillas.' },
      { icon: Trophy, title: 'Ranking mundial', desc: 'Compite por posicion diaria, semanal y total.' },
      { icon: Users, title: 'Amigos y feed', desc: 'Mira entrenos, da likes y comenta logros.' },
      { icon: Sword, title: 'Bosses y botin', desc: 'Tus reps ayudan a derrotar bosses y ganar cofres.' },
    ];
  }
  return [
    { icon: Dumbbell, title: 'Log reps', desc: 'Pushups, pullups, dips or squats.' },
    { icon: Trophy, title: 'Global ranking', desc: 'Compete by day, week and all-time.' },
    { icon: Users, title: 'Friends and feed', desc: 'See workouts, give likes and comment wins.' },
    { icon: Sword, title: 'Bosses and loot', desc: 'Your reps help defeat bosses and earn chests.' },
  ];
});

const socialLoops = computed(() => {
  if (isEs.value) {
    return [
      { icon: Trophy, title: 'Comparate en rankings', desc: 'Mira tu puesto mundial o mide tu progreso contra amigos.' },
      { icon: MessageCircle, title: 'Publica y reacciona', desc: 'Cada entreno puede aparecer en el feed para que la comunidad lo vea.' },
      { icon: Flame, title: 'Vuelve por la racha', desc: 'Un registro pequeno tambien cuenta si mantiene tu constancia viva.' },
    ];
  }
  return [
    { icon: Trophy, title: 'Compare in rankings', desc: 'Check your global spot or measure progress against friends.' },
    { icon: MessageCircle, title: 'Post and react', desc: 'Every workout can appear in the feed for the community to see.' },
    { icon: Flame, title: 'Return for streaks', desc: 'Even a small log counts when it keeps your consistency alive.' },
  ];
});

const exerciseOptions = computed(() => {
  if (isEs.value) {
    return [
      { id: 'pullups', label: 'Dominadas' },
      { id: 'pushups', label: 'Flexiones' },
      { id: 'dips', label: 'Fondos' },
      { id: 'squats', label: 'Sentadillas' },
    ];
  }
  return [
    { id: 'pullups', label: 'Pullups' },
    { id: 'pushups', label: 'Pushups' },
    { id: 'dips', label: 'Dips' },
    { id: 'squats', label: 'Squats' },
  ];
});

watch(
  () => props.show,
  (isVisible) => {
    if (isVisible) {
      step.value = 0;
      selectedExercise.value = 'pullups';
      selectedReps.value = 10;
      submitting.value = false;
    }
  }
);

const closeModal = () => emit('close');

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
    await authStore.fetchProfile();
    notificationStore.notify(
      isEs.value
        ? `+${selectedReps.value} reps registradas`
        : `+${selectedReps.value} reps logged`,
      'success'
    );
    emit('start', {
      exerciseType: selectedExercise.value,
      reps: selectedReps.value,
    });
  } catch (error) {
    notificationStore.notify(
      isEs.value ? 'No se pudo registrar. Intenta otra vez.' : 'Could not log reps. Please try again.',
      'error'
    );
  } finally {
    submitting.value = false;
  }
};

const handlePrimaryAction = async () => {
  if (step.value < 3) {
    step.value += 1;
    return;
  }
  await submitFirstReps();
};
</script>

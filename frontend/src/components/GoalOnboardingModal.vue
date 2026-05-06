<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md px-3 py-4"
        @click.self="dismissOnboarding"
      >
        <div class="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[1.5rem] border border-white/10 bg-deep-abyss shadow-2xl">
          <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-deep-abyss/95 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div class="min-w-0">
              <p class="text-[9px] font-black uppercase tracking-[0.24em] text-primary-500">Guided Training</p>
              <h2 class="mt-1 text-xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-2xl">
                {{ i18n.t('onboarding_goal_title') }}
              </h2>
            </div>
            <button
              type="button"
              class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted transition hover:text-foreground"
              :disabled="loading"
              @click="dismissOnboarding"
              aria-label="Cerrar"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <div class="space-y-5 p-4 sm:p-6">
            <div v-if="step === 'choice'" class="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                class="rounded-2xl border border-primary-500/30 bg-primary-500/10 p-5 text-left transition active:scale-[0.99] hover:border-primary-500/60"
                @click="step = 'guided'"
              >
                <Target class="h-5 w-5 text-primary-500" />
                <h3 class="mt-4 text-lg font-black leading-tight text-foreground">
                  {{ i18n.t('onboarding_goal_guided') }}
                </h3>
                <p class="mt-2 text-sm font-semibold leading-relaxed text-muted/70">
                  {{ i18n.t('onboarding_goal_guided_desc') }}
                </p>
              </button>

              <button
                type="button"
                class="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left transition active:scale-[0.99] hover:border-white/25"
                :disabled="loading"
                @click="chooseFree"
              >
                <ListChecks class="h-5 w-5 text-emerald-400" />
                <h3 class="mt-4 text-lg font-black leading-tight text-foreground">
                  {{ i18n.t('onboarding_goal_free') }}
                </h3>
                <p class="mt-2 text-sm font-semibold leading-relaxed text-muted/70">
                  {{ i18n.t('onboarding_goal_free_desc') }}
                </p>
              </button>
            </div>

            <div v-else class="space-y-5">
              <button
                type="button"
                class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted transition hover:text-foreground"
                @click="step = 'choice'"
              >
                <ChevronLeft class="h-4 w-4" />
                {{ i18n.locale === 'es' ? 'Volver' : 'Back' }}
              </button>

              <div class="grid gap-3 sm:grid-cols-2">
                <button
                  v-for="plan in trainingStore.plans"
                  :key="plan.slug"
                  type="button"
                  class="rounded-2xl border p-4 text-left transition active:scale-[0.99]"
                  :class="selectedPlan === plan.slug ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'"
                  @click="selectedPlan = plan.slug"
                >
                  <p class="text-sm font-black leading-tight text-foreground">
                    {{ i18n.t(plan.titleKey) }}
                  </p>
                  <p class="mt-2 text-xs font-semibold leading-relaxed text-muted/70">
                    {{ i18n.t(plan.descriptionKey) }}
                  </p>
                  <div class="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-500">
                    <span>{{ plan.durationDays }} {{ i18n.locale === 'es' ? 'dias' : 'days' }}</span>
                    <span>{{ plan.difficulty }}</span>
                  </div>
                </button>
              </div>

              <div class="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-3">
                <label class="space-y-2">
                  <span class="text-[10px] font-black uppercase tracking-widest text-muted">{{ i18n.t('pullups') }}</span>
                  <input v-model.number="baselinePullups" min="0" type="number" class="field" />
                </label>
                <label class="space-y-2">
                  <span class="text-[10px] font-black uppercase tracking-widest text-muted">{{ i18n.t('pushups') }}</span>
                  <input v-model.number="baselinePushups" min="0" type="number" class="field" />
                </label>
                <label class="space-y-2">
                  <span class="text-[10px] font-black uppercase tracking-widest text-muted">{{ i18n.t('dips') }}</span>
                  <input v-model.number="baselineDips" min="0" type="number" class="field" />
                </label>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <label class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span class="text-[10px] font-black uppercase tracking-widest text-muted">
                    {{ i18n.locale === 'es' ? 'Dias por semana' : 'Days per week' }}
                  </span>
                  <input v-model.number="daysPerWeek" min="1" max="7" type="number" class="field mt-2" />
                </label>
                <label class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span class="text-sm font-black text-foreground">
                    {{ i18n.locale === 'es' ? 'Tengo barra' : 'I have a pull-up bar' }}
                  </span>
                  <input v-model="hasPullupBar" type="checkbox" class="h-5 w-5 accent-primary-500" />
                </label>
              </div>

              <button
                type="button"
                class="btn-reppy w-full !py-4 disabled:opacity-40"
                :disabled="loading || !selectedPlan"
                @click="selectPlan"
              >
                <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
                <span v-else>{{ i18n.locale === 'es' ? 'Crear mi mision de hoy' : 'Create my mission today' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ChevronLeft, ListChecks, Loader2, Target, X } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useTrainingStore } from '../stores/training';
import { useNotificationStore } from '../stores/notification';

const props = defineProps({
  show: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'selected']);

const i18n = useI18nStore();
const trainingStore = useTrainingStore();
const notificationStore = useNotificationStore();

const step = ref('choice');
const selectedPlan = ref('');
const daysPerWeek = ref(3);
const baselinePullups = ref(0);
const baselinePushups = ref(0);
const baselineDips = ref(0);
const hasPullupBar = ref(true);
const loading = ref(false);

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      step.value = 'choice';
      selectedPlan.value = trainingStore.plans[0]?.slug || '';
    }
  }
);

const chooseFree = async () => {
  loading.value = true;
  try {
    await trainingStore.chooseFreeMode();
    notificationStore.notify(i18n.locale === 'es' ? 'Modo libre activado' : 'Free mode enabled', 'success');
    emit('close', { reason: 'free_mode' });
  } catch (error) {
    notificationStore.notify(i18n.locale === 'es' ? 'No se pudo guardar la preferencia' : 'Preference could not be saved', 'error');
  } finally {
    loading.value = false;
  }
};

const dismissOnboarding = async () => {
  if (loading.value) return;
  emit('close', { reason: 'dismissed' });
};

const selectPlan = async () => {
  loading.value = true;
  try {
    await trainingStore.selectPlan({
      planSlug: selectedPlan.value,
      daysPerWeek: daysPerWeek.value,
      baseline: {
        pullups: baselinePullups.value || 0,
        pushups: baselinePushups.value || 0,
        dips: baselineDips.value || 0,
      },
      equipment: {
        pullupBar: hasPullupBar.value,
      },
    });
    notificationStore.notify(i18n.locale === 'es' ? 'Mision guiada creada' : 'Guided mission created', 'success');
    emit('selected');
    emit('close', { reason: 'selected_plan' });
  } catch (error) {
    notificationStore.notify(i18n.locale === 'es' ? 'No se pudo elegir el plan' : 'Plan could not be selected', 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.field {
  width: 100%;
  border-radius: 0.9rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(255 255 255 / 0.05);
  padding: 0.75rem 0.9rem;
  color: var(--color-foreground, #fff);
  font-weight: 900;
  outline: none;
}

.field:focus {
  border-color: rgb(255 69 0 / 0.6);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="cursor-pointer fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md px-3 py-4"
        @click.self="close"
      >
        <div class="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[1.5rem] border border-white/10 bg-deep-abyss shadow-2xl">
          <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-deep-abyss/95 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div class="min-w-0">
              <p class="text-xs font-black uppercase tracking-[0.24em] text-primary-500">
                {{ i18n.locale === 'es' ? 'Rutinas' : 'Routines' }}
              </p>
              <h2 class="mt-1 text-xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-2xl">
                {{ i18n.locale === 'es' ? 'Explorar rutinas' : 'Browse routines' }}
              </h2>
            </div>
            <button
              type="button"
              class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted transition hover:text-foreground"
              :disabled="loadingSlug !== ''"
              @click="close"
              aria-label="Cerrar"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <div class="space-y-5 p-4 sm:p-6">
            <p class="text-sm font-semibold text-muted/70">
              {{ i18n.locale === 'es'
                ? 'Planes guiados paso a paso. Elige uno y empieza tu primera misión hoy.'
                : 'Step-by-step guided plans. Pick one and start your first mission today.' }}
            </p>

            <p v-if="!trainingStore.plans.length" class="py-8 text-center text-sm font-semibold text-muted/70">
              {{ i18n.locale === 'es' ? 'No hay rutinas disponibles.' : 'No routines available.' }}
            </p>
            <div v-else class="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
              <div
                v-for="plan in trainingStore.plans"
                :key="plan.slug"
                class="w-[240px] shrink-0 snap-start"
              >
                <PlanCard :plan="plan" :active="plan.slug === activeSlug">
                  <template #actions>
                    <button
                      type="button"
                      class="btn-reppy w-full !py-2.5 text-xs disabled:opacity-40"
                      :disabled="loadingSlug !== '' || plan.slug === activeSlug"
                      @click="enroll(plan)"
                    >
                      <Loader2 v-if="loadingSlug === plan.slug" class="mx-auto h-4 w-4 animate-spin" />
                      <span v-else>
                        {{ plan.slug === activeSlug
                          ? (i18n.locale === 'es' ? 'Activa' : 'Active')
                          : (i18n.locale === 'es' ? 'Empezar' : 'Start') }}
                      </span>
                    </button>
                  </template>
                </PlanCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Loader2, X } from 'lucide-vue-next';
import PlanCard from '@/components/training/PlanCard.vue';
import { useI18nStore } from '@/stores/i18n';
import { useTrainingStore } from '@/stores/training';
import { useNotificationStore } from '@/stores/notification';

const props = defineProps({
  show: { type: Boolean, default: false },
  activeSlug: { type: String, default: '' },
});

const emit = defineEmits(['close', 'selected']);

const i18n = useI18nStore();
const trainingStore = useTrainingStore();
const notificationStore = useNotificationStore();

const loadingSlug = ref('');

watch(
  () => props.show,
  async (visible) => {
    if (!visible) return;
    loadingSlug.value = '';
    if (!trainingStore.plans.length) {
      try { await trainingStore.fetchPlans(); } catch (e) { /* surfaced as empty state */ }
    }
  }
);

const close = () => {
  if (loadingSlug.value) return;
  emit('close');
};

const enroll = async (plan) => {
  loadingSlug.value = plan.slug;
  try {
    await trainingStore.selectPlan({ planSlug: plan.slug });
    notificationStore.notify(i18n.locale === 'es' ? 'Rutina activada' : 'Routine activated', 'success');
    emit('selected');
    emit('close');
  } catch (error) {
    notificationStore.notify(i18n.locale === 'es' ? 'No se pudo activar la rutina' : 'Routine could not be activated', 'error');
  } finally {
    loadingSlug.value = '';
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>

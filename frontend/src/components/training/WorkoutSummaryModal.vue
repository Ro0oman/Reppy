<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 backdrop-blur-md px-3 py-4"
        @click.self="close"
      >
        <div class="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[1.5rem] border border-primary-500/20 bg-deep-abyss shadow-2xl">
          <div class="relative px-5 pt-6 text-center">
            <button
              type="button"
              class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted transition hover:text-foreground"
              @click="close"
              aria-label="Cerrar"
            >
              <X class="h-4 w-4" />
            </button>
            <p class="text-xs font-black uppercase tracking-[0.24em] text-primary-500">
              {{ i18n.locale === 'es' ? 'Entrenamiento completado' : 'Workout complete' }}
            </p>
            <h2 class="mt-2 text-2xl font-black leading-tight tracking-tight text-foreground">
              {{ headline }}
            </h2>
          </div>

          <!-- Stats grid -->
          <div class="mt-5 grid grid-cols-2 gap-2 px-5 sm:grid-cols-4">
            <div v-if="stats.reps" class="rounded-2xl border border-border bg-foreground/[0.03] p-3 text-center">
              <Flame class="mx-auto h-4 w-4 text-primary-500" />
              <p class="mt-1 text-lg font-black tabular-nums text-foreground">{{ stats.reps }}</p>
              <p class="text-[9px] font-bold uppercase tracking-widest text-muted">{{ i18n.t('ui_reps') }}</p>
            </div>
            <div v-if="stats.seconds" class="rounded-2xl border border-border bg-foreground/[0.03] p-3 text-center">
              <Clock class="mx-auto h-4 w-4 text-primary-500" />
              <p class="mt-1 text-lg font-black tabular-nums text-foreground">{{ stats.seconds }}s</p>
              <p class="text-[9px] font-bold uppercase tracking-widest text-muted">{{ i18n.locale === 'es' ? 'Tiempo' : 'Time' }}</p>
            </div>
            <div v-if="stats.damage" class="rounded-2xl border border-border bg-foreground/[0.03] p-3 text-center">
              <Zap class="mx-auto h-4 w-4 text-primary-500" />
              <p class="mt-1 text-lg font-black tabular-nums text-primary-500">{{ stats.damage }}</p>
              <p class="text-[9px] font-bold uppercase tracking-widest text-muted">{{ i18n.t('ui_dmg') }}</p>
            </div>
            <div v-if="stats.coins" class="rounded-2xl border border-border bg-foreground/[0.03] p-3 text-center">
              <Coins class="mx-auto h-4 w-4 text-amber-400" />
              <p class="mt-1 text-lg font-black tabular-nums text-foreground">{{ stats.coins }}</p>
              <p class="text-[9px] font-bold uppercase tracking-widest text-muted">RC</p>
            </div>
          </div>

          <!-- Muscle map -->
          <div class="mt-5 px-5">
            <div class="rounded-2xl border border-border bg-foreground/[0.02] p-4">
              <BodyMuscleMap :activation="activation" />
            </div>
          </div>

          <!-- Editable post -->
          <div class="mt-5 space-y-3 px-5">
            <p class="text-[10px] font-black uppercase tracking-widest text-muted/60">
              {{ i18n.locale === 'es' ? 'Tu publicación' : 'Your post' }}
            </p>
            <input
              v-model="editTitle"
              type="text"
              maxlength="120"
              class="field"
              :placeholder="i18n.locale === 'es' ? 'Título del entrenamiento…' : 'Workout title…'"
            />
            <textarea
              v-model="editDescription"
              rows="3"
              maxlength="500"
              class="field resize-none"
              :placeholder="i18n.locale === 'es' ? '¿Cómo fue? (opcional)' : 'How did it go? (optional)'"
            ></textarea>
          </div>

          <div class="mt-5 flex gap-2 px-5 pb-6">
            <button
              type="button"
              class="rounded-2xl border border-border bg-foreground/[0.04] px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-muted transition hover:text-foreground active:scale-95"
              @click="close"
            >
              {{ i18n.locale === 'es' ? 'Cerrar' : 'Close' }}
            </button>
            <button
              type="button"
              class="btn-reppy flex-1 !py-3.5 disabled:opacity-40"
              :disabled="saving"
              @click="saveAndClose"
            >
              <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
              <span v-else>{{ i18n.locale === 'es' ? 'Guardar y publicar' : 'Save & publish' }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import axios from 'axios';
import { Clock, Coins, Flame, Loader2, X, Zap } from 'lucide-vue-next';
import BodyMuscleMap from '@/components/training/BodyMuscleMap.vue';
import { aggregateMuscleActivation } from '@/utils/muscleMap';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';
import { getLocalDateString } from '@/utils/dateUtils.js';

const props = defineProps({
  show: { type: Boolean, default: false },
  date: { type: String, default: '' },
  exercises: { type: Array, default: () => [] },
  stats: { type: Object, default: () => ({}) },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
});

const emit = defineEmits(['close', 'saved']);

const i18n = useI18nStore();
const notificationStore = useNotificationStore();

const editTitle = ref('');
const editDescription = ref('');
const saving = ref(false);

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      editTitle.value = props.title || '';
      editDescription.value = props.description || '';
    }
  },
  { immediate: true }
);

const activation = computed(() => aggregateMuscleActivation(props.exercises));
const headline = computed(() =>
  props.title || (i18n.locale === 'es' ? '¡Buen trabajo!' : 'Great work!')
);

const close = () => emit('close');

const saveAndClose = async () => {
  saving.value = true;
  try {
    await axios.put('/api/social-feed/summary', {
      date: props.date || getLocalDateString(),
      title: editTitle.value,
      description: editDescription.value,
    });
    notificationStore.notify(i18n.locale === 'es' ? 'Publicado en tu feed' : 'Published to your feed', 'success');
    emit('saved', { title: editTitle.value, description: editDescription.value });
  } catch (e) {
    notificationStore.notify(i18n.locale === 'es' ? 'No se pudo guardar la publicación' : 'Could not save the post', 'error');
  } finally {
    saving.value = false;
    emit('close');
  }
};
</script>

<style scoped>
.field {
  width: 100%;
  border-radius: 0.9rem;
  border: 1px solid hsl(var(--border));
  background: hsla(var(--foreground) / 0.04);
  padding: 0.75rem 0.9rem;
  color: hsl(var(--foreground));
  font-weight: 600;
  outline: none;
}
.field:focus { border-color: hsl(var(--primary) / 0.6); }
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>

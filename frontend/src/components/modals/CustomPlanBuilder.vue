<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[120] flex items-start justify-center bg-black/70 backdrop-blur-md px-3 py-4"
        @click.self="close"
      >
        <div class="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[1.5rem] border border-white/10 bg-deep-abyss shadow-2xl">
          <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-deep-abyss/95 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div class="min-w-0">
              <p class="text-xs font-black uppercase tracking-[0.24em] text-primary-500">
                {{ i18n.locale === 'es' ? 'Constructor' : 'Builder' }}
              </p>
              <h2 class="mt-1 text-xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-2xl">
                {{ planId
                  ? (i18n.locale === 'es' ? 'Editar rutina' : 'Edit routine')
                  : (i18n.locale === 'es' ? 'Crear rutina' : 'Create routine') }}
              </h2>
            </div>
            <button
              type="button"
              class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted transition hover:text-foreground"
              :disabled="loading"
              @click="close"
              aria-label="Cerrar"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <div class="space-y-5 p-4 sm:p-6">
            <!-- Routine meta -->
            <div class="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <label class="space-y-1.5">
                <span class="text-[10px] font-black uppercase tracking-widest text-muted">{{ i18n.locale === 'es' ? 'Nombre de la rutina' : 'Routine name' }}</span>
                <input v-model="form.title" type="text" maxlength="120" class="field" :placeholder="i18n.locale === 'es' ? 'Día de tirón' : 'Pull day'" />
              </label>
              <label class="space-y-1.5">
                <span class="text-[10px] font-black uppercase tracking-widest text-muted">{{ i18n.locale === 'es' ? 'Descripción' : 'Description' }}</span>
                <input v-model="form.description" type="text" maxlength="120" class="field" />
              </label>
              <label class="space-y-1.5 sm:max-w-[14rem]">
                <span class="text-[10px] font-black uppercase tracking-widest text-muted">{{ i18n.locale === 'es' ? 'Dificultad' : 'Difficulty' }}</span>
                <DarkSelect v-model="form.difficulty" :options="difficultyOptions" />
              </label>
            </div>

            <!-- Exercises (a routine = one session) -->
            <div class="space-y-3">
              <p class="text-[10px] font-black uppercase tracking-widest text-muted/60">{{ i18n.locale === 'es' ? 'Ejercicios' : 'Exercises' }}</p>

              <div
                v-for="(block, bIdx) in form.blocks"
                :key="bIdx"
                class="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[10px] font-black uppercase tracking-widest text-primary-500">{{ i18n.locale === 'es' ? 'Ejercicio' : 'Exercise' }} {{ bIdx + 1 }}</span>
                  <button
                    v-if="form.blocks.length > 1"
                    type="button"
                    class="text-muted transition hover:text-red-400"
                    @click="removeBlock(bIdx)"
                    aria-label="x"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>

                <div class="mt-3 space-y-3">
                  <DarkSelect
                    v-model="block.exerciseType"
                    :options="exerciseOptions"
                    :placeholder="i18n.locale === 'es' ? 'Elige un ejercicio…' : 'Choose an exercise…'"
                    :empty-label="i18n.locale === 'es' ? 'Sin ejercicios' : 'No exercises'"
                  />

                  <div class="grid grid-cols-3 gap-2">
                    <label class="space-y-1">
                      <span class="text-[9px] font-black uppercase tracking-widest text-muted">{{ i18n.locale === 'es' ? 'Series' : 'Sets' }}</span>
                      <input v-model.number="block.targetSets" type="number" min="1" max="20" class="field !py-2 text-sm" />
                    </label>
                    <label class="space-y-1">
                      <span class="text-[9px] font-black uppercase tracking-widest text-muted">{{ unitForBlock(block) === 'seconds' ? (i18n.locale === 'es' ? 'Seg' : 'Sec') : 'Reps' }}</span>
                      <input v-model.number="block.targetReps" type="number" min="1" max="1000" class="field !py-2 text-sm" />
                    </label>
                    <label class="space-y-1">
                      <span class="text-[9px] font-black uppercase tracking-widest text-muted">{{ i18n.locale === 'es' ? 'Descanso' : 'Rest' }}</span>
                      <input v-model.number="block.restSeconds" type="number" min="0" max="600" class="field !py-2 text-sm" />
                    </label>
                  </div>

                  <input
                    v-model="block.instructions"
                    type="text"
                    maxlength="500"
                    class="field !py-2 text-sm"
                    :placeholder="i18n.locale === 'es' ? 'Notas (opcional)' : 'Notes (optional)'"
                  />
                </div>
              </div>

              <button
                type="button"
                class="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/15 px-3 py-3 text-[10px] font-black uppercase tracking-widest text-muted transition hover:border-primary-500/40 hover:text-primary-500"
                @click="addBlock"
              >
                <Plus class="h-4 w-4" /> {{ i18n.locale === 'es' ? 'Añadir ejercicio' : 'Add exercise' }}
              </button>
            </div>

            <p v-if="error" class="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-center text-xs font-bold text-red-300">
              {{ error }}
            </p>

            <button
              type="button"
              class="btn-reppy w-full !py-4 disabled:opacity-40"
              :disabled="loading"
              @click="save"
            >
              <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
              <span v-else>{{ i18n.locale === 'es' ? 'Guardar rutina' : 'Save routine' }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import axios from 'axios';
import { Loader2, Plus, Trash2, X } from 'lucide-vue-next';
import DarkSelect from '@/components/ui/DarkSelect.vue';
import { useI18nStore } from '@/stores/i18n';
import { useTrainingStore } from '@/stores/training';
import { useNotificationStore } from '@/stores/notification';

const props = defineProps({
  show: { type: Boolean, default: false },
  planId: { type: [Number, null], default: null },
});

const emit = defineEmits(['close', 'saved']);

const i18n = useI18nStore();
const trainingStore = useTrainingStore();
const notificationStore = useNotificationStore();

const DIFFICULTIES = ['beginner', 'intermediate', 'expert', 'custom'];

const exercises = ref([]);
const loading = ref(false);
const error = ref('');

const newBlock = () => ({
  exerciseType: '',
  instructions: '',
  targetSets: 3,
  targetReps: 8,
  restSeconds: 90,
});

const form = reactive({
  title: '',
  description: '',
  difficulty: 'custom',
  blocks: [newBlock()],
});

const exerciseName = (ex) => {
  if (!ex) return '';
  const translated = i18n.t(ex.title_key);
  if (translated && translated !== ex.title_key) return translated;
  const bySlug = i18n.t(ex.slug);
  return bySlug !== ex.slug ? bySlug : (ex.title_key || ex.slug);
};
const exerciseOptions = computed(() => exercises.value.map(ex => ({ value: ex.slug, label: exerciseName(ex) })));
const difficultyOptions = computed(() => DIFFICULTIES.map(d => ({ value: d, label: d })));
const unitForBlock = (block) => exercises.value.find(e => e.slug === block.exerciseType)?.unit || 'reps';

const resetForm = () => {
  form.title = '';
  form.description = '';
  form.difficulty = 'custom';
  form.blocks = [newBlock()];
};

const loadDetail = async (id) => {
  const plan = await trainingStore.fetchCustomPlanDetail(id);
  if (!plan) return;
  form.title = plan.title || '';
  form.description = plan.description || '';
  form.difficulty = plan.difficulty || 'custom';
  const blocks = (plan.blocks || []).map(b => ({
    exerciseType: b.exerciseType || '',
    instructions: b.instructions || '',
    targetSets: b.targetSets ?? 3,
    targetReps: b.targetReps ?? 8,
    restSeconds: b.restSeconds ?? 90,
  }));
  form.blocks = blocks.length ? blocks : [newBlock()];
};

watch(
  () => props.show,
  async (visible) => {
    if (!visible) return;
    error.value = '';
    if (exercises.value.length === 0) {
      try {
        const res = await axios.get('/api/exercises');
        exercises.value = res.data || [];
      } catch (e) { exercises.value = []; }
    }
    if (props.planId) {
      try { await loadDetail(props.planId); } catch (e) { resetForm(); }
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const addBlock = () => form.blocks.push(newBlock());
const removeBlock = (idx) => {
  if (form.blocks.length > 1) form.blocks.splice(idx, 1);
};

const validate = () => {
  if (!form.title.trim()) return i18n.locale === 'es' ? 'Ponle un nombre a la rutina.' : 'Give the routine a name.';
  if (form.blocks.filter(b => b.exerciseType).length === 0) {
    return i18n.locale === 'es' ? 'Añade al menos un ejercicio.' : 'Add at least one exercise.';
  }
  return '';
};

const close = () => {
  if (loading.value) return;
  emit('close');
};

const save = async () => {
  error.value = validate();
  if (error.value) return;
  loading.value = true;
  try {
    const payload = {
      title: form.title,
      description: form.description,
      difficulty: form.difficulty,
      blocks: form.blocks
        .filter(b => b.exerciseType)
        .map(b => {
          const ex = exercises.value.find(e => e.slug === b.exerciseType);
          return {
            exerciseType: b.exerciseType,
            // Title is just the exercise name (no separate title field anymore).
            title: ex ? exerciseName(ex) : b.exerciseType,
            instructions: b.instructions,
            targetSets: b.targetSets,
            targetReps: b.targetReps,
            restSeconds: b.restSeconds,
          };
        }),
    };
    if (props.planId) {
      await trainingStore.updateCustomPlan(props.planId, payload);
    } else {
      await trainingStore.createCustomPlan(payload);
    }
    notificationStore.notify(i18n.locale === 'es' ? 'Rutina guardada' : 'Routine saved', 'success');
    emit('saved');
    emit('close');
  } catch (e) {
    error.value = e?.response?.data?.message || (i18n.locale === 'es' ? 'No se pudo guardar.' : 'Could not save.');
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
  font-weight: 700;
  outline: none;
}
.field:focus { border-color: hsl(var(--primary) / 0.6); }
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>

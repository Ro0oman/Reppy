<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
    <div class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-deep-abyss/95 p-6 shadow-[0_0_50px_rgba(255,69,0,0.15)] backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
      
      <!-- Close Button -->
      <button @click="close" class="absolute top-4 right-4 text-muted hover:text-foreground transition active:scale-95">
        <X class="w-5 h-5" />
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-3 min-h-[300px]">
        <Loader2 class="w-8 h-8 animate-spin text-primary-500" />
        <p class="text-xs font-black uppercase tracking-wider text-muted/60">
          {{ i18n.locale === 'es' ? 'Cargando detalles...' : 'Loading details...' }}
        </p>
      </div>

      <!-- Content -->
      <div v-else-if="exercise" class="flex flex-col gap-5 flex-1 overflow-y-auto pr-1">
        
        <!-- Header & Icon -->
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl border border-primary-500/20 bg-primary-500/10 text-primary-500 shrink-0">
            <Activity class="w-7 h-7" />
          </div>
          <div>
            <h3 class="text-2xl font-black text-foreground uppercase tracking-tight leading-none">
              {{ exercise.title_key?.startsWith('ex_') ? i18n.t(exercise.title_key) : exercise.title_key || exercise.slug }}
            </h3>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 mt-1">
              {{ i18n.locale === 'es' ? 'Unidad' : 'Unit' }}: {{ unitText }}
            </p>
          </div>
        </div>

        <!-- Description & Multipliers -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <p class="text-[9px] font-black uppercase tracking-wider text-muted mb-1">
              {{ i18n.locale === 'es' ? 'Descripcion' : 'Description' }}
            </p>
            <p class="text-xs font-semibold leading-relaxed text-foreground/80">
              {{ exercise.description_key }}
            </p>
          </div>

          <div class="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <p class="text-[9px] font-black uppercase tracking-wider text-muted mb-1">
              {{ i18n.locale === 'es' ? 'Tecnica correcta' : 'Correct technique' }}
            </p>
            <p class="text-xs font-semibold leading-relaxed text-foreground/80">
              {{ exercise.technique_key || fallbackTechnique }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] text-center">
          <div>
            <p class="text-[8px] font-black uppercase tracking-wider text-muted">
              {{ i18n.locale === 'es' ? 'Dificultad' : 'Difficulty' }}
            </p>
            <p class="text-lg font-black tracking-tight text-amber-500">x{{ exercise.difficulty_multiplier || 1 }}</p>
          </div>
          <div>
            <p class="text-[8px] font-black uppercase tracking-wider text-muted">
              {{ i18n.locale === 'es' ? 'Multiplicador monedas' : 'Coin multiplier' }}
            </p>
            <p class="text-lg font-black tracking-tight text-emerald-500">x{{ exercise.coin_multiplier || 1 }}</p>
          </div>
        </div>

        <!-- Progress List for this month -->
        <div class="flex flex-col flex-1 gap-2 mt-2">
          <h4 class="text-xs font-black uppercase tracking-wider text-muted/80 flex items-center gap-2">
            <TrendingUp class="w-3.5 h-3.5 text-primary-500" />
            {{ i18n.locale === 'es' ? 'Progreso este mes' : 'Progress this month' }}
          </h4>

          <div v-if="!exercise.progress?.length" class="flex flex-col items-center justify-center py-6 border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
            <p class="text-xs font-bold text-muted/50">
              {{ i18n.locale === 'es' ? 'Aun no hay registros este mes' : 'No logs yet this month' }}
            </p>
          </div>

          <div v-else class="space-y-1.5 overflow-y-auto max-h-[160px] pr-1">
            <div v-for="log in exercise.progress" :key="log.date" class="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.03] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition">
              <div>
                <p class="text-xs font-black uppercase tracking-wider text-foreground">{{ formatLocalDate(log.date) }}</p>
                <p class="text-[9px] font-bold text-muted mt-0.5">Volumen diario registrado</p>
              </div>
              <span class="text-base font-black italic tracking-tight text-primary-500">
                +{{ log.total }}
                <span class="text-[8px] not-italic uppercase font-black text-muted ml-0.5">
                  {{ exercise.unit === 'seconds' ? 's' : 'reps' }}
                </span>
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { X, Activity, TrendingUp, Loader2 } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  exerciseSlug: { type: String, default: '' },
});

const emit = defineEmits(['close']);

const authStore = useAuthStore();
const i18n = useI18nStore();

const exercise = ref(null);
const loading = ref(false);

const unitText = computed(() => {
  if (exercise.value?.unit === 'seconds') {
    return i18n.locale === 'es' ? 'Segundos (s)' : 'Seconds (s)';
  }
  return i18n.locale === 'es' ? 'Repeticiones' : 'Repetitions';
});

const fallbackTechnique = computed(() =>
  i18n.locale === 'es'
    ? 'Manten una tecnica correcta en todo el rango de movimiento. Para la serie si aparece dolor o pierdes control.'
    : 'Keep correct technique through the full range of motion. Stop the set if pain appears or control breaks.'
);

const close = () => {
  emit('close');
};

const fetchProgress = async () => {
  if (!props.exerciseSlug) return;
  loading.value = true;
  try {
    const res = await fetch(`/api/exercises/${props.exerciseSlug}/progress`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (res.ok) {
      exercise.value = await res.json();
    }
  } catch (error) {
    console.error('Error fetching exercise progress:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => [props.isOpen, props.exerciseSlug], ([isOpen, slug]) => {
  if (isOpen && slug) {
    fetchProgress();
  }
}, { immediate: true });

const formatLocalDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(i18n.locale === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric', month: 'short'
  });
};
</script>

<style scoped>
.bg-deep-abyss\/95 {
  background-color: rgba(5, 5, 10, 0.95);
}
</style>

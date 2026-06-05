<template>
  <Teleport to="body">
    <Transition name="wsc-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/75 backdrop-blur-sm" @click="$emit('close')" />

        <!-- Sheet -->
        <div
          class="relative z-10 w-full sm:max-w-sm bg-[#0d1117] border border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.07]">
            <div>
              <h2 class="text-base font-bold tracking-tight text-foreground">
                {{ i18n.locale === 'es' ? 'Mi semana' : 'My week' }}
              </h2>
              <p v-if="weeklyData" class="text-[11px] text-muted mt-0.5">
                {{ formatWeek(weeklyData.weekStart, weeklyData.weekEnd) }}
              </p>
            </div>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-xl text-muted hover:text-foreground hover:bg-white/[0.06] transition-colors"
              @click="$emit('close')"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Loading skeleton -->
          <div v-if="loading" class="px-5 py-8 space-y-4 animate-pulse">
            <div class="h-20 rounded-xl bg-white/[0.06]" />
            <div class="grid grid-cols-3 gap-3">
              <div v-for="i in 3" :key="i" class="h-24 rounded-xl bg-white/[0.04]" />
            </div>
            <div class="h-10 rounded-xl bg-white/[0.04]" />
          </div>

          <!-- Content -->
          <div v-else-if="weeklyData" class="px-5 py-5 space-y-4">
            <!-- Main stat -->
            <div class="rounded-2xl bg-primary-500/10 border border-primary-500/20 px-5 py-4 text-center">
              <p class="text-[10px] font-bold tracking-widest text-primary-400/70 uppercase mb-1">
                {{ i18n.locale === 'es' ? 'Repeticiones totales' : 'Total reps' }}
              </p>
              <p class="text-5xl font-black text-white tabular-nums">
                {{ weeklyData.totalReps.toLocaleString() }}
              </p>
            </div>

            <!-- Stat row -->
            <div class="grid grid-cols-3 gap-3">
              <div
                v-for="stat in statCards"
                :key="stat.label"
                class="rounded-xl border bg-white/[0.03] px-2 py-3 text-center"
                :style="{ borderColor: stat.border }"
              >
                <p class="text-xl mb-1">{{ stat.icon }}</p>
                <p class="text-base font-black tabular-nums" :style="{ color: stat.color }">{{ stat.value }}</p>
                <p class="text-[9px] font-semibold tracking-wider uppercase mt-0.5" style="color: rgba(255,255,255,0.40)">{{ stat.label }}</p>
              </div>
            </div>

            <!-- Star exercise -->
            <div
              v-if="weeklyData.starExercise"
              class="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 flex items-center gap-3"
            >
              <span class="text-2xl">🏅</span>
              <div class="min-w-0">
                <p class="text-[10px] font-bold tracking-widest text-amber-400/70 uppercase">
                  {{ i18n.locale === 'es' ? 'Ejercicio estrella' : 'Star exercise' }}
                </p>
                <p class="text-sm font-bold text-amber-300 truncate">
                  {{ exerciseLabel(weeklyData.starExercise) }}
                  <span class="font-normal text-amber-400/60"> · {{ weeklyData.starCount.toLocaleString() }} reps</span>
                </p>
              </div>
            </div>

            <!-- Empty state: no data this week -->
            <div
              v-if="weeklyData.totalReps === 0"
              class="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-5 text-center"
            >
              <p class="text-sm text-muted">
                {{ i18n.locale === 'es'
                  ? 'Sin reps la semana pasada. ¡Esta semana dale duro!'
                  : 'No reps last week. Crush it this week!' }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="weeklyData" class="flex gap-3 px-5 pb-6">
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] py-3 text-sm font-semibold text-foreground/80 hover:bg-white/[0.09] transition-colors active:scale-[0.98]"
              :disabled="generating"
              @click="handleDownload"
            >
              <Download class="w-4 h-4" />
              {{ i18n.locale === 'es' ? 'Descargar' : 'Download' }}
            </button>
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors active:scale-[0.98] disabled:opacity-50"
              :disabled="generating || weeklyData.totalReps === 0"
              @click="handleShare"
            >
              <Share2 class="w-4 h-4" />
              <span v-if="generating">{{ i18n.locale === 'es' ? 'Generando…' : 'Generating…' }}</span>
              <span v-else>{{ i18n.locale === 'es' ? 'Compartir' : 'Share' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue';
import { X, Download, Share2 } from 'lucide-vue-next';
import { useWeeklyShare } from '@/composables/useWeeklyShare';
import { useI18nStore } from '@/stores/i18n';

const props = defineProps({
  open: Boolean,
});
defineEmits(['close']);

const i18n = useI18nStore();
const { fetchWeeklyData, share, generating, loading, weeklyData } = useWeeklyShare();

watch(() => props.open, (val) => {
  if (val && !weeklyData.value) fetchWeeklyData();
});

function formatWeek(start, end) {
  const opts = { day: 'numeric', month: 'short' };
  const s = new Date(start + 'T12:00:00').toLocaleDateString(undefined, opts);
  const e = new Date(end + 'T12:00:00').toLocaleDateString(undefined, opts);
  return `${s} – ${e}`;
}

function exerciseLabel(slug) {
  const map = {
    pullups: i18n.locale === 'es' ? 'Dominadas' : 'Pull-ups',
    pushups: i18n.locale === 'es' ? 'Flexiones' : 'Push-ups',
    squats:  i18n.locale === 'es' ? 'Sentadillas' : 'Squats',
    dips:    i18n.locale === 'es' ? 'Fondos' : 'Dips',
    situps:  i18n.locale === 'es' ? 'Abdominales' : 'Sit-ups',
  };
  return map[slug] || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '—');
}

const statCards = computed(() => {
  if (!weeklyData.value) return [];
  return [
    {
      icon: '⚔️',
      value: weeklyData.value.bossDamage.toLocaleString(),
      label: i18n.locale === 'es' ? 'Daño jefe' : 'Boss dmg',
      color: '#ef4444',
      border: 'rgba(239,68,68,0.25)',
    },
    {
      icon: '🔥',
      value: String(weeklyData.value.streak),
      label: i18n.locale === 'es' ? 'Racha días' : 'Day streak',
      color: '#f59e0b',
      border: 'rgba(245,158,11,0.25)',
    },
    {
      icon: '⭐',
      value: `Nv. ${weeklyData.value.level}`,
      label: i18n.locale === 'es' ? 'Nivel' : 'Level',
      color: '#10b981',
      border: 'rgba(16,185,129,0.25)',
    },
  ];
});

async function handleShare() {
  await share();
}

async function handleDownload() {
  // Share falls back to download automatically when canShare is unavailable
  await share();
}
</script>

<style scoped>
.wsc-fade-enter-active,
.wsc-fade-leave-active {
  transition: opacity 0.2s ease;
}
.wsc-fade-enter-from,
.wsc-fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <Teleport to="body">
    <Transition name="wsc-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
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
            <div class="h-10 rounded-xl bg-white/[0.04]" />
          </div>

          <!-- Content -->
          <div v-else-if="weeklyData" class="px-5 py-5 space-y-3">
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
            <div class="grid grid-cols-3 gap-2">
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

            <!-- Global ranking -->
            <div
              v-if="weeklyData.ranking?.globalRank"
              class="rounded-2xl border px-5 py-3 flex items-center gap-4"
              :class="weeklyData.ranking.globalRank <= 3
                ? 'border-amber-500/40 bg-amber-500/[0.10]'
                : weeklyData.ranking.globalRank <= 10
                  ? 'border-primary-500/30 bg-primary-500/[0.08]'
                  : 'border-white/[0.09] bg-white/[0.03]'"
            >
              <div class="shrink-0 text-center w-14">
                <p
                  class="text-3xl font-black tabular-nums leading-none"
                  :class="weeklyData.ranking.globalRank === 1
                    ? 'text-amber-400'
                    : weeklyData.ranking.globalRank <= 3
                      ? 'text-amber-300'
                      : weeklyData.ranking.globalRank <= 10
                        ? 'text-primary-400'
                        : 'text-white/80'"
                >
                  #{{ weeklyData.ranking.globalRank }}
                </p>
                <p class="text-[9px] font-bold tracking-wider uppercase mt-0.5 text-white/40">
                  {{ i18n.locale === 'es' ? 'mundial' : 'global' }}
                </p>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] font-bold tracking-widest uppercase"
                  :class="weeklyData.ranking.globalRank <= 3 ? 'text-amber-400/80' : 'text-primary-400/80'">
                  {{ rankingLabel }}
                </p>
                <p class="text-xs text-white/50 mt-0.5" v-if="weeklyData.ranking.totalPlayers">
                  {{ i18n.locale === 'es'
                    ? `de ${weeklyData.ranking.totalPlayers.toLocaleString()} atletas`
                    : `of ${weeklyData.ranking.totalPlayers.toLocaleString()} athletes` }}
                </p>
              </div>
              <span class="text-2xl shrink-0">{{ rankingEmoji }}</span>
            </div>

            <!-- Gear row -->
            <div v-if="weeklyData.gear?.weapon || weeklyData.gear?.armor" class="grid grid-cols-2 gap-2">
              <div
                v-for="item in gearItems"
                :key="item.slot"
                class="rounded-xl border bg-white/[0.03] px-3 py-2.5 flex items-center gap-2"
                :style="{ borderColor: rarityBorder(item.rarity) }"
              >
                <span class="text-lg shrink-0">{{ item.icon }}</span>
                <div class="min-w-0">
                  <p class="text-[9px] font-bold tracking-wider uppercase" :style="{ color: rarityColor(item.rarity) }">
                    {{ item.slot }}
                  </p>
                  <p class="text-[11px] font-semibold text-white/80 truncate">{{ item.name }}</p>
                </div>
              </div>
            </div>

            <!-- Active buff -->
            <div
              v-if="weeklyData.activeBuff"
              class="rounded-xl border border-violet-500/30 bg-violet-500/[0.08] px-4 py-2.5 flex items-center gap-3"
            >
              <span class="text-xl">⚗️</span>
              <div>
                <p class="text-[9px] font-bold tracking-widest text-violet-400/70 uppercase">
                  {{ i18n.locale === 'es' ? 'Buff activo' : 'Active buff' }}
                </p>
                <p class="text-sm font-bold text-violet-300">
                  ×{{ weeklyData.activeBuff.multiplier }}
                  <span class="font-normal text-violet-400/60 text-xs">
                    {{ i18n.locale === 'es' ? 'daño' : 'damage' }}
                  </span>
                </p>
              </div>
            </div>

            <!-- Unclaimed chests -->
            <div
              v-if="weeklyData.unclaimedChests > 0"
              class="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] px-4 py-2.5 flex items-center gap-3"
            >
              <span class="text-xl">📦</span>
              <div>
                <p class="text-[9px] font-bold tracking-widest text-amber-400/70 uppercase">
                  {{ i18n.locale === 'es' ? 'Cofres sin abrir' : 'Unclaimed chests' }}
                </p>
                <p class="text-sm font-bold text-amber-300">{{ weeklyData.unclaimedChests }}</p>
              </div>
            </div>

            <!-- Star exercise -->
            <div
              v-if="weeklyData.starExercise"
              class="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-2.5 flex items-center gap-3"
            >
              <span class="text-xl">🏅</span>
              <div class="min-w-0">
                <p class="text-[9px] font-bold tracking-widest text-amber-400/70 uppercase">
                  {{ i18n.locale === 'es' ? 'Ejercicio estrella' : 'Star exercise' }}
                </p>
                <p class="text-sm font-bold text-amber-300 truncate">
                  {{ exerciseLabel(weeklyData.starExercise) }}
                  <span class="font-normal text-amber-400/60"> · {{ weeklyData.starCount.toLocaleString() }} reps</span>
                </p>
              </div>
            </div>

            <!-- Empty state -->
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
          <div v-if="weeklyData" class="flex gap-3 px-5 pb-6 pt-2">
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] py-3 text-sm font-semibold text-foreground/80 hover:bg-white/[0.09] transition-colors active:scale-[0.98]"
              :disabled="generating"
              @click="share()"
            >
              <Download class="w-4 h-4" />
              {{ i18n.locale === 'es' ? 'Descargar' : 'Download' }}
            </button>
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors active:scale-[0.98] disabled:opacity-50"
              :disabled="generating || weeklyData.totalReps === 0"
              @click="share()"
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

const props = defineProps({ open: Boolean });
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

const RARITY_COLORS = {
  common:      '#9ca3af',
  rare:        '#60a5fa',
  especial:    '#a78bfa',
  legendary:   '#f59e0b',
  calistenico: '#34d399',
  cosmico:     '#f472b6',
};

function rarityColor(r) { return RARITY_COLORS[r] || '#9ca3af'; }
function rarityBorder(r) {
  const c = RARITY_COLORS[r] || '#9ca3af';
  return c + '40';
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

const rankingEmoji = computed(() => {
  const r = weeklyData.value?.ranking?.globalRank;
  if (!r) return '';
  if (r === 1) return '👑';
  if (r <= 3) return '🏆';
  if (r <= 10) return '🥇';
  if (r <= 50) return '⚔️';
  return '🎯';
});

const rankingLabel = computed(() => {
  const r = weeklyData.value?.ranking?.globalRank;
  if (!r) return '';
  const es = i18n.locale === 'es';
  if (r === 1) return es ? '¡NÚMERO 1 DEL MUNDO!' : 'NUMBER 1 IN THE WORLD!';
  if (r <= 3) return es ? 'TOP 3 MUNDIAL' : 'TOP 3 WORLDWIDE';
  if (r <= 10) return es ? 'TOP 10 MUNDIAL' : 'TOP 10 WORLDWIDE';
  if (r <= 50) return es ? 'TOP 50 MUNDIAL' : 'TOP 50 WORLDWIDE';
  if (r <= 100) return es ? 'TOP 100 MUNDIAL' : 'TOP 100 WORLDWIDE';
  return es ? 'RANKING GLOBAL' : 'GLOBAL RANKING';
});

const gearItems = computed(() => {
  if (!weeklyData.value?.gear) return [];
  const items = [];
  if (weeklyData.value.gear.weapon) {
    items.push({ slot: i18n.locale === 'es' ? 'Arma' : 'Weapon', icon: '🗡️', ...weeklyData.value.gear.weapon });
  }
  if (weeklyData.value.gear.armor) {
    items.push({ slot: i18n.locale === 'es' ? 'Armadura' : 'Armor', icon: '🛡️', ...weeklyData.value.gear.armor });
  }
  return items;
});
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

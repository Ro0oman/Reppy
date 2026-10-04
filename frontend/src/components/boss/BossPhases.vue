<template>
  <div class="boss-phases" role="group" :aria-label="i18n.t('boss_hp_label')">
    <div class="boss-phases__bar" role="progressbar" :aria-valuenow="Math.round(hpPercent)" aria-valuemin="0" aria-valuemax="100">
      <div
        v-for="n in PHASES"
        :key="n"
        class="boss-phases__seg"
        :class="{
          'boss-phases__seg--active': !defeated && n === phase,
          'boss-phases__seg--empty': fill(n) <= 0,
        }"
      >
        <div class="boss-phases__fill" :class="tone" :style="{ width: fill(n) + '%' }">
          <div class="boss-phases__shimmer"></div>
        </div>
      </div>
    </div>

    <div class="boss-phases__legend">
      <span v-for="n in PHASES" :key="n" class="boss-phases__tick" :class="{ 'boss-phases__tick--on': !defeated && n === phase, 'boss-phases__tick--done': defeated || n < phase }">
        {{ n }}
      </span>
    </div>

    <p class="boss-phases__status" aria-live="polite">
      <template v-if="defeated">{{ i18n.t('boss_phase_done') }}</template>
      <template v-else-if="phase === PHASES">{{ i18n.t('boss_phase_last') }}</template>
      <template v-else>
        {{ i18n.t('boss_phase_n', { n: phase, total: PHASES }) }} ·
        {{ i18n.t('boss_phase_gap', { n: formatNumber(gapToNextPhase), next: phase + 1 }) }}
      </template>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18nStore } from '@/stores/i18n';
import { formatNumber } from '@/utils/numberUtils';

const props = defineProps({
  currentHp: { type: Number, default: 0 },
  totalHp: { type: Number, default: 1 },
  defeated: { type: Boolean, default: false },
  tone: { type: String, default: 'boss-phases__fill--rare' }, // rare | epic | legendary (clase de relleno)
});

const i18n = useI18nStore();
const PHASES = 4;

const hpPercent = computed(() => {
  if (!props.totalHp) return 0;
  return Math.max(0, Math.min(100, (props.currentHp / props.totalHp) * 100));
});

// El jefe empieza en la fase 1 con la vida llena y entra en la fase 4 por debajo del 25 %.
// Fase n ocupa el tramo [100 - n·25, 100 - (n-1)·25] de la vida.
const phase = computed(() => {
  const lost = 100 - hpPercent.value;
  return Math.min(PHASES, Math.floor(lost / 25) + 1);
});

// Cuánto de cada tramo sigue lleno (un tramo por encima del actual = 100, por debajo = 0).
const fill = (n) => {
  const top = 100 - (n - 1) * 25;
  const bottom = top - 25;
  const pct = ((hpPercent.value - bottom) / 25) * 100;
  return Math.max(0, Math.min(100, pct));
};

// Daño que falta para cruzar al siguiente umbral (en HP absolutos).
const gapToNextPhase = computed(() => {
  const nextThresholdPct = 100 - phase.value * 25;
  const nextThresholdHp = (props.totalHp * nextThresholdPct) / 100;
  return Math.max(0, Math.ceil(props.currentHp - nextThresholdHp));
});
</script>

<style scoped>
.boss-phases { display: grid; gap: 8px; }
.boss-phases__bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.boss-phases__seg {
  height: 14px;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.boss-phases__seg--active {
  border-color: rgba(255, 255, 255, 0.45);
  box-shadow: 0 0 18px -2px rgba(255, 255, 255, 0.35);
}
.boss-phases__seg--empty { opacity: 0.55; }
.boss-phases__fill {
  position: relative;
  height: 100%;
  overflow: hidden;
  transition: width 0.7s ease;
}
.boss-phases__fill--rare { background: linear-gradient(90deg, #6366f1, #22d3ee); }
.boss-phases__fill--epic { background: linear-gradient(90deg, #a855f7, #6366f1, #22d3ee); }
.boss-phases__fill--danger { background: linear-gradient(90deg, #fb7185, #fb923c, #fbbf24); }
.boss-phases__fill--legendary { background: linear-gradient(90deg, #d97706, #fbbf24, #fde68a); }
.boss-phases__shimmer {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 20%, rgba(255, 255, 255, 0.28) 50%, transparent 80%);
  transform: translateX(-100%);
  animation: boss-phases-shimmer 2.4s linear infinite;
}
@keyframes boss-phases-shimmer { to { transform: translateX(100%); } }

.boss-phases__legend { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.boss-phases__tick {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--os-muted, #9b9bb4);
  opacity: 0.6;
}
.boss-phases__tick--on { color: #fff; opacity: 1; }
.boss-phases__tick--done { opacity: 0.35; }
.boss-phases__status { font-size: 13px; font-weight: 600; color: var(--os-text, #f4f4fb); line-height: 1.3; }

@media (prefers-reduced-motion: reduce) {
  .boss-phases__shimmer { animation: none; }
  .boss-phases__fill { transition: none; }
}
</style>

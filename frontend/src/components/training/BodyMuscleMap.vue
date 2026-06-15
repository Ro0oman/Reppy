<template>
  <div class="muscle-map">
    <svg viewBox="0 0 300 320" class="mx-auto h-auto w-full max-w-[320px] select-none" xmlns="http://www.w3.org/2000/svg">
      <!-- Reusable subtle body base (authored around center x=75) -->
      <defs>
        <g id="reppy-figure">
          <circle cx="75" cy="30" r="12.5" class="body-base" />
          <rect x="69.5" y="39" width="11" height="8" rx="3" class="body-base" />
          <!-- torso -->
          <path d="M55 56 Q75 50 95 56 L90 124 Q75 130 60 124 Z" class="body-base" />
          <!-- pelvis -->
          <path d="M60 122 L90 122 L86 150 Q75 154 64 150 Z" class="body-base" />
          <!-- arms -->
          <path d="M40 64 Q40 56 47 56 Q54 56 54 64 L52 128 Q52 135 46 135 Q40 135 40 128 Z" class="body-base" />
          <path d="M110 64 Q110 56 103 56 Q96 56 96 64 L98 128 Q98 135 104 135 Q110 135 110 128 Z" class="body-base" />
          <!-- legs -->
          <path d="M60 150 L73 150 L73 232 Q73 238 66.5 238 Q60 238 60 232 Z" class="body-base" />
          <path d="M77 150 L90 150 L90 232 Q90 238 83.5 238 Q77 238 77 232 Z" class="body-base" />
        </g>
      </defs>

      <!-- ============ FRONT ============ -->
      <g>
        <text x="75" y="14" text-anchor="middle" class="fig-label">{{ i18n.locale === 'es' ? 'FRENTE' : 'FRONT' }}</text>
        <use href="#reppy-figure" />
        <!-- shoulders -->
        <ellipse cx="49" cy="62" rx="9" ry="8" :fill="c('shoulders')" class="muscle" />
        <ellipse cx="101" cy="62" rx="9" ry="8" :fill="c('shoulders')" class="muscle" />
        <!-- chest -->
        <path d="M74 57 Q61 58 60 69 Q61 79 74 79 Z" :fill="c('chest')" class="muscle" />
        <path d="M76 57 Q89 58 90 69 Q89 79 76 79 Z" :fill="c('chest')" class="muscle" />
        <!-- biceps -->
        <ellipse cx="46" cy="86" rx="6" ry="15" :fill="c('biceps')" class="muscle" />
        <ellipse cx="104" cy="86" rx="6" ry="15" :fill="c('biceps')" class="muscle" />
        <!-- forearms -->
        <ellipse cx="44" cy="118" rx="5.5" ry="15" :fill="c('forearms')" class="muscle" />
        <ellipse cx="106" cy="118" rx="5.5" ry="15" :fill="c('forearms')" class="muscle" />
        <!-- core / abs -->
        <rect x="64" y="83" width="22" height="38" rx="7" :fill="c('core')" class="muscle" />
        <!-- quads -->
        <ellipse cx="66" cy="186" rx="7" ry="30" :fill="c('quads')" class="muscle" />
        <ellipse cx="84" cy="186" rx="7" ry="30" :fill="c('quads')" class="muscle" />
      </g>

      <!-- ============ BACK ============ -->
      <g>
        <text x="225" y="14" text-anchor="middle" class="fig-label">{{ i18n.locale === 'es' ? 'ESPALDA' : 'BACK' }}</text>
        <use href="#reppy-figure" transform="translate(150,0)" />
        <!-- traps -->
        <path d="M211 56 Q225 52 239 56 Q233 70 225 70 Q217 70 211 56 Z" :fill="c('traps')" class="muscle" />
        <!-- shoulders (rear delts) -->
        <ellipse cx="199" cy="62" rx="9" ry="8" :fill="c('shoulders')" class="muscle" />
        <ellipse cx="251" cy="62" rx="9" ry="8" :fill="c('shoulders')" class="muscle" />
        <!-- back / lats -->
        <path d="M224 72 Q212 74 211 92 Q212 108 224 110 Z" :fill="c('back')" class="muscle" />
        <path d="M226 72 Q238 74 239 92 Q238 108 226 110 Z" :fill="c('back')" class="muscle" />
        <!-- triceps -->
        <ellipse cx="196" cy="86" rx="6" ry="15" :fill="c('triceps')" class="muscle" />
        <ellipse cx="254" cy="86" rx="6" ry="15" :fill="c('triceps')" class="muscle" />
        <!-- forearms -->
        <ellipse cx="194" cy="118" rx="5.5" ry="15" :fill="c('forearms')" class="muscle" />
        <ellipse cx="256" cy="118" rx="5.5" ry="15" :fill="c('forearms')" class="muscle" />
        <!-- glutes -->
        <path d="M225 124 Q212 124 212 137 Q212 149 225 149 Z" :fill="c('glutes')" class="muscle" />
        <path d="M225 124 Q238 124 238 137 Q238 149 225 149 Z" :fill="c('glutes')" class="muscle" />
        <!-- hamstrings -->
        <ellipse cx="216" cy="180" rx="7" ry="26" :fill="c('hamstrings')" class="muscle" />
        <ellipse cx="234" cy="180" rx="7" ry="26" :fill="c('hamstrings')" class="muscle" />
        <!-- calves -->
        <ellipse cx="216" cy="216" rx="6" ry="15" :fill="c('calves')" class="muscle" />
        <ellipse cx="234" cy="216" rx="6" ry="15" :fill="c('calves')" class="muscle" />
      </g>
    </svg>

    <!-- worked-muscle legend -->
    <div v-if="topMuscles.length" class="mt-2 flex flex-wrap justify-center gap-1.5">
      <span
        v-for="m in topMuscles"
        :key="m.key"
        class="inline-flex items-center gap-1 rounded-full border border-primary-500/25 bg-primary-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-500"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-primary-500" :style="{ opacity: 0.3 + 0.7 * m.value }"></span>
        {{ label(m.key) }}
      </span>
    </div>
    <p v-else class="mt-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted/60">
      {{ i18n.locale === 'es' ? 'Sin datos musculares' : 'No muscle data' }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18nStore } from '@/stores/i18n';
import { MUSCLE_LABELS } from '@/utils/muscleMap';

const props = defineProps({
  // muscleKey -> 0..1 intensity (from aggregateMuscleActivation)
  activation: { type: Object, default: () => ({}) },
  maxLegend: { type: Number, default: 6 },
});

const i18n = useI18nStore();

// Fill color for a muscle region based on its activation intensity.
const c = (muscle) => {
  const v = Number(props.activation?.[muscle] || 0);
  if (v <= 0) return 'hsla(var(--foreground) / 0.10)';
  return `hsla(var(--primary) / ${(0.22 + 0.73 * v).toFixed(3)})`;
};

const label = (key) => MUSCLE_LABELS[key]?.[i18n.locale] || MUSCLE_LABELS[key]?.es || key;

const topMuscles = computed(() =>
  Object.entries(props.activation || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, props.maxLegend)
    .map(([key, value]) => ({ key, value }))
);
</script>

<style scoped>
.muscle { transition: fill 0.4s ease; stroke: hsla(var(--foreground) / 0.14); stroke-width: 0.5; }
.body-base { fill: hsla(var(--foreground) / 0.07); stroke: hsla(var(--foreground) / 0.13); stroke-width: 0.8; }
.fig-label {
  fill: hsla(var(--foreground) / 0.45);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
}
</style>

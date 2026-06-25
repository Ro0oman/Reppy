<template>
  <div class="relative flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="-rotate-90">
      <defs v-if="gradient">
        <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="gradientStops[0]" />
          <stop offset="100%" :stop-color="gradientStops[1]" />
        </linearGradient>
      </defs>
      <!-- Track -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="strokeWidth"
        stroke="currentColor"
        fill="transparent"
        class="text-foreground/10"
      />
      <!-- Progress -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="strokeWidth"
        :stroke="strokeColor"
        fill="transparent"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashoffset"
        class="transition-all duration-700 ease-out"
        :style="glow ? { filter: `drop-shadow(0 0 6px ${glowColor})` } : null"
      />
    </svg>
    <!-- Center content -->
    <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
      <slot>
        <span class="text-2xl font-bold tabular-nums text-foreground">{{ Math.round(clampedProgress) }}%</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // 0–100
  progress: { type: Number, default: 0 },
  size: { type: Number, default: 160 },
  strokeWidth: { type: Number, default: 12 },
  // 'primary' | 'neon' | 'violet' | 'accent' — color of the progress arc.
  // Defaults to legacy behaviour: primary, switching to accent at 100%.
  color: { type: String, default: 'auto' },
  glow: { type: Boolean, default: false },
  gradient: { type: Boolean, default: false },
});

const clampedProgress = computed(() => Math.min(Math.max(props.progress, 0), 100));
const isComplete = computed(() => clampedProgress.value >= 100);
const radius = computed(() => (props.size / 2) - props.strokeWidth);
const circumference = computed(() => 2 * Math.PI * radius.value);
const dashoffset = computed(() => circumference.value - (clampedProgress.value / 100) * circumference.value);

const gradientId = `rp-grad-${Math.random().toString(36).slice(2, 9)}`;

const COLOR_VARS = {
  primary: '--primary',
  neon: '--neon',
  violet: '--neon-violet',
  accent: '--accent',
};

const baseVar = computed(() => {
  if (props.color === 'auto') return isComplete.value ? '--accent' : '--primary';
  return COLOR_VARS[props.color] || '--primary';
});

const gradientStops = computed(() => {
  // Slightly brighter → base for a subtle sheen.
  return [`hsl(var(${baseVar.value}) / 0.7)`, `hsl(var(${baseVar.value}))`];
});

const strokeColor = computed(() =>
  props.gradient ? `url(#${gradientId})` : `hsl(var(${baseVar.value}))`
);

const glowColor = computed(() => `hsl(var(${baseVar.value}) / 0.6)`);
</script>

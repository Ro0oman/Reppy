<template>
  <div class="relative flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="-rotate-90">
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
        :stroke="isComplete ? 'hsl(var(--accent))' : 'hsl(var(--primary))'"
        fill="transparent"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashoffset"
        class="transition-all duration-700 ease-out"
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
});

const clampedProgress = computed(() => Math.min(Math.max(props.progress, 0), 100));
const isComplete = computed(() => clampedProgress.value >= 100);
const radius = computed(() => (props.size / 2) - props.strokeWidth);
const circumference = computed(() => 2 * Math.PI * radius.value);
const dashoffset = computed(() => circumference.value - (clampedProgress.value / 100) * circumference.value);
</script>

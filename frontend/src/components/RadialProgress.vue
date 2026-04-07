<template>
  <div class="relative flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="transform -rotate-90">
      <!-- Background Circle -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        stroke="currentColor"
        stroke-width="12"
        fill="transparent"
        class="text-foreground/10"
      />
      <!-- Progress Circle -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        stroke="url(#progressGradient)"
        stroke-width="12"
        fill="transparent"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashoffset"
        class="transition-all duration-1000 ease-out"
      />
      <!-- Gradient Definition -->
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF4500" />
          <stop offset="100%" stop-color="#CCFF00" />
        </linearGradient>
      </defs>
    </svg>
    <!-- Center Label -->
    <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
      <slot>
        <span class="text-2xl font-black text-industrial text-foreground">{{ Math.round(progress) }}%</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  progress: {
    type: Number,
    default: 0
  },
  size: {
    type: Number,
    default: 160
  }
});

const radius = computed(() => (props.size / 2) - 10);
const circumference = computed(() => 2 * Math.PI * radius.value);
const dashoffset = computed(() => {
  const p = Math.min(Math.max(props.progress, 0), 100);
  return circumference.value - (p / 100) * circumference.value;
});
</script>

<style scoped>
.text-industrial {
  font-family: 'Inter Tight', sans-serif;
}
</style>

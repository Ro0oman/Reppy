<template>
  <img :src="src" :class="className" :alt="`chest-${variant}`" />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  className: { type: String, default: '' },
  variant: { type: String, default: 'normal' }
});

const src = computed(() => {
  if (props.variant === 'legendary') return '/assets/chests/strongbox.png';
  if (props.variant === 'epic') return '/assets/chests/mimic-chest.png';
  return '/assets/chests/chest.png';
});
</script>

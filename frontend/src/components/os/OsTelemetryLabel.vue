<script setup>
defineProps({
  tone: { type: String, default: 'cyan' }, // cyan | muted | orange
})
</script>

<template>
  <span
    class="os-label"
    :class="{ 'os-label--muted': tone === 'muted', 'os-label--orange': tone === 'orange' }"
  >
    <slot />
  </span>
</template>

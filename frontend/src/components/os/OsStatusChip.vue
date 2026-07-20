<script setup>
// Estado con texto + señal, nunca solo color.
defineProps({
  status: { type: String, required: true }, // live | complete | locked | new
})
</script>

<template>
  <span class="os-chip" :class="`os-chip--${status}`">
    <span v-if="status === 'live'" class="os-chip__dot" aria-hidden="true"></span>
    <svg v-else-if="status === 'complete'" class="os-chip__icon" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 6.5L4.8 9 10 3.5" /></svg>
    <svg v-else-if="status === 'locked'" class="os-chip__icon" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2.5" y="5.5" width="7" height="5" /><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" /></svg>
    <slot />
  </span>
</template>

<style scoped>
.os-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 2px;
  padding: 4px 8px;
  font: 500 10px / 1 var(--os-font-mono);
  letter-spacing: 1px;
  text-transform: uppercase;
}
.os-chip--live { border: 1px solid #1c3a75; background: #0e1d3a; color: #9fcbff; }
.os-chip--complete { border: 1px solid #1c5c3c; background: #0b2418; color: var(--os-success); }
.os-chip--locked { border: 1px solid var(--os-line); background: transparent; color: var(--os-muted); }
.os-chip--new { border: 1px solid #1c3a75; background: #0e2452; color: var(--os-cyan); }
.os-chip__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--os-orange);
  box-shadow: 0 0 8px var(--os-orange);
  animation: os-breathe 2.6s var(--os-ease) infinite;
}
.os-chip__icon { width: 11px; height: 11px; }
@media (prefers-reduced-motion: reduce) { .os-chip__dot { animation: none; } }
</style>

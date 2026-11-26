<script setup>
// El componente más importante del sistema. Anatomía:
// label de contexto → nombre/objetivo → estado (slot) → consecuencia → CTA.
// Variantes: boss | campaign | guided | daily.
import OsTelemetryLabel from './OsTelemetryLabel.vue'

defineProps({
  variant: { type: String, default: 'boss' },
  context: { type: String, required: true },  // "GLOBAL RAID / SECTOR 03"
  title: { type: String, required: true },    // "THE WARDEN"
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <section class="os-mission" :class="`os-mission--${variant}`">
    <div class="os-mission__visual" aria-hidden="true"><slot name="visual" /></div>
    <div class="os-mission__copy">
      <OsTelemetryLabel :tone="variant === 'daily' ? 'orange' : 'cyan'">{{ context }}</OsTelemetryLabel>
      <h2 class="os-display os-mission__title">{{ title }}</h2>
      <p v-if="subtitle" class="os-mission__subtitle">{{ subtitle }}</p>
      <div class="os-mission__state"><slot /></div>
      <div v-if="$slots.consequence" class="os-mission__consequence"><slot name="consequence" /></div>
    </div>
    <div v-if="$slots.action" class="os-mission__action"><slot name="action" /></div>
  </section>
</template>

<style scoped>
.os-mission {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  border: 1px solid var(--os-line);
  border-radius: var(--os-radius-sheet);
  background: var(--os-panel);
  color: var(--os-text);
}
.os-mission__visual { position: absolute; inset: 0; pointer-events: none; }
.os-mission__copy { position: relative; z-index: 1; padding: 26px 28px 24px; min-width: 0; }
.os-mission__title { margin: 8px 0 0; font-size: clamp(2.1rem, 4vw, 3.4rem); }
.os-mission__subtitle { color: var(--os-muted); font-size: 0.85rem; margin: 10px 0 0; max-width: 52ch; }
.os-mission__state { margin-top: 22px; max-width: 480px; }
.os-mission__consequence {
  margin-top: 20px;
  font: 500 1.125rem var(--os-font-body);
}
.os-mission__action {
  position: relative;
  z-index: 2;
  padding: 24px 22px;
  background: var(--os-ink);
  border-left: 1px solid var(--os-line);
  display: flex;
  flex-direction: column;
  min-width: 260px;
}
@media (max-width: 820px) {
  .os-mission { grid-template-columns: 1fr; }
  .os-mission__action { border-left: 0; border-top: 1px solid var(--os-line); min-width: 0; }
}
</style>

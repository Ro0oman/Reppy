<script setup>
// Fila de telemetría: nombre → barra/valor → estado al extremo derecho.
defineProps({
  label: { type: String, required: true },
  index: { type: String, default: '' },   // "01", "END", ...
  value: { type: String, default: '' },   // "36 / 50", "2,480 RC"
  progress: { type: Number, default: null }, // 0-100, pinta minibar
  interactive: { type: Boolean, default: false },
})
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'"
    class="os-strip"
    :class="{ 'os-strip--interactive': interactive }"
  >
    <span class="os-strip__name">
      <span v-if="index" class="os-strip__idx">{{ index }}</span>
      <b>{{ label }}</b>
    </span>
    <span v-if="progress !== null" class="os-minibar os-strip__bar"><i :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"></i></span>
    <span class="os-strip__val os-num"><slot>{{ value }}</slot></span>
  </component>
</template>

<style scoped>
.os-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 44px;
  border: 0;
  border-top: 1px solid #202c3e;
  background: none;
  color: var(--os-text);
  font-size: 0.8rem;
  text-align: left;
  padding: 0;
}
.os-strip:first-child { border-top: 0; }
.os-strip--interactive { cursor: pointer; }
.os-strip--interactive:hover { background: rgba(18, 28, 43, 0.6); }
.os-strip__name { display: flex; align-items: center; gap: 10px; min-width: 0; }
.os-strip__name b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.os-strip__idx { color: var(--os-muted); font: 500 10px var(--os-font-mono); letter-spacing: 1px; }
.os-strip__bar { flex: 1; max-width: 140px; }
.os-strip__val {
  color: var(--os-cyan);
  font: 500 11px var(--os-font-mono);
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
}
</style>

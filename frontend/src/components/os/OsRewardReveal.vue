<script setup>
// Secuencia de recompensa in situ: el valor ganado aparece próximo a su origen
// y se disipa hacia arriba (+240 XP, +12 RC, CRIT ×1.8). No es un modal.
// Uso: <OsRewardReveal ref="reveal" /> ... reveal.value.show('+240 XP')
import { ref } from 'vue'

const items = ref([])
let nextId = 0

function show(text, tone = 'cyan') {
  const id = nextId++
  items.value.push({ id, text, tone })
  setTimeout(() => {
    items.value = items.value.filter((i) => i.id !== id)
  }, 2400)
}

defineExpose({ show })
</script>

<template>
  <div class="os-reveal" aria-live="polite">
    <span
      v-for="item in items"
      :key="item.id"
      class="os-reveal__item"
      :class="`os-reveal__item--${item.tone}`"
    >{{ item.text }}</span>
  </div>
</template>

<style scoped>
.os-reveal { position: relative; pointer-events: none; }
.os-reveal__item {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font: 700 1.4rem var(--os-font-display);
  letter-spacing: 1px;
  animation: os-float-up 2.4s var(--os-ease) forwards;
}
.os-reveal__item--cyan { color: var(--os-cyan); text-shadow: 0 0 14px rgba(97, 217, 255, 0.7); }
.os-reveal__item--orange { color: var(--os-orange); text-shadow: 0 0 14px rgba(255, 106, 50, 0.6); }
.os-reveal__item--success { color: var(--os-success); text-shadow: 0 0 14px rgba(69, 233, 145, 0.6); }
@media (prefers-reduced-motion: reduce) {
  .os-reveal__item { animation: none; opacity: 1; }
}
</style>

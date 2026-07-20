<script setup>
// Ficha de personaje operativo: avatar, nivel, título, racha y 3 atributos clave.
import OsTelemetryLabel from './OsTelemetryLabel.vue'

defineProps({
  name: { type: String, required: true },
  level: { type: [Number, String], required: true },
  title: { type: String, default: '' },        // "VANGUARD CLASS"
  avatarUrl: { type: String, default: '' },
  streakDays: { type: Number, default: 0 },
  streakLabel: { type: String, default: '' },
  // [{ code: 'STR', value: 24, max: 40 }] — máx. 3 en pantalla, el resto en VIEW FULL BUILD
  attributes: { type: Array, default: () => [] },
})
</script>

<template>
  <aside class="os-build os-panel">
    <div class="os-build__pilot">
      <div class="os-build__avatar">
        <img v-if="avatarUrl" :src="avatarUrl" :alt="name" referrerpolicy="no-referrer" />
        <span v-else>{{ name.charAt(0).toUpperCase() }}</span>
      </div>
      <div>
        <strong class="os-build__name">{{ name }} // LV.{{ level }}</strong>
        <small v-if="title" class="os-build__title">{{ title }}</small>
      </div>
    </div>

    <div v-if="streakDays > 0" class="os-build__streak">
      <b class="os-num">{{ streakDays }} {{ streakDays === 1 ? 'DÍA' : 'DÍAS' }}</b>
      <span>{{ streakLabel || 'STREAK INTEGRITY · STABLE' }}</span>
    </div>

    <template v-if="attributes.length">
      <OsTelemetryLabel>Combat build</OsTelemetryLabel>
      <div v-for="attr in attributes.slice(0, 3)" :key="attr.code" class="os-build__attr">
        <em>{{ attr.code }}</em>
        <span class="os-minibar"><i :style="{ width: `${Math.min(100, (attr.value / (attr.max || 100)) * 100)}%` }"></i></span>
        <b class="os-num">{{ attr.value }}</b>
      </div>
    </template>

    <slot />
  </aside>
</template>

<style scoped>
.os-build { padding: 20px; }
.os-build__pilot {
  display: flex; gap: 12px; align-items: center;
  border-bottom: 1px solid #233147; padding-bottom: 18px; margin-bottom: 18px;
}
.os-build__avatar {
  width: 46px; height: 46px; border-radius: 50%; overflow: hidden; flex: none;
  display: grid; place-items: center;
  background: linear-gradient(135deg, #3c7fff, #0d294f);
  border: 1px solid #7db8ff;
  font: 700 1.4rem var(--os-font-display);
  color: #fff;
}
.os-build__avatar img { width: 100%; height: 100%; object-fit: cover; }
.os-build__name { display: block; font-size: 0.8rem; letter-spacing: 0.4px; }
.os-build__title { color: var(--os-muted); font: 400 10px var(--os-font-mono); letter-spacing: 1px; text-transform: uppercase; }
.os-build__streak {
  margin: 0 0 18px; padding: 14px 16px;
  background: #1a1410; border-left: 3px solid var(--os-orange); border-radius: 2px;
}
.os-build__streak b { font: 700 2.1rem / 0.85 var(--os-font-display); color: #ff8a4d; display: block; }
.os-build__streak span { display: block; font: 500 10px var(--os-font-mono); letter-spacing: 1px; color: #d9ae97; margin-top: 7px; text-transform: uppercase; }
.os-build__attr {
  display: grid; grid-template-columns: 36px 1fr auto;
  align-items: center; gap: 10px;
  min-height: 40px; border-top: 1px solid #202c3e;
  font-size: 0.8rem;
}
.os-build__attr:first-of-type { border-top: 0; margin-top: 8px; }
.os-build__attr em { font: 500 10px var(--os-font-mono); color: #70bcff; font-style: normal; letter-spacing: 1px; }
</style>

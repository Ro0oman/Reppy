<template>
  <section class="vibe-greeting" :aria-label="i18n.t('vibe_greeting_label')">
    <p class="vibe-greeting__title">
      {{ greeting }}<br />
      <span class="vibe-greeting__sub">{{ subtitle }}</span>
    </p>

    <div class="vibe-greeting__energy">
      <p class="vibe-greeting__energy-label" :id="labelId">{{ i18n.t('vibe_energy_label') }}</p>
      <div class="vibe-greeting__segmented" role="radiogroup" :aria-labelledby="labelId">
        <button
          v-for="opt in options"
          :key="opt.id"
          type="button"
          role="radio"
          :aria-checked="energy === opt.id"
          :class="{ 'is-on': energy === opt.id }"
          @click="setEnergy(opt.id)"
        >{{ i18n.t(opt.key) }}</button>
      </div>
    </div>
  </section>
</template>

<script setup>
// Cabecera del panel: saludo + «tu energía hoy».
// La energía cambia la sugerencia y ajusta el registro rápido (stores/energy.js);
// no toca reglas, daño ni economía.
import { computed } from 'vue';
import { useEnergyStore } from '@/stores/energy';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { useTrainingStore } from '@/stores/training';

const authStore = useAuthStore();
const i18n = useI18nStore();
const trainingStore = useTrainingStore();

const labelId = 'vibe-energy-label';
const options = [
  { id: 'low', key: 'vibe_energy_low' },
  { id: 'mid', key: 'vibe_energy_mid' },
  { id: 'high', key: 'vibe_energy_high' },
];

const energyStore = useEnergyStore();
const energy = computed(() => energyStore.energy);
const setEnergy = (id) => energyStore.setEnergy(id);

const greeting = computed(() => {
  const h = new Date().getHours();
  const name = authStore.user?.name?.split(' ')[0] || '';
  const key = h < 14 ? 'vibe_hello_morning' : h < 21 ? 'vibe_hello_afternoon' : 'vibe_hello_evening';
  return i18n.t(key, { name });
});

// Con plan guiado, lo que toca hoy; si no, una sugerencia según la energía.
const subtitle = computed(() => {
  const titleKey = trainingStore.todayWorkout?.day?.titleKey;
  if (titleKey) return i18n.t('vibe_today_plan', { title: i18n.t(titleKey) });
  return i18n.t(`vibe_suggest_${energy.value}`);
});
</script>

<style scoped>
.vibe-greeting { display: grid; gap: 12px; padding-top: 4px; }
.vibe-greeting__title {
  font-family: var(--os-font-display);
  font-weight: 500;
  font-size: clamp(1.75rem, 5vw, 2.25rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--os-text);
  margin: 0;
}
.vibe-greeting__sub { color: var(--os-muted); }
.vibe-greeting__energy-label { font-size: 12px; color: var(--os-muted); margin: 0 0 8px; }
.vibe-greeting__segmented {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--os-line);
  border-radius: 12px;
  padding: 4px;
  max-width: 420px;
}
.vibe-greeting__segmented button {
  min-height: 40px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--os-muted);
  transition: background-color var(--os-dur-fast) var(--os-ease), color var(--os-dur-fast) var(--os-ease);
}
.vibe-greeting__segmented button:hover { color: var(--os-text); }
.vibe-greeting__segmented button.is-on { background: var(--os-panel-raised); color: var(--os-text); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08); }
</style>

<template>
  <div class="relative">
    <button type="button" @click="open = !open" :class="[buttonClass, variant === 'strip' ? 'wheels-strip' : 'wheels-chip']"
      :aria-label="i18n.t('wheels_title')" :aria-expanded="open" :title="i18n.t('wheels_title')">
      <Dices class="w-4 h-4" style="color: var(--os-cyan)" />
      <span v-if="variant === 'strip'" class="flex-1 text-left">{{ i18n.t('wheels_title') }}</span>
      <i v-if="anyReady" class="wheels-dot" aria-hidden="true"></i>
    </button>

    <div v-if="open" class="fixed inset-0 z-[80]" @click="open = false" aria-hidden="true"></div>
    <div v-if="open" role="menu"
      class="absolute right-0 top-full mt-2 z-[90] w-64 rounded-lg border border-border bg-surface p-2 shadow-2xl space-y-1">
      <button v-for="w in wheels" :key="w.id" role="menuitem" type="button"
        :disabled="!w.ready" @click="choose(w)"
        class="w-full min-h-[44px] flex items-center gap-3 rounded-md px-3 text-left text-sm transition-colors"
        :class="w.ready ? 'hover:bg-foreground/5 text-foreground' : 'opacity-60 cursor-not-allowed text-muted'">
        <component :is="w.icon" class="w-4 h-4 shrink-0" />
        <span class="flex-1">
          <span class="block font-semibold">{{ w.label }}</span>
          <span class="block text-xs text-muted">
            {{ w.ready ? i18n.t('wheels_ready') : i18n.t('wheel_cooldown', { time: w.cooldown }) }}
          </span>
        </span>
        <i v-if="w.ready" class="wheels-dot wheels-dot--inline" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Dices, Gift } from 'lucide-vue-next';
import { useI18nStore } from '@/stores/i18n';
import { useRouletteStore } from '@/stores/roulette';

const props = defineProps({
  quickCooldown: { type: String, default: '' },
  dailyCooldown: { type: String, default: '' },
  variant: { type: String, default: 'chip' }, // 'chip' (cabecera móvil) | 'strip' (rail de escritorio)
  buttonClass: { type: String, default: '' },
});

const i18n = useI18nStore();
const roulette = useRouletteStore();
const open = ref(false);

const wheels = computed(() => [
  { id: 'daily', icon: Gift, label: i18n.t('wheel_daily_cta'), ready: roulette.dailyCanSpin, cooldown: props.dailyCooldown },
  { id: 'quick', icon: Dices, label: i18n.t('wheels_quick'), ready: roulette.canSpin, cooldown: props.quickCooldown },
]);
const anyReady = computed(() => wheels.value.some(w => w.ready));

const choose = (w) => {
  open.value = false;
  roulette.openModal(w.id === 'daily' ? 'daily' : undefined);
};
</script>

<style scoped>
/* Base propia: las clases os-telemetry__strip / os-topstrip__chip se definen con
   estilos scoped de App.vue, que no llegan a este componente (salía «Ruletas»
   enorme y centrado en el rail). Las pieles siguen pudiendo re-vestirlas. */
.wheels-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 10px;
  border: 1px solid var(--os-line);
  border-radius: 2px;
  background: var(--os-panel);
  color: var(--os-muted);
  font: 500 10px var(--os-font-mono);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  cursor: pointer;
}
.wheels-strip:hover { border-color: var(--os-line-strong); color: var(--os-text); }
.wheels-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 36px;
  padding: 0 9px;
  border: 1px solid var(--os-line);
  border-radius: 2px;
  background: var(--os-panel);
  color: var(--os-text);
}
.wheels-dot {
  position: absolute; top: 4px; right: 4px; width: 8px; height: 8px;
  border-radius: 9999px; background: var(--os-cyan, #22d3ee);
}
.wheels-dot--inline { position: static; flex-shrink: 0; }
</style>

import { defineStore } from 'pinia';
import { useThemeStore } from './theme';

// «Tu energía hoy» (piel Vibe). Ajusta el registro rápido: cantidades sugeridas,
// cantidad inicial y, con energía baja, un ejercicio más suave preseleccionado.
// No toca reglas, daño ni economía. Se recuerda durante el día en el dispositivo.
// Fuera de Vibe (donde no hay selector) siempre vale 'mid' = comportamiento de siempre.
export const ENERGY_PROFILES = {
  low: { presets: [1, 3, 5, 10], defaultReps: 5, exercise: 'pushups' },
  mid: { presets: [1, 5, 10, 20], defaultReps: 10, exercise: null },
  high: { presets: [5, 10, 20, 30], defaultReps: 20, exercise: null },
};

const todayKey = () => `reppy_vibe_energy:${new Date().toDateString()}`;
const readStored = () => {
  if (typeof window === 'undefined') return 'mid';
  try {
    const v = localStorage.getItem(todayKey());
    return ENERGY_PROFILES[v] ? v : 'mid';
  } catch (_) {
    return 'mid';
  }
};

export const useEnergyStore = defineStore('energy', {
  state: () => ({ energy: readStored() }),
  getters: {
    effective(state) {
      const theme = useThemeStore();
      return theme.uiStyle === 'vibe' ? state.energy : 'mid';
    },
    profile() {
      return ENERGY_PROFILES[this.effective];
    },
  },
  actions: {
    setEnergy(id) {
      if (!ENERGY_PROFILES[id]) return;
      this.energy = id;
      try { localStorage.setItem(todayKey(), id); } catch (_) {}
    },
  },
});

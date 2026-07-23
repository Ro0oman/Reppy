import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useAuthStore } from './auth';
import axios from 'axios';

// Estilos de interfaz disponibles. 'operative' = Operative OS (rail +
// telemetría + obsidiana); 'classic' = la vista previa al rediseño.
// Añadir aquí futuros estilos (p. ej. 'ascend') y su etiqueta en el selector.
export const UI_STYLES = ['operative', 'classic'];

export const useThemeStore = defineStore('theme', () => {
  const authStore = useAuthStore();
  // Default to 'dark' if no preference is found
  const theme = ref((!import.meta.env.SSR && localStorage.getItem('reppy_theme')) || 'dark');

  // Estilo de interfaz (skin estructural, independiente de dark/light).
  // localStorage responde al instante; la BD (users.ui_style) lo sigue para
  // que la preferencia viaje entre dispositivos.
  const storedStyle = !import.meta.env.SSR && localStorage.getItem('reppy_ui_style');
  const uiStyle = ref(UI_STYLES.includes(storedStyle) ? storedStyle : 'operative');

  // Al llegar el perfil (login / otro dispositivo), la BD manda.
  watch(() => authStore.user?.ui_style, (dbStyle) => {
    if (dbStyle && UI_STYLES.includes(dbStyle) && uiStyle.value !== dbStyle) {
      uiStyle.value = dbStyle;
      if (!import.meta.env.SSR) localStorage.setItem('reppy_ui_style', dbStyle);
    }
  });

  const setUiStyle = async (style) => {
    if (!UI_STYLES.includes(style)) return;
    uiStyle.value = style;
    if (!import.meta.env.SSR) localStorage.setItem('reppy_ui_style', style);
    if (authStore.isAuthenticated) {
      try {
        await axios.patch('/api/users/profile', { ui_style: style });
        if (authStore.user) authStore.user.ui_style = style;
      } catch (error) {
        console.error('Failed to sync ui_style to DB:', error);
      }
    }
  };

  // Sync with DB if user theme changes (e.g., on login)
  watch(() => authStore.user?.theme, (newDbTheme) => {
    if (newDbTheme && theme.value !== newDbTheme) {
      theme.value = newDbTheme;
      applyTheme(newDbTheme);
    }
  });

  const applyTheme = (newTheme) => {
    if (!import.meta.env.SSR) {
      const root = document.documentElement;
      
      // CORE LOGIC: If not authenticated, force dark mode regardless of preference.
      // Only logged-in users who explicitly set light mode can have it.
      const effectiveTheme = authStore.isAuthenticated ? newTheme : 'dark';
      
      const isDark = effectiveTheme === 'dark' || 
        (effectiveTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      localStorage.setItem('reppy_theme', effectiveTheme);
    }
  };

  // Initialize
  const init = () => {
    if (!import.meta.env.SSR) {
      // Force dark mode initialization if not logged in
      applyTheme(theme.value);
      
      // Listen for system changes if in system mode
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (theme.value === 'system') applyTheme('system');
      });
    }
  };

  const setTheme = async (newTheme) => {
    // Only allow setting theme if authenticated, otherwise keep it dark
    if (!authStore.isAuthenticated && newTheme !== 'dark') {
      console.warn('[Theme] Light mode is restricted to logged-in users.');
      return;
    }

    theme.value = newTheme;
    applyTheme(newTheme);

    // Persist to DB if logged in
    if (authStore.isAuthenticated) {
      try {
        await axios.patch('/api/users/profile', { theme: newTheme });
      } catch (error) {
        console.error('Failed to sync theme to DB:', error);
      }
    }
  };

  return {
    theme,
    setTheme,
    uiStyle,
    setUiStyle,
    init
  };
});


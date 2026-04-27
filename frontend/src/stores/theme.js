import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useAuthStore } from './auth';
import axios from 'axios';

export const useThemeStore = defineStore('theme', () => {
  const authStore = useAuthStore();
  // Default to 'dark' if no preference is found
  const theme = ref((!import.meta.env.SSR && localStorage.getItem('reppy_theme')) || 'dark');

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
    init
  };
});


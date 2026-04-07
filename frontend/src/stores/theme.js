import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useAuthStore } from './auth';
import axios from 'axios';

export const useThemeStore = defineStore('theme', () => {
  const authStore = useAuthStore();
  const theme = ref(localStorage.getItem('reppy_theme') || 'light');

  // Sync with DB if user theme changes (e.g., on login)
  watch(() => authStore.user?.theme, (newDbTheme) => {
    if (newDbTheme && theme.value !== newDbTheme) {
      theme.value = newDbTheme;
      applyTheme(newDbTheme);
    }
  });

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    const isDark = newTheme === 'dark' || 
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('reppy_theme', newTheme);
  };

  // Initialize
  const init = () => {
    applyTheme(theme.value);
    
    // Listen for system changes if in system mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') applyTheme('system');
    });
  };

  const setTheme = async (newTheme) => {
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

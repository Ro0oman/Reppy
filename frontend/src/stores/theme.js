import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('reppy_theme') || 'light');

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

  const setTheme = (newTheme) => {
    theme.value = newTheme;
    applyTheme(newTheme);
  };

  return {
    theme,
    setTheme,
    init
  };
});

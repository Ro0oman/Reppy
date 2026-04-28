import { defineStore } from 'pinia';

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    locale: '',
    messages: {
      en: null,
      es: null
    },
    isLoaded: false
  }),
  actions: {
    async init() {
      // 1. Automatic Detection Logic (Shadow mode)
      if (!import.meta.env.SSR) {
        const browserLang = navigator.language.split('-')[0];
        const detected = browserLang === 'es' ? 'es' : 'en';
        
        // If we have a stored locale that differs from browser, 
        // we might want to stick to it, BUT since we removed the toggle,
        // it's better to follow the browser "in the shadow".
        this.locale = detected;
      } else {
        this.locale = 'es'; // Default for SSG
      }

      // 2. Initial Load
      await this.loadLocale(this.locale);
      this.isLoaded = true;
    },

    async loadLocale(lang) {
      if (this.messages[lang]) return;

      try {
        const module = await import(`../locales/${lang}.js`);
        this.messages[lang] = module.default;
      } catch (error) {
        console.error(`Failed to load locale: ${lang}`, error);
        // Fallback to English if ES fails
        if (lang === 'es') await this.loadLocale('en');
      }
    },

    async setLocale(newLocale) {
      await this.loadLocale(newLocale);
      this.locale = newLocale;
      if (!import.meta.env.SSR) {
        localStorage.setItem('locale', newLocale);
        
        // Update HTML lang attribute
        document.documentElement.setAttribute('lang', newLocale);
      }
    },

    t(key, params = {}) {
      if (!this.messages[this.locale]) return key;
      
      let text = this.messages[this.locale][key] || key;
      
      // Basic parameter replacement if needed (e.g. {name})
      Object.keys(params).forEach(p => {
        text = text.replace(new RegExp(`{${p}}`, 'g'), params[p]);
      });
      
      return text;
    }
  }
});

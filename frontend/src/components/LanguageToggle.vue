<template>
  <div class="flex items-center gap-1 bg-surface/5 p-1 rounded-xl border border-border/40 backdrop-blur-md">
    <button 
      v-for="lang in langs" 
      :key="lang.id"
      @click="changeLanguage(lang.id)"
      class="px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest"
      :class="i18n.locale === lang.id 
        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
        : 'text-muted hover:text-foreground hover:bg-white/5'"
    >
      {{ lang.label }}
    </button>
  </div>
</template>

<script setup>
import { useI18nStore } from '../stores/i18n';
import { useRouter, useRoute } from 'vue-router';

const i18n = useI18nStore();
const router = useRouter();
const route = useRoute();

const langs = [
  { id: 'en', label: 'EN' },
  { id: 'es', label: 'ES' }
];

const changeLanguage = (langId) => {
  i18n.setLocale(langId);
  // Redirigir a la misma ruta pero con el nuevo idioma
  router.push({ 
    name: route.name, 
    params: { ...route.params, lang: langId } 
  });
};
</script>

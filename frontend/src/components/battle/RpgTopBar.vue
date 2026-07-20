<template>
  <div class="flex items-center justify-between gap-2">
    <!-- Logo → back to camp -->
    <router-link :to="{ name: 'dashboard', params: { lang: i18n.locale } }"
      class="flex items-center gap-2 group shrink-0" :title="i18n.t('nav_camp')">
      <span class="os-topbar-logo w-9 h-9 flex items-center justify-center group-active:scale-95 transition-transform">
        <Swords class="w-5 h-5" />
      </span>
      <span class="os-topbar-wordmark hidden xs:block">
        REPPY
      </span>
    </router-link>

    <!-- Coins + Gems: telemetría de economía -->
    <div class="flex items-center gap-2">
      <button @click="$emit('coins')"
        class="os-topbar-currency flex items-center gap-1.5 backdrop-blur-sm transition-all active:scale-95">
        <Coins class="w-4 h-4 text-amber-400" />
        <span class="os-num">{{ formatNum(authStore.user?.reppy_coins || 0) }} RC</span>
      </button>
      <button @click="$emit('coins')"
        class="os-topbar-currency flex items-center gap-1.5 backdrop-blur-sm transition-all active:scale-95">
        <Gem class="w-4 h-4" style="color: var(--os-cyan)" />
        <span class="os-num">{{ formatNum(authStore.user?.reppy_gems || 0) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { Swords, Coins, Gem } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';

defineEmits(['coins']);
const authStore = useAuthStore();
const i18n = useI18nStore();

const formatNum = (n) => new Intl.NumberFormat('en-US').format(n);
</script>

<style scoped>
.os-topbar-logo {
  border-radius: 2px;
  background: var(--os-blue);
  color: #fff;
  box-shadow: 0 6px 18px rgba(22, 79, 199, 0.4);
}
.os-topbar-wordmark {
  font: 800 1.25rem var(--os-font-display);
  letter-spacing: 3px;
  color: var(--os-text);
}
.os-topbar-currency {
  border: 1px solid var(--os-line);
  border-radius: 2px;
  background: rgba(8, 13, 21, 0.8);
  padding: 6px 10px;
  font: 500 11px var(--os-font-mono);
  letter-spacing: 0.8px;
  color: var(--os-text);
}
.os-topbar-currency:hover { border-color: var(--os-line-strong); }
</style>

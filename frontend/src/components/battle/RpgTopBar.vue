<template>
  <div class="flex items-center justify-between gap-2">
    <!-- Logo → back to camp -->
    <router-link :to="{ name: 'dashboard', params: { lang: i18n.locale } }"
      class="flex items-center gap-2 group shrink-0" :title="i18n.t('nav_camp')">
      <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-primary-500/30 group-active:scale-95 transition-transform">
        <Swords class="w-5 h-5" />
      </span>
      <span class="text-lg font-black tracking-tight text-white font-industrial hidden xs:block">
        REPPY
      </span>
    </router-link>

    <!-- Coins + Gems -->
    <div class="flex items-center gap-2">
      <button @click="$emit('coins')"
        class="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 backdrop-blur-sm transition-all active:scale-95">
        <Coins class="w-4 h-4 text-amber-400" />
        <span class="text-sm font-bold tabular-nums text-amber-100">{{ formatNum(authStore.user?.reppy_coins || 0) }}</span>
      </button>
      <button @click="$emit('coins')"
        class="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 backdrop-blur-sm transition-all active:scale-95">
        <Gem class="w-4 h-4 text-cyan-300" />
        <span class="text-sm font-bold tabular-nums text-cyan-100">{{ formatNum(authStore.user?.reppy_gems || 0) }}</span>
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

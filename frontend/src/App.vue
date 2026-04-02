<template>
  <div class="min-h-screen selection:bg-primary-500/30 relative text-zinc-900 dark:text-zinc-800 dark:text-zinc-100">
    
    <!-- Easter Background Overlay -->
    <EasterBackground />

    <!-- Animated background -->
    <div class="bg-glow relative z-0">
      <div class="blob top-[-10%] left-[-10%]"></div>
      <div class="blob bottom-[-10%] right-[-10%] animation-delay-2000" style="animation-duration: 25s; opacity: 0.5;">
      </div>
    </div>

    <nav v-if="authStore.isAuthenticated"
      class="border-b border-zinc-200 dark:border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-white/20 dark:bg-black/20 backdrop-blur-xl sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold italic text-zinc-900 dark:text-white">R
          </div>
          <span class="text-xl font-bold tracking-tight">Reppy</span>
        </div>
        <div class="flex items-center gap-6">
          <button @click="view = 'landing'" class="text-sm font-medium transition-colors"
            :class="view === 'landing' ? 'text-primary-600 dark:text-white' : 'text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-900 dark:text-white'">
            {{ i18n.t('nav_home') }}
          </button>
          <button @click="view = 'dashboard'" class="text-sm font-medium transition-colors"
            :class="view === 'dashboard' ? 'text-primary-600 dark:text-white' : 'text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-900 dark:text-white'">
            {{ i18n.t('nav_dashboard') }}
          </button>
          <button @click="view = 'social'" class="text-sm font-medium transition-colors"
            :class="view === 'social' ? 'text-primary-600 dark:text-white' : 'text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-900 dark:text-white'">
            {{ i18n.t('nav_social') }}
          </button>
          <button @click="view = 'shop'" class="text-sm font-medium transition-colors"
            :class="view === 'shop' ? 'text-amber-600 dark:text-amber-500 drop-shadow-md dark:drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'text-amber-600/70 dark:text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500'">
            Taberna (Tienda)
          </button>
        </div>
      </div>
    </nav>

    <main class="py-12">
      <template v-if="authStore.isAuthenticated">
        <Dashboard v-if="view === 'dashboard'" />
        <Social v-if="view === 'social'" />
        <Shop v-if="view === 'shop'" />
        <Landing v-if="view === 'landing'" @start="view = 'dashboard'" />
      </template>
      <template v-else>
        <Landing v-if="!showLogin" @start="showLogin = true" />
        <Login v-else @back="showLogin = false" />
      </template>
    </main>

    <footer class="mt-auto py-8 border-t border-zinc-900">
      <div class="max-w-6xl mx-auto px-4 text-center text-zinc-600 text-sm">
        &copy; 2026 Reppy - Modern Pull-up Tracking
      </div>
    </footer>

    <!-- Global Components -->
    <NotificationToast />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from './stores/auth';
import Login from './components/Login.vue'
import Landing from './components/Landing.vue'
import Dashboard from './components/Dashboard.vue'
import Social from './components/Social.vue'
import Shop from './components/Shop.vue'
import EasterBackground from './components/EasterBackground.vue'
import NotificationToast from './components/NotificationToast.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { useI18nStore } from './stores/i18n';

const authStore = useAuthStore();
const i18n = useI18nStore();
const view = ref(localStorage.getItem('reppy_view') || 'dashboard');
const showLogin = ref(false);

watch(view, (newView) => {
  localStorage.setItem('reppy_view', newView);
});

onMounted(() => {
});
</script>

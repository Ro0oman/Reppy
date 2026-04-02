<template>
  <div class="min-h-screen bg-[#030303] text-zinc-100 selection:bg-primary-500/30 relative">
    
    <!-- Easter Background Overlay -->
    <EasterBackground />

    <!-- Animated background -->
    <div class="bg-glow relative z-0">
      <div class="blob top-[-10%] left-[-10%]"></div>
      <div class="blob bottom-[-10%] right-[-10%] animation-delay-2000" style="animation-duration: 25s; opacity: 0.5;">
      </div>
    </div>

    <nav v-if="authStore.isAuthenticated"
      class="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold italic text-white">R
          </div>
          <span class="text-xl font-bold tracking-tight">Reppy</span>
        </div>
        <div class="flex items-center gap-6">
          <button @click="view = 'landing'" class="text-sm font-medium transition-colors"
            :class="view === 'landing' ? 'text-white' : 'text-zinc-400 hover:text-white'">
            {{ i18n.t('nav_home') }}
          </button>
          <button @click="view = 'dashboard'" class="text-sm font-medium transition-colors"
            :class="view === 'dashboard' ? 'text-white' : 'text-zinc-400 hover:text-white'">
            {{ i18n.t('nav_dashboard') }}
          </button>
          <button @click="view = 'social'" class="text-sm font-medium transition-colors"
            :class="view === 'social' ? 'text-white' : 'text-zinc-400 hover:text-white'">
            {{ i18n.t('nav_social') }}
          </button>
          <button @click="view = 'shop'" class="text-sm font-medium transition-colors"
            :class="view === 'shop' ? 'text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'text-zinc-400 hover:text-amber-500/80'">
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

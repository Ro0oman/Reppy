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
      class="border-b border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-xl sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold italic text-white">R
          </div>
          <span class="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Reppy</span>
        </div>
        
        <div class="hidden md:flex flex-1 items-center justify-center gap-6">
          <button @click="view = 'landing'" class="text-base font-bold transition-colors"
            :class="view === 'landing' ? 'text-primary-600 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'">
            {{ i18n.t('nav_home') }}
          </button>
          <button @click="view = 'dashboard'" class="text-base font-bold transition-colors"
            :class="view === 'dashboard' ? 'text-primary-600 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'">
            {{ i18n.t('nav_dashboard') }}
          </button>
          <button @click="view = 'social'" class="text-base font-bold transition-colors"
            :class="view === 'social' ? 'text-primary-600 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'">
            {{ i18n.t('nav_social') }}
          </button>
          <button @click="view = 'inventory'" class="text-base font-bold transition-colors"
            :class="view === 'inventory' ? 'text-primary-600 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'">
            {{ i18n.t('nav_inventory') }}
          </button>
          <button @click="view = 'shop'" class="text-base font-bold transition-colors"

            :class="view === 'shop' ? 'text-amber-600 dark:text-amber-500 drop-shadow-md' : 'text-amber-600/70 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500'">
            David Goggins Shop
          </button>
        </div>

        <!-- User Menu -->
        <div class="flex items-center gap-4">
          <!-- GitHub Star Button -->
          <a href="https://github.com/Ro0oman/Reppy" target="_blank"
            class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 dark:bg-white/10 hover:bg-zinc-800 dark:hover:bg-white/20 border border-white/10 transition-all group scale-95 hover:scale-100">
            <Github class="w-4 h-4 text-white" />
            <div class="flex items-center gap-1">
              <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:animate-pulse" />
              <span class="text-xs font-bold text-white uppercase tracking-wider">Star</span>
            </div>
          </a>

          <button @click="openProfile(authStore.user.id)" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-bold text-zinc-900 dark:text-white leading-none">{{ authStore.user?.name }}</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{{ authStore.user?.reppy_coins || 0 }} 🪙</p>
            </div>
            <img :src="authStore.user?.avatar_url" class="w-10 h-10 rounded-full border border-primary-500/50 shadow-sm" />
          </button>
        </div>
      </div>
    </nav>

    <main class="py-12">
      <template v-if="authStore.isAuthenticated">
        <Dashboard v-if="view === 'dashboard'" @viewProfile="openProfile" />
        <Social v-if="view === 'social'" />
        <Shop v-if="view === 'shop'" />
        <Inventory v-if="view === 'inventory'" />
        <Profile v-if="view === 'profile'" :userId="currentProfileId" />

        <Landing v-if="view === 'landing'" @start="view = 'dashboard'" />
      </template>
      <template v-else>
        <Landing v-if="!showLogin" @start="showLogin = true" />
        <Login v-else @back="showLogin = false" />
      </template>
    </main>

    <footer class="mt-auto py-8 pb-32 md:pb-8 border-t border-zinc-200 dark:border-white/5">
      <div class="max-w-6xl mx-auto px-4 text-center text-zinc-600 text-sm">
        &copy; 2026 Reppy - Modern Pull-up Tracking
      </div>
    </footer>

    <!-- Mobile Bottom Navigation -->
    <nav v-if="authStore.isAuthenticated" 
      class="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-t border-zinc-200 dark:border-white/5 pb-safe-area">
      <div class="flex items-center justify-around h-20 px-2">
        <button @click="view = 'landing'" class="flex flex-col items-center gap-1.5 transition-all active:scale-90"
          :class="view === 'landing' ? 'text-primary-600' : 'text-zinc-400'">
          <Home class="w-6 h-6" :class="view === 'landing' ? 'fill-primary-600/10' : ''" />
          <span class="text-[10px] font-black uppercase tracking-tighter">Inicio</span>
        </button>
        <button @click="view = 'dashboard'" class="flex flex-col items-center gap-1.5 transition-all active:scale-90"
          :class="view === 'dashboard' ? 'text-primary-600' : 'text-zinc-400'">
          <LayoutDashboard class="w-6 h-6" :class="view === 'dashboard' ? 'fill-primary-600/10' : ''" />
          <span class="text-[10px] font-black uppercase tracking-tighter">Panel</span>
        </button>
        <button @click="view = 'social'" class="flex flex-col items-center gap-1.5 transition-all active:scale-90"
          :class="view === 'social' ? 'text-primary-600' : 'text-zinc-400'">
          <Users class="w-6 h-6" :class="view === 'social' ? 'fill-primary-600/10' : ''" />
          <span class="text-[10px] font-black uppercase tracking-tighter">Social</span>
        </button>
        <button @click="view = 'shop'" class="flex flex-col items-center gap-1.5 transition-all active:scale-90"
          :class="view === 'shop' ? 'text-amber-500' : 'text-zinc-400'">
          <ShoppingBag class="w-6 h-6" :class="view === 'shop' ? 'fill-amber-500/10' : ''" />
          <span class="text-[10px] font-black uppercase tracking-tighter">Tienda</span>
        </button>
        <button @click="view = 'inventory'" class="flex flex-col items-center gap-1.5 transition-all active:scale-90"
          :class="view === 'inventory' ? 'text-primary-600' : 'text-zinc-400'">
          <Package class="w-6 h-6" :class="view === 'inventory' ? 'fill-primary-600/10' : ''" />
          <span class="text-[10px] font-black uppercase tracking-tighter">Equipo</span>
        </button>
        <button @click="view = 'profile'" class="flex flex-col items-center gap-1.5 transition-all active:scale-90"

          :class="view === 'profile' ? 'text-primary-600' : 'text-zinc-400'">
          <img :src="authStore.user?.avatar_url" 
               class="w-7 h-7 rounded-full border-2 transition-transform" 
               :class="view === 'profile' ? 'border-primary-500 scale-110' : 'border-transparent opacity-60'" />
          <span class="text-[10px] font-black uppercase tracking-tighter">Perfil</span>
        </button>
      </div>
    </nav>

    <!-- Global Components -->
    <NotificationToast />
    <ConfirmDialog />
    <EasterWelcomeModal :show="showEasterModal" @close="showEasterModal = false" />
    <LuckyWheel :show="showRoulette" @close="showRoulette = false" @spun="onSpun" />
    
    <!-- Floating Roulette Button -->
    <button v-if="canSpinToday" @click="showRoulette = true" 
      class="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[70] bg-gradient-to-tr from-primary-600 to-indigo-600 p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group border-4 border-white dark:border-zinc-800">
      <RefreshCw class="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-700" />

      <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping"></div>
    </button>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

import { Github, Star, Home, LayoutDashboard, Users, ShoppingBag, Package, RefreshCw } from 'lucide-vue-next';
import { useAuthStore } from './stores/auth';

import Login from './components/Login.vue'
import Landing from './components/Landing.vue'
import Dashboard from './components/Dashboard.vue'
import Social from './components/Social.vue'
import Shop from './components/Shop.vue'
import Profile from './components/Profile.vue'
import Inventory from './components/Inventory.vue'
import LuckyWheel from './components/LuckyWheel.vue'
import EasterBackground from './components/EasterBackground.vue'

import EasterWelcomeModal from './components/EasterWelcomeModal.vue'
import NotificationToast from './components/NotificationToast.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { useI18nStore } from './stores/i18n';

const authStore = useAuthStore();
const i18n = useI18nStore();
const view = ref(localStorage.getItem('reppy_view') || 'dashboard');
const showLogin = ref(false);
const currentProfileId = ref(null);
const showEasterModal = ref(false);
const showRoulette = ref(false);
const canSpinToday = ref(false);

const checkRoulette = async () => {
  try {
    const res = await axios.get('/api/roulette/status');
    canSpinToday.value = res.data.canSpin;
  } catch (e) {}
};

const onSpun = () => {
  canSpinToday.value = false;
  showRoulette.value = false;
};

const openProfile = (id) => {

  currentProfileId.value = id;
  view.value = 'profile';
};

watch(view, (newView) => {
  localStorage.setItem('reppy_view', newView);
});

watch(() => authStore.isAuthenticated, (val) => {
  if (val && authStore.user && !authStore.user.has_seen_easter_modal) {
    showEasterModal.value = true;
  }
}, { immediate: true });

onMounted(async () => {
  if (authStore.isAuthenticated) {
    checkRoulette();
    if (authStore.user && !authStore.user.has_seen_easter_modal) {
      showEasterModal.value = true;
    }
  }
});

</script>

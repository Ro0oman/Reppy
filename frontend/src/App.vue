<template>
  <div class="min-h-screen selection:bg-primary-500/30 relative text-zinc-900 dark:text-zinc-800 dark:text-zinc-100">
    
    <!-- Easter Background Overlay -->
    <!-- Animated background system -->
    <!-- Animated background system -->
    <BackgroundEffect v-if="authStore.isAuthenticated" :background-css="authStore.user?.background_css" />

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
            {{ i18n.t('nav_shop') }}
          </button>
          <button v-if="authStore.user?.is_admin" @click="view = 'admin'" class="text-base font-bold transition-colors text-indigo-500 hover:text-indigo-400"
            :class="view === 'admin' ? 'underline decoration-2 underline-offset-8' : ''">
            Admin
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

          <div class="flex items-center gap-1.5">
            <button @click.stop="showCoinsInfo = true" class="p-1 hover:bg-amber-500/10 rounded-full transition-colors group" title="¿Cómo funcionan?">
              <HelpCircle class="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-500 transition-colors" />
            </button>
            <button @click="openProfile(authStore.user.id)" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <!-- Global Coins Badge -->
              <div class="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 shadow-sm">
                 <span class="text-xs font-black text-amber-600 dark:text-amber-500 tracking-tighter">{{ authStore.user?.reppy_coins || 0 }}</span>
                 <span class="text-[10px]">🪙</span>
              </div>
            <!-- Name (Desktop only) -->
            <div class="text-right hidden md:flex flex-col items-end">
              <p class="text-sm font-bold text-zinc-900 dark:text-white leading-none">{{ authStore.user?.name }}</p>
              <span v-if="authStore.user?.title_name" class="text-[8px] uppercase tracking-widest px-1.5 py-0.5 mt-1 rounded-full bg-white/5 border border-zinc-200 dark:border-white/10 font-bold" :class="authStore.user?.title_css">
                {{ authStore.user?.title_name }}
              </span>
            </div>
            <AvatarFrame :src="authStore.user?.avatar_url" :border-css="authStore.user?.border_css" :avatar-css="authStore.user?.avatar_css" :size="36" />
          </button>
          </div>
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
        <AdminPanel v-if="view === 'admin'" />

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
          <span class="text-[10px] font-black uppercase tracking-tighter">{{ i18n.t('tf_shop') || 'Tienda' }}</span>

        </button>
        <button @click="view = 'inventory'" class="flex flex-col items-center gap-1.5 transition-all active:scale-90"
          :class="view === 'inventory' ? 'text-primary-600' : 'text-zinc-400'">
          <Package class="w-6 h-6" :class="view === 'inventory' ? 'fill-primary-600/10' : ''" />
          <span class="text-[10px] font-black uppercase tracking-tighter">Equipo</span>
        </button>
        <button @click="view = 'profile'" class="flex flex-col items-center gap-1.5 transition-all active:scale-90"

          :class="view === 'profile' ? 'text-primary-600' : 'text-zinc-400'">
          <AvatarFrame :src="authStore.user?.avatar_url" :border-css="view === 'profile' ? authStore.user?.border_css : ''" :avatar-css="view === 'profile' ? authStore.user?.avatar_css : ''" :size="28" 
               class="transition-transform" :class="view === 'profile' ? 'scale-110' : 'opacity-60'" />
          <span class="text-[10px] font-black uppercase tracking-tighter">Perfil</span>
        </button>
      </div>
    </nav>

    <!-- Global Components -->
    <NotificationToast />
    <ConfirmDialog />
    <EasterWelcomeModal :show="showEasterModal" @close="showEasterModal = false" />
    <LuckyWheel :show="showRoulette" @close="showRoulette = false" @spun="onSpun" />

    <!-- Coins Info Modal -->
    <Teleport to="body">
      <div v-if="showCoinsInfo" 
           class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300"
           @click.self="showCoinsInfo = false">
        <div class="glass max-w-lg w-full p-6 md:p-8 rounded-[2rem] border-white/10 shadow-2xl space-y-6 relative overflow-hidden max-h-[85vh] overflow-y-auto">
          <div class="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-black text-white tracking-tighter uppercase">🪙 Reppy Coins</h3>
              <p class="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mt-1">Guía de Economía</p>
            </div>
            <button @click="showCoinsInfo = false" class="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90">
              <X class="w-5 h-5 text-white" />
            </button>
          </div>

          <!-- How to earn -->
          <div class="space-y-3">
            <h4 class="text-xs font-black uppercase text-amber-500 tracking-widest">💪 Cómo ganar monedas</h4>
            <div class="space-y-2">
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span class="text-sm text-zinc-300">Dominadas</span>
                <span class="text-sm font-black text-amber-400">1 coin/rep</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span class="text-sm text-zinc-300">Flexiones</span>
                <span class="text-sm font-black text-amber-400">1 coin/rep</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span class="text-sm text-zinc-300">Fondos (Dips)</span>
                <span class="text-sm font-black text-amber-400">2 coins/rep</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span class="text-sm text-zinc-300">Dominadas Lastradas</span>
                <span class="text-sm font-black text-amber-400">3 coins/rep</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl border border-orange-500/20">
                <span class="text-sm text-zinc-200 font-bold">Muscle Ups</span>
                <span class="text-sm font-black text-orange-400">5 coins/rep ⚡</span>
              </div>
            </div>
          </div>

          <!-- Bonus -->
          <div class="space-y-3">
            <h4 class="text-xs font-black uppercase text-emerald-500 tracking-widest">🎰 Bonus extra</h4>
            <div class="space-y-2">
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span class="text-sm text-zinc-300">Ruleta diaria</span>
                <span class="text-sm font-bold text-emerald-400">10–100 coins</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span class="text-sm text-zinc-300">Eventos de Boss</span>
                <span class="text-sm font-bold text-red-400">Items exclusivos</span>
              </div>
            </div>
          </div>

          <!-- What to spend on -->
          <div class="space-y-3">
            <h4 class="text-xs font-black uppercase text-purple-500 tracking-widest">🛒 En qué gastarlos</h4>
            <div class="grid grid-cols-2 gap-2">
              <div class="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                <p class="text-lg mb-1">🧥</p>
                <p class="text-[10px] font-black text-zinc-300 uppercase tracking-wider">Bordes de Avatar</p>
                <p class="text-[9px] text-zinc-500 mt-0.5">80 – 1500 coins</p>
              </div>
              <div class="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                <p class="text-lg mb-1">⚔️</p>
                <p class="text-[10px] font-black text-zinc-300 uppercase tracking-wider">Títulos</p>
                <p class="text-[9px] text-zinc-500 mt-0.5">100 – 1500 coins</p>
              </div>
            </div>
          </div>

          <!-- Tip -->
          <div class="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
            <p class="text-[11px] text-center text-amber-300 font-bold">💡 Un usuario activo (~40 reps/día) gana unas <span class="text-amber-400 font-black">~1200 coins/mes</span></p>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Floating Roulette Button -->
    <div v-if="canSpinToday" 
         class="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[70] flex flex-col items-end gap-3 group">
      <!-- Interactive Tooltip -->
      <div class="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg animate-bounce border-2 border-white/20 whitespace-nowrap">
        ¡Gira la ruleta! 🎰
      </div>
      
      <button @click="showRoulette = true" 
        class="relative bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-600 p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(245,158,11,0.4)] hover:shadow-[0_20px_60px_rgba(245,158,11,0.6)] hover:scale-110 active:scale-95 transition-all duration-500 border-4 border-white/30 dark:border-zinc-800/50 overflow-hidden">
        
        <!-- Magic shine animation -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
        
        <Star class="w-8 h-8 text-white drop-shadow-md animate-spin-slow" />
        
        <!-- Notification dot -->
        <div class="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping"></div>
        <div class="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

import { Github, Star, Home, LayoutDashboard, Users, ShoppingBag, Package, RefreshCw, HelpCircle, X } from 'lucide-vue-next';
import { useAuthStore } from './stores/auth';

import Login from './components/Login.vue'
import Landing from './components/Landing.vue'
import Dashboard from './components/Dashboard.vue'
import Social from './components/Social.vue'
import Shop from './components/Shop.vue'
import Profile from './components/Profile.vue'
import Inventory from './components/Inventory.vue'
import AdminPanel from './components/AdminPanel.vue'
import LuckyWheel from './components/LuckyWheel.vue'
import AvatarFrame from './components/AvatarFrame.vue'
import BackgroundEffect from './components/BackgroundEffect.vue'

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
const showCoinsInfo = ref(false);

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

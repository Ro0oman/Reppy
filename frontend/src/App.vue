<template>
  <div class="min-h-screen selection:bg-primary-500/30 relative text-white bg-deep-abyss">
    
    <!-- Animated background system -->
    <BackgroundEffect v-if="authStore.isAuthenticated" :background-css="authStore.user?.background_css" />

    <!-- Industrial Navigation Bar -->
    <nav v-if="authStore.isAuthenticated"
      class="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <!-- Logo Core -->
        <div class="flex items-center gap-4 group cursor-pointer" @click="view = 'dashboard'">
          <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center font-black italic text-white shadow-[0_0_20px_rgba(255,69,0,0.3)] transform group-hover:scale-110 transition-transform font-industrial">R</div>
          <span class="text-2xl font-black tracking-tighter text-white font-industrial uppercase italic">REPPY<span class="text-primary-500">.</span></span>
        </div>
        
        <!-- Desktop Navigation (Industrial Links) -->
        <div class="hidden lg:flex items-center gap-2">
          <button v-for="nav in navLinks" :key="nav.id"
            @click="view = nav.id" 
            class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group"
            :class="view === nav.id ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-white'">
            <div v-if="view === nav.id" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"></div>
            {{ i18n.t(nav.label) || nav.fallback }}
            
            <!-- Red Notification Dot for Inventory (Chests) -->
            <div v-if="nav.id === 'inventory' && authStore.user?.boss_chests > 0" 
              class="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full animate-ping"></div>
          </button>
          
          <button v-if="authStore.user?.is_admin" @click="view = 'admin'" 
            class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:bg-indigo-500/10 transition-all">
            ADMIN.CMD
          </button>
        </div>

        <!-- System Status & User Profile -->
        <div class="flex items-center gap-6">
          <!-- Desktop GitHub Module -->
          <a href="https://github.com/Ro0oman/Reppy" target="_blank"
            class="hidden xl:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
            <Github class="w-4 h-4 text-zinc-500 group-hover:text-white" />
            <div class="flex items-center gap-2">
              <Star class="w-3.5 h-3.5 text-primary-500 fill-primary-500 animate-pulse" />
              <span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">SOURCE</span>
            </div>
          </a>

          <div class="flex items-center gap-4">
            <!-- Currency Module -->
            <div @click="showCoinsInfo = true" class="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-primary-500/30 cursor-pointer transition-all group">
               <Zap class="w-3.5 h-3.5 text-primary-500 group-hover:scale-125 transition-transform" />
               <span class="text-sm font-black text-precision text-white">{{ authStore.user?.reppy_coins || 0 }}</span>
            </div>

            <!-- Profile Entry -->
            <button @click="openProfile(authStore.user.id)" class="flex items-center gap-4 hover:opacity-80 transition-all p-1 rounded-2xl">
              <div class="text-right hidden md:flex flex-col items-end">
                <p class="text-[10px] font-black text-white uppercase tracking-widest leading-none">{{ authStore.user?.name }}</p>
                <span v-if="authStore.user?.title_name" class="text-[7px] uppercase tracking-[0.3em] font-black text-primary-500 mt-1">
                  {{ authStore.user?.title_name }}
                </span>
              </div>
              <AvatarFrame :src="authStore.user?.avatar_url" :border-css="authStore.user?.border_css" :avatar-css="authStore.user?.avatar_css" :size="44" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Operational View -->
    <main class="py-12 md:py-20">
      <template v-if="authStore.isAuthenticated">
        <div class="animate-in">
          <Dashboard v-if="view === 'dashboard'" @viewProfile="openProfile" />
          <Social v-if="view === 'social'" />
          <Shop v-if="view === 'shop'" />
          <Inventory v-if="view === 'inventory'" />
          <Profile v-if="view === 'profile'" :userId="currentProfileId" />
          <AdminPanel v-if="view === 'admin'" />
          <Landing v-if="view === 'landing'" @start="view = 'dashboard'" />
        </div>
      </template>
      <template v-else>
        <Landing v-if="!showLogin" @start="showLogin = true" />
        <Login v-else @back="showLogin = false" />
      </template>
    </main>

    <footer class="mt-auto py-16 pb-40 md:pb-16 border-t border-white/5">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-8 text-zinc-700">
        <span class="text-[9px] font-black uppercase tracking-[0.6em]">REPPY CORE © 2026</span>
        <div class="hidden md:block w-1.5 h-1.5 bg-zinc-900 rounded-full"></div>
        <span class="text-[9px] font-black uppercase tracking-[0.6em]">DEEP ABYSS DEPLOYED</span>
      </div>
    </footer>

    <!-- Mobile Bottom Operational Dock -->
    <nav v-if="authStore.isAuthenticated" 
      class="lg:hidden fixed bottom-6 left-4 right-4 z-[60] bg-steel-grey/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl p-2 transition-transform duration-500">
      <div class="flex items-center justify-around h-16">
        <button v-for="nav in mobileNavLinks" :key="nav.id"
          @click="view = nav.id" 
          class="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-75"
          :class="view === nav.id ? 'text-primary-500' : 'text-zinc-600'">
          <component :is="nav.icon" class="w-5 h-5" :class="view === nav.id ? 'fill-primary-500/10' : ''" />
          <span class="text-[8px] font-black uppercase tracking-widest font-tight">{{ nav.short || nav.id }}</span>
          
          <!-- Inventory Notification -->
          <div v-if="nav.id === 'inventory' && authStore.user?.boss_chests > 0" 
            class="absolute top-2 right-1/4 w-2 h-2 bg-primary-500 rounded-full border-2 border-deep-abyss animate-pulse"></div>
        </button>

        <!-- Mobile Profile -->
        <button @click="view = 'profile'" class="flex-1 flex flex-col items-center justify-center gap-1 active:scale-75 transition-all">
          <AvatarFrame :src="authStore.user?.avatar_url" :border-css="view === 'profile' ? authStore.user?.border_css : ''" :size="24" 
               class="transition-all" :class="view === 'profile' ? 'scale-110' : 'opacity-40 grayscale'" />
          <span class="text-[8px] font-black uppercase tracking-widest font-tight" :class="view === 'profile' ? 'text-primary-500' : 'text-zinc-600'">PROFILE</span>
        </button>
      </div>
    </nav>

    <!-- Global Interface Components -->
    <NotificationToast />
    <ConfirmDialog />
    <EasterWelcomeModal :show="showEasterModal" @close="showEasterModal = false" />
    <LuckyWheel :show="showRoulette" @close="showRoulette = false" @spun="onSpun" />

    <!-- Economy Codex Modal -->
    <Teleport to="body">
      <div v-if="showCoinsInfo" 
           class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-deep-abyss/90 backdrop-blur-md animate-in"
           @click.self="showCoinsInfo = false">
        <div class="card-stats max-w-xl w-full p-8 md:p-12 border-white/5 space-y-10 relative overflow-hidden overflow-y-auto max-h-[90vh]">
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <h3 class="text-3xl font-black text-industrial text-white uppercase italic tracking-tighter">ECONOMY<span class="text-primary-500">.</span>CODEX</h3>
              <p class="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Resource allocation protocol</p>
            </div>
            <button @click="showCoinsInfo = false" class="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
              <X class="w-6 h-6 text-white" />
            </button>
          </div>

          <!-- Generation Protocol -->
          <div class="space-y-6">
            <h4 class="text-[10px] font-black uppercase text-primary-500 tracking-[0.3em]">REVENUE GENERATION</h4>
            <div class="grid grid-cols-1 gap-3">
              <div v-for="earn in earnings" :key="earn.name" class="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5">
                <span class="text-xs font-black text-zinc-400 uppercase tracking-widest">{{ earn.name }}</span>
                <div class="flex items-baseline gap-2">
                   <span class="text-lg font-black text-precision text-white">{{ earn.amount }}</span>
                   <span class="text-[8px] font-black text-zinc-600 uppercase tracking-widest">RC / REP</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bonus Events -->
          <div class="space-y-6">
            <h4 class="text-[10px] font-black uppercase text-neon-lime tracking-[0.3em]">EXCEPTIONAL YIELD</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div class="p-5 bg-neon-lime/5 border border-neon-lime/10 rounded-2xl space-y-2">
                  <p class="text-[9px] font-black text-neon-lime uppercase tracking-widest">DAILY ROULETTE</p>
                  <p class="text-sm font-black text-white text-precision">10 – 100 RC</p>
               </div>
               <div class="p-5 bg-primary-500/5 border border-primary-500/10 rounded-2xl space-y-2">
                  <p class="text-[9px] font-black text-primary-500 uppercase tracking-widest">BOSS ANOMALIES</p>
                  <p class="text-sm font-black text-white text-precision">LEGENDARY DROPS</p>
               </div>
            </div>
          </div>

          <!-- Economic Projection -->
          <div class="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-6">
            <div class="p-3 bg-primary-500/10 rounded-2xl"><Zap class="w-6 h-6 text-primary-500" /></div>
            <div>
               <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">MONTHLY PROJECTION</p>
               <p class="text-sm font-black text-white font-tight">ACTIVE OPERATIVES YIELD <span class="text-primary-500 text-precision">~1200 RC</span></p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Floating Roulette Module -->
    <div v-if="canSpinToday" 
         class="fixed bottom-32 right-8 md:bottom-12 md:right-12 z-[70] flex flex-col items-end gap-5 group">
      <!-- Logic Tooltip -->
      <div class="bg-primary-500 text-white text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity border border-white/20">
        ROULETTE.EXE AVAILABLE
      </div>
      
      <button @click="showRoulette = true" 
        class="relative bg-steel-grey/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 border border-white/10 group overflow-hidden">
        
        <div class="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
        
        <Star class="w-8 h-8 text-white relative z-10 animate-spin-slow" />
        
        <!-- Urgent Alert Dot -->
        <div class="absolute top-4 right-4 w-3 h-3 bg-primary-500 rounded-full border-2 border-deep-abyss animate-ping shadow-[0_0_15px_rgba(255,69,0,0.5)]"></div>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import { Github, Star, Home, LayoutDashboard, Users, ShoppingBag, Package, RefreshCw, HelpCircle, X, Zap } from 'lucide-vue-next';
import { useAuthStore } from './stores/auth';
import { useI18nStore } from './stores/i18n';

// Components
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

const authStore = useAuthStore();
const i18n = useI18nStore();

const view = ref(localStorage.getItem('reppy_view') || 'dashboard');
const showLogin = ref(false);
const currentProfileId = ref(null);
const showEasterModal = ref(false);
const showRoulette = ref(false);
const canSpinToday = ref(false);
const showCoinsInfo = ref(false);

const navLinks = [
  { id: 'landing', label: 'nav_home', fallback: 'HOME' },
  { id: 'dashboard', label: 'nav_dashboard', fallback: 'DASHBOARD' },
  { id: 'social', label: 'nav_social', fallback: 'RANKINGS' },
  { id: 'inventory', label: 'nav_inventory', fallback: 'GEAR' },
  { id: 'shop', label: 'nav_shop', fallback: 'ARMORY' },
];

const mobileNavLinks = [
  { id: 'landing', icon: Home, short: 'CORE' },
  { id: 'dashboard', icon: LayoutDashboard, short: 'PANEL' },
  { id: 'social', icon: Users, short: 'REPS' },
  { id: 'shop', icon: ShoppingBag, short: 'ARMORY' },
  { id: 'inventory', icon: Package, short: 'GEAR' },
];

const earnings = [
  { name: 'Pullups (Standard)', amount: '1' },
  { name: 'Pushups (Standard)', amount: '1' },
  { name: 'Dips (Standard)', amount: '2' },
  { name: 'Weighted Pullups', amount: '3' },
  { name: 'Muscle Ups', amount: '5' },
];

const checkRoulette = async () => {
  try {
    const res = await axios.get('/api/roulette/status');
    canSpinToday.value = res.data.canSpin;
  } catch (e) {}
};

const onSpun = () => { canSpinToday.value = false; showRoulette.value = false; };

const openProfile = (id) => { currentProfileId.value = id; view.value = 'profile'; };

watch(view, (newView) => localStorage.setItem('reppy_view', newView));

watch(() => authStore.isAuthenticated, (val) => {
  if (val && authStore.user && !authStore.user.has_seen_easter_modal) showEasterModal.value = true;
}, { immediate: true });

onMounted(async () => {
  if (authStore.isAuthenticated) {
    checkRoulette();
    if (authStore.user && !authStore.user.has_seen_easter_modal) showEasterModal.value = true;
  }
});
</script>

<style scoped>
.font-industrial { font-family: 'Inter Tight', sans-serif; }
.font-tight { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-spin-slow { animation: spin 8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>

<template>
  <div class="min-h-screen selection:bg-primary-500/30 relative text-foreground bg-background transition-colors duration-500">
    
    <!-- Animated background system -->
    <BackgroundEffect v-if="authStore.isAuthenticated" :background-css="authStore.user?.background_css" />

    <!-- Industrial Navigation Bar -->
    <nav v-if="authStore.isAuthenticated"
      class="border-b border-border bg-surface/40 backdrop-blur-3xl sticky top-0 z-50 transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <!-- Logo Core -->
        <router-link to="/dashboard" class="flex items-center gap-4 group cursor-pointer outline-none" title="Dashboard / Inicio">
          <div class="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl shadow-primary-500/20 transition-transform group-hover:scale-110 group-focus:scale-110 group-focus:ring-2 group-focus:ring-primary-500/50">R</div>
          <span class="text-2xl font-bold tracking-tight text-foreground font-industrial">Reppy<span class="text-primary-500">.</span></span>
        </router-link>
        
        <!-- Desktop Navigation (Clean Links) -->
        <div class="hidden lg:flex items-center gap-1">
          <router-link v-for="nav in navLinks" :key="nav.id"
            :to="'/' + nav.id" 
            :title="i18n.t(nav.label) || nav.fallback"
            class="px-4 py-2 rounded-2xl text-[13px] font-semibold transition-all relative group flex items-center gap-2.5"
            :class="$route.name === nav.id ? 'text-foreground bg-primary-500/5' : 'text-muted hover:text-foreground hover:bg-surface/10'">
            <component :is="nav.icon" class="w-4 h-4" :class="$route.name === nav.id ? 'text-primary-500' : ''" />
            {{ i18n.t(nav.label) || nav.fallback }}
            
            <!-- Notification Dot -->
            <div v-if="nav.id === 'inventory' && authStore.user?.boss_chests > 0" 
              class="absolute top-1.5 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-surface"></div>
          </router-link>
          
          <router-link v-if="authStore.user?.is_admin" to="/admin" 
            class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:bg-indigo-500/10 transition-all">
            ADMIN.CMD
          </router-link>
        </div>

        <!-- System Status & User Profile -->
        <div class="flex items-center gap-6">
          <!-- Desktop GitHub Module -->
          <a href="https://github.com/Ro0oman/Reppy" target="_blank"
            title="GitHub Repository / Código Fuente"
            class="hidden xl:flex items-center gap-3 px-4 py-2 rounded-xl bg-surface/5 hover:bg-surface/10 border border-border transition-all group">
            <Github class="w-4 h-4 text-muted group-hover:text-foreground" />
            <div class="flex items-center gap-2">
              <Star class="w-3.5 h-3.5 text-primary-500 fill-primary-500 animate-pulse" />
              <span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">SOURCE</span>
            </div>
          </a>

          <div class="flex items-center gap-4">
            <!-- Currency Module -->
             <button @click="showCoinsInfo = true" 
                  :title="i18n.locale === 'es' ? 'Historial de Monedas' : 'Protocol Coins History'"
                  class="flex items-center gap-3 bg-surface/5 px-4 py-2 rounded-xl border border-border hover:border-primary-500/30 cursor-pointer transition-all group focus:outline-none focus:ring-2 focus:ring-primary-500/50">
               <Coins class="w-3.5 h-3.5 text-primary-500 transition-transform group-hover:scale-110" />
               <span class="text-sm font-black text-precision text-foreground">{{ authStore.user?.reppy_coins || 0 }}</span>
            </button>

            <!-- Level Module (Responsive) -->
            <div class="flex items-center gap-3">
              <!-- Compact for mobile, full for desktop -->
              <div class="sm:hidden flex items-center gap-1.5 bg-primary-500/10 px-2 py-1.5 rounded-lg border border-primary-500/20">
                <span class="text-[8px] font-black text-primary-500 uppercase tracking-widest">LVL</span>
                <span class="text-sm font-black text-foreground italic">{{ authStore.user?.current_level || 1 }}</span>
              </div>
              <div class="hidden sm:block">
                <LevelBar 
                  :level="authStore.user?.current_level || 1" 
                  :current-xp="authStore.user?.total_xp || 0" 
                  :next-level-xp="1000" 
                />
              </div>
            </div>

            <!-- Profile Entry -->
            <button @click="openProfile(authStore.user.id)" 
                    title="My Profile / Mi Perfil"
                    class="flex items-center gap-3 transition-all p-1 hover:bg-surface/10 rounded-2xl">
              <div class="text-right hidden md:flex flex-col items-end">
                <p class="text-xs font-bold text-foreground leading-none">{{ authStore.user?.name }}</p>
                <span v-if="authStore.user?.title_name" class="text-[9px] font-medium text-primary-500 mt-1">
                  {{ authStore.user?.title_name }}
                </span>
              </div>
              <AvatarFrame :src="authStore.user?.avatar_url" :border-css="authStore.user?.border_css" :avatar-css="authStore.user?.avatar_css" :size="40" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Operational View -->
    <main class="pt-4 pb-20">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" @start="onStartAction" @viewProfile="openProfile" />
        </transition>
      </router-view>
    </main>

    <footer class="mt-auto py-12 pb-32 md:pb-12 border-t border-border/5">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-muted/40">
        <span class="text-[10px] font-medium tracking-wider">Reppy Core © 2026</span>
        <div class="flex items-center gap-6">
          <span class="text-[10px] font-medium tracking-wider">Privacy Protocol</span>
          <span class="text-[10px] font-medium tracking-wider">System Status: Optimal</span>
        </div>
      </div>
    </footer>

    <!-- Mobile Bottom Operational Dock -->
    <nav v-if="authStore.isAuthenticated" 
      class="lg:hidden fixed bottom-6 left-6 right-6 z-[60] bg-surface/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-1.5 transition-transform duration-500">
      <div class="flex items-center justify-around h-14">
        <router-link v-for="nav in mobileNavLinks" :key="nav.id"
          :to="'/' + nav.id" 
          :title="i18n.t(nav.label)"
          class="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all relative"
          :class="$route.name === nav.id ? 'text-primary-500' : 'text-muted hover:text-foreground'">
          
          <div v-if="$route.name === nav.id" class="absolute -top-1 w-8 h-1 bg-primary-500 rounded-full blur-[2px]"></div>
          
          <component :is="nav.icon" class="w-5 h-5" :class="$route.name === nav.id ? 'fill-primary-500/10' : ''" />
          <span class="text-[9px] font-bold tracking-tight">{{ i18n.t(nav.label) }}</span>
          
          <!-- Inventory Notification -->
          <div v-if="nav.id === 'inventory' && authStore.user?.boss_chests > 0" 
            class="absolute top-1 right-1/4 w-2 h-2 bg-primary-500 rounded-full border-2 border-background"></div>
        </router-link>

        <!-- Mobile Profile -->
        <router-link to="/profile" class="flex-1 flex flex-col items-center justify-center gap-1 transition-all">
          <AvatarFrame :src="authStore.user?.avatar_url" :border-css="$route.name === 'profile' ? authStore.user?.border_css : ''" :size="26" 
               class="transition-all" :class="$route.name === 'profile' ? 'ring-2 ring-primary-500/20' : 'opacity-60 grayscale'" />
          <span class="text-[9px] font-bold tracking-tight" :class="$route.name === 'profile' ? 'text-primary-500' : 'text-muted'">{{ i18n.t('nav_profile') }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Global Interface Components -->
    <NotificationToast />
    <ConfirmDialog />
    <WelcomeModal :show="showEasterModal" @close="showEasterModal = false" />
    <LuckyWheel :show="showRoulette" @close="showRoulette = false" @spun="onSpun" />
    <DamageNumbers />

    <!-- Economy Codex Modal -->
    <Teleport to="body">
      <div v-if="showCoinsInfo" 
           class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
           @click.self="showCoinsInfo = false">
        <div class="card-stats max-w-xl w-full p-8 md:p-12 border-border space-y-10 relative overflow-hidden overflow-y-auto max-h-[90vh]">
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <h3 class="text-3xl font-black text-industrial text-foreground uppercase italic tracking-tighter">ECONOMY<span class="text-primary-500">.</span>CODEX</h3>
              <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Resource allocation protocol</p>
            </div>
            <button @click="showCoinsInfo = false" class="p-3 bg-surface/5 hover:bg-surface/10 border border-border rounded-2xl transition-all">
              <X class="w-6 h-6 text-foreground" />
            </button>
          </div>

          <!-- Generation Protocol -->
          <div class="space-y-6">
            <h4 class="text-[10px] font-black uppercase text-primary-500 tracking-[0.3em]">REVENUE GENERATION</h4>
            <div class="grid grid-cols-1 gap-3">
              <div v-for="earn in earnings" :key="earn.name" class="flex items-center justify-between p-5 bg-white/[0.02] dark:bg-white/[0.02] bg-foreground/[0.03] rounded-2xl border border-border">
                <span class="text-xs font-black text-muted uppercase tracking-widest">{{ earn.name }}</span>
                <div class="flex items-baseline gap-2">
                   <span class="text-lg font-black text-precision text-foreground">{{ earn.amount }}</span>
                   <span class="text-[8px] font-black text-muted uppercase tracking-widest">RC / REP</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bonus Events -->
          <div class="space-y-6">
            <h4 class="text-[10px] font-black uppercase text-neon-lime tracking-[0.3em]">EXCEPTIONAL YIELD</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div class="p-5 bg-neon-lime/5 border border-neon-lime/10 rounded-2xl space-y-2 text-left">
                  <p class="text-[9px] font-black text-neon-lime uppercase tracking-widest">DAILY ROULETTE</p>
                  <p class="text-sm font-black text-foreground text-precision">10 – 100 RC</p>
               </div>
               <div class="p-5 bg-primary-500/5 border border-primary-500/10 rounded-2xl space-y-2 text-left">
                  <p class="text-[9px] font-black text-primary-500 uppercase tracking-widest">BOSS ANOMALIES</p>
                  <p class="text-sm font-black text-foreground text-precision">LEGENDARY DROPS</p>
               </div>
            </div>
          </div>

          <!-- Economic Projection -->
          <div class="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-6">
            <div class="p-3 bg-primary-500/10 rounded-2xl"><Coins class="w-6 h-6 text-primary-500" /></div>
            <div>
               <p class="text-[10px] font-black text-muted uppercase tracking-widest">MONTHLY PROJECTION</p>
               <p class="text-sm font-black text-foreground font-tight uppercase tracking-tight">ACTIVE OPERATIVES YIELD <span class="text-primary-500 text-precision">~1200 RC</span></p>
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
        class="relative bg-steel-grey/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl transition-all duration-500 border border-white/10 group overflow-hidden">
        
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
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { Github, Star, LayoutDashboard, Users, Swords, Package, X, Coins } from 'lucide-vue-next';
import { useAuthStore } from './stores/auth';
import { useI18nStore } from './stores/i18n';

// Components
import AvatarFrame from './components/AvatarFrame.vue'
import BackgroundEffect from './components/BackgroundEffect.vue'
import WelcomeModal from './components/WelcomeModal.vue'
import LuckyWheel from './components/LuckyWheel.vue'
import LevelBar from './components/LevelBar.vue'
import NotificationToast from './components/NotificationToast.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import DamageNumbers from './components/DamageNumbers.vue'

const authStore = useAuthStore();
const i18n = useI18nStore();
const router = useRouter();
const route = useRoute();

const showEasterModal = ref(false);
const showRoulette = ref(false);
const canSpinToday = ref(false);
const showCoinsInfo = ref(false);

const navLinks = [
  { id: 'dashboard', label: 'nav_dashboard', fallback: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'social', label: 'nav_social', fallback: 'RANKINGS', icon: Users },
  { id: 'inventory', label: 'nav_inventory', fallback: 'GEAR', icon: Package },
  { id: 'shop', label: 'nav_shop', fallback: 'ARMORY', icon: Swords },
];

const mobileNavLinks = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'nav_dashboard' },
  { id: 'social', icon: Users, label: 'nav_social' },
  { id: 'shop', icon: Swords, label: 'nav_armory' },
  { id: 'inventory', icon: Package, label: 'nav_gear' },
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

const openProfile = (id) => { 
  router.push({ name: 'profile', params: { userId: id } });
};

const onStartAction = () => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  } else {
    router.push('/login');
  }
};

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

/* Transition for route changes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-spin-slow { animation: spin 8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
>

<template>
  <div class="min-h-screen selection:bg-primary-500/30 relative text-foreground transition-colors duration-500" :class="[
    authStore.user?.background_css ? 'bg-transparent' : 'bg-background',
    { 'has-custom-bg': authStore.user?.background_css }
  ]">

    <!-- Background System -->
    <BackgroundEffect :background-css="authStore.user?.background_css" />

    <!-- Contrast Shield for Custom Backgrounds -->
    <div v-if="authStore.user?.background_css"
      class="fixed inset-0 pointer-events-none transition-all duration-700 z-[-1]" :class="[
        authStore.user?.background_css.includes('{') ? 'bg-background/60 backdrop-blur-[2px]' : 'bg-background/25 backdrop-blur-[1px]',
        'contrast-shield'
      ]"></div>

    <!-- Industrial Navigation Bar -->
    <nav v-if="authStore.isAuthenticated && $route.name !== 'pvp'"
      class="border-b border-border bg-surface/40 backdrop-blur-3xl sticky top-0 z-50 transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <!-- Logo Core -->
        <router-link :to="`/${i18n.locale}/dashboard`" class="flex items-center gap-3 group cursor-pointer outline-none"
          :title="i18n.t('nav_dashboard')">
          <div
            class="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl shadow-primary-500/20 transition-transform group-hover:scale-110 group-focus:scale-110 group-focus:ring-2 group-focus:ring-primary-500/50 shrink-0">
            R</div>
          <span class="text-2xl font-bold tracking-tight text-foreground font-industrial hidden xs:block">Reppy<span
              class="text-primary-500">.</span></span>
        </router-link>

        <!-- Desktop Navigation (Clean Links) -->
        <div class="hidden lg:flex items-center gap-1">
          <router-link v-for="nav in navLinks" :key="nav.id"
            :to="{ name: nav.id, params: { lang: i18n.locale, ...(nav.id === 'profile' ? { userId: authStore.user?.id } : {}) } }"
            :title="i18n.t(nav.label) || nav.fallback"
            class="px-4 py-2 rounded-2xl text-[13px] font-semibold transition-all relative group flex items-center gap-2.5"
            :class="$route.name === nav.id ? 'text-foreground bg-primary-500/5' : 'text-muted hover:text-foreground hover:bg-surface/10'">
            <component :is="nav.icon" class="w-4 h-4" :class="$route.name === nav.id ? 'text-primary-500' : ''" />
            {{ i18n.t(nav.label) || nav.fallback }}

            <!-- Notification Dot -->
            <div v-if="nav.id === 'inventory' && (authStore.user?.boss_chests > 0 || authStore.user?.has_new_inventory)"
              class="absolute top-1.5 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-surface shadow-[0_0_10px_hsl(var(--primary) / 0.5)]">
            </div>
          </router-link>
          <router-link v-if="authStore.user?.role === 'admin'" :to="`/${i18n.locale}/admin`"
            class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:bg-indigo-500/10 transition-all font-industrial">
            {{ i18n.t('economy_admin') }}
          </router-link>
        </div>

        <!-- System Status & User Profile -->
        <div class="flex items-center gap-2 sm:gap-6">
          <div class="flex items-center gap-1.5 sm:gap-4">
            <!-- Currency Module -->
            <div class="flex items-center gap-1.5 sm:gap-2">
              <button @click="showCoinsInfo = true" :title="i18n.t('economy_history_title')"
                class="flex items-center gap-2 bg-surface/5 px-2.5 sm:px-4 py-2 rounded-2xl border border-border hover:border-primary-500/30 cursor-pointer transition-all group focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                <Coins class="w-3.5 h-3.5 text-primary-500 transition-transform group-hover:scale-110" />
                <span class="text-[12px] sm:text-sm font-black text-precision text-foreground">{{
                  authStore.user?.reppy_coins || 0 }}</span>
              </button>

              <button @click="showCoinsInfo = true" :title="i18n.t('economy_gems')"
                class="flex items-center gap-2 bg-indigo-500/5 px-2.5 sm:px-4 py-2 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                <Gem class="w-3.5 h-3.5 text-indigo-500 transition-transform group-hover:scale-110" />
                <span class="text-[12px] sm:text-sm font-black text-precision text-foreground">{{
                  authStore.user?.reppy_gems || 0 }}</span>
              </button>
            </div>

            <!-- Notification Bell -->
            <div class="relative flex items-center">
              <button @click="handleBellClick"
                class="p-2 sm:p-2.5 rounded-2xl transition-all group relative border flex items-center justify-center"
                :class="showNotifications ? 'bg-primary-500/10 border-primary-500/30 text-primary-500' : 'bg-surface/5 border-border hover:bg-surface/10'">
                <Bell class="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-colors"
                  :class="showNotifications ? 'text-primary-500' : 'text-muted group-hover:text-primary-500'" />
                <div v-if="notifStore.unreadCount > 0"
                  class="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full border-2 border-surface flex items-center justify-center">
                  <span class="text-[8px] font-black text-white">{{ notifStore.unreadCount }}</span>
                </div>
              </button>

              <div v-if="showNotifications"
                class="absolute right-0 top-full mt-4 z-[150] animate-in slide-in-from-top-2 duration-300">
                <NotificationsDropdown @close="showNotifications = false" />
              </div>
            </div>

            <!-- Mute Toggle -->
            <button @click="toggleMute(); playClickBlip();"
              :title="isMuted() ? i18n.t('audio_unmute') : i18n.t('audio_mute')"
              class="p-2 sm:p-2.5 rounded-2xl transition-all group bg-surface/5 border border-border hover:bg-surface/10 flex items-center justify-center">
              <component :is="isMuted() ? VolumeX : Volume2"
                class="w-4.5 h-4.5 sm:w-5 sm:h-5 text-muted group-hover:text-primary-500 transition-colors" />
            </button>

          


            <!-- Level Module (Responsive) -->
            <div class="flex items-center">
              <!-- Compact for mobile, full for desktop -->
              <div
                class="sm:hidden flex items-center gap-1.5 bg-primary-500/10 px-2 py-1.5 rounded-xl border border-primary-500/20">
                <span class="text-[8px] font-black text-primary-500 uppercase tracking-widest">LVL</span>
                <span class="text-sm font-black text-foreground italic leading-none">{{ authStore.user?.current_level ||
                  1 }}</span>
              </div>
              <div class="hidden sm:block">
                <LevelBar :level="authStore.user?.current_level || 1" :current-xp="authStore.user?.xp_into_level || 0"
                  :next-level-xp="authStore.user?.xp_for_next_level || 1000" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </nav>

    <!-- Public Navigation Bar -->
    <nav v-else-if="$route.name !== 'pvp' && $route.name !== 'login'"
      class="border-b border-border bg-surface/40 backdrop-blur-3xl sticky top-0 z-50 transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
        <router-link :to="{ name: 'landing', params: { lang: i18n.locale } }"
          class="flex items-center gap-3 group cursor-pointer outline-none shrink-0"
          :title="'Reppy'">
          <div
            class="w-9 h-9 md:w-10 md:h-10 bg-primary-500 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl shadow-primary-500/20 transition-transform group-hover:scale-110 group-focus:scale-110 group-focus:ring-2 group-focus:ring-primary-500/50">
            R</div>
          <span class="text-xl md:text-2xl font-bold tracking-tight text-foreground font-industrial">Reppy<span
              class="text-primary-500">.</span></span>
        </router-link>

        <div class="flex items-center justify-end gap-1 md:gap-2 min-w-0">
          <router-link v-for="nav in publicNavLinks" :key="nav.id"
            :to="{ name: nav.id, params: { lang: i18n.locale } }"
            class="hidden sm:flex px-3 md:px-4 py-2 rounded-2xl text-[12px] md:text-[13px] font-semibold transition-all relative group items-center gap-2"
            :class="$route.name === nav.id ? 'text-foreground bg-primary-500/5' : 'text-muted hover:text-foreground hover:bg-surface/10'">
            <component :is="nav.icon" class="w-4 h-4" :class="$route.name === nav.id ? 'text-primary-500' : ''" />
            {{ i18n.t(nav.label) || nav.fallback }}
          </router-link>

          <button @click="switchLocale"
            class="px-3 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest text-muted hover:text-foreground hover:bg-surface/10 border border-border/40 transition-all">
            {{ i18n.locale === 'es' ? 'EN' : 'ES' }}
          </button>

          <router-link :to="{ name: 'login', params: { lang: i18n.locale } }"
            class="hidden xs:flex items-center gap-2 px-3 md:px-4 py-2 rounded-2xl border border-border bg-surface/5 text-[11px] md:text-[12px] font-black uppercase tracking-widest text-foreground hover:border-primary-500/40 transition-all">
            <LogIn class="w-4 h-4 text-primary-500" />
            {{ i18n.t('login_btn') }}
          </router-link>

          <router-link :to="{ name: 'login', params: { lang: i18n.locale }, query: { mode: 'signup' } }"
            class="px-3 md:px-5 py-2.5 rounded-2xl bg-primary-500 text-white text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all whitespace-nowrap">
            {{ i18n.t('signup_btn') }}
          </router-link>
        </div>
      </div>

      <div class="sm:hidden px-4 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <router-link v-for="nav in publicNavLinks" :key="`mobile-${nav.id}`"
          :to="{ name: nav.id, params: { lang: i18n.locale } }"
          class="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0"
          :class="$route.name === nav.id ? 'text-primary-500 bg-primary-500/10' : 'text-muted bg-surface/5'">
          <component :is="nav.icon" class="w-3.5 h-3.5" />
          {{ i18n.t(nav.label) || nav.fallback }}
        </router-link>
      </div>
    </nav>

    <!-- Main Operational View -->
    <main :class="['flex-1 flex flex-col', $route.name === 'pvp' ? 'p-0' : 'pt-4 pb-20']">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" @start="onStartAction" @viewProfile="openProfile" />
        </transition>
      </router-view>
    </main>

    <footer class="mt-auto py-12 pb-32 md:pb-12 border-t border-border/5">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-muted/40">
        <span class="text-[10px] font-medium tracking-wider">{{ i18n.t('economy_reppy_core') }}</span>
        <div class="flex items-center gap-6">
          <router-link :to="`/${i18n.locale}/blog`"
            class="text-[10px] font-medium tracking-wider hover:text-primary-500 transition-colors">{{
              i18n.t('nav_blog') }}</router-link>
          <span class="text-[10px] font-medium tracking-wider">{{ i18n.t('economy_privacy') }}</span>
          <span class="text-[10px] font-medium tracking-wider">{{ i18n.t('economy_status_optimal') }}</span>

          <a href="https://github.com/Ro0oman/Reppy" target="_blank"
            class="flex items-center gap-3 px-4 py-2 rounded-xl bg-surface/5 hover:bg-surface/10 border border-border/50 transition-all group">
            <Github class="w-4 h-4 text-muted group-hover:text-foreground" />
            <div class="flex items-center gap-2">
              <Star class="w-3 h-3 text-primary-500 fill-primary-500 animate-pulse" />
              <span class="text-[8px] font-black text-muted uppercase tracking-widest">{{ i18n.t('economy_star_github')
                }}</span>
            </div>
          </a>
        </div>
      </div>
    </footer>

    <!-- Mobile Bottom Dock — core-loop first, with elevated "Log" action -->
    <nav v-if="authStore.isAuthenticated && $route.name !== 'pvp'"
      class="lg:hidden fixed bottom-0 left-0 right-0 z-[60] border-t border-border bg-surface/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div class="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        <!-- Left items -->
        <router-link v-for="nav in mobileNavLeft" :key="nav.id"
          :to="getMobileNavTo(nav)"
          class="flex flex-col items-center justify-center gap-1 h-full group transition-colors"
          :class="$route.name === nav.id ? 'text-primary-500' : 'text-muted hover:text-foreground'">
          <component :is="nav.icon" class="w-[22px] h-[22px] transition-transform group-active:scale-90" />
          <span class="text-[9px] font-bold tracking-tight">{{ nav.short || i18n.t(nav.label) }}</span>
        </router-link>

        <!-- Center: elevated primary action (Log reps) -->
        <div class="flex justify-center">
          <router-link :to="{ name: 'dashboard', params: { lang: i18n.locale }, query: { log: 1 } }"
            class="-mt-7 flex flex-col items-center gap-1 group" :title="i18n.locale === 'es' ? 'Registrar reps' : 'Log reps'">
            <span class="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 ring-4 ring-background transition-transform group-active:scale-95">
              <Plus class="w-7 h-7" stroke-width="2.5" />
            </span>
            <span class="text-[9px] font-black uppercase tracking-tight text-primary-500">{{ i18n.locale === 'es' ? 'Registrar' : 'Log' }}</span>
          </router-link>
        </div>

        <!-- Right items -->
        <router-link v-for="nav in mobileNavRight" :key="nav.id"
          :to="getMobileNavTo(nav)"
          class="flex flex-col items-center justify-center gap-1 h-full group relative transition-colors"
          :class="$route.name === nav.id ? 'text-primary-500' : 'text-muted hover:text-foreground'">
          <component :is="nav.icon" class="w-[22px] h-[22px] transition-transform group-active:scale-90" />
          <!-- Reward badge on Profile (chests/new inventory now live there) -->
          <span v-if="nav.id === 'profile' && (authStore.user?.boss_chests > 0 || authStore.user?.has_new_inventory)"
            class="absolute top-2 right-[calc(50%-18px)] w-2 h-2 rounded-full bg-primary-500 ring-2 ring-surface"></span>
          <span class="text-[9px] font-bold tracking-tight">{{ nav.short || i18n.t(nav.label) }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Global Interface Components -->
    <NotificationToast />
    <ConfirmDialog />
    <LuckyWheel :show="rouletteStore.showModal" @close="rouletteStore.closeModal()" @spun="onSpun" />
    <DamageNumbers />

    <Teleport to="body">
      <div v-if="showCoinsInfo"
        class="fixed inset-0 z-[100] flex justify-center items-center p-4 md:p-8 bg-background/90 backdrop-blur-md"
        @click.self="showCoinsInfo = false">
        <div
          class="bg-surface/90 border border-white/10 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-y-auto relative flex flex-col max-h-[90vh] no-scrollbar">
          <div
            class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none">
          </div>

          <div class="flex items-center justify-between p-8 md:p-12 pb-0">
            <div class="space-y-1">
              <h2 class="text-3xl font-black text-industrial text-foreground uppercase italic tracking-tighter">{{
                i18n.t('economy_title') }}</h2>
              <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18n.t('economy_subtitle') }}
              </p>
            </div>
            <button @click="showCoinsInfo = false"
              class="p-3 bg-surface/5 hover:bg-surface/10 border border-border rounded-2xl transition-all">
              <X class="w-6 h-6 text-foreground" />
            </button>
          </div>

          <!-- Generation Protocol -->
          <div class="space-y-6">
            <h3 class="text-[10px] font-black uppercase text-primary-500 tracking-[0.3em]">{{ i18n.t('economy_revenue')
              }}</h3>
            <div class="grid grid-cols-1 gap-3">
              <div v-for="earn in earnings" :key="earn.name"
                class="flex items-center justify-between p-5 bg-white/[0.02] dark:bg-white/[0.02] bg-foreground/[0.03] rounded-2xl border border-border">
                <span class="text-xs font-black text-muted uppercase tracking-widest">{{ i18n.t(earn.key) }}</span>
                <div class="flex items-baseline gap-2">
                  <span class="text-lg font-black text-precision text-foreground">{{ earn.amount }}</span>
                  <span class="text-[8px] font-black text-muted uppercase tracking-widest">{{ i18n.t('economy_rep')
                    }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bonus Events -->
          <div class="space-y-6">
            <h3 class="text-[10px] font-black uppercase text-neon-lime tracking-[0.3em]">{{ i18n.t('feat_yield_title')
              }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-5 bg-neon-lime/5 border border-neon-lime/10 rounded-2xl space-y-2 text-left">
                <p class="text-[9px] font-black text-neon-lime uppercase tracking-widest">{{
                  i18n.t('roulette_exe_available').split(' ')[0] }} {{ i18n.t('roulette_exe_available').split(' ')[1] }}
                </p>
                <p class="text-sm font-black text-foreground text-precision">10 – 100 RC</p>
              </div>
              <div class="p-5 bg-primary-500/5 border border-primary-500/10 rounded-2xl space-y-2 text-left">
                <p class="text-[9px] font-black text-primary-500 uppercase tracking-widest">{{ i18n.t('boss_anomaly') }}
                </p>
                <p class="text-sm font-black text-foreground text-precision">{{ i18n.t('economy_legendary') }}</p>
              </div>
            </div>
          </div>

          <!-- Economic Projection -->
          <div class="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-6">
            <div class="p-3 bg-primary-500/10 rounded-2xl">
              <Coins class="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18n.t('monthly_projection') }}
              </p>
              <p class="text-sm font-black text-foreground font-tight uppercase tracking-tight">{{
                i18n.t('active_yield_desc') }} <span class="text-primary-500 text-precision">~1200 RC</span></p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Floating Roulette Module (Issue 86/142) -->
    <div v-if="rouletteStore.canSpin"
      class="fixed bottom-24 right-4 md:bottom-12 md:right-12 z-[70] flex flex-col items-end gap-5 group">
      <!-- Logic Tooltip -->
      <div
        class="bg-primary-500 text-white text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all border border-white/20 whitespace-nowrap hidden md:block">
        {{ i18n.t('roulette_exe_available') }}
      </div>

      <button @click="rouletteStore.openModal()"
        class="relative bg-steel-grey/60 backdrop-blur-xl p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl transition-all duration-500 border border-white/10 group overflow-hidden active:scale-95">

        <div class="absolute inset-0 bg-gradient-to-br from-primary-500/15 to-transparent"></div>

        <Dices
          class="w-6 h-6 md:w-8 md:h-8 text-white relative z-10 transition-transform duration-500 group-hover:rotate-180" />

        <!-- Available indicator (calm, no infinite ping) -->
        <div
          class="absolute top-3 right-3 md:top-4 md:right-4 w-2.5 h-2.5 bg-primary-500 rounded-full ring-2 ring-background">
        </div>
      </button>
    </div>

    <PushPrompt />

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { Github, Star, LayoutDashboard, Users, Swords, Package, X, Coins, Gem, Bell, User, Dices, Volume2, VolumeX, Book, ShoppingBag, Target, LogIn, Plus } from 'lucide-vue-next';
import { useAuthStore } from './stores/auth';
import { useI18nStore } from './stores/i18n';
import { useNotificationsStore } from './stores/notifications';
import { useAudio } from './composables/useAudio';
import { useSocketStore } from './stores/socket';
import { useRouletteStore } from './stores/roulette';
import { useShopStore } from './stores/shop';
import AvatarFrame from './components/AvatarFrame.vue';
import BackgroundEffect from './components/BackgroundEffect.vue';
import LuckyWheel from './components/LuckyWheel.vue';
import LevelBar from './components/LevelBar.vue';
import NotificationToast from './components/NotificationToast.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import DamageNumbers from './components/DamageNumbers.vue';
import NotificationsDropdown from './components/NotificationsDropdown.vue';
import PushPrompt from './components/PushPrompt.vue';

const socketStore = useSocketStore();
const rouletteStore = useRouletteStore();
const shopStore = useShopStore();
const authStore = useAuthStore();
const { toggleMute, isMuted, playClickBlip } = useAudio();
const i18n = useI18nStore();
const notifStore = useNotificationsStore();
const router = useRouter();
const route = useRoute();

const showCoinsInfo = ref(false);
const showNotifications = ref(false);

// Global Scroll Lock for App-level modals
watch([() => rouletteStore.showModal, showCoinsInfo], ([roulette, coins]) => {
  if (!import.meta.env.SSR) {
    if (roulette || coins) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
});

const handleBellClick = () => {
  if (window.innerWidth < 1024) {
    // Mobile/Tablet: Redirect to page
    router.push({ name: 'notifications' });
  } else {
    // Desktop: Toggle Dropdown
    showNotifications.value = !showNotifications.value;
  }
};

const navLinks = computed(() => [
  { id: 'social', label: 'nav_social', fallback: 'RANKINGS', icon: Users },
  { id: 'dashboard', label: 'nav_dashboard', fallback: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'missions', label: 'nav_missions', fallback: 'MISSIONS', icon: Target },
  { id: 'inventory', label: 'nav_inventory', fallback: 'GEAR', icon: Package },
  { id: 'shop', label: 'nav_shop', fallback: 'ARMORY', icon: ShoppingBag },
  { id: 'profile', label: 'nav_profile', fallback: 'PROFILE', icon: User },
]);

const publicNavLinks = computed(() => [
  { id: 'social', label: 'nav_social', fallback: 'Social', icon: Users },
  { id: 'blog-list', label: 'nav_blog', fallback: 'Blog', icon: Book },
]);

// Mobile dock: core-loop first. Logging is the elevated center action.
// Left of center / right of center. Inventory lives in Profile.
const mobileNavLeft = computed(() => [
  { id: 'shop', icon: ShoppingBag, label: 'nav_shop', short: i18n.locale === 'es' ? 'Tienda' : 'Shop' },
  { id: 'social', icon: Users, label: 'nav_social', short: i18n.locale === 'es' ? 'Comunidad' : 'Community' },
]);
const mobileNavRight = computed(() => [
  { id: 'missions', icon: Target, label: 'nav_missions', short: i18n.locale === 'es' ? 'Misiones' : 'Missions' },
  { id: 'profile', icon: User, label: 'nav_profile', short: i18n.locale === 'es' ? 'Perfil' : 'Profile' },
]);

const getMobileNavTo = (nav) => {
  if (nav.id === 'profile') {
    return { name: 'profile', params: { lang: i18n.locale, userId: authStore.user?.id } };
  }
  return { name: nav.id, params: { lang: i18n.locale } };
};

const earnings = [
  { key: 'ex_pullups_std', amount: '1' },
  { key: 'ex_pushups_std', amount: '1' },
  { key: 'ex_dips_std', amount: '2' },
  { key: 'ex_weighted_pullups', amount: '3' },
  { key: 'ex_muscle_ups', amount: '5' },
];

const checkRoulette = async () => {
  await rouletteStore.checkStatus();
};

const onSpun = () => { rouletteStore.setSpun(); };

const openLiveModal = () => {
  router.push({ name: 'social', params: { lang: i18n.locale } });
};

const switchLocale = () => {
  const nextLang = i18n.locale === 'es' ? 'en' : 'es';
  const params = { ...route.params, lang: nextLang };

  if (route.name) {
    router.push({ name: route.name, params, query: route.query, hash: route.hash });
  } else {
    router.push(`/${nextLang}`);
  }
};

const openProfile = (id) => {
  router.push({ name: 'profile', params: { lang: i18n.locale, userId: id } });
};

const onStartAction = () => {
  if (authStore.isAuthenticated) {
    router.push(`/${i18n.locale}/social`);
  } else {
    router.push(`/${i18n.locale}/login`);
  }
};

const initializeApp = async () => {
  if (!authStore.isAuthenticated || import.meta.env.SSR) return;

  // These are throttled at the store level, but calling them here ensures initial load
  authStore.fetchProfile();
  shopStore.fetchInventory();
  rouletteStore.checkStatus();
  notifStore.fetchNotifications();
  socketStore.init();

  // Periodic presence ping for Pusher/Backend tracking
  const pingInterval = setInterval(() => {
    if (authStore.isAuthenticated) {
      socketStore.syncPresence();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000);
};

watch(() => authStore.isAuthenticated, (val) => {
  if (val) {
    initializeApp();
  } else {
    socketStore.disconnect();
  }
}, { immediate: true });

onMounted(async () => {
  // Initialization is handled by the immediate watch on isAuthenticated
});
</script>

<style scoped>
.font-industrial {
  font-family: 'Inter Tight', sans-serif;
}

.font-tight {
  font-family: 'Inter Tight', sans-serif;
}

.text-precision {
  font-family: 'JetBrains Mono', monospace;
}

/* Transition for route changes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
>

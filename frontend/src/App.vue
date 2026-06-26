<template>
  <div class="min-h-screen selection:bg-primary-500/30 relative text-foreground transition-colors duration-500 overflow-x-hidden" :class="[
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
    <nav v-if="authStore.isAuthenticated && $route.name !== 'pvp' && !$route.meta.immersive"
      class="border-b border-border bg-surface/40 backdrop-blur-lg sticky top-0 z-50 transition-all">
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
            <!-- Coins (always visible) -->
            <button @click="showCoinsInfo = true" :title="i18n.t('economy_history_title')"
              class="flex items-center gap-1.5 bg-surface/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full sm:rounded-xl border border-border hover:border-primary-500/30 cursor-pointer transition-all group focus:outline-none focus:ring-2 focus:ring-primary-500/50">
              <Coins class="w-3.5 h-3.5 text-primary-500" />
              <span class="text-xs sm:text-sm font-bold text-foreground tabular-nums">{{ authStore.user?.reppy_coins || 0 }}</span>
            </button>

            <!-- Gems (always visible) -->
            <button @click="showCoinsInfo = true" :title="i18n.t('economy_gems')"
              class="flex items-center gap-1.5 bg-indigo-500/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full sm:rounded-xl border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              <Gem class="w-3.5 h-3.5 text-indigo-500" />
              <span class="text-xs sm:text-sm font-bold text-foreground tabular-nums">{{ authStore.user?.reppy_gems || 0 }}</span>
            </button>

            <!-- Notification Bell (always) -->
            <div class="relative flex items-center">
              <button @click="handleBellClick"
                class="p-2 rounded-xl transition-all group relative border flex items-center justify-center min-w-[40px] min-h-[40px]"
                :class="showNotifications ? 'bg-primary-500/10 border-primary-500/30 text-primary-500' : 'bg-surface/5 border-border hover:bg-surface/10'">
                <Bell class="w-5 h-5 transition-colors"
                  :class="showNotifications ? 'text-primary-500' : 'text-muted group-hover:text-primary-500'" />
                <div v-if="notifStore.unreadCount > 0"
                  class="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full border-2 border-surface flex items-center justify-center">
                  <span class="text-[10px] font-bold text-white">{{ notifStore.unreadCount }}</span>
                </div>
              </button>
              <div v-if="showNotifications"
                class="absolute right-0 top-full mt-3 z-[150] animate-in slide-in-from-top-2 duration-200">
                <NotificationsDropdown @close="showNotifications = false" />
              </div>
            </div>

            
            <!-- Level chip (always, tappable → Perfil) -->
            <router-link :to="{ name: 'profile', params: { lang: i18n.locale, userId: authStore.user?.id } }"
              class="flex items-center gap-1.5 bg-primary-500/10 px-2.5 py-1.5 rounded-xl border border-primary-500/20 hover:border-primary-500/40 transition-all min-h-[40px]">
              <!-- <span class="text-[10px] font-bold text-primary-500 uppercase tracking-wide">{{ authStore.user?.name || 1 }}</span> -->
              <AvatarFrame :src="authStore.user?.avatar_url"  :size="30" />
            </router-link>

            <!-- XP bar: desktop only -->
            <div class="hidden sm:block">
              <LevelBar :level="authStore.user?.current_level || 1" :current-xp="authStore.user?.xp_into_level || 0"
                :next-level-xp="authStore.user?.xp_for_next_level || 1000" />
            </div>

          </div>

        </div>
      </div>
    </nav>

    <!-- Public Navigation Bar -->
    <nav v-else-if="$route.name !== 'pvp' && $route.name !== 'login' && !$route.meta.immersive"
      class="border-b border-border bg-surface/40 backdrop-blur-lg sticky top-0 z-50 transition-all">
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
    <main :class="['flex-1 flex flex-col min-w-0 overflow-x-hidden', ($route.name === 'pvp' || $route.meta.immersive) ? 'p-0' : 'pt-4 pb-20']">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" @start="onStartAction" @viewProfile="openProfile" />
        </transition>
      </router-view>
    </main>

    <footer v-if="!$route.meta.immersive" class="mt-auto py-12 pb-24 md:pb-12 border-t border-border/5">
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
              <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18n.t('economy_star_github')
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
          <span class="text-xs font-bold tracking-tight">{{ nav.short || i18n.t(nav.label) }}</span>
        </router-link>

        <!-- Center: elevated primary action (quick log) -->
        <div class="flex justify-center">
          <router-link :to="{ name: 'battle', params: { lang: i18n.locale } }"
            class="-mt-7 flex flex-col items-center gap-1 group" :title="i18n.t('nav_train')">
            <span class="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/40 ring-4 ring-background transition-transform group-active:scale-95">
              <Flame class="w-7 h-7" stroke-width="2.5" />
            </span>
            <span class="text-xs font-black uppercase tracking-tight text-orange-500">{{ i18n.locale === 'es' ? 'Batalla' : 'Battle' }}</span>
          </router-link>
        </div>

        <!-- Right items -->
        <router-link v-for="nav in mobileNavRight" :key="nav.id"
          :to="getMobileNavTo(nav)"
          class="flex flex-col items-center justify-center gap-1 h-full group relative transition-colors"
          :class="$route.name === nav.id ? 'text-primary-500' : 'text-muted hover:text-foreground'">
          <component :is="nav.icon" class="w-[22px] h-[22px] transition-transform group-active:scale-90" />
          <!-- Badge on Inventory when chests/new items available -->
          <span v-if="nav.id === 'inventory' && (authStore.user?.boss_chests > 0 || authStore.user?.has_new_inventory || badgesStore.inventory_new || badgesStore.chests_total > 0)"
            class="absolute top-2 right-[calc(50%-18px)] w-2 h-2 rounded-full bg-primary-500 ring-2 ring-surface"></span>
          <span class="text-xs font-bold tracking-tight">{{ nav.short || i18n.t(nav.label) }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Global Interface Components -->
    <NotificationToast />
    <ConfirmDialog />
    <LuckyWheel :show="rouletteStore.showModal" @close="rouletteStore.closeModal()" @spun="onSpun" />
    <DamageNumbers />
    <QuickLogSheet :show="showQuickLog" @close="showQuickLog = false" />

    <Teleport to="body">
      <div v-if="showCoinsInfo"
        class="cursor-pointer fixed inset-0 z-[100] flex justify-center items-center p-4 md:p-8 bg-background/90 backdrop-blur-md"
        @click.self="showCoinsInfo = false">
        <div
          class="bg-surface/90 border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-y-auto relative flex flex-col max-h-[90vh] no-scrollbar">
          <div
            class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none">
          </div>

          <div class="flex items-center justify-between p-8 md:p-12 pb-0">
            <div class="space-y-1">
              <h2 class="text-3xl font-bold text-industrial text-foreground   tracking-tighter">{{
                i18n.t('economy_title') }}</h2>
              <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18n.t('economy_subtitle') }}
              </p>
            </div>
            <button @click="showCoinsInfo = false"
              class="p-3 bg-surface/5 hover:bg-surface/10 border border-border rounded-2xl transition-all">
              <X class="w-6 h-6 text-foreground" />
            </button>
          </div>


          <!-- What each currency is for (consistent iconography) -->
          <div class="space-y-4 p-8 md:px-12 pt-6">
            <h3 class="text-[10px] font-black uppercase text-foreground/70 tracking-[0.3em]">{{ i18n.t('economy_currencies_title') }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <!-- Reppy Coins -->
              <div class="flex flex-col gap-2 p-4 bg-primary-500/[0.06] border border-primary-500/20 rounded-2xl">
                <div class="flex items-center gap-2">
                  <Coins class="w-4 h-4 text-primary-500 shrink-0" />
                  <span class="text-xs font-black text-foreground uppercase tracking-wide">{{ i18n.t('economy_coins_name') }}</span>
                </div>
                <p class="text-xs text-muted/80 leading-relaxed">{{ i18n.t('economy_coins_for') }}</p>
              </div>
              <!-- Reppy Gems -->
              <div class="flex flex-col gap-2 p-4 bg-indigo-500/[0.06] border border-indigo-500/20 rounded-2xl">
                <div class="flex items-center gap-2">
                  <Gem class="w-4 h-4 text-indigo-500 shrink-0" />
                  <span class="text-xs font-black text-foreground uppercase tracking-wide">{{ i18n.t('economy_gems_name') }}</span>
                </div>
                <p class="text-xs text-muted/80 leading-relaxed">{{ i18n.t('economy_gems_for') }}</p>
              </div>
              <!-- Chests -->
              <div class="flex flex-col gap-2 p-4 bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl">
                <div class="flex items-center gap-2">
                  <Package class="w-4 h-4 text-amber-400 shrink-0" />
                  <span class="text-xs font-black text-foreground uppercase tracking-wide">{{ i18n.t('economy_chests_name') }}</span>
                </div>
                <p class="text-xs text-muted/80 leading-relaxed">{{ i18n.t('economy_chests_for') }}</p>
              </div>
            </div>
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
                  <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18n.t('economy_rep')
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
                <p class="text-xs font-black text-neon-lime uppercase tracking-widest">{{
                  i18n.t('roulette_exe_available').split(' ')[0] }} {{ i18n.t('roulette_exe_available').split(' ')[1] }}
                </p>
                <p class="text-sm font-black text-foreground text-precision">10 – 100 RC</p>
              </div>
              <div class="p-5 bg-primary-500/5 border border-primary-500/10 rounded-2xl space-y-2 text-left">
                <p class="text-xs font-black text-primary-500 uppercase tracking-widest">{{ i18n.t('boss_anomaly') }}
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
          <p class="text-[10px] font-black text-muted uppercase tracking-widest">          
              </p>
              <p class="text-sm font-black text-foreground font-tight uppercase tracking-tight">{{
                i18n.t('active_yield_desc') }} <span class="text-primary-500 text-precision">~1200 RC</span></p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Floating Roulettes (desktop) — daily on top, 4h below, in one column so
         their cooldown chips never overlap. -->
    <div v-if="authStore.isAuthenticated && !$route.meta.immersive && (rouletteStore.canSpin || quickCooldown || rouletteStore.dailyCanSpin || dailyCooldown)"
      class="hidden lg:flex fixed bottom-12 right-12 z-[70] flex-col items-end gap-4">

      <!-- Daily wheel -->
      <div v-if="rouletteStore.dailyCanSpin || dailyCooldown" class="flex flex-col items-end gap-2 group">
        <div v-if="rouletteStore.dailyCanSpin"
          class="hidden group-hover:block bg-gradient-to-r from-amber-500 to-fuchsia-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl whitespace-nowrap">
          {{ i18n.t('wheel_daily_cta') }}
        </div>
        <div v-else
          class="hidden group-hover:block bg-surface border border-border text-muted text-xs font-bold px-4 py-2 rounded-full shadow-xl whitespace-nowrap">
          {{ i18n.t('wheel_cooldown', { time: dailyCooldown }) }}
        </div>
        <button @click="rouletteStore.openModal('daily')" :disabled="!rouletteStore.dailyCanSpin"
          :class="rouletteStore.dailyCanSpin ? 'border-fuchsia-500/40 hover:border-fuchsia-500/70 shadow-fuchsia-500/20 active:scale-95' : 'border-border opacity-50 grayscale cursor-not-allowed'"
          class="relative bg-surface/80 backdrop-blur-md p-5 rounded-2xl shadow-xl transition-all border group overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-fuchsia-500/20 pointer-events-none"></div>
          <Gift class="w-7 h-7 text-amber-400 relative z-10 transition-transform duration-300 drop-shadow-[0_0_6px_rgba(217,70,239,0.5)]" :class="{ 'group-hover:-rotate-12': rouletteStore.dailyCanSpin }" />
          <div v-if="rouletteStore.dailyCanSpin" class="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-gradient-to-br from-amber-400 to-fuchsia-500 rounded-full ring-2 ring-background"></div>
        </button>
      </div>

      <!-- 4h wheel -->
      <div v-if="rouletteStore.canSpin || quickCooldown" class="flex flex-col items-end gap-2 group">
        <div v-if="rouletteStore.canSpin"
          class="hidden group-hover:block bg-primary-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl whitespace-nowrap">
          {{ i18n.t('roulette_exe_available') }}
        </div>
        <div v-else
          class="hidden group-hover:block bg-surface border border-border text-muted text-xs font-bold px-4 py-2 rounded-full shadow-xl whitespace-nowrap">
          {{ i18n.t('wheel_cooldown', { time: quickCooldown }) }}
        </div>
        <button @click="rouletteStore.openModal()" :disabled="!rouletteStore.canSpin"
          :class="rouletteStore.canSpin ? 'rgb-roulette-button border-border hover:border-primary-500/40 active:scale-95' : 'border-border opacity-50 grayscale cursor-not-allowed'"
          class="relative bg-surface/80 backdrop-blur-md p-5 rounded-2xl shadow-xl transition-all border group overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent pointer-events-none"></div>
          <Dices class="w-7 h-7 text-foreground relative z-10 transition-transform duration-300" :class="{ 'group-hover:rotate-180': rouletteStore.canSpin }" />
          <div v-if="rouletteStore.canSpin" class="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary-500 rounded-full ring-2 ring-background"></div>
        </button>
      </div>
    </div>

    <!-- Floating Roulettes (mobile) — compact chips above the dock, daily on top. -->
    <div v-if="authStore.isAuthenticated && !$route.meta.immersive && (rouletteStore.canSpin || quickCooldown || rouletteStore.dailyCanSpin || dailyCooldown)"
      class="lg:hidden fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom)+0.5rem)] right-3 z-[65] flex flex-col items-end gap-2">
      <!-- Daily chip -->
      <button v-if="rouletteStore.dailyCanSpin || dailyCooldown"
        @click="rouletteStore.openModal('daily')" :disabled="!rouletteStore.dailyCanSpin"
        :class="rouletteStore.dailyCanSpin ? 'border-fuchsia-500/40 active:scale-95' : 'border-border opacity-60 grayscale cursor-not-allowed'"
        class="relative flex items-center gap-2 bg-surface/90 backdrop-blur-md border rounded-xl px-3 py-2 shadow-lg transition-all overflow-hidden">
        <div v-if="rouletteStore.dailyCanSpin" class="absolute inset-0 bg-gradient-to-r from-amber-500/15 to-fuchsia-500/15 pointer-events-none"></div>
        <Gift class="w-4 h-4 text-amber-400 relative z-10" />
        <span v-if="rouletteStore.dailyCanSpin" class="relative z-10 text-xs font-bold bg-gradient-to-r from-amber-400 to-fuchsia-500 bg-clip-text text-transparent">{{ i18n.t('wheel_daily_cta') }}</span>
        <div v-if="rouletteStore.dailyCanSpin" class="relative z-10 w-2 h-2 bg-gradient-to-br from-amber-400 to-fuchsia-500 rounded-full"></div>
      </button>
      <!-- 4h chip -->
      <button v-if="rouletteStore.canSpin || quickCooldown"
        @click="rouletteStore.openModal()" :disabled="!rouletteStore.canSpin"
        :class="rouletteStore.canSpin ? 'rgb-roulette-button rgb-roulette-button-mobile border-primary-500/30 active:scale-95' : 'border-border opacity-60 grayscale cursor-not-allowed'"
        class="flex items-center gap-2 bg-surface/90 backdrop-blur-md border rounded-xl px-3 py-2 shadow-lg transition-all overflow-hidden">
        <Dices class="w-4 h-4 text-primary-500" />
        <span v-if="rouletteStore.canSpin" class="text-xs font-bold text-primary-500">{{ i18n.locale === 'es' ? 'Ruleta' : 'Spin' }}</span>
        <div v-if="rouletteStore.canSpin" class="w-2 h-2 bg-primary-500 rounded-full"></div>
      </button>
    </div>

    <PushPrompt />

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { Github, Star, LayoutDashboard, Users, Swords, Package, X, Coins, Gem, Bell, User, Dices, Gift, Volume2, VolumeX, Book, ShoppingBag, Target, LogIn, Plus, Tent, Flame } from 'lucide-vue-next';
import { useAuthStore } from './stores/auth';
import { useI18nStore } from './stores/i18n';
import { useNotificationsStore } from './stores/notifications';
import { useAudio } from './composables/useAudio';
import { useSocketStore } from './stores/socket';
import { useRouletteStore } from './stores/roulette';
import { useShopStore } from './stores/shop';
import { useBadgesStore } from './stores/badges';
import { useFeatureSeenStore } from './stores/featureSeen';
import AvatarFrame from '@/components/ui/AvatarFrame.vue';
import BackgroundEffect from '@/components/system/BackgroundEffect.vue';
import LuckyWheel from '@/components/shop/LuckyWheel.vue';
import LevelBar from '@/components/ui/LevelBar.vue';
import NotificationToast from '@/components/system/NotificationToast.vue';
import ConfirmDialog from '@/components/modals/ConfirmDialog.vue';
import DamageNumbers from '@/components/system/DamageNumbers.vue';
import NotificationsDropdown from '@/components/system/NotificationsDropdown.vue';
import PushPrompt from '@/components/system/PushPrompt.vue';
import QuickLogSheet from '@/components/battle/QuickLogSheet.vue';

const socketStore = useSocketStore();
const rouletteStore = useRouletteStore();
const shopStore = useShopStore();
const badgesStore = useBadgesStore();
const featureSeenStore = useFeatureSeenStore();
const authStore = useAuthStore();
const { toggleMute, isMuted, playClickBlip } = useAudio();
const i18n = useI18nStore();
const notifStore = useNotificationsStore();
const router = useRouter();
const route = useRoute();

const showCoinsInfo = ref(false);
const showNotifications = ref(false);
const showQuickLog = ref(false);

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

// Mobile dock (RPG): Entrenar (battle) · Campamento (dashboard) · [center quick-log]
// · Inventario · Tienda. The elevated center button opens the quick-log sheet.
const mobileNavLeft = computed(() => [
  { id: 'social', icon: Users, label: 'nav_social', short: i18n.locale === 'es' ? 'Comunidad' : 'Community' },
  { id: 'dashboard', icon: Tent, label: 'nav_camp', short: i18n.locale === 'es' ? 'Campamento' : 'Camp' },
]);
const mobileNavRight = computed(() => [
  { id: 'inventory', icon: Package, label: 'nav_inventory', short: i18n.locale === 'es' ? 'Inventario' : 'Inventory' },
  { id: 'shop', icon: ShoppingBag, label: 'nav_shop', short: i18n.locale === 'es' ? 'Tienda' : 'Shop' },
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
  await rouletteStore.checkDailyStatus();
};

const onSpun = (variant) => {
  if (variant === 'daily') rouletteStore.setDailySpun();
  else rouletteStore.setSpun();
};

// Live clock so the floating roulette buttons can show a ticking countdown
// while on cooldown.
const nowTs = ref(Date.now());
let rouletteClock = null;

// "2h 14m" / "37m" / "<1m" until a wheel recharges, or null if it's ready/unknown.
const formatRemaining = (nextAt) => {
  if (!nextAt) return null;
  const remaining = new Date(nextAt).getTime() - nowTs.value;
  if (remaining <= 0) return null;
  const totalMinutes = Math.ceil(remaining / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return '<1m';
};
const quickCooldown = computed(() => formatRemaining(rouletteStore.nextSpinAt));
const dailyCooldown = computed(() => formatRemaining(rouletteStore.dailyNextSpinAt));

// When a countdown elapses, re-fetch status so the button flips back to active.
watch(quickCooldown, (val) => { if (!val && !rouletteStore.canSpin) rouletteStore.checkStatus(true); });
watch(dailyCooldown, (val) => { if (!val && !rouletteStore.dailyCanSpin) rouletteStore.checkDailyStatus(true); });

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
  if (import.meta.env.SSR) return;

  // Always init socket so anonymous users appear in presence-global too
  socketStore.init();

  if (!authStore.isAuthenticated) return;

  // These are throttled at the store level, but calling them here ensures initial load
  authStore.fetchProfile();
  shopStore.fetchInventory();
  rouletteStore.checkStatus();
  rouletteStore.checkDailyStatus();
  notifStore.fetchNotifications();
  badgesStore.fetchBadges();
  featureSeenStore.load();

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
  if (import.meta.env.SSR) return;
  if (val) {
    initializeApp();
  } else {
    socketStore.disconnect();
    // Re-init as anonymous so they still see presence
    socketStore.init();
  }
}, { immediate: true });

onMounted(async () => {
  // Initialization is handled by the immediate watch on isAuthenticated
  rouletteClock = setInterval(() => { nowTs.value = Date.now(); }, 1000);
});

onUnmounted(() => {
  if (rouletteClock) clearInterval(rouletteClock);
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

.rgb-roulette-button::before {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: 0;
  border-radius: inherit;
  background: conic-gradient(from 0deg, #ff004c, #ffb300, #44ff00, #00e5ff, #7c3cff, #ff004c);
  animation: roulette-rgb-spin 2.6s linear infinite;
}

.rgb-roulette-button::after {
  content: "";
  position: absolute;
  inset: 2px;
  z-index: 0;
  border-radius: calc(1rem - 2px);
  background: hsl(var(--surface) / 0.9);
  backdrop-filter: blur(12px);
}

.rgb-roulette-button > * {
  position: relative;
  z-index: 1;
}

.rgb-roulette-button-mobile::after {
  border-radius: calc(0.75rem - 2px);
}

@keyframes roulette-rgb-spin {
  to {
    transform: rotate(360deg);
  }
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

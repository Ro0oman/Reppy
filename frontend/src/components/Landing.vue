<template>
  <div class="min-h-screen flex flex-col items-center">
    <!-- Hero Section -->
    <section class="relative w-full py-32 px-4 flex flex-col items-center text-center space-y-8 overflow-hidden">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary-600 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <!-- Active Boss Banner -->
      <div v-if="hasActiveEvent && activeBoss" class="w-full max-w-4xl bg-gradient-to-r from-primary-500/20 via-pink-500/20 to-amber-500/20 border-y-4 md:border-4 border-primary-500/50 p-4 md:p-6 rounded-none md:rounded-3xl animate-bounce-short shadow-[0_0_30px_rgba(249,115,22,0.3)] mb-8 glass text-center">
        <h2 class="text-xl md:text-4xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase mb-2">⚔️ ¡{{ activeBoss.name }} ha llegado!</h2>
        <p class="text-zinc-600 dark:text-zinc-300 font-medium text-sm md:text-xl">{{ activeBoss.description.split('.')[0] }}.</p>
        
        <div class="mt-6 flex flex-col items-center gap-4">
          <div class="px-6 py-2 bg-black/10 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">
            Evento Global Activo
          </div>
          <button @click="$emit('start')" class="px-10 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            Unirme a la Caza
          </button>
        </div>
      </div>

      <div class="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4 border-zinc-200 dark:border-white/10 animate-fade-in-up">
        <Sparkles class="w-4 h-4 text-primary-400" />
        <span class="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">{{ i18n.t('hero_eyebrow') }}</span>
      </div>

      <h1 class="text-6xl md:text-9xl font-black tracking-tighter text-zinc-900 dark:text-white animate-fade-in-up delay-200">
        REPPY<span class="text-primary-500">.</span>
      </h1>
      
      <p class="max-w-2xl text-xl md:text-2xl text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed animate-fade-in-up delay-300">
        {{ i18n.t('hero_subtitle') }}
      </p>

      <div class="flex items-center gap-4 animate-fade-in-up delay-500">
        <button 
          @click="$emit('start')"
          class="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-zinc-900 dark:text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_20px_40px_-10px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95"
        >
          {{ authStore.isAuthenticated ? i18n.t('nav_go_dashboard') : i18n.t('btn_start') }}
        </button>
      </div>
    </section>

    <!-- Features Bento Grid -->
    <section class="max-w-6xl w-full px-4 py-12 md:py-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      <div class="glass p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] space-y-6 group hover:translate-y-[-8px] transition-all duration-500">
        <div class="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
          <Activity class="w-8 h-8" />
        </div>
        <h3 class="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{{ i18n.t('feat_heatmap_title') }}</h3>
        <p class="text-zinc-400 dark:text-zinc-500 font-medium">{{ i18n.t('feat_heatmap_desc') }}</p>
      </div>

      <div class="glass p-8 rounded-[3rem] space-y-6 group hover:translate-y-[-8px] transition-all duration-500">
        <div class="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
          <Trophy class="w-8 h-8" />
        </div>
        <h3 class="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{{ i18n.t('feat_leaderboard_title') }}</h3>
        <p class="text-zinc-400 dark:text-zinc-500 font-medium">{{ i18n.t('feat_leaderboard_desc') }}</p>
      </div>

      <div class="glass p-8 rounded-[3rem] space-y-6 group hover:translate-y-[-8px] transition-all duration-500">
        <div class="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
          <Users class="w-8 h-8" />
        </div>
        <h3 class="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{{ i18n.t('feat_social_title') }}</h3>
        <p class="text-zinc-400 dark:text-zinc-500 font-medium">{{ i18n.t('feat_social_desc') }}</p>
      </div>
    </section>
    
    <!-- Global Hall of Fame -->
    <section class="max-w-4xl w-full px-4 py-24 space-y-12">
      <div class="text-center space-y-4">
        <h2 class="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">{{ i18n.t('landing_lb_title') }}</h2>
        <p class="text-zinc-400 dark:text-zinc-500 font-medium">{{ i18n.t('landing_lb_subtitle') }}</p>
      </div>
      
      <div class="animate-fade-in-up delay-700">
        <Leaderboard />
      </div>
      
      <div class="text-center">
        <button 
          @click="$emit('start')"
          class="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] hover:text-primary-400 transition-colors"
        >
          {{ authStore.isAuthenticated ? i18n.t('nav_go_dashboard') : i18n.t('btn_start') }} &rarr;
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="w-full py-16 border-t border-zinc-200 dark:border-white/5 text-center space-y-4">
      <div class="flex justify-center gap-6 text-zinc-600">
        <span class="text-[10px] font-black uppercase tracking-[0.5em]">2026 REPPY CORE</span>
        <span class="text-[10px] font-black uppercase tracking-[0.5em]">SYSTEM ONLINE</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { Sparkles, Activity, Trophy, Users } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useAuthStore } from '../stores/auth';
import Leaderboard from './Leaderboard.vue';

const i18n = useI18nStore();
const authStore = useAuthStore();
defineEmits(['start']);

const hasActiveEvent = ref(false);
const activeBoss = ref(null);

onMounted(async () => {
  try {
    const res = await axios.get('/api/boss/active');
    if (res.data && res.data.boss) {
      hasActiveEvent.value = true;
      activeBoss.value = res.data.boss;
    }
  } catch (e) {
    console.error('Error fetching boss for landing:', e);
  }
});
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 1s ease-out forwards;
  opacity: 0;
}
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-500 { animation-delay: 500ms; }
.delay-1000 { animation-delay: 1000ms; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes bounceShort {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}
.animate-bounce-short {
  animation: bounceShort 1s;
  animation-iteration-count: 3;
}
</style>

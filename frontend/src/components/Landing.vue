<template>
  <div class="min-h-screen flex flex-col items-center">
    <!-- Hero Section -->
    <section class="relative w-full py-32 px-4 flex flex-col items-center text-center space-y-8 overflow-hidden">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary-600 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div class="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4 border-white/10 animate-fade-in-up">
        <Sparkles class="w-4 h-4 text-primary-400" />
        <span class="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">{{ i18n.t('hero_eyebrow') }}</span>
      </div>

      <h1 class="text-7xl md:text-9xl font-black tracking-tighter text-white animate-fade-in-up delay-200">
        REPPY<span class="text-primary-500">.</span>
      </h1>
      
      <p class="max-w-2xl text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed animate-fade-in-up delay-300">
        {{ i18n.t('hero_subtitle') }}
      </p>

      <div class="flex items-center gap-4 animate-fade-in-up delay-500">
        <button 
          @click="$emit('start')"
          class="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_20px_40px_-10px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95"
        >
          {{ i18n.t('btn_start') }}
        </button>
      </div>
    </section>

    <!-- Features Bento Grid -->
    <section class="max-w-6xl w-full px-4 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="glass p-8 rounded-[3rem] space-y-6 group hover:translate-y-[-8px] transition-all duration-500">
        <div class="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
          <Activity class="w-8 h-8" />
        </div>
        <h3 class="text-2xl font-black text-white tracking-tight">{{ i18n.t('feat_heatmap_title') }}</h3>
        <p class="text-zinc-500 font-medium">{{ i18n.t('feat_heatmap_desc') }}</p>
      </div>

      <div class="glass p-8 rounded-[3rem] space-y-6 group hover:translate-y-[-8px] transition-all duration-500">
        <div class="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
          <Trophy class="w-8 h-8" />
        </div>
        <h3 class="text-2xl font-black text-white tracking-tight">{{ i18n.t('feat_leaderboard_title') }}</h3>
        <p class="text-zinc-500 font-medium">{{ i18n.t('feat_leaderboard_desc') }}</p>
      </div>

      <div class="glass p-8 rounded-[3rem] space-y-6 group hover:translate-y-[-8px] transition-all duration-500">
        <div class="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
          <Users class="w-8 h-8" />
        </div>
        <h3 class="text-2xl font-black text-white tracking-tight">{{ i18n.t('feat_social_title') }}</h3>
        <p class="text-zinc-500 font-medium">{{ i18n.t('feat_social_desc') }}</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="w-full py-16 border-t border-white/5 text-center space-y-4">
      <div class="flex justify-center gap-6 text-zinc-600">
        <span class="text-[10px] font-black uppercase tracking-[0.5em]">2026 REPPY CORE</span>
        <span class="text-[10px] font-black uppercase tracking-[0.5em]">SYSTEM ONLINE</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { Sparkles, Activity, Trophy, Users } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';

const i18n = useI18nStore();
defineEmits(['start']);
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
</style>

<template>
  <div class="min-h-screen flex flex-col items-center bg-deep-abyss selection:bg-primary-500 overflow-hidden">
    <!-- Hero Section -->
    <section class="relative w-full py-32 md:py-48 px-4 flex flex-col items-center text-center space-y-12">
      <!-- Background Ambient Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-40">
        <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div class="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-neon-lime/5 rounded-full blur-[150px] animate-pulse delay-1000"></div>
      </div>

      <!-- Active Boss Banner (Industrial Urgent) -->
      <div v-if="hasActiveEvent && activeBoss" class="w-full max-w-5xl bg-steel-grey/40 backdrop-blur-2xl border border-primary-500/30 p-8 rounded-3xl animate-in fade-in slide-in-from-top-10 duration-1000 shadow-[0_0_50px_rgba(255,69,0,0.1)] mb-12 relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-500/5 opacity-50"></div>
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-8 text-left">
           <div class="p-5 bg-primary-500/10 rounded-2xl border border-primary-500/20 animate-pulse">
              <Sword class="w-10 h-10 text-primary-500" />
           </div>
           <div class="flex-1">
              <h2 class="text-3xl md:text-5xl font-black text-industrial text-white italic tracking-tighter uppercase leading-none mb-3">
                {{ activeBoss.name }} <span class="text-primary-500">DETECTED</span>
              </h2>
              <p class="text-zinc-500 font-bold text-sm md:text-lg uppercase tracking-widest max-w-2xl">{{ activeBoss.description }}</p>
           </div>
           <button @click="$emit('start')" class="btn-reppy !px-12 !py-5 shadow-2xl group-hover:scale-105 transition-transform">
             JOIN THE HUNT
           </button>
        </div>
      </div>

      <!-- Branding Eyebrow -->
      <div class="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/5 rounded-full mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div class="w-2 h-2 rounded-full bg-primary-500 animate-ping"></div>
        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">{{ i18n.t('hero_eyebrow') }}</span>
      </div>

      <!-- Massive Industrial Logo -->
      <h1 class="text-8xl md:text-[14rem] font-black text-industrial tracking-tighter text-white leading-none animate-in zoom-in duration-1000">
        REPPY<span class="text-primary-500">.</span>
      </h1>
      
      <p class="max-w-3xl text-xl md:text-3xl text-zinc-500 font-bold uppercase tracking-tight leading-snug animate-in fade-in duration-1000 delay-300">
        {{ i18n.t('hero_subtitle') }}
      </p>

      <!-- Primary Action -->
      <div class="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
        <button 
          @click="$emit('start')"
          class="btn-reppy !text-xl !px-16 !py-6 shadow-[0_30px_60px_-15px_rgba(255,69,0,0.4)]"
        >
          {{ authStore.isAuthenticated ? 'BACK TO DASHBOARD' : 'INITIATE PROTOCOL' }}
        </button>
        <span class="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">VERSION 2.0 // DEEP ABYSS CORE</span>
      </div>
    </section>

    <!-- Features Bento Grid (Industrial Modules) -->
    <section class="max-w-7xl w-full px-6 py-24 md:py-32 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="card-stats space-y-8 group hover:border-primary-500/30">
        <div class="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
          <Activity class="w-8 h-8" />
        </div>
        <div class="space-y-4">
          <h3 class="text-2xl font-black text-industrial text-white tracking-tight uppercase">{{ i18n.t('feat_heatmap_title') }}</h3>
          <p class="text-zinc-500 font-bold text-xs uppercase tracking-widest leading-relaxed">{{ i18n.t('feat_heatmap_desc') }}</p>
        </div>
        <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
           <div class="h-full bg-primary-500 w-2/3"></div>
        </div>
      </div>

      <div class="card-stats space-y-8 group hover:border-primary-500/30">
        <div class="w-16 h-16 bg-neon-lime/10 rounded-2xl flex items-center justify-center text-neon-lime group-hover:scale-110 transition-transform">
          <Trophy class="w-8 h-8" />
        </div>
        <div class="space-y-4">
          <h3 class="text-2xl font-black text-industrial text-white tracking-tight uppercase">{{ i18n.t('feat_leaderboard_title') }}</h3>
          <p class="text-zinc-500 font-bold text-xs uppercase tracking-widest leading-relaxed">{{ i18n.t('feat_leaderboard_desc') }}</p>
        </div>
        <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
           <div class="h-full bg-neon-lime w-1/2"></div>
        </div>
      </div>

      <div class="card-stats space-y-8 group hover:border-primary-500/30">
        <div class="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
          <Users class="w-8 h-8" />
        </div>
        <div class="space-y-4">
          <h3 class="text-2xl font-black text-industrial text-white tracking-tight uppercase">{{ i18n.t('feat_social_title') }}</h3>
          <p class="text-zinc-500 font-bold text-xs uppercase tracking-widest leading-relaxed">{{ i18n.t('feat_social_desc') }}</p>
        </div>
        <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
           <div class="h-full bg-blue-500 w-3/4"></div>
        </div>
      </div>
    </section>
    
    <!-- Global Hall of Fame -->
    <section class="max-w-5xl w-full px-6 py-24 md:py-48 space-y-16">
      <div class="text-center space-y-6">
        <h2 class="text-5xl md:text-7xl font-black text-industrial text-white tracking-tighter uppercase italic leading-none">COMMUNITY RANKINGS</h2>
        <p class="text-zinc-500 font-black uppercase tracking-[0.3em] text-xs">GLOBAL COMPETITION REAL-TIME FEED</p>
      </div>
      
      <div class="card-stats !p-0 overflow-hidden border-white/5">
         <div class="p-8 bg-white/5 border-b border-white/5">
            <span class="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em]">LIVE PROTOCOL STREAMING</span>
         </div>
         <Leaderboard />
      </div>
      
      <div class="text-center pt-8">
        <button 
          @click="$emit('start')"
          class="text-xs font-black text-primary-500 uppercase tracking-[0.5em] hover:text-white transition-all group"
        >
          INITIATE FULL VIEW <span class="inline-block group-hover:translate-x-2 transition-transform">&rarr;</span>
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="w-full py-24 border-t border-white/5 text-center space-y-8">
      <div class="flex flex-col md:flex-row justify-center items-center gap-10 text-zinc-700">
        <span class="text-[10px] font-black uppercase tracking-[0.6em]">REPPY CORE © 2026</span>
        <div class="w-1 h-1 bg-zinc-800 rounded-full hidden md:block"></div>
        <span class="text-[10px] font-black uppercase tracking-[0.6em]">DEEP ABYSS DEPLOYED</span>
        <div class="w-1 h-1 bg-zinc-800 rounded-full hidden md:block"></div>
        <span class="text-[10px] font-black uppercase tracking-[0.6em]">STATUS: OPTIMAL</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Activity, Trophy, Users, Sword } from 'lucide-vue-next';
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
    console.error('Landing sync error:', e);
  }
});
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.animate-in { animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>

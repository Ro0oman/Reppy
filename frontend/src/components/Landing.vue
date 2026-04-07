<template>
  <div class="min-h-screen flex flex-col items-center bg-deep-abyss selection:bg-primary-500 overflow-hidden">
    <!-- Hero Section -->
    <section class="relative w-full py-32 md:py-48 px-4 flex flex-col items-center text-center space-y-12">
      <!-- Background Ambient Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-40">
        <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div class="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-neon-lime/5 rounded-full blur-[150px] animate-pulse delay-1000"></div>
      </div>

      <!-- Active Boss Banner (Clean Elegant) -->
      <div v-if="hasActiveEvent && activeBoss" class="w-full max-w-5xl bg-surface/40 backdrop-blur-3xl border border-primary-500/20 p-10 rounded-[2.5rem] animate-in fade-in slide-in-from-top-10 duration-1000 shadow-xl mb-16 relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-r from-primary-500/[0.03] via-transparent to-primary-500/[0.03] opacity-50"></div>
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-10 text-left">
           <div class="p-5 bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/20">
              <Sword class="w-10 h-10 text-white" />
           </div>
           <div class="flex-1">
              <h2 class="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-none mb-3">
                {{ activeBoss.name }} <span class="text-primary-500">detectado</span>
              </h2>
              <p class="text-muted/60 font-medium text-sm md:text-lg tracking-tight max-w-2xl">{{ activeBoss.description }}</p>
           </div>
           <button @click="$emit('start')" class="btn-reppy !px-12 !py-5 shadow-xl transition-transform">
             Unirse a la caza
           </button>
        </div>
      </div>

      <!-- Branding Eyebrow -->
      <div class="inline-flex items-center gap-3 px-6 py-2 bg-surface border border-border/40 rounded-full mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-sm">
        <div class="w-2 h-2 rounded-full bg-primary-500 animate-ping"></div>
        <span class="text-[11px] font-bold tracking-widest text-muted/60 uppercase">{{ i18n.t('hero_eyebrow') }}</span>
      </div>

      <!-- Massive Clean Logo -->
      <h1 class="text-8xl md:text-[14rem] font-bold tracking-tight text-foreground leading-none animate-in fade-in duration-1000">
        REPPY<span class="text-primary-500">.</span>
      </h1>
      
      <p class="max-w-3xl text-xl md:text-3xl text-muted font-medium tracking-tight leading-snug animate-in fade-in duration-1000 delay-300">
        {{ i18n.t('hero_subtitle') }}
      </p>

      <!-- Primary Action -->
      <div class="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
        <button 
          @click="$emit('start')"
          class="btn-reppy !text-xl !px-16 !py-6 shadow-[0_20px_40px_rgba(var(--primary),0.2)]"
        >
          {{ authStore.isAuthenticated ? 'IR AL DASHBOARD' : 'COMENZAR AHORA' }}
        </button>
        <span class="text-[10px] font-bold text-muted/30 tracking-widest uppercase">Versión 2.0 // Lab Protocol</span>
      </div>
    </section>

    <!-- Features Bento Grid -->
    <section class="max-w-7xl w-full px-6 py-24 md:py-32 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="card-stats p-10 space-y-8 group transition-all duration-500 border-border/40 hover:bg-surface/60">
        <div class="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-500 shadow-sm shadow-primary-500/5">
          <Activity class="w-8 h-8" />
        </div>
        <div class="space-y-4">
          <h3 class="text-2xl font-bold text-foreground tracking-tight">{{ i18n.t('feat_heatmap_title') }}</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">{{ i18n.t('feat_heatmap_desc') }}</p>
        </div>
        <div class="h-1.5 w-full bg-surface-dark/10 rounded-full overflow-hidden">
           <div class="h-full bg-primary-500 w-2/3 shadow-[0_0_10px_rgba(var(--primary),0.3)]"></div>
        </div>
      </div>

      <div class="card-stats p-10 space-y-8 group transition-all duration-500 border-border/40 hover:bg-surface/60">
        <div class="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shadow-sm shadow-accent/5">
          <Trophy class="w-8 h-8" />
        </div>
        <div class="space-y-4">
          <h3 class="text-2xl font-bold text-foreground tracking-tight">{{ i18n.t('feat_leaderboard_title') }}</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">{{ i18n.t('feat_leaderboard_desc') }}</p>
        </div>
        <div class="h-1.5 w-full bg-surface-dark/10 rounded-full overflow-hidden">
           <div class="h-full bg-accent w-1/2 shadow-[0_0_10px_rgba(var(--accent),0.3)]"></div>
        </div>
      </div>

      <div class="card-stats p-10 space-y-8 group transition-all duration-500 border-border/40 hover:bg-surface/60">
        <div class="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm shadow-blue-500/5">
          <Users class="w-8 h-8" />
        </div>
        <div class="space-y-4">
          <h3 class="text-2xl font-bold text-foreground tracking-tight">{{ i18n.t('feat_social_title') }}</h3>
          <p class="text-muted/60 font-medium text-sm leading-relaxed">{{ i18n.t('feat_social_desc') }}</p>
        </div>
        <div class="h-1.5 w-full bg-surface-dark/10 rounded-full overflow-hidden">
           <div class="h-full bg-blue-500 w-3/4 shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
        </div>
      </div>
    </section>
    
    <!-- Global Hall of Fame -->
    <section class="max-w-5xl w-full px-6 py-24 md:py-48 space-y-16">
      <div class="text-center space-y-4">
        <h2 class="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-none">Clasificación Global</h2>
        <p class="text-muted/40 font-bold tracking-[0.2em] text-[11px] uppercase">Competición en tiempo real</p>
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
    <footer class="w-full py-24 border-t border-border/40 text-center space-y-8">
      <div class="flex flex-col md:flex-row justify-center items-center gap-10 text-muted/30">
        <span class="text-[11px] font-bold tracking-[0.4em] uppercase">REPPY © 2026</span>
        <div class="w-1 h-1 bg-border/40 rounded-full hidden md:block"></div>
        <span class="text-[11px] font-bold tracking-[0.4em] uppercase">Clean Protocol Active</span>
        <div class="w-1 h-1 bg-border/40 rounded-full hidden md:block"></div>
        <span class="text-[11px] font-bold tracking-[0.4em] uppercase">Status: Optimal</span>
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

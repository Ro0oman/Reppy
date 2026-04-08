<template>
  <div v-if="loading" class="animate-pulse bg-foreground/5 h-32 rounded-[2.5rem] mb-8 border border-border/20"></div>
  <div v-else-if="boss" class="glass p-8 md:p-12 rounded-[2.5rem] border border-border/40 relative overflow-hidden group transition-all duration-700 shadow-2xl">
    <!-- Ambient Background Glow -->
    <div class="absolute -right-20 -top-20 w-80 h-80 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary-500/10 transition-colors duration-1000"></div>
    <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-1000 delay-300"></div>

    <div class="flex flex-col md:flex-row items-center gap-10 relative z-10">
      <!-- Boss Image -->
      <div class="w-32 h-32 md:w-48 md:h-48 bg-background/50 rounded-[2rem] flex items-center justify-center border border-border/60 shadow-inner group-hover:scale-105 transition-transform duration-700 overflow-hidden">
        <img v-if="boss.image_url" :src="boss.image_url" :alt="boss.name" class="w-full h-full object-contain p-4 drop-shadow-2xl" />
        <span v-else class="text-6xl italic font-black text-foreground opacity-20">?</span>
      </div>
      
      <!-- Boss Identity (The "Lore") -->
      <div class="flex-1 text-center md:text-left space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full animate-in fade-in slide-in-from-left-4 duration-1000">
          <div class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping"></div>
          <span class="text-[9px] font-black uppercase tracking-[0.3em] text-primary-500">Boss Actual Activo</span>
        </div>
        
        <div class="text-xl md:text-4xl font-black italic tracking-tighter text-foreground uppercase italic leading-none drop-shadow-sm group-hover:text-primary-400 transition-colors duration-500">
          {{ boss.name }}
        </div>
        
        <p class="text-base md:text-l text-muted/80 font-medium max-w-2xl leading-relaxed italic opacity-90">
          "{{ boss.description }}"
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const boss = ref(null);
const loading = ref(true);
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 1 minute cache for landing teaser

const fetchBoss = async (force = false) => {
  const now = Date.now();
  if (!force && lastFetchTime && (now - lastFetchTime < CACHE_TTL) && boss.value) {
    return;
  }
  
  loading.value = true;
  try {
    const res = await axios.get('/api/boss/active');
    if (res.data && res.data.boss) {
      boss.value = res.data.boss;
      lastFetchTime = now;
    } else {
      boss.value = null;
    }
  } catch (error) {
    console.error('Error fetching boss for banner:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBoss);
</script>

<style scoped>
.glass {
  background: rgba(var(--color-surface), 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>

<template>
  <div v-if="loading" class="animate-pulse bg-foreground/5 h-24 rounded-3xl mb-8"></div>
  <div v-else-if="boss" class="space-y-4">
    <!-- Active Boss Card -->
    <div @click="authStore.isAuthenticated && (showHistory = true)" 
         class="glass p-5 rounded-[2rem] border border-border relative overflow-hidden group transition-all duration-500 shadow-xl cursor-pointer"
         :class="authStore.isAuthenticated ? 'hover:border-primary-500/50' : 'cursor-default'">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      <!-- History Icon Hint (Authenticated only) -->
      <div v-if="authStore.isAuthenticated" class="absolute top-4 right-4 text-muted/20 group-hover:text-primary-500 transition-colors">
          <History class="w-5 h-5" />
      </div>
       
      <div class="flex flex-col md:flex-row items-center gap-8 relative z-10 mb-8">
        <!-- Boss Image with glow -->
        <div class="relative group/img">
          <div class="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
          <div class="w-32 h-32 bg-surface rounded-[2rem] flex items-center justify-center border border-border shadow-2xl overflow-hidden transition-transform duration-500 relative z-10">
            <img v-if="boss.image_url" :src="boss.image_url" :alt="boss.name" class="w-full h-full object-cover" :class="isDefeated ? 'grayscale opacity-50' : ''" />
            <span v-else class="text-4xl italic font-black text-foreground">?</span>
          </div>
        </div>
        
        <div class="flex-1 text-center md:text-left space-y-4">
          <div class="flex flex-col md:flex-row md:items-end justify-between items-center gap-4">
            <div class="space-y-1">
              <div class="flex items-center justify-center md:justify-start gap-2">
                <span class="text-[7px] font-black uppercase tracking-[0.3em] text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-md">Sector Activo</span>
                <button @click="showHelp = true" class="w-4 h-4 rounded-full bg-muted/10 flex items-center justify-center text-foreground text-[10px] font-bold hover:bg-primary-500 hover:text-white transition-colors" title="Manual de Batalla">?</button>
                <button @click="showCodex = true" class="text-[7px] font-black uppercase tracking-[0.3em] text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1" title="Guía de Evolución RPG">
                   <span>📖</span> GUÍA RPG
                </button>
              </div>
              <h3 class="text-4xl font-black italic tracking-tighter text-foreground uppercase leading-none">{{ boss.name }}</h3>
              <p v-if="isDefeated" class="text-[8px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-widest w-fit mx-auto md:mx-0">Neutralizado</p>
            </div>

            <div class="text-center md:text-right">
              <div class="text-4xl font-black text-primary-500 tracking-tighter tabular-nums leading-none mb-1">{{ formatNumber(boss.current_hp) }}</div>
              <div class="text-[9px] text-muted font-black uppercase tracking-[0.2em] opacity-40">/ {{ formatNumber(boss.total_hp) }} PROTOCOL_HP</div>
            </div>
          </div>

          <div v-if="boss.active_phrase" class="animate-in fade-in slide-in-from-left-2 duration-700">
            <p class="text-primary-500 font-bold italic text-sm md:text-base border-l-2 border-primary-500 pl-4 py-0.5">
              "{{ boss.active_phrase }}"
            </p>
          </div>
        </div>
      </div>

      <!-- Progress & Stats Area -->
      <div class="space-y-6">
        <div class="relative">
          <div class="relative h-6 bg-background rounded-2xl overflow-hidden border border-border shadow-inner">
            <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-600 via-primary-500 to-amber-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(236,72,153,0.2)]" :style="{ width: `${hpPercentage}%` }"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-[8px] font-black text-white/50 uppercase tracking-[0.4em]">{{ Math.round(hpPercentage) }}% INTEGRIDAD</span>
            </div>
          </div>
        </div>

        <!-- Damage Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div v-if="authStore.isAuthenticated" class="p-3 bg-foreground/[0.02] border border-border rounded-2xl flex flex-col items-center justify-center gap-1">
             <span class="text-[7px] font-black text-muted uppercase tracking-widest">Tu Daño Total</span>
             <span class="text-sm font-black text-foreground">{{ personalDamage }} <span class="text-[8px] opacity-40">REPS</span></span>
          </div>
          <div v-if="authStore.isAuthenticated" class="p-3 bg-primary-500/[0.03] border border-primary-500/10 rounded-2xl flex flex-col items-center justify-center gap-1">
             <span class="text-[7px] font-black text-primary-500 uppercase tracking-widest">Daño Hoy</span>
             <span class="text-sm font-black text-primary-500">{{ dailyDamage }} <span class="text-[8px] opacity-40">🛡️</span></span>
          </div>
          <div v-if="topDamageDealer" class="p-3 bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl flex flex-col items-center justify-center gap-1">
             <span class="text-[7px] font-black text-amber-500 uppercase tracking-widest">TOP Daño</span>
             <span class="text-sm font-black text-foreground truncate w-full text-center px-2">
               {{ topDamageDealer.id === authStore.user?.id ? 'TÚ' : topDamageDealer.name }} 
               <span class="text-[8px] text-amber-500/50">({{ topDamageDealer.damage_dealt }})</span>
             </span>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between gap-4 pt-2">
          <div v-if="!isDefeated" class="hidden md:block">
             <p class="text-[9px] font-black uppercase tracking-[0.1em] text-muted opacity-40">
               REQ. <span class="text-primary-500">{{ formatNumber(boss.current_hp) }}</span> HP PARA CAÍDA
             </p>
          </div>

          <div v-if="isDefeated && authStore.isAuthenticated" class="w-full flex items-center justify-between gap-4">
            <template v-if="chestsClaimed < 1">
               <p class="text-[10px] font-black uppercase tracking-widest text-emerald-500 animate-pulse">PROTOCOL_CLEARED</p>
               <button @click="claim" :disabled="claiming" 
                class="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2">
                 <span class="text-xl">🎁</span> RECLAMAR
               </button>
            </template>
            <div v-else class="flex items-center justify-center w-full gap-2 text-muted font-black uppercase text-[9px] tracking-[0.2em] px-4 py-3 bg-foreground/[0.02] rounded-2xl border border-border/40">
              <Check class="w-4 h-4 text-emerald-500" />
              <span>RECOMPENSA_ADQUIRIDA</span>
            </div>
          </div>
          <div v-else-if="!authStore.isAuthenticated" class="w-full text-center text-[9px] font-black uppercase tracking-widest text-primary-500/60 bg-primary-500/5 p-3 rounded-2xl border border-primary-500/10">
             INICIA SESIÓN PARA PARTICIPAR EN EL PROTOCOLO
          </div>
          </div>
        </div>
      </div>

    <!-- Next Boss Preview (Authenticated only) -->
    <div v-if="nextBoss && authStore.isAuthenticated" class="glass p-5 rounded-3xl border border-dashed border-border opacity-60 hover:opacity-100 transition-opacity flex items-center justify-between group">
       <div class="flex items-center gap-4">
         <div class="w-10 h-10 bg-background rounded-lg flex items-center justify-center grayscale group-hover:grayscale-0 transition-all text-xs border border-border overflow-hidden">
            <img v-if="nextBoss.image_url" :src="nextBoss.image_url" :alt="`Próximo Boss: ${nextBoss.name}`" class="w-full h-full object-cover opacity-40 group-hover:opacity-100" />
            <span v-else class="text-foreground">?</span>
         </div>
         <div>
           <p class="text-[8px] font-black uppercase tracking-widest text-muted">Siguiente Desafío</p>
           <h4 class="text-sm font-bold text-muted group-hover:text-foreground transition-colors uppercase tracking-tight">{{ nextBoss.name }}</h4>
         </div>
       </div>
       <div class="text-[10px] font-black text-muted uppercase tracking-widest italic">Bloqueado 🔒</div>
    </div>

    <!-- Help Modal Overlay -->
    <div v-if="showHelp" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-fade-in" @click.self="showHelp = false">
      <div class="glass max-w-lg w-full p-8 rounded-[2.5rem] border border-border shadow-2xl space-y-6 relative animate-fade-in">
        <button @click="showHelp = false" class="absolute top-6 right-6 text-muted hover:text-foreground transition-colors text-2xl">&times;</button>
        
        <div class="space-y-2">
          <span class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Manual de Batalla</span>
          <h2 class="text-3xl font-black italic tracking-tighter text-foreground uppercase italic">Evento de la Comunidad</h2>
        </div>

        <div class="space-y-4">
          <div class="flex gap-4 items-start">
            <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 shrink-0 font-bold">1</div>
            <div>
              <p class="text-sm font-bold text-foreground uppercase tracking-tight">{{ i18nStore.t('battle_help_title1') }}</p>
              <p class="text-xs text-muted">{{ i18nStore.t('battle_help_desc1') }}</p>
            </div>
          </div>

          <div class="flex gap-4 items-start">
            <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 shrink-0 font-bold">2</div>
            <div>
              <p class="text-sm font-bold text-foreground uppercase tracking-tight">{{ i18nStore.t('battle_help_title2') }}</p>
              <p class="text-xs text-muted">{{ i18nStore.t('battle_help_desc2') }}</p>
            </div>
          </div>

          <div class="flex gap-4 items-start">
            <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 shrink-0 font-bold">3</div>
            <div>
              <p class="text-sm font-bold text-foreground uppercase tracking-tight">Cofre de Recompensa</p>
              <p class="text-xs text-muted">Al derrotar al boss, desbloqueas un cofre con un objeto de Temporada (o Normal) garantizado.</p>
            </div>
          </div>

          <div class="flex gap-4 items-start">
            <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 shrink-0 font-bold">4</div>
            <div>
              <p class="text-sm font-bold text-foreground uppercase tracking-tight">Ciclo Infinito</p>
              <p class="text-xs text-muted">Cuando un jefe cae, aparece el siguiente. Si derrotan a los 10, ¡el ciclo vuelve a empezar!</p>
            </div>
          </div>
        </div>

        <button @click="showHelp = false" class="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl">
          ¡Entendido!
        </button>
      </div>
    </div>
  </div>
  
  <!-- Boss History Modal -->
  <BossHistoryModal v-if="boss" :show="showHistory" :boss-id="boss.id" @close="showHistory = false" />

  <!-- RPG Info Modal (The Codex) -->
  <CodexModal :show="showCodex" @close="showCodex = false" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { History } from 'lucide-vue-next';
import { formatNumber } from '../utils/numberUtils';
import confetti from 'canvas-confetti';
import BossHistoryModal from './BossHistoryModal.vue';
import CodexModal from './CodexModal.vue';

const boss = ref(null);
const nextBoss = ref(null);
const loading = ref(true);
const claiming = ref(false);
const personalDamage = ref(0);
const dailyDamage = ref(0);
const chestsClaimed = ref(0);
const showHelp = ref(false);
const showHistory = ref(false);
const showCodex = ref(false);
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const topDamageDealer = ref(null);
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds

const fetchBoss = async (force = false) => {
  const now = Date.now();
  if (!force && lastFetchTime && (now - lastFetchTime < CACHE_TTL) && boss.value) {
    return;
  }

  try {
    const res = await axios.get('/api/boss/active');
    if (res.data && res.data.boss) {
      boss.value = res.data.boss;
      nextBoss.value = res.data.next_boss;
      personalDamage.value = res.data.personal_damage;
      dailyDamage.value = res.data.daily_damage || 0;
      chestsClaimed.value = res.data.chests_claimed;
      topDamageDealer.value = res.data.top_damage_dealer;
      lastFetchTime = now;
    } else {
      boss.value = null;
    }
  } catch (error) {
    console.error('Error fetching boss:', error);
  } finally {
    loading.value = false;
  }
};

const isDefeated = computed(() => {
  if (!boss.value) return false;
  return boss.value.current_hp <= 0 || boss.value.status === 'defeated';
});

const hpPercentage = computed(() => {
  if (!boss.value) return 0;
  return (boss.value.current_hp / boss.value.total_hp) * 100;
});

const claim = async () => {
  if (!isDefeated.value || claiming.value || chestsClaimed.value >= 1) return;
  claiming.value = true;
  try {
    const res = await axios.post(`/api/boss/claim-chest/${boss.value.id}`);
    chestsClaimed.value = 1;
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#fbbf24', '#ffffff']
    });

    notificationStore.notify(res.data.message || '¡Cofre enviado a tu inventario!', 'success');
    
    // Auto-refresh to see if next boss appeared
    setTimeout(() => {
      fetchBoss();
    }, 2000);

  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Error al reclamar cofre', 'error');
  } finally {
    claiming.value = false;
  }
};

onMounted(() => {
  fetchBoss();
});

defineExpose({ refresh: fetchBoss });
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}


@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}


</style>

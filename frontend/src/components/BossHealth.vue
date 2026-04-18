<template>
  <div v-if="loading" class="animate-pulse bg-surface/30 h-64 rounded-[2.5rem] mb-8 border border-white/5"></div>
  <div v-else-if="boss" class="space-y-6">
    
    <!-- Active Boss Card (Codex Style) -->
    <div @click="authStore.isAuthenticated && (showHistory = true)" 
         class="w-full bg-surface/30 border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(236,72,153,0.1)] relative overflow-hidden group transition-all duration-700 cursor-pointer"
         :class="authStore.isAuthenticated ? 'hover:border-primary-500/40 hover:shadow-[0_0_100px_rgba(236,72,153,0.2)]' : 'cursor-default'">
      
      <!-- Ambient Background Glow -->
      <div class="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-br from-primary-500/20 via-transparent to-transparent group-hover:opacity-40 transition-opacity duration-700"></div>
      
      <!-- History Icon Hint (Authenticated only) -->
      <div v-if="authStore.isAuthenticated" class="absolute top-6 right-6 text-white/20 group-hover:text-primary-500 transition-colors z-20" :title="i18nStore.t('battle_history') || 'Battle History'">
          <History class="w-6 h-6" />
      </div>
      
      <div class="relative z-10 p-5 md:p-7 flex flex-col justify-center">

        <!-- Top Status & Actions -->
        <div class="flex flex-wrap items-center gap-2 mb-5">
           <span class="px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-[8px] md:text-[9px] font-black tracking-[0.3em] uppercase backdrop-blur-sm">
              {{ i18nStore.t('boss_class_active') }}
           </span>
           <button @click.stop="showCodex = true" class="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[8px] md:text-[9px] font-black tracking-[0.3em] uppercase hover:bg-orange-500/20 hover:border-orange-500/40 transition-all backdrop-blur-sm flex items-center gap-1.5">
              <span>📖</span> {{ i18nStore.t('boss_how_damage') }}
           </button>
           <button @click.stop="showHelp = true" class="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 text-[10px] font-bold hover:bg-white hover:text-black transition-colors" :title="i18nStore.t('boss_battle_manual')">?</button>
           <span v-if="boss.weakness_stat" class="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] md:text-[9px] font-black tracking-[0.3em] uppercase backdrop-blur-sm flex items-center gap-1">
              <span>⚡</span> {{ i18nStore.t('boss_weakness') }}: {{ boss.weakness_stat }}
           </span>
        </div>

        <!-- Boss Info & Avatar -->
        <div class="flex flex-col md:flex-row gap-5 md:gap-6 items-center md:items-start mb-6">
           <!-- Portrait -->
           <div class="relative shrink-0 group/img">
              <div class="absolute inset-0 bg-primary-500/30 blur-[40px] rounded-full opacity-60 group-hover/img:opacity-100 transition-opacity duration-700"></div>
              <div class="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] border border-white/10 bg-black/40 shadow-2xl overflow-hidden relative z-10">
                 <img v-if="boss.image_url" :src="boss.image_url" :alt="boss.name" class="w-full h-full object-cover transition-all duration-700" :class="isDefeated ? 'grayscale opacity-30 mix-blend-luminosity' : 'group-hover/img:scale-105 saturate-150'" />
                 <span v-else class="text-6xl font-black italic text-white/20 absolute inset-0 flex items-center justify-center">?</span>
              </div>
           </div>

           <!-- Name & Quote -->
           <div class="flex-1 text-center md:text-left space-y-3 mt-2 md:mt-0">
              <h3 class="text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-2xl">
                 {{ boss.name }}
              </h3>
              <p v-if="boss.active_phrase && !isDefeated" class="text-primary-500 font-medium italic text-xs md:text-sm pl-3 border-l-2 border-primary-500">
                "{{ boss.active_phrase }}"
              </p>
              <div v-if="isDefeated" class="inline-block mt-4">
                 <span class="px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Check class="w-3 h-3" /> {{ i18nStore.t('boss_protocol_complete') }}
                 </span>
              </div>
           </div>
        </div>

        <!-- Cinematic Health Bar -->
        <div class="w-full relative mb-6">
           <div class="flex justify-between items-end mb-2">
              <span class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/50">{{ i18nStore.t('boss_target_integrity') }}</span>
              <div class="text-right">
                 <span class="text-2xl md:text-3xl font-black text-white leading-none tracking-tighter shadow-black drop-shadow-md">{{ formatNumber(boss.current_hp) }}</span>
                 <span class="text-[10px] md:text-xs font-black text-primary-500/70 ml-2 tracking-widest">/ {{ formatNumber(boss.total_hp) }} HP</span>
              </div>
           </div>
           
           <div class="h-6 md:h-8 rounded-[1rem] bg-black/60 border border-white/10 p-1 md:p-1.5 relative overflow-hidden shadow-inner">
              <!-- Glow -->
              <div class="absolute inset-0 bg-primary-500/30 blur-[20px] transition-all duration-1000" :style="{ width: `${hpPercentage}%` }"></div>
              
              <!-- Actual Bar -->
              <div class="h-full rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-amber-400 relative overflow-hidden transition-all duration-1000 ease-out" 
                   :style="{ width: `${hpPercentage}%` }"
                   :class="hpPercentage === 0 ? 'opacity-0' : 'opacity-100'">
                 <!-- Shimmer Effect -->
                 <div class="absolute inset-0 w-[200%] animate-shimmer bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)]"></div>
              </div>
              
              <!-- Placeholder if empty -->
              <div v-if="hpPercentage === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span class="text-[8px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{{ i18nStore.t('boss_neutralized') }}</span>
              </div>
           </div>
        </div>

        <!-- Damage Stats (Premium HUD Modules) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3" v-if="authStore.isAuthenticated">
           
           <!-- Tu Daño Total -->
           <div class="relative p-4 md:p-5 rounded-[1.5rem] bg-black/40 border border-white/5 overflow-hidden group/card hover:border-primary-500/30 transition-all duration-500">
              <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
              <div class="relative z-10">
                 <span class="text-[7px] md:text-[8px] font-black tracking-[0.3em] uppercase text-white/40 block mb-1">{{ i18nStore.t('boss_hist_damage') }}</span>
                 <div class="text-2xl md:text-3xl font-black text-white tracking-tighter">{{ formatNumber(personalDamage) }}<span class="text-[10px] font-bold text-primary-500/60 ml-1 tracking-widest">DMG</span></div>
              </div>
           </div>

           <!-- Daño Hoy -->
           <div class="relative p-4 md:p-5 rounded-[1.5rem] bg-black/40 border border-white/5 overflow-hidden group/card hover:border-emerald-500/30 transition-all duration-500">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
              <div class="relative z-10 flex flex-col justify-between h-full">
                 <span class="text-[7px] md:text-[8px] font-black tracking-[0.3em] uppercase text-white/40 block mb-1">{{ i18nStore.t('boss_today_damage') }}</span>
                 <div class="flex items-end gap-1.5">
                    <div class="text-2xl md:text-3xl font-black text-emerald-400 tracking-tighter">{{ formatNumber(dailyDamage) }}</div>
                    <span class="text-[10px] font-bold text-emerald-500/50 mb-1 tracking-widest">DMG</span>
                 </div>
              </div>
           </div>

           <!-- Top Daño -->
           <div v-if="topDamageDealer" class="relative p-4 md:p-5 rounded-[1.5rem] bg-black/40 border border-white/5 overflow-hidden group/card hover:border-amber-500/30 transition-all duration-500 flex flex-col">
              <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
              <div class="relative z-10 flex-1 flex flex-col justify-between">
                 <span class="text-[7px] md:text-[8px] font-black tracking-[0.3em] uppercase text-white/40 block mb-1">{{ i18nStore.t('boss_domination') }}</span>
                 <div>
                        {{ topDamageDealer.id === authStore.user?.id ? i18nStore.t('lb_you') : topDamageDealer.name }}
                    <div class="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">{{ formatNumber(topDamageDealer.damage_dealt) }} DMG</div>
                 </div>
              </div>
           </div>
           
        </div>

        <!-- Footer Call To Action -->
        <div class="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6">
          <div v-if="!isDefeated" class="hidden md:block">
             <p class="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
               {{ i18nStore.t('boss_req_damage') }} <span class="text-primary-500">{{ formatNumber(boss.current_hp) }} HP</span>
             </p>
          </div>

          <div v-if="isDefeated && authStore.isAuthenticated" class="w-full flex items-center justify-center md:justify-end gap-4">
            <template v-if="chestsClaimed < 1">
               <button @click.stop="claim" :disabled="claiming" 
                class="w-full md:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3 text-sm md:text-base">
                 <span class="text-xl">🎁</span> {{ i18nStore.t('boss_claim_loot') }}
               </button>
            </template>
            <div v-else class="w-full md:w-auto flex items-center justify-center gap-3 text-white/30 font-black uppercase text-[10px] tracking-[0.2em] px-8 py-4 bg-black/40 rounded-2xl border border-white/5">
              <Check class="w-4 h-4 text-emerald-500/50" />
              <span>{{ i18nStore.t('boss_reward_acquired') }}</span>
            </div>
          </div>
          
          <div v-else-if="!authStore.isAuthenticated" class="w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-primary-500/80 bg-primary-500/10 p-4 rounded-[1.5rem] border border-primary-500/20 backdrop-blur-md">
             {{ i18nStore.t('boss_login_to_damage') }}
          </div>
        </div>

      </div>
    </div>

    <!-- Next Boss Preview (Authenticated only) -->
    <div v-if="nextBoss && authStore.isAuthenticated" class="w-full bg-surface/10 p-5 md:p-6 rounded-[2rem] border border-dashed border-white/10 opacity-70 hover:opacity-100 transition-opacity flex items-center justify-between group">
       <div class="flex items-center gap-4 md:gap-6">
         <div class="w-12 h-12 md:w-16 md:h-16 bg-black/60 rounded-[1.5rem] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all border border-white/5 overflow-hidden">
            <img v-if="nextBoss.image_url" :src="nextBoss.image_url" :alt="`Próximo Boss: ${nextBoss.name}`" class="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
            <span v-else class="text-white/30 font-black italic text-xl">?</span>
         </div>
         <div>
           <p class="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">{{ i18nStore.t('boss_next_protocol') }}</p>
           <h4 class="text-sm md:text-lg font-bold text-white/60 group-hover:text-white transition-colors uppercase tracking-tight italic">{{ nextBoss.name }}</h4>
         </div>
       </div>
       <div class="text-[9px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{{ i18nStore.t('boss_locked') }}</div>
    </div>

    <!-- Help Modal Overlay -->
    <div v-if="showHelp" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500" @click.self="showHelp = false">
      <div class="w-full max-w-2xl bg-surface/30 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative p-8 md:p-12 animate-in slide-in-from-bottom-8 duration-700 select-none overflow-hidden">
        
        <div class="absolute -top-32 -right-32 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <button @click="showHelp = false" class="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/50 hover:text-white transition-all">
          <XIcon class="w-5 h-5" />
        </button>
        
        <div class="mb-10 relative z-10">
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 bg-primary-500/10 px-3 py-1.5 rounded-full border border-primary-500/20">{{ i18nStore.t('boss_op_manual') }}</span>
          <h2 class="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic mt-6 leading-none">{{ i18nStore.t('boss_community_event') }}<span class="text-primary-500">.</span></h2>
        </div>

        <div class="space-y-6 relative z-10">
          <div class="p-6 rounded-[1.5rem] bg-black/40 border border-white/5 flex gap-5 items-start">
            <div class="w-10 h-10 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-500 shrink-0 font-black text-lg">1</div>
            <div>
              <p class="text-sm font-black text-white uppercase tracking-widest mb-1">{{ i18nStore.t('battle_help_title1') }}</p>
              <p class="text-xs text-white/50 leading-relaxed font-medium">{{ i18nStore.t('battle_help_desc1') }}</p>
            </div>
          </div>

          <div class="p-6 rounded-[1.5rem] bg-black/40 border border-white/5 flex gap-5 items-start">
            <div class="w-10 h-10 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-500 shrink-0 font-black text-lg">2</div>
            <div>
              <p class="text-sm font-black text-white uppercase tracking-widest mb-1">{{ i18nStore.t('battle_help_title2') }}</p>
              <p class="text-xs text-white/50 leading-relaxed font-medium">{{ i18nStore.t('battle_help_desc2') }}</p>
            </div>
          </div>

          <div class="p-6 rounded-[1.5rem] bg-black/40 border border-white/5 flex gap-5 items-start">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0 font-black text-lg text-[20px]">🎁</div>
            <div>
              <p class="text-sm font-black text-emerald-500 uppercase tracking-widest mb-1">{{ i18nStore.t('boss_reward_chest') }}</p>
              <p class="text-xs text-white/50 leading-relaxed font-medium">{{ i18nStore.t('boss_reward_desc') }}</p>
            </div>
          </div>
        </div>

        <button @click="showHelp = false" class="w-full mt-10 p-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl transition-all relative z-10 flex items-center justify-center gap-2">
          {{ i18nStore.t('boss_close_manual') }}
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
import { useI18nStore } from '../stores/i18n';
import { History, Check, X as XIcon } from 'lucide-vue-next';
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
const i18nStore = useI18nStore();
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
  return Math.max(0, (boss.value.current_hp / boss.value.total_hp) * 100);
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
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
}
</style>

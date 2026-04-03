<template>
  <div v-if="loading" class="animate-pulse bg-white/5 h-24 rounded-3xl mb-8"></div>
  <div v-else-if="boss" class="space-y-6 mb-8">
    <!-- Active Boss Card -->
    <div class="glass p-6 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 relative overflow-hidden group transition-all duration-500 shadow-xl">
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div class="flex flex-col md:flex-row items-center gap-6 relative z-10 mb-8">
        <div class="w-32 h-32 bg-white dark:bg-zinc-900 rounded-[2rem] flex items-center justify-center border-2 border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
          <img v-if="boss.image_url" :src="boss.image_url" class="w-full h-full object-contain p-2" :class="isDefeated ? 'grayscale opacity-50' : ''" />
          <span v-else class="text-4xl italic font-black">?</span>
        </div>
        
        <div class="flex-1 text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span class="text-[8px] font-black uppercase tracking-[0.3em] text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-md">Evento de la Comunidad</span>
            <button @click="showHelp = true" class="w-4 h-4 rounded-full bg-zinc-200 dark:bg-white/10 flex items-center justify-center text-white text-[10px] font-bold hover:bg-primary-500 hover:text-white transition-colors">?</button>
          </div>
          <div class="flex flex-col md:flex-row md:items-baseline gap-2 mb-2">
            <h3 class="text-3xl font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">{{ boss.name }}</h3>
            <span v-if="isDefeated" class="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-widest w-fit mx-auto md:mx-0">Derrotado</span>
          </div>
          <p class="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-xl">{{ boss.description }}</p>
        </div>

        <div class="text-center md:text-right">
          <div class="text-3xl font-black text-primary-500 tracking-tighter tabular-nums">{{ boss.current_hp.toLocaleString() }}</div>
          <div class="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest">/ {{ boss.total_hp.toLocaleString() }} HP</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="space-y-4">
        <div class="relative h-4 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200 dark:border-white/5 shadow-inner">
          <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-600 via-primary-400 to-amber-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(236,72,153,0.3)]" :style="{ width: `${hpPercentage}%` }"></div>
        </div>

        <div v-if="!isDefeated" class="text-center">
           <p class="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">
             Faltan <span class="text-primary-500">{{ boss.current_hp.toLocaleString() }}</span> de daño total para desbloquear el cofre 🎁
           </p>
        </div>

        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex flex-col sm:flex-row items-center gap-2 md:gap-4 mt-2 md:mt-0">
             <div class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                <p class="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">Total: <span class="text-zinc-900 dark:text-white">{{ personalDamage }} reps</span></p>
             </div>
             <div class="flex items-center gap-2 bg-primary-500/5 px-2 py-1 rounded-lg border border-primary-500/10" :class="dailyDamage >= 100 ? 'border-amber-500/30 bg-amber-500/5' : ''">
                <p class="text-[9px] font-black uppercase tracking-[0.2em]" :class="dailyDamage >= 100 ? 'text-amber-500' : 'text-primary-500'">
                  Día: {{ dailyDamage }} / 100 🛡️
                </p>
             </div>
          </div>

          <!-- Sequential Reward Logic -->
          <div v-if="isDefeated" class="flex items-center gap-4">
            <template v-if="chestsClaimed < 1">
               <p class="text-[10px] font-black uppercase tracking-widest text-emerald-500 animate-bounce">¡Boss derrotado! Reclama tu recompensa</p>
               <button @click="claim" :disabled="claiming" 
                class="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 flex items-center gap-2">
                 <span class="text-xl">🎁</span> Abrir Cofre
               </button>
            </template>
            <div v-else class="flex items-center gap-2 text-zinc-400 font-black uppercase text-[10px] tracking-widest px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <span>✅ Recompensa Reclamada</span>
            </div>
          </div>
          <div v-else class="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-white/5 px-4 py-2 rounded-xl">
             Continúa entrenando para derrotarlo
          </div>
        </div>
      </div>
    </div>

    <!-- Next Boss Preview -->
    <div v-if="nextBoss" class="glass p-5 rounded-3xl border border-dashed border-zinc-300 dark:border-white/10 opacity-60 hover:opacity-100 transition-opacity flex items-center justify-between group">
       <div class="flex items-center gap-4">
         <div class="w-12 h-12 bg-zinc-200 dark:bg-black rounded-xl p-1 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
            <img :src="nextBoss.image_url" class="w-full h-full object-contain opacity-50 group-hover:opacity-100" />
         </div>
         <div>
           <p class="text-[8px] font-black uppercase tracking-widest text-zinc-400">Siguiente Desafío</p>
           <h4 class="text-sm font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-tight">{{ nextBoss.name }}</h4>
         </div>
       </div>
       <div class="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Bloqueado 🔒</div>
    </div>

    <!-- Help Modal Overlay -->
    <div v-if="showHelp" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" @click.self="showHelp = false">
      <div class="glass max-w-lg w-full p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6 relative animate-scale-in">
        <button @click="showHelp = false" class="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors text-2xl">&times;</button>
        
        <div class="space-y-2">
          <span class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Manual de Batalla</span>
          <h2 class="text-3xl font-black italic tracking-tighter text-white uppercase italic">Evento de la Comunidad</h2>
        </div>

        <div class="space-y-4">
          <div class="flex gap-4 items-start">
            <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 shrink-0 font-bold">1</div>
            <div>
              <p class="text-sm font-bold text-white uppercase tracking-tight">Ataca con esfuerzo</p>
              <p class="text-xs text-zinc-400">Cada repetición que registras resta 1 HP al boss global. ¡Todo cuenta!</p>
            </div>
          </div>

          <div class="flex gap-4 items-start">
            <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 shrink-0 font-bold">2</div>
            <div>
              <p class="text-sm font-bold text-white uppercase tracking-tight">Límite de Daño Diario</p>
              <p class="text-xs text-zinc-400">Existe un límite de 100 de daño al día por usuario para que todos puedan participar.</p>
            </div>
          </div>

          <div class="flex gap-4 items-start">
            <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 shrink-0 font-bold">3</div>
            <div>
              <p class="text-sm font-bold text-white uppercase tracking-tight">Cofre de Recompensa</p>
              <p class="text-xs text-zinc-400">Al derrotar al boss, desbloqueas un cofre con un objeto de Temporada (o Normal) garantizado.</p>
            </div>
          </div>

          <div class="flex gap-4 items-start">
            <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 shrink-0 font-bold">4</div>
            <div>
              <p class="text-sm font-bold text-white uppercase tracking-tight">Ciclo Infinito</p>
              <p class="text-xs text-zinc-400">Cuando un jefe cae, aparece el siguiente. Si derrotan a los 10, ¡el ciclo vuelve a empezar!</p>
            </div>
          </div>
        </div>

        <button @click="showHelp = false" class="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95">
          ¡Entendido!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useNotificationStore } from '../stores/notification';
import confetti from 'canvas-confetti';

const boss = ref(null);
const nextBoss = ref(null);
const loading = ref(true);
const claiming = ref(false);
const personalDamage = ref(0);
const dailyDamage = ref(0);
const chestsClaimed = ref(0);
const showHelp = ref(false);
const notificationStore = useNotificationStore();

const fetchBoss = async () => {
  try {
    const res = await axios.get('/api/boss/active');
    if (res.data && res.data.boss) {
      boss.value = res.data.boss;
      nextBoss.value = res.data.next_boss;
      personalDamage.value = res.data.personal_damage;
      dailyDamage.value = res.data.daily_damage || 0;
      chestsClaimed.value = res.data.chests_claimed;
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
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#facc15']
    });

    notificationStore.notify(res.data.message, 'success');
    
    // Refresh to see if we moved to the next boss
    setTimeout(() => {
      fetchBoss();
    }, 3000);

  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Error al abrir cofre', 'error');
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
.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>

<template>
  <div v-if="loading" class="animate-pulse bg-white/5 h-24 rounded-3xl mb-8"></div>
  <div v-else-if="boss" class="glass p-5 rounded-3xl mb-8 border border-zinc-200 dark:border-white/5 relative overflow-hidden group flex flex-col justify-center transition-all duration-500">
    <!-- Subtle glow based on status -->
    <div v-if="hasStarted" class="absolute -right-20 -top-20 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"></div>
    <div v-else class="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

    <div class="flex items-center justify-between mb-4 relative z-10" :class="!hasStarted ? 'opacity-40 grayscale pointer-events-none' : ''">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-white/10 shadow-xl overflow-hidden">
          <img v-if="boss.image_url" :src="boss.image_url" class="w-full h-full object-contain p-1" />
          <span v-else class="text-2xl italic font-black">?</span>
        </div>
        <div>
          <h3 class="text-xl font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase">{{ boss.name }}</h3>
          <p class="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{{ boss.description }}</p>
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-pink-500 tracking-tighter">{{ boss.current_hp.toLocaleString() }} <span class="text-sm text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">/ {{ boss.total_hp.toLocaleString() }} HP</span></div>
        <button v-if="hasStarted" @click="shareEvent" class="mt-2 text-[10px] font-black uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors bg-primary-500/5 px-3 py-1.5 rounded-lg border border-primary-500/10">
          Reclutar Ayuda 🔗
        </button>
      </div>
    </div>

    <!-- Main Boss Progress -->
    <div class="relative" :class="!hasStarted ? 'opacity-20 grayscale pointer-events-none' : ''">
      <div class="relative h-6 bg-white dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200 dark:border-white/5 mb-3">
        <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 via-pink-500 to-amber-500 transition-all duration-1000 ease-out" :style="{ width: `${hpPercentage}%` }"></div>
        <div class="absolute inset-0 flex items-center justify-around pointer-events-none px-4">
          <div class="w-px h-full bg-white/20"></div>
          <div class="w-px h-full bg-white/20"></div>
        </div>
      </div>

      <div class="flex items-center justify-between relative z-10">
        <p class="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Próximo cofre: <span class="text-pink-500">{{ repsToNextChest }} reps</span></p>
        <div class="flex items-center gap-2">
          <button v-for="i in 3" :key="i" @click="claim(i)"
            class="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all border"
            :class="getChestClass(i)" :disabled="!canClaim(i) || claiming">
            {{ hasClaimed(i) ? '✅' : '🎁' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Global Countdown Overlay for Upcoming Bosses -->
    <div v-if="!hasStarted" class="absolute inset-0 z-30 flex items-center justify-center p-6 bg-zinc-50/10 dark:bg-black/10 backdrop-blur-[2px]">
      <div class="bg-white/95 dark:bg-zinc-950/95 p-6 rounded-[2rem] border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center gap-6 max-w-lg w-full transform hover:scale-[1.02] transition-transform">
        <div class="relative shrink-0">
          <div class="w-20 h-20 bg-zinc-100 dark:bg-black rounded-3xl flex items-center justify-center border-2 border-primary-500/20">
             <span class="text-4xl animate-pulse">🔒</span>
          </div>
        </div>
        <div class="flex-1 text-center sm:text-left">
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 mb-1">Próximo Evento Global</p>
          <h3 class="text-xl font-black text-black dark:text-white uppercase italic tracking-tighter">{{ boss.name }}</h3>
          <div class="mt-3 flex items-center justify-center sm:justify-start gap-4">
            <div class="px-4 py-2 bg-black dark:bg-white/5 rounded-xl border border-white/10">
              <p class="text-lg font-mono font-black text-primary-500 tracking-tighter">{{ timeToStart }}</p>
            </div>
            <p class="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">Días, Horas, Min, Seg<br>para el despliegue.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useNotificationStore } from '../stores/notification';

import confetti from 'canvas-confetti';

const boss = ref(null);
const loading = ref(true);
const claiming = ref(false);
const personalDamage = ref(0);
const chestsClaimed = ref(0);
const currentTime = ref(new Date());
const notificationStore = useNotificationStore();

let timerInterval = null;

const fetchBoss = async () => {
  try {
    const res = await axios.get('/api/boss/active');
    if (res.data && res.data.boss) {
      boss.value = res.data.boss;
      personalDamage.value = res.data.personal_damage;
      chestsClaimed.value = res.data.chests_claimed;
    } else {
      boss.value = null; // No active or upcoming boss
    }
  } catch (error) {
    console.error('Error fetching boss:', error);
  } finally {
    loading.value = false;
  }
};

const hasStarted = computed(() => {
  if (!boss.value) return false;
  return currentTime.value >= new Date(boss.value.start_date);
});

const timeToStart = computed(() => {
  if (!boss.value || hasStarted.value) return '';
  const diff = new Date(boss.value.start_date) - currentTime.value;
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
  const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
  const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
  return `${d}D ${h}:${m}:${s}`;
});

const hpPercentage = computed(() => {
  if (!boss.value) return 0;
  return (boss.value.current_hp / boss.value.total_hp) * 100;
});

const damagePercentage = computed(() => {
  if (!boss.value) return 0;
  return ((boss.value.total_hp - boss.value.current_hp) / boss.value.total_hp) * 100;
});

const unlockedChests = computed(() => {
  if (damagePercentage.value >= 100) return 3;
  if (damagePercentage.value >= 66.6) return 2;
  if (damagePercentage.value >= 33.3) return 1;
  return 0;
});

const repsToNextChest = computed(() => {
  if (!boss.value) return 0;
  if (unlockedChests.value === 3) return 0;
  
  let targetPercentage = 33.3;
  if (unlockedChests.value === 1) targetPercentage = 66.6;
  if (unlockedChests.value === 2) targetPercentage = 100;

  const targetDamage = boss.value.total_hp * (targetPercentage / 100);
  const currentDamage = boss.value.total_hp - boss.value.current_hp;
  return Math.ceil(Math.max(0, targetDamage - currentDamage));
});

const hasClaimed = (chestIndex) => {
  return chestsClaimed.value >= chestIndex;
};

const canClaim = (chestIndex) => {
  return unlockedChests.value >= chestIndex && !hasClaimed(chestIndex);
};

const getChestClass = (chestIndex) => {
  if (hasClaimed(chestIndex)) return 'bg-white/5 opacity-50 grayscale';
  if (canClaim(chestIndex)) return 'bg-pink-500 animate-pulse hover:scale-110 shadow-[0_0_15px_rgba(236,72,153,0.5)] cursor-pointer';
  return 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 opacity-50 cursor-not-allowed';
};

const claim = async (index) => {
  if (!canClaim(index) || claiming.value) return;
  claiming.value = true;
  try {
    const res = await axios.post(`/api/boss/claim-chest/${boss.value.id}`);
    chestsClaimed.value = res.data.new_chests_claimed;
    
    // Confetti effect
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#f472b6', '#fb7185']
    });

    if (res.data.rewardItem) {
      notificationStore.notify(`¡HAS DESBLOQUEADO: ${res.data.rewardItem.toUpperCase()}! 🎁`, 'success');
    } else {
      notificationStore.notify(`¡Has conseguido ${res.data.rewardCoins} Reppy Coins!`, 'success');
    }
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Error al abrir cofre', 'error');
  } finally {
    claiming.value = false;
  }
};

const shareEvent = () => {
  const url = `${window.location.origin}/`;
  const text = `🐇 ¡El Conejo de Acero ha llegado a Reppy! Ayúdame a conseguir repeticiones para quitarle vida al jefe global. Únete: ${url}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Global Boss: El Conejo de Acero',
      text: text,
      url: url,
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(text);
    notificationStore.notify('Enlace de invitación copiado al portapapeles', 'success');
  }
};

onMounted(() => {
  fetchBoss();
  timerInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

defineExpose({ refresh: fetchBoss });
</script>

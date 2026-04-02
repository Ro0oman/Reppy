<template>
  <div v-if="loading" class="animate-pulse bg-white/5 h-24 rounded-3xl mb-8"></div>
  <div v-else-if="boss" class="glass p-6 rounded-[2.5rem] mb-8 border border-white/5 relative overflow-hidden group">
    <!-- Easter Background subtle glow -->
    <div class="absolute -right-20 -top-20 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"></div>

    <div class="flex items-center justify-between mb-4 relative z-10">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/10 text-2xl shadow-xl">
          🐰
        </div>
        <div>
          <h3 class="text-xl font-black italic tracking-tighter text-white">{{ boss.name }}</h3>
          <p class="text-xs text-zinc-400 font-medium">{{ boss.description }}</p>
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-pink-500 tracking-tighter">{{ boss.current_hp.toLocaleString() }} <span class="text-sm text-zinc-500 uppercase tracking-widest">/ {{ boss.total_hp.toLocaleString() }} HP</span></div>
        <button 
          @click="shareEvent"
          class="mt-2 flex items-center gap-2 justify-end ms-auto text-xs font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors bg-primary-500/10 px-3 py-1 rounded-lg"
        >
          <span>🔗 Reclutar Ayuda</span>
        </button>
      </div>
    </div>

    <!-- Health Bar Track -->
    <div class="relative h-6 bg-zinc-900 rounded-full overflow-hidden border border-white/5 mb-3">
      <!-- Health Bar Fill -->
      <div 
        class="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-pink-500 to-amber-500 transition-all duration-1000 ease-out"
        :style="{ width: `${hpPercentage}%` }"
      ></div>
      
      <!-- Milestones Indicators (33%, 66%, 100% damage = 66%, 33%, 0% HP) -->
      <div class="absolute inset-0 w-full h-full pointer-events-none">
        <div class="absolute top-0 bottom-0 w-px bg-white/20" style="left: 66.6%"></div>
        <div class="absolute top-0 bottom-0 w-px bg-white/20" style="left: 33.3%"></div>
      </div>
    </div>

    <!-- Chests and Milestones Info -->
    <div class="flex items-center justify-between relative z-10">
      <p class="text-xs text-zinc-400 font-bold uppercase tracking-widest">Repeticiones para tu próximo cofre: <span class="text-pink-400">{{ repsToNextChest }}</span></p>
      
      <div class="flex items-center gap-3">
        <!-- Chest 1 -->
        <button 
          @click="claim(1)"
          class="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all"
          :class="getChestClass(1)"
          :disabled="!canClaim(1) || claiming"
        >
          {{ hasClaimed(1) ? '✅' : '🎁' }}
        </button>
        <!-- Chest 2 -->
        <button 
          @click="claim(2)"
          class="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all"
          :class="getChestClass(2)"
          :disabled="!canClaim(2) || claiming"
        >
          {{ hasClaimed(2) ? '✅' : '🎁' }}
        </button>
        <!-- Chest 3 -->
        <button 
          @click="claim(3)"
          class="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all"
          :class="getChestClass(3)"
          :disabled="!canClaim(3) || claiming"
        >
          {{ hasClaimed(3) ? '✅' : '🎁' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useNotificationStore } from '../stores/notification';

const boss = ref(null);
const loading = ref(true);
const claiming = ref(false);
const personalDamage = ref(0);
const chestsClaimed = ref(0);
const notificationStore = useNotificationStore();

const fetchBoss = async () => {
  try {
    const res = await axios.get('/api/boss/active');
    if (res.data) {
      boss.value = res.data.boss;
      personalDamage.value = res.data.personal_damage;
      chestsClaimed.value = res.data.chests_claimed;
    }
  } catch (error) {
    console.error('Error fetching boss:', error);
  } finally {
    loading.value = false;
  }
};

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
  return 'bg-zinc-900 border border-white/5 opacity-50 cursor-not-allowed';
};

const claim = async (index) => {
  if (!canClaim(index) || claiming.value) return;
  claiming.value = true;
  try {
    const res = await axios.post(`/api/boss/claim-chest/${boss.value.id}`);
    chestsClaimed.value = res.data.new_chests_claimed;
    notificationStore.notify(`¡Has conseguido ${res.data.rewardCoins} Reppy Coins!`, 'success');
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

onMounted(fetchBoss);
defineExpose({ refresh: fetchBoss });
</script>

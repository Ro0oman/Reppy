<template>
  <div v-if="activePotions.length > 0" class="space-y-3">
    <div class="flex items-center gap-2 px-2">
      <FlaskConical class="w-4 h-4 text-emerald-500" />
      <h4 class="text-[9px] font-black text-muted/60 uppercase tracking-widest">{{ i18n.t('dash_active_effects') }}</h4>
    </div>
    
    <div v-for="boost in activePotions" :key="boost.type" class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between group hover:bg-emerald-500/15 transition-all">
      <div class="flex items-center gap-3">
        <FlaskConical class="w-4 h-4 text-emerald-500 animate-bounce" />
        <div class="flex flex-col gap-0.5">
          <span class="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{{ boost.label }}</span>
          <span class="text-[9px] font-bold text-emerald-300">{{ boost.value }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Timer class="w-3.5 h-3.5 text-emerald-500/60" />
        <span class="text-[11px] font-black text-white font-mono tabular-nums">{{ boost.timeLeft }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { FlaskConical, Timer } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';

const authStore = useAuthStore();
const i18n = useI18nStore();
const currentTime = ref(new Date());
let timerInterval = null;

const formatTimeLeft = (diff) => {
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const activePotions = computed(() => {
  const user = authStore.user;
  if (!user) return [];
  
  const now = currentTime.value;
  const boosts = [];

  // Check Damage Multiplier
  if (user.damage_multiplier_expiry && new Date(user.damage_multiplier_expiry) > now) {
    const expiry = new Date(user.damage_multiplier_expiry);
    const diff = expiry - now;
    boosts.push({
      type: 'multiplier',
      label: i18n.t('inv_dmg_mult'),
      value: `x${parseFloat(user.damage_multiplier).toFixed(1)}`,
      timeLeft: formatTimeLeft(diff)
    });
  }

  // Check DEX Bonus
  if (user.dex_bonus_expiry && new Date(user.dex_bonus_expiry) > now) {
    const expiry = new Date(user.dex_bonus_expiry);
    const diff = expiry - now;
    boosts.push({
      type: 'dex',
      label: i18n.t('inv_dex_boost'),
      value: `+${user.dex_bonus}`,
      timeLeft: formatTimeLeft(diff)
    });
  }

  return boosts;
});

onMounted(() => {
  timerInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>

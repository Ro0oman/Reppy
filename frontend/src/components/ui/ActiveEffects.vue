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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { FlaskConical, Timer } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { buildActiveBoosts } from '@/utils/activeBuffs';

const authStore = useAuthStore();
const i18n = useI18nStore();
const currentTime = ref(new Date());
let timerInterval = null;

const activePotions = computed(() => buildActiveBoosts(authStore.user, currentTime.value, i18n));

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

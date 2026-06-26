<template>
  <!-- Compact strip of currently-active potion buffs, with live countdown.
       Only renders when at least one buff is active. -->
  <div v-if="buffs.length" class="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-2.5 backdrop-blur-sm">
    <div class="mb-1.5 flex items-center gap-1.5 px-0.5">
      <Sparkles class="h-3.5 w-3.5 text-emerald-400" />
      <span class="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300/80">{{ i18n.t('dash_active_effects') }}</span>
    </div>
    <div class="flex flex-wrap gap-1.5">
      <span v-for="b in buffs" :key="b.type"
        class="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-black/30 px-2 py-1">
        <FlaskConical class="h-3.5 w-3.5 shrink-0 text-emerald-400" />
        <span class="text-[10px] font-bold text-emerald-200">{{ b.label }}</span>
        <span class="text-[10px] font-black text-emerald-300">{{ b.value }}</span>
        <span class="font-mono text-[10px] tabular-nums text-white/45">{{ b.timeLeft }}</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Sparkles, FlaskConical } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { buildActiveBoosts } from '@/utils/activeBuffs';

const authStore = useAuthStore();
const i18n = useI18nStore();
const now = ref(new Date());
let timer = null;

const buffs = computed(() => buildActiveBoosts(authStore.user, now.value, i18n));

onMounted(() => { timer = setInterval(() => { now.value = new Date(); }, 1000); });
onUnmounted(() => { if (timer) clearInterval(timer); });
</script>

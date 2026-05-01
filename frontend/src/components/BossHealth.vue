<template>
  <div
    v-if="loading"
    class="animate-pulse bg-surface/30 h-72 rounded-[2.5rem] mb-8 border border-white/5"
  ></div>

  <div v-else-if="boss" class="space-y-5">
    <section
      class="relative overflow-hidden rounded-[2.2rem] border bg-surface/10 backdrop-blur-2xl p-4 sm:p-6 max-h-[78dvh] sm:max-h-none overflow-y-auto sm:overflow-visible no-scrollbar"
      :class="theme.border"
    >
      <div class="absolute inset-0 pointer-events-none opacity-30" :class="theme.aura"></div>

      <header class="relative z-10 flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-2">
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border"
              :class="theme.badge"
            >
              <Sparkles class="w-3 h-3" />
              {{ rarityLabel }}
            </span>
            <span
              v-if="boss.weakness_stat"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-amber-500/30 bg-amber-500/10 text-amber-400"
            >
              <Shield class="w-3 h-3" />
              {{ weaknessLabel }} {{ weaknessDisplay }}
            </span>
          </div>
          <h3 class="text-2xl sm:text-4xl font-black italic tracking-tight text-foreground uppercase leading-none">
            {{ boss.name }}
          </h3>
          <p v-if="boss.active_phrase && !isDefeated" class="text-xs sm:text-sm italic text-muted/90">
            "{{ boss.active_phrase }}"
          </p>
          <p v-if="isDefeated" class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
            <Check class="w-3.5 h-3.5" />
            {{ i18nStore.t('boss_protocol_complete') }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="authStore.isAuthenticated"
            @click="showHistory = true"
            class="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-muted hover:text-foreground transition-colors flex items-center justify-center"
            :title="i18nStore.t('battle_history')"
          >
            <History class="w-4 h-4" />
          </button>
          <button
            @click="showCodex = true"
            class="w-9 h-9 rounded-xl border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition-colors flex items-center justify-center"
            :title="i18nStore.t('boss_how_damage')"
          >
            <BookMarkedIcon class="w-4 h-4" />
          </button>
          <button
            @click="showHelp = true"
            class="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-muted hover:text-foreground transition-colors flex items-center justify-center"
            :title="i18nStore.t('boss_battle_manual')"
          >
            ?
          </button>
        </div>
      </header>

      <div class="relative z-10 mt-4 grid items-start grid-cols-[86px_minmax(0,1fr)] sm:grid-cols-[120px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)] gap-3 sm:gap-4">
        <div class="self-start h-fit">
          <div class="w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black/30">
            <img
              v-if="boss.image_url"
              :src="boss.image_url"
              :alt="boss.name"
              class="w-full h-full object-cover transition-all duration-500"
              :class="isDefeated ? 'grayscale opacity-40' : ''"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-4xl font-black text-white/20">?</div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-5 space-y-3 sm:space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">
                {{ i18nStore.t('boss_target_integrity') }}
              </p>
              <p class="text-xl sm:text-3xl font-black italic tracking-tight text-foreground">
                {{ formatNumber(boss.current_hp) }}
                <span class="text-xs font-black text-muted/60">/ {{ formatNumber(boss.total_hp) }} HP</span>
              </p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">HP</p>
              <p class="text-xl sm:text-2xl font-black text-foreground">{{ hpPercentageLabel }}</p>
            </div>
          </div>

          <div class="h-4 rounded-full border border-white/10 bg-black/40 overflow-hidden">
            <div
              class="h-full transition-all duration-700 relative"
              :style="{ width: `${hpPercentage}%` }"
              :class="theme.progress"
            >
              <div class="absolute inset-0 boss-shimmer"></div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2" v-if="authStore.isAuthenticated">
            <div class="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
              <p class="text-[8px] font-black uppercase tracking-[0.2em] text-muted/50">{{ statLabelPersonal }}</p>
              <p class="text-sm sm:text-lg font-black italic text-foreground">{{ formatNumber(personalDamage) }}</p>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
              <p class="text-[8px] font-black uppercase tracking-[0.2em] text-muted/50">{{ statLabelToday }}</p>
              <p class="text-sm sm:text-lg font-black italic text-emerald-400">{{ formatNumber(dailyDamage) }}</p>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
              <p class="text-[8px] font-black uppercase tracking-[0.2em] text-muted/50">{{ statLabelTop }}</p>
              <p class="text-[11px] sm:text-sm font-black italic text-amber-400 truncate" :title="topDealerName">{{ topDealerName }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="relative z-10 mt-3 sm:mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">
              {{ isEs ? 'Botin' : 'Loot' }}
            </p>
            <p class="text-sm font-bold text-foreground leading-tight">
              {{ i18nStore.t('ui_super_chest') }} - {{ theme.rewardCopy }}
            </p>
          </div>
          <div class="hidden sm:flex flex-wrap gap-2">
            <span
              v-for="rate in theme.rewardRates"
              :key="rate.name"
              class="px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-tight text-foreground/90"
            >
              {{ rate.name }} {{ rate.value }}
            </span>
          </div>
        </div>

        <div class="mt-4">
          <button
            v-if="canClaim"
            @click="claim"
            :disabled="claiming"
            class="w-full sm:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-[0.16em] text-sm border transition-all"
            :class="theme.claimButton"
          >
            {{ claimCtaLabel }}
          </button>
          <div
            v-else-if="isDefeated && authStore.isAuthenticated"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.2em] text-muted"
          >
            <Check class="w-3.5 h-3.5 text-emerald-400" />
            {{ i18nStore.t('boss_reward_acquired') }}
          </div>
          <div
            v-else-if="!authStore.isAuthenticated"
            class="text-[10px] font-black uppercase tracking-[0.15em] text-primary-400/90"
          >
            {{ i18nStore.t('boss_login_to_damage') }}
          </div>
          <div
            v-else
            class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted/70"
          >
            <Timer class="w-3.5 h-3.5" />
            {{ isEs ? 'Falta' : 'Left' }} {{ formatNumber(boss.current_hp) }} HP
          </div>
        </div>
      </div>
    </section>

    <div
      v-if="nextBoss && authStore.isAuthenticated"
      class="rounded-2xl border border-dashed border-white/10 bg-surface/10 p-4 flex items-center justify-between gap-3"
    >
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-12 h-12 rounded-xl border border-white/10 bg-black/30 overflow-hidden shrink-0">
          <img v-if="nextBoss.image_url" :src="nextBoss.image_url" :alt="nextBoss.name" class="w-full h-full object-cover opacity-70" />
        </div>
        <div class="min-w-0">
          <p class="text-[9px] font-black uppercase tracking-[0.2em] text-muted/60">{{ i18nStore.t('boss_next_protocol') }}</p>
          <p class="text-sm font-black uppercase tracking-tight text-foreground truncate">{{ nextBoss.name }}</p>
        </div>
      </div>
      <div class="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-muted/70">
        <LockIcon class="w-3.5 h-3.5" />
        {{ i18nStore.t('boss_locked') }}
      </div>
    </div>

    <div
      v-if="showHelp"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      @click.self="showHelp = false"
    >
      <div class="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-surface/30 p-6 sm:p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500">{{ i18nStore.t('boss_op_manual') }}</p>
            <h4 class="mt-2 text-2xl font-black italic tracking-tight text-foreground">{{ i18nStore.t('boss_community_event') }}</h4>
          </div>
          <button
            @click="showHelp = false"
            class="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] text-muted hover:text-foreground"
          >
            <XIcon class="w-4 h-4 mx-auto" />
          </button>
        </div>
        <div class="mt-5 space-y-3">
          <div class="rounded-xl border border-white/10 bg-black/25 p-3">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{{ i18nStore.t('battle_help_title1') }}</p>
            <p class="mt-1 text-xs text-muted">{{ i18nStore.t('battle_help_desc1') }}</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-black/25 p-3">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{{ i18nStore.t('battle_help_title2') }}</p>
            <p class="mt-1 text-xs text-muted">{{ i18nStore.t('battle_help_desc2') }}</p>
          </div>
          <div class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">{{ i18nStore.t('boss_reward_chest') }}</p>
            <p class="mt-1 text-xs text-muted">{{ i18nStore.t('boss_reward_desc') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <BossHistoryModal v-if="boss" :show="showHistory" :boss-id="boss.id" @close="showHistory = false" />
  <CodexModal :show="showCodex" @close="showCodex = false" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useBossStore } from '../stores/boss';
import { useNotificationStore } from '../stores/notification';
import { useI18nStore } from '../stores/i18n';
import {
  History,
  Check,
  X as XIcon,
  Shield,
  Timer,
  Sparkles,
  Lock as LockIcon,
  BookMarked as BookMarkedIcon,
} from 'lucide-vue-next';
import { formatNumber } from '../utils/numberUtils';
import confetti from 'canvas-confetti';
import BossHistoryModal from './BossHistoryModal.vue';
import CodexModal from './CodexModal.vue';

const authStore = useAuthStore();
const bossStore = useBossStore();
const i18nStore = useI18nStore();
const notificationStore = useNotificationStore();

const claiming = ref(false);
const showHelp = ref(false);
const showHistory = ref(false);
const showCodex = ref(false);

const boss = computed(() => bossStore.activeBoss?.boss);
const nextBoss = computed(() => bossStore.activeBoss?.next_boss);
const personalDamage = computed(() => bossStore.activeBoss?.personal_damage || 0);
const dailyDamage = computed(() => bossStore.activeBoss?.daily_damage || 0);
const chestsClaimed = computed(() => bossStore.activeBoss?.chests_claimed || 0);
const topDamageDealer = computed(() => bossStore.activeBoss?.top_damage_dealer);
const loading = computed(() => bossStore.loading);

const fetchBoss = (force = false) => bossStore.fetchActiveBoss(force);

const isDefeated = computed(() => {
  if (!boss.value) return false;
  return boss.value.current_hp <= 0 || boss.value.status === 'defeated';
});

const hpPercentage = computed(() => {
  if (!boss.value || !boss.value.total_hp) return 0;
  return Math.max(0, Math.min(100, (boss.value.current_hp / boss.value.total_hp) * 100));
});

const isEs = computed(() => i18nStore.locale !== 'en');

const rarityLabel = computed(() => {
  if (boss.value?.is_legendary) return isEs.value ? 'Legendario' : 'Legendary';
  if (boss.value?.is_epic) return isEs.value ? 'Epico' : 'Epic';
  return isEs.value ? 'Activo' : 'Active';
});

const weaknessDisplay = computed(() => {
  const stat = boss.value?.weakness_stat || '';
  if (!stat) return '';
  const normalized = String(stat).trim().toUpperCase();
  if (isEs.value && normalized === 'FTH') return 'FE';
  return normalized;
});

const weaknessLabel = computed(() => (isEs.value ? 'DEB:' : 'WK:'));

const hpPercentageLabel = computed(() => {
  const value = hpPercentage.value;
  if (value <= 0) return '0%';
  if (value < 1) return `${value.toFixed(1)}%`;
  return `${Math.round(value)}%`;
});

const statLabelPersonal = computed(() => (isEs.value ? 'TU TOTAL' : 'YOUR TOTAL'));
const statLabelToday = computed(() => (isEs.value ? 'HOY' : 'TODAY'));
const statLabelTop = computed(() => (isEs.value ? 'TOP 1' : 'TOP 1'));

const theme = computed(() => {
  if (boss.value?.is_legendary) {
    return {
      border: 'border-amber-500/30',
      aura: 'bg-gradient-to-br from-amber-500/20 to-transparent',
      badge: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      progress: 'bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200',
      claimButton: 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400',
      rewardCopy: `${i18nStore.t('ui_guaranteed')} (${i18nStore.t('ui_legendary')})`,
      rewardRates: [
        { name: i18nStore.t('ui_calisthenic'), value: '10%' },
        { name: i18nStore.t('ui_legendary'), value: '15%' },
        { name: i18nStore.t('ui_epic'), value: '25%' },
        { name: i18nStore.t('ui_rare'), value: '25%' },
      ],
    };
  }
  if (boss.value?.is_epic) {
    return {
      border: 'border-purple-500/30',
      aura: 'bg-gradient-to-br from-purple-500/20 to-transparent',
      badge: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      progress: 'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-400',
      claimButton: 'bg-purple-500 hover:bg-purple-400 text-black border-purple-400',
      rewardCopy: `${i18nStore.t('ui_guaranteed')} (${i18nStore.t('ui_special')})`,
      rewardRates: [
        { name: i18nStore.t('ui_legendary'), value: '5%' },
        { name: i18nStore.t('ui_epic'), value: '25%' },
        { name: i18nStore.t('ui_rare'), value: '35%' },
      ],
    };
  }
  return {
    border: 'border-primary-500/20',
    aura: 'bg-gradient-to-br from-primary-500/20 to-transparent',
    badge: 'bg-primary-500/15 border-primary-500/30 text-primary-400',
    progress: 'bg-gradient-to-r from-primary-600 via-primary-500 to-sky-400',
    claimButton: 'bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400',
    rewardCopy: `${i18nStore.t('ui_guaranteed')} (${i18nStore.t('ui_rare')})`,
    rewardRates: [
      { name: i18nStore.t('ui_common'), value: '45%' },
      { name: i18nStore.t('ui_rare'), value: '35%' },
      { name: i18nStore.t('ui_epic'), value: '15%' },
      { name: i18nStore.t('ui_legendary'), value: '5%' },
    ],
  };
});

const canClaim = computed(() => isDefeated.value && authStore.isAuthenticated && chestsClaimed.value < 1);

const claimCtaLabel = computed(() => {
  if (boss.value?.is_legendary) return i18nStore.t('ui_claim_legendary');
  if (boss.value?.is_epic) return i18nStore.t('ui_claim_epic');
  return i18nStore.t('boss_claim_loot');
});

const topDealerName = computed(() => {
  if (!topDamageDealer.value) return '--';
  if (topDamageDealer.value.id === authStore.user?.id) return i18nStore.t('lb_you');
  return topDamageDealer.value.name;
});

const claim = async () => {
  if (!canClaim.value || claiming.value) return;
  claiming.value = true;
  try {
    const res = await axios.post(`/api/boss/claim-chest/${boss.value.id}`);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#10b981', '#fbbf24', '#ffffff'],
    });
    notificationStore.notify(res.data.message || 'Cofre enviado al inventario', 'success');
    await fetchBoss(true);
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Error al reclamar cofre', 'error');
  } finally {
    claiming.value = false;
  }
};

onMounted(() => {
  fetchBoss();
});

defineExpose({ refresh: () => fetchBoss() });
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.boss-shimmer {
  background: linear-gradient(90deg, transparent 20%, rgba(255, 255, 255, 0.28) 50%, transparent 80%);
  transform: translateX(-100%);
  animation: boss-shimmer 2s linear infinite;
}

@keyframes boss-shimmer {
  to {
    transform: translateX(100%);
  }
}
</style>

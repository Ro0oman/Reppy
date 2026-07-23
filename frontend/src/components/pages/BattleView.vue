<template>
  <div class="relative min-h-screen">
    <!-- Dungeon background -->
    <div class="bg-dungeon fixed inset-0 -z-10">
      <span class="ember" v-for="n in 14" :key="n" :style="emberStyle(n)"></span>
    </div>

    <div class="mx-auto w-full max-w-md space-y-1.5 px-3 pb-20 pt-1.5 md:max-w-lg lg:max-w-5xl lg:space-y-3 lg:px-6 lg:pt-3">
      <!-- Top bar propio SOLO en estilo clásico: en Operative OS el shell de
           App.vue ya aporta identidad, monedas y navegación (evita doble header). -->
      <RpgTopBar v-if="themeStore.uiStyle !== 'operative'" />

      <!-- Campaign entry (NEW). Links to the data-driven RPG campaign map. -->
      <button type="button" @click="goCampaign"
        class="relative flex w-full items-center justify-between gap-2 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-900/40 to-orange-900/30 px-4 py-2.5 text-left transition-all active:scale-[0.99] hover:border-amber-400/50">
        <span class="flex items-center gap-2">
          <Map class="h-4 w-4 text-amber-300" />
          <span class="text-sm font-black uppercase tracking-wide text-amber-100">{{ i18n.t('campaign_title') }}</span>
        </span>
        <span class="flex items-center gap-2">
          <NewBadge feature-key="campaign_v1" />
          <ChevronRight class="h-4 w-4 text-white/40" />
        </span>
      </button>

      <!-- Loading / no boss -->
      <div v-if="loadingBoss && !boss" class="flex flex-col items-center justify-center gap-3 py-16 text-white/60">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-orange-400/40 border-t-orange-400"></div>
        <p class="text-sm font-semibold">{{ i18n.t('battle_loading') }}</p>
      </div>
      <p v-else-if="!boss" class="rounded-2xl border border-white/10 bg-black/30 px-4 py-8 text-center text-sm text-white/60">
        {{ i18n.t('battle_no_boss') }}
      </p>

      <!-- On desktop: 2 columns — boss arena (hero) left, controls right.
           On mobile/tablet: single stacked column. -->
      <div v-else class="space-y-1.5 lg:grid lg:grid-cols-[1.25fr_1fr] lg:items-start lg:gap-5 lg:space-y-0">
        <!-- Left: player + boss arena (the hero) -->
        <div class="space-y-1.5 lg:space-y-3">
          <PlayerCard />
          <BossArena ref="arenaRef" :boss="boss" :personal-damage="personalDamage"
            :rank="personalRank" :live-count="liveCount"
            @show-live="liveRef?.open()" />
        </div>

        <!-- Right: controls (active buffs + potions + register reps) -->
        <div class="space-y-1.5 lg:space-y-3">
          <BattleActiveBuffs />
          <QuickPotions @activated="onPotionActivated" />
          <BattleRepsPanel :loading="logging" :streak="streak" @train="onTrain" />
        </div>
      </div>
    </div>

    <!-- Live operatives modal, opened from the boss participant counter -->
    <LivePresence ref="liveRef" modal-only />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Map, ChevronRight } from 'lucide-vue-next';
import axios from 'axios';
import RpgTopBar from '@/components/battle/RpgTopBar.vue';
import NewBadge from '@/components/battle/NewBadge.vue';
import PlayerCard from '@/components/battle/PlayerCard.vue';
import BossArena from '@/components/battle/BossArena.vue';
import QuickPotions from '@/components/battle/QuickPotions.vue';
import BattleActiveBuffs from '@/components/battle/BattleActiveBuffs.vue';
import BattleRepsPanel from '@/components/battle/BattleRepsPanel.vue';
import LivePresence from '@/components/ui/LivePresence.vue';
import { useBossStore } from '@/stores/boss';
import { useShopStore } from '@/stores/shop';
import { useSocketStore } from '@/stores/socket';
import { useAuthStore } from '@/stores/auth';
import { useBadgesStore } from '@/stores/badges';
import { useFeatureSeenStore } from '@/stores/featureSeen';
import { useI18nStore } from '@/stores/i18n';
import { useThemeStore } from '@/stores/theme';
import { useRepLogger } from '@/composables/useRepLogger';

const bossStore = useBossStore();
const shopStore = useShopStore();
const socketStore = useSocketStore();
const authStore = useAuthStore();
const badges = useBadgesStore();
const featureSeen = useFeatureSeenStore();
const i18n = useI18nStore();
const themeStore = useThemeStore();
const { loading: logging, logReps } = useRepLogger();
const router = useRouter();

const goCampaign = () => {
  featureSeen.markSeen('campaign_v1');
  router.push({ name: 'campaign-map', params: { lang: i18n.locale } });
};

const arenaRef = ref(null);
const liveRef = ref(null);
const streak = ref(0);
const loadingBoss = computed(() => bossStore.loading);

const activeBoss = computed(() => bossStore.activeBoss);
const boss = computed(() => activeBoss.value?.boss || null);
const personalDamage = computed(() => activeBoss.value?.personal_damage || 0);
const personalRank = computed(() => activeBoss.value?.personal_rank || null);

// Live-connected players, mirroring the operatives modal (LivePresence):
// the realtime presence list, plus self if not yet in it.
const liveCount = computed(() => {
  const ops = socketStore.activeOperatives || [];
  const hasSelf = ops.some((o) => o.id === authStore.user?.id);
  return ops.length + (authStore.isAuthenticated && !hasSelf ? 1 : 0);
});

const fetchStreak = async () => {
  try {
    const res = await axios.get('/api/streak/status');
    streak.value = res.data?.streak || 0;
  } catch (_) { /* non-critical */ }
};

const onTrain = async ({ exerciseType, count }) => {
  const origin = arenaRef.value?.getOrigin?.() || null;
  const res = await logReps({ count, exerciseType, addedWeight: 0, origin });
  if (res) {
    arenaRef.value?.playDamaged?.();
    await Promise.all([
      bossStore.fetchActiveBoss(true),
      badges.fetchBadges(true),
      fetchStreak(),
    ]);
  }
};

const onPotionActivated = () => {
  // Inventory + profile already refreshed by the composable; nothing else needed.
};

// Embers: deterministic-ish scatter so they don't all line up.
const emberStyle = (n) => {
  const left = (n * 37) % 100;
  const delay = (n * 0.7) % 6;
  const dur = 6 + (n % 5);
  const size = 2 + (n % 3);
  return {
    left: left + '%',
    width: size + 'px',
    height: size + 'px',
    animationDelay: delay + 's',
    animationDuration: dur + 's',
  };
};

onMounted(() => {
  bossStore.fetchActiveBoss();
  shopStore.fetchInventory();
  badges.fetchBadges();
  featureSeen.load();
  fetchStreak();
  // Entering the battle clears the "NEW" marker on the camp's ENTRENAR button.
  featureSeen.markSeen('battle_view');
});
</script>

<style scoped>
/* Arena Operative OS: obsidiana con foco frío arriba y rescoldo naranja
   contenido abajo (naranja = urgencia de combate, no fondo dominante). */
.bg-dungeon {
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(22, 48, 94, 0.6), transparent 60%),
    radial-gradient(70% 40% at 50% 100%, rgba(255, 106, 50, 0.12), transparent 70%),
    linear-gradient(180deg, #0a1220 0%, #070b12 55%, #05070b 100%);
}
.ember {
  position: absolute;
  bottom: -10px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(97, 217, 255, 0.9), rgba(27, 104, 255, 0.2));
  filter: blur(0.5px);
  opacity: 0;
  animation-name: ember-rise;
  animation-timing-function: ease-in;
  animation-iteration-count: infinite;
}
@keyframes ember-rise {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  15% { opacity: 0.9; }
  100% { transform: translateY(-85vh) translateX(20px) scale(0.4); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ember { display: none; }
}
</style>

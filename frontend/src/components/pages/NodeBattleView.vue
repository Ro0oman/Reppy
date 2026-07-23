<template>
  <div class="relative min-h-screen">
    <div class="bg-dungeon fixed inset-0 -z-10">
      <span class="ember" v-for="n in 14" :key="n" :style="emberStyle(n)"></span>
    </div>

    <div class="mx-auto w-full max-w-md space-y-1.5 px-3 pb-20 pt-1.5 md:max-w-lg lg:max-w-5xl lg:space-y-3 lg:px-6 lg:pt-3">
      <RpgTopBar />

      <!-- Back to map -->
      <button type="button" @click="goToMap"
        class="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-bold text-white/70 transition-all active:scale-95 hover:bg-white/5">
        <ArrowLeft class="h-3.5 w-3.5" /> {{ i18n.t('campaign_back_to_map') }}
      </button>

      <div v-if="loading && !engaged" class="flex flex-col items-center justify-center gap-3 py-16 text-white/60">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-orange-400/40 border-t-orange-400"></div>
      </div>

      <p v-else-if="!engaged" class="rounded-2xl border border-white/10 bg-black/30 px-4 py-8 text-center text-sm text-white/60">
        {{ i18n.t('campaign_no_target') }}
        <button type="button" @click="goToMap" class="mt-3 block w-full rounded-xl bg-orange-500/90 py-2 font-bold text-white">
          {{ i18n.t('campaign_open_map') }}
        </button>
      </p>

      <div v-else class="space-y-1.5 lg:grid lg:grid-cols-[1.25fr_1fr] lg:items-start lg:gap-5 lg:space-y-0">
        <div class="space-y-1.5 lg:space-y-3">
          <PlayerCard />
          <EnemyArena ref="arenaRef" :enemy="engaged.enemy"
            :current-hp="engaged.progress.current_hp" :total-hp="engaged.progress.total_hp"
            :kills="engaged.progress.kills" :pack-count="engaged.progress.pack_count" />
        </div>
        <div class="space-y-1.5 lg:space-y-3">
          <BattleActiveBuffs />
          <QuickPotions />
          <BattleRepsPanel :loading="logging" :streak="0" @train="onTrain" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import RpgTopBar from '@/components/battle/RpgTopBar.vue';
import PlayerCard from '@/components/battle/PlayerCard.vue';
import EnemyArena from '@/components/battle/EnemyArena.vue';
import QuickPotions from '@/components/battle/QuickPotions.vue';
import BattleActiveBuffs from '@/components/battle/BattleActiveBuffs.vue';
import BattleRepsPanel from '@/components/battle/BattleRepsPanel.vue';
import { useCampaignStore } from '@/stores/campaign';
import { useShopStore } from '@/stores/shop';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';
import { useRepLogger } from '@/composables/useRepLogger';

const router = useRouter();
const campaign = useCampaignStore();
const shopStore = useShopStore();
const i18n = useI18nStore();
const notify = useNotificationStore();
const { loading: logging, logReps } = useRepLogger();

const arenaRef = ref(null);
const loading = computed(() => campaign.loadingStatus);
const engaged = computed(() => campaign.engaged);

const rarityLabel = (r) => ({ common: '', rare: '⭐', especial: '✨', legendary: '🌟', calistenico: '💎' }[r] || '');

const onTrain = async ({ exerciseType, count }) => {
  const origin = arenaRef.value?.getOrigin?.() || null;
  const res = await logReps({ count, exerciseType, addedWeight: 0, origin });
  if (!res) return;
  arenaRef.value?.playDamaged?.();

  const c = res.campaign;
  campaign.applyLoggedResult(c);

  if (c && c.killed) {
    // Loot feedback.
    const loot = c.loot || {};
    const parts = [];
    if (loot.coins) parts.push(`+${loot.coins} 🪙`);
    if (loot.item) parts.push(`${rarityLabel(loot.item.rarity)} ${loot.item.name}`);
    if (loot.chest) parts.push('📦');
    const label = parts.length ? ` — ${parts.join('  ')}` : '';
    if (c.cleared) {
      notify.notify(`${i18n.t('campaign_node_cleared')}${label}`, 'success');
      await campaign.fetchStatus(true);
      setTimeout(goToMap, 900);
    } else {
      notify.notify(`${i18n.t('campaign_enemy_down')}${label}`, 'success');
    }
  }
};

const goToMap = () => router.push({ name: 'campaign-map', params: { lang: i18n.locale } });

const emberStyle = (n) => {
  const left = (n * 37) % 100;
  return {
    left: left + '%', width: (2 + (n % 3)) + 'px', height: (2 + (n % 3)) + 'px',
    animationDelay: ((n * 0.7) % 6) + 's', animationDuration: (6 + (n % 5)) + 's',
  };
};

onMounted(async () => {
  await campaign.fetchStatus();
  shopStore.fetchInventory();
  // No engaged target (e.g. deep link) → send to the map to pick one.
  if (!campaign.engaged) goToMap();
});
</script>

<style scoped>
.bg-dungeon {
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(124, 45, 18, 0.55), transparent 60%),
    radial-gradient(90% 60% at 50% 100%, rgba(190, 50, 20, 0.35), transparent 70%),
    linear-gradient(180deg, #1a0d09 0%, #0c0705 55%, #050303 100%);
}
.ember {
  position: absolute; bottom: -10px; border-radius: 9999px;
  background: radial-gradient(circle, rgba(255, 170, 80, 0.9), rgba(255, 90, 20, 0.2));
  filter: blur(0.5px); opacity: 0;
  animation-name: ember-rise; animation-timing-function: ease-in; animation-iteration-count: infinite;
}
@keyframes ember-rise {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  15% { opacity: 0.9; }
  100% { transform: translateY(-85vh) translateX(20px) scale(0.4); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) { .ember { display: none; } }
</style>

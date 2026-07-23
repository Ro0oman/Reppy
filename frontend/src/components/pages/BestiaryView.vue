<template>
  <div class="relative min-h-screen">
    <div class="bg-dungeon fixed inset-0 -z-10"></div>

    <div class="mx-auto w-full max-w-md space-y-3 px-3 pb-24 pt-3 lg:max-w-3xl lg:px-6">
      <RpgTopBar />

      <button type="button" @click="goToMap"
        class="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-bold text-white/70 transition-all active:scale-95 hover:bg-white/5">
        <ArrowLeft class="h-3.5 w-3.5" /> {{ i18n.t('campaign_back_to_map') }}
      </button>

      <header class="text-center">
        <h1 class="bg-gradient-to-b from-amber-200 to-orange-500 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent">
          {{ i18n.t('bestiary_title') }}
        </h1>
        <p v-if="bestiary" class="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
          {{ bestiary.discovered }} / {{ bestiary.total }} {{ i18n.t('bestiary_discovered') }}
        </p>
      </header>

      <div v-if="loading && !bestiary" class="flex justify-center py-16">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-orange-400/40 border-t-orange-400"></div>
      </div>

      <div v-else class="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <div v-for="e in enemies" :key="e.slug"
          :class="['relative overflow-hidden rounded-2xl border p-3 text-center transition-all',
                   e.discovered ? 'border-orange-500/25 bg-black/40' : 'border-white/5 bg-black/20']">
          <div class="mb-1 text-4xl" :class="e.discovered ? '' : 'opacity-30 grayscale'">
            {{ familyEmoji(e.family) }}
          </div>
          <p class="truncate text-sm font-bold" :class="e.discovered ? 'text-white/90' : 'text-white/30'">
            {{ e.discovered ? tName(e.name) : '???' }}
          </p>
          <p class="text-[10px] uppercase tracking-widest text-white/35">
            {{ i18n.t('campaign_tier') }} {{ e.tier }} · {{ e.family }}
          </p>
          <div v-if="e.discovered" class="mt-1 flex items-center justify-center gap-2 text-[10px]">
            <span v-if="e.weakness_stat" class="rounded-full bg-emerald-500/15 px-1.5 py-0.5 font-bold text-emerald-300">
              ▼ {{ e.weakness_stat.toUpperCase() }}
            </span>
            <span class="font-bold tabular-nums text-white/50">×{{ e.kills }}</span>
          </div>
          <p v-else class="mt-1 text-[10px] text-white/25">{{ i18n.t('bestiary_undiscovered') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import RpgTopBar from '@/components/battle/RpgTopBar.vue';
import { useCampaignStore } from '@/stores/campaign';
import { useI18nStore } from '@/stores/i18n';

const router = useRouter();
const campaign = useCampaignStore();
const i18n = useI18nStore();

const loading = computed(() => campaign.loadingBestiary);
const bestiary = computed(() => campaign.bestiary);
const enemies = computed(() => bestiary.value?.enemies || []);

const tName = (v) => (v && typeof v === 'object') ? (v[i18n.locale] || v.es || v.en || '') : (v || '');

const FAMILY_EMOJI = {
  goblin: '👺', skeleton: '💀', zombie: '🧟', spider: '🕷️',
  bandit: '🗡️', demon: '😈', knight: '🛡️', minion: '👹',
};
const familyEmoji = (f) => FAMILY_EMOJI[f] || '👾';

const goToMap = () => router.push({ name: 'campaign-map', params: { lang: i18n.locale } });

onMounted(() => campaign.fetchBestiary());
</script>

<style scoped>
.bg-dungeon {
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(124, 45, 18, 0.45), transparent 60%),
    linear-gradient(180deg, #14100c 0%, #0a0705 60%, #050303 100%);
}
</style>

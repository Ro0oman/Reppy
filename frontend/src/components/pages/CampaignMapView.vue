<template>
  <div class="relative min-h-screen">
    <div class="bg-dungeon fixed inset-0 -z-10"></div>

    <div class="mx-auto w-full max-w-md space-y-3 px-3 pb-24 pt-3 lg:max-w-3xl lg:px-6">
      <RpgTopBar />

      <header class="relative text-center">
        <h1 class="bg-gradient-to-b from-amber-200 to-orange-500 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent">
          {{ i18n.t('campaign_title') }}
        </h1>
        <p v-if="run" class="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
          {{ run.path ? i18n.t('campaign_path_' + run.path) : i18n.t('campaign_no_path') }}
          <span v-if="run.prestige_level > 0"> · {{ i18n.t('campaign_prestige') }} {{ run.prestige_level }}</span>
        </p>
        <button type="button" @click="goToBestiary"
          class="absolute right-0 top-0 flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-1.5 text-[11px] font-bold text-white/70 transition-all active:scale-95 hover:bg-white/5">
          <BookOpen class="h-3.5 w-3.5" /> {{ i18n.t('bestiary_title') }}
        </button>
      </header>

      <!-- Campaign completed → prestige CTA -->
      <button v-if="run?.completed" type="button" @click="prestigeModal?.openModal()"
        class="flex w-full items-center justify-between gap-2 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-900/50 to-orange-900/40 px-4 py-3 text-left transition-all active:scale-[0.99] hover:border-amber-400/60">
        <span class="flex items-center gap-2">
          <span class="text-xl">👑</span>
          <span class="text-sm font-black uppercase tracking-wide text-amber-100">{{ i18n.t('prestige_ready') }}</span>
        </span>
        <span class="text-xs font-bold text-amber-300">{{ i18n.t('prestige_cta') }} →</span>
      </button>

      <div v-if="loading && !map" class="flex justify-center py-16">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-orange-400/40 border-t-orange-400"></div>
      </div>

      <!-- Act tabs (linear: an act unlocks when the previous act's finale is cleared) -->
      <div v-if="map" class="flex gap-1.5">
        <button v-for="a in acts" :key="a" type="button" @click="selectAct(a)"
          :class="['flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-black uppercase tracking-wide transition-all',
                   a === selectedAct ? 'border-orange-400/60 bg-orange-500/15 text-amber-100'
                   : actUnlocked(a) ? 'border-white/10 bg-black/40 text-white/60 hover:bg-white/5'
                   : 'cursor-not-allowed border-white/5 bg-black/20 text-white/25']">
          {{ i18n.t('campaign_act') }} {{ roman(a) }}
          <Lock v-if="!actUnlocked(a)" class="h-3 w-3" />
        </button>
      </div>

      <div v-for="zone in visibleZones" :key="zone.id"
        class="overflow-hidden rounded-3xl border border-orange-500/15 bg-black/40 shadow-xl">
        <div class="flex items-center justify-between border-b border-white/5 px-4 py-2">
          <h2 class="text-sm font-black uppercase tracking-wide text-amber-200">{{ tName(zone.name) }}</h2>
          <span v-if="zone.theme" class="text-[10px] font-bold uppercase tracking-widest text-white/30">{{ zone.theme }}</span>
        </div>

        <!-- SVG node graph. map_x/map_y are 0–100 percentages. -->
        <svg :viewBox="`0 0 100 ${mapHeight}`" class="w-full" preserveAspectRatio="xMidYMid meet">
          <!-- Edges -->
          <line v-for="(e, i) in zoneEdges(zone)" :key="'e' + i"
            :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2"
            :stroke="e.kind === 'side' ? 'rgba(255,255,255,0.15)' : 'rgba(249,115,22,0.4)'"
            :stroke-dasharray="e.kind === 'side' ? '2 2' : '0'" stroke-width="0.6" />
          <!-- Nodes -->
          <g v-for="n in nodesFor(zone.id)" :key="n.id" :transform="`translate(${n.map_x}, ${n.map_y})`"
            :class="['cursor-pointer', n.status === 'locked' ? 'opacity-50' : '']" @click="onNodeClick(n)">
            <circle r="4.2" :fill="nodeFill(n)" :stroke="nodeStroke(n)" stroke-width="0.7" />
            <text text-anchor="middle" dy="1.6" font-size="4" :fill="n.status === 'locked' ? '#666' : '#fff'">{{ nodeIcon(n) }}</text>
          </g>
        </svg>

        <!-- Node legend list for this zone -->
        <ul class="divide-y divide-white/5 px-2 py-1">
          <li v-for="n in nodesFor(zone.id)" :key="'l' + n.id"
            class="flex items-center justify-between gap-2 px-2 py-2">
            <div class="flex min-w-0 items-center gap-2">
              <span class="text-lg">{{ nodeIcon(n) }}</span>
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-white/90">{{ nodeLabel(n) }}</p>
                <p class="truncate text-[11px] text-white/40">{{ statusLabel(n) }}</p>
              </div>
            </div>
            <button type="button" @click="onNodeClick(n)" :disabled="n.status === 'locked'"
              :class="['shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95',
                       n.status === 'locked' ? 'cursor-not-allowed bg-white/5 text-white/30'
                       : n.status === 'cleared' ? 'bg-emerald-500/20 text-emerald-300'
                       : 'bg-orange-500/90 text-white']">
              {{ ctaLabel(n) }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <NpcDialogModal ref="npcModal" />
    <PathChoiceModal ref="pathModal" @chosen="onPathChosen" />
    <PrestigeModal ref="prestigeModal" @prestiged="onPrestiged" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { BookOpen, Lock } from 'lucide-vue-next';
import RpgTopBar from '@/components/battle/RpgTopBar.vue';
import NpcDialogModal from '@/components/battle/NpcDialogModal.vue';
import PathChoiceModal from '@/components/battle/PathChoiceModal.vue';
import PrestigeModal from '@/components/battle/PrestigeModal.vue';
import { useCampaignStore } from '@/stores/campaign';
import { useI18nStore } from '@/stores/i18n';
import { useNotificationStore } from '@/stores/notification';

const router = useRouter();
const campaign = useCampaignStore();
const i18n = useI18nStore();
const notify = useNotificationStore();

const mapHeight = 70;
const loading = computed(() => campaign.loadingMap);
const map = computed(() => campaign.map);
const run = computed(() => campaign.run);
const zones = computed(() => map.value?.zones || []);

const tName = (v) => (v && typeof v === 'object') ? (v[i18n.locale] || v.es || v.en || '') : (v || '');
const nodesFor = (zoneId) => (map.value?.nodes || []).filter((n) => n.zone_id === zoneId);

// ── Act tabs ──────────────────────────────────────────────────────────────
const ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
const roman = (n) => ROMAN[n] || n;
const selectedAct = ref(1);

const acts = computed(() => [...new Set((map.value?.zones || []).map((z) => z.act))].sort((a, b) => a - b));
const zonesForAct = (act) => (map.value?.zones || []).filter((z) => z.act === act);
const actNodes = (act) => {
  const zids = new Set(zonesForAct(act).map((z) => z.id));
  return (map.value?.nodes || []).filter((n) => zids.has(n.zone_id));
};
// An act is unlocked once any of its nodes is reachable (not 'locked').
const actUnlocked = (act) => actNodes(act).some((n) => n.status !== 'locked');
// Only show the chosen path's zone in Act III (path_required zones filter by run.path).
const visibleZones = computed(() =>
  zonesForAct(selectedAct.value).filter((z) => !z.path_required || z.path_required === run.value?.path)
);
const selectAct = (a) => {
  if (actUnlocked(a)) selectedAct.value = a;
  else notify.notify(i18n.t('campaign_act_locked'), 'info');
};

// On first load (and only then), jump to the highest unlocked act — the current one.
let actInitialized = false;
watch(map, (m) => {
  if (!m || actInitialized) return;
  actInitialized = true;
  const unlocked = acts.value.filter((a) => actUnlocked(a));
  if (unlocked.length) selectedAct.value = Math.max(...unlocked);
}, { immediate: true });

const nodeById = (slug) => (map.value?.nodes || []).find((n) => n.slug === slug);
const zoneEdges = (zone) => {
  const slugs = new Set(nodesFor(zone.id).map((n) => n.slug));
  return (map.value?.edges || [])
    .filter((e) => slugs.has(e.from_slug) && slugs.has(e.to_slug))
    .map((e) => {
      const a = nodeById(e.from_slug), b = nodeById(e.to_slug);
      return a && b ? { x1: a.map_x, y1: a.map_y, x2: b.map_x, y2: b.map_y, kind: e.kind } : null;
    })
    .filter(Boolean);
};

const nodeIcon = (n) => {
  if (n.type === 'npc') return '🧙';
  if (n.type === 'crossroads') return '🔀';
  if (n.type === 'boss' || n.type === 'raid') return '☠️';
  if (n.type === 'treasure') return '💰';
  return '⚔️';
};
const nodeLabel = (n) => {
  if (n.enemy) return tName(n.enemy.name);
  if (n.npc) return tName(n.npc.name);
  if (n.type === 'crossroads') return i18n.t('path_crossroads');
  return n.slug;
};

const nodeFill = (n) => ({
  cleared: 'rgba(16,185,129,0.35)', engaged: 'rgba(249,115,22,0.6)',
  available: 'rgba(0,0,0,0.6)', locked: 'rgba(30,30,30,0.6)',
}[n.status]);
const nodeStroke = (n) => ({
  cleared: '#10b981', engaged: '#f97316', available: '#f59e0b', locked: '#555',
}[n.status]);

const statusLabel = (n) => i18n.t('campaign_status_' + n.status);
const ctaLabel = (n) => {
  if (n.status === 'cleared') return '✓';
  if (n.status === 'locked') return '🔒';
  if (n.type === 'npc') return i18n.t('campaign_talk');
  if (n.type === 'crossroads') return i18n.t('path_choose');
  if (n.status === 'engaged') return i18n.t('campaign_continue');
  return i18n.t('campaign_engage');
};

const npcModal = ref(null);
const pathModal = ref(null);
const prestigeModal = ref(null);
const goToBestiary = () => router.push({ name: 'campaign-bestiary', params: { lang: i18n.locale } });

const onPathChosen = () => campaign.fetchMap(true);
const onPrestiged = () => campaign.fetchMap(true);

const onNodeClick = async (n) => {
  if (n.status === 'locked') {
    notify.notify(i18n.t('campaign_node_locked'), 'info');
    return;
  }
  if (n.type === 'npc') {
    if (n.npc?.slug) npcModal.value?.openFor(n.npc.slug);
    return;
  }
  if (n.type === 'crossroads') {
    if (run.value?.path) notify.notify(i18n.t('path_already_chosen'), 'info');
    else pathModal.value?.openModal();
    return;
  }
  if (n.status === 'cleared') {
    notify.notify(i18n.t('campaign_already_cleared'), 'info');
    return;
  }
  const { ok, body } = await campaign.engage(n.id);
  if (ok) router.push({ name: 'campaign-battle', params: { lang: i18n.locale } });
  else notify.notify(body.message || i18n.t('campaign_engage_error'), 'error');
};

onMounted(() => campaign.fetchMap());
</script>

<style scoped>
.bg-dungeon {
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(124, 45, 18, 0.45), transparent 60%),
    linear-gradient(180deg, #14100c 0%, #0a0705 60%, #050303 100%);
}
</style>

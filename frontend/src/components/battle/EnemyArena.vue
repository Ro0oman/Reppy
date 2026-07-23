<template>
  <div ref="rootEl"
    class="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-black/40 shadow-2xl shadow-orange-900/30">

    <!-- Enemy artwork -->
    <div class="relative h-56 w-full sm:h-64 lg:h-80">
      <video v-if="showVideo" :key="videoSrc" :src="videoSrc" autoplay muted loop playsinline
        @error="onVideoError"
        :class="['absolute inset-0 h-full w-full object-cover', hit ? 'enemy-hit' : '']"></video>
      <img v-else-if="imageSrc" :src="imageSrc" :alt="enemyName"
        :class="['absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_0_25px_rgba(249,115,22,0.35)]', hit ? 'enemy-hit' : '']" />
      <!-- Placeholder when there's no art yet: a family-tinted silhouette. -->
      <div v-else :class="['absolute inset-0 flex items-center justify-center', hit ? 'enemy-hit' : '']">
        <span class="text-7xl opacity-70 drop-shadow-[0_0_25px_rgba(249,115,22,0.35)]">{{ familyEmoji }}</span>
      </div>

      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,rgba(249,115,22,0.18),transparent_70%)]"></div>
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 to-transparent"></div>
      <div class="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent"></div>

      <!-- Top-left: tier · Top-right: weakness -->
      <div class="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 backdrop-blur-sm">
        <span class="text-[11px] font-black tracking-wide text-amber-200">{{ i18n.t('campaign_tier') }} {{ tier }}</span>
      </div>
      <div v-if="weaknessStat" class="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-black/50 px-2.5 py-1 backdrop-blur-sm">
        <span class="text-[11px] font-bold text-emerald-300">{{ i18n.t('campaign_weakness') }}: {{ weaknessStat.toUpperCase() }}</span>
      </div>

      <!-- Pack progress -->
      <div v-if="packCount > 1" class="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[11px] font-bold text-white/80 backdrop-blur-sm">
        {{ Math.min(kills + 1, packCount) }} / {{ packCount }}
      </div>

      <!-- Enemy identity -->
      <div class="absolute inset-x-0 bottom-2 px-4 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400/90">{{ i18n.t('campaign_enemy') }}</p>
        <h2 class="mt-0.5 bg-gradient-to-b from-amber-200 to-orange-500 bg-clip-text text-xl font-black uppercase tracking-tight text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          {{ enemyName }}
        </h2>
      </div>
    </div>

    <!-- HP strip -->
    <div class="space-y-1.5 border-t border-white/5 bg-black/50 px-4 py-2 backdrop-blur-sm">
      <div class="relative h-5 w-full overflow-hidden rounded-full border border-red-900/40 bg-black/60">
        <div class="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-500"
          :style="{ width: hpPct + '%' }"></div>
        <div class="absolute inset-0 flex items-center justify-between px-3 text-[11px] font-bold tabular-nums text-white drop-shadow">
          <span>{{ formatNum(currentHp) }} / {{ formatNum(totalHp) }} HP</span>
          <span>{{ hpPct }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18nStore } from '@/stores/i18n';

const props = defineProps({
  enemy: { type: Object, default: null },       // { name(JSONB|str), art, family, tier, weakness_stat }
  currentHp: { type: Number, default: 0 },
  totalHp: { type: Number, default: 1 },
  kills: { type: Number, default: 0 },
  packCount: { type: Number, default: 1 },
});

const i18n = useI18nStore();
const rootEl = ref(null);
const hit = ref(false);
const idleFailed = ref(false);
const damagedFailed = ref(false);
let hitTimer = null;

// Bilingual JSONB names ({es,en}) or plain strings.
const tName = (v) => (v && typeof v === 'object') ? (v[i18n.locale] || v.es || v.en || '') : (v || '');
const enemyName = computed(() => tName(props.enemy?.name) || '???');
const tier = computed(() => props.enemy?.tier || 1);
const weaknessStat = computed(() => props.enemy?.weakness_stat || null);

const FAMILY_EMOJI = {
  goblin: '👺', skeleton: '💀', zombie: '🧟', spider: '🕷️',
  bandit: '🗡️', demon: '😈', knight: '🛡️', minion: '👹',
};
const familyEmoji = computed(() => FAMILY_EMOJI[props.enemy?.family] || '👾');

// Art: videos served from /video/, images from /enemies/ (or a full URL).
const VIDEO_BASE = '/video/';
const toVideoSrc = (file) => (file ? VIDEO_BASE + file : null);
const idleVideoSrc = computed(() => toVideoSrc(props.enemy?.art?.idle_video));
const damagedVideoSrc = computed(() => toVideoSrc(props.enemy?.art?.damaged_video));
const usingDamaged = computed(() => hit.value && !!damagedVideoSrc.value && !damagedFailed.value);
const videoSrc = computed(() => {
  if (usingDamaged.value) return damagedVideoSrc.value;
  if (idleVideoSrc.value && !idleFailed.value) return idleVideoSrc.value;
  return null;
});
const showVideo = computed(() => !!videoSrc.value);
const imageSrc = computed(() => {
  const img = props.enemy?.art?.image;
  if (!img) return null;
  // Full URLs and absolute paths (e.g. reused boss art at /images/bosses/…) as-is;
  // bare filenames resolve under /enemies/.
  return (/^https?:\/\//.test(img) || img.startsWith('/')) ? img : `/enemies/${img}`;
});

const onVideoError = () => {
  if (usingDamaged.value) damagedFailed.value = true;
  else idleFailed.value = true;
};
const playDamaged = () => {
  if (hitTimer) clearTimeout(hitTimer);
  hit.value = true;
  hitTimer = setTimeout(() => { hit.value = false; }, 700);
};

const currentHp = computed(() => Math.max(0, props.currentHp || 0));
const totalHp = computed(() => Math.max(1, props.totalHp || 1));
const hpPct = computed(() => Math.min(100, Math.max(0, Math.round((currentHp.value / totalHp.value) * 100))));
const formatNum = (n) => new Intl.NumberFormat('en-US').format(Math.round(n || 0));

const getOrigin = () => {
  const el = rootEl.value;
  if (!el || typeof window === 'undefined') return null;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height * 0.4;
  const jitter = () => Math.random() * 16 - 8;
  return {
    x: (cx / window.innerWidth) * 100 + jitter() * 0.4,
    y: (cy / window.innerHeight) * 100 + jitter() * 0.3,
  };
};

defineExpose({ getOrigin, playDamaged });
</script>

<style scoped>
.enemy-hit { animation: enemy-hit-anim 0.35s ease-out; }
@keyframes enemy-hit-anim {
  0%   { transform: translateX(0) scale(1); filter: brightness(1); }
  20%  { transform: translateX(-6px) scale(1.03); filter: brightness(1.8) saturate(1.4); }
  40%  { transform: translateX(6px) scale(1.02); filter: brightness(1.4); }
  60%  { transform: translateX(-4px) scale(1.01); }
  100% { transform: translateX(0) scale(1); filter: brightness(1); }
}
@media (prefers-reduced-motion: reduce) { .enemy-hit { animation: none; } }
</style>

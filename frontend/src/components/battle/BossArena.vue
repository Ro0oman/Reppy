<template>
  <div ref="rootEl"
    class="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-black/40 shadow-2xl shadow-orange-900/30">

    <!-- Boss artwork -->
    <div class="relative h-56 w-full sm:h-64 lg:h-80">
      <!-- Animated idle video (filename in DB → /video/<file>). Falls back to the
           static boss image when there's no video or it fails to load. -->
      <video v-if="showVideo" :key="videoSrc" :src="videoSrc" autoplay muted loop playsinline
        @error="onVideoError"
        :class="['absolute inset-0 h-full w-full object-cover', hit ? 'boss-hit' : '']"></video>
      <img v-else-if="imageSrc" :src="imageSrc" :alt="boss?.name"
        :class="['absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_0_25px_rgba(249,115,22,0.35)]', hit ? 'boss-hit' : '']" />
      <!-- Vignette + fire glow -->
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,rgba(249,115,22,0.18),transparent_70%)]"></div>
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 to-transparent"></div>
      <div class="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent"></div>

      <!-- Top-left: rank · Top-right: participants -->
      <div class="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 backdrop-blur-sm">
        <Trophy class="h-3.5 w-3.5 text-amber-400" />
        <span class="text-[11px] font-black tracking-wide text-amber-200">
          {{ i18n.t('battle_rank') }} {{ rank ? '#' + formatNum(rank) : '—' }}
        </span>
      </div>
      <button v-if="liveCount > 0" type="button" @click="emit('show-live')"
        class="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 backdrop-blur-sm transition-all active:scale-95 hover:border-emerald-400/40 hover:bg-emerald-500/10">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        <Users class="h-3.5 w-3.5 text-white/60" />
        <span class="text-[11px] font-bold tabular-nums text-white/70">{{ liveCount }}</span>
      </button>

      <!-- Boss identity -->
      <div class="absolute inset-x-0 bottom-2 px-4 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400/90">{{ i18n.t('battle_boss_active') }}</p>
        <h2 class="mt-0.5 bg-gradient-to-b from-amber-200 to-orange-500 bg-clip-text text-xl font-black uppercase tracking-tight text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          {{ boss?.name }}
        </h2>
      </div>
    </div>

    <!-- HP + damage strip -->
    <div class="space-y-1.5 border-t border-white/5 bg-black/50 px-4 py-2 backdrop-blur-sm">
      <!-- HP bar -->
      <div class="relative h-5 w-full overflow-hidden rounded-full border border-red-900/40 bg-black/60">
        <div class="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-500"
          :style="{ width: hpPct + '%' }"></div>
        <div class="absolute inset-0 flex items-center justify-between px-3 text-[11px] font-bold tabular-nums text-white drop-shadow">
          <span>{{ formatNum(currentHp) }} / {{ formatNum(totalHp) }} HP</span>
          <span>{{ hpPct }}%</span>
        </div>
      </div>
      <!-- Your total damage -->
      <div class="flex items-center justify-center gap-2">
        <Zap class="h-3.5 w-3.5 text-orange-400" />
        <span class="text-[11px] font-semibold uppercase tracking-wide text-white/50">{{ i18n.t('battle_total_damage') }}:</span>
        <span class="text-sm font-black tabular-nums text-orange-300">{{ formatNum(personalDamage) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Trophy, Users, Zap } from 'lucide-vue-next';
import { useI18nStore } from '@/stores/i18n';

const props = defineProps({
  boss: { type: Object, default: null },
  personalDamage: { type: Number, default: 0 },
  rank: { type: Number, default: null },
  // Live-connected players right now (same source as the operatives modal).
  liveCount: { type: Number, default: 0 },
});
const emit = defineEmits(['show-live']);

const i18n = useI18nStore();
const rootEl = ref(null);

// Boss media. The DB stores only the *filename* of locally-hosted clips
// (served from /public/video): `boss_gif` = idle loop, `boss_damaged` = hit
// reaction. The code builds the local path, and on a hit swaps to the damaged
// clip for a moment + plays a shake/flash. If there's no video (or it fails to
// load) we fall back to the static `image_url`.
const hit = ref(false);
// Independent failure tracking so a missing damage clip never disables the idle
// one (and vice-versa). Whichever clip 404s falls back on its own.
const idleFailed = ref(false);
const damagedFailed = ref(false);
let hitTimer = null;

const VIDEO_BASE = '/video/';
const toVideoSrc = (file) => (file ? VIDEO_BASE + file : null);

const idleVideoSrc = computed(() => toVideoSrc(props.boss?.boss_gif));
const damagedVideoSrc = computed(() => toVideoSrc(props.boss?.boss_damaged));

// During a hit play the damage clip (if it exists and hasn't failed); otherwise
// the idle clip. Either falling through to null shows the static image.
const usingDamaged = computed(() => hit.value && !!damagedVideoSrc.value && !damagedFailed.value);
const videoSrc = computed(() => {
  if (usingDamaged.value) return damagedVideoSrc.value;
  if (idleVideoSrc.value && !idleFailed.value) return idleVideoSrc.value;
  return null;
});
const showVideo = computed(() => !!videoSrc.value);
const imageSrc = computed(() => props.boss?.image_url || null);

// Mark only the clip that actually failed, so the other keeps working.
const onVideoError = () => {
  if (usingDamaged.value) damagedFailed.value = true;
  else idleFailed.value = true;
};

const playDamaged = () => {
  if (hitTimer) clearTimeout(hitTimer);
  hit.value = true;
  hitTimer = setTimeout(() => { hit.value = false; }, 700);
};

const currentHp = computed(() => Math.max(0, props.boss?.current_hp || 0));
const totalHp = computed(() => Math.max(1, props.boss?.total_hp || 1));
const hpPct = computed(() => Math.min(100, Math.max(0, Math.round((currentHp.value / totalHp.value) * 100))));

const formatNum = (n) => new Intl.NumberFormat('en-US').format(Math.round(n || 0));

// Returns a viewport-percentage origin centered on the boss art, for the
// flying damage numbers. Slight jitter so repeated hits don't stack exactly.
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
.boss-hit {
  animation: boss-hit-anim 0.35s ease-out;
}
@keyframes boss-hit-anim {
  0%   { transform: translateX(0) scale(1); filter: brightness(1); }
  20%  { transform: translateX(-6px) scale(1.03); filter: brightness(1.8) saturate(1.4); }
  40%  { transform: translateX(6px) scale(1.02); filter: brightness(1.4); }
  60%  { transform: translateX(-4px) scale(1.01); }
  100% { transform: translateX(0) scale(1); filter: brightness(1); }
}
@media (prefers-reduced-motion: reduce) {
  .boss-hit { animation: none; }
}
</style>

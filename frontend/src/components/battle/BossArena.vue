<template>
  <div ref="rootEl"
    class="os-arena relative overflow-hidden bg-black/40">

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
      <div class="os-arena-chip absolute left-3 top-3 flex items-center gap-1.5 backdrop-blur-sm">
        <Trophy class="h-3.5 w-3.5 text-amber-400" />
        <span class="os-num">
          {{ i18n.t('battle_rank') }} {{ rank ? '#' + formatNum(rank) : '—' }}
        </span>
      </div>
      <button v-if="liveCount > 0" type="button" @click="emit('show-live')"
        class="os-arena-chip os-arena-chip--live absolute right-3 top-3 flex items-center gap-1.5 backdrop-blur-sm transition-all active:scale-95">
        <span class="os-arena-live-dot" aria-hidden="true"></span>
        <Users class="h-3.5 w-3.5 text-white/60" />
        <span class="os-num">{{ liveCount }}</span>
      </button>

      <!-- Boss identity -->
      <div class="absolute inset-x-0 bottom-2 px-4 text-center">
        <p class="os-label os-label--orange">{{ i18n.t('battle_boss_active') }}</p>
        <h2 class="os-arena-name mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          {{ boss?.name }}
        </h2>
      </div>
    </div>

    <!-- HP + damage strip: HP es la lectura dominante -->
    <div class="space-y-2 border-t border-[var(--os-line)] bg-[var(--os-ink)]/90 px-4 py-3 backdrop-blur-sm">
      <div class="flex items-center justify-between">
        <span class="os-label os-label--muted">{{ i18n.t('battle_boss_active') }}</span>
        <span class="os-label os-num">{{ formatNum(currentHp) }} / {{ formatNum(totalHp) }} HP · {{ hpPct }}%</span>
      </div>
      <div class="os-track" style="height: 16px;">
        <div class="os-track__fill os-track__fill--danger" :style="{ width: hpPct + '%' }"></div>
      </div>
      <!-- Your total damage -->
      <div class="flex items-center justify-center gap-2 pt-0.5">
        <Zap class="h-3.5 w-3.5 text-orange-400" />
        <span class="os-label os-label--muted">{{ i18n.t('battle_total_damage') }}</span>
        <span class="os-arena-damage os-num">{{ formatNum(personalDamage) }}</span>
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
.os-arena {
  border: 1px solid var(--os-line-strong);
  border-radius: 2px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 106, 50, 0.08);
}
.os-arena-chip {
  border: 1px solid var(--os-line);
  border-radius: 2px;
  background: rgba(8, 12, 19, 0.75);
  padding: 4px 9px;
  font: 500 10px var(--os-font-mono);
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #e8d9b8;
}
.os-arena-chip--live { color: rgba(255, 255, 255, 0.75); }
.os-arena-chip--live:hover { border-color: var(--os-success); }
.os-arena-live-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--os-success);
  box-shadow: 0 0 8px var(--os-success);
  animation: os-breathe 2.6s var(--os-ease) infinite;
}
.os-arena-name {
  font: 800 1.6rem / 0.95 var(--os-font-display);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--os-text);
}
.os-arena-damage {
  font: 700 1.1rem var(--os-font-display);
  letter-spacing: 0.5px;
  color: var(--os-orange);
}
@media (prefers-reduced-motion: reduce) {
  .os-arena-live-dot { animation: none; }
}

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

<template>
  <div class="avatar-frame" :class="frameClass" :style="frameVars">
    <div class="avatar-frame__glow"></div>
    <div class="avatar-frame__border"></div>
    <div class="avatar-frame__inner">
      <img :src="src" class="avatar-frame__img" />
    </div>
    <!-- Brick overlay -->
    <div v-if="frameClass === 'frame-brick'" class="frame-brick__overlay"></div>
    <!-- Blood drips -->
    <template v-if="frameClass === 'frame-blood'">
      <div class="frame-blood__drip frame-blood__drip--1"></div>
      <div class="frame-blood__drip frame-blood__drip--2"></div>
      <div class="frame-blood__drip frame-blood__drip--3"></div>
      <div class="frame-blood__drip frame-blood__drip--4"></div>
      <div class="frame-blood__drip frame-blood__drip--5"></div>
    </template>
    <!-- Cyber scan line -->
    <div v-if="frameClass === 'frame-cyber'" class="frame-cyber__scanline"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  src: { type: String, required: true },
  borderCss: { type: String, default: '' },
  size: { type: Number, default: 40 } // px
});

// Map stored css_value identifiers to frame classes
const frameClass = computed(() => {
  const css = props.borderCss || '';
  if (css.includes('frame-furia')) return 'frame-furia';
  if (css.includes('frame-cyber')) return 'frame-cyber';
  if (css.includes('frame-blood')) return 'frame-blood';
  if (css.includes('frame-brick')) return 'frame-brick';
  if (css.includes('frame-neon-rosa')) return 'frame-neon-rosa';
  if (css.includes('frame-fuego-ambar')) return 'frame-fuego-ambar';
  return 'frame-default';
});

const frameVars = computed(() => ({
  '--frame-size': `${props.size}px`,
  '--border-width': `${Math.max(3, Math.round(props.size * 0.08))}px`
}));
</script>

<style scoped>
/* ========================================
   BASE FRAME STRUCTURE
   ======================================== */
.avatar-frame {
  position: relative;
  width: var(--frame-size);
  height: var(--frame-size);
  border-radius: 50%;
  flex-shrink: 0;
}

.avatar-frame__inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  z-index: 2;
}

.avatar-frame__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-frame__border {
  position: absolute;
  inset: calc(var(--border-width) * -1);
  border-radius: 50%;
  z-index: 1;
}

.avatar-frame__glow {
  position: absolute;
  inset: calc(var(--border-width) * -2.5);
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
}

/* ========================================
   DEFAULT - Simple subtle border
   ======================================== */
.frame-default .avatar-frame__border {
  background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3));
}

/* ========================================
   FURIA INFINITA - Animated rotating flames
   ======================================== */
.frame-furia .avatar-frame__border {
  background: conic-gradient(
    from 0deg,
    #ff4500, #ff6a00, #ffa500, #ff4500,
    #ff0000, #ff4500, #ffaa00, #ff6a00,
    #ff4500
  );
  animation: frame-rotate 2s linear infinite;
}

.frame-furia .avatar-frame__glow {
  background: radial-gradient(circle, rgba(255,69,0,0.5) 40%, transparent 70%);
  animation: frame-glow-pulse 1.5s ease-in-out infinite alternate;
}

/* ========================================
   AURA FUEGO ÁMBAR - Static flame ring
   ======================================== */
.frame-fuego-ambar .avatar-frame__border {
  background: conic-gradient(
    from 0deg,
    #f59e0b, #d97706, #b45309, #f59e0b,
    #fbbf24, #f59e0b, #d97706, #f59e0b
  );
}

.frame-fuego-ambar .avatar-frame__glow {
  background: radial-gradient(circle, rgba(245,158,11,0.4) 40%, transparent 70%);
}

/* ========================================
   AURA NEÓN ROSA - Pulsing neon glow
   ======================================== */
.frame-neon-rosa .avatar-frame__border {
  background: conic-gradient(
    from 0deg,
    #ec4899, #f472b6, #db2777, #ec4899,
    #f9a8d4, #ec4899, #be185d, #ec4899
  );
  animation: frame-rotate 4s linear infinite;
}

.frame-neon-rosa .avatar-frame__glow {
  background: radial-gradient(circle, rgba(236,72,153,0.6) 30%, transparent 70%);
  animation: frame-neon-pulse 1s ease-in-out infinite alternate;
}

/* ========================================
   BLOOD PACT - Dark red ring with blood drips
   ======================================== */
.frame-blood .avatar-frame__border {
  background: conic-gradient(
    from 0deg,
    #7f1d1d, #991b1b, #dc2626, #450a0a,
    #7f1d1d, #b91c1c, #991b1b, #7f1d1d
  );
}

.frame-blood .avatar-frame__glow {
  background: radial-gradient(circle, rgba(220,38,38,0.35) 40%, transparent 70%);
  animation: frame-blood-glow 2s ease-in-out infinite alternate;
}

.frame-blood__drip {
  position: absolute;
  width: 4px;
  background: linear-gradient(to bottom, #dc2626, #7f1d1d 60%, transparent);
  border-radius: 0 0 50% 50%;
  z-index: 3;
  animation: frame-drip 3s ease-in infinite;
}

.frame-blood__drip--1 {
  height: 12px;
  left: 15%;
  top: 85%;
  animation-delay: 0s;
}
.frame-blood__drip--2 {
  height: 16px;
  left: 40%;
  top: 90%;
  animation-delay: 0.8s;
}
.frame-blood__drip--3 {
  height: 10px;
  right: 20%;
  top: 88%;
  animation-delay: 1.6s;
}
.frame-blood__drip--4 {
  height: 14px;
  right: 35%;
  top: 92%;
  animation-delay: 2.2s;
}
.frame-blood__drip--5 {
  height: 8px;
  left: 60%;
  top: 86%;
  animation-delay: 0.4s;
}

/* ========================================
   BRICK BY BRICK - Brick pattern border
   ======================================== */
.frame-brick .avatar-frame__border {
  background:
    /* Mortar lines */
    linear-gradient(to right, #78350f 0%, #78350f 100%);
  background-color: #92400e;
  overflow: hidden;
}

.frame-brick__overlay {
  position: absolute;
  inset: calc(var(--border-width) * -1);
  border-radius: 50%;
  z-index: 1;
  /* Brick pattern using repeating gradients */
  background:
    /* Horizontal mortar lines every 6px */
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 5px,
      #451a03 5px,
      #451a03 6px
    ),
    /* Vertical mortar lines — offset every other row */
    repeating-linear-gradient(
      to right,
      transparent 0px,
      transparent 9px,
      #451a03 9px,
      #451a03 10px
    );
  background-color: #92400e;
  /* Cut out center circle for avatar */
  -webkit-mask: radial-gradient(circle, transparent calc(var(--frame-size) / 2 - 1px), black calc(var(--frame-size) / 2));
  mask: radial-gradient(circle, transparent calc(var(--frame-size) / 2 - 1px), black calc(var(--frame-size) / 2));
}

.frame-brick .avatar-frame__glow {
  background: radial-gradient(circle, rgba(146,64,14,0.3) 40%, transparent 70%);
}

/* ========================================
   NEURAL OVERDRIVE - Cyberpunk circuit border
   ======================================== */
.frame-cyber .avatar-frame__border {
  background: conic-gradient(
    from 0deg,
    #06b6d4, #0e7490, #155e75, #06b6d4,
    #22d3ee, #06b6d4, #0891b2, #06b6d4
  );
  animation: frame-rotate 3s linear infinite;
}

.frame-cyber .avatar-frame__glow {
  background: radial-gradient(circle, rgba(6,182,212,0.5) 30%, transparent 70%);
  animation: frame-neon-pulse 0.8s ease-in-out infinite alternate;
}

.frame-cyber__scanline {
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, transparent 10%, #22d3ee 40%, #22d3ee 60%, transparent 90%);
  z-index: 4;
  opacity: 0.7;
  animation: frame-scan 2s linear infinite;
  pointer-events: none;
  border-radius: 50%;
}

/* ========================================
   ANIMATIONS
   ======================================== */
@keyframes frame-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes frame-glow-pulse {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.08); }
}

@keyframes frame-neon-pulse {
  0% { opacity: 0.5; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1.1); }
}

@keyframes frame-blood-glow {
  0% { opacity: 0.3; }
  100% { opacity: 0.7; }
}

@keyframes frame-drip {
  0% { transform: translateY(0) scaleY(0); opacity: 0; }
  20% { transform: translateY(0) scaleY(1); opacity: 1; }
  80% { transform: translateY(8px) scaleY(1.2); opacity: 0.8; }
  100% { transform: translateY(14px) scaleY(0.5); opacity: 0; }
}

@keyframes frame-scan {
  0% { top: -5%; opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.7; }
  100% { top: 105%; opacity: 0; }
}
</style>

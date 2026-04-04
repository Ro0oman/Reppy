<template>
  <div class="avatar-frame" :class="frameClass" :style="frameVars">
    <div class="avatar-frame__glow"></div>
    <div class="avatar-frame__border"></div>
    <div class="avatar-frame__inner">
      <div class="avatar-frame__avatar" :class="avatarCss" :style="{ '--avatar-url': `url(${src})` }"></div>
    </div>

    <!-- Brick overlay -->
    <div v-if="frameClass === 'frame-brick'" class="frame-brick__overlay"></div>

    <!-- Blood drops (teardrop shaped) -->
    <template v-if="frameClass === 'frame-blood'">
      <div class="blood-drop blood-drop--1"></div>
      <div class="blood-drop blood-drop--2"></div>
      <div class="blood-drop blood-drop--3"></div>
      <div class="blood-drop blood-drop--4"></div>
      <div class="blood-drop blood-drop--5"></div>
      <div class="blood-drop blood-drop--6"></div>
    </template>

    <!-- Furia Infinita flames -->
    <template v-if="frameClass === 'frame-furia'">
      <div class="flame flame--1"></div>
      <div class="flame flame--2"></div>
      <div class="flame flame--3"></div>
      <div class="flame flame--4"></div>
      <div class="flame flame--5"></div>
      <div class="flame flame--6"></div>
      <div class="flame flame--7"></div>
      <div class="flame flame--8"></div>
    </template>

    <!-- Cyberpunk circuits -->
    <template v-if="frameClass === 'frame-cyber'">
      <div class="cyber-ring"></div>
      <div class="cyber-node cyber-node--1"></div>
      <div class="cyber-node cyber-node--2"></div>
      <div class="cyber-node cyber-node--3"></div>
      <div class="cyber-node cyber-node--4"></div>
      <div class="cyber-line cyber-line--1"></div>
      <div class="cyber-line cyber-line--2"></div>
      <div class="cyber-line cyber-line--3"></div>
      <div class="cyber-line cyber-line--4"></div>
      <div class="cyber-scanline"></div>
      <div class="cyber-glitch"></div>
    </template>

    <!-- Mana Surge (Legendary) -->
    <template v-if="frameClass === 'frame-mana'">
      <div class="mana-bubble mana-bubble--1"></div>
      <div class="mana-bubble mana-bubble--2"></div>
      <div class="mana-bubble mana-bubble--3"></div>
      <div class="mana-arc"></div>
    </template>

    <!-- Lava Core (Legendary) -->
    <template v-if="frameClass === 'frame-lava'">
      <div class="lava-spark lava-spark--1"></div>
      <div class="lava-spark lava-spark--2"></div>
      <div class="lava-smoke"></div>
    </template>

    <!-- Prismatic Aura (Legendary) -->
    <template v-if="frameClass === 'frame-prismatic'">
      <div class="prismatic-glitch prismatic-glitch--1"></div>
      <div class="prismatic-glitch prismatic-glitch--2"></div>
      <div class="prismatic-ring"></div>
    </template>

    <!-- Event Horizon / Void Knight (Legendary) -->
    <template v-if="frameClass === 'frame-void'">
      <div class="void-particle void-particle--1"></div>
      <div class="void-particle void-particle--2"></div>
      <div class="void-particle void-particle--3"></div>
      <div class="void-ring"></div>
      <div class="void-swirl"></div>
    </template>

    <!-- Digital Katana / Ronin (Legendary) -->
    <template v-if="frameClass === 'frame-ronin'">
      <div class="ronin-shard ronin-shard--1"></div>
      <div class="ronin-shard ronin-shard--2"></div>
      <div class="ronin-shard ronin-shard--3"></div>
      <div class="ronin-glitch-layer"></div>
    </template>

    <!-- Sacrificial Altar / Blood God (Legendary) -->
    <template v-if="frameClass === 'frame-blood-god'">
      <div class="blood-rune blood-rune--1">ᚦ</div>
      <div class="blood-rune blood-rune--2">ᚫ</div>
      <div class="blood-rune blood-rune--3">ᚩ</div>
      <div class="blood-rune blood-rune--4">ᚬ</div>
      <div class="blood-pool"></div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  src: { type: String, required: true },
  borderCss: { type: String, default: '' },
  avatarCss: { type: String, default: '' },
  size: { type: Number, default: 40 }
});

const frameClass = computed(() => {
  const css = props.borderCss || '';
  if (css.includes('frame-furia')) return 'frame-furia';
  if (css.includes('frame-cyber')) return 'frame-cyber';
  if (css.includes('frame-blood')) return 'frame-blood';
  if (css.includes('frame-brick')) return 'frame-brick';
  if (css.includes('frame-neon-rosa')) return 'frame-neon-rosa';
  if (css.includes('frame-fuego-ambar')) return 'frame-fuego-ambar';
  if (css.includes('frame-mana')) return 'frame-mana';
  if (css.includes('frame-lava')) return 'frame-lava';
  if (css.includes('frame-prismatic')) return 'frame-prismatic';
  if (css.includes('frame-void')) return 'frame-void';
  if (css.includes('frame-ronin')) return 'frame-ronin';
  if (css.includes('frame-blood-god')) return 'frame-blood-god';
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
  position: absolute;
  inset: 12%; 
  border-radius: 50%;
  overflow: hidden;
  z-index: 2;
  background: #000;
}

.avatar-frame__avatar {
  width: 100%;
  height: 100%;
  background-image: var(--avatar-url);
  background-size: cover;
  background-position: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-frame__avatar::before,
.avatar-frame__avatar::after {
  content: '';
  position: absolute;
  inset: 0;
  display: none;
  background-image: var(--avatar-url);
  background-size: cover;
  background-position: center;
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
   DEFAULT
   ======================================== */
.frame-default .avatar-frame__border {
  background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3));
}

/* ========================================
   FURIA INFINITA — Real animated flames
   ======================================== */
.frame-furia .avatar-frame__border {
  background: conic-gradient(
    from 0deg,
    #ff4500, #ff6a00, #ffa500, #ff4500,
    #ff0000, #ff4500, #ffaa00, #ff6a00, #ff4500
  );
  animation: frame-rotate 3s linear infinite;
}

.frame-furia .avatar-frame__glow {
  background: radial-gradient(circle, rgba(255,69,0,0.5) 40%, transparent 70%);
  animation: frame-glow-pulse 1.5s ease-in-out infinite alternate;
}

/* Individual flame tongues */
.flame {
  position: absolute;
  z-index: 3;
  pointer-events: none;
  /* Teardrop/flame shape */
  border-radius: 0 80% 50% 80%;
  background: linear-gradient(to top, #ff4500, #ff8c00 40%, #ffd700 80%, transparent);
  filter: blur(1px);
  opacity: 0;
  transform-origin: bottom center;
  animation: flame-dance 1.2s ease-in-out infinite;
}

.flame--1 {
  width: 8px; height: 16px;
  top: -8px; left: 30%;
  transform: rotate(-15deg);
  animation-delay: 0s;
  animation-duration: 1s;
}
.flame--2 {
  width: 10px; height: 20px;
  top: -12px; left: 50%;
  transform: rotate(0deg);
  animation-delay: 0.15s;
  animation-duration: 1.1s;
}
.flame--3 {
  width: 7px; height: 14px;
  top: -6px; right: 25%;
  transform: rotate(12deg);
  animation-delay: 0.3s;
  animation-duration: 0.9s;
}
.flame--4 {
  width: 9px; height: 18px;
  top: 5%; right: -4px;
  transform: rotate(75deg);
  animation-delay: 0.5s;
  animation-duration: 1.2s;
}
.flame--5 {
  width: 8px; height: 15px;
  bottom: 10%; right: -6px;
  transform: rotate(85deg);
  animation-delay: 0.7s;
  animation-duration: 1s;
}
.flame--6 {
  width: 7px; height: 13px;
  bottom: -4px; right: 35%;
  transform: rotate(170deg);
  animation-delay: 0.2s;
  animation-duration: 1.1s;
}
.flame--7 {
  width: 9px; height: 17px;
  bottom: 5%; left: -5px;
  transform: rotate(-80deg);
  animation-delay: 0.4s;
  animation-duration: 0.95s;
}
.flame--8 {
  width: 6px; height: 12px;
  top: 15%; left: -4px;
  transform: rotate(-70deg);
  animation-delay: 0.6s;
  animation-duration: 1.15s;
}

/* ========================================
   AURA FUEGO ÁMBAR — Static flame ring
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
   AURA NEÓN ROSA — Pulsing neon glow
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
   BLOOD PACT — Teardrop blood drops
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

/* Realistic teardrop-shaped blood drops */
.blood-drop {
  position: absolute;
  z-index: 3;
  pointer-events: none;
  /* Teardrop shape: pointy top, round bottom */
  width: 6px;
  height: 10px;
  background: radial-gradient(ellipse at 50% 70%, #ef4444, #991b1b 60%, #7f1d1d);
  border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%;
  box-shadow: 0 0 4px rgba(220,38,38,0.6), inset 0 -2px 3px rgba(0,0,0,0.3);
  opacity: 0;
  animation: blood-fall 3.5s ease-in infinite;
}

/* Highlight/sheen on the drop */
.blood-drop::after {
  content: '';
  position: absolute;
  top: 25%;
  left: 20%;
  width: 2px;
  height: 3px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
}

.blood-drop--1 {
  left: 18%;
  top: 82%;
  width: 5px; height: 9px;
  animation-delay: 0s;
}
.blood-drop--2 {
  left: 38%;
  top: 90%;
  width: 7px; height: 12px;
  animation-delay: 0.7s;
  animation-duration: 3s;
}
.blood-drop--3 {
  right: 22%;
  top: 84%;
  width: 5px; height: 8px;
  animation-delay: 1.4s;
  animation-duration: 3.8s;
}
.blood-drop--4 {
  right: 38%;
  top: 92%;
  width: 6px; height: 11px;
  animation-delay: 2.1s;
}
.blood-drop--5 {
  left: 55%;
  top: 88%;
  width: 4px; height: 7px;
  animation-delay: 0.4s;
  animation-duration: 4s;
}
.blood-drop--6 {
  left: 8%;
  top: 75%;
  width: 5px; height: 9px;
  animation-delay: 1.8s;
  animation-duration: 3.2s;
}

/* ========================================
   BRICK BY BRICK
   ======================================== */
.frame-brick .avatar-frame__border {
  background: linear-gradient(to right, #78350f 0%, #78350f 100%);
  background-color: #92400e;
  overflow: hidden;
}

.frame-brick__overlay {
  position: absolute;
  inset: calc(var(--border-width) * -1);
  border-radius: 50%;
  z-index: 1;
  background:
    repeating-linear-gradient(
      to bottom,
      transparent 0px, transparent 5px,
      #451a03 5px, #451a03 6px
    ),
    repeating-linear-gradient(
      to right,
      transparent 0px, transparent 9px,
      #451a03 9px, #451a03 10px
    );
  background-color: #92400e;
  -webkit-mask: radial-gradient(circle, transparent calc(var(--frame-size) / 2 - 1px), black calc(var(--frame-size) / 2));
  mask: radial-gradient(circle, transparent calc(var(--frame-size) / 2 - 1px), black calc(var(--frame-size) / 2));
}

.frame-brick .avatar-frame__glow {
  background: radial-gradient(circle, rgba(146,64,14,0.3) 40%, transparent 70%);
}

/* ========================================
   NEURAL OVERDRIVE — Cyberpunk circuits
   ======================================== */
.frame-cyber .avatar-frame__border {
  background: #0c0c1a;
  border: 2px solid #06b6d4;
  box-shadow: 0 0 8px rgba(6,182,212,0.5), inset 0 0 8px rgba(6,182,212,0.2);
}

.frame-cyber .avatar-frame__glow {
  background: radial-gradient(circle, rgba(6,182,212,0.3) 30%, transparent 70%);
  animation: frame-neon-pulse 1.5s ease-in-out infinite alternate;
}

/* Outer rotating ring with dashes (circuit trace) */
.cyber-ring {
  position: absolute;
  inset: calc(var(--border-width) * -2);
  border-radius: 50%;
  border: 1px dashed rgba(6,182,212,0.4);
  z-index: 0;
  animation: frame-rotate 8s linear infinite;
}

/* Glowing circuit nodes */
.cyber-node {
  position: absolute;
  width: 5px;
  height: 5px;
  background: #22d3ee;
  border-radius: 50%;
  z-index: 4;
  box-shadow: 0 0 6px #22d3ee, 0 0 12px rgba(34,211,238,0.4);
  animation: cyber-blink 2s ease-in-out infinite;
}

.cyber-node--1 { top: -3px; left: 50%; transform: translateX(-50%); animation-delay: 0s; }
.cyber-node--2 { bottom: -3px; left: 50%; transform: translateX(-50%); animation-delay: 0.5s; }
.cyber-node--3 { left: -3px; top: 50%; transform: translateY(-50%); animation-delay: 1s; }
.cyber-node--4 { right: -3px; top: 50%; transform: translateY(-50%); animation-delay: 1.5s; }

/* Circuit lines extending from nodes */
.cyber-line {
  position: absolute;
  background: linear-gradient(to right, #22d3ee, transparent);
  height: 1px;
  z-index: 3;
  opacity: 0.6;
  animation: cyber-line-pulse 2s ease-in-out infinite alternate;
}

.cyber-line--1 {
  width: 12px;
  top: -1px;
  left: 50%;
  transform: translateX(-50%) rotate(0deg);
  transform-origin: center bottom;
  animation-delay: 0s;
}
.cyber-line--2 {
  width: 10px;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
  transform-origin: center top;
  animation-delay: 0.5s;
}
.cyber-line--3 {
  width: 14px;
  left: -2px;
  top: 50%;
  transform: translateY(-50%) rotate(0deg);
  transform-origin: right center;
  animation-delay: 1s;
}
.cyber-line--4 {
  width: 11px;
  right: -2px;
  top: 50%;
  transform: translateY(-50%) rotate(180deg);
  transform-origin: left center;
  animation-delay: 1.5s;
}

/* Scanning line */
.cyber-scanline {
  position: absolute;
  left: 5%;
  right: 5%;
  width: 90%;
  height: 2px;
  background: linear-gradient(to right, transparent 5%, #22d3ee 30%, #67e8f9 50%, #22d3ee 70%, transparent 95%);
  z-index: 5;
  opacity: 0.8;
  animation: frame-scan 2.5s linear infinite;
  pointer-events: none;
  border-radius: 1px;
  box-shadow: 0 0 6px rgba(34,211,238,0.6);
}

/* Glitch offset effect */
.cyber-glitch {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
  z-index: 6;
  pointer-events: none;
  opacity: 0;
  animation: cyber-glitch-flash 4s linear infinite;
}

.cyber-glitch::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(34,211,238,0.15);
  clip-path: polygon(0 40%, 100% 38%, 100% 45%, 0 47%);
}

/* ========================================
   LEGENDARY: MANA SURGE
   ======================================== */
.frame-mana .avatar-frame__border {
  background: conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6);
  animation: frame-rotate 2s linear infinite;
}

.frame-mana .avatar-frame__glow {
  background: radial-gradient(circle, rgba(59,130,246,0.6) 30%, transparent 70%);
  animation: frame-neon-pulse 1.2s ease-in-out infinite alternate;
}

.mana-bubble {
  position: absolute;
  background: white;
  border-radius: 50%;
  z-index: 5;
  opacity: 0;
  animation: mana-float 2s ease-out infinite;
}

.mana-bubble--1 { width: 4px; height: 4px; left: 20%; top: 80%; animation-delay: 0s; }
.mana-bubble--2 { width: 3px; height: 3px; right: 25%; bottom: 15%; animation-delay: 0.7s; }
.mana-bubble--3 { width: 5px; height: 5px; left: 50%; bottom: -5px; animation-delay: 1.3s; }

.mana-arc {
  position: absolute;
  inset: -10%;
  border-radius: 50%;
  border: 1px solid rgba(139, 92, 246, 0.5);
  z-index: 1;
  animation: frame-rotate 4s reverse linear infinite;
  clip-path: polygon(0 0, 100% 0, 100% 30%, 0 30%);
}

/* ========================================
   LEGENDARY: LAVA CORE
   ======================================== */
.frame-lava .avatar-frame__border {
  background: radial-gradient(circle, #f97316 20%, #ef4444 80%);
  border: 2px solid #7c2d12;
  animation: lava-pulse 2s ease-in-out infinite alternate;
}

.frame-lava .avatar-frame__glow {
  background: radial-gradient(circle, rgba(239,68,68,0.5) 40%, transparent 70%);
  animation: frame-glow-pulse 0.8s ease-in-out infinite alternate;
}

.lava-spark {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fbbf24;
  border-radius: 50%;
  z-index: 4;
  filter: blur(1px);
  animation: lava-fly 1.5s ease-out infinite;
}

.lava-spark--1 { left: 15%; bottom: 20%; animation-delay: 0s; }
.lava-spark--2 { right: 15%; bottom: 25%; animation-delay: 0.5s; }

.lava-smoke {
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle, rgba(0,0,0,0.4) 0%, transparent 60%);
  z-index: -1;
  animation: frame-glow-pulse 3s infinite alternate;
}

/* ========================================
   LEGENDARY: PRISMATIC AURA
   ======================================== */
.frame-prismatic .avatar-frame__border {
  background: conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
  animation: frame-rotate 1s linear infinite;
}

.frame-prismatic .avatar-frame__glow {
  background: conic-gradient(from 0deg, rgba(255,0,0,0.4), rgba(0,255,0,0.4), rgba(0,0,255,0.4), rgba(255,0,0,0.4));
  filter: blur(15px);
  animation: frame-rotate 2s linear infinite;
}

.prismatic-ring {
  position: absolute;
  inset: -15%;
  border: 2px solid white;
  border-radius: 50%;
  opacity: 0.3;
  z-index: 0;
  animation: frame-rotate 5s reverse linear infinite;
  clip-path: polygon(0 0, 100% 0, 100% 5%, 0 5%, 0 95%, 100% 95%, 100% 100%, 0 100%);
}

.prismatic-glitch {
  position: absolute;
  background: white;
  height: 1px;
  width: 40%;
  z-index: 10;
  opacity: 0;
  animation: prismatic-glitch-anim 3s steps(1) infinite;
}

.prismatic-glitch--1 { top: 30%; left: 10%; animation-delay: 0.5s; }
.prismatic-glitch--2 { bottom: 20%; right: 10%; animation-delay: 1.8s; }

/* ========================================
   LEGENDARY: EVENT HORIZON (VOID)
   ======================================== */
.frame-void .avatar-frame__border {
  background: conic-gradient(from 0deg, #4c1d95, #6d28d9, #1e1b4b, #4c1d95);
  animation: frame-rotate 3s linear infinite;
}

.frame-void .avatar-frame__glow {
  background: radial-gradient(circle, rgba(109, 40, 217, 0.6) 30%, transparent 70%);
  animation: frame-glow-pulse 2s ease-in-out infinite alternate;
}

.void-ring {
  position: absolute;
  inset: -15%;
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 50%;
  animation: frame-rotate 10s linear infinite;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
}

.void-swirl {
  position: absolute;
  inset: -5%;
  border-radius: 50%;
  background: conic-gradient(from 180deg, transparent, rgba(139, 92, 246, 0.4), transparent);
  animation: frame-rotate 1.5s linear infinite;
}

.void-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #a78bfa;
  border-radius: 50%;
  z-index: 5;
  filter: blur(1px);
  animation: void-swallow 2.5s ease-in infinite;
}

.void-particle--1 { top: 10%; left: 10%; animation-delay: 0s; }
.void-particle--2 { top: 80%; right: 15%; animation-delay: 0.8s; }
.void-particle--3 { bottom: 5%; left: 45%; animation-delay: 1.5s; }

@keyframes void-swallow {
  0% { transform: rotate(0deg) translateX(40px) scale(1); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: rotate(360deg) translateX(0) scale(0); opacity: 0; }
}

/* ========================================
   LEGENDARY: DIGITAL KATANA (RONIN)
   ======================================== */
.frame-ronin .avatar-frame__border {
  background: #000;
  border: 2px solid #ef4444;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
}

.frame-ronin .avatar-frame__glow {
  background: radial-gradient(circle, rgba(239, 68, 68, 0.4) 30%, transparent 70%);
  animation: frame-neon-pulse 0.5s ease-in-out infinite alternate;
}

.ronin-shard {
  position: absolute;
  width: 15px;
  height: 2px;
  background: #ef4444;
  z-index: 5;
  box-shadow: 0 0 8px #ef4444;
}

.ronin-shard--1 { top: -5px; left: 20%; animation: ronin-slash 0.8s linear infinite; }
.ronin-shard--2 { bottom: -5px; right: 20%; animation: ronin-slash 1.2s linear infinite reverse; }
.ronin-shard--3 { left: -5px; top: 40%; transform: rotate(90deg); animation: ronin-slash 1s linear infinite; }

@keyframes ronin-slash {
  0% { transform: translateX(-20px) skewX(-45deg); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(40px) skewX(-45deg); opacity: 0; }
}

.ronin-glitch-layer {
  position: absolute;
  inset: -10%;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 50%;
  animation: ronin-glitch-border 4s steps(2) infinite;
}

@keyframes ronin-glitch-border {
  0%, 100% { transform: translate(0); opacity: 0.5; }
  25% { transform: translate(2px, -2px); opacity: 1; border-color: #06b6d4; }
  50% { transform: translate(-2px, 2px); opacity: 0.5; }
  75% { transform: translate(1px, 1px); opacity: 1; border-color: #f59e0b; }
}

/* ========================================
   LEGENDARY: SACRIFICIAL ALTAR (BLOOD GOD)
   ======================================== */
.frame-blood-god .avatar-frame__border {
  background: radial-gradient(circle, #7f1d1d 0%, #450a0a 100%);
  border: 2px solid #991b1b;
}

.frame-blood-god .avatar-frame__glow {
  background: radial-gradient(circle, rgba(153, 27, 27, 0.7) 40%, transparent 80%);
  animation: frame-glow-pulse 1.2s ease-in-out infinite alternate;
}

.blood-rune {
  position: absolute;
  color: #ef4444;
  font-size: 10px;
  font-weight: bold;
  z-index: 5;
  text-shadow: 0 0 5px #ef4444;
  animation: rune-glow 2s ease-in-out infinite alternate;
}

.blood-rune--1 { top: -8px; left: 50%; transform: translateX(-50%); }
.blood-rune--2 { bottom: -8px; left: 50%; transform: translateX(-50%); }
.blood-rune--3 { left: -8px; top: 50%; transform: translateY(-50%); }
.blood-rune--4 { right: -8px; top: 50%; transform: translateY(-50%); }

@keyframes rune-glow {
  from { opacity: 0.4; filter: blur(1px); }
  to { opacity: 1; filter: blur(0); }
}

.blood-pool {
  position: absolute;
  inset: -15%;
  background: radial-gradient(circle, rgba(127, 29, 29, 0.4) 0%, transparent 70%);
  z-index: -1;
  animation: blood-pulse-large 3s ease-in-out infinite alternate;
}

@keyframes blood-pulse-large {
  from { transform: scale(0.9); opacity: 0.5; }
  to { transform: scale(1.2); opacity: 1; }
}

/* ========================================
   ANIMATIONS
   ======================================== */
@keyframes frame-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ========================================
   PREMIUM AVATAR ANIMATIONS (v2)
   ======================================== */

/* 1. Cyber Neon (Rare) - Scanlines & Liquid Glow */
.avatar-pulse {
  box-shadow: inset 0 0 10px rgba(34, 211, 238, 0.5);
  animation: cyber-neon-pulse 2s infinite ease-in-out;
}
.avatar-pulse::after {
  display: block;
  background: linear-gradient(to bottom, transparent 40%, rgba(34, 211, 238, 0.4) 50%, transparent 60%);
  background-size: 100% 200%;
  animation: scanline 3s linear infinite;
  mix-blend-mode: overlay;
}
@keyframes cyber-neon-pulse {
  0%, 100% { filter: drop-shadow(0 0 2px cyan) brightness(1); }
  50% { filter: drop-shadow(0 0 8px cyan) brightness(1.2); }
}
@keyframes scanline {
  from { background-position: 0 100%; }
  to { background-position: 0 -100%; }
}

/* 2. Glitch Overdrive (Legendary) - Chromatic Aberration & Tearing */
.avatar-glitch {
  animation: glitch-main 4s infinite step-end;
}
.avatar-glitch::before, .avatar-glitch::after {
  display: block;
  mix-blend-mode: screen;
}
.avatar-glitch::before {
  animation: glitch-cyan 2s infinite linear alternate-reverse;
  filter: hue-rotate(90deg) brightness(1.5);
  transform: translateX(2px);
}
.avatar-glitch::after {
  animation: glitch-red 1.5s infinite linear alternate;
  filter: hue-rotate(-90deg) contrast(1.5);
  transform: translateX(-2px);
}
@keyframes glitch-main {
  0%, 90%, 100% { transform: scale(1); filter: none; }
  92% { transform: skew(5deg); filter: contrast(2); }
  94% { transform: skew(-5deg); filter: invert(0.1); }
  96% { transform: scale(1.1); filter: hue-rotate(45deg); }
}
@keyframes glitch-cyan {
  0% { clip-path: inset(80% 0 0 0); }
  20% { clip-path: inset(20% 0 60% 0); }
  40% { clip-path: inset(50% 0 10% 0); }
  60% { clip-path: inset(10% 0 70% 0); }
  100% { clip-path: inset(0 0 0 0); }
}
@keyframes glitch-red {
  0% { clip-path: inset(0 0 80% 0); }
  30% { clip-path: inset(60% 0 20% 0); }
  70% { clip-path: inset(10% 0 40% 0); }
  100% { clip-path: inset(0 0 0 0); }
}

/* 3. Eternal Flame (Legendary) - Heat Distortion & Embers */
.avatar-infernal {
  filter: sepia(0.3) saturate(1.5) contrast(1.1);
  animation: heat-distort 3s infinite ease-in-out;
}
.avatar-infernal::before {
  display: block;
  background: radial-gradient(circle at center, #f97316 10%, transparent 20%);
  background-size: 8px 8px;
  animation: embers 4s linear infinite;
  opacity: 0.6;
  mix-blend-mode: screen;
}
.avatar-infernal::after {
  display: block;
  box-shadow: inset 0 -20px 30px -10px #ef4444;
  animation: fire-flicker 0.5s infinite alternate;
}
@keyframes heat-distort {
  0%, 100% { border-radius: 50% 48% 52% 50% / 50% 52% 48% 50%; }
  50% { border-radius: 48% 52% 50% 48% / 52% 48% 52% 50%; transform: scale(1.02) skew(1deg); }
}
@keyframes embers {
  from { background-position: 0 0; transform: translateY(0) scale(1); }
  to { background-position: -20px -100px; transform: translateY(-20px) scale(0.5); }
}
@keyframes fire-flicker {
  from { filter: brightness(1); }
  to { filter: brightness(1.3) contrast(1.2); }
}

/* 4. Phantom Echo (Legendary) - Ghostly Trail */
.avatar-spectral {
  filter: grayscale(0.2) contrast(1.2);
  animation: phantom-float 5s infinite ease-in-out;
}
.avatar-spectral::after {
  display: block;
  opacity: 0.3;
  filter: blur(2px) grayscale(1) invert(0.2);
  transform: scale(1.1);
  animation: ghost-trail 3s infinite ease-out;
  mix-blend-mode: lighten;
}
@keyframes phantom-float {
  0%, 100% { transform: translateY(0); filter: brightness(1); }
  50% { transform: translateY(-4px); filter: brightness(1.4) drop-shadow(0 0 10px rgba(168, 85, 247, 0.4)); }
}
@keyframes ghost-trail {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(1.5); opacity: 0; filter: blur(10px); }
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

/* Flame tongue animation — flicker up and down */
@keyframes flame-dance {
  0% {
    opacity: 0;
    transform: scaleY(0.3) scaleX(0.8);
  }
  15% {
    opacity: 0.9;
    transform: scaleY(1) scaleX(1);
  }
  30% {
    opacity: 1;
    transform: scaleY(1.2) scaleX(0.9);
  }
  50% {
    opacity: 0.8;
    transform: scaleY(0.9) scaleX(1.1);
  }
  70% {
    opacity: 1;
    transform: scaleY(1.1) scaleX(0.85);
  }
  85% {
    opacity: 0.6;
    transform: scaleY(0.7) scaleX(0.9);
  }
  100% {
    opacity: 0;
    transform: scaleY(0.2) scaleX(0.7);
  }
}

/* Realistic blood drop falling */
@keyframes blood-fall {
  0% {
    transform: translateY(-2px) scale(0.3);
    opacity: 0;
  }
  8% {
    /* Drop forms — grows from border */
    transform: translateY(0) scale(0.7);
    opacity: 0.8;
  }
  15% {
    /* Drop is full, hanging */
    transform: translateY(1px) scale(1);
    opacity: 1;
  }
  25% {
    /* Stretches before release */
    transform: translateY(2px) scaleY(1.3) scaleX(0.8);
    opacity: 1;
  }
  35% {
    /* Detaches and starts falling */
    transform: translateY(8px) scaleY(1.1) scaleX(0.9);
    opacity: 0.9;
  }
  55% {
    /* Falling */
    transform: translateY(16px) scaleY(1) scaleX(1);
    opacity: 0.7;
  }
  75% {
    /* Getting smaller as it falls */
    transform: translateY(22px) scale(0.6);
    opacity: 0.4;
  }
  100% {
    transform: translateY(28px) scale(0.2);
    opacity: 0;
  }
}

/* Cyberpunk node blink */
@keyframes cyber-blink {
  0%, 40%, 60%, 100% { opacity: 1; box-shadow: 0 0 6px #22d3ee, 0 0 12px rgba(34,211,238,0.4); }
  50% { opacity: 0.3; box-shadow: 0 0 2px #22d3ee; }
}

/* Cyberpunk line pulse */
@keyframes cyber-line-pulse {
  0% { opacity: 0.3; width: 8px; }
  100% { opacity: 0.8; width: 14px; }
}

/* Scan line moving top to bottom */
@keyframes frame-scan {
  0% { top: -5%; opacity: 0; }
  5% { opacity: 0.8; }
  95% { opacity: 0.8; }
  100% { top: 105%; opacity: 0; }
}

/* Cyberpunk glitch flash */
@keyframes cyber-glitch-flash {
  0%, 92%, 94%, 96%, 98%, 100% { opacity: 0; }
  93% { opacity: 1; transform: translateX(-2px); }
  95% { opacity: 1; transform: translateX(2px); }
  97% { opacity: 0.8; transform: translateX(-1px); }
  99% { opacity: 1; transform: translateX(1px); }
}

@keyframes mana-float {
  0% { transform: translateY(0); opacity: 0; }
  20% { opacity: 0.8; }
  80% { opacity: 0.8; }
  100% { transform: translateY(-30px); opacity: 0; }
}

@keyframes lava-pulse {
  0% { transform: scale(1); filter: brightness(1); }
  100% { transform: scale(1.05); filter: brightness(1.3); }
}

@keyframes lava-fly {
  0% { transform: translate(0, 0) scale(1); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(5px, -40px) scale(0.2); opacity: 0; }
}

@keyframes prismatic-glitch-anim {
  0%, 10%, 15%, 25%, 30%, 40%, 45%, 55%, 60%, 70%, 75%, 85%, 90%, 100% { opacity: 0; transform: scaleX(0); }
  12%, 27%, 42%, 57%, 72%, 87% { opacity: 0.8; transform: scaleX(1.2); }
}
</style>

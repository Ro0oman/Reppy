<script setup>
import { computed, watch } from 'vue';
import { useStyleTag } from '@vueuse/core';

const props = defineProps({
  backgroundCss: {
    type: String,
    default: ''
  },
  isPreview: {
    type: Boolean,
    default: false
  }
});

const isRawCss = computed(() => {
  const val = props.backgroundCss;
  return val && (val.includes('{') || val.includes('@'));
});

// Manage raw CSS injection (ID removed to avoid conflicts in lists)
const { css, load, unload } = useStyleTag('');

watch(() => props.backgroundCss, (newVal) => {
  if (isRawCss.value && !props.isPreview) {
    css.value = newVal;
    load();
  } else {
    css.value = '';
    unload();
  }
}, { immediate: true });

const activeEffect = computed(() => {
  if (isRawCss.value) return 'bg-raw-custom';
  return props.backgroundCss || 'bg-pure-black';
});

const eggs = [
  { left: 10, duration: 15, delay: -2, rotation: 45, emoji: '🥚' },
  { left: 25, duration: 22, delay: -5, rotation: 90, emoji: '🐰' },
  { left: 40, duration: 18, delay: -10, rotation: 120, emoji: '🐣' },
  { left: 55, duration: 25, delay: -1, rotation: 180, emoji: '🐇' },
  { left: 70, duration: 20, delay: -15, rotation: 210, emoji: '💪' },
  { left: 85, duration: 16, delay: -7, rotation: 300, emoji: '🥚' },
  { left: 33, duration: 28, delay: -20, rotation: 15, emoji: '🏋️' },
  { left: 66, duration: 19, delay: -3, rotation: 240, emoji: '🐰' },
  { left: 95, duration: 24, delay: -12, rotation: 60, emoji: '🐣' }
];

const matrixChars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ";
const matrixColumns = computed(() => {
  return Array.from({ length: 20 }, (_, i) => ({
    left: i * 5,
    delay: Math.random() * -20,
    duration: 5 + Math.random() * 10,
    char: matrixChars[Math.floor(Math.random() * matrixChars.length)]
  }));
});
</script>

<template>
  <div v-if="activeEffect" class="background-effect-container" :class="[activeEffect, { 'is-preview': isPreview }]">
    <!-- 1. Neural Grid -->
    <div v-if="activeEffect === 'bg-neural-grid'" class="neural-lines"></div>

    <!-- 2. Deep Ocean -->
    <div v-if="activeEffect === 'bg-deep-ocean'" class="ocean-waves">
      <div class="wave"></div>
      <div class="wave"></div>
    </div>

    <!-- 3. Cyber Horizon (NEW PREMIUM) -->
    <div v-if="activeEffect === 'bg-cyber-horizon'" class="cyber-horizon">
      <div class="sun"></div>
      <div class="grid-floor"></div>
      <div class="glow-overlay"></div>
    </div>

    <!-- 4. Digital Rain (NEW PREMIUM) -->
    <div v-if="activeEffect === 'bg-digital-rain'" class="digital-rain">
      <div v-for="(col, i) in matrixColumns" :key="i" 
        class="matrix-column"
        :style="{ left: `${col.left}%`, animationDelay: `${col.delay}s`, animationDuration: `${col.duration}s` }">
        {{ col.char }}
      </div>
    </div>
    
    <!-- 11. bg-easter -->
    <div v-if="activeEffect === 'bg-easter'" class="easter-rain">
      <div v-for="(egg, index) in eggs" :key="index" 
        class="falling-egg"
        :style="{
          left: `${egg.left}%`,
          animationDuration: `${egg.duration}s`,
          animationDelay: `${egg.delay}s`,
          transform: `rotate(${egg.rotation}deg)`
        }">
        {{ egg.emoji }}
      </div>
    </div>

    <!-- 12. bg-glitch (Digital Storm) -->
    <div v-if="activeEffect === 'bg-glitch'" class="glitch-overlay">
      <div class="scanline"></div>
      <div class="glitch-chromatic"></div>
    </div>

    <!-- 13. bg-lava (Inferno) -->
    <div v-if="activeEffect === 'bg-lava'" class="lava-embers">
      <div v-for="i in 15" :key="i" class="ember" :style="{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 4}s` }"></div>
    </div>

    <!-- 14. bg-void (Cosmic Nebula) -->
    <div v-if="activeEffect === 'bg-void'" class="void-cosmos">
      <div v-for="i in 30" :key="i" class="star" :style="{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 10}s` }"></div>
      <div class="nebula"></div>
    </div>

    <!-- 15. bg-ronin (Neo Tokyo) -->
    <div v-if="activeEffect === 'bg-ronin'" class="ronin-rain">
      <div v-for="i in 20" :key="i" class="data-drop" :style="{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * -10}s`, animationDuration: `${2 + Math.random() * 2}s` }"></div>
      <div class="neon-city-glow"></div>
    </div>

    <!-- 16. bg-blood (Crimson Tide) -->
    <div v-if="activeEffect === 'bg-blood'" class="blood-waves">
      <div class="blood-wave blood-wave--1"></div>
      <div class="blood-wave blood-wave--2"></div>
    </div>

    <!-- 17. bg-hyperspace (Hyperspace) -->
    <div v-if="activeEffect === 'bg-hyperspace'" class="hyperspace-container">
      <div v-for="i in 50" :key="i" class="streak" 
        :style="{ 
          left: `${Math.random() * 100}%`, 
          top: `${Math.random() * 100}%`, 
          animationDelay: `${Math.random() * -5}s`, 
          animationDuration: `${0.5 + Math.random() * 1}s`,
          transform: `rotate(${Math.random() * 360}deg)`
        }">
      </div>
    </div>
  </div>
</template>

<style scoped>
.background-effect-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -2;
  pointer-events: none;
  overflow: hidden;
  transition: all 1s ease-in-out;
}

.background-effect-container.is-preview {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
}

/* 1. Protocol Deck (Default) */
.bg-pure-black {
  background: transparent;
}

/* 2. Neural Grid */
.bg-neural-grid {
  background: #050505;
}
.neural-lines {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(90deg, rgba(34, 211, 238, 0.15) 1px, transparent 1px),
    linear-gradient(rgba(34, 211, 238, 0.15) 1px, transparent 1px);
  background-size: 80px 80px;
  animation: grid-shift 40s linear infinite;
  will-change: transform;
}

/* Light Mode Reversion */
:root:not(.dark) .neural-lines {
  background-image: 
    linear-gradient(90deg, rgba(30, 41, 59, 0.1) 1px, transparent 1px),
    linear-gradient(rgba(30, 41, 59, 0.1) 1px, transparent 1px);
}

@keyframes grid-shift {
  from { transform: perspective(500px) rotateX(60deg) translateY(0); }
  to { transform: perspective(500px) rotateX(60deg) translateY(100px); }
}

/* 3. Deep Ocean */
.bg-deep-ocean {
  background: linear-gradient(180deg, #000 0%, #001f3f 100%);
}
.ocean-waves {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
}
.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
  background-size: 50% 100px;
  opacity: 0.1;
  animation: wave-move 20s linear infinite;
}
.wave:nth-child(2) {
  bottom: 10px;
  opacity: 0.05;
  animation: wave-move 15s linear infinite reverse;
}
@keyframes wave-move {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.wave, .grid-floor, .matrix-column, .falling-egg, .ember, .data-drop, .streak {
  will-change: transform;
}

/* 4. Cyber Horizon (PREMIUM) */
.bg-cyber-horizon {
  background: #000;
}
.sun {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: linear-gradient(to bottom, #ff007f, #ff8c00);
  border-radius: 50%;
  filter: blur(20px);
  box-shadow: 0 0 100px #ff007f;
  opacity: 0.6;
}
.grid-floor {
  position: absolute;
  bottom: 0;
  width: 200%;
  height: 60%;
  left: -50%;
  background-image: 
    linear-gradient(rgba(255, 0, 127, 0.4) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 0, 127, 0.4) 1px, transparent 1px);
  background-size: 60px 60px;
  transform: perspective(300px) rotateX(60deg);
  animation: grid-move-forward 5s linear infinite;
}
@keyframes grid-move-forward {
  0% { background-position: 0 0; }
  100% { background-position: 0 60px; }
}
.glow-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(255, 0, 127, 0.15) 0%, transparent 40%);
}

/* 5. Digital Rain (PREMIUM) */
.bg-digital-rain {
  background: #000;
}
.matrix-column {
  position: absolute;
  top: -20px;
  color: #00ff41;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.2rem;
  line-height: 1;
  text-shadow: 0 0 10px #00ff41;
  animation: matrix-fall linear infinite;
}
@keyframes matrix-fall {
  0% { transform: translateY(-100%); opacity: 1; }
  90% { opacity: 0.8; }
  100% { transform: translateY(110vh); opacity: 0; }
}

/* 11. Easter Celebration */
.bg-easter {
  background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #000 100%);
}
.falling-egg {
  position: absolute;
  top: -10%;
  font-size: 2.5rem;
  opacity: 0.6;
  animation: fall-egg linear infinite;
  user-select: none;
}
@keyframes fall-egg {
  0% { top: -10%; transform: translateY(0) rotate(0deg); }
  100% { top: 110%; transform: translateY(110vh) rotate(360deg); }
}

/* 12. Digital Storm Glitch */
.scanline {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 255, 255, 0.05) 51%, transparent 51%);
  background-size: 100% 4px;
  animation: scanline-move 10s linear infinite;
  z-index: 10;
}
@keyframes scanline-move {
  from { background-position: 0 0; }
  to { background-position: 0 100%; }
}
.glitch-chromatic {
  position: absolute;
  inset: 0;
  background: inherit;
  mix-blend-mode: screen;
  animation: chromatic-shift 2s infinite;
  opacity: 0.15;
}
@keyframes chromatic-shift {
  0% { transform: translate(0, 0); }
  10% { transform: translate(-2px, 1px); }
  20% { transform: translate(2px, -1px); }
  30% { transform: translate(-1px, -2px); }
  100% { transform: translate(0, 0); }
}

/* 13. Inferno Embers */
.ember {
  position: absolute;
  bottom: -20px;
  width: 3px;
  height: 3px;
  background: #f97316;
  border-radius: 50%;
  filter: blur(1px);
  box-shadow: 0 0 10px #f97316;
  animation: ember-float linear infinite;
}
@keyframes ember-float {
  0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(-110vh) rotate(720deg) scale(0.2); opacity: 0; }
}

/* 14. Void Cosmos */
.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  opacity: 0;
  animation: star-twinkle 4s infinite;
}
@keyframes star-twinkle {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 0.8; transform: scale(1.2); }
}
.nebula {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 30% 40%, rgba(76, 29, 149, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(30, 27, 75, 0.2) 0%, transparent 50%);
  filter: blur(40px);
  animation: nebula-drift 30s infinite alternate;
}
@keyframes nebula-drift {
  from { transform: scale(1); }
  to { transform: scale(1.2) rotate(5deg); }
}

/* 15. Ronin Rain */
.data-drop {
  position: absolute;
  top: -20px;
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, #ef4444);
  animation: data-fall linear infinite;
}
@keyframes data-fall {
  to { transform: translateY(110vh); }
}
.neon-city-glow {
  position: absolute;
  bottom: 0; inset: 0;
  background: linear-gradient(to top, rgba(239, 68, 68, 0.1), transparent 50%);
}

/* 16. Blood Waves */
.blood-wave {
  position: absolute;
  bottom: 0; width: 200%; height: 50%;
  background: radial-gradient(ellipse at 50% 100%, rgba(127, 29, 29, 0.3) 0%, transparent 70%);
  animation: blood-wave-move 10s ease-in-out infinite alternate;
}
.blood-wave--2 { height: 70%; opacity: 0.5; animation-duration: 15s; }
@keyframes blood-wave-move {
  from { transform: translateX(-25%) translateY(10%); }
  to { transform: translateX(0%) translateY(0%); }
}
</style>

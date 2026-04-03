<script setup>
import { computed } from 'vue';

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

const activeEffect = computed(() => props.backgroundCss || 'bg-pure-black');

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
  </div>
</template>

<style scoped>
.background-effect-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
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

/* 1. Pure Black Glass */
.bg-pure-black {
  background: radial-gradient(circle at 50% 50%, #111 0%, #000 100%);
}

/* 2. Neural Grid */
.bg-neural-grid {
  background: #050505;
}
.neural-lines {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px);
  background-size: 100px 100px;
  animation: grid-shift 60s linear infinite;
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
  background: url('https://raw.githubusercontent.com/r6698/reppy-assets/main/wave.png');
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
</style>

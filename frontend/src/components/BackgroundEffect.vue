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
</script>

<template>
  <div v-if="activeEffect" class="background-effect-container" :class="[activeEffect, { 'is-preview': isPreview }]">
    <!-- Specific elements -->
    <div v-if="activeEffect === 'bg-matrix-fade'" class="matrix-grid"></div>
    <div v-if="activeEffect === 'bg-deep-ocean'" class="ocean-waves">
      <div class="wave"></div>
      <div class="wave"></div>
    </div>
    <div v-if="activeEffect === 'bg-mist-void'" class="mist-blobs">
      <div class="blob"></div>
      <div class="blob"></div>
      <div class="blob"></div>
    </div>
    <div v-if="activeEffect === 'bg-neural-grid'" class="neural-lines"></div>
    <div v-if="activeEffect === 'bg-inferno-flow'" class="fire-particles">
      <div v-for="n in 9" :key="n" class="particle"></div>
    </div>
    <div v-if="activeEffect === 'bg-cosmic-drift'" class="cosmic-scene">
      <div class="stars"></div>
      <div class="nebula"></div>
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

/* 2. Amber Gradient */
.bg-amber-gradient {
  background: radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.15) 0%, #000 70%);
}

/* 3. Blue Frost */
.bg-blue-frost {
  background: radial-gradient(circle at 50% 90%, rgba(59, 130, 246, 0.15) 0%, #000000 80%);
}

/* 4. Matrix Fade */
.bg-matrix-fade {
  background: #000;
}
.matrix-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 200, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 200, 0, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  mask-image: radial-gradient(circle, black, transparent 80%);
}

/* 5. Night Pulse */
.bg-night-pulse {
  background: #000;
  animation: pulse-bg 8s infinite alternate;
}
@keyframes pulse-bg {
  0% { background: radial-gradient(circle, #0a0a0a 0%, #000 100%); }
  100% { background: radial-gradient(circle, #1a1a2e 0%, #000 100%); }
}

/* 6. Deep Ocean */
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

/* 7. Mist Void */
.bg-mist-void {
  background: #000;
}
.blob {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  filter: blur(80px);
  animation: blob-float 25s infinite alternate;
}
.blob:nth-child(1) { top: -100px; left: -100px; }
.blob:nth-child(2) { bottom: -100px; right: -100px; animation-delay: -5s; }
.blob:nth-child(3) { top: 50%; left: 50%; width: 400px; animation-delay: -10s; }
@keyframes blob-float {
  0% { transform: translate(0, 0); }
  100% { transform: translate(100px, 50px); }
}

/* 8. Neural Grid */
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

/* 9. Inferno Flow */
.bg-inferno-flow {
  background: linear-gradient(to top, #1a0500, #000);
}
.fire-particles .particle {
  position: absolute;
  bottom: -20px;
  width: 4px;
  height: 4px;
  background: #f97316;
  border-radius: 50%;
  filter: blur(2px);
  animation: fire-rise 5s infinite ease-out;
}
.particle:nth-child(1) { left: 10%; animation-duration: 4.2s; animation-delay: 0.1s; }
.particle:nth-child(2) { left: 25%; animation-duration: 5.8s; animation-delay: 1.2s; }
.particle:nth-child(3) { left: 40%; animation-duration: 4.5s; animation-delay: 2.3s; }
.particle:nth-child(4) { left: 55%; animation-duration: 6.7s; animation-delay: 0.5s; }
.particle:nth-child(5) { left: 70%; animation-duration: 3.9s; animation-delay: 1.8s; }
.particle:nth-child(6) { left: 85%; animation-duration: 5.5s; animation-delay: 0.9s; }
.particle:nth-child(7) { left: 15%; animation-duration: 4.8s; animation-delay: 3.1s; }
.particle:nth-child(8) { left: 45%; animation-duration: 6.2s; animation-delay: 1.5s; }
.particle:nth-child(9) { left: 80%; animation-duration: 5.1s; animation-delay: 2.7s; }

@keyframes fire-rise {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
}

/* 10. Cosmic Drift */
.bg-cosmic-drift {
  background: #000;
}
.stars {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)),
                    radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
                    radial-gradient(2px 1px at 50px 160px, #ddd, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.3;
}
.nebula {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.1), transparent 60%);
  animation: nebula-drift 20s infinite alternate;
}
@keyframes nebula-drift {
  from { transform: scale(1) translate(0, 0); }
  to { transform: scale(1.2) translate(5%, 5%); }
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
  100% { top: 110%; transform: translateY(100vh) rotate(360deg); }
}
</style>

<template>
  <div class="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
    <TransitionGroup name="damage-float">
      <div 
        v-for="dmg in damageStore.activeDamages" 
        :key="dmg.id"
        class="absolute"
        :style="{ 
          left: `${dmg.x}%`, 
          top: `${dmg.y}%`, 
          color: getDamageColor(dmg.type) 
        }"
      >
        <div class="damage-wrapper">
          <span class="damage-number font-black italic tracking-tighter">
            -{{ dmg.amount }}
          </span>
          <span v-if="dmg.amount > 20" class="critical-hit text-[10px] uppercase font-black tracking-widest absolute -top-4 left-1/2 -translate-x-1/2">
            CRITICAL!
          </span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useDamageStore } from '../stores/damage';
import { watch } from 'vue';

const damageStore = useDamageStore();

// Play sound whenever a new damage is added
watch(() => damageStore.activeDamages.length, (newLen, oldLen) => {
  if (newLen > oldLen) {
    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3'); // Higher quality, reliable Hit sound
    audio.volume = 0.4;
    audio.play().catch(e => console.warn('[AUDIO_BLOCKED] User interaction required for sound'));
  }
});

const getDamageColor = (type) => {
  const colors = {
    pullups: '#fbbf24', // Amber
    pushups: '#f43f5e', // Rose/Red
    muscleups: '#a855f7', // Purple/Elite
    dips: '#06b6d4', // Cyan
    weighted_pullups: '#f97316', // Orange
    all: '#ffffff'
  };
  return colors[type] || '#ffffff';
};
</script>

<style scoped>
.damage-number {
  font-size: clamp(3.5rem, 8vw, 6rem);
  text-shadow: 
    4px 4px 0px #000,
    -1.5px -1.5px 0px #000,  
    1.5px -1.5px 0px #000,
    -1.5px 1.5px 0px #000,
    1.5px 1.5px 0px #000;
  display: block;
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.4));
  transform-origin: center;
}

.critical-hit {
  color: #fff;
  text-shadow: 2px 2px 0px #000;
  animation: pulse 0.5s infinite alternate;
}

@keyframes pulse {
  from { transform: translateX(-50%) scale(1); }
  to { transform: translateX(-50%) scale(1.2); }
}

/* JRPG Float Animation */
.damage-float-enter-active {
  animation: dmg-float 1.2s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
}

.damage-float-leave-active {
  opacity: 0;
  transition: opacity 0.3s;
}

@keyframes dmg-float {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  15% {
    transform: translate(0, -40px) scale(1.5);
    opacity: 1;
  }
  30% {
    transform: translate(0, -30px) scale(1.1);
  }
  100% {
    transform: translate(20px, -150px) scale(0.8);
    opacity: 0;
  }
}

.damage-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

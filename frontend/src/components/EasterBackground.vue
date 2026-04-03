<template>
  <div class="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
    <div 
      v-for="(egg, index) in eggs" 
      :key="index"
      class="absolute text-5xl animate-fall opacity-60 dark:opacity-40 select-none "
      :style="{
        left: `${egg.left}%`,
        animationDuration: `${egg.duration}s`,
        animationDelay: `${egg.delay}s`,
        transform: `rotate(${egg.rotation}deg)`
      }"
    >
      {{ egg.emoji }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const eggs = ref([]);
const emojis = ['🥚', '🐰', '🐣', '🐇', '💪', '🏋️', ''];

onMounted(() => {
  // Generate 45 random falling eggs with greater variability (fewer on mobile)
  const isMobile = window.innerWidth < 768;
  const eggCount = isMobile ? 15 : 45;
  for (let i = 0; i < eggCount; i++) {
    eggs.value.push({
      left: Math.random() * 100, // random start horizontal %
      duration: 8 + Math.random() * 20, // fall between 8s and 28s
      delay: Math.random() * -30, // Start some mid-screen by negative delay
      rotation: Math.random() * 360,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    });
  }
});
</script>

<style scoped>
@keyframes fall {
  0% {
    top: -10%;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    top: 110%;
    transform: translateY(100vh) rotate(360deg);
  }
}
.animate-fall {
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
</style>

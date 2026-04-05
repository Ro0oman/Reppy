<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-md">
    <div class="relative w-full max-w-4xl overflow-hidden bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl">
      
      <!-- Close Button (Only after animation finishes) -->
      <button v-if="finished" @click="close" 
        class="absolute top-6 right-6 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
        <X class="w-6 h-6 text-white" />
      </button>

      <!-- Header -->
      <div class="pt-12 pb-6 text-center">
        <h2 class="text-3xl font-black text-white uppercase tracking-tighter italic">
          Abriendo <span class="text-primary-500">Cofre de Boss</span>
        </h2>
        <p class="text-zinc-500 font-medium">¿Qué te deparará el destino?</p>
      </div>

      <!-- CS:GO Rolling Reel -->
      <div class="relative py-12 bg-black/40 border-y border-white/5 overflow-hidden">
        <!-- Center Indicator -->
        <div class="absolute left-1/2 top-0 bottom-0 w-1 bg-primary-500 z-20 shadow-[0_0_20px_rgba(234,179,8,0.5)]">
           <div class="absolute -top-1 -left-2 w-5 h-5 bg-primary-500 rotate-45"></div>
           <div class="absolute -bottom-1 -left-2 w-5 h-5 bg-primary-500 rotate-45"></div>
        </div>

        <!-- Reel Items -->
        <div 
          ref="reelRef"
          class="flex transition-transform duration-[6s] cubic-bezier(0.15, 0, 0.05, 1)"
          :style="{ transform: `translateX(${translateX}px)` }">
          
          <div v-for="(item, index) in localReel" :key="index" 
            class="flex-shrink-0 w-40 h-40 mx-1 rounded-2xl border flex flex-col items-center justify-center p-4 transition-all"
            :class="[
              item.is_seasonal ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/30' : 'bg-white/5 border-white/10',
              finished && index === winningIndex ? 'scale-110 shadow-2xl shadow-primary-500/20 border-primary-500' : 'opacity-40 grayscale-[0.5]'
            ]">
            
            <div class="w-20 h-20 mb-3 relative flex items-center justify-center">
               <!-- Placeholder or Icon based on type -->
               <div v-if="item.type === 'title'" class="text-2xl font-black text-white/20 italic select-none">TIT</div>
               <div v-else-if="item.type === 'border'" class="w-16 h-16 rounded-full border-4 border-white/20"></div>
               <BackgroundEffect v-else-if="item.type === 'background'" :background-css="item.css_value" is-preview class="rounded-lg scale-50" />
               <Sparkles v-if="item.is_seasonal" class="absolute top-0 right-0 w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            
            <span class="text-[10px] font-bold text-center text-white/80 line-clamp-1 uppercase tracking-tighter">{{ item.name }}</span>
            <span v-if="item.is_seasonal" class="text-[8px] font-black text-amber-500 mt-1">LEGENDARIO</span>
          </div>
        </div>
      </div>

      <!-- Result View -->
      <div v-if="finished" class="p-12 text-center animate-in fade-in zoom-in duration-500">
        <div class="mb-6 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20">
          <Trophy class="w-5 h-5 text-primary-500" />
          <span class="text-sm font-black text-primary-500 uppercase tracking-widest">¡Recompensa Obtenida!</span>
        </div>
        
        <h3 class="text-4xl font-black text-white mb-2 italic tracking-tighter">{{ reward.item ? reward.item.name : '+' + reward.coins + ' Reppy Coins' }}</h3>
        <p class="text-zinc-400 mb-8 max-w-md mx-auto">{{ reward.message }}</p>

        <button @click="close" 
          class="px-12 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary-600/30 uppercase tracking-widest text-sm italic">
          Coleccionar Recompensa
        </button>
      </div>

      <!-- Footer / Loading state -->
      <div v-else class="p-8 text-center">
        <p class="text-zinc-400 text-sm font-medium animate-pulse uppercase tracking-widest">Calculando botín...</p>
      </div>

      <!-- Sound effects would go here if needed -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { X, Trophy, Sparkles } from 'lucide-vue-next';
import BackgroundEffect from './BackgroundEffect.vue';
import confetti from 'canvas-confetti';

const props = defineProps({
  show: Boolean,
  reward: Object,
  reelItems: Array
});

const emit = defineEmits(['close']);

const reelRef = ref(null);
const localReel = ref([]);
const finished = ref(false);
const translateX = ref(0);
const winningIndex = 35; // The index where our actual reward sits in the reel

onMounted(async () => {
  if (props.show) {
    startAnimation();
  }
});

const startAnimation = async () => {
  finished.value = false;
  
  // 1. Prepare the reel: ~40 items, with the actual reward at winningIndex
  const items = [...props.reelItems];
  // Ensure we have enough items
  while (items.length < 50) items.push(...props.reelItems);
  
  localReel.value = items.slice(0, winningIndex);
  // Add the actual reward at the winning position
  if (props.reward.item) {
    localReel.value.push(props.reward.item);
  } else {
    // If no item, show a "Coins" placeholder in the reel
    localReel.value.push({ name: 'REPPY COINS', type: 'coins', is_seasonal: false });
  }
  // Fill the rest with more items
  localReel.value.push(...items.slice(winningIndex, 55));

  await nextTick();

  // 2. Initial position (offset to the left)
  const itemWidth = 168; // 160px width + 8px margin (mx-1 is 4+4)
  translateX.value = 0;

  // 3. Trigger the roll
  // The goal is to move the reel so that the item at winningIndex is exactly at the center indicators.
  // Center is windowWidth / 2.
  // Item position = (winningIndex * itemWidth) + (itemWidth / 2)
  // translateX = (windowWidth / 2) - ((winningIndex * itemWidth) + (itemWidth / 2))
  
  setTimeout(() => {
    const reelContainer = document.querySelector('.relative.py-12'); // The parent div that has overflow-hidden
    if (!reelContainer) return;
    
    const containerWidth = reelContainer.offsetWidth;
    // Add a bit of randomness to the final stop position (within the item width)
    const stopOffset = (Math.random() * 0.6 + 0.2) * itemWidth; 
    
    const finalX = (containerWidth / 2) - (winningIndex * itemWidth) - stopOffset;
    translateX.value = finalX;

    // 4. Mark as finished after transition (6s duration)
    setTimeout(() => {
      finished.value = true;
      
      // TRIGGER REWARD CEREMONY
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: props.reward.item?.is_seasonal ? ['#fbbf24', '#f59e0b', '#ffffff'] : ['#3b82f6', '#ffffff']
      });
    }, 6000);
  }, 100);
};

const close = () => {
  emit('close');
};
</script>

<style scoped>
.cubic-bezier(0.15, 0, 0.05, 1) {
  transition-timing-function: cubic-bezier(0.15, 0, 0.05, 1);
}
</style>

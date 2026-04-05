<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-zinc-950/95 backdrop-blur-md">
    <div class="relative w-full max-w-4xl overflow-hidden bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
      
      <!-- Close Button (Only after animation finishes) -->
      <button v-if="finished" @click="close" 
        class="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
        <X class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      <!-- Header -->
      <div class="pt-8 pb-4 sm:pt-12 sm:pb-6 text-center px-4">
        <h2 class="text-xl sm:text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
          Abriendo <span class="text-primary-500">Cofre de Boss</span>
        </h2>
        <p class="text-zinc-500 font-medium text-xs sm:text-base mt-2">¿Qué te deparará el destino?</p>
      </div>

      <!-- CS:GO Rolling Reel -->
      <div class="relative py-8 sm:py-12 bg-black/40 border-y border-white/5 overflow-hidden">
        <!-- Center Indicator -->
        <div class="absolute left-1/2 top-0 bottom-0 w-1 bg-primary-500 z-20 shadow-[0_0_20px_rgba(234,179,8,0.5)]">
           <div class="absolute -top-1 -left-2 w-5 h-5 bg-primary-500 rotate-45"></div>
           <div class="absolute -bottom-1 -left-2 w-5 h-5 bg-primary-500 rotate-45"></div>
        </div>

        <!-- Reel Items -->
        <div 
          ref="reelRef"
          class="flex transition-transform duration-[6s] chest-reel-transition"
          :style="{ transform: `translateX(${translateX}px)` }">
          
          <div v-for="(item, index) in localReel" :key="index" 
            class="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 mx-1 rounded-2xl border flex flex-col items-center justify-center p-3 sm:p-4 transition-all"
            :class="[
              item.is_seasonal ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/30' : 'bg-white/5 border-white/10',
              finished && index === winningIndex ? 'scale-105 sm:scale-110 shadow-2xl shadow-primary-500/20 border-primary-500' : 'opacity-40 grayscale-[0.5]'
            ]">
            
            <div class="w-16 h-16 sm:w-20 sm:h-20 mb-2 sm:mb-3 relative flex items-center justify-center">
               <!-- Placeholder or Icon based on type -->
               <div v-if="item.type === 'title'" class="text-xl sm:text-2xl font-black text-white/20 italic select-none">TIT</div>
               <div v-else-if="item.type === 'border'" class="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white/20"></div>
               <BackgroundEffect v-else-if="item.type === 'background'" :background-css="item.css_value" is-preview class="rounded-lg scale-50" />
               <Sparkles v-if="item.is_seasonal" class="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 text-amber-500 animate-pulse" />
            </div>
            
            <span class="text-[9px] sm:text-[10px] font-bold text-center text-white/80 line-clamp-1 uppercase tracking-tighter">{{ item.name }}</span>
            <span v-if="item.is_seasonal" class="text-[7px] sm:text-[8px] font-black text-amber-500 mt-0.5 sm:mt-1">LEGENDARIO</span>
          </div>
        </div>
      </div>

      <!-- Result View -->
      <div v-if="finished" class="p-6 sm:p-12 text-center animate-in fade-in zoom-in duration-500">
        <div class="mb-4 sm:mb-6 inline-flex items-center gap-2 sm:gap-3 px-4 py-1.5 sm:py-2 rounded-full bg-primary-500/10 border border-primary-500/20 shadow-sm">
          <Trophy class="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
          <span class="text-[10px] sm:text-sm font-black text-primary-500 uppercase tracking-[0.2em]">¡Botín Obtenido!</span>
        </div>
        
        <h3 class="text-2xl sm:text-4xl font-black text-white mb-2 italic tracking-tighter uppercase leading-none drop-shadow-lg break-words px-2">
          {{ reward.item ? reward.item.name : '+' + reward.coins + ' REPPY COINS' }}
        </h3>
        <p class="text-zinc-400 text-xs sm:text-base mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto line-clamp-3 leading-relaxed">
          {{ reward.message }}
        </p>

        <button @click="close" 
          class="w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary-600/30 uppercase tracking-widest text-xs sm:text-sm italic ring-1 ring-white/10 active:scale-95">
          Coleccionar Recompensa
        </button>
      </div>

      <!-- Footer / Loading state -->
      <div v-else class="p-6 sm:p-8 text-center">
        <p class="text-zinc-400 text-xs sm:text-sm font-black animate-pulse uppercase tracking-[0.3em] opacity-40 italic">Calculando botín...</p>
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
const winningIndex = 32; // Optimized index for reel length

onMounted(async () => {
  if (props.show) {
    startAnimation();
  }
});

const startAnimation = async () => {
  finished.value = false;
  
  // 1. Prepare the reel: ~50 items, with the actual reward at winningIndex
  const items = [...props.reelItems];
  // Ensure we have enough items
  while (items.length < 60) items.push(...props.reelItems);
  
  localReel.value = items.slice(0, winningIndex);
  // Add the actual reward at the winning position
  if (props.reward.item) {
    localReel.value.push(props.reward.item);
  } else {
    // If no item, show a "Coins" placeholder in the reel
    localReel.value.push({ name: 'REPPY COINS', type: 'coins', is_seasonal: false });
  }
  // Fill the rest with more items
  localReel.value.push(...items.slice(winningIndex, 65));

  await nextTick();

  // 2. Initial position
  translateX.value = 0;

  // 3. Trigger the roll
  setTimeout(() => {
    const reelContainer = document.querySelector('.relative.py-8, .relative.py-12'); 
    if (!reelContainer) return;
    
    const containerWidth = reelContainer.offsetWidth;
    const isMobile = window.innerWidth < 640;
    const itemWidth = isMobile ? 136 : 168; // w-32 + mx-1(8px) or w-40 + mx-1(8px)
    
    // Add a bit of randomness to the final stop position
    const stopOffset = (Math.random() * 0.4 + 0.3) * itemWidth; 
    
    const finalX = (containerWidth / 2) - (winningIndex * itemWidth) - (itemWidth / 2) + (itemWidth / 2) - stopOffset;
    // Calculation cleanup: (Center) - (Items preceding winner) - offset within winner item
    const midX = (containerWidth / 2) - (winningIndex * itemWidth) - stopOffset;

    translateX.value = midX;

    // 4. Mark as finished after transition (6s duration)
    setTimeout(() => {
      finished.value = true;
      
      // TRIGGER REWARD CEREMONY
      confetti({
        particleCount: isMobile ? 80 : 150,
        spread: 80,
        origin: { y: 0.6 },
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
.chest-reel-transition {
  transition-timing-function: cubic-bezier(0.15, 0, 0.05, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-in {
  animation: fadeIn 0.5s ease-out;
}
</style>

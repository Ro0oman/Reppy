<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-3xl animate-in overflow-y-auto">
      <!-- Main Modal Container -->
      <div class="relative w-full max-w-4xl min-h-[100dvh] md:min-h-0 bg-steel-grey/40 border-x md:border border-white/10 rounded-none md:rounded-[2.5rem] shadow-[0_0_100px_rgba(255,69,0,0.1)] flex flex-col group overflow-hidden">
        
        <!-- Close Button (Post-Animation) -->
        <button v-if="finished" @click="close" 
          class="absolute top-6 right-6 md:top-8 md:right-8 z-50 p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:rotate-90">
          <X class="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        <!-- Protocol Header -->
        <div class="pt-10 md:pt-16 pb-6 text-center px-6 md:px-8 z-10">
          <div class="inline-flex items-center gap-3 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6">
             <Zap class="w-3.5 h-3.5 text-primary-500 animate-pulse" />
             <span class="text-[9px] md:text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] font-tight">DECRYPTION PROTOCOL ACTIVE</span>
          </div>
          <h2 class="text-3xl md:text-5xl font-black text-industrial text-white uppercase italic tracking-tighter leading-none mb-3">
            ARTIFACT<span class="text-primary-500">.</span>RECOVERY
          </h2>
          <p class="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] font-tight">Extracting high-fidelity assets from encrypted drive...</p>
        </div>

        <!-- High-Stakes Rolling Reel (CS style) -->
        <div class="relative py-10 md:py-16 bg-black/60 border-y border-white/5 overflow-hidden">
          <!-- Center Precision Indicator -->
          <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary-500 z-20 shadow-[0_0_30px_rgba(255,69,0,0.4)]">
             <div class="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-primary-500 rotate-45 border border-white/20"></div>
             <div class="absolute -bottom-1 -left-1.5 w-3.5 h-3.5 bg-primary-500 rotate-45 border border-white/20"></div>
          </div>

          <!-- Reel Items Belt -->
          <div 
            ref="reelRef"
            class="flex transition-transform duration-[6s] reel-physics"
            :style="{ transform: `translateX(${translateX}px)` }">
            
            <div v-for="(item, index) in localReel" :key="index" 
              class="flex-shrink-0 w-32 h-32 md:w-44 md:h-44 mx-1.5 rounded-2xl md:rounded-3xl border flex flex-col items-center justify-center p-3 md:p-4 transition-all duration-700"
              :class="[
                item.is_seasonal ? 'bg-primary-500/10 border-primary-500/30' : 'bg-white/[0.04] border-white/10',
                finished && index === winningIndex ? 'scale-110 border-primary-500 bg-primary-500/20 shadow-[0_0_50px_rgba(255,69,0,0.2)] grayscale-0 opacity-100' : 
                (finished ? 'opacity-10 grayscale scale-90' : 'opacity-70 grayscale-[0.4]')
              ]">
              
              <div class="w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-4 relative flex items-center justify-center overflow-hidden rounded-2xl">
                 <!-- High-Contrast Icons -->
                 <div v-if="item.type === 'title'" class="text-xl md:text-3xl font-black text-white/10 italic font-industrial select-none">CODE</div>
                 <div v-else-if="item.type === 'border'" class="w-12 h-12 md:w-16 md:h-16 rounded-full border-[4px] md:border-[6px] border-white/10"></div>
                 <BackgroundEffect v-else-if="item.type === 'background'" :background-css="item.css_value" is-preview class="scale-50 rounded-xl" />
                 <div v-else-if="item.type === 'coins'" class="p-3 md:p-4 bg-primary-500/10 rounded-2xl">
                    <Coins class="w-8 h-8 md:w-10 md:h-10 text-primary-500" />
                 </div>
                 
                 <!-- Tier Glow -->
                 <div v-if="item.is_seasonal" class="absolute inset-0 bg-primary-500/5 animate-pulse"></div>
              </div>
              
              <span class="text-[8px] md:text-[10px] font-black text-center text-white/50 truncate w-full px-2 uppercase tracking-widest font-tight">{{ item.name }}</span>
              <span v-if="item.is_seasonal" class="text-[7px] md:text-[8px] font-black text-primary-500 mt-2 tracking-[0.2em]">LEGENDARY</span>
            </div>
          </div>
        </div>

        <!-- Result Terminal View -->
        <div v-if="finished" class="p-8 md:p-12 text-center animate-in-up flex flex-col items-center pb-32 md:pb-12 overflow-y-auto max-h-[60vh] scrollbar-hide">
          <div class="mb-6 md:mb-8 inline-flex items-center gap-4 px-6 py-2 rounded-xl bg-neon-lime/10 border border-neon-lime/20 shadow-[0_0_30px_rgba(204,255,0,0.05)]">
            <Trophy class="w-4 h-4 md:w-5 md:h-5 text-neon-lime" />
            <span class="text-[9px] md:text-[10px] font-black text-neon-lime uppercase tracking-[0.4em] font-tight">PROTOCOL SUCCESSFUL</span>
          </div>
          
          <!-- Multiple Rewards Support -->
          <div v-if="reward.rewards" class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-10">
             <div v-for="(r, idx) in reward.rewards" :key="idx" 
                  class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all">
                <div class="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                   <Coins v-if="r.type === 'coins'" class="w-6 h-6 text-primary-500" />
                   <div v-else class="flex items-center justify-center">
                      <Sparkles class="w-6 h-6 text-primary-500" />
                   </div>
                </div>
                <div class="text-left">
                   <p class="text-[11px] font-black text-white uppercase italic leading-none mb-1">
                      {{ r.type === 'coins' ? '+' + r.amount + ' REPPY COINS' : r.data.name }}
                   </p>
                   <p class="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{{ r.type === 'coins' ? r.message : r.data.rarity }}</p>
                </div>
             </div>
          </div>

          <!-- Single Reward (Legacy/Level Chest) -->
          <div v-else class="space-y-3 md:space-y-4 mb-8 md:mb-10 max-w-lg">
             <h3 class="text-3xl md:text-5xl font-black text-industrial text-white italic tracking-tighter uppercase leading-none px-4" :class="reward.item?.css_value">
               {{ reward.item ? reward.item.name : '+' + reward.coins + ' REPPY COINS' }}
             </h3>
             <p class="text-zinc-500 text-[10px] md:text-sm font-bold uppercase tracking-widest leading-relaxed px-6 md:px-8">
               {{ reward.message }}
             </p>
          </div>

          <button @click="close" 
            class="btn-reppy !px-12 md:!px-16 !py-4 md:!py-5 !text-base md:!text-lg shadow-2xl mb-8 md:mb-0">
            COLLECT ASSET
          </button>
        </div>

        <!-- Sub-Terminal Status -->
        <div v-else class="p-10 md:p-12 text-center">
          <div class="flex items-center justify-center gap-4">
             <div class="w-1 h-1 bg-primary-500 rounded-full animate-ping"></div>
             <p class="text-[9px] md:text-[10px] font-black text-zinc-700 uppercase tracking-[0.6em] italic animate-pulse">SYNCING BITSTREAM...</p>
             <div class="w-1 h-1 bg-primary-500 rounded-full animate-ping delay-300"></div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { X, Trophy, Sparkles, Zap, Coins } from 'lucide-vue-next';
import BackgroundEffect from './BackgroundEffect.vue';
import confetti from 'canvas-confetti';

import { useAudio } from '../composables/useAudio';

const { playChest, playClickBlip } = useAudio();
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
const winningIndex = 32;

onMounted(async () => {
  if (props.show) {
    playClickBlip();
    startAnimation();
  }
});

const startAnimation = async () => {
  finished.value = false;
  
  const items = [...props.reelItems];
  while (items.length < 60) items.push(...props.reelItems);
  
  localReel.value = items.slice(0, winningIndex);
  if (props.reward.item) {
    localReel.value.push(props.reward.item);
  } else {
    localReel.value.push({ name: 'REPPY COINS', type: 'coins', is_seasonal: false });
  }
  localReel.value.push(...items.slice(winningIndex, 65));

  await nextTick();
  translateX.value = 0;

  setTimeout(() => {
    const reelContainer = document.querySelector('.relative.py-10, .relative.py-16'); 
    if (!reelContainer) return;
    
    const containerWidth = reelContainer.offsetWidth;
    const isMobile = window.innerWidth < 768;
    const itemWidth = isMobile ? 140 : 188; // w-32(128) + 12px or w-44(176) + 12px
    
    const stopOffset = (Math.random() * 0.4 + 0.3) * itemWidth; 
    const midX = (containerWidth / 2) - (winningIndex * itemWidth) - (itemWidth / 2) - stopOffset;

    translateX.value = midX;

    setTimeout(() => {
      finished.value = true;
      playChest();
      confetti({
        particleCount: isMobile ? 100 : 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FF4500', '#CCFF00', '#ffffff']
      });
    }, 6000);
  }, 100);
};

const close = () => { emit('close'); };
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.font-tight { font-family: 'Inter Tight', sans-serif; }
.reel-physics {
  transition-timing-function: cubic-bezier(0.12, 0, 0.05, 1);
}
.animate-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-in-up { animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
</style>

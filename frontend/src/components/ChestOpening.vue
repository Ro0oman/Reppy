<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-3xl animate-in overflow-y-auto" @click="handleGlobalClick">
      <!-- Main Container (Clash Royale Style) -->
      <div v-if="clashMode" class="relative w-full max-w-4xl flex flex-col items-center justify-center min-h-[100dvh]">
        
        <!-- 1. Closed Chest View -->
        <div v-if="currentRevealIndex === -1" class="flex flex-col items-center gap-8 animate-bounce-slow cursor-pointer group"
             :class="isShaking ? 'animate-shake-gentle' : ''">
            <div class="relative">
               <!-- Basic Ambient Glow -->
               <div class="absolute -inset-20 blur-[100px] rounded-full animate-pulse group-hover:bg-opacity-40 transition-all"
                    :class="isLegendaryChest ? 'bg-amber-500/20' : (isEpicChest ? 'bg-purple-500/20' : 'bg-primary-500/20')"></div>
               
               <!-- EXTRA LEGENDARY GLOW LAYERS -->
               <template v-if="isLegendaryChest">
                  <div class="absolute -inset-40 blur-[150px] rounded-full animate-legendary-pulse bg-amber-400/10 pointer-events-none"></div>
                  <div class="absolute -inset-10 blur-[50px] rounded-full animate-pulse bg-white/5 pointer-events-none"></div>
               </template>

               <Archive class="w-40 h-40 md:w-64 md:h-64 relative z-10 transition-all" 
                        :class="[
                          isLegendaryChest ? 'text-amber-500 drop-shadow-[0_0_80px_rgba(245,158,11,0.6)]' : 
                          (isEpicChest ? 'text-purple-500 drop-shadow-[0_0_50px_rgba(168,85,247,0.4)]' : 
                          'text-primary-500 drop-shadow-[0_0_50px_rgba(255,69,0,0.4)]'),
                          clickedFlash ? 'scale-110' : ''
                        ]" />
               <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/5 blur-3xl rounded-full scale-150 -z-10"></div>
            </div>
            <div class="text-center z-10">
               <h3 class="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-4"
                   :class="isLegendaryChest ? 'text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-500 to-amber-700 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]' : ''">
                 {{ isLegendaryChest ? 'VAULT LEGENDARIO' : (isEpicChest ? 'BÓVEDA ÉPICA' : 'COFRE DEL BOSS') }}
               </h3>
              <div class="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                 <Zap class="w-4 h-4 text-primary-500 animate-pulse" />
                 <span class="text-[10px] md:text-[12px] font-black text-zinc-400 uppercase tracking-[0.4em] font-tight">TAP TO OPEN</span>
              </div>
           </div>
        </div>

        <!-- 2. Reward Reveal Sequence -->
        <div v-else-if="currentRevealIndex < reward.rewards.length" 
             class="flex flex-col items-center gap-12 w-full px-8 cursor-pointer" 
             :class="isLegendaryReward ? 'animate-legendary-reveal' : 'animate-reveal'"
             :key="currentRevealIndex">
           <div class="relative p-8 md:p-16 rounded-[3rem] bg-white/[0.02] border border-white/10 shadow-2xl flex flex-col items-center w-full max-w-lg backdrop-blur-2xl"
                :class="isLegendaryReward ? 'border-amber-500/30 shadow-[0_0_100px_rgba(245,158,11,0.1)]' : ''">
              
              <!-- Legendary Special Effect Background -->
              <template v-if="isLegendaryReward">
                 <div class="absolute inset-0 overflow-hidden rounded-[3rem] pointer-events-none">
                    <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-40 bg-amber-400/5 blur-[80px] -rotate-45 animate-pulse"></div>
                 </div>
              </template>

              <!-- Rarity Glow Background -->
              <div class="absolute inset-0 blur-[120px] opacity-20 rounded-full" :class="getRarityGlow(activeReward)"></div>

              <!-- Card Header -->
              <div class="mb-8 text-center">
                 <div class="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4" :class="getRarityClasses(activeReward)">
                    {{ activeReward.type === 'coins' ? 'RECURSOS' : getRarityLabel(activeReward.data.rarity) }}
                 </div>
              </div>

              <!-- Reward Icon -->
              <div class="relative z-10 mb-12 transform scale-150 hover:scale-[1.6] transition-transform duration-500">
                 <div v-if="isLegendaryReward" class="absolute inset-0 bg-amber-400 blur-[60px] rounded-full legendary-flare opacity-50"></div>
                 <div v-if="activeReward.type === 'coins'" class="p-6 bg-yellow-500/10 rounded-3xl border border-yellow-500/20 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                    <Coins class="w-20 h-20 text-yellow-400" />
                 </div>
                 <div v-else class="relative w-32 h-32 flex items-center justify-center">
                    <BackgroundEffect v-if="activeReward.data.type === 'background' || activeReward.data.type === 'post_background' || activeReward.data.type === 'avatar'" 
                                     :background-css="activeReward.data.css_value" is-preview class="rounded-2xl shadow-2xl" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-primary-500/10 border border-primary-500/20 rounded-3xl">
                       <ItemIcon :name="activeReward.data.svg_key" :type="activeReward.data.type" className="w-16 h-16 text-primary-500" />
                    </div>
                 </div>
              </div>

              <!-- Reward Details -->
              <div class="text-center z-10 w-full">
                 <h2 class="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-6 drop-shadow-2xl">
                    {{ activeReward.type === 'coins' ? `+${activeReward.amount}` : activeReward.data.name }}
                 </h2>
                 <p class="text-zinc-500 text-[11px] md:text-sm font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                    {{ activeReward.message || activeReward.data?.description }}
                 </p>
              </div>
              
              <!-- Footer Indicator -->
              <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                 <div class="px-6 py-2 bg-zinc-900 border border-white/10 rounded-full shadow-2xl">
                    <span class="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">
                       {{ reward.rewards.length - currentRevealIndex - 1 }} CARTAS RESTANTES
                    </span>
                 </div>
              </div>
           </div>
        </div>

        <!-- 3. Summary View (Final) -->
        <div v-else class="p-8 md:p-12 text-center animate-in-up flex flex-col items-center w-full max-w-3xl">
           <div class="mb-12 inline-flex items-center gap-4 px-8 py-3 rounded-2xl bg-neon-lime/10 border border-neon-lime/20 shadow-[0_0_50px_rgba(204,255,0,0.1)]">
             <Trophy class="w-6 h-6 text-neon-lime" />
             <span class="text-[12px] font-black text-neon-lime uppercase tracking-[0.5em] font-tight">EXTRACCIÓN COMPLETADA</span>
           </div>
           
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16">
              <div v-for="(r, idx) in reward.rewards" :key="idx" 
                   class="p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center gap-6 group hover:bg-white/10 transition-all hover:-translate-y-1">
                 <div class="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                    <Coins v-if="r.type === 'coins'" class="w-8 h-8 text-yellow-400" />
                    <ItemIcon v-else :name="r.data.svg_key" :type="r.data.type" className="w-8 h-8 text-primary-500" />
                 </div>
                 <div class="text-left">
                    <p class="text-sm font-black text-white uppercase italic leading-none mb-2">
                       {{ r.type === 'coins' ? '+' + r.amount : r.data.name }}
                    </p>
                    <p class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{{ r.type === 'coins' ? r.message : getRarityLabel(r.data.rarity) }}</p>
                 </div>
              </div>
           </div>

           <button @click.stop="close" 
             class="btn-reppy !px-20 !py-6 !text-xl shadow-[0_20px_50px_rgba(255,69,0,0.3)] hover:scale-105 transition-transform">
             COLECTAR BOTÍN
           </button>
        </div>

      </div>

      <!-- Legacy CS:GO Style (for Level Chests or simple rewards) -->
      <div v-else class="relative w-full max-w-4xl min-h-[100dvh] md:min-h-0 bg-steel-grey/40 border-x md:border border-white/10 rounded-none md:rounded-[2.5rem] shadow-[0_0_100px_rgba(255,69,0,0.1)] flex flex-col group overflow-hidden" @click.stop>
        <!-- Close Button (Post-Animation) -->
        <button v-if="finished" @click="close" 
          class="absolute top-6 right-6 md:top-8 md:right-8 z-50 p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:rotate-90">
          <X class="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        <!-- Protocol Header -->
        <div class="pt-10 md:pt-16 pb-6 text-center px-6 md:px-8 z-10">
          <div class="inline-flex items-center gap-3 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6">
             <Zap class="w-3.5 h-3.5 text-primary-500 animate-pulse" />
             <span class="text-[9px] md:text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] font-tight">DECRYPTION SYSTEM ACTIVE</span>
          </div>
          <h2 class="text-3xl md:text-5xl font-black text-industrial text-white uppercase italic tracking-tighter leading-none mb-3">
            ARTIFACT<span class="text-primary-500">.</span>RECOVERY
          </h2>
          <p class="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] font-tight">Extracting high-fidelity assets from encrypted drive...</p>
        </div>

        <!-- High-Stakes Rolling Reel (CS style) -->
        <div class="relative py-10 md:py-16 bg-black/60 border-y border-white/5 overflow-hidden">
          <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary-500 z-20 shadow-[0_0_30px_rgba(255,69,0,0.4)]">
             <div class="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-primary-500 rotate-45 border border-white/20"></div>
             <div class="absolute -bottom-1 -left-1.5 w-3.5 h-3.5 bg-primary-500 rotate-45 border border-white/20"></div>
          </div>
          <div ref="reelRef" class="flex transition-transform duration-[6s] reel-physics" :style="{ transform: `translateX(${translateX}px)` }">
            <div v-for="(item, index) in localReel" :key="index" 
              class="flex-shrink-0 w-32 h-32 md:w-44 md:h-44 mx-1.5 rounded-2xl md:rounded-3xl border flex flex-col items-center justify-center p-3 md:p-4 transition-all duration-700"
              :class="[
                item.is_seasonal ? 'bg-primary-500/10 border-primary-500/30' : 'bg-white/[0.04] border-white/10',
                finished && index === winningIndex ? 'scale-110 border-primary-500 bg-primary-500/20 shadow-[0_0_50px_rgba(255,69,0,0.2)] grayscale-0 opacity-100' : 
                (finished ? 'opacity-10 grayscale scale-90' : 'opacity-70 grayscale-[0.4]')
              ]">
              <div class="w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-4 relative flex items-center justify-center overflow-hidden rounded-2xl">
                 <div v-if="item.type === 'title'" class="text-xl md:text-3xl font-black text-white/10 italic font-industrial select-none">CODE</div>
                 <div v-else-if="item.type === 'border'" class="w-12 h-12 md:w-16 md:h-16 rounded-full border-[4px] md:border-[6px] border-white/10"></div>
                 <BackgroundEffect v-else-if="item.type === 'background' || item.type === 'post_background' || item.type === 'avatar'" 
                                  :background-css="item.css_value" is-preview class="scale-50 rounded-xl" />
                 <div v-else-if="item.type === 'coins'" class="p-3 md:p-4 bg-primary-500/10 rounded-2xl">
                    <Coins class="w-8 h-8 md:w-10 md:h-10 text-primary-500" />
                 </div>
                 <ItemIcon v-else :name="item.svg_key" :type="item.type" className="w-12 h-12 md:w-16 md:h-16 text-white" />
                 <div v-if="item.is_seasonal" class="absolute inset-0 bg-primary-500/5 animate-pulse"></div>
              </div>
              <span class="text-[8px] md:text-[10px] font-black text-center text-white/50 truncate w-full px-2 uppercase tracking-widest font-tight">{{ item.name }}</span>
              <span v-if="item.is_seasonal" class="text-[7px] md:text-[8px] font-black text-primary-500 mt-2 tracking-[0.2em]">LEGENDARY</span>
            </div>
          </div>
        </div>

        <!-- Result View -->
        <div v-if="finished" class="p-8 md:p-12 text-center animate-in-up flex flex-col items-center pb-32 md:pb-12 overflow-y-auto max-h-[60vh] scrollbar-hide">
          <div class="mb-6 md:mb-8 inline-flex items-center gap-4 px-6 py-2 rounded-xl bg-neon-lime/10 border border-neon-lime/20">
            <Trophy class="w-4 h-4 md:w-5 md:h-5 text-neon-lime" />
            <span class="text-[9px] md:text-[10px] font-black text-neon-lime uppercase tracking-[0.4em] font-tight">RECOVERY SUCCESSFUL</span>
          </div>
          <div class="space-y-3 md:space-y-4 mb-8 md:mb-10 max-w-lg">
             <h3 class="text-3xl md:text-5xl font-black text-industrial text-white italic tracking-tighter uppercase leading-none px-4">
               {{ reward.item ? reward.item.name : '+' + reward.coins + ' REPPY COINS' }}
             </h3>
             <p class="text-zinc-500 text-[10px] md:text-sm font-bold uppercase tracking-widest leading-relaxed px-6 md:px-8">
               {{ reward.message }}
             </p>
          </div>
          <button @click="close" class="btn-reppy !px-12 md:!px-16 !py-4 md:!py-5 !text-base md:!text-lg shadow-2xl mb-8 md:mb-0">
            COLLECT ASSET
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { X, Trophy, Sparkles, Zap, Coins, Archive } from 'lucide-vue-next';
import BackgroundEffect from './BackgroundEffect.vue';
import ItemIcon from './ItemIcon.vue';
import confetti from 'canvas-confetti';
import { useAudio } from '../composables/useAudio';

const { playChest, playClickBlip, playLevelUp } = useAudio();
const props = defineProps({
  show: Boolean,
  reward: Object,
  reelItems: Array
});

const emit = defineEmits(['close']);

// Clash Royale Mode State
const clashMode = computed(() => props.reward?.rewards && props.reward.rewards.length > 0);
const currentRevealIndex = ref(-1);
const activeReward = computed(() => (clashMode.value && currentRevealIndex.value >= 0) ? props.reward.rewards[currentRevealIndex.value] : null);
const isLegendaryChest = computed(() => {
  if (!clashMode.value) return false;
  // If the rewards contain a guaranteed legendary at the start or are from the legendary endpoint
  return props.reward.rewards.some(r => r.message === 'LEGENDARIO GARANTIZADO' || r.message === 'Oro Legendario');
});
const isEpicChest = computed(() => {
  if (!clashMode.value) return false;
  return props.reward.rewards.some(r => r.message === 'EPICO GARANTIZADO' || r.message === 'Oro Épico');
});

const isLegendaryReward = computed(() => {
  if (currentRevealIndex.value < 0 || currentRevealIndex.value >= props.reward.rewards.length) return false;
  const r = props.reward.rewards[currentRevealIndex.value];
  return r.type === 'item' && r.data.rarity?.toLowerCase() === 'legendary';
});

const clickedFlash = ref(false);
const isShaking = ref(false);

// Legacy Reel State
const reelRef = ref(null);
const localReel = ref([]);
const legacyFinished = ref(false);
const translateX = ref(0);
const winningIndex = 32;

const finished = computed(() => {
  if (clashMode.value) return currentRevealIndex.value >= props.reward.rewards.length;
  return legacyFinished.value;
});

onMounted(async () => {
  if (props.show) {
    if (!clashMode.value) {
      startLegacyAnimation();
    }
  }
});

const handleGlobalClick = () => {
  if (clashMode.value) {
    revealNext();
  }
};

const revealNext = () => {
  if (currentRevealIndex.value < props.reward.rewards.length) {
    // If we are at the chest view, add a flash effect
    if (currentRevealIndex.value === -1) {
      clickedFlash.value = true;
      if (isLegendaryChest.value) isShaking.value = true;
      setTimeout(() => {
        clickedFlash.value = false;
        isShaking.value = false;
      }, 400);
    }

    currentRevealIndex.value++;
    playClickBlip();
    
    if (currentRevealIndex.value === 0) {
      playChest();
    }

    // High rarity effect on reveal
    if (activeReward.value?.type === 'item') {
      const r = activeReward.value.data.rarity?.toLowerCase();
      if (['legendary', 'calistenico'].includes(r)) {
        playLevelUp();
        confetti({
          particleCount: r === 'legendary' ? 250 : 150,
          spread: r === 'legendary' ? 90 : 70,
          origin: { y: 0.6 },
          colors: r === 'calistenico' ? ['#CCFF00', '#ffffff'] : ['#FF4500', '#FFA500', '#ffffff']
        });
      }
    }

    // Final confetti on summary
    if (currentRevealIndex.value === props.reward.rewards.length) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 }
      });
    }
  }
};

const startLegacyAnimation = async () => {
  legacyFinished.value = false;
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
    const itemWidth = isMobile ? 140 : 188;
    
    const stopOffset = (Math.random() * 0.4 + 0.3) * itemWidth; 
    const midX = (containerWidth / 2) - (winningIndex * itemWidth) - (itemWidth / 2) - stopOffset;
    translateX.value = midX;

    setTimeout(() => {
      legacyFinished.value = true;
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

const getRarityGlow = (r) => {
  if (!r || r.type === 'coins') return 'bg-yellow-500';
  const rarity = r.data.rarity?.toLowerCase();
  switch (rarity) {
    case 'calistenico': return 'bg-[#ccff00]';
    case 'legendary': return 'bg-primary-500';
    case 'especial': case 'epic': return 'bg-purple-500';
    case 'rare': return 'bg-blue-500';
    default: return 'bg-zinc-500';
  }
};

const getRarityClasses = (r) => {
  if (!r || r.type === 'coins') return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
  const rarity = r.data.rarity?.toLowerCase();
  switch (rarity) {
    case 'calistenico': return 'bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20';
    case 'legendary': return 'bg-primary-500/10 text-primary-500 border border-primary-500/20';
    case 'especial': case 'epic': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    case 'rare': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    default: return 'bg-zinc-800 text-zinc-400 border border-white/5';
  }
};

const getRarityLabel = (rarity) => {
  const r = rarity?.toLowerCase();
  switch (r) {
    case 'common': return 'COMÚN';
    case 'rare': return 'RARO';
    case 'especial': case 'epic': return 'ESPECIAL';
    case 'legendary': return 'LEGENDARIO';
    case 'calistenico': return 'CALISTÉNICO';
    default: return 'COMÚN';
  }
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

@keyframes reveal {
  0% { transform: scale(0.5) translateY(50px); opacity: 0; filter: blur(20px); }
  60% { transform: scale(1.1) translateY(-10px); filter: blur(0px); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.animate-reveal { animation: reveal 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}
.animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }

@keyframes legendary-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.5); opacity: 0.6; filter: blur(40px); }
}
.animate-legendary-pulse { animation: legendary-pulse 4s ease-in-out infinite; }

@keyframes legendary-reveal {
  0% { transform: scale(0.3) rotate(-20deg); opacity: 0; filter: brightness(5) blur(20px); }
  60% { transform: scale(1.2) rotate(5deg); filter: brightness(1) blur(0px); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
.animate-legendary-reveal { animation: legendary-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes flare {
  0% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(2); }
  100% { opacity: 0; transform: scale(3); }
}
.legendary-flare { animation: flare 1s ease-out infinite; }

@keyframes shake-gentle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
}
.animate-shake-gentle { animation: shake-gentle 0.1s linear infinite; }

.reward-card {
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.7);
}
</style>

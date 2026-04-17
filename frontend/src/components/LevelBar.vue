<template>
  <div class="relative flex flex-col gap-1.5 min-w-[150px] group cursor-help transition-all duration-500" 
       @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
    
    <!-- Level Badge & Label -->
    <div class="flex items-end justify-between px-1">
      <div class="flex items-baseline gap-2">
        <span class="text-[9px] font-black text-muted uppercase tracking-[0.2em] opacity-60">RANGO</span>
        <span class="text-2xl font-black text-foreground italic leading-none font-industrial tracking-tighter drop-shadow-md">
          {{ level }}
        </span>
      </div>
      <div class="flex flex-col items-end leading-none">
        <span class="text-[8px] font-black text-primary-500 uppercase tracking-widest mb-0.5">PROGRESO</span>
        <span class="text-[10px] font-black text-foreground/80 text-precision tabular-nums">
          {{ Math.floor(progress) }}%
        </span>
      </div>
    </div>

    <!-- Progress Track -->
    <div class="h-2 w-full bg-surface/40 border border-white/5 rounded-full overflow-hidden relative shadow-inner group-hover:border-primary-500/30 transition-colors duration-500">
      <!-- Glow Layer -->
      <div 
        class="absolute inset-y-0 left-0 bg-primary-500 shadow-[0_0_20px_rgba(255,69,0,0.5)] transition-all duration-1000 ease-out"
        :style="{ width: `${progress}%` }"
      >
        <!-- Animated Shimmer -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
      </div>
    </div>

    <!-- Tooltip (XP details) -->
    <Transition name="tooltip-slide">
      <div v-if="showTooltip" 
           class="absolute top-full mt-4 left-1/2 -translate-x-1/2 z-[200] bg-black/90 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] min-w-[220px] pointer-events-none overflow-hidden">
        
        <!-- Decorative Glow -->
        <div class="absolute -top-10 -left-10 w-24 h-24 bg-primary-500/20 blur-3xl"></div>
        
        <div class="relative z-10 space-y-4">
          <div class="flex items-center gap-3 border-b border-white/10 pb-3">
            <Zap class="w-4 h-4 text-primary-500 animate-pulse" />
            <p class="text-[10px] font-black text-white uppercase tracking-[0.3em] font-industrial">DETALLES DE RANGO</p>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between items-end">
              <span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">XP TOTAL</span>
              <span class="text-xs font-black text-white text-precision tabular-nums">{{ currentXp }} / {{ (level + 1) * nextLevelXp }}</span>
            </div>
            
            <div class="flex justify-between items-end">
              <span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">PROGRESO NIVEL</span>
              <div class="flex items-baseline gap-1">
                <span class="text-sm font-black text-primary-500 text-precision">{{ currentXp % nextLevelXp }}</span>
                <span class="text-[8px] font-bold text-zinc-500 text-precision">XP</span>
              </div>
            </div>
 
            <div class="flex justify-between items-end">
              <span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest">RESTANTE</span>
              <span class="text-xs font-black text-neon-lime text-precision tabular-nums">{{ nextLevelXp - (currentXp % nextLevelXp) }} XP</span>
            </div>
          </div>

          <!-- Mini Stats Bar Info -->
          <div class="pt-3 border-t border-white/10 mt-1">
            <p class="text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed text-center">
              Consigue XP para ganar <span class="text-primary-500 font-black">COFRES DE BOTÍN</span>. Cada repetición suma.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Zap } from 'lucide-vue-next';

const props = defineProps({
  level: { type: Number, default: 1 },
  currentXp: { type: Number, default: 0 },
  nextLevelXp: { type: Number, default: 1000 },
});

const showTooltip = ref(false);

const progress = computed(() => {
  if (!props.nextLevelXp) return 0;
  // Based on 1000 XP threshold as implemented in backend
  const currentLevelXP = props.currentXp % props.nextLevelXp;
  return Math.min(100, (currentLevelXP / props.nextLevelXp) * 100);
});
</script>

<style scoped>
.font-industrial { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }

@keyframes shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(200%); }
}
.animate-shimmer {
  animation: shimmer 3s infinite;
}

.tooltip-slide-enter-active, .tooltip-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.tooltip-slide-enter-from, .tooltip-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 15px) scale(0.95);
}
</style>

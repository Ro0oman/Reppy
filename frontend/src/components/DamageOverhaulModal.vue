<template>
  <Transition name="fade">
    <div v-if="show" 
         class="fixed inset-0 z-[100] flex justify-center items-start overflow-y-auto p-4 md:p-8"
         role="dialog"
         aria-modal="true"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md" @click="close"></div>

      <!-- Content Card -->
      <div class="relative max-w-lg w-full bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(255,69,0,0.3)] p-8 md:p-10 overflow-hidden animate-in my-auto">
        
        <!-- Close Button -->
        <button @click="close" class="absolute top-6 right-6 z-20 p-2 text-muted hover:text-white transition-colors">
          <X class="w-6 h-6" />
        </button>

        <!-- Glow accents -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <!-- Header: Compact -->
        <div class="relative z-10 text-center mb-8">
          <h2 class="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
            RPG STATS<span class="text-primary-500">.</span>EVOLUTION
          </h2>
          <p class="text-[9px] font-black text-neon-lime uppercase tracking-[0.3em]">NUEVO SISTEMA DE ESCALADO DE DAÑO</p>
        </div>

        <!-- Stat Orbs: Massive Update (6 Stats) -->
        <div class="grid grid-cols-3 gap-4 mb-10 relative z-10">
           <div v-for="stat in rpgStatsSummary" :key="stat.label" class="flex flex-col items-center gap-2 group">
              <div class="w-12 h-12 bg-surface/50 border border-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                 <component :is="stat.icon" class="w-6 h-6" :class="stat.color" />
              </div>
              <span class="text-[8px] font-black uppercase text-zinc-500 tracking-widest group-hover:text-foreground transition-colors">{{ stat.label }}</span>
           </div>
        </div>

        <!-- Visual Formula: More graphic -->
        <div class="bg-black/40 border border-white/5 rounded-3xl p-6 relative z-10 mb-8 flex flex-col items-center gap-4">
           <div class="flex flex-wrap justify-center items-center gap-2 text-zinc-500">
              <div class="flex items-center gap-1.5 bg-zinc-800/50 p-1.5 rounded-lg text-white">
                 <Dumbbell class="w-3.5 h-3.5 text-orange-500" />
                 <Sword class="w-3.5 h-3.5 text-cyan-400" />
                 <Activity class="w-3.5 h-3.5 text-green-400" />
                 <span class="text-[8px] font-black italic">+</span>
                 <Heart class="w-3.5 h-3.5 text-red-500" />
                 <Brain class="w-3.5 h-3.5 text-blue-400" />
                 <Church class="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <span class="text-xs font-black italic">=</span>
              <div class="p-2 bg-primary-500/20 rounded-xl border border-primary-500/30">
                 <Zap class="w-5 h-5 text-primary-500" />
              </div>
           </div>
           <p class="text-center text-[10px] text-zinc-400 font-medium leading-relaxed max-w-[280px] italic">
             "Tus atributos ahora escalan directamente tu daño. Fuerza para el impacto, Destreza para críticos, e Intelecto para la eficiencia."
           </p>
        </div>

        <!-- Alert badge -->
        <div class="flex justify-center mb-10 relative z-10">
           <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full">
              <div class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
              <span class="text-[9px] font-black text-primary-500 uppercase tracking-widest">SISTEMA RPG INICIADO</span>
           </div>
        </div>

        <!-- Action Button -->
        <div class="relative z-10 text-center">
           <button @click="close" 
             class="group relative inline-flex items-center justify-center px-10 py-5 bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95">
             ACEPTAR DESAFÍO
           </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { 
  Sword, Sparkles, Dumbbell, Zap, Target, Info, 
  Activity, Heart, Brain, Church, X 
} from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import axios from 'axios';

const i18n = useI18nStore();

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);

const rpgStatsSummary = [
  { label: 'STR', icon: Dumbbell, color: 'text-orange-500' },
  { label: 'DEX', icon: Sword, color: 'text-cyan-400' },
  { label: 'END', icon: Activity, color: 'text-green-400' },
  { label: 'VIG', icon: Heart, color: 'text-red-500' },
  { label: 'INT', icon: Brain, color: 'text-blue-400' },
  { label: 'FTH', icon: Church, color: 'text-yellow-400' }
];

const close = async () => {
    try {
        await axios.patch('/api/users/seen-damage-modal');
        emit('close');
    } catch (err) {
        console.error("Error updated modal status", err);
        emit('close');
    }
};
</script>

<style scoped>
.font-industrial { font-family: 'Inter Tight', sans-serif; }

.animate-in {
  animation: modalEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalEnter {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

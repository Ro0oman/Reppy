<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-md" @click="close"></div>

      <!-- Falling Eggs Container -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div v-for="n in 15" :key="n" class="egg" :style="getEggStyle(n)">
          <svg viewBox="0 0 100 120" class="w-8 h-10 opacity-40">
            <ellipse cx="50" cy="65" rx="35" ry="50" :fill="getRandomColor()" />
            <path d="M30 45 Q50 35 70 45" fill="none" stroke="white" stroke-width="4" opacity="0.3" />
            
          </svg>
        </div>
      </div>

      <!-- Modal Card -->
      <div class="glass relative max-w-lg w-full p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-white/20 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center space-y-6 md:space-y-8 animate-in fade-in duration-500 scale-100">
        <!-- Close Button (X) -->
        <button @click="close" class="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all hover:rotate-90 group z-10 text-white">
          <XIcon class="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <!-- Festive Icon -->
        <div class="flex justify-center -mt-16">
          <div class="p-5 bg-amber-500 rounded-3xl shadow-xl shadow-amber-500/20 animate-bounce">
            <Zap class="w-10 h-10 text-zinc-900" />
          </div>
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500 uppercase tracking-tighter italic">
            ¡La Pascua ha llegado!
          </h2>
          <p class="text-lg md:text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Vigila esos huevos... ¡y tus repeticiones! 🥚🔨
          </p>
        </div>

        <div class="grid grid-cols-1 gap-4 text-left">
          <div class="flex items-start gap-4 p-4 rounded-2xl bg-zinc-100/50 dark:bg-white/5 border border-white/5 group hover:bg-amber-500/10 transition-colors">
            <div class="p-2 bg-amber-500/20 rounded-lg text-amber-500">
              <Coins class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-widest text-xs">Nueva Economía: Reppy Coins</h4>
              <p class="text-sm text-zinc-500 font-medium">Gana monedas por cada serie logueada. ¡Cuanto más peso, más coins!</p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-4 rounded-2xl bg-zinc-100/50 dark:bg-white/5 border border-white/5 group hover:bg-primary-500/10 transition-colors">
            <div class="p-2 bg-primary-500/20 rounded-lg text-primary-500">
              <ShoppingBag class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-zinc-900 dark:text-white uppercase tracking-widest text-xs">Tienda Goggins</h4>
              <p class="text-sm text-zinc-500 font-medium">Gasta tus coins en Títulos y Bordes legendarios para tu perfil.</p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-4 rounded-2xl bg-zinc-100/50 dark:bg-white/5 border border-white/5 group hover:bg-red-500/10 transition-colors">
            <div class="p-2 bg-red-500/20 rounded-lg text-red-500">
              <Flame class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-black text-zinc-900 dark:text-white uppercase tracking-widest text-xs">Próximamente: El Conejo de Acero</h4>
              <p class="text-sm text-zinc-600 dark:text-zinc-400 font-bold">Prepárate para el primer evento de Boss. Recompensas únicas este sábado.</p>
            </div>
          </div>
        </div>

        <button @click="close"
          class="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary-900/20 transition-all group flex items-center justify-center gap-3">
          <span>¡A por ellos!</span>
          <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Zap, Coins, ShoppingBag, Flame, ArrowRight, X as XIcon } from 'lucide-vue-next';
import axios from 'axios';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);

const close = async () => {
    try {
        await axios.patch('/api/users/seen-easter-modal');
        emit('close');
    } catch (err) {
        console.error("Error closing modal", err);
        emit('close'); // Close anyway to not block user
    }
};

const getRandomColor = () => {
  const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getEggStyle = (n) => {
  const left = Math.random() * 100;
  const size = 0.5 + Math.random() * 1.5;
  const delay = Math.random() * 5;
  const duration = 3 + Math.random() * 4;
  
  return {
    left: `${left}%`,
    transform: `scale(${size})`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  };
};
</script>

<style scoped>
.egg {
  position: absolute;
  top: -100px;
  animation: fall linear infinite;
}

@keyframes fall {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" @click="!spinning && $emit('close')"></div>
    
    <div class="relative bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden transform transition-all animate-in fade-in duration-300">
      <div class="px-8 pt-8 text-center">
        <div class="inline-flex p-3 bg-primary-500/10 rounded-2xl mb-4">
          <Sparkles class="w-6 h-6 text-primary-600" />
        </div>
        <h2 class="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic leading-none">
          Giro <span class="text-primary-600">Diario</span>
        </h2>
        <p class="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-2">Prueba tu suerte para ganar recompensas.</p>
      </div>

      <div class="p-8 flex flex-col items-center">
        <!-- The Wheel Container -->
        <div class="relative w-full aspect-square max-w-[280px]">
          <!-- Pointer -->
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
            <div class="w-6 h-8 bg-zinc-900 dark:bg-white clip-pointer shadow-lg"></div>
          </div>

          <!-- SVG Wheel -->
          <svg 
            viewBox="0 0 100 100" 
            class="w-full h-full drop-shadow-2xl transition-transform duration-[4000ms] cubic-bezier-custom"
            :style="{ transform: `rotate(${rotation}deg)` }"
          >

            <g v-for="(p, index) in rewards" :key="index">
              <path 
                :d="getSegmentPath(index)" 
                :fill="p.bgColor"
                class="hover:opacity-90 transition-opacity"
              />
              <text 
                :x="getTextCoords(index).x" 
                :y="getTextCoords(index).y" 
                :transform="`rotate(${index * 45 + 22.5}, ${getTextCoords(index).x}, ${getTextCoords(index).y})`"
                fill="white" 
                font-size="4" 
                font-weight="900" 
                text-anchor="middle"
                class="pointer-events-none uppercase tracking-tighter"
              >
                {{ p.name }}
              </text>
            </g>
            <circle cx="50" cy="50" r="2" fill="white" />
          </svg>

          <!-- Center Button -->
          <button 
            @click="spinWheel"
            :disabled="spinning || !canSpin"
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white dark:bg-zinc-800 shadow-2xl border-4 border-primary-500 flex items-center justify-center z-30 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <span class="text-[10px] font-black text-primary-600 uppercase tracking-tighter">{{ spinning ? '...' : 'GIRAR' }}</span>
          </button>
        </div>

        <!-- Result Feedback -->
        <div class="mt-8 min-h-[60px] flex items-center justify-center">
          <div v-if="prizeResult" class="text-center animate-bounce">
            <p class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{{ prizeResult.msg }}</p>
            <div class="bg-primary-500/10 px-6 py-2 rounded-xl border border-primary-500/20">
               <span class="text-xl font-black text-primary-600">
                 {{ getPrizeText(prizeResult) }}
               </span>
            </div>
          </div>
          <div v-else-if="!canSpin && !spinning" class="text-center">
            <p class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 italic">Vuelve mañana</p>
            <div class="bg-zinc-100 dark:bg-white/5 px-6 py-2 rounded-xl border border-zinc-200 dark:border-white/10">
               <span class="text-sm font-bold text-zinc-400">Ya has realizado tu giro diario</span>
            </div>
          </div>
        </div>

      </div>

      <div class="p-6 bg-zinc-50 dark:bg-black/20 border-t border-zinc-200 dark:border-white/5 flex justify-center">
        <button @click="$emit('close')" :disabled="spinning" class="text-xs font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white uppercase tracking-widest transition-all">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Sparkles } from 'lucide-vue-next';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import confetti from 'canvas-confetti';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close', 'spun']);

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const spinning = ref(false);
const canSpin = ref(true);
const rotation = ref(0);
const prizeResult = ref(null);

const rewards = [
  { id: 0, name: '20 🪙', bgColor: '#FBBF24' },
  { id: 1, name: '50 🪙', bgColor: '#F59E0B' },
  { id: 2, name: '100 🪙', bgColor: '#D97706' },
  { id: 3, name: '200 🪙', bgColor: '#B45309' },
  { id: 4, name: '400 🪙', bgColor: '#4F46E5' }, // Win big
  { id: 5, name: 'NADA', bgColor: '#71717A' },
  { id: 6, name: 'MUY NADA', bgColor: '#52525B' },
  { id: 7, name: '⭐ ITEM', bgColor: '#8B5CF6' } // Special
];

// SVG Helpers
const getSegmentPath = (index) => {
  const startAngle = index * 45;
  const endAngle = (index + 1) * 45;
  const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
  const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
  const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
  const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);
  return `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
};

const getTextCoords = (index) => {
  const angle = (index * 45) + 22.5 - 90;
  return {
    x: 50 + 35 * Math.cos((Math.PI * angle) / 180),
    y: 50 + 35 * Math.sin((Math.PI * angle) / 180)
  };
};

const getPrizeText = (prize) => {
  if (prize.type === 'coins') return `+${prize.value} REPPY COINS`;
  if (prize.type === 'special') return prize.item ? `¡${prize.item.name}! 🏆` : '¡OBJETO LEGENDARIO!';
  return 'INTÉNTALO MAÑANA';
};

const spinWheel = async () => {
  if (spinning.value || !canSpin.value) return;

  try {
    const res = await axios.post('/api/roulette/spin');
    const data = res.data;
    
    spinning.value = true;
    prizeResult.value = null;

    // Calculate rotation
    // Add 5-10 full spins + the segment offset
    // Important: we subtract the segment angle from 360 since it spins clockwise
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const segmentAngle = 45;
    const targetId = data.prize.id;
    
    // Rotation = (Current Full Rotations) + (Extra Full Spins) + (Adjustment to land on targetId)
    // The pointer is at top (0 deg). Target segment 'targetId' starts at targetId * 45.
    // To land targetId at top, we need to rotate by 360 - (targetId * 45) - 22.5 offset
    const currentBase = Math.floor(rotation.value / 360) * 360;
    const targetRotation = currentBase + (extraSpins * 360) + (360 - (targetId * segmentAngle) - 22.5);
    
    rotation.value = targetRotation;

    // Wait for transition
    setTimeout(() => {
      spinning.value = false;
      prizeResult.value = { ...data.prize, msg: data.message };
      canSpin.value = false;
      
      // Update balance
      authStore.user.reppy_coins = data.new_balance;

      if (data.prize.type !== 'nothing') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#8B5CF6', '#F59E0B']
        });
        notificationStore.notify('¡Felicidades por tu premio!', 'success');
      } else {
        notificationStore.notify('Vuelve mañana para más suerte', 'info');
      }

      emit('spun');
    }, 4000);

  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Error al conectar con la ruleta', 'error');
  }
};

onMounted(async () => {
  try {
    const res = await axios.get('/api/roulette/status');
    canSpin.value = res.data.canSpin;
  } catch (e) {
    canSpin.value = false;
  }
});
</script>

<style scoped>
.clip-pointer {
  clip-path: polygon(50% 100%, 0 0, 100% 0);
}

.cubic-bezier-custom {
  transition-timing-function: cubic-bezier(0.1, 0, 0.2, 1);
}
</style>


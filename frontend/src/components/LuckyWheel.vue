<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex justify-center items-start overflow-y-auto p-4 md:p-8">
    <div class="fixed inset-0 bg-zinc-950/80 backdrop-blur-md" @click="!spinning && $emit('close')"></div>
    
    <div class="relative bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden transform transition-all animate-in fade-in duration-300 my-auto">
      <div class="px-8 pt-8 text-center">
        <div class="inline-flex p-3 bg-primary-500/10 rounded-2xl mb-4">
          <Sparkles class="w-6 h-6 text-primary-600" />
        </div>
        <h2 class="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic leading-none">
          {{ i18n.t('wheel_title_start') }} <span class="text-primary-600">{{ i18n.t('wheel_title_end') }}</span>
        </h2>
        <p class="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-2">{{ i18n.t('wheel_subtitle') }}</p>
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
                :transform="`rotate(${getCumulativeAngle(index) + (p.size / 2)}, ${getTextCoords(index).x}, ${getTextCoords(index).y})`"
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
            <span class="text-[10px] font-black text-primary-600 uppercase tracking-tighter">{{ spinning ? i18n.t('wheel_btn_spinning') : i18n.t('wheel_btn_spin') }}</span>
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
            <p class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 italic">{{ i18n.t('wheel_return_tomorrow') }}</p>
            <div class="bg-zinc-100 dark:bg-white/5 px-6 py-2 rounded-xl border border-zinc-200 dark:border-white/10">
               <span class="text-sm font-bold text-zinc-400">{{ i18n.t('wheel_already_spun') }}</span>
            </div>
          </div>
        </div>

      </div>

      <div class="p-6 bg-zinc-50 dark:bg-black/20 border-t border-zinc-200 dark:border-white/5 flex justify-center pb-12 sm:pb-6">
        <button @click="$emit('close')" :disabled="spinning" class="text-xs font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white uppercase tracking-widest transition-all">
          {{ i18n.t('wheel_btn_close') }}
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
import { useI18nStore } from '../stores/i18n';
import confetti from 'canvas-confetti';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close', 'spun']);

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const i18n = useI18nStore();

const spinning = ref(false);
const canSpin = ref(true);
const rotation = ref(0);
const prizeResult = ref(null);

const rewards = [
  { id: 0, name: '200 🪙', bgColor: '#FBBF24', size: 72 }, // 20 * 3.6
  { id: 1, name: '400 🪙', bgColor: '#F59E0B', size: 54 }, // 15 * 3.6
  { id: 2, name: '600 🪙', bgColor: '#D97706', size: 43.2 }, // 12 * 3.6
  { id: 3, name: '800 🪙', bgColor: '#B45309', size: 36 }, // 10 * 3.6
  { id: 4, name: '1000 🪙', bgColor: '#4F46E5', size: 28.8 }, // 8 * 3.6
  { id: 5, name: '2000 🪙', bgColor: '#EF4444', size: 14.4 }, // 4 * 3.6
  { id: 10, name: '3 💎', bgColor: '#10B981', size: 72 }, // 20 * 3.6
  { id: 6, name: '🧪', bgColor: '#6366F1', size: 21.6 }, // 6 * 3.6
  { id: 7, name: '🎁 L', bgColor: '#8B5CF6', size: 10.8 }, // 3 * 3.6
  { id: 8, name: '🎁 B', bgColor: '#EC4899', size: 5.4 }, // 1.5 * 3.6
  { id: 9, name: '🎁 E', bgColor: '#F43F5E', size: 1.8 } // 0.5 * 3.6
];

// Helper to get cumulative angles
const getCumulativeAngle = (index) => {
  return rewards.slice(0, index).reduce((sum, r) => sum + r.size, 0);
};

// SVG Helpers
const getSegmentPath = (index) => {
  const startAngle = getCumulativeAngle(index);
  const endAngle = startAngle + rewards[index].size;
  const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
  const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
  const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
  const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);
  return `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
};

const getTextCoords = (index) => {
  const startAngle = getCumulativeAngle(index);
  const centerXAngle = startAngle + (rewards[index].size / 2) - 90;
  return {
    x: 50 + 35 * Math.cos((Math.PI * centerXAngle) / 180),
    y: 50 + 35 * Math.sin((Math.PI * centerXAngle) / 180)
  };
};

const getPrizeText = (prize) => {
  if (prize.type === 'coins') return i18n.t('wheel_prizemsg_coins', { value: prize.value });
  if (prize.type === 'gems') return i18n.t('wheel_prizemsg_gems', { value: prize.value }) || `+${prize.value} Gemas`;
  if (prize.type === 'consumable') return i18n.t('wheel_prizemsg_item', { name: prize.item ? prize.item.name : i18n.t('wheel_potion') });
  if (prize.type === 'chest') return i18n.t('wheel_prizemsg_chest');
  return i18n.t('wheel_try_tomorrow');
};

const spinWheel = async () => {
  if (spinning.value || !canSpin.value) return;

  try {
    const res = await axios.post('/api/roulette/spin');
    const data = res.data;
    
    spinning.value = true;
    prizeResult.value = null;

    // Calculate rotation
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const targetId = data.prize.id;
    
    // Find the center of the target segment
    const targetStartAngle = getCumulativeAngle(targetId);
    const targetCenterAngle = targetStartAngle + (rewards[targetId].size / 2);
    
    // Rotation = (Current Full Rotations) + (Extra Full Spins) + (Adjustment to land on targetCenterAngle at the top pointer)
    // The pointer is at top (0 deg). To land targetCenterAngle at top, we rotate by 360 - targetCenterAngle
    const currentBase = Math.floor(rotation.value / 360) * 360;
    const targetRotation = currentBase + (extraSpins * 360) + (360 - targetCenterAngle);
    
    rotation.value = targetRotation;

    // Wait for transition
    setTimeout(() => {
      spinning.value = false;
      prizeResult.value = { ...data.prize, msg: data.message };
      canSpin.value = false;
      
      // Update balances
      authStore.user.reppy_coins = data.new_coins;
      authStore.user.reppy_gems = data.new_gems;

      if (data.prize.type !== 'nothing') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#8B5CF6', '#F59E0B']
        });
        notificationStore.notify(i18n.t('wheel_congrats'), 'success');
      } else {
        notificationStore.notify(i18n.t('wheel_return_info'), 'info');
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


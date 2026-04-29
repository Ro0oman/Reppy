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
            :disabled="spinning || !rouletteStore.canSpin"
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
          <div v-else-if="!rouletteStore.canSpin && !spinning" class="text-center">
            <p class="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 italic">{{ i18n.t('wheel_return_tomorrow') }}</p>
            <div class="bg-zinc-100 dark:bg-white/5 px-6 py-2 rounded-xl border border-zinc-200 dark:border-white/10">
               <span class="text-sm font-bold text-zinc-400">{{ i18n.t('wheel_already_spun') }}</span>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Result Modal (Victory UI) -->
    <Transition name="scale">
      <div v-if="showResultModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/95 backdrop-blur-xl"></div>
        
        <div class="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[3rem] p-8 text-center shadow-[0_0_100px_rgba(79,70,229,0.3)] animate-scale-in">
          <div class="absolute -top-12 left-1/2 -translate-x-1/2">
            <div class="w-24 h-24 bg-primary-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl border-4 border-zinc-900">
               <Sparkles class="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>

          <div class="mt-12 space-y-2">
            <h3 class="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em]">{{ i18n.t('wheel_congrats') }}</h3>
            <h2 class="text-4xl font-black text-white italic uppercase tracking-tighter">{{ i18n.t('ui_reward_unlocked') }}</h2>
          </div>

          <div class="my-10 p-8 bg-white/5 rounded-[2rem] border border-white/5 relative group">
            <div class="absolute inset-0 bg-primary-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <!-- Prize Icon/Visual -->
            <div class="text-6xl mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              <span v-if="prizeResult.type === 'coins'">🪙</span>
              <span v-else-if="prizeResult.type === 'gems'">💎</span>
              <span v-else-if="prizeResult.type === 'consumable'">🧪</span>
              <span v-else-if="prizeResult.type === 'chest'">🎁</span>
              <span v-else>✨</span>
            </div>

            <div class="text-2xl font-black text-white tracking-tight leading-none">
              {{ getPrizeText(prizeResult) }}
            </div>
            <p v-if="prizeResult.item" class="text-[10px] font-bold text-muted uppercase tracking-widest mt-2">
              {{ prizeResult.item.description || 'Rare Consumable' }}
            </p>
          </div>

          <button 
            @click="closeResult"
            class="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.4em] transition-all active:scale-95 shadow-xl shadow-primary-600/20"
          >
            {{ i18n.t('pvp_return') }}
          </button>
          
          <p class="mt-6 text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">
            REPPY VAULT SYSTEM v2.0
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Sparkles } from 'lucide-vue-next';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { useI18nStore } from '../stores/i18n';
import { useRouletteStore } from '../stores/roulette';
import confetti from 'canvas-confetti';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close', 'spun']);

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const i18n = useI18nStore();
const rouletteStore = useRouletteStore();

const spinning = ref(false);
const rotation = ref(0);
const prizeResult = ref(null);
const showResultModal = ref(false);

const closeResult = () => {
  showResultModal.value = false;
  emit('close');
};

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
  if (spinning.value || !rouletteStore.canSpin) return;

  try {
    const res = await axios.post('/api/roulette/spin');
    const data = res.data;
    
    spinning.value = true;
    prizeResult.value = null;
    rouletteStore.setSpun();
    emit('spun');

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
      showResultModal.value = true;
      
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
    }, 4000);

  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Error al conectar con la ruleta', 'error');
  }
};

onMounted(async () => {
  rouletteStore.checkStatus();
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


<template>
  <div class="card-stats p-8 relative overflow-hidden group transition-all duration-500 border-white/10 hover:border-primary-500/30">
    <!-- Background Industrial Detail -->
    <div class="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors"></div>
    
    <div class="flex items-center justify-between relative z-10 mb-8">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-gradient-radial from-primary-500 to-primary-600 rounded-xl shadow-[0_0_20px_rgba(255,69,0,0.3)]">
          <Zap class="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 class="text-2xl font-black text-industrial uppercase tracking-tighter text-white">{{ activeLabel }}</h3>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-neon-lime animate-pulse"></span>
            <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{{ exerciseType.replace('_', ' ') }} protocol</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Add Grid -->
    <div class="grid grid-cols-3 gap-4 relative z-10 mb-8">
      <button 
        v-for="val in [1, 5, 10]" :key="val"
        @click="addReps(val)"
        class="group relative overflow-hidden py-6 px-4 bg-white/5 border border-white/5 rounded-2xl transition-all hover:bg-primary-500 hover:scale-105 active:scale-95 shadow-xl"
      >
        <span class="relative z-10 text-2xl font-black text-precision group-hover:text-white">+{{ val }}</span>
        <div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </div>

    <!-- Custom Input Area -->
    <div class="space-y-6 relative z-10">
      <div class="relative group/input">
        <label class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block px-1">Custom Reps</label>
        <div class="flex gap-3">
          <div class="relative flex-1">
            <input 
              v-model.number="customReps"
              type="number"
              placeholder="00"
              class="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white font-black text-precision placeholder:text-zinc-800 focus:outline-none focus:border-primary-500/50 transition-all text-xl shadow-inner"
            />
          </div>
          <button 
            @click="addReps(customReps)"
            :disabled="!customReps"
            class="btn-reppy !px-8 !py-4 disabled:opacity-20 disabled:grayscale disabled:scale-100"
          >
            {{ i18n.t('btn_add') }}
          </button>
        </div>
      </div>

      <!-- Added Weight Input (Conditional) -->
      <div v-if="exerciseType === 'weighted_pullups'" class="animate-in fade-in slide-in-from-top-4 duration-500">
        <label class="text-[10px] font-black uppercase tracking-[0.2em] text-neon-lime/70 mb-2 block px-1">Added Load (Kg)</label>
        <div class="relative group/weight">
          <input 
            v-model.number="addedWeight"
            type="number"
            placeholder="0.0"
            class="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white font-black text-precision focus:outline-none focus:border-neon-lime/30 transition-all text-lg shadow-inner"
          />
          <div class="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-600 uppercase tracking-widest pointer-events-none">KG</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { Zap } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useNotificationStore } from '../stores/notification';

const props = defineProps({
  exerciseType: {
    type: String,
    default: 'pullups'
  }
});

const i18n = useI18nStore();
const notificationStore = useNotificationStore();
const emit = defineEmits(['updated']);
const customReps = ref(null);
const addedWeight = ref(null);

const activeLabel = computed(() => {
  const map = {
    pullups: 'Pullups',
    muscleups: 'Muscle Ups',
    dips: 'Dips',
    pushups: 'Pushups',
    weighted_pullups: 'Weighted'
  };
  return map[props.exerciseType] || 'Reps';
});

const addReps = async (count) => {
  if (!count) return;
  try {
    const today = new Date().toISOString().split('T')[0];
    await axios.post('/api/reps', {
      count,
      date: today,
      exercise_type: props.exerciseType,
      added_weight: addedWeight.value || 0
    });
    
    let msg = `+${count} logged`;
    notificationStore.notify(msg, 'success');
    
    if (customReps.value === count) customReps.value = null;
    emit('updated');
  } catch (error) {
    console.error('Error logging reps:', error);
    notificationStore.notify('Failed to log reps', 'error');
  }
};
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
</style>

<template>
  <div class="flex flex-col gap-6 p-8 bg-amber-500/5 backdrop-blur-xl border-2 border-amber-500/30 rounded-[2.5rem] shadow-[0_20px_50px_rgba(245,158,11,0.15)] relative overflow-hidden group transition-all duration-500 hover:border-amber-500/50">
    <!-- Background Glow Decoration -->
    <div class="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px]"></div>
    
    <div class="flex items-center justify-between relative z-10">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-amber-500 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
          <Zap class="w-5 h-5 text-black" />
        </div>
        <div>
          <h3 class="text-xl font-black text-white uppercase tracking-tighter">{{ activeLabel }}</h3>
          <p class="text-[10px] font-bold text-amber-500/60 uppercase tracking-[0.2em]">{{ exerciseType.replace('_', ' ') }} Protocol</p>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-3 gap-4 relative z-10">
      <button 
        v-for="val in [1, 5, 10]" :key="val"
        @click="addReps(val)"
        class="group relative overflow-hidden py-5 px-4 bg-zinc-900 border border-white/5 rounded-2xl font-black text-xl transition-all hover:bg-amber-500 hover:text-black hover:scale-105 active:scale-95 shadow-xl hover:shadow-amber-500/20"
      >
        <span class="relative z-10">+{{ val }}</span>
        <div class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </div>

    <div class="relative mt-2 z-10 group/input">
      <input 
        v-model.number="customReps"
        type="number"
        :placeholder="i18n.t('custom_amount') || 'Enter Reps...'"
        class="w-full bg-black/60 border-2 border-white/5 rounded-2xl px-6 py-5 pr-24 text-white font-bold placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all text-lg shadow-inner"
      />
      <button 
        @click="addReps(customReps)"
        :disabled="!customReps"
        class="absolute right-2 top-2 bottom-2 px-6 bg-amber-500 hover:bg-amber-400 disabled:opacity-20 disabled:grayscale rounded-xl text-xs font-black text-black uppercase tracking-widest transition-all shadow-lg active:scale-95 shadow-amber-500/20"
      >
        {{ i18n.t('btn_add') }}
      </button>
    </div>

    <!-- Added Weight Input (Conditional) -->
    <div v-if="exerciseType === 'weighted_pullups'" class="relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <label class="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/50 mb-2 block px-1">Lastre Añadido (Kg)</label>
      <div class="relative group/weight">
        <input 
          v-model.number="addedWeight"
          type="number"
          placeholder="0.0"
          class="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-amber-500/30 transition-all text-sm shadow-inner"
        />
        <div class="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-600 uppercase tracking-widest pointer-events-none">KG</div>
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
    pullups: 'Dominadas',
    muscleups: 'Muscle Ups',
    dips: 'Fondos',
    pushups: 'Flexiones',
    weighted_pullups: 'Dominadas Lastre'
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
    
    let msg = `+${count} ${activeLabel.value} logged!`;
    if (addedWeight.value) msg += ` (with ${addedWeight.value}kg lastre)`;
    notificationStore.notify(msg, 'success');
    
    if (customReps.value === count) customReps.value = null;
    emit('updated');
  } catch (error) {
    console.error('Error logging reps:', error);
    notificationStore.notify('Failed to log reps', 'error');
  }
};
</script>

<template>
  <div class="flex flex-col gap-4 p-6 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl shadow-xl hover:border-zinc-700/50 transition-all duration-300">
    <div class="flex items-center gap-2">
      <PlusCircle class="w-5 h-5 text-primary-400" />
      <h3 class="text-lg font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">{{ i18n.t('log_pullups') }}</h3>
    </div>
    
    <div class="grid grid-cols-3 gap-3">
      <button 
        v-for="val in [1, 5, 10]" :key="val"
        @click="addReps(val)"
        class="group relative overflow-hidden py-3 px-4 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/30 rounded-xl font-bold transition-all active:scale-95"
      >
        <span class="relative z-10">+{{ val }}</span>
        <div class="absolute inset-0 bg-gradient-to-tr from-primary-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </div>

    <div class="relative mt-2">
      <input 
        v-model.number="customReps"
        type="number"
        placeholder="Custom amount"
        class="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 pr-20 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
      />
      <button 
        @click="addReps(customReps)"
        :disabled="!customReps"
        class="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary-600/20"
      >
        {{ i18n.t('btn_add') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { PlusCircle } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';

const i18n = useI18nStore();
const emit = defineEmits(['updated']);
const customReps = ref(null);

const addReps = async (count) => {
  if (!count) return;
  try {
    await axios.post('/api/reps', {
      count,
      date: new Date().toISOString().split('T')[0]
    });
    if (customReps.value === count) customReps.value = null;
    emit('updated');
  } catch (error) {
    console.error('Error logging reps:', error);
  }
};
</script>

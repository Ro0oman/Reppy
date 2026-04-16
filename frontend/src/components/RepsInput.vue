<template>
  <div class="card-stats p-8 relative overflow-hidden group transition-all duration-500 border-border hover:border-primary-500/30">
    <!-- Background Industrial Detail -->
    <div class="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors"></div>
    
    <div class="flex items-center justify-between relative z-10 mb-10">
      <div class="flex items-center gap-5">
        <div class="p-3.5 bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/20">
          <Zap class="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 class="text-2xl font-bold tracking-tight text-foreground">{{ activeLabel }}</h3>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <p class="text-[11px] font-bold text-muted/60 tracking-tight">Protocolo {{ exerciseType.replace('_', ' ') }} activo</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Add Grid -->
    <div class="grid grid-cols-3 gap-3 relative z-10 mb-10">
      <button 
        v-for="val in [1, 5, 10]" :key="val"
        @click="addReps(val)"
        :disabled="loading"
        class="group relative overflow-hidden py-7 px-4 bg-surface border border-border rounded-2xl transition-all hover:border-primary-500/50 hover:bg-primary-500/[0.03] shadow-sm active:scale-95 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
      >
        <span class="relative z-10 text-2xl font-bold transition-colors text-foreground">+{{ val }}</span>
        <div class="absolute inset-0 bg-primary-500 opacity-0 group-hover:opacity-[0.02] transition-opacity"></div>
      </button>
    </div>

    <!-- Custom Input Area -->
    <div class="space-y-6 relative z-10">
      <div class="relative group/input">
        <label class="text-[11px] font-bold text-muted/60 mb-2 block px-1 tracking-tight">Entrada manual</label>
        <div class="flex gap-4">
          <div class="relative flex-1">
            <input 
              v-model.number="customReps"
              type="number"
              placeholder="00"
              class="w-full bg-surface border border-border rounded-2xl px-6 py-4 text-foreground font-bold focus:outline-none focus:border-primary-500/50 transition-all text-xl shadow-sm"
            />
          </div>
          <button 
            @click="addReps(customReps)"
            :disabled="!customReps || loading"
            class="btn-reppy !px-10 !py-4 disabled:opacity-20 disabled:grayscale disabled:scale-100"
          >
            {{ i18n.t('btn_add') }}
          </button>
        </div>
      </div>

      <!-- Added Weight Input (Conditional) -->
      <div v-if="exerciseType === 'weighted_pullups'" class="animate-in fade-in slide-in-from-top-4 duration-500">
        <label class="text-[11px] font-bold text-accent mb-2 block px-1 tracking-tight">Carga adicional (Kg)</label>
        <div class="relative group/weight">
          <input 
            v-model.number="addedWeight"
            type="number"
            placeholder="0.0"
            class="w-full bg-surface border border-border rounded-2xl px-6 py-4 text-foreground font-bold focus:outline-none focus:border-accent/30 transition-all text-lg shadow-sm"
          />
          <div class="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted/40 tracking-widest pointer-events-none">KG</div>
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
import { useDamageStore } from '../stores/damage';
import { useAuthStore } from '../stores/auth';
import { getLocalDateString } from '../utils/dateUtils.js';

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
  return i18n.t(props.exerciseType);
});

const loading = ref(false);

const addReps = async (count) => {
  if (!count || loading.value) return;
  loading.value = true;
  try {
    const today = getLocalDateString();
    const res = await axios.post('/api/reps', {
      count,
      date: today,
      exercise_type: props.exerciseType,
      added_weight: addedWeight.value || 0
    });
    
    let msg = `+${count} logged`;
    notificationStore.notify(msg, 'success');
    
    // Trigger JRPG damage animation if boss damage was dealt
    if (res.data.boss_damage_dealt > 0) {
      console.log('[DEBUG_DAMAGE] RepsInput: Calling addDamage', { amount: res.data.boss_damage_dealt, type: props.exerciseType });
      const damageStore = useDamageStore();
      damageStore.addDamage(res.data.boss_damage_dealt, props.exerciseType);
    }
    
    // Refresh global user state to sync header level/XP
    const authStore = useAuthStore();
    await authStore.fetchProfile();
    
    if (customReps.value === count) customReps.value = null;
    emit('updated');
  } catch (error) {
    console.error('Error logging reps:', error);
    notificationStore.notify('Failed to log reps', 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
</style>

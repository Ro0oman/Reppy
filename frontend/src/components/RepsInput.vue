<template>
  <div class="relative overflow-hidden group transition-all duration-500">
    <!-- Hero Action Card -->
    <div class="bg-surface/10 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden transition-all hover:bg-surface/20">
      <!-- Decorative BG elements -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary-500/10 transition-all duration-700"></div>
      
      <div class="relative z-10 flex flex-col gap-10">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <h3 class="text-xs font-black uppercase tracking-[0.2em] text-muted/40 mb-1">{{ activeLabel }}</h3>
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              <p class="text-[10px] font-bold text-muted/60 tracking-tight uppercase">{{ i18n.t('rep_protocol_active', { type: activeLabel }) }}</p>
            </div>
          </div>
          <div class="p-3 bg-primary-500/10 rounded-xl border border-primary-500/20">
            <Zap class="w-4 h-4 text-primary-500" />
          </div>
        </div>
        
        <!-- Quick Add Section -->
        <div class="grid grid-cols-3 gap-4">
          <button 
            v-for="val in [1, 5, 10]" :key="val"
            @click="addReps(val)"
            :disabled="loading"
            class="group relative py-6 bg-white/[0.02] border border-white/5 rounded-2xl transition-all hover:border-primary-500/30 hover:bg-primary-500/[0.05] active:scale-95 disabled:opacity-20"
          >
            <span class="text-2xl font-black italic tracking-tighter text-foreground group-hover:text-primary-400 transition-colors">+{{ val }}</span>
          </button>
        </div>

        <!-- Manual Input Section -->
        <div class="space-y-4">
          <div class="flex gap-3">
            <div class="relative flex-1 group/input">
              <input 
                v-model.number="customReps"
                type="number"
                :placeholder="i18n.locale === 'es' ? 'Personalizado' : 'Custom'"
                class="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 text-foreground font-bold focus:outline-none focus:border-primary-500/30 transition-all text-lg placeholder:text-muted/20"
              />
              <div v-if="exerciseType === 'weighted_pullups'" class="absolute right-6 top-1/2 -translate-y-1/2">
                <span class="text-[9px] font-black text-accent tracking-widest">+WEIGHT</span>
              </div>
            </div>
            <button 
              @click="addReps(customReps)"
              :disabled="!customReps || loading"
              class="w-20 sm:w-24 bg-primary-500 hover:bg-primary-400 text-white rounded-2xl transition-all active:scale-95 flex items-center justify-center disabled:opacity-20 disabled:grayscale"
            >
              <Check v-if="!loading" class="w-6 h-6" />
              <div v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </button>
          </div>

          <!-- Weight Input (Expanded only when needed) -->
          <transition 
            enter-active-class="transition duration-300 ease-out" 
            enter-from-class="transform -translate-y-2 opacity-0" 
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-2 opacity-0"
          >
            <div v-if="exerciseType === 'weighted_pullups'" class="relative">
              <input 
                v-model.number="addedWeight"
                type="number"
                placeholder="0.0"
                class="w-full bg-accent/5 border border-accent/10 rounded-xl px-4 py-3 text-accent font-bold focus:outline-none focus:border-accent/30 transition-all text-sm"
              />
              <div class="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-accent/40 tracking-widest">KG</div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { Zap, Check } from 'lucide-vue-next';
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
  
  // Use a more robust audio source from a high-uptime CDN (Mixkit preview)
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audio.volume = 0.3;
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.warn('[AUDIO_BLOCKED] Interaction required or playback error:', e.name);
      });
    }
  } catch (e) {
    console.warn('[AUDIO_INIT_ERROR] Sound initialization failed', e);
  }

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

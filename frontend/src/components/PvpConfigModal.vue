<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-background/90 backdrop-blur-md" @click="$emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
      
      <!-- Header -->
      <div class="px-8 py-6 border-b border-white/5 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
            <Swords class="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h2 class="text-xl font-black text-white italic uppercase tracking-tighter">{{ i18n.t('pvp_config_title') || 'BATTLE_CONFIG_SYSTEM' }}</h2>
            <p class="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mt-1">{{ i18n.t('ui_pvp_config') }} vs {{ target?.user_name || target?.name || 'Operative' }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-white/5 rounded-xl transition-all">
          <X class="w-5 h-5 text-muted" />
        </button>
      </div>

      <!-- Config Form -->
      <div class="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        <!-- Battlefield Preview -->
        <div class="relative w-full h-40 rounded-[2rem] overflow-hidden border border-white/10 group">
           <img 
             :src="currentBgUrl" 
             class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
             @error="(e) => e.target.src = '/images/pvp/default.webp'"
           />
           <div class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
           <div class="absolute bottom-4 left-6">
              <span class="text-[8px] font-black text-primary-500 uppercase tracking-[0.4em] block mb-1">FIELD_PREVIEW</span>
              <span class="text-xs font-black text-white uppercase italic tracking-widest">{{ form.customBattlefield ? 'CUSTOM_ARENA' : form.battlefield }}</span>
           </div>
        </div>

        <!-- Battlefield Selector -->
        <div class="space-y-4">
          <label class="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">{{ i18n.t('pvp_select_battlefield') }}</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
             <button 
               v-for="bg in battlefields" 
               :key="bg"
               @click="form.battlefield = bg; form.customBattlefield = ''"
               class="p-4 rounded-2xl border transition-all text-center group relative overflow-hidden"
               :class="form.battlefield === bg && !form.customBattlefield ? 'bg-primary-500 border-primary-500 shadow-lg shadow-primary-500/20' : 'bg-white/5 border-white/5 hover:border-white/20'"
             >
               <span class="text-[10px] font-black uppercase italic relative z-10" :class="form.battlefield === bg && !form.customBattlefield ? 'text-white' : 'text-muted group-hover:text-white'">{{ bg }}</span>
               <div v-if="form.battlefield === bg && !form.customBattlefield" class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
             </button>
             <!-- Custom Battlefield -->
             <button 
               @click="form.customBattlefield = form.customBattlefield || 'https://'; form.battlefield = ''"
               class="p-4 rounded-2xl border transition-all text-center group relative overflow-hidden"
               :class="form.customBattlefield ? 'bg-primary-500 border-primary-500 shadow-lg shadow-primary-500/20' : 'bg-white/5 border-white/5 hover:border-white/20'"
             >
               <span class="text-[10px] font-black uppercase italic relative z-10" :class="form.customBattlefield ? 'text-white' : 'text-muted group-hover:text-white'">{{ i18n.t('pvp_custom_bg') }}</span>
             </button>
          </div>
          
          <!-- Custom BG Input -->
          <Transition name="slide-down">
            <div v-if="form.customBattlefield !== undefined && (form.customBattlefield || form.battlefield === '')" class="mt-4 animate-in slide-in-from-top-2 duration-300">
               <input 
                 v-model="form.customBattlefield" 
                 type="text" 
                 placeholder="https://example.com/image.jpg"
                 class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white font-mono outline-none focus:border-primary-500/50 transition-all"
               />
               <p class="text-[9px] text-muted mt-2 uppercase tracking-widest">{{ i18n.t('pvp_custom_bg_desc') }}</p>
            </div>
          </Transition>
        </div>

        <!-- Combat Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
           <!-- HP -->
           <div class="space-y-4">
              <label class="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">{{ i18n.t('pvp_target_hp') }}</label>
              <div class="flex gap-2">
                 <button v-for="hp in [3000, 5000, 8000]" :key="hp" @click="form.maxHp = hp"
                         class="flex-1 py-3 rounded-xl border text-[10px] font-black transition-all"
                         :class="form.maxHp === hp ? 'bg-white text-black border-white' : 'bg-white/5 text-muted border-white/5 hover:border-white/20'">
                    {{ hp }}
                 </button>
              </div>
           </div>
           <!-- Time -->
           <div class="space-y-4">
              <label class="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">{{ i18n.t('pvp_time_limit') }}</label>
              <div class="grid grid-cols-3 gap-2">
                 <button v-for="t in durations" :key="t.val" @click="form.timeLimit = t.val; form.isCustomTime = false"
                         class="py-3 rounded-xl border text-[10px] font-black transition-all"
                         :class="form.timeLimit === t.val && !form.isCustomTime ? 'bg-white text-black border-white' : 'bg-white/5 text-muted border-white/5 hover:border-white/20'">
                    {{ t.label }}
                 </button>
                 <button @click="form.isCustomTime = true"
                         class="py-3 rounded-xl border text-[10px] font-black transition-all"
                         :class="form.isCustomTime ? 'bg-white text-black border-white' : 'bg-white/5 text-muted border-white/5 hover:border-white/20'">
                    {{ i18n.t('pvp_custom_time') }}
                 </button>
              </div>

              <!-- Custom Time Input -->
              <div v-if="form.isCustomTime" class="mt-4 animate-in slide-in-from-top-2 duration-200">
                <div class="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl px-4 py-2">
                  <input 
                    v-model="form.customTimeMinutes" 
                    type="range" 
                    min="1" 
                    max="30" 
                    class="flex-1 accent-primary-500"
                  />
                  <span class="text-xs font-black text-white w-12 text-center">{{ form.customTimeMinutes }}m</span>
                </div>
              </div>
           </div>
        </div>

        <!-- Exercises -->
        <div class="space-y-4">
          <label class="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">{{ i18n.t('pvp_allowed_exercises') }}</label>
          <div class="flex flex-wrap gap-3">
             <button 
               v-for="ex in ['pullups', 'pushups', 'dips', 'legs']" 
               :key="ex"
               @click="toggleExercise(ex)"
               class="px-6 py-3 rounded-2xl border flex items-center gap-3 transition-all"
               :class="form.allowedExercises.includes(ex) ? 'bg-primary-500/20 border-primary-500 text-primary-500' : 'bg-white/5 border-white/5 text-muted opacity-50'"
             >
               <component :is="getExIcon(ex)" class="w-4 h-4" />
               <span class="text-[10px] font-black uppercase italic">{{ i18n.t(ex) }}</span>
             </button>
          </div>
          <p v-if="form.allowedExercises.length === 0" class="text-[9px] text-red-500 font-bold uppercase tracking-widest animate-pulse">Minimun 1 exercise required</p>
        </div>

        <!-- AntiCheat -->
        <div class="p-6 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-between">
           <div class="flex items-center gap-4">
              <div class="p-2 bg-amber-500/10 rounded-lg">
                 <ShieldCheck class="w-5 h-5 text-amber-500" />
              </div>
              <div>
                 <p class="text-xs font-black text-white uppercase italic tracking-tighter">{{ i18n.t('pvp_anticheat') }}</p>
                 <p class="text-[9px] text-muted font-bold uppercase opacity-60">{{ i18n.t('pvp_anticheat_desc') }}</p>
              </div>
           </div>
           <button 
             @click="form.anticheatEnabled = !form.anticheatEnabled"
             class="w-12 h-6 rounded-full relative transition-all"
             :class="form.anticheatEnabled ? 'bg-primary-500' : 'bg-white/10'"
           >
             <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" :class="form.anticheatEnabled ? 'right-1' : 'left-1'"></div>
           </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-8 bg-black/40 border-t border-white/5">
        <button 
          @click="initChallenge" 
          :disabled="loading || form.allowedExercises.length === 0"
          class="w-full py-5 bg-primary-500 hover:bg-primary-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          <span v-if="!loading">{{ i18n.t('pvp_init_battle') }}</span>
          <Loader2 v-else class="w-5 h-5 animate-spin mx-auto" />
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { X, Swords, ShieldCheck, Loader2, ArrowBigUp, Shield, Footprints, Image as ImageIcon } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notification';

const props = defineProps({
  show: Boolean,
  target: Object
});

const emit = defineEmits(['close']);
const i18n = useI18nStore();
const router = useRouter();
const notificationStore = useNotificationStore();

const loading = ref(false);
const battlefields = ['Default Reppy', 'Dark Arena', 'Neon Gym', 'Forest Temple', 'Steel Dungeon'];
const presetImages = {
  'Default Reppy': '/images/pvp/default.webp',
  'Dark Arena': '/images/pvp/dark_arena.webp',
  'Neon Gym': '/images/pvp/neon_gym.webp',
  'Forest Temple': '/images/pvp/forest_temple.webp',
  'Steel Dungeon': '/images/pvp/steel_dungeon.webp'
};
const durations = [
  { val: 60, label: '1 min' },
  { val: 300, label: '5 min' },
  { val: 600, label: '10 min' },
  { val: 1800, label: '30 min' },
];

const form = reactive({
  maxHp: 5000,
  timeLimit: 60,
  customTimeMinutes: 1,
  isCustomTime: false,
  battlefield: 'Default Reppy',
  customBattlefield: '',
  allowedExercises: ['pullups', 'pushups'],
  anticheatEnabled: true
});

const currentBgUrl = computed(() => {
  if (form.customBattlefield && form.customBattlefield.startsWith('http')) {
    return form.customBattlefield;
  }
  return presetImages[form.battlefield] || presetImages['Default Reppy'];
});

const toggleExercise = (ex) => {
  const idx = form.allowedExercises.indexOf(ex);
  if (idx > -1) form.allowedExercises.splice(idx, 1);
  else form.allowedExercises.push(ex);
};

const getExIcon = (ex) => {
  if (ex === 'pullups') return ArrowBigUp;
  if (ex === 'pushups') return Shield;
  if (ex === 'dips') return Footprints;
  return Swords;
};

const initChallenge = async () => {
  loading.value = true;
  try {
    const finalTimeLimit = form.isCustomTime ? form.customTimeMinutes * 60 : form.timeLimit;
    const finalBattlefield = form.customBattlefield || form.battlefield;

    const res = await axios.post('/api/pvp/challenge', {
      challengedId: props.target.user_id || props.target.id,
      ...form,
      timeLimit: finalTimeLimit,
      battlefield: finalBattlefield
    });
    notificationStore.notify(i18n.t('pvp_challenge_sent'), 'success');
    emit('close');
    router.push({ name: 'pvp', params: { id: res.data.id } });
  } catch (e) {
    notificationStore.notify(i18n.t('pvp_error_init'), 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>

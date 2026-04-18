<template>
  <Teleport to="body">
    <div v-if="show" 
         class="fixed inset-0 z-[100] flex justify-center items-start overflow-y-auto p-4 sm:p-6 md:p-8 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500"
         @click.self="emit('close')">
      
      <!-- Main Container -->
      <div class="w-full max-w-4xl bg-surface/30 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px] animate-in slide-in-from-bottom-8 duration-700 select-none my-auto">
        
        <!-- Ambient Background Glow -->
        <div class="absolute inset-0 pointer-events-none transition-colors duration-1000 opacity-20" :class="activeDesc.bgAccent"></div>

        <!-- Left Sidebar: Tab Navigation -->
        <div class="md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-black/40 p-6 flex flex-col z-10 shrink-0">
          <div class="mb-8 hidden md:block">
            <h3 class="text-3xl font-black text-industrial text-foreground uppercase italic leading-none">{{ i18nStore.t('codex_title') }}<span class="text-primary-500">.</span></h3>
            <p class="text-[9px] font-black text-muted uppercase tracking-[0.3em] mt-2">{{ i18nStore.t('codex_subtitle') }}</p>
          </div>

          <!-- Mobile Header (Visible only on top) -->
          <div class="flex items-center justify-between md:hidden mb-6">
            <div>
              <h3 class="text-2xl font-black text-industrial text-foreground uppercase italic leading-none">{{ i18nStore.t('codex_title') }}<span class="text-primary-500">.</span></h3>
            </div>
            <button @click="emit('close')" class="p-2 bg-white/5 rounded-xl text-white/50 hover:text-white">
              <XIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar flex-1">
            <button v-for="desc in attributeDescriptions" :key="desc.key" 
                    @click="activeTab = desc.key"
                    class="relative flex-1 md:w-full text-center md:text-left p-3 md:p-4 rounded-[1.5rem] md:rounded-2xl flex items-center justify-center md:justify-start gap-4 transition-all duration-500 overflow-hidden group shrink-0 shadow-lg"
                    :class="activeTab === desc.key ? desc.bgActive + ' border ' + desc.borderActive : 'bg-white/5 border border-transparent hover:bg-white/10'">
              
              <div class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-white"></div>
              
              <div class="p-3 md:p-2 rounded-[1.2rem] md:rounded-xl transition-all duration-500 shadow-inner bg-black/50" :class="activeTab === desc.key ? desc.buttonIconBg : 'grayscale opacity-50'">
                <component :is="desc.icon" class="w-6 h-6 md:w-5 md:h-5" :class="activeTab === desc.key ? desc.iconColor : 'text-white'" />
              </div>
              
              <div class="hidden md:flex flex-col">
                <span class="font-black text-xs uppercase tracking-widest transition-colors duration-300" :class="activeTab === desc.key ? 'text-white' : 'text-white/50'">{{ i18nStore.t('codex_' + desc.key.toLowerCase() + '_name') }}</span>
                <span class="text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 mt-0.5" :class="activeTab === desc.key ? desc.iconColor : 'text-white/30'">{{ desc.key }}</span>
              </div>
            </button>
          </div>
          
          <!-- Desktop Close Button -->
          <button @click="emit('close')" class="hidden md:flex items-center gap-3 mt-auto p-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all font-black uppercase text-[10px] tracking-widest uppercase">
            <XIcon class="w-4 h-4" />
            Cerrar Protocolo
          </button>
        </div>

        <!-- Right Content Area: Active Stat Details -->
        <div class="flex-1 relative flex flex-col justify-center p-6 sm:p-8 md:p-16 overflow-hidden z-20 pb-32 md:pb-16">
          
          <!-- Huge Background Decorative Icon -->
          <Transition name="fade-scale" mode="out-in">
            <component 
              :is="activeDesc.icon" 
              :key="activeTab"
              class="absolute -right-10 -bottom-10 w-[400px] h-[400px] opacity-[0.03] transition-all duration-1000 blur-sm pointer-events-none" 
              :class="activeDesc.iconColor" 
            />
          </Transition>

          <Transition name="slide-up" mode="out-in">
            <div :key="activeTab" class="relative z-10 max-w-xl">
              <!-- Header -->
              <div class="mb-6 md:mb-8">
                <h4 class="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none drop-shadow-2xl" :class="activeDesc.iconColor">
                  {{ i18nStore.t('codex_' + activeDesc.key.toLowerCase() + '_name') }}
                </h4>
              </div>

              <!-- Content Group -->
              <div class="space-y-6 md:space-y-8">


                <!-- Action/Improvement Module -->
                <div class="mt-12 p-6 md:p-8 rounded-[2rem] bg-black/40 border shadow-2xl relative overflow-hidden group mb-24 md:mb-0" :class="activeDesc.borderActive">
                  <div class="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-700" :class="activeDesc.gradient"></div>
                  
                  <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div class="flex items-center gap-2 mb-2">
                        <component :is="activeDesc.icon" class="w-4 h-4" :class="activeDesc.iconColor" />
                        <span class="text-[9px] font-black uppercase tracking-[0.3em]" :class="activeDesc.iconColor">{{ i18nStore.t('codex_lv_up') }}</span>
                      </div>
                      <p class="text-lg md:text-xl font-black text-white uppercase tracking-tight leading-tight">
                        {{ i18nStore.t('codex_' + activeDesc.key.toLowerCase() + '_action') }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>

        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18nStore } from '../stores/i18n';
import { 
  X as XIcon, Sword, Zap, Heart, Shield, 
  Dumbbell, Activity, Brain, Church 
} from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
const i18nStore = useI18nStore();

const activeTab = ref('STR');

const attributeDescriptions = [
  { 
    key: 'STR', 
    icon: Dumbbell, 
    iconColor: 'text-orange-500', 
    bgActive: 'bg-orange-500/10',
    borderActive: 'border-orange-500/30',
    borderLeft: 'border-orange-500',
    bgAccent: 'bg-orange-500',
    buttonIconBg: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]',
    gradient: 'from-orange-500 to-red-600'
  },
  { 
    key: 'DEX', 
    icon: Sword, 
    iconColor: 'text-cyan-400', 
    bgActive: 'bg-cyan-400/10',
    borderActive: 'border-cyan-400/30',
    borderLeft: 'border-cyan-400',
    bgAccent: 'bg-cyan-400',
    buttonIconBg: 'shadow-[0_0_15px_rgba(34,211,238,0.4)]',
    gradient: 'from-cyan-400 to-blue-500'
  },
  { 
    key: 'END', 
    icon: Activity, 
    iconColor: 'text-green-400', 
    bgActive: 'bg-green-400/10',
    borderActive: 'border-green-400/30',
    borderLeft: 'border-green-400',
    bgAccent: 'bg-green-400',
    buttonIconBg: 'shadow-[0_0_15px_rgba(74,222,128,0.4)]',
    gradient: 'from-green-400 to-emerald-600'
  },
  { 
    key: 'VIG', 
    icon: Heart, 
    iconColor: 'text-red-500', 
    bgActive: 'bg-red-500/10',
    borderActive: 'border-red-500/30',
    borderLeft: 'border-red-500',
    bgAccent: 'bg-red-500',
    buttonIconBg: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]',
    gradient: 'from-red-500 to-rose-600'
  },
  { 
    key: 'INT', 
    icon: Brain, 
    iconColor: 'text-blue-400', 
    bgActive: 'bg-blue-400/10',
    borderActive: 'border-blue-400/30',
    borderLeft: 'border-blue-400',
    bgAccent: 'bg-blue-400',
    buttonIconBg: 'shadow-[0_0_15px_rgba(96,165,250,0.4)]',
    gradient: 'from-blue-400 to-indigo-600'
  },
  { 
    key: 'FTH', 
    icon: Church, 
    iconColor: 'text-yellow-400', 
    bgActive: 'bg-yellow-400/10',
    borderActive: 'border-yellow-400/30',
    borderLeft: 'border-yellow-400',
    bgAccent: 'bg-yellow-400',
    buttonIconBg: 'shadow-[0_0_15px_rgba(250,204,21,0.4)]',
    gradient: 'from-yellow-400 to-amber-600'
  }
];

const activeDesc = computed(() => attributeDescriptions.find(d => d.key === activeTab.value) || attributeDescriptions[0]);
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.6s ease;
}
.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9) rotate(0deg);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.1) rotate(24deg);
}
</style>

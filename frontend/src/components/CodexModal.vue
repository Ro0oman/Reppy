<template>
  <Teleport to="body">
    <div v-if="show" 
         class="fixed inset-0 z-[100] flex justify-center items-center overflow-hidden p-0 sm:p-6 md:p-8 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500"
         @click.self="emit('close')">
      
      <!-- Main Container -->
      <div class="w-full max-w-5xl bg-surface/30 border border-white/10 sm:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-row h-full sm:h-[650px] animate-in zoom-in-95 duration-500 select-none">
        
        <!-- Ambient Background Glow -->
        <div class="absolute inset-0 pointer-events-none transition-colors duration-1000 opacity-20" :class="activeDesc.bgAccent"></div>

        <!-- Universal Close Button (Floating Top-Right) -->
        <button @click="emit('close')" 
                class="absolute top-4 right-4 z-[110] p-3 rounded-full bg-black/50 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all transform active:scale-95 shadow-2xl backdrop-blur-xl">
          <XIcon class="w-5 h-5" />
        </button>

        <!-- Sidebar: Stat Selection -->
        <div class="w-20 md:w-72 border-r border-white/5 bg-black/40 flex flex-col z-10 shrink-0">
          <div class="p-4 md:p-8 flex items-center justify-center md:justify-start">
            <h3 class="text-[8px] md:text-2xl font-black text-foreground uppercase italic leading-none tracking-tighter truncate">CODEX<span class="text-primary-500 hidden md:inline">_</span>V2</h3>
          </div>

          <!-- Scrollable Tab Sidebar -->
          <div class="flex-1 overflow-y-auto px-2 md:px-6 py-2 md:py-0 custom-scrollbar flex flex-col gap-2 md:pb-8 overflow-x-hidden">
            <button v-for="desc in attributeDescriptions" :key="desc.key" 
                    @click="activeTab = desc.key"
                    class="relative w-full p-2.5 sm:p-4 rounded-2xl flex items-center justify-center md:justify-start gap-4 transition-all duration-300 group shrink-0"
                    :class="activeTab === desc.key ? desc.bgActive + ' border ' + desc.borderActive : 'bg-white/5 border border-transparent hover:bg-white/10'">
              
              <div class="p-2 sm:p-2.5 rounded-xl transition-all duration-300 bg-black/50" :class="activeTab === desc.key ? desc.buttonIconBg : 'grayscale opacity-50'">
                <component :is="desc.icon" class="w-4 h-4 sm:w-5 sm:h-5" :class="activeTab === desc.key ? desc.iconColor : 'text-white'" />
              </div>
              
              <div class="hidden md:flex flex-col text-left">
                <span class="font-black text-[10px] uppercase tracking-[0.2em]" :class="activeTab === desc.key ? 'text-white' : 'text-white/40'">{{ i18nStore.t('codex_' + desc.key.toLowerCase() + '_name') }}</span>
                <span class="text-[8px] font-bold uppercase tracking-widest mt-0.5" :class="activeTab === desc.key ? desc.iconColor : 'text-white/20'">{{ desc.key }}</span>
              </div>
            </button>
          </div>
          
          <!-- Bottom Status (Desktop Only) -->
          <div class="p-8 hidden md:block mt-auto border-t border-white/5">
            <div class="flex items-center gap-3 text-muted/30 text-[8px] font-black uppercase tracking-widest">
              <Activity class="w-3 h-3" />
              SYSTEM CORE STABLE
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 relative flex flex-col p-6 pt-16 sm:p-10 md:p-16 overflow-y-auto custom-scrollbar z-20">
          
          <Transition name="slide-up" mode="out-in">
            <div :key="activeTab" class="relative z-10 w-full space-y-8">
              <!-- Header & Stat Summary -->
              <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div class="space-y-1">
                  <span class="text-[8px] font-black text-muted uppercase tracking-[0.4em]">{{ i18nStore.t('lb_level') }} {{ getStatLevel(activeTab) }}</span>
                  <h4 class="text-3xl sm:text-7xl font-black uppercase tracking-tighter italic leading-none" :class="activeDesc.iconColor">
                    {{ i18nStore.t('codex_' + activeDesc.key.toLowerCase() + '_name') }}
                  </h4>
                </div>
                <div class="flex flex-col items-start sm:items-end">
                   <span class="text-[9px] font-black text-muted uppercase tracking-widest">{{ i18nStore.t('nav_progress') }}</span>
                   <p class="text-xl sm:text-3xl font-black text-foreground tabular-nums tracking-tighter">
                     {{ getStatXP(activeTab) }}<span class="text-muted/40 text-sm"> / {{ getStatXPMax(activeTab) }} XP</span>
                   </p>
                </div>
              </div>

              <!-- XP Bar -->
              <div class="h-3 bg-black/40 rounded-full border border-white/5 p-1 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                     :style="{ width: `${(getStatXP(activeTab) / Math.max(getStatXPMax(activeTab), 1)) * 100}%`, backgroundColor: activeDesc.hex }">
                   <div class="absolute inset-0 bg-white/20 animate-shimmer"></div>
                </div>
              </div>

              <!-- Content Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div class="space-y-4">
                  <p class="hidden sm:block text-[11px] font-black text-primary-500 uppercase tracking-widest italic">{{ i18nStore.t(`codex_${activeDesc.key.toLowerCase()}_quote`) }}</p>
                  <p class="text-xs sm:text-base text-muted/80 leading-relaxed line-clamp-4 sm:line-clamp-none">{{ i18nStore.t(`codex_${activeDesc.key.toLowerCase()}_desc`) }}</p>
                </div>
                
                <!-- Earnings Protocol -->
                <div class="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                   <h5 class="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest border-b border-white/5 pb-2 sm:pb-3">{{ i18nStore.t('codex_earnings_protocol') }}</h5>
                   <div class="space-y-2 sm:space-y-3">
                      <div v-for="earning in getEarnings(activeTab)" :key="earning.label" class="flex justify-between items-center text-[10px] sm:text-[11px]">
                         <span class="text-muted/60 uppercase font-bold text-[9px] sm:text-[11px]">{{ i18nStore.t(earning.label) }}</span>
                         <span class="font-black text-primary-500 tabular-nums">+{{ earning.value }} XP</span>
                      </div>
                   </div>
                </div>
              </div>

              <!-- Action Module -->
              <div class="p-8 sm:p-10 rounded-[3rem] bg-black/40 border shadow-2xl relative overflow-hidden group" :class="activeDesc.borderActive">
                <div class="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-700" :class="activeDesc.gradient"></div>
                
                <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div class="space-y-4 w-full">
                    <div class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" :class="activeDesc.iconColor.replace('text-', 'bg-')"></div>
                      <span class="text-[10px] font-black uppercase tracking-[0.4em]" :class="activeDesc.iconColor">{{ i18nStore.t('codex_lv_up') }}</span>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                      <p class="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-tight max-w-sm italic">
                        {{ i18nStore.t('codex_' + activeDesc.key.toLowerCase() + '_action') }}
                      </p>
                      <button @click="handleAction(activeDesc.key)" 
                              class="px-6 sm:px-10 py-4 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.4)] whitespace-normal text-center leading-tight min-w-[160px]"
                              :class="['bg-gradient-to-r ' + activeDesc.gradient, 'text-white']">
                        {{ i18nStore.t('codex_action_target') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Decorative Large Icon -->
          <component 
            :is="activeDesc.icon" 
            class="absolute -right-32 -bottom-32 w-[500px] h-[500px] opacity-[0.03] blur-sm pointer-events-none -z-10" 
            :class="activeDesc.iconColor" 
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18nStore } from '../stores/i18n';
import { 
  X as XIcon, Sword, Zap, Heart, Shield, 
  Dumbbell, Activity, Brain, Church 
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  initialTab: {
    type: String,
    default: 'STR'
  }
});

const emit = defineEmits(['close']);
const i18nStore = useI18nStore();

const activeTab = ref(props.initialTab);

watch(() => props.initialTab, (newTab) => {
  activeTab.value = newTab;
});

const attributeDescriptions = [
  { 
    key: 'STR', 
    icon: Dumbbell, 
    iconColor: 'text-orange-500', 
    hex: '#f97316',
    bgActive: 'bg-orange-500/10',
    borderActive: 'border-orange-500/30',
    borderLeft: 'border-orange-500',
    bgAccent: 'bg-orange-500',
    buttonIconBg: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]',
    gradient: 'from-orange-500 to-red-600',
    actionRoute: '/?exercise=weighted_pullups',
    earnings: [{ label: 'codex_earn_weighted', value: 15 }, { label: 'codex_earn_standard', value: 5 }]
  },
  { 
    key: 'DEX', 
    icon: Sword, 
    iconColor: 'text-cyan-400', 
    hex: '#22d3ee',
    bgActive: 'bg-cyan-400/10',
    borderActive: 'border-cyan-400/30',
    borderLeft: 'border-cyan-400',
    bgAccent: 'bg-cyan-400',
    buttonIconBg: 'shadow-[0_0_15px_rgba(34,211,238,0.4)]',
    gradient: 'from-cyan-400 to-blue-500',
    actionRoute: '/?exercise=muscleups',
    earnings: [{ label: 'codex_earn_skill', value: 100 }, { label: 'codex_earn_technique', value: 8 }]
  },
  { 
    key: 'END', 
    icon: Activity, 
    iconColor: 'text-green-400', 
    hex: '#4ade80',
    bgActive: 'bg-green-400/10',
    borderActive: 'border-green-400/30',
    borderLeft: 'border-green-400',
    bgAccent: 'bg-green-400',
    buttonIconBg: 'shadow-[0_0_15px_rgba(74,222,128,0.4)]',
    gradient: 'from-green-400 to-emerald-600',
    actionRoute: '/?exercise=pushups',
    earnings: [{ label: 'codex_earn_volume', value: 20 }, { label: 'codex_earn_consistency', value: 10 }]
  },
  { 
    key: 'VIG', 
    icon: Heart, 
    iconColor: 'text-red-500', 
    hex: '#ef4444',
    bgActive: 'bg-red-500/10',
    borderActive: 'border-red-500/30',
    borderLeft: 'border-red-500',
    bgAccent: 'bg-red-500',
    buttonIconBg: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]',
    gradient: 'from-red-500 to-rose-600',
    actionRoute: '/',
    earnings: [{ label: 'codex_earn_login', value: 50 }, { label: 'codex_earn_streak', value: 25 }]
  },
  { 
    key: 'INT', 
    icon: Brain, 
    iconColor: 'text-blue-400', 
    hex: '#60a5fa',
    bgActive: 'bg-blue-400/10',
    borderActive: 'border-blue-400/30',
    borderLeft: 'border-blue-400',
    bgAccent: 'bg-blue-400',
    buttonIconBg: 'shadow-[0_0_15px_rgba(96,165,250,0.4)]',
    gradient: 'from-blue-400 to-indigo-600',
    actionRoute: '/blog',
    earnings: [{ label: 'codex_earn_knowledge', value: 100 }, { label: 'codex_earn_analysis', value: 50 }]
  },
  { 
    key: 'FTH', 
    icon: Church, 
    iconColor: 'text-yellow-400', 
    hex: '#facc15',
    bgActive: 'bg-yellow-400/10',
    borderActive: 'border-yellow-400/30',
    borderLeft: 'border-yellow-400',
    bgAccent: 'bg-yellow-400',
    buttonIconBg: 'shadow-[0_0_15px_rgba(250,204,21,0.4)]',
    gradient: 'from-yellow-400 to-amber-600',
    actionRoute: '/',
    earnings: [{ label: 'codex_earn_raid', value: 200 }, { label: 'codex_earn_contribution', value: 30 }]
  },
  { 
    key: 'CHA', 
    icon: Heart, 
    iconColor: 'text-pink-400', 
    hex: '#f472b6',
    bgActive: 'bg-pink-400/10',
    borderActive: 'border-pink-400/30',
    borderLeft: 'border-pink-400',
    bgAccent: 'bg-pink-400',
    buttonIconBg: 'shadow-[0_0_15px_rgba(244,114,182,0.4)]',
    gradient: 'from-pink-400 to-fuchsia-600',
    actionRoute: '/social',
    earnings: [{ label: 'codex_earn_social', value: 10 }, { label: 'codex_earn_cheer', value: 5 }]
  }
];

const activeDesc = computed(() => attributeDescriptions.find(d => d.key === activeTab.value) || attributeDescriptions[0]);

const getStatLevel = (key) => authStore.user?.[`${key.toLowerCase()}_lvl`] || 1;
const getStatXP = (key) => authStore.user?.[`${key.toLowerCase()}_xp_into_level`] || 0;
const getStatXPMax = (key) => authStore.user?.[`${key.toLowerCase()}_xp_for_next_level`] || 100;
const getEarnings = (key) => {
  const desc = attributeDescriptions.find(d => d.key === key);
  return desc?.earnings || [];
};

const handleAction = (key) => {
  const desc = attributeDescriptions.find(d => d.key === key);
  if (desc?.actionRoute) {
    emit('close');
    router.push(desc.actionRoute);
  }
};
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

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(249, 115, 22, 0.3);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(249, 115, 22, 0.5);
}
</style>

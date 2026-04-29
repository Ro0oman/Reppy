<template>
  <Transition name="fade">
    <div v-if="show" 
         class="fixed inset-0 z-[100] flex justify-center items-start overflow-y-auto p-4 md:p-8"
         role="dialog"
         aria-modal="true"
    >
      <!-- Backdrop -->
      <button class="fixed inset-0 bg-background/80 backdrop-blur-xl cursor-default outline-none" 
              aria-hidden="true" 
              tabindex="-1"
              @click="close"></button>

      <!-- Content Card -->
      <div class="relative max-w-2xl w-full bg-surface/40 backdrop-blur-3xl border border-border rounded-[2.5rem] shadow-[0_0_100px_rgba(255,69,0,0.1)] p-6 md:p-12 overflow-y-auto max-h-[90vh] animate-in my-auto no-scrollbar">
        
        <!-- Decorative Background Element -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <!-- Header -->
        <div class="relative z-10 space-y-2 mb-6 md:mb-10">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 md:w-8 md:h-8 bg-primary-500 rounded-lg flex items-center justify-center font-black italic text-white shadow-lg shadow-primary-500/20 text-sm md:text-base">R</div>
            <h2 class="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tighter italic font-industrial">
              {{ i18n.t('onboarding_title') }}<span class="text-primary-500">.</span>
            </h2>
          </div>
          <p class="text-[9px] md:text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18n.t('onboarding_subtitle') }}</p>
        </div>

        <!-- Slides Container -->
        <div class="relative min-h-[300px] flex flex-col justify-center">
          <Transition name="slide" mode="out-in">
            <div :key="currentStep" class="space-y-8 py-4">
              
              <!-- Slide 1: Mission -->
              <div v-if="currentStep === 0" class="space-y-4 md:space-y-6">
                <div class="flex items-center gap-4 md:gap-6">
                  <div class="p-4 md:p-5 bg-primary-500/10 rounded-2xl md:rounded-3xl border border-primary-500/20">
                    <Zap class="w-8 h-8 md:w-10 md:h-10 text-primary-500" />
                  </div>
                  <div class="space-y-1">
                    <h3 class="text-lg md:text-xl font-black text-foreground uppercase tracking-widest">{{ i18n.t('onboarding_mission_title') }}</h3>
                    <div class="h-1 w-10 md:w-12 bg-primary-500 rounded-full"></div>
                  </div>
                </div>
                <p class="text-base md:text-lg font-medium text-muted leading-relaxed font-tight">
                  {{ i18n.t('onboarding_mission_desc') }}
                </p>
              </div>

              <!-- Slide 2: Damage -->
              <div v-if="currentStep === 1" class="space-y-4 md:space-y-6">
                <div class="flex items-center gap-4 md:gap-6">
                  <div class="p-4 md:p-5 bg-red-500/10 rounded-2xl md:rounded-3xl border border-red-500/20">
                    <Flame class="w-8 h-8 md:w-10 md:h-10 text-red-500" />
                  </div>
                  <div class="space-y-1">
                    <h3 class="text-lg md:text-xl font-black text-foreground uppercase tracking-widest">{{ i18n.t('onboarding_damage_title') }}</h3>
                    <div class="h-1 w-10 md:w-12 bg-red-500 rounded-full"></div>
                  </div>
                </div>
                <p class="text-base md:text-lg font-medium text-muted leading-relaxed font-tight">
                  {{ i18n.t('onboarding_damage_desc') }}
                </p>
                <!-- Damage Formula Preview -->
                <div class="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex flex-col items-center gap-4">
                   <div class="flex items-center gap-4 text-sm font-black italic">
                      <div class="flex flex-col items-center">
                        <span class="text-foreground">REPS</span>
                      </div>
                      <span class="text-red-500">×</span>
                      <div class="flex flex-col items-center">
                        <span class="text-foreground">STR LVL</span>
                      </div>
                      <span class="text-red-500">=</span>
                      <div class="flex flex-col items-center">
                        <span class="text-red-500">{{ i18n.t('welcome_damage') }}</span>
                      </div>
                   </div>
                   <p class="text-[9px] font-black text-muted uppercase tracking-widest">{{ i18n.t('welcome_bonus') }}</p>
                </div>
              </div>

              <!-- Slide 3: Rewards -->
              <div v-if="currentStep === 2" class="space-y-4 md:space-y-6">
                <div class="flex items-center gap-4 md:gap-6">
                  <div class="p-4 md:p-5 bg-amber-500/10 rounded-2xl md:rounded-3xl border border-amber-500/20">
                    <ShoppingBag class="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
                  </div>
                  <div class="space-y-1">
                    <h3 class="text-lg md:text-xl font-black text-foreground uppercase tracking-widest">{{ i18n.t('onboarding_rewards_title') }}</h3>
                    <div class="h-1 w-10 md:w-12 bg-amber-500 rounded-full"></div>
                  </div>
                </div>
                <p class="text-base md:text-lg font-medium text-muted leading-relaxed font-tight">
                  {{ i18n.t('onboarding_rewards_desc') }}
                </p>
              </div>

              <!-- Slide 4: Social -->
              <div v-if="currentStep === 3" class="space-y-4 md:space-y-6">
                <div class="flex items-center gap-4 md:gap-6">
                  <div class="p-4 md:p-5 bg-indigo-500/10 rounded-2xl md:rounded-3xl border border-indigo-500/20">
                    <MessageSquare class="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />
                  </div>
                  <div class="space-y-1">
                    <h3 class="text-lg md:text-xl font-black text-foreground uppercase tracking-widest">{{ i18n.t('onboarding_social_title') }}</h3>
                    <div class="h-1 w-10 md:w-12 bg-indigo-500 rounded-full"></div>
                  </div>
                </div>
                <p class="text-base md:text-lg font-medium text-muted leading-relaxed font-tight">
                  {{ i18n.t('onboarding_social_desc') }}
                </p>
              </div>

            </div>
          </Transition>
        </div>

        <!-- Footer / Controls -->
        <div class="relative z-10 mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
          <!-- Stepper Dots -->
          <div class="flex items-center gap-2">
            <div v-for="i in 4" :key="i" 
              class="h-1.5 transition-all duration-300 rounded-full"
              :class="currentStep === i-1 ? 'w-8 bg-primary-500' : 'w-1.5 bg-border'">
            </div>
          </div>
 
          <!-- Buttons -->
          <div class="flex items-center gap-3 md:gap-4 w-full md:w-auto">
             <button v-if="currentStep > 0" @click="currentStep--" 
               class="flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl md:rounded-2xl border border-border text-[10px] md:text-xs font-black uppercase tracking-widest text-muted hover:text-foreground transition-all">
               {{ i18n.t('onboarding_btn_back') }}
             </button>
             
             <button @click="next" 
               class="flex-1 md:flex-none px-6 md:px-8 py-3.5 md:py-4 bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs rounded-xl md:rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2 md:gap-3">
               <span>{{ currentStep < 3 ? i18n.t('onboarding_btn_next') : i18n.t('onboarding_btn_finish') }}</span>
               <ArrowRight class="w-4 h-4" />
             </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onBeforeUnmount, watch } from 'vue';
import { Zap, Flame, ShoppingBag, MessageSquare, ArrowRight, X as XIcon } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import axios from 'axios';

const i18n = useI18nStore();
const currentStep = ref(0);

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);

const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.show) {
    close();
  }
};

watch(() => props.show, (visible) => {
  if (visible) {
    window.addEventListener('keydown', handleKeydown);
  } else {
    window.removeEventListener('keydown', handleKeydown);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const next = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  } else {
    close();
  }
};

const close = async () => {
    try {
        await axios.patch('/api/users/seen-easter-modal');
        emit('close');
    } catch (err) {
        console.error("Error closing modal", err);
        emit('close');
    }
};
</script>

<style scoped>
.font-industrial { font-family: 'Inter Tight', sans-serif; }
.font-tight { font-family: 'Inter Tight', sans-serif; }

.animate-in {
  animation: modalEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalEnter {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: all 0.4s ease; }
.slide-enter-from { opacity: 0; transform: translateX(20px); }
.slide-leave-to { opacity: 0; transform: translateX(-20px); }
</style>

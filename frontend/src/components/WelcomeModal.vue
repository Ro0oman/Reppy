<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-background/80 backdrop-blur-xl" @click="close"></div>

      <!-- Content Card -->
      <div class="relative max-w-2xl w-full bg-surface/40 backdrop-blur-3xl border border-border rounded-[2.5rem] shadow-[0_0_100px_rgba(255,69,0,0.1)] p-8 md:p-12 overflow-hidden animate-in">
        
        <!-- Decorative Background Element -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <!-- Header -->
        <div class="relative z-10 space-y-2 mb-10">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center font-black italic text-white shadow-lg shadow-primary-500/20">R</div>
            <h2 class="text-3xl font-black text-foreground uppercase tracking-tighter italic font-industrial">
              {{ i18n.t('onboarding_title') }}<span class="text-primary-500">.</span>
            </h2>
          </div>
          <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18n.t('onboarding_subtitle') }}</p>
        </div>

        <!-- Slides Container -->
        <div class="relative min-h-[300px] flex flex-col justify-center">
          <Transition name="slide" mode="out-in">
            <div :key="currentStep" class="space-y-8 py-4">
              
              <!-- Slide 1: Mission -->
              <div v-if="currentStep === 0" class="space-y-6">
                <div class="flex items-center gap-6">
                  <div class="p-5 bg-primary-500/10 rounded-3xl border border-primary-500/20">
                    <Zap class="w-10 h-10 text-primary-500" />
                  </div>
                  <div class="space-y-1">
                    <h3 class="text-xl font-black text-foreground uppercase tracking-widest">{{ i18n.t('onboarding_mission_title') }}</h3>
                    <div class="h-1 w-12 bg-primary-500 rounded-full"></div>
                  </div>
                </div>
                <p class="text-lg font-medium text-muted leading-relaxed font-tight">
                  {{ i18n.t('onboarding_mission_desc') }}
                </p>
              </div>

              <!-- Slide 2: Damage -->
              <div v-if="currentStep === 1" class="space-y-6">
                <div class="flex items-center gap-6">
                  <div class="p-5 bg-red-500/10 rounded-3xl border border-red-500/20">
                    <Flame class="w-10 h-10 text-red-500" />
                  </div>
                  <div class="space-y-1">
                    <h3 class="text-xl font-black text-foreground uppercase tracking-widest">{{ i18n.t('onboarding_damage_title') }}</h3>
                    <div class="h-1 w-12 bg-red-500 rounded-full"></div>
                  </div>
                </div>
                <p class="text-lg font-medium text-muted leading-relaxed font-tight">
                  {{ i18n.t('onboarding_damage_desc') }}
                </p>
              </div>

              <!-- Slide 3: Rewards -->
              <div v-if="currentStep === 2" class="space-y-6">
                <div class="flex items-center gap-6">
                  <div class="p-5 bg-amber-500/10 rounded-3xl border border-amber-500/20">
                    <ShoppingBag class="w-10 h-10 text-amber-500" />
                  </div>
                  <div class="space-y-1">
                    <h3 class="text-xl font-black text-foreground uppercase tracking-widest">{{ i18n.t('onboarding_rewards_title') }}</h3>
                    <div class="h-1 w-12 bg-amber-500 rounded-full"></div>
                  </div>
                </div>
                <p class="text-lg font-medium text-muted leading-relaxed font-tight">
                  {{ i18n.t('onboarding_rewards_desc') }}
                </p>
              </div>

            </div>
          </Transition>
        </div>

        <!-- Footer / Controls -->
        <div class="relative z-10 mt-12 flex items-center justify-between">
          <!-- Stepper Dots -->
          <div class="flex items-center gap-2">
            <div v-for="i in 3" :key="i" 
              class="h-1.5 transition-all duration-300 rounded-full"
              :class="currentStep === i-1 ? 'w-8 bg-primary-500' : 'w-1.5 bg-border'">
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex items-center gap-4">
             <button v-if="currentStep > 0" @click="currentStep--" 
               class="px-6 py-3 rounded-2xl border border-border text-xs font-black uppercase tracking-widest text-muted hover:text-foreground transition-all">
               {{ i18n.t('onboarding_btn_back') }}
             </button>
             
             <button @click="next" 
               class="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center gap-3">
               <span>{{ currentStep < 2 ? i18n.t('onboarding_btn_next') : i18n.t('onboarding_btn_finish') }}</span>
               <ArrowRight class="w-4 h-4" />
             </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import { Zap, Flame, ShoppingBag, ArrowRight, X as XIcon } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import axios from 'axios';

const i18n = useI18nStore();
const currentStep = ref(0);

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);

const next = () => {
  if (currentStep.value < 2) {
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

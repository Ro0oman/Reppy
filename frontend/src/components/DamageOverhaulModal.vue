<template>
  <Transition name="fade">
    <div v-if="show" 
         class="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden"
         role="dialog"
         aria-modal="true"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-background/80 backdrop-blur-xl" @click="close"></div>

      <!-- Content Card -->
      <div class="relative max-w-2xl w-full bg-surface/40 backdrop-blur-3xl border border-border rounded-[2.5rem] shadow-[0_0_100px_rgba(255,69,0,0.15)] p-8 md:p-12 overflow-hidden animate-in">
        
        <!-- Decorative Background Element -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <!-- Header -->
        <div class="relative z-10 space-y-2 mb-10 text-center">
          <div class="flex items-center justify-center gap-4 mb-4">
             <Sword class="w-8 h-8 text-primary-500" />
             <h2 class="text-4xl font-black text-foreground uppercase tracking-tighter italic font-industrial">
                {{ i18n.t('battle_overhaul_title') }}<span class="text-primary-500">.</span>
             </h2>
             <Sparkles class="w-8 h-8 text-primary-500" />
          </div>
          <p class="text-[10px] font-black text-neon-lime uppercase tracking-[0.4em]">{{ i18n.t('battle_overhaul_subtitle') }}</p>
        </div>

        <!-- Mechanics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-10">
           <!-- Strength -->
           <div class="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4 hover:border-red-500/30 transition-all group">
              <div class="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                 <Dumbbell class="w-6 h-6" />
              </div>
              <div>
                 <h4 class="text-xs font-black uppercase text-foreground tracking-widest">{{ i18n.t('stat_str') }}</h4>
                 <p class="text-[10px] text-muted leading-relaxed mt-2">{{ i18n.t('battle_overhaul_str_desc') }}</p>
              </div>
           </div>

           <!-- Power -->
           <div class="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4 hover:border-orange-500/30 transition-all group">
              <div class="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                 <Zap class="w-6 h-6" />
              </div>
              <div>
                 <h4 class="text-xs font-black uppercase text-foreground tracking-widest">{{ i18n.t('stat_pwr') }}</h4>
                 <p class="text-[10px] text-muted leading-relaxed mt-2">{{ i18n.t('battle_overhaul_pwr_desc') }}</p>
              </div>
           </div>

           <!-- Agility -->
           <div class="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4 hover:border-blue-500/30 transition-all group">
              <div class="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                 <Target class="w-6 h-6" />
              </div>
              <div>
                 <h4 class="text-xs font-black uppercase text-foreground tracking-widest">{{ i18n.t('stat_agi') }}</h4>
                 <p class="text-[10px] text-muted leading-relaxed mt-2">{{ i18n.t('battle_overhaul_agi_desc') }}</p>
              </div>
           </div>
        </div>

        <!-- Explanation Text -->
        <div class="bg-black/20 border border-white/5 rounded-3xl p-6 relative z-10 space-y-4">
           <div class="flex items-start gap-4">
              <div class="p-2 bg-primary-500/10 rounded-lg text-primary-500">
                 <Info class="w-4 h-4" />
              </div>
              <p class="text-xs text-foreground/80 leading-relaxed italic">
                 "{{ i18n.t('battle_overhaul_summary') }}"
              </p>
           </div>
           <div class="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span class="text-muted">{{ i18n.t('battle_overhaul_boss_hint') }}</span>
              <span class="text-red-500">10X HP INCREASE</span>
           </div>
        </div>

        <!-- Controls -->
        <div class="relative z-10 mt-10 text-center">
           <button @click="close" 
             class="px-12 py-5 bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-[0.3em] text-xs rounded-3xl shadow-2xl shadow-primary-500/30 transition-all active:scale-95">
             {{ i18n.t('battle_overhaul_btn') }}
           </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { Sword, Sparkles, Dumbbell, Zap, Target, Info } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import axios from 'axios';

const i18n = useI18nStore();

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);

const close = async () => {
    try {
        await axios.patch('/api/users/seen-damage-modal');
        emit('close');
    } catch (err) {
        console.error("Error updated modal status", err);
        emit('close');
    }
};
</script>

<style scoped>
.font-industrial { font-family: 'Inter Tight', sans-serif; }

.animate-in {
  animation: modalEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalEnter {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

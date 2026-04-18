<template>
  <Transition name="fade">
    <div v-if="show" 
         class="fixed inset-0 z-[100] flex justify-center items-start overflow-y-auto p-4 md:p-8"
         role="dialog"
         aria-modal="true"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md" @click="close"></div>

      <!-- Content Card -->
      <div class="relative max-w-lg w-full bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(255,69,0,0.3)] p-8 md:p-10 overflow-hidden animate-in my-auto">
        
        <!-- Glow accents -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <!-- Header: Compact -->
        <div class="relative z-10 text-center mb-8">
          <h2 class="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
            {{ i18n.t('battle_overhaul_title') }}<span class="text-primary-500">.</span>
          </h2>
          <p class="text-[9px] font-black text-neon-lime uppercase tracking-[0.3em]">{{ i18n.t('battle_overhaul_subtitle') }}</p>
        </div>

        <!-- Stat Orbs: Small and centered -->
        <div class="flex justify-center gap-6 md:gap-8 mb-10 relative z-10">
           <!-- STR -->
           <div class="flex flex-col items-center gap-2 group">
              <div class="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform shadow-lg shadow-red-500/5">
                 <Dumbbell class="w-7 h-7" />
              </div>
              <span class="text-[10px] font-black uppercase text-zinc-500 tracking-widest group-hover:text-red-500 transition-colors">STR</span>
           </div>

           <!-- PWR -->
           <div class="flex flex-col items-center gap-2 group">
              <div class="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/5">
                 <Zap class="w-7 h-7" />
              </div>
              <span class="text-[10px] font-black uppercase text-zinc-500 tracking-widest group-hover:text-orange-500 transition-colors">PWR</span>
           </div>

           <!-- AGI -->
           <div class="flex flex-col items-center gap-2 group">
              <div class="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/5">
                 <Target class="w-7 h-7" />
              </div>
              <span class="text-[10px] font-black uppercase text-zinc-500 tracking-widest group-hover:text-blue-500 transition-colors">AGI</span>
           </div>
        </div>

        <!-- Visual Formula: More graphic -->
        <div class="bg-black/40 border border-white/5 rounded-3xl p-6 relative z-10 mb-8 flex flex-col items-center gap-4">
           <div class="flex items-center gap-4 text-zinc-500">
              <div class="flex items-center gap-2 bg-zinc-800/50 p-2 rounded-xl text-white">
                 <Dumbbell class="w-4 h-4 text-red-500" />
                 <span class="text-xs font-black italic">+</span>
                 <Zap class="w-4 h-4 text-orange-500" />
                 <span class="text-xs font-black italic">+</span>
                 <Target class="w-4 h-4 text-blue-500" />
              </div>
              <span class="text-xs font-black italic">=</span>
              <div class="p-2 bg-primary-500/20 rounded-xl border border-primary-500/30">
                 <Sword class="w-5 h-5 text-primary-500" />
              </div>
           </div>
           <p class="text-center text-[11px] text-zinc-400 font-medium leading-relaxed max-w-[240px] italic">
             "{{ i18n.t('battle_overhaul_summary') }}"
           </p>
        </div>

        <!-- Alert badge -->
        <div class="flex justify-center mb-10 relative z-10">
           <div class="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-500/20 rounded-full">
              <div class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              <span class="text-[9px] font-black text-red-500 uppercase tracking-widest">{{ i18n.t('battle_overhaul_boss_alert') }}</span>
           </div>
        </div>

        <!-- Smaller Button -->
        <div class="relative z-10 text-center">
           <button @click="close" 
             class="group relative inline-flex items-center justify-center px-10 py-4 bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95">
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

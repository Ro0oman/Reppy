<template>
  <Transition name="fade">
    <div v-if="show" 
         class="fixed inset-0 z-[100] flex justify-center items-center overflow-y-auto p-4 md:p-8"
         role="dialog"
         aria-modal="true"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md" @click="close"></div>

      <!-- Content Card -->
      <div class="relative max-w-2xl w-full bg-zinc-900 border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(255,69,0,0.3)] p-8 md:p-12 overflow-hidden animate-in my-auto">
        
        <!-- Close Button -->
        <button @click="close" class="absolute top-8 right-8 z-20 p-2 text-muted hover:text-white transition-colors">
          <X class="w-6 h-6" />
        </button>

        <!-- Glow accents -->
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <!-- Header -->
        <div class="relative z-10 text-center mb-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full mb-4">
            <Sparkles class="w-3.5 h-3.5 text-primary-500" />
            <span class="text-[9px] font-black text-primary-500 uppercase tracking-[0.3em]">VERSION 1.0.0 — RPG UPDATE</span>
          </div>
          <h2 class="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
            REPPY RPG<span class="text-primary-500">.</span>AWAKENING
          </h2>
          <p class="text-sm text-zinc-400 font-medium max-w-lg mx-auto">
            {{ i18n.locale === 'es' 
                ? 'Hemos transformado Reppy en un ecosistema completo de entrenamiento. Tu evolución física ahora tiene impacto digital.' 
                : 'We have transformed Reppy into a complete training ecosystem. Your physical evolution now has digital impact.' }}
          </p>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 relative z-10">
          <!-- Stat System -->
          <div class="bg-white/5 border border-white/5 rounded-3xl p-6 flex gap-4 hover:bg-white/10 transition-colors">
            <div class="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center shrink-0">
              <Dumbbell class="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 class="text-xs font-black text-white uppercase tracking-wider mb-1">RPG STATS 2.0</h3>
              <p class="text-[10px] text-zinc-500 leading-relaxed">STR, DEX, END, VIG, INT, FTH. Cada atributo escala tu daño y eficiencia de forma única.</p>
            </div>
          </div>

          <!-- Missions -->
          <div class="bg-white/5 border border-white/5 rounded-3xl p-6 flex gap-4 hover:bg-white/10 transition-colors">
            <div class="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0">
              <Target class="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h3 class="text-xs font-black text-white uppercase tracking-wider mb-1">{{ i18n.locale === 'es' ? 'MISIONES DIARIAS' : 'DAILY MISSIONS' }}</h3>
              <p class="text-[10px] text-zinc-500 leading-relaxed">Completa objetivos tácticos diarios para ganar Reppy Coins y XP masivo.</p>
            </div>
          </div>

          <!-- PvP -->
          <div class="bg-white/5 border border-white/5 rounded-3xl p-6 flex gap-4 hover:bg-white/10 transition-colors">
            <div class="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center shrink-0">
              <Sword class="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 class="text-xs font-black text-white uppercase tracking-wider mb-1">DUELOS PVP</h3>
              <p class="text-[10px] text-zinc-500 leading-relaxed">Reta a otros atletas en tiempo real. Configura el campo de batalla y demuestra tu poder.</p>
            </div>
          </div>

          <!-- Armory -->
          <div class="bg-white/5 border border-white/5 rounded-3xl p-6 flex gap-4 hover:bg-white/10 transition-colors">
            <div class="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
              <Trophy class="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 class="text-xs font-black text-white uppercase tracking-wider mb-1">LA ARMERÍA</h3>
              <p class="text-[10px] text-zinc-500 leading-relaxed">Nuevos sets legendarios, bordes animados y efectos para tu perfil de élite.</p>
            </div>
          </div>
        </div>

        <!-- Footer / Action -->
        <div class="relative z-10 flex flex-col items-center gap-6">
           <div class="flex items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              <span>SYNC STATUS: OPTIMAL</span>
              <div class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
              <span>READY FOR DEPLOYMENT</span>
           </div>

           <button @click="close" 
             class="group relative w-full md:w-auto inline-flex items-center justify-center px-12 py-5 bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95">
             {{ i18n.locale === 'es' ? 'INICIAR PROTOCOLO RPG' : 'BEGIN RPG PROTOCOL' }}
           </button>
           
           <button @click="viewFullPost" class="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
             {{ i18n.locale === 'es' ? 'LEER NOTAS DEL PARCHE COMPLETAS' : 'READ FULL PATCH NOTES' }}
           </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { 
  Sword, Sparkles, Dumbbell, Zap, Target, Info, 
  Activity, Heart, Brain, Church, X, Trophy 
} from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';

const i18n = useI18nStore();
const router = useRouter();

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);

const close = async () => {
    try {
        await axios.patch('/api/users/seen-rpg-release');
        emit('close');
    } catch (err) {
        console.error("Error updating modal status", err);
        emit('close');
    }
};

const viewFullPost = () => {
  router.push({ name: 'blog-post', params: { lang: i18n.locale, slug: 'lanzamiento-oficial-reppy-rpg' } });
  close();
};
</script>

<style scoped>
.animate-in {
  animation: modalEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalEnter {
  from { opacity: 0; transform: scale(0.95) translateY(30px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<template>
  <Transition name="fade">
    <div v-if="show" 
         class="fixed inset-0 z-[100] flex justify-center items-start overflow-y-auto p-4 md:p-8"
         role="dialog"
         aria-modal="true"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/95 backdrop-blur-xl" @click="close"></div>

      <!-- Content Card -->
      <div class="relative max-w-lg w-full bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(255,69,0,0.5)] p-8 md:p-10 overflow-hidden animate-in my-auto text-center">
        
        <!-- Close Button -->
        <button @click="close" class="absolute top-6 right-6 z-20 p-2 text-muted hover:text-white transition-colors">
          <X class="w-6 h-6" />
        </button>

        <!-- Glow accents -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/30 rounded-full blur-[100px] pointer-events-none"></div>

        <!-- Header -->
        <div class="relative z-10 mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full mb-4">
             <UserCircle class="w-3.5 h-3.5 text-primary-500" />
             <span class="text-[8px] font-black text-primary-500 uppercase tracking-widest">SISTEMA DE IDENTIDAD V2.0</span>
          </div>
          <h2 class="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
            AVATAR<span class="text-primary-500">.</span>OVERHAUL
          </h2>
          <p class="text-xs text-zinc-400 font-medium italic mt-2">Nuevas imágenes de clase, estilo RPG premium y optimización de red.</p>
        </div>

        <!-- Feature Grid: 40 Icons Preview -->
        <div class="grid grid-cols-4 gap-3 mb-10 relative z-10 px-4">
           <div v-for="i in [1, 2, 3, 4, 5, 7, 31, 32, 33, 34, 35, 36, 37, 38]" :key="i" class="aspect-square rounded-2xl overflow-hidden border border-white/10 opacity-60 hover:opacity-100 transition-opacity">
              <img :src="`/img/avatars/avatar_${i}.webp`" class="w-full h-full object-cover" />
           </div>
        </div>

        <!-- Details -->
        <div class="bg-black/40 border border-white/5 rounded-3xl p-6 relative z-10 mb-8">
           <div class="flex items-start gap-4 text-left">
              <div class="bg-primary-500/20 p-2.5 rounded-xl border border-primary-500/30">
                 <ShieldCheck class="w-5 h-5 text-primary-500" />
              </div>
              <div>
                 <h4 class="text-[10px] font-black text-white uppercase tracking-widest mb-1">IDENTIFICADORES DE CLASE x40</h4>
                 <p class="text-[9px] text-zinc-500 leading-relaxed italic">
                   "Hemos expandido el catálogo a 40 iconos premium de las sagas más legendarias: Dark Souls, God of War, Minecraft y más."
                 </p>
              </div>
           </div>
        </div>

        <!-- Action Button -->
        <div class="relative z-10">
           <button @click="navigateToProfile" 
             class="group relative w-full inline-flex items-center justify-center px-10 py-5 bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95">
             ELEGIR MI CLAVE VISUAL
           </button>
           <button @click="close" class="mt-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors">
              OCULTAR POR AHORA
           </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { UserCircle, ShieldCheck, X } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import axios from 'axios';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);
const router = useRouter();

const close = async () => {
    try {
        await axios.patch('/api/users/seen-avatar-modal');
        emit('close');
    } catch (err) {
        console.error("Error updating modal status", err);
        emit('close');
    }
};

const navigateToProfile = () => {
    close();
    router.push('/es/profile');
};
</script>

<style scoped>
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

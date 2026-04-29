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
      <div class="relative max-w-lg w-full bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(255,165,0,0.4)] p-8 md:p-10 overflow-y-auto max-h-[90vh] animate-in my-auto text-center no-scrollbar">
        
        <!-- Close Button -->
        <button @click="close" class="absolute top-6 right-6 z-20 p-2 text-muted hover:text-white transition-colors">
          <X class="w-6 h-6" />
        </button>

        <!-- Glow accents -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <!-- Header -->
        <div class="relative z-10 mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
             <ShoppingBag class="w-3.5 h-3.5 text-orange-500" />
             <span class="text-[8px] font-black text-orange-500 uppercase tracking-widest">ACTUALIZACIÓN DE LA ARMERÍA V2.0</span>
          </div>
          <h2 class="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
            ARMORY<span class="text-orange-500">.</span>RPG
          </h2>
          <p class="text-xs text-zinc-400 font-medium italic mt-2">Nuevos sistemas de equipo, packs optimizados y reembolso total de Reppy Coins.</p>
        </div>

        <!-- News Items -->
        <div class="space-y-4 mb-10 relative z-10 text-left">
           <div class="bg-black/40 border border-white/5 rounded-2xl p-4 flex gap-4 items-start">
              <div class="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                 <LayoutGrid class="w-4 h-4 text-orange-500" />
              </div>
              <div>
                 <h4 class="text-[9px] font-black text-white uppercase tracking-widest mb-1">NUEVA INTERFAZ TÁCTICA</h4>
                 <p class="text-[8px] text-zinc-500 italic">Filtros avanzados en tienda y comparativa de stats integrada en tu inventario.</p>
              </div>
           </div>
           
           <div class="bg-black/40 border border-white/5 rounded-2xl p-4 flex gap-4 items-start">
              <div class="p-2 bg-primary-500/20 rounded-lg border border-primary-500/30">
                 <Sparkles class="w-4 h-4 text-primary-500" />
              </div>
              <div>
                 <h4 class="text-[9px] font-black text-white uppercase tracking-widest mb-1">PACKS DE BIENVENIDA V2.0</h4>
                 <p class="text-[8px] text-zinc-500 italic">Contenido táctico no-cosmético con un 30% de descuento incluido.</p>
              </div>
           </div>

           <div class="bg-black/40 border border-white/5 rounded-2xl p-4 flex gap-4 items-start">
              <div class="p-2 bg-neon-lime/20 rounded-lg border border-neon-lime/30">
                 <Swords class="w-4 h-4 text-neon-lime" />
              </div>
              <div>
                 <h4 class="text-[9px] font-black text-white uppercase tracking-widest mb-1">COMPARATIVA DE STATS</h4>
                 <p class="text-[8px] text-zinc-500 italic">Visualiza la mejora de daño real comparada con tu equipo actual.</p>
              </div>
           </div>

           <div class="bg-black/40 border border-white/5 rounded-2xl p-4 flex gap-4 items-start">
              <div class="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                 <Coins class="w-4 h-4 text-blue-500" />
              </div>
              <div>
                 <h4 class="text-[9px] font-black text-white uppercase tracking-widest mb-1">REEMBOLSO DE CORTESÍA</h4>
                 <p class="text-[8px] text-zinc-500 italic">Se han devuelto el 100% de los coins gastados a todos los usuarios.</p>
              </div>
           </div>
        </div>

        <!-- Action Button -->
        <div class="relative z-10">
           <button @click="navigateToShop" 
             class="group relative w-full inline-flex items-center justify-center px-10 py-5 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-95">
             REVISAR EL ARSENAL
           </button>
           <button @click="close" class="mt-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors">
              CONFIRMADO
           </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { ShoppingBag, LayoutGrid, Sparkles, Swords, Coins, X } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);
const router = useRouter();
const authStore = useAuthStore();

const close = () => {
    emit('close');
};

const navigateToShop = () => {
    close();
    router.push({ name: 'shop' });
};

const dismissModalPermanently = async () => {
    if (!props.show) return;
    try {
        await axios.patch('/api/users/seen-armory-modal');
        // Update local state immediately
        if (authStore.user) {
            authStore.user.has_seen_armory_update = true;
        }
    } catch (err) {
        console.error("Error dismissing modal:", err);
    }
};

onMounted(() => {
    if (props.show) {
        dismissModalPermanently();
    }
});

watch(() => props.show, (newVal) => {
    if (newVal) {
        dismissModalPermanently();
    }
});
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

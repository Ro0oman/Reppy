<template>
  <Transition name="modal">
    <div v-if="store.confirmVisible" class="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-[#030303]/80 backdrop-blur-sm" @click="store.handleCancel"></div>
      
      <!-- Dialog -->
      <div class="glass w-full max-w-sm rounded-[2.5rem] p-8 border border-border relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden group">
        <div class="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div class="flex flex-col items-center text-center space-y-6 relative z-10">
          <div class="p-5 bg-surface rounded-3xl border border-border shadow-2xl">
            <HelpCircle class="w-10 h-10 text-primary-500" />
          </div>
          
          <div class="space-y-2">
            <h3 class="text-xl font-black text-foreground uppercase tracking-tighter">{{ store.confirmTitle }}</h3>
            <p class="text-sm text-muted font-medium leading-relaxed">
              {{ store.confirmMessage }}
            </p>
          </div>
          
          <div class="flex gap-3 w-full">
            <button 
              @click="store.handleCancel"
              class="flex-1 py-4 bg-surface hover:bg-muted/10 text-muted font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-border"
            >
              Cancel
            </button>
            <button 
              @click="store.handleConfirm"
              class="flex-1 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-lg shadow-primary-900/40 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useNotificationStore } from '../stores/notification';
import { HelpCircle } from 'lucide-vue-next';

const store = useNotificationStore();
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-enter-active .glass {
  transition: all 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.modal-enter-from .glass {
  transform: translateY(20px);
}
</style>

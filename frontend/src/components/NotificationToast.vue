<template>
  <Transition name="toast">
    <div v-if="store.visible" class="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
      <div 
        class="relative overflow-hidden p-0.5 rounded-2xl transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
        :class="{
          'bg-gradient-to-tr from-red-600/80 to-red-400/80': store.type === 'error',
          'bg-gradient-to-tr from-green-600/80 to-green-400/80': store.type === 'success',
          'bg-gradient-to-tr from-blue-600/80 to-blue-400/80': store.type === 'info'
        }"
      >
        <div class="glass border-transparent rounded-[calc(1rem-2px)] p-4 flex items-center gap-4 relative z-10">
          <div 
            class="p-2.5 rounded-xl shrink-0 shadow-lg"
            :class="{
              'bg-white/90 text-red-600': store.type === 'error',
              'bg-white/90 text-green-600': store.type === 'success',
              'bg-white/90 text-blue-600': store.type === 'info'
            }"
          >
            <AlertCircle v-if="store.type === 'error'" class="w-5 h-5" />
            <CheckCircle v-else-if="store.type === 'success'" class="w-5 h-5" />
            <Info v-else class="w-5 h-5" />
          </div>
          
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-0.5">
              {{ store.type === 'error' ? 'Security Protocol' : 'Neural Sync' }}
            </p>
            <p class="text-[13px] font-black text-foreground leading-tight">
              {{ store.message }}
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <button 
                v-if="store.showCopyLogs" 
                @click="handleCopyLogs"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold transition-all border border-white/10 active:scale-95"
              >
                <Copy v-if="!copied" class="w-3 h-3" />
                <Check v-else class="w-3 h-3 text-green-400" />
                {{ copied ? 'Copied!' : 'Copy Logs' }}
              </button>

              <button 
                v-if="store.showCopyLogs" 
                @click="sendLogsViaEmail"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold transition-all border border-white/10 active:scale-95 text-blue-200"
              >
                <Mail class="w-3 h-3" />
                Email Developer
              </button>
            </div>
          </div>
          
          <button @click="store.hide" 
                  :title="i18n.t('notif_close')"
                  class="text-muted hover:text-foreground transition-colors p-1">
            <X class="w-4 h-4" />
          </button>
        </div>
        
        <!-- Animated Shine -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import { useNotificationStore } from '../stores/notification';
import { useI18nStore } from '../stores/i18n';
import { AlertCircle, CheckCircle, Info, X, Copy, Check, Mail } from 'lucide-vue-next';
import { copyLogsToClipboard, sendLogsViaEmail } from '../utils/logger';

const store = useNotificationStore();
const i18n = useI18nStore();
const copied = ref(false);

const handleCopyLogs = async () => {
  const success = await copyLogsToClipboard();
  if (success) {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px) scale(0.9);
}
</style>

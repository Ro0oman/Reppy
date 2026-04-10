<template>
  <div class="min-h-screen bg-deep-abyss selection:bg-primary-500 overflow-hidden flex flex-col items-center justify-center p-6 relative">
    
    <!-- Glitchy background -->
    <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 bg-primary-500/10 blur-[120px] pointer-events-none"></div>
    
    <div class="max-w-xl w-full text-center space-y-12 relative z-10">
      <!-- Error Code Display -->
      <div class="relative inline-block space-y-2">
        <h1 class="text-[120px] md:text-[200px] font-black text-foreground/5 leading-none tracking-tighter italic">404</h1>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="p-6 bg-surface border border-border shadow-2xl rounded-3xl rotate-3 group hover:rotate-0 transition-transform duration-500">
            <TriangleAlert class="w-20 h-20 text-primary-500 animate-pulse" />
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-3xl md:text-5xl font-black text-foreground tracking-tight uppercase italic font-industrial">
          {{ i18n.t('not_found_title') }}
        </h2>
        <p class="text-lg text-muted/60 leading-relaxed font-medium">
          {{ i18n.t('not_found_desc') }}
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
        <button 
          @click="router.push('/')" 
          class="btn-reppy !px-12 !py-6 !text-lg shadow-2xl shadow-primary-500/20 uppercase"
        >
          {{ i18n.t('not_found_btn') }}
        </button>
      </div>

      <div class="pt-20">
        <router-link to="/blog" class="text-[10px] font-black text-muted/20 hover:text-primary transition-all uppercase tracking-[0.4em]">
          Read Mainframe Logs (Blog)
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18nStore } from '../stores/i18n';
import { TriangleAlert } from 'lucide-vue-next';

const router = useRouter();
const i18n = useI18nStore();
</script>

<style scoped>
.font-industrial { font-family: 'Inter Tight', sans-serif; }
.btn-reppy {
  @apply bg-primary-500 text-white font-black rounded-3xl transition-all active:scale-95 hover:shadow-2xl hover:shadow-primary-500/30 px-8 py-4;
}
</style>

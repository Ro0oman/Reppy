<template>
  <Teleport to="body">
    <div v-if="show" 
         class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
         @click.self="emit('close')">
      <div class="max-w-xl w-full p-6 md:p-12 border-primary-500/20 shadow-[0_0_100px_rgba(255,69,0,0.1)] space-y-8 md:space-y-10 relative overflow-hidden bg-background rounded-[2.5rem] max-h-[90vh] overflow-y-auto select-none">
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div class="flex items-center justify-between z-10 relative">
          <div class="flex flex-col">
            <h3 class="text-3xl md:text-4xl font-black text-industrial text-foreground uppercase italic leading-none">{{ i18nStore.t('codex_title') }}<span class="text-primary-500">.</span></h3>
            <p class="text-[9px] md:text-[10px] font-black text-muted uppercase tracking-[0.4em] mt-3">{{ i18nStore.t('codex_subtitle') }}</p>
          </div>
          <button @click="emit('close')" class="p-2 md:p-3 bg-surface/10 hover:bg-surface/20 rounded-2xl transition-all hover:rotate-90">
            <XIcon class="w-5 h-5 md:w-6 md:h-6 text-foreground" />
          </button>
        </div>

        <div class="space-y-6 z-10 relative select-none">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div v-for="desc in attributeDescriptions" :key="desc.key" 
                 class="flex gap-4 md:gap-6 items-start p-4 md:p-6 bg-surface/5 border border-border rounded-2xl group transition-all hover:bg-surface/10"
                 :class="desc.borderColor">
              <div class="p-3 md:p-4 bg-surface/10 rounded-2xl transition-transform group-hover:scale-110 shrink-0" :class="desc.iconColor">
                 <component :is="desc.icon" class="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div class="flex-1">
                <h4 class="font-black uppercase text-[10px] md:text-xs tracking-widest mb-1" :class="desc.iconColor">{{ i18nStore.t('codex_' + desc.key.toLowerCase() + '_name') }} ({{ desc.key }})</h4>
                <p class="text-muted text-[9px] md:text-[10px] leading-relaxed italic mb-2">"{{ i18nStore.t('codex_' + desc.key.toLowerCase() + '_quote') }}"</p>
                <p class="text-foreground/80 text-[10px] md:text-[11px] font-medium leading-relaxed mb-3">{{ i18nStore.t('codex_' + desc.key.toLowerCase() + '_desc') }}</p>
                
                <div class="flex items-center gap-2 pt-3 border-t border-white/5">
                  <span class="text-[7px] md:text-[8px] font-black text-primary-500 uppercase tracking-widest">{{ i18nStore.t('codex_lv_up') }}</span>
                  <p class="text-[8px] md:text-[9px] font-black text-foreground uppercase tracking-tight">{{ i18nStore.t('codex_' + desc.key.toLowerCase() + '_action') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useI18nStore } from '../stores/i18n';
import { X as XIcon, Sword, Zap, Heart, Shield } from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
const i18nStore = useI18nStore();

const attributeDescriptions = [
  { key: 'STR', icon: Sword, iconColor: 'text-red-500', borderColor: 'hover:border-red-500/30' },
  { key: 'PWR', icon: Zap, iconColor: 'text-orange-500', borderColor: 'hover:border-orange-500/30' },
  { key: 'END', icon: Heart, iconColor: 'text-emerald-500', borderColor: 'hover:border-emerald-500/30' },
  { key: 'AGI', icon: Shield, iconColor: 'text-blue-500', borderColor: 'hover:border-blue-500/30' }
];
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
    <!-- Backdrop with dynamic blur -->
    <div class="absolute inset-0 bg-black/90 backdrop-blur-md" @click="$emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
      
      <!-- High-Tech Header -->
      <div class="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Scan class="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h2 class="text-xl font-black text-white italic uppercase tracking-tighter">Tactical Sync Comparison</h2>
            <p class="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mt-1 opacity-60">Cross-referencing attribute data...</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
          <X class="w-5 h-5 text-muted group-hover:text-white transition-colors" />
        </button>
      </div>

      <!-- Comparison Grid -->
      <div class="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          
          <!-- VS Middle Badge -->
          <div class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-surface border border-white/10 items-center justify-center z-20 shadow-xl">
            <span class="text-[10px] font-black text-primary-500 italic">VS</span>
          </div>

          <!-- My Stats Card -->
          <div class="space-y-6">
            <div class="flex flex-col items-center gap-4 text-center">
              <span class="text-[9px] font-black text-muted uppercase tracking-[0.4em] opacity-40">PRIMARY_OPERATIVE</span>
              <div class="relative">
                <AvatarFrame :src="me.avatar_url" :border-css="me.border_css" :size="80" />
                <div class="absolute -bottom-2 inset-x-0 flex justify-center">
                   <div class="px-2 py-0.5 bg-black border border-white/10 rounded text-[9px] font-black text-white uppercase italic">YOU</div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-black text-white uppercase tracking-tight">{{ me.name }}</h3>
                <p class="text-[9px] font-bold text-primary-500 uppercase tracking-widest mt-1">{{ me.title_name || 'RECRUIT' }}</p>
              </div>
            </div>

            <!-- Stats List -->
            <div class="space-y-2">
              <div v-for="stat in comparedStats" :key="stat.key" 
                   class="flex justify-between items-center p-3 rounded-xl border border-white/[0.03] bg-white/[0.02]">
                <span class="text-[10px] font-bold text-muted uppercase tracking-wider">{{ stat.label }}</span>
                <span class="text-base font-black text-white tabular-nums">{{ stat.me }}</span>
              </div>
            </div>
          </div>

          <!-- Target Stats Card -->
          <div class="space-y-6">
            <div class="flex flex-col items-center gap-4 text-center">
              <span class="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em]">TARGET_USER</span>
              <div class="relative">
                 <AvatarFrame :src="target.avatar_url" :border-css="target.border_css" :size="80" />
              </div>
              <div>
                <h3 class="text-lg font-black text-white uppercase tracking-tight">{{ target.user_name || target.name }}</h3>
                <p class="text-[9px] font-bold text-primary-500 uppercase tracking-widest mt-1">{{ target.title_name || 'RECRUIT' }}</p>
              </div>
            </div>

            <!-- Stats List -->
            <div class="space-y-2">
              <div v-for="stat in comparedStats" :key="stat.key" 
                   class="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-primary-500/[0.03] group hover:bg-primary-500/10 transition-colors">
                <span class="text-[10px] font-bold text-muted uppercase tracking-wider">{{ stat.label }}</span>
                <div class="flex items-center gap-3">
                  <span class="text-base font-black text-white tabular-nums">{{ stat.target }}</span>
                  <!-- Diff Indicator -->
                  <div v-if="stat.diff !== 0" 
                       class="px-2 py-0.5 rounded text-[9px] font-black italic tabular-nums min-w-[32px] text-center"
                       :class="stat.diff > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'">
                    {{ stat.diff > 0 ? '+' : '' }}{{ stat.diff }}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Summary Analysis Footer -->
      <div class="px-6 md:px-8 py-4 md:py-6 bg-black/40 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div class="flex items-center gap-6">
           <div class="flex flex-col">
              <span class="text-[8px] font-black text-muted uppercase tracking-widest mb-1">TOTAL_REPS</span>
              <div class="flex items-baseline gap-2">
                 <span class="text-xl font-black text-white italic">{{ me.total_reps }}</span>
                 <span class="text-xs font-bold" :class="me.total_reps >= target.total_reps ? 'text-emerald-500' : 'text-red-500'">
                    {{ me.total_reps >= target.total_reps ? '+' : '' }}{{ me.total_reps - target.total_reps }}
                 </span>
              </div>
           </div>
           <div class="w-px h-8 bg-white/5 mx-2"></div>
           <div class="flex flex-col">
              <span class="text-[8px] font-black text-muted uppercase tracking-widest mb-1">GLOBAL_LEVEL</span>
              <div class="flex items-baseline gap-2">
                 <span class="text-xl font-black text-white italic">{{ me.current_level }}</span>
                 <span class="text-xs font-bold" :class="me.current_level >= target.current_level ? 'text-emerald-500' : 'text-red-500'">
                    {{ me.current_level >= target.current_level ? '+' : '' }}{{ me.current_level - target.current_level }}
                 </span>
              </div>
           </div>
        </div>
        
        <button @click="$emit('close')" class="w-full md:w-auto px-10 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95">
          BACK_TO_INTEL
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { X, Scan, Swords, Zap, Activity } from 'lucide-vue-next';
import AvatarFrame from './AvatarFrame.vue';

const props = defineProps({
  show: Boolean,
  me: Object,      // AuthStore user profile (full stats)
  target: Object   // Activity/Profile user data
});

defineEmits(['close']);

const comparedStats = computed(() => {
  const stats = [
    { key: 'str_lvl', label: 'STRENGTH' },
    { key: 'end_lvl', label: 'ENDURANCE' },
    { key: 'agi_lvl', label: 'AGILITY' },
    { key: 'vig_lvl', label: 'VIGOR' },
    { key: 'dex_lvl', label: 'DEXTERITY' },
    { key: 'int_lvl', label: 'INTELLIGENCE' },
    { key: 'fth_lvl', label: 'FAITH' },
    { key: 'cha_lvl', label: 'CHARISMA' }
  ];

  return stats.map(s => {
    // Note: The structure of me vs target might differ slightly based on where they come from
    // Target from social feed has 'str_lvl', but 'me' from store has them too.
    const myVal = props.me[s.key] || 1;
    const targetVal = props.target[s.key] || 1;
    
    return {
      key: s.key,
      label: s.label,
      me: myVal,
      target: targetVal,
      diff: targetVal - myVal
    };
  });
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/90 backdrop-blur-md" @click="$emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
      
      <!-- Header -->
      <div class="px-10 py-8 border-b border-white/5 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
            <Swords class="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h2 class="text-2xl font-black text-white italic uppercase tracking-tighter">Combat Comparison</h2>
            <p class="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mt-1">Analyzing tactical efficiency...</p>
          </div>
        </div>
        <button @click="$emit('close')" class="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
          <X class="w-6 h-6 text-muted" />
        </button>
      </div>

      <!-- Main Body -->
      <div class="flex-1 overflow-y-auto p-8 md:p-12">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
          <!-- Connector/VS -->
          <div class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 items-center justify-center z-20 backdrop-blur-xl">
            <span class="text-[10px] font-black text-muted italic">VS</span>
          </div>

          <!-- Current Item -->
          <div class="space-y-8 opacity-60">
            <div class="flex flex-col items-center gap-4">
              <span class="text-[10px] font-black text-muted uppercase tracking-widest">CURRENT_EQUIPMENT</span>
              <div v-if="currentItem" class="w-full p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                <div class="relative z-10 flex flex-col items-center gap-4">
                   <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
                     <component :is="getSlotIcon(currentItem.type)" class="w-12 h-12 text-muted" />
                   </div>
                   <div class="text-center">
                     <h3 class="text-xl font-black text-white italic truncate">{{ currentItem.name }}</h3>
                     <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ currentItem.rarity }}</span>
                   </div>
                </div>
              </div>
              <div v-else class="w-full p-12 rounded-3xl border border-dashed border-white/5 flex flex-center justify-center">
                <span class="text-[10px] font-black text-muted/20 uppercase tracking-widest">EMPTY_SLOT</span>
              </div>
            </div>

            <!-- Stats -->
            <div class="space-y-4">
              <div v-for="stat in comparedStats" :key="stat.key" class="flex justify-between items-center py-3 border-b border-white/5">
                <span class="text-[10px] font-bold text-muted uppercase">{{ stat.label }}</span>
                <span class="text-lg font-black text-white italic tabular-nums">{{ stat.current }}</span>
              </div>
            </div>
          </div>

          <!-- New Item -->
          <div class="space-y-8">
            <div class="flex flex-col items-center gap-4">
              <span class="text-[10px] font-black text-primary-500 uppercase tracking-widest">PROPOSED_UPGRADE</span>
              <div class="w-full p-6 rounded-3xl bg-primary-500/5 border border-primary-500/20 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent"></div>
                <div class="relative z-10 flex flex-col items-center gap-4">
                   <div class="p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 group-hover:scale-110 transition-transform duration-500">
                     <component :is="getSlotIcon(newItem.type)" class="w-12 h-12 text-primary-500" />
                   </div>
                   <div class="text-center">
                     <h3 class="text-xl font-black text-white italic truncate">{{ newItem.name }}</h3>
                     <span class="text-[10px] font-black text-primary-500 uppercase tracking-widest">{{ newItem.rarity }}</span>
                   </div>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="space-y-4">
              <div v-for="stat in comparedStats" :key="stat.key" class="flex justify-between items-center py-3 border-b border-white/5">
                <span class="text-[10px] font-bold text-muted uppercase">{{ stat.label }}</span>
                <div class="flex items-center gap-3">
                  <span class="text-lg font-black text-white italic tabular-nums">{{ stat.new }}</span>
                  <div v-if="stat.diff !== 0" 
                       class="px-2 py-0.5 rounded text-[10px] font-black italic tabular-nums"
                       :class="stat.diff > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'">
                    {{ stat.diff > 0 ? '+' : '' }}{{ stat.diff }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-10 py-8 bg-black/20 border-t border-white/5 flex gap-4">
        <button @click="$emit('close')" class="flex-1 py-4 px-6 rounded-2xl border border-white/10 hover:bg-white/5 text-[11px] font-black uppercase tracking-widest text-muted transition-all">
          CANCEL_LOG
        </button>
        <button @click="$emit('equip', newItem)" class="flex-[2] py-4 px-6 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 active:scale-95">
          INITIALIZE_LOADOUT_SYNC
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Swords, X, Sword, Shield, Zap, Footprints, Package } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  newItem: Object,
  currentItem: Object
});

const emit = defineEmits(['close', 'equip']);

const getSlotIcon = (type) => {
  switch (type) {
    case 'head': return Zap;
    case 'weapon': return Sword;
    case 'armor': return Shield;
    case 'boots': return Footprints;
    default: return Package;
  }
};

const comparedStats = computed(() => {
  const stats = [
    { key: 'str', label: 'STRENGTH' },
    { key: 'end', label: 'ENDURANCE' },
    { key: 'vig', label: 'VIGOR' },
    { key: 'dex', label: 'DEXTERITY' },
    { key: 'int', label: 'INTELLIGENCE' },
    { key: 'fth', label: 'FAITH' },
    { key: 'cha', label: 'CHARISMA' }
  ];

  return stats.map(s => {
    const curVal = props.currentItem?.stats?.[s.key] || 0;
    const newVal = props.newItem?.stats?.[s.key] || 0;
    return {
      key: s.key,
      label: s.label,
      current: curVal,
      new: newVal,
      diff: newVal - curVal
    };
  });
});
</script>

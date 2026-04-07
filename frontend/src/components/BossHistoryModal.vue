<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300" @click.self="$emit('close')">
    <div class="glass max-w-2xl w-full p-8 rounded-[2.5rem] border border-border shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Background Glow -->
      <div class="absolute -top-32 -right-32 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Close Button -->
      <button @click="$emit('close')" class="absolute top-8 right-8 p-3 bg-surface/10 hover:bg-surface/20 rounded-2xl transition-all group">
         <X class="w-6 h-6 text-muted group-hover:text-foreground" />
      </button>

      <!-- Header -->
      <div class="flex items-center gap-6 mb-10 shrink-0">
        <div class="w-20 h-20 bg-surface rounded-2xl p-2 border border-border flex items-center justify-center">
            <img v-if="boss?.image_url" :src="boss.image_url" class="w-full h-full object-contain" />
            <span v-else class="text-4xl font-black italic text-muted">?</span>
        </div>
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500">HISTÓRICO DE DAÑO</span>
          <h2 class="text-3xl font-black italic tracking-tighter text-foreground uppercase italic">{{ boss?.name || 'BOSS' }}</h2>
          <div class="flex items-center gap-4 text-[10px] font-black text-muted uppercase tracking-widest">
              <span>{{ boss?.total_hp?.toLocaleString() }} HP</span>
              <span class="w-1 h-1 rounded-full bg-border"></span>
              <span>{{ contributors.length }} PARTICIPANTES</span>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
        <div v-if="loading" class="h-64 flex flex-col items-center justify-center gap-6">
            <div class="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent"></div>
            <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em] animate-pulse">DECRYPTING BATTLE LOGS...</p>
        </div>
        <div v-else-if="contributors.length === 0" class="h-64 flex flex-col items-center justify-center text-muted">
            <Inbox class="w-12 h-12 mb-4 opacity-20" />
            <p class="text-[10px] font-black uppercase tracking-widest">Sin registros de daño</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="(user, idx) in contributors" :key="user.id" 
               class="group relative flex items-center justify-between p-4 bg-surface/20 hover:bg-surface/40 border border-transparent hover:border-primary-500/30 rounded-2xl transition-all duration-300">
            
            <div class="flex items-center gap-4">
              <!-- Position -->
              <div class="w-8 flex justify-center text-xs font-black text-muted">
                  <span v-if="idx === 0" class="text-xl">🥇</span>
                  <span v-else-if="idx === 1" class="text-xl">🥈</span>
                  <span v-else-if="idx === 2" class="text-xl">🥉</span>
                  <span v-else>#{{ idx + 1 }}</span>
              </div>

              <!-- User Info -->
              <div class="flex items-center gap-3">
                  <AvatarFrame :src="user.avatar_url" :size="40" 
                    :border-css="idx === 0 ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : ''" />
                  <div>
                    <p class="text-sm font-bold text-foreground group-hover:text-primary-500 transition-colors">{{ user.name }}</p>
                    <p class="text-[9px] font-black text-muted uppercase tracking-widest">{{ getPercentage(user.damage_dealt) }}% DEL TOTAL</p>
                  </div>
              </div>
            </div>

            <!-- Damage info -->
            <div class="text-right">
                <div class="text-lg font-black italic tracking-tighter text-foreground tabular-nums">
                    -{{ user.damage_dealt.toLocaleString() }}
                </div>
                <div class="text-[8px] font-black text-muted uppercase tracking-widest">CRITICAL REPS</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-8 pt-8 border-t border-border shrink-0 flex items-center justify-between">
           <div class="flex items-center gap-3">
               <div class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
               <p class="text-[10px] font-black text-muted uppercase tracking-widest">Protocolo de batalla activo</p>
           </div>
           <p class="text-[10px] font-black text-primary-500 uppercase tracking-widest italic">TEMPORADA 1</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { X, Inbox, Loader2 } from 'lucide-vue-next';
import AvatarFrame from './AvatarFrame.vue';

const props = defineProps({
  show: Boolean,
  bossId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close']);

const loading = ref(true);
const boss = ref(null);
const contributors = ref([]);

const fetchHistory = async () => {
  if (!props.bossId) return;
  loading.value = true;
  try {
    const res = await axios.get(`/api/boss/history/${props.bossId}`);
    boss.value = res.data.boss;
    contributors.value = res.data.contributors;
  } catch (err) {
    console.error('Error fetching boss history:', err);
  } finally {
    loading.value = false;
  }
};

const getPercentage = (damage) => {
  if (!boss.value || boss.value.total_hp === 0) return 0;
  return ((damage / boss.value.total_hp) * 100).toFixed(1);
};

watch(() => props.show, (newVal) => {
  if (newVal) fetchHistory();
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

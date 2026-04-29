<template>
  <div 
    class="relative overflow-hidden transition-all duration-300 hover:scale-[1.01]"
    :class="[
      'card-stats p-6 md:p-8 space-y-6',
      activity.pvp_data?.status === 'active' ? 'border-primary-500/50 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'border-white/5 opacity-90'
    ]"
  >
    <!-- Battlefield Background -->
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <!-- Preset Background Images -->
        <div v-if="activity.pvp_data?.battlefield && presetImages[activity.pvp_data.battlefield]" class="absolute inset-0">
           <img :src="presetImages[activity.pvp_data.battlefield]" class="w-full h-full object-cover" />
           <div class="absolute inset-0 bg-background/40 backdrop-blur-[1px]"></div>
        </div>
        
        <!-- Custom Background Image (URLs) -->
        <div v-else-if="activity.pvp_data?.battlefield && activity.pvp_data.battlefield.startsWith('http')" class="absolute inset-0">
           <img :src="activity.pvp_data.battlefield" class="w-full h-full object-cover mix-blend-overlay" />
           <div class="absolute inset-0 bg-background/40 backdrop-blur-[2px]"></div>
        </div>
    </div>

    <!-- Background Glow (Legacy fallback) -->
    <div v-if="activity.pvp_data?.status === 'active'" class="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 blur-[100px] pointer-events-none"></div>

    <!-- Header: Battle Status -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div 
          class="p-2.5 rounded-xl border"
          :class="activity.pvp_data?.status === 'active' ? 'bg-primary-500/20 border-primary-500/30 text-primary-500 animate-pulse' : 'bg-white/5 border-white/10 text-muted'"
        >
          <Swords class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-xs font-black text-white uppercase italic tracking-[0.2em]">{{ activity.title }}</h3>
          <p class="text-[9px] font-bold text-muted uppercase tracking-widest mt-0.5">
            {{ (activity.pvp_data?.status === 'active' && timeLeft > 0) ? 'COMBAT_PROTOCOL_RUNNING' : 'COMBAT_PROTOCOL_TERMINATED' }}
          </p>

        </div>
      </div>
      
      <!-- Timer (if active) -->
      <div v-if="activity.pvp_data?.status === 'active'" class="px-3 py-1.5 bg-black/40 border border-primary-500/30 rounded-lg flex items-center gap-2">
         <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping"></span>
         <span class="text-[10px] font-black text-white tabular-nums">{{ timeLeft }}s</span>
      </div>
    </div>

    <!-- VS Display -->
    <div class="flex items-center justify-center gap-6 md:gap-12 py-4">
       <!-- P1 -->
       <div class="flex flex-col items-center gap-3 text-center transition-all duration-500" 
            :class="{ 'scale-110 z-10': isWinner(activity.pvp_data?.challenger_id), 'opacity-40 grayscale': activity.pvp_data?.winner_id && !isWinner(activity.pvp_data?.challenger_id) }">
          <div class="relative">
             <div v-if="isWinner(activity.pvp_data?.challenger_id)" class="absolute -inset-4 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>
             <img :src="activity.avatar_url" 
                  class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 p-0.5 relative z-10 transition-all" 
                  :class="isWinner(activity.pvp_data?.challenger_id) ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'border-white/10'" />
             <div v-if="isWinner(activity.pvp_data?.challenger_id)" class="absolute -top-2 -right-2 p-1.5 bg-amber-500 rounded-full border-2 border-surface z-20 shadow-lg">
                <Trophy class="w-4 h-4 text-black" />
             </div>
             <div v-if="isWinner(activity.pvp_data?.challenger_id)" class="absolute -bottom-2 inset-x-0 flex justify-center z-20">
                <span class="px-2 py-0.5 bg-amber-500 text-[7px] font-black text-black uppercase rounded-full shadow-lg">WINNER</span>
             </div>
          </div>
          <span class="text-[10px] font-black text-white uppercase italic truncate max-w-[80px] mt-2">{{ activity.pvp_data?.challenger_name }}</span>
       </div>

       <div class="flex flex-col items-center gap-1">
          <span class="text-2xl font-black italic text-white opacity-20">VS</span>
       </div>

       <!-- P2 -->
       <div class="flex flex-col items-center gap-3 text-center transition-all duration-500"
            :class="{ 'scale-110 z-10': isWinner(activity.pvp_data?.challenged_id), 'opacity-40 grayscale': activity.pvp_data?.winner_id && !isWinner(activity.pvp_data?.challenged_id) }">
          <div class="relative">
             <div v-if="isWinner(activity.pvp_data?.challenged_id)" class="absolute -inset-4 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>
             <div class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 p-0.5 bg-surface/80 flex items-center justify-center relative z-10 transition-all"
                  :class="isWinner(activity.pvp_data?.challenged_id) ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'border-white/10'">
                <User class="w-8 h-8 text-muted/30" />
             </div>
             <div v-if="isWinner(activity.pvp_data?.challenged_id)" class="absolute -top-2 -right-2 p-1.5 bg-amber-500 rounded-full border-2 border-surface z-20 shadow-lg">
                <Trophy class="w-4 h-4 text-black" />
             </div>
             <div v-if="isWinner(activity.pvp_data?.challenged_id)" class="absolute -bottom-2 inset-x-0 flex justify-center z-20">
                <span class="px-2 py-0.5 bg-amber-500 text-[7px] font-black text-black uppercase rounded-full shadow-lg">WINNER</span>
             </div>
          </div>
          <span class="text-[10px] font-black text-white uppercase italic truncate max-w-[80px] mt-2">{{ activity.pvp_data?.challenged_name }}</span>
       </div>
    </div>

    <!-- Health Bars & Damage Stats -->
    <div class="grid grid-cols-2 gap-4">
       <!-- HP P1 -->
       <div class="space-y-1.5">
          <div class="flex justify-between text-[8px] font-bold text-muted uppercase">
             <span>{{ activity.pvp_data?.damage1 }} DMG</span>
             <span>{{ Math.round(activity.pvp_data?.hp1) }} HP</span>
          </div>
          <div class="h-1.5 bg-black/40 rounded-full overflow-hidden">
             <div 
               class="h-full bg-emerald-500 transition-all duration-500"
               :style="{ width: (activity.pvp_data?.hp1 / activity.pvp_data?.max_hp * 100) + '%' }"
             ></div>
          </div>
       </div>
       <!-- HP P2 -->
       <div class="space-y-1.5">
          <div class="flex justify-between text-[8px] font-bold text-muted uppercase">
             <span>{{ Math.round(activity.pvp_data?.hp2) }} HP</span>
             <span>{{ activity.pvp_data?.damage2 }} DMG</span>
          </div>
          <div class="h-1.5 bg-black/40 rounded-full overflow-hidden flex justify-end">
             <div 
               class="h-full bg-emerald-500 transition-all duration-500"
               :style="{ width: (activity.pvp_data?.hp2 / activity.pvp_data?.max_hp * 100) + '%' }"
             ></div>
          </div>
       </div>
    </div>

    <!-- Footer: Info & Action -->
    <div class="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
       <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
             <div class="w-1.5 h-1.5 rounded-full" :class="(activity.pvp_data?.status === 'active' && timeLeft > 0) ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'"></div>
             <span class="text-[8px] font-bold text-muted uppercase tracking-[0.2em]">
                {{ (activity.pvp_data?.status === 'active' && timeLeft > 0) ? 'LIVE_COMBAT_FEED' : 'COMBAT_FINISHED' }}
             </span>
          </div>
       </div>

       <button 
         @click="$router.push({ name: 'pvp', params: { id: activity.pvp_data?.id } })"
         class="px-5 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2"
       >
         {{ activity.pvp_data?.status === 'active' ? 'ENTER_ARENA ⚔' : 'VIEW_REPORT 📊' }}
       </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Swords, User, Trophy, Zap } from 'lucide-vue-next';

const props = defineProps({
  activity: Object
});

const presetImages = {
  'Default Reppy': '/images/pvp/default.webp',
  'Dark Arena': '/images/pvp/dark_arena.webp',
  'Neon Gym': '/images/pvp/neon_gym.webp',
  'Forest Temple': '/images/pvp/forest_temple.webp',
  'Steel Dungeon': '/images/pvp/steel_dungeon.webp'
};

const timeLeft = ref(0);
let timer = null;

const startTimer = () => {
    if (!props.activity.pvp_data?.started_at) return;
    const start = new Date(props.activity.pvp_data.started_at);
    const limit = props.activity.pvp_data.time_limit;
    
    const update = () => {
        const elapsed = Math.floor((new Date() - start) / 1000);
        timeLeft.value = Math.max(0, limit - elapsed);
    };
    
    update();
    timer = setInterval(update, 1000);
};

const isWinner = (uid) => props.activity.pvp_data?.winner_id === uid;

onMounted(() => {
    if (props.activity.pvp_data?.status === 'active') {
        startTimer();
    }
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});
</script>

<style scoped>
.card-stats {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 2rem;
}
</style>

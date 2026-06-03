<template>
  <article class="relative overflow-hidden rounded-[2rem] border transition-all duration-300"
    :class="c.status === 'active'
      ? 'border-primary-500/40 shadow-[0_0_40px_rgba(99,102,241,0.10)]'
      : 'border-white/10'">

    <!-- Animated GIF background -->
    <div class="absolute inset-0 z-0">
      <img :src="bgGif" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black/80"></div>
      <!-- Extra gradient at edges for depth -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
    </div>

    <div class="relative z-10 p-6 space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-sm"
          :class="c.status === 'active'
            ? 'bg-primary-500/20 border-primary-500/40 text-primary-400 animate-pulse'
            : 'bg-white/10 border-white/20 text-muted'">
          <Swords class="w-3 h-3" />
          {{ c.status === 'active' ? 'Reto en curso' : 'Reto finalizado' }}
        </div>
        <span v-if="c.status === 'active'" class="text-[10px] font-black text-primary-400 font-mono bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm">{{ countdown }}</span>
        <span v-else class="text-[10px] text-muted">{{ goalLabel }}</span>
      </div>

      <!-- VS section -->
      <div class="flex items-center justify-between gap-4">

        <!-- Challenger -->
        <div class="flex flex-col items-center gap-2 flex-1 text-center"
          :class="{ 'opacity-40 grayscale': c.winner_id && c.winner_id !== c.challenger_id }">
          <div class="relative">
            <div v-if="c.winner_id === c.challenger_id" class="absolute -inset-2 bg-amber-500/30 blur-lg rounded-full"></div>
            <img v-if="c.challenger_avatar" :src="c.challenger_avatar"
              class="w-14 h-14 rounded-full object-cover border-2 relative"
              :class="c.winner_id === c.challenger_id ? 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.5)]' : 'border-white/20'" />
            <div v-else class="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-lg font-black text-white">
              {{ c.challenger_name[0] }}
            </div>
            <div v-if="c.winner_id === c.challenger_id" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-black">
              <Trophy class="w-2.5 h-2.5 text-black" />
            </div>
          </div>
          <span class="text-xs font-black text-white uppercase italic truncate max-w-[80px]" style="text-shadow:0 1px 8px rgba(0,0,0,0.9)">{{ c.challenger_name }}</span>
          <span class="text-3xl font-black tabular-nums" style="text-shadow:0 2px 12px rgba(0,0,0,0.9)"
            :class="c.challenger_score > c.challenged_score ? 'text-primary-400' : 'text-white'">
            {{ c.challenger_score.toLocaleString() }}
          </span>
        </div>

        <!-- Center -->
        <div class="flex flex-col items-center gap-1.5 shrink-0">
          <Swords class="w-6 h-6 text-white/30" />
          <span class="text-[9px] font-black text-white/50 uppercase tracking-widest">{{ goalLabel }}</span>
          <span class="text-[9px] text-white/40 font-semibold whitespace-nowrap">
            Objetivo: <span class="text-white/70 font-black">{{ c.goal_value.toLocaleString() }}</span>
          </span>
          <span v-if="c.status === 'finished' && !c.winner_id"
            class="text-[10px] font-black text-amber-400 uppercase tracking-widest">Empate</span>
        </div>

        <!-- Challenged -->
        <div class="flex flex-col items-center gap-2 flex-1 text-center"
          :class="{ 'opacity-40 grayscale': c.winner_id && c.winner_id !== c.challenged_id }">
          <div class="relative">
            <div v-if="c.winner_id === c.challenged_id" class="absolute -inset-2 bg-amber-500/30 blur-lg rounded-full"></div>
            <img v-if="c.challenged_avatar" :src="c.challenged_avatar"
              class="w-14 h-14 rounded-full object-cover border-2 relative"
              :class="c.winner_id === c.challenged_id ? 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.5)]' : 'border-white/20'" />
            <div v-else class="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-lg font-black text-white">
              {{ c.challenged_name[0] }}
            </div>
            <div v-if="c.winner_id === c.challenged_id" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-black">
              <Trophy class="w-2.5 h-2.5 text-black" />
            </div>
          </div>
          <span class="text-xs font-black text-white uppercase italic truncate max-w-[80px]" style="text-shadow:0 1px 8px rgba(0,0,0,0.9)">{{ c.challenged_name }}</span>
          <span class="text-3xl font-black tabular-nums" style="text-shadow:0 2px 12px rgba(0,0,0,0.9)"
            :class="c.challenged_score > c.challenger_score ? 'text-amber-400' : 'text-white'">
            {{ c.challenged_score.toLocaleString() }}
          </span>
        </div>
      </div>

      <!-- Progress bars toward goal -->
      <div class="space-y-2 bg-black/30 rounded-2xl px-4 py-3 backdrop-blur-sm">
        <!-- Challenger -->
        <div class="space-y-1">
          <div class="flex justify-between text-[9px] font-black uppercase tracking-widest">
            <span class="text-white/60">{{ c.challenger_name.split(' ')[0] }}</span>
            <span class="text-primary-400">{{ c.challenger_score }} / {{ c.goal_value }}</span>
          </div>
          <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div class="h-full bg-primary-500 rounded-full transition-all duration-700"
              :style="{ width: Math.min(100, Math.round((c.challenger_score / c.goal_value) * 100)) + '%' }"></div>
          </div>
        </div>
        <!-- Challenged -->
        <div class="space-y-1">
          <div class="flex justify-between text-[9px] font-black uppercase tracking-widest">
            <span class="text-white/60">{{ c.challenged_name.split(' ')[0] }}</span>
            <span class="text-amber-400">{{ c.challenged_score }} / {{ c.goal_value }}</span>
          </div>
          <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div class="h-full bg-amber-500 rounded-full transition-all duration-700"
              :style="{ width: Math.min(100, Math.round((c.challenged_score / c.goal_value) * 100)) + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/10">
        <span v-if="c.status === 'active'">🏆 {{ c.reward_coins }} RC + {{ c.reward_gems }} 💎 al ganador</span>
        <span v-else-if="c.winner_id">
          🏆 {{ c.reward_coins }} RC + {{ c.reward_gems }} 💎 → {{ c.winner_id === c.challenger_id ? c.challenger_name : c.challenged_name }}
        </span>
        <span v-else>Sin ganador — empate</span>
        <span class="font-mono">{{ formattedDate }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Swords, Trophy } from 'lucide-vue-next';

const props = defineProps({ activity: { type: Object, required: true } });

const c = computed(() => props.activity.pvp_data);

const GIFS = [
  '/images/pvp/default.gif',
  '/images/pvp/dark_arena.gif',
  '/images/pvp/forest_temple.gif',
  '/images/pvp/neon_gym.gif',
  '/images/pvp/steel_dungeon.gif',
];
const bgGif = GIFS[Math.floor(Math.random() * GIFS.length)];

const goalLabels = { reps: 'Reps', damage: 'Daño al boss' };
const goalLabel = computed(() => goalLabels[c.value.goal_type] || c.value.goal_type);

const countdown = ref('--:--:--');
let timer = null;
const updateCountdown = () => {
  const diff = new Date(c.value.expires_at) - new Date();
  if (diff <= 0) { countdown.value = '00:00:00'; return; }
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  countdown.value = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

onMounted(() => { updateCountdown(); timer = setInterval(updateCountdown, 1000); });
onUnmounted(() => clearInterval(timer));

const formattedDate = computed(() => {
  const d = new Date(props.activity.created_at);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
});
</script>

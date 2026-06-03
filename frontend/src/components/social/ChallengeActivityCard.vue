<template>
  <article
    class="relative overflow-hidden rounded-[2rem] border transition-all duration-300"
    :class="c.status === 'active'
      ? 'border-primary-500/40 bg-primary-500/5 shadow-[0_0_40px_rgba(99,102,241,0.08)]'
      : 'border-white/10 bg-white/[0.02]'"
  >
    <!-- Glow blob for active -->
    <div v-if="c.status === 'active'" class="absolute -top-20 -right-20 w-48 h-48 bg-primary-500/10 blur-[80px] pointer-events-none"></div>

    <div class="relative z-10 p-6 space-y-5">

      <!-- Header badge -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest"
          :class="c.status === 'active'
            ? 'bg-primary-500/20 border-primary-500/40 text-primary-400 animate-pulse'
            : 'bg-white/5 border-white/10 text-muted'">
          <Swords class="w-3 h-3" />
          {{ c.status === 'active' ? 'Reto en curso' : 'Reto finalizado' }}
        </div>
        <span v-if="c.status === 'active'" class="text-[10px] font-black text-primary-400 font-mono">{{ countdown }}</span>
        <span v-else class="text-[10px] text-muted">{{ goalLabel }}</span>
      </div>

      <!-- VS section -->
      <div class="flex items-center justify-between gap-4">

        <!-- Challenger -->
        <div class="flex flex-col items-center gap-2 flex-1 text-center"
          :class="{ 'opacity-40 grayscale': c.winner_id && c.winner_id !== c.challenger_id }">
          <div class="relative">
            <div v-if="c.winner_id === c.challenger_id" class="absolute -inset-2 bg-amber-500/20 blur-lg rounded-full"></div>
            <img v-if="c.challenger_avatar" :src="c.challenger_avatar"
              class="w-14 h-14 rounded-full object-cover border-2 relative"
              :class="c.winner_id === c.challenger_id ? 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.5)]' : 'border-white/10'" />
            <div v-else class="w-14 h-14 rounded-full bg-foreground/10 border-2 border-white/10 flex items-center justify-center text-lg font-black text-muted">
              {{ c.challenger_name[0] }}
            </div>
            <div v-if="c.winner_id === c.challenger_id" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-surface">
              <Trophy class="w-2.5 h-2.5 text-black" />
            </div>
          </div>
          <span class="text-xs font-black text-foreground uppercase italic truncate max-w-[80px]">{{ c.challenger_name }}</span>
          <span class="text-2xl font-black tabular-nums"
            :class="myScore === opponentScore ? 'text-foreground' : myScore > opponentScore ? 'text-emerald-400' : 'text-foreground'">
            {{ c.challenger_score.toLocaleString() }}
          </span>
        </div>

        <!-- Center -->
        <div class="flex flex-col items-center gap-1 shrink-0">
          <Swords class="w-5 h-5 text-muted/40" />
          <span class="text-[10px] font-black text-muted uppercase">{{ goalLabel }}</span>
          <span v-if="c.status === 'finished' && !c.winner_id" class="text-[10px] font-black text-amber-400 uppercase tracking-widest">Empate</span>
        </div>

        <!-- Challenged -->
        <div class="flex flex-col items-center gap-2 flex-1 text-center"
          :class="{ 'opacity-40 grayscale': c.winner_id && c.winner_id !== c.challenged_id }">
          <div class="relative">
            <div v-if="c.winner_id === c.challenged_id" class="absolute -inset-2 bg-amber-500/20 blur-lg rounded-full"></div>
            <img v-if="c.challenged_avatar" :src="c.challenged_avatar"
              class="w-14 h-14 rounded-full object-cover border-2 relative"
              :class="c.winner_id === c.challenged_id ? 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.5)]' : 'border-white/10'" />
            <div v-else class="w-14 h-14 rounded-full bg-foreground/10 border-2 border-white/10 flex items-center justify-center text-lg font-black text-muted">
              {{ c.challenged_name[0] }}
            </div>
            <div v-if="c.winner_id === c.challenged_id" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-surface">
              <Trophy class="w-2.5 h-2.5 text-black" />
            </div>
          </div>
          <span class="text-xs font-black text-foreground uppercase italic truncate max-w-[80px]">{{ c.challenged_name }}</span>
          <span class="text-2xl font-black tabular-nums text-foreground">{{ c.challenged_score.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Progress bar (active only) -->
      <div v-if="c.status === 'active'" class="flex items-center gap-2">
        <div class="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div class="h-full bg-primary-500 rounded-full transition-all duration-700"
            :style="{ width: scorePercent(c.challenger_score, c.challenged_score) + '%' }"></div>
        </div>
        <div class="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden rotate-180">
          <div class="h-full bg-amber-500 rounded-full transition-all duration-700"
            :style="{ width: scorePercent(c.challenged_score, c.challenger_score) + '%' }"></div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between text-[10px] text-muted pt-1 border-t border-white/5">
        <span v-if="c.status === 'active'">+{{ c.reward_coins }} RC al ganador</span>
        <span v-else-if="c.winner_id">+{{ c.reward_coins }} RC → {{ c.winner_id === c.challenger_id ? c.challenger_name : c.challenged_name }}</span>
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

const goalLabels = { reps: 'Reps', damage: 'Daño al boss' };
const goalLabel = computed(() => goalLabels[c.value.goal_type] || c.value.goal_type);

const myScore = computed(() => c.value.challenger_score);
const opponentScore = computed(() => c.value.challenged_score);

const scorePercent = (a, b) => {
  const total = a + b;
  return total === 0 ? 50 : Math.round((a / total) * 100);
};

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

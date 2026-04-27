<template>
  <div class="min-h-screen bg-background p-3 md:p-8 flex flex-col gap-4 md:gap-6 overflow-y-auto relative custom-scrollbar">
    <!-- Battlefield Background Effects -->
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <!-- Preset Background Images -->
        <div v-if="fight?.battlefield && presetImages[fight.battlefield]" class="absolute inset-0">
           <img :src="presetImages[fight.battlefield]" class="w-full h-full object-cover opacity-30" />
           <div class="absolute inset-0 bg-background/60 backdrop-blur-[1px]"></div>
           
           <!-- Overlay effects for specific presets -->
           <div v-if="fight.battlefield === 'Neon Gym'" class="absolute inset-0 opacity-20 bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-cyan-500/20 animate-pulse"></div>
           <div v-if="fight.battlefield === 'Dark Arena'" class="absolute inset-0 opacity-40 shadow-[inset_0_0_200px_rgba(255,0,0,0.2)]"></div>
        </div>
        
        <!-- Custom Background Image (URLs) -->
        <div v-if="fight?.battlefield && fight.battlefield.startsWith('http')" class="absolute inset-0">
           <img :src="fight.battlefield" class="w-full h-full object-cover opacity-30 mix-blend-overlay" />
           <div class="absolute inset-0 bg-background/60 backdrop-blur-[2px]"></div>
        </div>
    </div>

    <!-- Header: Health Bars & Timer -->
    <div v-if="fight" class="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-12">
      <!-- Player 1 HP -->
      <div class="space-y-2">
        <div class="flex justify-between items-end">
          <span class="text-[10px] font-black text-foreground uppercase tracking-widest italic">{{ fight.challenger_name }}</span>
          <span class="text-xs font-black text-foreground tabular-nums">{{ Math.ceil(fight.hp1) }} / {{ fight.max_hp }}</span>
        </div>
        <div class="h-6 bg-foreground/10 rounded-full border border-border overflow-hidden p-1">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="hpColor(fight.hp1, fight.max_hp)"
            :style="{ width: (fight.hp1 / fight.max_hp * 100) + '%' }"
          ></div>
        </div>
      </div>

      <!-- Center: Timer -->
      <div class="flex flex-col items-center gap-1 min-w-[80px]">
        <div class="w-16 h-16 rounded-2xl bg-surface border-2 border-primary-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <span class="text-2xl font-black italic text-foreground tabular-nums" :class="{ 'text-red-500 animate-pulse': timeLeft > 0 && timeLeft < 10 }">
            {{ timeLeft > 0 ? timeLeft : (fight?.time_limit || '--') }}
          </span>
        </div>
        <span class="text-[8px] font-black text-primary-500 uppercase tracking-[0.2em]">{{ i18n.t('pvp_seconds') }}</span>
      </div>

      <!-- Player 2 HP -->
      <div class="space-y-2 text-right">
        <div class="flex justify-between items-end">
          <span class="text-xs font-black text-foreground tabular-nums">{{ Math.ceil(fight.hp2) }} / {{ fight.max_hp }}</span>
          <span class="text-[10px] font-black text-foreground uppercase tracking-widest italic">{{ fight.challenged_name }}</span>
        </div>
        <div class="h-6 bg-foreground/10 rounded-full border border-border overflow-hidden p-1">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out ml-auto"
            :class="hpColor(fight.hp2, fight.max_hp)"
            :style="{ width: (fight.hp2 / fight.max_hp * 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Main Arena -->
    <div v-if="fight" class="relative z-10 flex-1 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-24 py-6 md:py-12">
      <div class="relative group" :class="{ 'opacity-50 grayscale scale-95': fight.hp1 <= 0 }">
        <div class="absolute -inset-4 bg-primary-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative w-32 h-32 xs:w-40 h-40 md:w-64 md:h-64 flex items-center justify-center">
            <img :src="fight.challenger_avatar" class="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-float" />
        </div>
        <div class="absolute -bottom-6 inset-x-0 text-center">
           <div class="px-4 py-1 bg-foreground/85 border border-border rounded-full text-[10px] font-black text-background uppercase italic tracking-widest inline-block">
              {{ fight.damage1 }} {{ i18n.t('pvp_total_dmg') }}
           </div>
        </div>
      </div>

      <!-- VS Emblem -->
      <div class="shrink-0 flex flex-col items-center gap-2 md:gap-4">
        <div class="w-14 h-14 md:w-20 md:h-20 rounded-full bg-surface border-2 md:border-4 border-border flex items-center justify-center shadow-2xl relative overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent"></div>
           <span class="text-3xl font-black italic text-primary-500 z-10">VS</span>
        </div>
        <div class="flex flex-col items-center">
           <span class="text-[8px] font-black text-muted uppercase tracking-[0.4em]">{{ fight.battlefield }}</span>
           <div class="flex items-center gap-2 mt-2">
              <div v-for="ex in allowedExercises" :key="ex" class="px-2 py-0.5 bg-foreground/[0.06] border border-border rounded text-[7px] font-bold text-muted uppercase">
                 {{ i18n.t(ex) }}
              </div>
           </div>
        </div>
      </div>

      <!-- Challenged Avatar Area -->
      <div class="relative group" :class="{ 'opacity-50 grayscale scale-95': fight.hp2 <= 0 }">
        <div class="absolute -inset-4 bg-primary-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative w-32 h-32 xs:w-40 h-40 md:w-64 md:h-64 flex items-center justify-center">
            <img :src="fight.challenged_avatar" class="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-float" style="animation-delay: -2s" />
        </div>
        <div class="absolute -bottom-6 inset-x-0 text-center">
           <div class="px-4 py-1 bg-foreground/85 border border-border rounded-full text-[10px] font-black text-background uppercase italic tracking-widest inline-block">
              {{ fight.damage2 }} {{ i18n.t('pvp_total_dmg') }}
           </div>
        </div>
      </div>
    </div>

    <!-- Controls Footer -->
    <div v-if="fight && isParticipant" class="relative z-10 w-full max-w-4xl mx-auto mt-auto mb-4 md:mb-8">
       <div v-if="fight.status === 'active'" class="space-y-6">
          <div class="flex overflow-x-auto no-scrollbar gap-3 pb-2">
             <button
               v-for="btn in quickButtons"
               :key="btn.label"
               @click="logSet(btn.exercise, btn.reps)"
               :disabled="logging || !isAllowed(btn.exercise)"
               class="shrink-0 px-6 py-4 bg-surface border border-border rounded-2xl flex flex-col items-center gap-1 transition-all hover:border-primary-500/50 hover:bg-primary-500/5 active:scale-95 disabled:opacity-30"
             >
                <span class="text-lg font-black text-foreground italic tracking-tighter">{{ btn.label }}</span>
                <span class="text-[8px] font-bold text-muted uppercase tracking-widest">{{ i18n.t(btn.exercise) }}</span>
             </button>
          </div>

          <div class="flex items-center gap-4">
             <div class="flex-1 flex gap-2">
                <select v-model="manualEx" class="bg-surface border border-border rounded-xl px-4 py-3 text-[10px] font-black text-foreground uppercase outline-none focus:border-primary-500/50">
                   <option v-for="ex in allowedExercises" :key="ex" :value="ex">{{ i18n.t(ex) }}</option>
                </select>
                <input
                  v-model="manualReps"
                  type="number"
                  placeholder="REPS"
                  class="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm font-black text-foreground outline-none focus:border-primary-500/50"
                />
             </div>
             <button
               @click="logSet(manualEx, manualReps)"
               :disabled="logging || !manualReps"
               class="px-10 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
             >
                {{ logging ? i18n.t('pvp_syncing') : i18n.t('pvp_log_reps') }}
             </button>

             <button
               @click="sendConfetti"
               :disabled="confettiCooldown > 0"
               class="p-3 bg-foreground/[0.06] border border-border rounded-xl hover:bg-foreground/10 transition-all text-foreground disabled:opacity-30"
             >
               <Zap class="w-5 h-5" :class="{ 'animate-bounce': confettiCooldown === 0 }" />
             </button>
          </div>
       </div>

       <div v-else-if="fight.status === 'pending' && isChallenged" class="bg-primary-500/10 border border-primary-500/30 rounded-[2rem] p-8 text-center space-y-6">
          <h2 class="text-2xl font-black text-foreground italic uppercase tracking-tighter">{{ i18n.t('pvp_request_received') }}</h2>
          <p class="text-sm text-muted">{{ i18n.t('pvp_request_desc') }}</p>
          <button @click="acceptChallenge" class="px-12 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.4em] shadow-xl shadow-primary-500/20 transition-all active:scale-95">
             {{ i18n.t('pvp_accept_challenge') }}
          </button>
       </div>

       <div v-else-if="fight.status === 'pending' && isChallenger" class="bg-foreground/[0.03] border border-border rounded-[2rem] p-6 md:p-8 text-center space-y-4">
          <Loader2 class="w-8 h-8 md:w-10 md:h-10 text-primary-500 animate-spin mx-auto" />
          <h2 class="text-lg md:text-xl font-black text-foreground italic uppercase tracking-tighter">{{ i18n.t('pvp_waiting') }}</h2>
          <p class="text-[9px] md:text-[10px] text-muted font-bold uppercase">{{ i18n.t('pvp_waiting_desc') }}</p>
          <button @click="router.push('/social')" class="mt-4 px-6 py-2 bg-foreground/[0.05] hover:bg-foreground/[0.1] text-muted rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
             SALIR DEL COMBATE
          </button>
       </div>
    </div>

    <!-- Winner Overlay -->
    <Transition name="fade">
      <div v-if="winner" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl">
        <div class="pvp-result-card p-12 text-center space-y-8 max-w-md w-full">
           <div class="relative inline-block">
              <Trophy class="w-20 h-20 text-amber-500 mx-auto drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
              <div class="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full"></div>
           </div>

           <div class="space-y-2">
              <h2 class="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em]">{{ i18n.t('pvp_winner_label') }}</h2>
              <h1 class="text-4xl font-black text-foreground uppercase italic tracking-tighter">{{ winner.name }}</h1>
           </div>

           <div class="grid grid-cols-2 gap-4 py-6 border-y border-border">
              <div class="text-center">
                 <p class="text-[8px] font-bold text-muted uppercase tracking-widest mb-1">{{ i18n.t('pvp_total_dmg') }}</p>
                 <p class="text-xl font-black text-foreground">{{ winnerDamage }}</p>
              </div>
              <div class="text-center">
                 <p class="text-[8px] font-bold text-muted uppercase tracking-widest mb-1">{{ i18n.t('pvp_hp_remaining') }}</p>
                 <p class="text-xl font-black text-foreground">{{ winnerHp }}</p>
              </div>
           </div>

           <button @click="router.push('/social')" class="w-full py-4 bg-foreground/[0.06] hover:bg-foreground/10 text-foreground border border-border rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all">
              {{ i18n.t('pvp_return') }}
           </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import { useNotificationStore } from '../stores/notification';
import { Loader2, Trophy, Zap } from 'lucide-vue-next';
import { useDamageStore } from '../stores/damage';
import { useSocketStore } from '../stores/socket';
import confetti from 'canvas-confetti';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();
const damageStore = useDamageStore();
const socketStore = useSocketStore();

const fightId = route.params.id;
const fight = ref(null);
const timeLeft = ref(0);

const presetImages = {
  'Default Reppy': '/images/pvp/default.webp',
  'Dark Arena': '/images/pvp/dark_arena.webp',
  'Neon Gym': '/images/pvp/neon_gym.webp',
  'Forest Temple': '/images/pvp/forest_temple.webp',
  'Steel Dungeon': '/images/pvp/steel_dungeon.webp'
};
const logging = ref(false);
const isFinishing = ref(false);
const manualEx = ref('pullups');
const manualReps = ref(null);
const winner = ref(null);
const winnerDamage = ref(0);
const winnerHp = ref(0);
const confettiCooldown = ref(0);

const quickButtons = [
  { exercise: 'pullups', reps: 5, label: '+5 Dominadas' },
  { exercise: 'pullups', reps: 10, label: '+10 Dominadas' },
  { exercise: 'pushups', reps: 10, label: '+10 Flexiones' },
  { exercise: 'pushups', reps: 20, label: '+20 Flexiones' },
  { exercise: 'dips', reps: 8, label: '+8 Fondos' },
  { exercise: 'dips', reps: 15, label: '+15 Fondos' }
];

let timerInterval = null;
const processedEventIds = new Set();

const isParticipant = computed(() => {
  if (!fight.value || !authStore.user) return false;
  return fight.value.challenger_id === authStore.user.id || fight.value.challenged_id === authStore.user.id;
});

const isChallenger = computed(() => fight.value?.challenger_id === authStore.user?.id);
const isChallenged = computed(() => fight.value?.challenged_id === authStore.user?.id);

const allowedExercises = computed(() => {
  try {
    return typeof fight.value?.allowed_exercises === 'string'
      ? JSON.parse(fight.value.allowed_exercises)
      : fight.value?.allowed_exercises || [];
  } catch (e) { return []; }
});

const isAllowed = (ex) => allowedExercises.value.includes(ex);

const hpColor = (hp, max) => {
  const pct = (hp / max) * 100;
  if (pct > 50) return 'bg-emerald-500';
  if (pct > 20) return 'bg-amber-500';
  return 'bg-red-500';
};

const fetchFight = async () => {
  try {
    const res = await axios.get(`/api/pvp/${fightId}`);
    fight.value = res.data;
    if (fight.value.status === 'active' && !timerInterval) {
        startTimer();
    }
    if (fight.value.status === 'completed' && !winner.value) {
        handleEnd(fight.value.winner_id);
    }
  } catch (e) {
    console.error('Error fetching fight:', e);
  }
};

const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    const start = new Date(fight.value.started_at);
    const limit = fight.value.time_limit;

    timerInterval = setInterval(() => {
        const elapsed = Math.floor((new Date() - start) / 1000);
        timeLeft.value = Math.max(0, limit - elapsed);

        if (timeLeft.value <= 0 && isParticipant.value && fight.value.status === 'active') {
            finishFight();
        }
    }, 1000);
};

// Socket event handling replaces pollEvents

const handleEvent = (ev) => {
    // Skip already-processed events (prevents floating numbers from replaying)
    if (processedEventIds.has(ev.id)) return;
    processedEventIds.add(ev.id);

    if (ev.type === 'set') {
        // Safely parse payload whether it's a string or already an object
        let payload = ev.payload;
        if (typeof payload === 'string') {
            try { payload = JSON.parse(payload); } catch (e) { payload = {}; }
        }
        payload = payload || {};

        if (ev.user_id === fight.value.challenger_id) {
            damageStore.addDamage(payload.damage, payload.exercise || 'pullups', 75, 40, payload.isCrit);
        } else {
            damageStore.addDamage(payload.damage, payload.exercise || 'pullups', 25, 40, payload.isCrit);
        }
        if (navigator.vibrate) navigator.vibrate(payload.isCrit ? 50 : 20);
    } else if (ev.type === 'confetti') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, useWorker: false, disableForReducedMotion: true });
    } else if (ev.type === 'finish') {
        // Safely extract winnerId whether payload is string or object
        let winnerId = ev.user_id;
        if (!winnerId && ev.payload) {
            const p = typeof ev.payload === 'string'
                ? JSON.parse(ev.payload)
                : ev.payload;
            winnerId = p?.winnerId;
        }
        handleEnd(winnerId);
    }
};

const logSet = async (exercise, reps) => {
  if (logging.value || timeLeft.value <= 0) return;
  logging.value = true;
  try {
    const res = await axios.post(`/api/pvp/${fightId}/log-set`, { exercise, reps: parseInt(reps) });
    // Optimistic local update — damage store called here, NOT again from pollEvents
    // (processedEventIds guards against double-counting on next poll)
    if (isChallenger.value) {
        fight.value.hp2 = Math.max(0, fight.value.hp2 - res.data.damage);
        fight.value.damage1 += res.data.damage;
        damageStore.addDamage(res.data.damage, exercise, 75, 40, res.data.isCrit);
    } else {
        fight.value.hp1 = Math.max(0, fight.value.hp1 - res.data.damage);
        fight.value.damage2 += res.data.damage;
        damageStore.addDamage(res.data.damage, exercise, 25, 40, res.data.isCrit);
    }
    manualReps.value = null;
    notificationStore.notify(`Combat Hit: ${res.data.damage} DMG`, 'success');
  } catch (e) {
    notificationStore.notify(e.response?.data?.message || 'Error logging reps', 'error');
  } finally {
    logging.value = false;
  }
};

const acceptChallenge = async () => {
    try {
        await axios.post(`/api/pvp/${fightId}/accept`);
        await fetchFight();
    } catch (e) {
        notificationStore.notify('Error starting combat', 'error');
    }
};

const sendConfetti = async () => {
    try {
        await axios.post(`/api/pvp/${fightId}/confetti`);
        confettiCooldown.value = 5;
        const cd = setInterval(() => {
            confettiCooldown.value--;
            if (confettiCooldown.value <= 0) clearInterval(cd);
        }, 1000);
    } catch (e) {}
};

const finishFight = async () => {
    if (!isChallenger.value || isFinishing.value || fight.value?.status !== 'active') return;
    isFinishing.value = true;
    try {
        await axios.post(`/api/pvp/${fightId}/finish`);
    } catch (e) {
        console.error('Error finishing fight:', e);
    }
};

const handleEnd = (winnerId) => {
    if (winner.value) return;
    if (winnerId === fight.value.challenger_id) {
        winner.value = { name: fight.value.challenger_name };
        winnerDamage.value = fight.value.damage1;
        winnerHp.value = Math.ceil(fight.value.hp1);
    } else if (winnerId === fight.value.challenged_id) {
        winner.value = { name: fight.value.challenged_name };
        winnerDamage.value = fight.value.damage2;
        winnerHp.value = Math.ceil(fight.value.hp2);
    } else {
        winner.value = { name: 'DRAW' };
    }

    confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, useWorker: false, disableForReducedMotion: true });
    if (timerInterval) clearInterval(timerInterval);
};

onMounted(() => {
  fetchFight();
  
  // Join socket room for this fight
  if (socketStore.socket) {
    socketStore.socket.emit('join_pvp', fightId);
    
    // Listen for real-time events
    socketStore.socket.on('pvp_event', (event) => {
      console.log('PvP Socket Event:', event);
      handleEvent(event);
      
      // Update fight state directly if data is provided
      if (event.type === 'set' && fight.value) {
        if (event.hp1 !== undefined) fight.value.hp1 = event.hp1;
        if (event.hp2 !== undefined) fight.value.hp2 = event.hp2;
        if (event.damage1 !== undefined) fight.value.damage1 = event.damage1;
        if (event.damage2 !== undefined) fight.value.damage2 = event.damage2;
      } else {
        // For other events (start, finish), refresh full state
        fetchFight();
      }
    });
  }

  watch(timeLeft, (newVal) => {
      if (newVal <= 0 && isParticipant.value && fight.value?.status === 'active' && !isFinishing.value) {
          finishFight();
      }
  });
});

onUnmounted(() => {
  if (socketStore.socket) {
    socketStore.socket.off('pvp_event');
  }
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
.animate-float {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.pvp-result-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 2.5rem;
  box-shadow: 0 0 100px rgba(59, 130, 246, 0.2);
}
</style>

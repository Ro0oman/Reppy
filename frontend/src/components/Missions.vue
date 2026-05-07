<template>
  <div class="min-h-screen p-4 md:p-8 pb-24">
    <div class="max-w-4xl mx-auto space-y-8">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="space-y-2">
          <h1 class="text-4xl font-black text-foreground italic uppercase tracking-tighter flex items-center gap-4">
            <Target class="w-10 h-10 text-primary-500" />
            {{ i18n.t('missions_title') }}
          </h1>
          <p class="text-xs font-bold text-muted uppercase tracking-[0.3em]">{{ i18n.t('missions_subtitle') }}</p>
        </div>

        <!-- Global Reset Timer -->
        <div v-if="nextReset" class="bg-foreground/[0.04] border border-border px-6 py-3 rounded-2xl flex items-center gap-4 backdrop-blur-xl">
          <div class="flex flex-col items-end">
            <span class="text-[8px] font-black text-muted uppercase tracking-widest">{{ i18n.t('missions_next_reset') || 'NEXT_RESET' }}</span>
            <span class="text-lg font-black text-primary-500 font-mono tracking-tighter">{{ countdown }}</span>
          </div>
          <Clock class="w-5 h-5 text-primary-500 animate-pulse" />
        </div>
      </div>

      <!-- Missions List -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 class="w-10 h-10 text-primary-500 animate-spin" />
        <span class="text-[10px] font-black text-muted uppercase tracking-widest">LOADING_OPERATIVES...</span>
      </div>

      <div v-else class="grid gap-4">
        <div 
          v-for="mission in missions" 
          :key="mission.id"
          :id="`mission-${mission.id}`"
          class="mission-card group relative overflow-hidden bg-foreground/[0.02] border border-border rounded-[2rem] p-6 transition-all hover:border-primary-500/30 hover:bg-foreground/[0.04] backdrop-blur-sm"
          :class="{
            'opacity-60': mission.is_claimed,
            'ring-2 ring-primary-500/50 shadow-2xl shadow-primary-500/20': highlightedMissionId === mission.id
          }"
        >
          <!-- Background Glow -->
          <div v-if="mission.is_completed && !mission.is_claimed" class="absolute -inset-2 bg-primary-500/5 blur-2xl rounded-full"></div>

          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div class="flex items-start gap-5 flex-1">
              <!-- Type Icon -->
              <div 
                class="p-4 rounded-2xl border transition-all"
                :class="[
                  mission.is_completed && !mission.is_claimed ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20' : 'bg-foreground/5 border-border text-muted',
                  mission.is_claimed ? 'grayscale opacity-50' : ''
                ]"
              >
                <component :is="getIcon(mission.goal_type)" class="w-6 h-6" />
              </div>

              <!-- Content -->
              <div class="space-y-1.5 flex-1">
                <div class="flex items-center gap-3">
                  <span v-if="mission.is_daily" class="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[8px] font-black text-indigo-400 uppercase tracking-widest">DAILY</span>
                  <span v-else class="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] font-black text-amber-400 uppercase tracking-widest">SPECIAL</span>
                  <h3 class="text-sm font-black text-foreground uppercase italic tracking-tight">{{ i18n.t(mission.title_key) }}</h3>
                </div>
                <p class="text-xs text-muted leading-relaxed max-w-md">{{ i18n.t(mission.description_key) }}</p>
                <p class="text-[10px] font-semibold text-primary-400/80 leading-relaxed max-w-md">
                  {{ i18n.locale === 'es' ? 'Como completarla: ' : 'How to complete: ' }}{{ getHowToComplete(mission.goal_type) }}
                </p>
                
                <!-- Progress Bar -->
                <div class="space-y-2">
                  <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                    <span class="text-muted">{{ mission.current_value }} / {{ mission.goal_value }} {{ getGoalLabel(mission.goal_type) }}</span>
                    <span :class="mission.is_completed ? 'text-emerald-500' : 'text-primary-500'">{{ Math.round((mission.current_value / mission.goal_value) * 100) }}%</span>
                  </div>
                  <div class="h-2 bg-foreground/10 rounded-full overflow-hidden p-0.5 border border-border/10">
                    <div 
                      class="h-full rounded-full transition-all duration-1000 ease-out"
                      :class="mission.is_completed ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-primary-500'"
                      :style="{ width: Math.min(100, (mission.current_value / mission.goal_value) * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rewards & Action -->
            <div class="flex md:flex-col items-center md:items-end gap-4 shrink-0">
              <div class="flex items-center gap-3 bg-foreground/5 px-4 py-2 rounded-xl border border-border">
                <div v-if="mission.reward_coins > 0" class="flex items-center gap-1.5">
                  <Coins class="w-3.5 h-3.5 text-primary-500" />
                  <span class="text-xs font-black text-foreground">{{ mission.reward_coins }}</span>
                </div>
                <div v-if="mission.reward_gems > 0" class="flex items-center gap-1.5">
                  <Gem class="w-3.5 h-3.5 text-indigo-400" />
                  <span class="text-xs font-black text-foreground">{{ mission.reward_gems }}</span>
                </div>
                <div v-if="mission.reward_xp > 0" class="flex items-center gap-1.5">
                  <Star class="w-3.5 h-3.5 text-amber-500" />
                  <span class="text-xs font-black text-foreground">{{ mission.reward_xp }} XP</span>
                </div>
              </div>

              <button 
                v-if="!mission.is_claimed"
                @click="claimReward(mission)"
                :disabled="!mission.is_completed || claimingId === mission.id"
                class="flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                :class="mission.is_completed ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-foreground/5 text-muted border border-border'"
              >
                <span v-if="claimingId === mission.id" class="flex items-center gap-2">
                  <Loader2 class="w-3 h-3 animate-spin" />
                  {{ i18n.t('missions_claiming') }}
                </span>
                <span v-else>{{ mission.is_completed ? i18n.t('missions_claim_btn') : i18n.t('missions_in_progress') }}</span>
              </button>
              
              <div v-else class="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 class="w-4 h-4 text-emerald-500" />
                <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{{ i18n.t('missions_claimed') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Daily State -->
        <div v-if="!missions.some(m => m.is_daily)" class="bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] p-10 text-center space-y-4">
          <div class="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 class="w-8 h-8 text-indigo-400" />
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-black text-foreground uppercase italic tracking-tight">{{ i18n.t('missions_daily_done_title') || 'OPERATIVAS DIARIAS COMPLETADAS' }}</h3>
            <p class="text-xs text-muted font-bold uppercase tracking-widest">{{ i18n.t('missions_daily_done_subtitle') || 'Vuelve mañana para nuevos objetivos' }}</p>
          </div>
          <div class="inline-flex items-center gap-3 bg-foreground/5 px-6 py-3 rounded-xl border border-border">
             <Clock class="w-4 h-4 text-indigo-400" />
             <span class="text-xl font-black text-indigo-400 font-mono tracking-tighter">{{ countdown }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import axios from 'axios';
import { Target, Loader2, Coins, Gem, Star, Trophy, Zap, Swords, CheckCircle2, BicepsFlexed, Clock } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { useRoute } from 'vue-router';

const i18n = useI18nStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const route = useRoute();

const missions = ref([]);
const loading = ref(true);
const claimingId = ref(null);
const nextReset = ref(null);
const countdown = ref('--:--:--');
const highlightedMissionId = ref(null);
let timerInterval = null;

const fetchMissions = async () => {
  try {
    const res = await axios.get('/api/missions');
    missions.value = res.data.missions;
    nextReset.value = new Date(res.data.next_reset);
    updateCountdown();
    await focusMissionFromRoute();
  } catch (err) {
    console.error('Error fetching missions:', err);
  } finally {
    loading.value = false;
  }
};

const focusMissionFromRoute = async () => {
  const missionIdParam = route.query?.missionId;
  const missionId = Number.parseInt(missionIdParam, 10);
  if (!Number.isFinite(missionId)) return;

  const target = missions.value.find(m => Number(m.id) === missionId);
  if (!target) return;

  await nextTick();
  highlightedMissionId.value = missionId;
  const el = document.getElementById(`mission-${missionId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  setTimeout(() => {
    if (highlightedMissionId.value === missionId) highlightedMissionId.value = null;
  }, 2500);
};

const updateCountdown = () => {
  if (!nextReset.value) return;
  const now = new Date();
  const diff = nextReset.value - now;
  
  if (diff <= 0) {
    countdown.value = '00:00:00';
    // Optionally refresh missions when countdown hits zero
    if (diff > -5000) fetchMissions(); 
    return;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdown.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getGoalLabel = (type) => {
  switch (type) {
    case 'reps': return 'Reps';
    case 'damage': return 'Daño';
    case 'streak': return 'Días';
    case 'xp_str': return 'XP Fuerza';
    case 'xp_pwr': return 'XP Potencia';
    case 'xp_end': return 'XP Resistencia';
    case 'xp_agi': return 'XP Agilidad';
    case 'social_likes': return 'Likes';
    case 'buy_any': return 'Compras';
    case 'use_consumable': return 'Pociones';
    default: return type.toUpperCase();
  }
};

const getIcon = (type) => {
  switch (type) {
    case 'reps': return Zap;
    case 'damage': return Swords;
    case 'streak': return Trophy;
    case 'xp_str': return BicepsFlexed;
    case 'xp_pwr': return Zap;
    case 'xp_end': return Target;
    case 'xp_agi': return Swords;
    default: return Target;
  }
};

const getHowToComplete = (type) => {
  const es = {
    reps: 'haz repeticiones en Registrar.',
    damage: 'registra reps para hacer dano al boss.',
    streak: 'entrena hoy para mantener la racha.',
    xp_str: 'acumula volumen/reps con carga para subir XP de Fuerza.',
    xp_pwr: 'haz muscle-ups o dominadas lastradas para subir XP de Potencia.',
    xp_end: 'acumula reps totales para subir XP de Resistencia.',
    xp_agi: 'trabaja ejercicios tecnicos/explosivos para subir XP de Agilidad.',
    social_likes: 've a Social y da likes.',
    buy_any: 'compra un item en Tienda.',
    use_consumable: 'usa una pocion/consumible desde Inventario.',
    night_owl: 'registra reps despues de las 22:00.',
    personal_record: 'supera tu mejor marca diaria de reps.'
  };

  const en = {
    reps: 'do reps in Register.',
    damage: 'log reps to deal boss damage.',
    streak: 'train today to keep your streak.',
    xp_str: 'build volume/weighted work to raise Strength XP.',
    xp_pwr: 'do muscle-ups or weighted pull-ups to raise Power XP.',
    xp_end: 'accumulate total reps to raise Endurance XP.',
    xp_agi: 'do technical/explosive work to raise Agility XP.',
    social_likes: 'go to Social and like posts.',
    buy_any: 'buy an item in Shop.',
    use_consumable: 'use a potion/consumable from Inventory.',
    night_owl: 'log reps after 22:00.',
    personal_record: 'beat your daily reps record.'
  };

  return i18n.locale === 'es'
    ? (es[type] || 'completa la accion indicada.')
    : (en[type] || 'complete the required action.');
};

const claimReward = async (mission) => {
  if (claimingId.value) return;
  claimingId.value = mission.id;
  try {
    const res = await axios.post(`/api/missions/claim/${mission.id}`);
    notificationStore.notify(`REWARD CLAIMED: +${res.data.reward_coins} Coins, +${res.data.reward_gems} Gems`, 'success');
    
    // Update local state
    mission.is_claimed = true;
    
    // Update user state in store
    if (authStore.user) {
      authStore.user.reppy_coins += res.data.reward_coins;
      authStore.user.reppy_gems += res.data.reward_gems;
    }
  } catch (err) {
    notificationStore.notify(err.response?.data?.message || 'Error claiming reward', 'error');
  } finally {
    claimingId.value = null;
  }
};

onMounted(async () => {
  loading.value = true;
  await fetchMissions();
  timerInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>

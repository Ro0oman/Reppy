<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

    <!-- Header + New Challenge button -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-black uppercase italic tracking-tight text-foreground">{{ i18n.locale === 'es' ? 'Retos 24h' : '24h Challenges' }}</h2>
        <p class="text-[10px] text-muted uppercase tracking-widest mt-0.5">{{ i18n.locale === 'es' ? 'Acumula más que tu rival en 24 horas' : 'Out-grind your rival in 24 hours' }}</p>
      </div>
      <button
        @click="showNewModal = true"
        class="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary-500/20"
      >
        <Plus class="w-3.5 h-3.5" />
        {{ i18n.locale === 'es' ? 'Nuevo reto' : 'New challenge' }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-16 flex flex-col items-center gap-4">
      <div class="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 animate-spin rounded-full"></div>
      <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18n.locale === 'es' ? 'Cargando retos...' : 'Loading challenges...' }}</p>
    </div>

    <template v-else>
      <!-- Pending (waiting for me to accept) -->
      <section v-if="pending.length" class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
          <h3 class="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">{{ i18n.locale === 'es' ? 'Retos recibidos' : 'Incoming challenges' }}</h3>
          <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-[8px] font-black text-amber-500 border border-amber-500/30">{{ pending.length }}</span>
        </div>
        <div v-for="c in pending" :key="c.id" class="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Swords class="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p class="text-sm font-black text-foreground uppercase italic tracking-tight">{{ c.challenger_name }}</p>
              <p class="text-[10px] text-muted uppercase tracking-widest mt-0.5">{{ goalLabel(c) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="declineChallenge(c.id)" :disabled="acting === c.id" class="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border text-muted hover:border-red-500/30 hover:text-red-400 transition-all active:scale-95 disabled:opacity-40">
              {{ i18n.locale === 'es' ? 'Rechazar' : 'Decline' }}
            </button>
            <button @click="acceptChallenge(c.id)" :disabled="acting === c.id" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-black transition-all active:scale-95 shadow-lg shadow-amber-500/20 disabled:opacity-40">
              {{ i18n.locale === 'es' ? 'Aceptar' : 'Accept' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Active -->
      <section v-if="active.length" class="space-y-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
          <h3 class="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">{{ i18n.locale === 'es' ? 'En curso' : 'Active' }}</h3>
        </div>
        <div v-for="c in active" :key="c.id" class="bg-primary-500/5 border border-primary-500/20 rounded-2xl p-5 space-y-4">
          <!-- VS header -->
          <div class="flex items-center justify-between">
            <div class="text-center">
              <p class="text-[10px] font-black text-muted uppercase tracking-widest">{{ myName(c) }}</p>
              <p class="text-3xl font-black text-foreground italic tracking-tighter">{{ myScore(c) }}</p>
            </div>
            <div class="flex flex-col items-center gap-1">
              <Swords class="w-5 h-5 text-primary-500" />
              <span class="text-[8px] font-black text-muted uppercase tracking-widest">{{ goalLabel(c) }}</span>
              <span class="text-[10px] font-black text-primary-500 font-mono">{{ countdown(c.expires_at) }}</span>
            </div>
            <div class="text-center">
              <p class="text-[10px] font-black text-muted uppercase tracking-widest">{{ opponentName(c) }}</p>
              <p class="text-3xl font-black text-foreground italic tracking-tighter">{{ opponentScore(c) }}</p>
            </div>
          </div>
          <!-- Progress bars -->
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <div class="h-2 flex-1 bg-foreground/10 rounded-full overflow-hidden">
                <div class="h-full bg-primary-500 rounded-full transition-all duration-700" :style="{ width: scorePercent(myScore(c), opponentScore(c)) + '%' }"></div>
              </div>
              <div class="h-2 flex-1 bg-foreground/10 rounded-full overflow-hidden rotate-180">
                <div class="h-full bg-amber-500 rounded-full transition-all duration-700" :style="{ width: scorePercent(opponentScore(c), myScore(c)) + '%' }"></div>
              </div>
            </div>
          </div>
          <p class="text-[10px] text-center text-muted">
            {{ i18n.locale === 'es' ? `+${c.reward_coins} RC al ganador` : `+${c.reward_coins} RC to winner` }}
          </p>
        </div>
      </section>

      <!-- Finished -->
      <section v-if="finished.length" class="space-y-3">
        <h3 class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18n.locale === 'es' ? 'Historial' : 'History' }}</h3>
        <div v-for="c in finished" :key="c.id" class="bg-foreground/[0.02] border border-border rounded-2xl p-4 flex items-center justify-between gap-4 opacity-70">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              :class="isWinner(c) ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-foreground/10 border border-border'">
              <Trophy v-if="isWinner(c)" class="w-4 h-4 text-emerald-500" />
              <X v-else class="w-4 h-4 text-muted" />
            </div>
            <div>
              <p class="text-xs font-black text-foreground uppercase italic">{{ opponentName(c) }}</p>
              <p class="text-[10px] text-muted">{{ myScore(c) }} – {{ opponentScore(c) }} · {{ goalLabel(c) }}</p>
            </div>
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest"
            :class="isWinner(c) ? 'text-emerald-500' : c.winner_id ? 'text-muted' : 'text-amber-400'">
            {{ isWinner(c) ? (i18n.locale === 'es' ? 'Ganado' : 'Won') : c.winner_id ? (i18n.locale === 'es' ? 'Perdido' : 'Lost') : (i18n.locale === 'es' ? 'Empate' : 'Tie') }}
          </span>
        </div>
      </section>

      <!-- Empty state -->
      <div v-if="!pending.length && !active.length && !finished.length" class="py-16 flex flex-col items-center gap-4 text-center">
        <div class="w-16 h-16 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center">
          <Swords class="w-7 h-7 text-muted/40" />
        </div>
        <div>
          <p class="text-sm font-black text-foreground uppercase italic">{{ i18n.locale === 'es' ? 'Sin retos activos' : 'No active challenges' }}</p>
          <p class="text-[10px] text-muted mt-1">{{ i18n.locale === 'es' ? 'Reta a alguien y demuestra quién entrena más' : 'Challenge someone and prove who trains harder' }}</p>
        </div>
        <button @click="showNewModal = true" class="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-primary-600 active:scale-95">
          {{ i18n.locale === 'es' ? 'Crear primer reto' : 'Create first challenge' }}
        </button>
      </div>
    </template>

    <!-- New Challenge Modal -->
    <Teleport to="body">
      <div v-if="showNewModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showNewModal = false">
        <div class="w-full max-w-md bg-surface border border-border rounded-3xl p-6 space-y-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-black text-foreground uppercase italic tracking-tight">{{ i18n.locale === 'es' ? 'Nuevo reto 24h' : 'New 24h challenge' }}</h3>
            <button @click="showNewModal = false" class="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-foreground transition-colors">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Opponent search -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18n.locale === 'es' ? 'Rival' : 'Opponent' }}</label>
            <input
              v-model="search"
              @input="searchUsers"
              type="text"
              :placeholder="i18n.locale === 'es' ? 'Buscar jugador...' : 'Search player...'"
              class="w-full bg-foreground/[0.04] border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary-500/50 transition-colors"
            />
            <div v-if="searchResults.length" class="border border-border rounded-xl overflow-hidden divide-y divide-border">
              <button
                v-for="u in searchResults"
                :key="u.id"
                @click="selectOpponent(u)"
                class="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/[0.04] transition-colors text-left"
                :class="form.challengedId === u.id ? 'bg-primary-500/10 border-l-2 border-primary-500' : ''"
              >
                <img v-if="u.avatar_url" :src="u.avatar_url" class="w-8 h-8 rounded-full object-cover" />
                <div v-else class="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-black text-muted">{{ u.name[0] }}</div>
                <span class="text-sm font-semibold text-foreground">{{ u.name }}</span>
              </button>
            </div>
            <p v-if="form.opponentName" class="text-xs text-primary-400 font-semibold">
              ✓ {{ form.opponentName }}
            </p>
          </div>

          <!-- Goal type -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18n.locale === 'es' ? 'Objetivo' : 'Goal type' }}</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="gt in goalTypes"
                :key="gt.value"
                @click="form.goalType = gt.value"
                class="px-3 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all"
                :class="form.goalType === gt.value ? 'bg-primary-500/20 border-primary-500/50 text-primary-400' : 'border-border text-muted hover:border-border/80 hover:text-foreground'"
              >
                {{ gt.label }}
              </button>
            </div>
          </div>

          <!-- Goal value -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-muted uppercase tracking-widest flex items-center justify-between">
              <span>{{ i18n.locale === 'es' ? 'Meta' : 'Target' }}
              <span class="text-primary-500 ml-1">{{ form.goalValue }} {{ goalUnitLabel }}</span></span>
              <span class="text-amber-400">🏆 {{ previewReward }} RC al ganador</span>
            </label>
            <input
              v-model.number="form.goalValue"
              type="range"
              :min="goalMin"
              :max="goalMax"
              :step="goalStep"
              class="w-full accent-primary-500"
            />
            <div class="flex justify-between text-[10px] text-muted">
              <span>{{ goalMin }}</span>
              <span>{{ goalMax }}</span>
            </div>
          </div>

          <button
            @click="createChallenge"
            :disabled="!form.challengedId || creating"
            class="w-full py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary-500/20"
          >
            {{ creating ? (i18n.locale === 'es' ? 'Enviando...' : 'Sending...') : (i18n.locale === 'es' ? 'Enviar reto' : 'Send challenge') }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Swords, Plus, Trophy, X } from 'lucide-vue-next';
import axios from 'axios';
import { useI18nStore } from '@/stores/i18n';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';

const i18n = useI18nStore();
const authStore = useAuthStore();
const notifStore = useNotificationStore();

const challenges = ref([]);
const loading = ref(true);
const acting = ref(null);
const showNewModal = ref(false);
const creating = ref(false);
const search = ref('');
const searchResults = ref([]);
let searchTimer = null;

const form = ref({ challengedId: null, opponentName: '', goalType: 'reps', goalValue: 100 });

const goalTypes = computed(() => [
  { value: 'reps', label: i18n.locale === 'es' ? 'Reps totales' : 'Total reps' },
  { value: 'damage', label: i18n.locale === 'es' ? 'Daño al boss' : 'Boss damage' },
]);

const goalUnitLabel = computed(() => form.value.goalType === 'damage'
  ? (i18n.locale === 'es' ? 'daño' : 'dmg')
  : 'reps');

const calcReward = (goalType, goalValue) => {
  if (goalType === 'reps')   return Math.min(300, Math.max(25, Math.round(goalValue * 0.25)));
  if (goalType === 'damage') return Math.min(300, Math.max(25, Math.round(goalValue / 100)));
  return 75;
};
const previewReward = computed(() => calcReward(form.value.goalType, form.value.goalValue));
const goalMin = computed(() => form.value.goalType === 'damage' ? 500 : 50);
const goalMax = computed(() => form.value.goalType === 'damage' ? 50000 : 1000);
const goalStep = computed(() => form.value.goalType === 'damage' ? 500 : 50);

const goalLabel = (c) => {
  const labels = { reps: 'Reps', damage: i18n.locale === 'es' ? 'Daño' : 'Damage' };
  return labels[c.goal_type] || c.goal_type;
};

const userId = computed(() => authStore.user?.id);
const myScore = (c) => c.challenger_id === userId.value ? c.challenger_score : c.challenged_score;
const opponentScore = (c) => c.challenger_id === userId.value ? c.challenged_score : c.challenger_score;
const myName = (c) => c.challenger_id === userId.value ? c.challenger_name : c.challenged_name;
const opponentName = (c) => c.challenger_id === userId.value ? c.challenged_name : c.challenger_name;
const isWinner = (c) => c.winner_id === userId.value;

const scorePercent = (mine, theirs) => {
  const total = mine + theirs;
  if (total === 0) return 50;
  return Math.round((mine / total) * 100);
};

const pending = computed(() => challenges.value.filter(c => c.status === 'pending' && c.challenged_id === userId.value));
const active = computed(() => challenges.value.filter(c => c.status === 'active'));
const finished = computed(() => challenges.value.filter(c => ['finished', 'declined'].includes(c.status)));

const countdown = (expiresAt) => {
  if (!expiresAt) return '--:--:--';
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return '00:00:00';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

let tickInterval = null;
const tick = ref(0);
onMounted(() => { tickInterval = setInterval(() => tick.value++, 1000); });
onUnmounted(() => clearInterval(tickInterval));

const fetchChallenges = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get('/api/challenges');
    challenges.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const acceptChallenge = async (id) => {
  acting.value = id;
  try {
    await axios.post(`/api/challenges/${id}/accept`);
    notifStore.notify(i18n.locale === 'es' ? '¡Reto aceptado! Tienes 24h.' : 'Challenge accepted! You have 24h.', 'success');
    await fetchChallenges();
  } catch (e) {
    notifStore.notify(e.response?.data?.message || 'Error', 'error');
  } finally {
    acting.value = null;
  }
};

const declineChallenge = async (id) => {
  acting.value = id;
  try {
    await axios.post(`/api/challenges/${id}/decline`);
    await fetchChallenges();
  } catch (e) {
    notifStore.notify(e.response?.data?.message || 'Error', 'error');
  } finally {
    acting.value = null;
  }
};

const searchUsers = () => {
  clearTimeout(searchTimer);
  if (search.value.length < 2) { searchResults.value = []; return; }
  searchTimer = setTimeout(async () => {
    try {
      const { data } = await axios.get(`/api/social/search?q=${encodeURIComponent(search.value)}`);
      searchResults.value = data.filter(u => u.id !== userId.value).slice(0, 5);
    } catch {}
  }, 300);
};

const selectOpponent = (u) => {
  form.value.challengedId = u.id;
  form.value.opponentName = u.name;
  search.value = u.name;
  searchResults.value = [];
};

const createChallenge = async () => {
  if (!form.value.challengedId) return;
  creating.value = true;
  try {
    await axios.post('/api/challenges', {
      challengedId: form.value.challengedId,
      goalType: form.value.goalType,
      goalValue: form.value.goalValue,
    });
    notifStore.notify(i18n.locale === 'es' ? 'Reto enviado ⚔️' : 'Challenge sent ⚔️', 'success');
    showNewModal.value = false;
    form.value = { challengedId: null, opponentName: '', goalType: 'reps', goalValue: 100 };
    search.value = '';
    await fetchChallenges();
  } catch (e) {
    notifStore.notify(e.response?.data?.message || 'Error', 'error');
  } finally {
    creating.value = false;
  }
};

onMounted(fetchChallenges);
</script>

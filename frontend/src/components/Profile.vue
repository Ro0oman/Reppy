<template>
  <div class="max-w-5xl mx-auto px-4 py-12 space-y-12 animate-in relative z-10">
    <div v-if="loading" class="flex flex-col items-center justify-center py-32">
      <div class="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em] mt-8">DECRYPTING PROFILE...</p>
    </div>
    
    <template v-else>
      <!-- Profile Header Showcase (The Command Center) -->
      <div class="card-stats p-8 md:p-12 relative flex flex-col md:flex-row items-center md:items-start gap-10 text-center md:text-left border-border group">
        <!-- Background Power Detail -->
        <div class="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-primary-500/10 transition-colors duration-1000"></div>

        <!-- Avatar Core -->
        <div class="relative group/avatar">
          <AvatarFrame :src="user.avatar_url" :border-css="user.border_css" :avatar-css="user.avatar_css" :size="160" />
          <div v-if="isOwnProfile" @click="triggerAvatarUpload" class="absolute -bottom-2 -right-2 p-4 bg-primary-500 rounded-2xl cursor-pointer hover:bg-primary-600 shadow-[0_0_20px_rgba(255,69,0,0.3)] text-white z-10 transition-all">
            <Camera class="w-5 h-5" />
            <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/jpeg, image/png, image/webp" class="hidden" />
          </div>
        </div>

        <!-- Identity & Status -->
        <div class="flex-1 space-y-6">
          <div class="space-y-1">
            <h2 class="text-4xl md:text-5xl font-black text-industrial tracking-tighter text-foreground uppercase italic" :class="user.title_css">
              {{ user.name }}
            </h2>
            <div class="flex items-center justify-center md:justify-start gap-3">
              <span class="w-2 h-2 rounded-full bg-neon-lime animate-pulse"></span>
              <p class="text-xs font-black text-muted uppercase tracking-[0.25em] font-tight">{{ user.title_name || 'RECRUIT' }}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div class="flex items-center gap-3 bg-surface/5 px-5 py-3 rounded-xl border border-border group/coins">
              <Coins class="w-4 h-4 text-primary-500 transition-transform" />
              <div class="flex items-baseline gap-1.5">
                <span class="text-2xl font-black text-precision text-foreground leading-none">{{ user.reppy_coins || 0 }}</span>
                <span class="text-[8px] font-black text-muted uppercase tracking-widest">COINS</span>
              </div>
            </div>

            <!-- Global Character Level Display -->
            <div class="flex items-center gap-4 bg-primary-500/5 px-6 py-3 rounded-2xl border border-primary-500/20 group/level shadow-lg shadow-primary-500/5">
              <div class="flex flex-col">
                <div class="flex items-baseline gap-2">
                  <span class="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">CHARACTER_LEVEL</span>
                  <span class="text-3xl font-black text-foreground italic leading-none font-industrial">{{ user.current_level || 1 }}</span>
                </div>
                <!-- XP Needed Info -->
                <div class="flex items-center gap-2 mt-1">
                  <div class="h-1 w-24 bg-surface rounded-full overflow-hidden border border-white/5">
                    <div class="h-full bg-primary-500 transition-all duration-1000" :style="{ width: `${ ( (user.total_xp || 0) % 1000 / 1000 ) * 100 }%` }"></div>
                  </div>
                  <span class="text-[8px] font-black text-muted uppercase tracking-tighter">
                    {{ 1000 - ((user.total_xp || 0) % 1000) }} XP TO NEXT LVL
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col items-center md:items-start md:border-l md:border-border md:pl-6 p-2 md:p-0">
              <p class="text-[9px] font-black text-neon-lime uppercase tracking-[0.2em] mb-1 italic animate-pulse">🎁 REWARD PROTOCOL ACTIVE</p>
              <p class="text-[8px] font-bold text-muted uppercase tracking-widest leading-relaxed max-w-[240px] text-center md:text-left">Cada subida de nivel otorga 1 cofre de temporada de regalo</p>
            </div>
            
            <button @click="showInfoModal = true" 
                   title="Evolution Protocol Guide"
                   class="flex items-center gap-3 bg-surface/5 px-5 py-3 rounded-xl border border-border hover:border-primary-500/30 transition-all text-muted hover:text-foreground uppercase text-[8px] font-black tracking-widest">
              <HelpCircle class="w-4 h-4" />
              CODEX INFO
            </button>
          </div>
          
          <!-- RPG Metrics (The Attributes Grid) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mt-8">
            <div v-for="attr in attributes" :key="attr.key" 
                 class="p-4 rounded-xl border border-border bg-surface/20 group/attr transition-all"
                 :class="getAttrColor(attr.lvl)">
              <p class="text-[9px] font-black uppercase tracking-[0.2em] mb-2 font-tight" :class="attr.labelColor">{{ attr.key }}</p>
              <div class="flex flex-col leading-none">
                <span class="text-2xl font-black text-precision text-foreground">LVL {{ attr.lvl }}</span>
                <span class="text-[8px] font-bold text-muted mt-1 tabular-nums">{{ attr.xp }} XP</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Emergency Exit (Logout) -->
        <div v-if="isOwnProfile" class="md:absolute top-8 right-8">
          <button @click="authStore.logout()" 
                  title="Abandono de puesto / Log Out"
                  class="p-4 bg-red-500/5 text-red-500/60 hover:bg-red-500 hover:text-white border border-red-500/10 rounded-2xl transition-all group/logout">
            <LogOut class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <!-- Performance Stream -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Analytics Deck -->
        <div class="md:col-span-1 space-y-6">
           <div class="card-stats border-white/5 h-full space-y-8">
              <div class="flex items-center gap-3">
                <Activity class="w-5 h-5 text-primary-500" />
                <h3 class="text-sm font-black text-industrial text-foreground tracking-widest uppercase">STATISTICS</h3>
              </div>
              
              <div class="space-y-6">
                <!-- Total Reps Pill -->
                <div class="group/stat">
                   <p class="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Total Effort</p>
                   <div class="flex items-baseline gap-2">
                      <span class="text-4xl font-black text-precision text-foreground tracking-tighter">{{ stats.totalReps || 0 }}</span>
                      <span class="text-[10px] font-black text-primary-500 uppercase tracking-widest">REPS</span>
                   </div>
                </div>

                <!-- Total Volume Pill -->
                <div class="group/stat">
                   <p class="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Tonnage Moved</p>
                   <div class="flex items-baseline gap-2">
                      <span class="text-4xl font-black text-precision text-red-500 tracking-tighter">{{ (stats.totalVolume / 1000).toFixed(1) }}</span>
                      <span class="text-[10px] font-black text-muted uppercase tracking-widest">TONS</span>
                   </div>
                </div>
 
                <!-- Streak Pill -->
                <div class="group/stat">
                   <p class="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Consistency Streak</p>
                   <div class="flex items-center gap-3">
                      <span class="text-4xl font-black text-precision text-orange-500 tracking-tighter">{{ stats.streak || 0 }}</span>
                      <Flame class="w-6 h-6 text-orange-500 animate-pulse" />
                   </div>
                </div>
 
                <!-- Goal Pill -->
                <div class="group/stat">
                   <p class="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Protocol Goal</p>
                   <div class="flex items-baseline gap-2">
                      <span class="text-4xl font-black text-precision text-neon-lime tracking-tighter">{{ user.daily_goal || 0 }}</span>
                      <span class="text-[10px] font-black text-muted uppercase tracking-widest">PER DAY</span>
                   </div>
                </div>
              </div>
           </div>
        </div>

        <!-- Heatmap Deck -->
        <div class="md:col-span-2 space-y-6">
           <!-- Exercise Protocol Selector -->
           <ExerciseSelector v-model="activeExercise" class="w-full" />

           <div class="card-stats border-white/5 space-y-6 h-full flex flex-col justify-center">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-[10px] font-black text-muted tracking-[0.3em] uppercase">DISTRIBUTION HEATMAP</h3>
                <span class="text-[10px] font-black text-neon-lime tabular-nums uppercase tracking-widest">Active 365 Days</span>
              </div>
              <Heatmap :data="heatmapData" class="flex-1 min-h-[180px]" />
           </div>
        </div>
      </div>

      <!-- Protocol Mastery Breakdown (#55 Additional) -->
      <div class="card-stats border-border space-y-8 bg-gradient-to-br from-surface/20 to-surface/5">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
            <Trophy class="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h3 class="text-xl font-black text-industrial text-foreground tracking-tight uppercase">{{ i18nStore.t('protocol_mastery') }}</h3>
            <p class="text-[9px] font-black text-muted uppercase tracking-[0.3em] font-tight">{{ i18nStore.t('protocol_mastery_desc') }}</p>
          </div>
        </div>

        <div v-if="stats.breakdown?.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="item in stats.breakdown" :key="item.type"
               class="p-5 bg-black/20 border border-white/5 rounded-3xl group hover:border-primary-500/30 transition-all duration-500 relative overflow-hidden">
            <!-- Background Icon Hint -->
            <component :is="getIconForType(item.type)" class="absolute -right-2 -bottom-2 w-12 h-12 text-foreground/[0.03] -rotate-12 transition-transform group-hover:scale-125" />
            
            <div class="relative z-10 space-y-3">
              <div class="flex items-center gap-2">
                <component :is="getIconForType(item.type)" class="w-3.5 h-3.5 text-primary-500/60" />
                <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18nStore.t(item.type) }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-3xl font-black text-foreground italic tabular-nums group-hover:text-primary-500 transition-colors">{{ item.count }}</span>
                <span class="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">{{ i18nStore.t('stats_total') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial de Monedas (Transaction Log) -->
      <div class="card-stats border-border space-y-8 bg-gradient-to-br from-surface/20 to-surface/5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
              <Coins class="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h3 class="text-xl font-black text-industrial text-foreground tracking-tight uppercase">HISTORIAL.DE.TRANSACCIONES</h3>
              <p class="text-[9px] font-black text-muted uppercase tracking-[0.3em] font-tight">AUDITORÍA DEL PROTOCOLO REPPY COIN</p>
            </div>
          </div>
          <span class="text-[10px] font-black bg-white/5 border border-white/5 px-3 py-1 rounded-full text-zinc-500 tracking-tighter uppercase font-precision opacity-40">CADENA_ENCRIPTADA</span>
        </div>

        <div v-if="transactions?.length > 0" class="space-y-3 font-precision">
          <div v-for="(tx, idx) in transactions" :key="idx"
            class="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl group hover:border-white/10 transition-all hover:translate-x-1 duration-500">
            <div class="flex items-center gap-6">
              <span class="text-[10px] text-zinc-600 tabular-nums uppercase w-20">{{ new Date(tx.created_at).toLocaleDateString() }}</span>
              <div class="h-1 w-1 bg-white/10 rounded-full"></div>
              <span class="text-xs font-bold text-foreground/90 uppercase tracking-tight">{{ tx.description }}</span>
            </div>
            
            <div class="flex items-center gap-3">
              <span class="text-[8px] font-black tracking-widest uppercase opacity-20 hidden md:block">{{ tx.amount > 0 ? 'RECVD' : 'SPENT' }}</span>
              <span class="text-sm font-black tabular-nums"
                :class="tx.amount > 0 ? 'text-neon-lime drop-shadow-[0_0_8px_rgba(0,255,153,0.2)]' : 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.2)]'">
                {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
              </span>
              <Coins class="w-3 h-3 text-zinc-600" />
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
          <div class="opacity-10 bg-white/10 p-6 rounded-full inline-block mb-4">
            <Activity class="w-12 h-12 text-foreground" />
          </div>
          <p class="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">SIN_TRANSACCIONES_REGISTRADAS</p>
          <p class="text-[8px] font-bold text-zinc-700 uppercase mt-2">Gana monedas entrenando o derrotando anomalías.</p>
        </div>
      </div>

      <!-- Protocol Override (Settings) -->
      <div v-if="isOwnProfile" class="card-stats border-border space-y-10">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-primary-500/5 rounded-2xl border border-primary-500/10">
            <Settings class="w-6 h-6 text-primary-500" />
          </div>
          <h3 class="text-xl font-black text-industrial text-foreground tracking-tight uppercase">PROTOCOL CONFIGURATION</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-muted px-1">IDENTIFIER</label>
            <input v-model="settingsForm.name" type="text"
              class="input-tactical" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-muted px-1">DAILY TARGET</label>
            <input v-model.number="settingsForm.daily_goal" type="number"
              class="input-tactical" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-muted px-1">BODY MASS (KG)</label>
            <input v-model.number="settingsForm.body_weight" type="number" step="0.1"
              class="input-tactical" />
          </div>
          
          <!-- Theme Protocol Toggle -->
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-muted px-1">INTERFACE MODE</label>
            <div class="flex items-center bg-surface/40 border border-border rounded-xl p-1.5 h-[58px]">
              <button v-for="m in ['light', 'dark', 'system']" :key="m"
                @click="themeStore.setTheme(m)"
                class="flex-1 flex items-center justify-center h-full rounded-lg transition-all gap-2"
                :class="themeStore.theme === m ? 'bg-primary-500 text-white shadow-lg' : 'text-muted hover:text-foreground hover:bg-surface/10'">
                <component :is="m === 'light' ? Sun : m === 'dark' ? Moon : Monitor" class="w-4 h-4" />
                <span class="text-[8px] font-bold uppercase tracking-tighter hidden md:block">{{ m }}</span>
              </button>
            </div>
          </div>
        </div>

        <button @click="saveSettings"
          class="btn-reppy w-full !py-5 shadow-2xl text-lg">
          SAVE PROTOCOL OVERRIDE
        </button>
      </div>
    </template>

    <!-- RPG Info Modal (The Codex) -->
    <Teleport to="body">
      <div v-if="showInfoModal" 
           class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div class="card-stats max-w-xl w-full p-8 md:p-12 border-primary-500/20 shadow-[0_0_100px_rgba(255,69,0,0.1)] space-y-10 relative overflow-hidden bg-background">
          <div class="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div class="flex items-center justify-between z-10 relative">
            <div class="flex flex-col">
              <h3 class="text-4xl font-black text-industrial text-foreground uppercase italic leading-none">THE CODEX<span class="text-primary-500">.</span></h3>
              <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em] mt-3">RPG EVOLUTION GUIDE</p>
            </div>
            <button @click="showInfoModal = false" 
                   title="Close Protocol"
                   class="p-3 bg-surface/10 hover:bg-surface/20 rounded-2xl transition-all hover:rotate-90">
              <XIcon class="w-6 h-6 text-foreground" />
            </button>
          </div>

          <!-- Attributes Tab -->
          <div class="space-y-6 z-10 relative">
            <div class="grid grid-cols-1 gap-5">
              <div v-for="desc in attributeDescriptions" :key="desc.key" 
                   class="flex gap-6 items-start p-6 bg-surface/5 border border-border rounded-2xl group transition-all hover:bg-surface/10"
                   :class="desc.borderColor">
                <div class="p-4 bg-surface/10 rounded-2xl transition-transform group-hover:scale-110" :class="desc.iconColor">
                   <component :is="desc.icon" class="w-6 h-6" />
                </div>
                <div class="flex-1">
                  <h4 class="font-black uppercase text-xs tracking-widest mb-1" :class="desc.iconColor">{{ desc.name }} ({{ desc.key }})</h4>
                  <p class="text-muted text-[10px] leading-relaxed italic mb-2">"{{ desc.quote }}"</p>
                  <p class="text-foreground/80 text-[11px] font-medium leading-relaxed">{{ desc.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-primary-500/10 p-5 rounded-2xl border border-primary-500/20 z-10 relative text-center">
            <p class="text-[10px] font-black text-primary-400 uppercase tracking-widest">NEXT LEVEL: +100 XP POINTS REQUIRED</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { Camera, Settings, LogOut, Activity, Flame, Trophy, HelpCircle, X as XIcon, Sword, Zap, Heart, Shield, Coins, Dumbbell, Target, Globe } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { useI18nStore } from '../stores/i18n';
import { useThemeStore } from '../stores/theme';
import Heatmap from './Heatmap.vue';
import AvatarFrame from './AvatarFrame.vue';
import ExerciseSelector from './ExerciseSelector.vue';
import axios from 'axios';
import { Moon, Sun, Monitor } from 'lucide-vue-next';

const props = defineProps({
  userId: { type: String, default: null }
});

const authStore = useAuthStore();
const i18nStore = useI18nStore();
const notificationStore = useNotificationStore();
const themeStore = useThemeStore();

const user = ref({ avatar_url: '', border_css: '', avatar_css: '', name: '', total_xp: 0, current_level: 1 });
const stats = ref({});
const heatmapData = ref([]);
const transactions = ref([]);
const loading = ref(true);
const activeExercise = ref('all');
const showInfoModal = ref(false);
const fileInput = ref(null);

const attributeDescriptions = [
  { key: 'STR', name: 'STRENGTH', icon: Sword, iconColor: 'text-red-500', borderColor: 'hover:border-red-500/30', quote: 'Lifting the weight of the world.', description: 'Scales with total load. Influenced by body mass and added resistance.' },
  { key: 'PWR', name: 'POWER', icon: Zap, iconColor: 'text-orange-500', borderColor: 'hover:border-orange-500/30', quote: 'Explosive critical impact.', description: 'Rewards absolute intensity. Based on your highest resistance recorded in a single set.' },
  { key: 'END', name: 'ENDURANCE', icon: Heart, iconColor: 'text-emerald-500', borderColor: 'hover:border-emerald-500/30', quote: 'Infinite fuel cell.', description: 'Purity of stamina. Scales with the total volume of repetitions performed across protocols.' },
  { key: 'AGI', name: 'AGILITY', icon: Shield, iconColor: 'text-blue-500', borderColor: 'hover:border-blue-500/30', quote: 'Zero metabolic drag.', description: 'Tactical consistency. Earned through active streaks and protocol variety.' }
];

const getIconForType = (type) => {
  const icons = {
    pullups: Dumbbell,
    pushups: Flame,
    muscleups: Zap,
    dips: Target,
    weighted_pullups: Trophy,
    all: Globe
  };
  return icons[type] || Dumbbell;
};

const attributes = computed(() => [
  { key: 'STR', xp: user.value.str_xp || 0, lvl: user.value.str_lvl || 1, labelColor: 'text-red-500' },
  { key: 'PWR', xp: user.value.pwr_xp || 0, lvl: user.value.pwr_lvl || 1, labelColor: 'text-orange-500' },
  { key: 'END', xp: user.value.end_xp || 0, lvl: user.value.end_lvl || 1, labelColor: 'text-emerald-500' },
  { key: 'AGI', xp: user.value.agi_xp || 0, lvl: user.value.agi_lvl || 1, labelColor: 'text-blue-500' }
]);

const getAttrColor = (lvl) => {
  if (lvl >= 31) return 'border-orange-500/30 bg-orange-500/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]';
  if (lvl >= 16) return 'border-primary-500/20 bg-primary-500/5';
  return 'border-white/5';
};

const isOwnProfile = computed(() => !props.userId || props.userId === authStore.user?.id);

const settingsForm = ref({ name: '', daily_goal: 0, body_weight: 0 });

const triggerAvatarUpload = () => { if (fileInput.value) fileInput.value.click(); };

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const res = await axios.post('/api/users/avatar', { avatarBase64: e.target.result });
      authStore.user.avatar_url = res.data.avatarUrl;
      if (isOwnProfile.value) user.value.avatar_url = res.data.avatarUrl;
      notificationStore.notify('Biometric core updated', 'success');
    } catch (err) { notificationStore.notify('Sync error', 'error'); }
  };
  reader.readAsDataURL(file);
};

const saveSettings = async () => {
  try {
    const res = await axios.patch('/api/users/profile', settingsForm.value);
    Object.assign(authStore.user, res.data.user);
    Object.assign(user.value, res.data.user);
    notificationStore.notify('Protocol override success', 'success');
  } catch (error) { notificationStore.notify('Override failed', 'error'); }
};

const fetchProfile = async () => {
  loading.value = true;
  try {
    const targetId = props.userId || authStore.user?.id;
    const res = await axios.get(`/api/profile/${targetId}`, {
      params: { type: activeExercise.value }
    });
    user.value = res.data.user;
    stats.value = res.data.stats;
    heatmapData.value = res.data.heatmap;
    transactions.value = res.data.transactions || [];
    if (isOwnProfile.value) {
      settingsForm.value = { name: user.value.name, daily_goal: user.value.daily_goal, body_weight: user.value.body_weight };
      // Sync global header
      await authStore.fetchProfile();
    }
  } catch (err) { notificationStore.notify('Profile sync failed', 'error'); }
  finally { loading.value = false; }
};

watch(activeExercise, fetchProfile);
onMounted(fetchProfile);
watch(() => props.userId, fetchProfile);
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

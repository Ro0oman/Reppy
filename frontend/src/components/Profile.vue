<template>
  <div class="max-w-7xl mx-auto px-4 pt-12 pb-32 space-y-12 animate-in relative z-10">
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
          <button v-if="isOwnProfile" 
                  @click="triggerAvatarUpload" 
                  :title="i18nStore.locale === 'es' ? 'Editar Avatar / Bio-Link' : 'Edit Avatar / Bio-Link'"
                  class="absolute -bottom-2 -right-2 p-4 bg-primary-500 rounded-2xl cursor-pointer hover:bg-primary-600 shadow-[0_0_20px_rgba(255,69,0,0.3)] text-white z-10 transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-4 focus:ring-offset-background">
            <Camera class="w-5 h-5" />
            <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/jpeg, image/png, image/webp" class="hidden" />
          </button>
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
          </div>
          
          <!-- RPG Metrics (The Attributes Grid) -->
          <div class="flex flex-col xl:flex-row items-center xl:items-end gap-10 w-full mt-8">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
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
            <button @click="showInfoModal = true" 
                   :title="i18nStore.locale === 'es' ? 'Guía del Protocolo de Evolución' : 'Evolution Protocol Guide'"
                   class="flex items-center gap-3 bg-surface/5 px-6 py-4 rounded-xl border border-border hover:border-primary-500/30 transition-all text-muted hover:text-foreground uppercase text-[9px] font-black tracking-widest h-fit shrink-0">
              <HelpCircle class="w-4 h-4" />
              CODEX INFO
            </button>
          </div>
        </div>
        
        <!-- Emergency Exit (Logout) -->
        <div v-if="isOwnProfile" class="md:absolute top-8 right-8">
          <button @click="authStore.logout()" 
                  :title="i18nStore.locale === 'es' ? 'Cerrar sesión / Salir de Reppy' : 'Log out / Exit Reppy'"
                  class="p-4 bg-red-500/5 text-red-500/60 hover:bg-red-500 hover:text-white border border-red-500/10 rounded-2xl transition-all group/logout active:scale-90 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-4 focus:ring-offset-background">
            <LogOut class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <!-- Dashboard Operational Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <!-- Sidebar Column: Stats & Setup -->
        <div class="lg:col-span-4 space-y-10 order-2 lg:order-1">
           <!-- Analytics Deck -->
           <div class="card-stats border-white/5 space-y-8 bg-surface/5">
              <div class="flex items-center gap-3 border-b border-white/5 pb-6">
                <Activity class="w-5 h-5 text-primary-500" />
                <h3 class="text-sm font-black text-industrial text-foreground tracking-widest uppercase">STATISTICS</h3>
              </div>
              
              <div class="grid grid-cols-2 lg:grid-cols-1 gap-6">
                <!-- Total Reps Pill -->
                <div class="group/stat">
                   <p class="text-[9px] font-black text-muted uppercase tracking-widest mb-1">{{ i18nStore.t('stats_effort') }}</p>
                   <div class="flex items-baseline gap-2">
                      <span class="text-4xl font-black text-precision text-foreground tracking-tighter">{{ stats.totalReps || 0 }}</span>
                      <span class="text-[10px] font-black text-primary-500 uppercase tracking-widest">REPS</span>
                   </div>
                </div>

                <!-- Total Volume Pill -->
                <div class="group/stat">
                   <p class="text-[9px] font-black text-muted uppercase tracking-widest mb-1">{{ i18nStore.t('stats_tonnage') }}</p>
                   <div class="flex items-baseline gap-2">
                      <span class="text-4xl font-black text-precision text-red-500 tracking-tighter">{{ ((stats.totalVolume || 0) / 1000).toFixed(1) }}</span>
                      <span class="text-[10px] font-black text-muted uppercase tracking-widest">TONS</span>
                   </div>
                </div>
 
                <!-- Streak Pill -->
                <div class="group/stat">
                   <p class="text-[9px] font-black text-muted uppercase tracking-widest mb-1">{{ i18nStore.t('stats_consistency') }}</p>
                   <div class="flex items-center gap-3">
                      <span class="text-4xl font-black text-precision text-orange-500 tracking-tighter">{{ stats.streak || 0 }}</span>
                      <Flame class="w-6 h-6 text-orange-500 animate-pulse" />
                   </div>
                </div>
 
                <!-- Goal Pill -->
                <div class="group/stat">
                   <p class="text-[9px] font-black text-muted uppercase tracking-widest mb-1">{{ i18nStore.t('stats_protocol_goal') }}</p>
                   <div class="flex items-baseline gap-2">
                      <span class="text-4xl font-black text-precision text-neon-lime tracking-tighter">{{ user.daily_goal || 0 }}</span>
                      <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18nStore.t('stats_per_day') }}</span>
                    </div>
                 </div>
              </div>

              <!-- Protocol Mastery -->
              <div v-if="stats.breakdown?.length > 0" class="pt-8 border-t border-white/5 space-y-4">
                 <div class="flex items-center gap-2 mb-4">
                   <Trophy class="w-3.5 h-3.5 text-primary-500" />
                   <h4 class="text-[10px] font-black text-foreground uppercase tracking-[0.2em] leading-none">{{ i18nStore.t('protocol_mastery') }}</h4>
                 </div>
                 
                 <div class="space-y-3">
                   <div v-for="item in stats.breakdown" :key="item.type" 
                        class="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group hover:border-primary-500/30 transition-all">
                     <div class="flex items-center gap-3">
                       <div class="w-8 h-8 bg-surface rounded-lg flex items-center justify-center border border-white/5">
                         <component :is="getIconForType(item.type)" class="w-4 h-4 text-primary-500/60" />
                       </div>
                       <div>
                         <p class="text-[9px] font-black text-muted uppercase tracking-wider mb-1">{{ i18nStore.t(item.type) }}</p>
                         <div class="flex items-baseline gap-2">
                           <span class="text-xs font-black text-foreground tabular-nums">{{ item.count }}</span>
                           <span class="text-[7px] font-bold text-zinc-600 uppercase">REPS</span>
                         </div>
                       </div>
                     </div>
                     <span class="text-[10px] font-black text-red-500/80 font-precision tabular-nums">{{ ((item.volume || 0) / 1000).toFixed(1) }}T</span>
                  </div>
                 </div>
              </div>

              <!-- User Options Overlay (Settings Overlay) -->
              <div v-if="isOwnProfile" class="pt-8 border-t border-white/5 space-y-6">
                <div class="flex items-center gap-3">
                  <Settings class="w-4 h-4 text-primary-500" />
                  <h4 class="text-[10px] font-black text-foreground uppercase tracking-widest">CONFIGURATION</h4>
                </div>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                       <label class="text-[8px] font-black uppercase text-muted tracking-widest px-1">IDENTIFIER</label>
                       <input v-model="settingsForm.name" type="text" class="input-tactical !py-2 !px-3 !text-xs" />
                    </div>
                    <div class="space-y-2">
                       <label class="text-[8px] font-black uppercase text-muted tracking-widest px-1">TARGET</label>
                       <input v-model.number="settingsForm.daily_goal" type="number" class="input-tactical !py-2 !px-3 !text-xs" />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[8px] font-black uppercase text-muted tracking-widest px-1">INTERFACE</label>
                    <div class="flex items-center bg-surface/40 border border-border rounded-xl p-1 h-[38px]">
                      <button v-for="m in ['light', 'dark', 'system']" :key="m" @click="themeStore.setTheme(m)"
                        class="flex-1 flex items-center justify-center h-full rounded-lg transition-all"
                        :class="themeStore.theme === m ? 'bg-primary-500 text-white shadow-lg' : 'text-muted hover:bg-surface/10'">
                        <component :is="m === 'light' ? Sun : m === 'dark' ? Moon : Monitor" class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <button @click="saveSettings" class="btn-reppy w-full !py-3 !text-xs">SAVE CHANGES</button>
                </div>
              </div>
           </div>
        </div>

        <!-- Main Workspace Column: Heatmap & Audit -->
        <div class="lg:col-span-8 space-y-10 order-1 lg:order-2">
           <!-- Heatmap Deck -->
           <div class="space-y-6">
              <ExerciseSelector v-model="activeExercise" class="w-full" />
              <div class="card-stats border-white/5 space-y-8 min-h-[400px] flex flex-col justify-center bg-surface/5">
                 <div class="flex items-center justify-between">
                   <h3 class="text-[10px] font-black text-muted tracking-[0.3em] uppercase">DISTRIBUTION HEATMAP</h3>
                   <span class="text-[10px] font-black text-neon-lime tabular-nums uppercase tracking-widest">Active 365 Days</span>
                 </div>
                 <Heatmap :data="heatmapData" class="flex-1" />
              </div>
           </div>

           <!-- Transaction Audit Log -->
           <div class="card-stats border-border space-y-8 bg-gradient-to-br from-surface/20 to-surface/5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                    <Coins class="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <h4 class="text-m font-black text-industrial text-foreground tracking-tight uppercase">AUDITORÍA DE ACTIVIDAD</h4>
                    <p class="text-[9px] font-black text-muted uppercase tracking-[0.3em] font-tight">HISTORIAL DE REPPY COINS</p>
                  </div>
                </div>
                <span class="text-[10px] font-black bg-white/5 border border-white/5 px-3 py-1 rounded-full text-zinc-500 tracking-tighter uppercase font-precision opacity-40">CADENA_ENCRIPTADA</span>
              </div>

              <div v-if="transactions?.length > 0" class="space-y-3 font-precision">
                <div v-for="(tx, idx) in transactions" :key="idx"
                  class="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl group hover:border-white/10 transition-all hover:translate-x-1 duration-500">
                  <div class="flex items-center gap-6">
                    <span class="text-[10px] text-zinc-600 tabular-nums uppercase w-20">{{ new Date(tx.created_at).toLocaleDateString() }}</span>
                    <span class="text-xs font-bold text-foreground/90 uppercase tracking-tight">{{ tx.description }}</span>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-black tabular-nums"
                      :class="tx.amount > 0 ? 'text-neon-lime' : 'text-cyan-400'">
                      {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
                    </span>
                    <Coins class="w-3 h-3 text-zinc-600" />
                  </div>
                </div>
                
                <!-- Pagination Protocol -->
                <div v-if="hasMoreTransactions" class="pt-4 border-t border-white/5">
                  <button @click="fetchMoreTransactions" 
                          :disabled="loadingMore"
                          class="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all flex items-center justify-center gap-3">
                    <span v-if="loadingMore" class="animate-spin border-2 border-primary-500 border-t-transparent rounded-full w-3 h-3"></span>
                    {{ loadingMore ? 'COMMUNICATION...' : 'CARGAR MÁS TRANSACCIONES' }}
                  </button>
                </div>
              </div>
              
              <div v-else class="text-center py-20 opacity-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <p class="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">SIN_TRANSACCIONES_REGISTRADAS</p>
              </div>
           </div>
        </div>
      </div>
    </template>

    <!-- RPG Info Modal (The Codex) -->
    <Teleport to="body">
      <div v-if="showInfoModal" 
           class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
           @click.self="showInfoModal = false">
        <div class="max-w-xl w-full p-6 md:p-12 border-primary-500/20 shadow-[0_0_100px_rgba(255,69,0,0.1)] space-y-8 md:space-y-10 relative overflow-hidden bg-background rounded-[2.5rem] max-h-[90vh] overflow-y-auto select-none">
          <div class="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div class="flex items-center justify-between z-10 relative">
            <div class="flex flex-col">
              <h3 class="text-3xl md:text-4xl font-black text-industrial text-foreground uppercase italic leading-none">{{ i18nStore.t('codex_title') }}<span class="text-primary-500">.</span></h3>
              <p class="text-[9px] md:text-[10px] font-black text-muted uppercase tracking-[0.4em] mt-3">{{ i18nStore.t('codex_subtitle') }}</p>
            </div>
            <button @click="showInfoModal = false" class="p-2 md:p-3 bg-surface/10 hover:bg-surface/20 rounded-2xl transition-all hover:rotate-90">
              <XIcon class="w-5 h-5 md:w-6 md:h-6 text-foreground" />
            </button>
          </div>

          <!-- Attributes Tab -->
          <div class="space-y-6 z-10 relative select-none">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div v-for="desc in attributeDescriptions" :key="desc.key" 
                   class="flex gap-4 md:gap-6 items-start p-4 md:p-6 bg-surface/5 border border-border rounded-2xl group transition-all hover:bg-surface/10"
                   :class="desc.borderColor">
                <div class="p-3 md:p-4 bg-surface/10 rounded-2xl transition-transform group-hover:scale-110 shrink-0" :class="desc.iconColor">
                   <component :is="desc.icon" class="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div class="flex-1">
                  <h4 class="font-black uppercase text-[10px] md:text-xs tracking-widest mb-1" :class="desc.iconColor">{{ i18nStore.t('codex_' + desc.key.toLowerCase() + '_name') }} ({{ desc.key }})</h4>
                  <p class="text-muted text-[9px] md:text-[10px] leading-relaxed italic mb-2">"{{ i18nStore.t('codex_' + desc.key.toLowerCase() + '_quote') }}"</p>
                  <p class="text-foreground/80 text-[10px] md:text-[11px] font-medium leading-relaxed mb-3">{{ i18nStore.t('codex_' + desc.key.toLowerCase() + '_desc') }}</p>
                  
                  <div class="flex items-center gap-2 pt-3 border-t border-white/5">
                    <span class="text-[7px] md:text-[8px] font-black text-primary-500 uppercase tracking-widest">{{ i18nStore.t('codex_lv_up') }}</span>
                    <p class="text-[8px] md:text-[9px] font-black text-foreground uppercase tracking-tight">{{ i18nStore.t('codex_' + desc.key.toLowerCase() + '_action') }}</p>
                  </div>
                </div>
              </div>
            </div>
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

// Pagination State
const transactionsPage = ref(1);
const hasMoreTransactions = ref(true);
const loadingMore = ref(false);

const attributeDescriptions = [
  { key: 'STR', icon: Sword, iconColor: 'text-red-500', borderColor: 'hover:border-red-500/30' },
  { key: 'PWR', icon: Zap, iconColor: 'text-orange-500', borderColor: 'hover:border-orange-500/30' },
  { key: 'END', icon: Heart, iconColor: 'text-emerald-500', borderColor: 'hover:border-emerald-500/30' },
  { key: 'AGI', icon: Shield, iconColor: 'text-blue-500', borderColor: 'hover:border-blue-500/30' }
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
  transactionsPage.value = 1;
  hasMoreTransactions.value = true;
  try {
    const targetId = props.userId || authStore.user?.id;
    const res = await axios.get(`/api/profile/${targetId}`, {
      params: { type: activeExercise.value }
    });
    user.value = res.data.user;
    stats.value = res.data.stats;
    heatmapData.value = res.data.heatmap;
    transactions.value = res.data.transactions || [];
    
    // Check if there might be more based on default limit (20)
    hasMoreTransactions.value = (res.data.transactions || []).length === 20;

    if (isOwnProfile.value) {
      settingsForm.value = { name: user.value.name, daily_goal: user.value.daily_goal, body_weight: user.value.body_weight };
      // Sync global header
      await authStore.fetchProfile();
    }
  } catch (err) { notificationStore.notify('Profile sync failed', 'error'); }
  finally { loading.value = false; }
};

const fetchMoreTransactions = async () => {
  if (loadingMore.value || !hasMoreTransactions.value) return;
  loadingMore.value = true;
  try {
    const targetId = props.userId || authStore.user?.id;
    const nextPage = transactionsPage.value + 1;
    const res = await axios.get(`/api/profile/${targetId}/transactions`, {
      params: { page: nextPage, limit: 20 }
    });
    
    if (res.data.transactions && res.data.transactions.length > 0) {
      transactions.value.push(...res.data.transactions);
      transactionsPage.value = nextPage;
      hasMoreTransactions.value = res.data.hasMore;
    } else {
      hasMoreTransactions.value = false;
    }
  } catch (err) {
    notificationStore.notify('Error loading more transactions', 'error');
  } finally {
    loadingMore.value = false;
  }
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

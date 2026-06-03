<template>
  <div class="max-w-7xl mx-auto px-4 pt-4 pb-24 space-y-6 animate-in relative z-10">
    <div v-if="loading" class="flex flex-col items-center justify-center py-32">
      <div class="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em] mt-8">{{ i18nStore.t('profile_decrypting') }}</p>
    </div>
    
    <template v-else>

      <!-- ── HEADER: avatar + identity + actions en una sola fila ── -->
      <div class="flex items-start gap-4">

        <!-- Avatar (tappable para zoom/cambiar) -->
        <div class="relative shrink-0">
          <div class="cursor-pointer active:scale-95 transition-transform" @click="showZoom = true">
            <AvatarFrame :src="user.avatar_url" :border-css="user.border_css" :avatar-css="user.avatar_css" :size="72" />
          </div>
          <button v-if="isOwnProfile"
                  @click.stop="showAvatarSelector = true"
                  :title="i18nStore.locale === 'es' ? 'Cambiar avatar' : 'Change avatar'"
                  class="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform">
            <UserIcon class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Identity -->
        <div class="flex-1 min-w-0 pt-0.5">
          <h1 class="text-xl font-bold text-foreground tracking-tight leading-tight truncate">{{ user.name }}</h1>
          <p class="text-xs text-muted mt-0.5 truncate">{{ user.title_name || i18nStore.t('profile_recruit') }}</p>
          <!-- XP bar -->
          <div class="mt-2 flex items-center gap-2">
            <span class="text-[10px] font-bold text-primary-500 shrink-0">Lv {{ user.current_level || 1 }}</span>
            <div class="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
              <div class="h-full bg-primary-500 transition-all duration-700 rounded-full"
                   :style="{ width: `${((user.xp_into_level||0)/(user.xp_for_next_level||1000))*100}%` }" />
            </div>
            <span class="text-[10px] text-muted shrink-0 tabular-nums">
              {{ (user.xp_for_next_level||1000)-(user.xp_into_level||0) }} XP
            </span>
          </div>
        </div>

        <!-- Own profile: settings + logout -->
        <div v-if="isOwnProfile" class="flex items-center gap-1.5 shrink-0 pt-0.5">
          <button @click="showSettingsModal = true"
                  :title="i18nStore.t('stats_settings')"
                  class="p-2 rounded-xl bg-foreground/[0.04] border border-border text-muted hover:text-foreground hover:bg-foreground/[0.08] transition-all active:scale-95">
            <Settings class="w-4 h-4" />
          </button>
          <button @click="handleLogout"
                  :title="i18nStore.t('sign_out')"
                  class="p-2 rounded-xl bg-foreground/[0.04] border border-border text-muted hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95">
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- ── STATS ROW: 3 números clave ── -->
      <div class="grid grid-cols-3 gap-3">
        <div class="rounded-2xl border border-border bg-foreground/[0.02] px-4 py-3 text-center">
          <p class="text-2xl font-bold text-foreground tabular-nums">{{ stats.totalReps || 0 }}</p>
          <p class="text-[10px] text-muted mt-0.5 uppercase tracking-wide">{{ i18nStore.t('stats_reps') }}</p>
        </div>
        <div class="rounded-2xl border border-border bg-foreground/[0.02] px-4 py-3 text-center">
          <div class="flex items-center justify-center gap-1">
            <p class="text-2xl font-bold text-orange-500 tabular-nums">{{ stats.streak || 0 }}</p>
            <Flame class="w-4 h-4 text-orange-500" />
          </div>
          <p class="text-[10px] text-muted mt-0.5 uppercase tracking-wide">{{ i18nStore.locale === 'es' ? 'Racha' : 'Streak' }}</p>
        </div>
        <div class="rounded-2xl border border-border bg-foreground/[0.02] px-4 py-3 text-center">
          <p class="text-2xl font-bold text-foreground tabular-nums">{{ ((stats.totalVolume||0)/1000).toFixed(1) }}T</p>
          <p class="text-[10px] text-muted mt-0.5 uppercase tracking-wide">{{ i18nStore.locale === 'es' ? 'Tonelaje' : 'Volume' }}</p>
        </div>
      </div>

      <!-- ── ACCIONES RÁPIDAS (solo otros perfiles) ── -->
      <div v-if="!isOwnProfile && authStore.isAuthenticated" class="flex flex-wrap gap-2">
        <template v-if="authStore.isAuthenticated">
          <button @click="challengingUser = user"
            class="inline-flex items-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-600 px-4 py-2.5 text-sm font-bold text-white active:scale-95 transition-all shadow-lg shadow-primary-500/20">
            <Swords class="w-4 h-4" />
            {{ i18nStore.t('pvp_challenge_btn') || 'Retar' }}
          </button>
          <button @click="comparingUser = user"
            class="tap-card inline-flex items-center gap-2 rounded-xl border border-border bg-foreground/[0.03] px-4 py-2.5 text-sm font-semibold text-muted hover:text-foreground transition-all">
            <BarChart3 class="w-4 h-4" />
            {{ i18nStore.t('ui_compare') || 'Comparar' }}
          </button>
        </template>
      </div>

      <!-- ── ATRIBUTOS RPG ── -->
      <div v-if="attributes?.length" class="rounded-2xl border border-border bg-foreground/[0.02] p-4">
        <p class="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-4">
          {{ i18nStore.locale === 'es' ? 'Atributos RPG' : 'RPG Attributes' }}
        </p>
        <div class="space-y-3">
          <div v-for="attr in attributes" :key="attr.key"
               class="group flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
               @click="codexTab = attr.key; showInfoModal = true">
            <!-- Icon + key -->
            <div class="shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center border transition-all"
                 :class="attr.tileBg">
              <span class="text-base leading-none">{{ attr.icon }}</span>
              <span class="text-[8px] font-black tracking-wider leading-none mt-0.5"
                    :class="attr.labelColor">{{ attr.key }}</span>
            </div>
            <!-- Level + bar -->
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline justify-between mb-1.5">
                <span class="text-sm font-bold text-foreground tabular-nums leading-none">
                  Lv <span class="text-base" :class="attr.labelColor">{{ attr.lvl }}</span>
                </span>
                <span class="text-[10px] text-muted/60 tabular-nums">
                  {{ attr.xpIntoLevel }}<span class="opacity-50">/{{ attr.xpForNext }}</span>
                </span>
              </div>
              <div class="h-2 rounded-full bg-foreground/8 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700 relative"
                     :class="attr.barColor"
                     :style="{ width: `${Math.min(100, (attr.xpIntoLevel / attr.xpForNext) * 100)}%` }">
                  <!-- Shine -->
                  <div class="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/20 to-white/0"></div>
                </div>
              </div>
            </div>
            <!-- Gear bonus -->
            <span v-if="attr.bonus > 0"
                  class="shrink-0 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-lg tabular-nums">
              +{{ attr.bonus }}
            </span>
          </div>
        </div>
      </div>

      <!-- ── HEATMAP ── -->
      <div class="space-y-3">
        <ExerciseSelector v-model="activeExercise" class="w-full" />
        <div class="rounded-2xl border border-border bg-foreground/[0.02] p-4">
          <Heatmap :data="heatmapData" />
        </div>
      </div>

      <!-- ── DESGLOSE POR EJERCICIO ── -->
      <div v-if="stats.breakdown?.length > 0" class="rounded-2xl border border-border bg-foreground/[0.02] p-4 space-y-3">
        <p class="text-xs font-semibold text-muted">Ejercicios</p>
        <div class="space-y-2">
          <div v-for="item in stats.breakdown" :key="item.type"
               class="tap-row flex items-center justify-between py-2 px-1 rounded-xl">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-foreground/[0.05] border border-border flex items-center justify-center">
                <component :is="getIconForType(item.type)" class="w-4 h-4 text-primary-500/70" />
              </div>
              <div>
                <p class="text-sm font-semibold text-foreground">{{ i18nStore.t(item.type)||item }}</p>
                <p class="text-xs text-muted tabular-nums">{{ item.count }} {{ i18nStore.t('ui_reps') }}</p>
              </div>
            </div>
            <span class="text-xs font-bold text-muted tabular-nums">{{ ((item.volume||0)/1000).toFixed(1) }}T</span>
          </div>
        </div>
      </div>

     

    </template>

    <!-- RPG Info Modal (The Codex) -->
    <CodexModal :show="showInfoModal" :initial-tab="codexTab" @close="showInfoModal = false" />
    <!-- Issue 88: Settings Modal -->
    <SettingsModal :show="showSettingsModal" :initial-data="settingsForm" @close="showSettingsModal = false" @updated="onProfileUpdated" />

    <!-- PvP and Comparison Modals -->
    <Teleport to="body">
       <PvpConfigModal 
         :show="!!challengingUser" 
         :target="challengingUser" 
         @close="challengingUser = null" 
       />
       <UserCompareModal 
         :show="!!comparingUser" 
         :me="authStore.user" 
         :target="comparingUser" 
         @close="comparingUser = null" 
       />
    </Teleport>

    <!-- NEW: Avatar Selector Modal -->
    <Teleport to="body">
      <div v-if="showAvatarSelector" class="cursor-pointer fixed inset-0 z-[1001] flex justify-center items-start overflow-y-auto p-4 md:p-8 bg-background/90 backdrop-blur-md" @click.self="showAvatarSelector = false">
        <div class="card-stats max-w-2xl w-full p-6 md:p-12 border-border space-y-8 md:space-y-10 relative overflow-visible my-auto animate-in">
             <div class="flex items-center justify-between">
                <div class="space-y-1">
                    <h2 class="text-2xl font-bold text-industrial text-foreground   tracking-tighter">{{ i18nStore.t('ui_select_class') }}<span class="text-primary-500">.</span></h2>
                    <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18nStore.t('ui_choose_protocol') }}</p>
                </div>
                <button @click="showAvatarSelector = false" class="p-2 bg-surface/10 rounded-xl hover:bg-surface/20 transition-all">
                    <XIcon class="w-5 h-5 text-foreground" />
                </button>
             </div>

             <div class="flex flex-col items-center gap-6 p-8 border-2 border-dashed border-white/10 rounded-2xl bg-surface/5 hover:bg-surface/10 hover:border-primary-500/30 transition-all cursor-pointer group/upload" @click="$refs.fileInput.click()">
                <div class="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center group-hover/upload:scale-110 transition-transform">
                   <Camera class="w-8 h-8 text-primary-500" />
                </div>
                <div class="text-center">
                   <p class="text-xs font-black text-foreground uppercase tracking-widest">{{ i18nStore.t('ui_upload_custom') || 'SUBIR AVATAR PERSONALIZADO' }}</p>
                   <p class="text-xs font-bold text-muted uppercase tracking-widest mt-1 opacity-60">{{ i18nStore.t('ui_compressed_info') || 'Se comprimirá automáticamente para optimizar carga' }}</p>
                </div>
                <input type="file" ref="fileInput" hidden accept="image/*" @change="handleCustomAvatar" />
             </div>

             <div class="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
                <div v-for="i in [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 14, 16, 17, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]" :key="i" 
                     @click="selectAvatar(`/img/avatars/avatar_${i}.webp`)"
                     class="group relative cursor-pointer aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-110 active:scale-95"
                     :class="user.avatar_url === `/img/avatars/avatar_${i}.webp` ? 'border-primary-500 shadow-[0_0_15px_hsl(var(--primary) / 0.3)]' : 'border-white/5 hover:border-white/20'">
                  <img :src="`/img/avatars/avatar_${i}.webp`" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/10 transition-colors"></div>
                  <!-- Label for Class Type -->
                  <div class="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm py-1">
                     <p class="text-[6px] font-black text-white text-center uppercase tracking-tighter">{{ getClassLabel(i) }}</p>
                  </div>
                </div>
             </div>

             <p class="text-xs font-bold text-muted text-center uppercase tracking-widest opacity-40">{{ i18nStore.t('ui_lock_selection') }}</p>
        </div>
      </div>
    </Teleport>
    
    <!-- Avatar Zoom Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showZoom" 
             class="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-xl cursor-zoom-out"
             @click="showZoom = false">
          <div class="relative max-w-4xl w-full aspect-square md:aspect-auto md:h-[80vh] flex items-center justify-center animate-modal-in" @click.stop>
            <div class="absolute -top-12 right-0 md:-right-12">
              <button @click="showZoom = false" class="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group">
                <XIcon class="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
              </button>
            </div>
            
            <div class="relative group/zoom-image h-full w-full flex items-center justify-center">
              <!-- Frame Decoration -->
              <div class="absolute inset-0 border-2 border-primary-500/30 rounded-2xl -m-4 md:-m-8 animate-pulse pointer-events-none"></div>
              
              <img :src="user.avatar_url" 
                   class="w-full h-full max-w-[512px] max-h-[512px] object-cover rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10"
                   :style="user.avatar_css" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { Camera, Settings, LogOut, Activity, Flame, Trophy, HelpCircle, X as XIcon, Swords, Zap, Heart, Shield, Coins, Dumbbell, Target, Globe, User as UserIcon, BarChart3, BookOpen } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useI18nStore } from '@/stores/i18n';
import { useThemeStore } from '@/stores/theme';
import { useRouter } from 'vue-router';
import Heatmap from '@/components/training/Heatmap.vue';
import AvatarFrame from '@/components/ui/AvatarFrame.vue';
import ExerciseSelector from '@/components/training/ExerciseSelector.vue';
import CodexModal from '@/components/modals/CodexModal.vue';
import SettingsModal from '@/components/modals/SettingsModal.vue';
import PvpConfigModal from '@/components/modals/PvpConfigModal.vue';
import UserCompareModal from '@/components/modals/UserCompareModal.vue';
import axios from 'axios';
import { Moon, Sun, Monitor } from 'lucide-vue-next';

const props = defineProps({
  userId: { type: String, default: null }
});

const authStore = useAuthStore();
const i18nStore = useI18nStore();
const emit = defineEmits(['start', 'viewProfile']);
const notificationStore = useNotificationStore();
const themeStore = useThemeStore();
const router = useRouter();

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
const handleResize = () => { windowWidth.value = window.innerWidth; };

const user = ref({ avatar_url: '', border_css: '', avatar_css: '', name: '', total_xp: 0, current_level: 1 });

onMounted(() => {
  fetchProfile();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
const stats = ref({});
const heatmapData = ref([]);
const transactions = ref([]);
const loading = ref(true);
const activeExercise = ref('all');
const showInfoModal = ref(false);
const codexTab = ref('STR');
const showSettingsModal = ref(false);
const showAvatarSelector = ref(false);
const showZoom = ref(false);
const challengingUser = ref(null);
const comparingUser = ref(null);
const fileInput = ref(null);

const handleCustomAvatar = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 512;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/webp', 0.8);

      try {
        const res = await axios.post('/api/users/avatar', { 
          avatar_url: compressedBase64,
          is_custom: true 
        });
        const finalUrl = res.data?.user?.avatar_url || res.data?.avatar_url;
        user.value.avatar_url = finalUrl;
        authStore.user.avatar_url = finalUrl;
        notificationStore.notify(i18nStore.t('profile_updated'), 'success');
        showAvatarSelector.value = false;
      } catch (err) {
        notificationStore.notify('Error uploading avatar', 'error');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Pagination State
const transactionsPage = ref(1);
const hasMoreTransactions = ref(true);
const loadingMore = ref(false);

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

const itemBonuses = computed(() => {
  const bonuses = { STR: 0, DEX: 0, END: 0, VIG: 0, INT: 0, FTH: 0, CHA: 0 };
  const slots = ['head', 'weapon', 'armor', 'boots'];
  slots.forEach(slot => {
    const stats = user.value[`${slot}_stats`] || {};
    Object.keys(stats).forEach(key => {
      const upperKey = key.toUpperCase();
      if (bonuses[upperKey] !== undefined) {
        bonuses[upperKey] += stats[key];
      }
    });
  });
  return bonuses;
});

const attributes = computed(() => [
  { key: 'STR', icon: '⚔️', lvl: user.value.str_lvl || 1, labelColor: 'text-orange-500', barColor: 'bg-orange-500', tileBg: 'bg-orange-500/8 border-orange-500/20', bonus: itemBonuses.value.STR, xpIntoLevel: user.value.str_xp_into_level || 0, xpForNext: user.value.str_xp_for_next_level || 100 },
  { key: 'DEX', icon: '🎯', lvl: user.value.dex_lvl || 1, labelColor: 'text-cyan-400',   barColor: 'bg-cyan-400',   tileBg: 'bg-cyan-500/8 border-cyan-500/20',   bonus: itemBonuses.value.DEX, xpIntoLevel: user.value.dex_xp_into_level || 0, xpForNext: user.value.dex_xp_for_next_level || 100 },
  { key: 'END', icon: '🛡️', lvl: user.value.end_lvl || 1, labelColor: 'text-emerald-500', barColor: 'bg-emerald-500', tileBg: 'bg-emerald-500/8 border-emerald-500/20', bonus: itemBonuses.value.END, xpIntoLevel: user.value.end_xp_into_level || 0, xpForNext: user.value.end_xp_for_next_level || 100 },
  { key: 'VIG',  icon: '❤️', lvl: user.value.vig_lvl || 1, labelColor: 'text-red-500',    barColor: 'bg-red-500',    tileBg: 'bg-red-500/8 border-red-500/20',    bonus: itemBonuses.value.VIG, xpIntoLevel: user.value.vig_xp_into_level || 0, xpForNext: user.value.vig_xp_for_next_level || 100 },
  { key: 'INT',  icon: '🧠', lvl: user.value.int_lvl || 1, labelColor: 'text-blue-400',   barColor: 'bg-blue-400',   tileBg: 'bg-blue-500/8 border-blue-500/20',   bonus: itemBonuses.value.INT, xpIntoLevel: user.value.int_xp_into_level || 0, xpForNext: user.value.int_xp_for_next_level || 100 },
  { key: 'FTH',  icon: '✨', lvl: user.value.fth_lvl || 1, labelColor: 'text-yellow-400', barColor: 'bg-yellow-400', tileBg: 'bg-yellow-500/8 border-yellow-500/20', bonus: itemBonuses.value.FTH, xpIntoLevel: user.value.fth_xp_into_level || 0, xpForNext: user.value.fth_xp_for_next_level || 100 },
  { key: 'CHA',  icon: '👑', lvl: user.value.cha_lvl || 1, labelColor: 'text-pink-400',   barColor: 'bg-pink-400',   tileBg: 'bg-pink-500/8 border-pink-500/20',   bonus: itemBonuses.value.CHA, xpIntoLevel: user.value.cha_xp_into_level || 0, xpForNext: user.value.cha_xp_for_next_level || 100 },
]);

const getAttrColor = (lvl) => {
  if (lvl >= 31) return 'border-orange-500/30 bg-orange-500/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]';
  if (lvl >= 16) return 'border-primary-500/20 bg-primary-500/5';
  return 'border-white/5';
};

const isOwnProfile = computed(() => !!authStore.user?.id && (!props.userId || props.userId === authStore.user.id));

const settingsForm = ref({ name: '', daily_goal: 0, body_weight: 0 });

const selectAvatar = async (url) => {
  try {
    const res = await axios.post('/api/users/avatar', { avatar_url: url });
    const finalUrl = res.data?.user?.avatar_url || url;
    user.value.avatar_url = finalUrl;
    authStore.user.avatar_url = finalUrl;
    notificationStore.notify(i18nStore.t('profile_updated'), 'success');
    showAvatarSelector.value = false;
  } catch (err) {
    notificationStore.notify('Error updating avatar protocol', 'error');
  }
};

const getClassLabel = (i) => {
  const classes = [
    'Artorias', 'Solaire', 'Scorpion', 'Subzero', 'Steve', 'Creeper', 'Kratos', 'Atreus', 'Melina', 'Malenia', 
    'Hunter', 'Link', 'Zelda', 'Geralt', 'Ciri', 'Chief', 'Doom', 'Ryu', 'ChunLi', 'Kazuya', 
    'Cloud', 'Sephiroth', 'Leon', 'Snake', 'Aloy', 'Drake', 'Arthur', 'Ellie', 'Mario', 'Pikachu',
    'Warrior', 'Mage', 'Rogue', 'Paladin', 'Ranger', 'Necro', 'Barbarian', 'Monk', 'Druid', 'Valkyrie'
  ];
  return classes[i-1] || 'Recruit';
};

const onProfileUpdated = (updatedUser) => {
  user.value = { ...user.value, ...updatedUser };
  settingsForm.value = { 
    name: updatedUser.name, 
    daily_goal: updatedUser.daily_goal, 
    body_weight: updatedUser.body_weight 
  };
};

const handleLogout = () => {
    authStore.logout();
    window.location.href = '/';
};

const fetchProfile = async () => {
  loading.value = true;
  transactionsPage.value = 1;
  hasMoreTransactions.value = true;
  try {
    const targetId = props.userId || authStore.user?.id;
    if (!targetId) {
      router.push({ name: 'login', params: { lang: i18nStore.locale } });
      return;
    }
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
watch(() => props.userId, fetchProfile);
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; backdrop-filter: blur(0px); }

.animate-modal-in { animation: modalZoom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes modalZoom { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
</style>

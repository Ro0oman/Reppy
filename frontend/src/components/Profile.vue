<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div v-if="loading" class="animate-pulse space-y-8">
      <div class="h-32 bg-zinc-200 dark:bg-white/5 rounded-[2rem]"></div>
      <div class="h-64 bg-zinc-200 dark:bg-white/5 rounded-[2rem]"></div>
    </div>
    
    <template v-else>
      <!-- Profile Header Showcase -->
      <div class="glass relative p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-zinc-200 dark:border-white/10 overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
        <!-- Magic Glow -->
        <div class="absolute -top-32 -right-32 w-96 h-96 bg-primary-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div class="relative group">
          <AvatarFrame :src="user.avatar_url" :border-css="user.border_css" :size="128" />
          <div v-if="isOwnProfile" @click="triggerAvatarUpload" class="absolute bottom-[-10px] right-[-10px] p-3 bg-primary-600 rounded-full cursor-pointer hover:bg-primary-500 shadow-xl text-white z-10">
            <Camera class="w-5 h-5" />
            <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/jpeg, image/png, image/webp" class="hidden" />
          </div>
        </div>

        <div class="flex-1 space-y-2">
          <h2 class="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-white" :class="user.title_css">{{ user.name }}</h2>
          <p class="text-sm font-bold text-zinc-500 uppercase tracking-widest">{{ user.title_name || 'Novato' }}</p>
          <div class="flex items-center justify-center md:justify-start gap-4 mt-2">
            <span class="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold rounded-lg text-sm border border-amber-500/20">
              🪙 {{ user.reppy_coins || 0 }}
            </span>
          </div>
          
          <div class="flex items-center gap-2 mt-4 px-1">
            <h4 class="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Atributos RPG</h4>
            <button @click="showInfoModal = true" class="p-1 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors">
              <HelpCircle class="w-3 h-3 text-zinc-400 hover:text-primary-500" />
            </button>
          </div>
          <div class="grid grid-cols-4 gap-2 mt-2 max-w-sm">
            <div v-for="attr in attributes" :key="attr.key" 
                 class="group relative text-center p-2 rounded-xl border transition-all duration-500"
                 :class="getAttrColor(attr.lvl)">
              <div class="absolute inset-0 bg-white/20 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
              <p class="text-[10px] font-black uppercase mb-0.5 tracking-tighter" :class="attr.labelColor">{{ attr.key }}</p>
              <div class="flex flex-col leading-none">
                <p class="text-xs font-black text-zinc-900 dark:text-white">Lvl {{ attr.lvl }}</p>
                <p class="text-[8px] font-bold text-zinc-500 opacity-60">({{ attr.xp }})</p>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="isOwnProfile" class="absolute top-6 right-6">
          <button @click="authStore.logout()" class="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors">
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- User Stats & Heatmap -->
      <div class="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-zinc-200 dark:border-white/10 space-y-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <Activity class="w-6 h-6 text-zinc-500" />
          </div>
          <h3 class="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Actividad Histórica</h3>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="glass p-4 rounded-xl border border-zinc-200 dark:border-white/5 text-center flex flex-col items-center justify-center group overflow-hidden relative">
                <div class="absolute -bottom-4 -right-4 w-12 h-12 bg-primary-500/10 rounded-full blur-xl group-hover:bg-primary-500/20 transition-colors"></div>
                <p class="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Total Reps</p>
                <p class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">{{ stats.totalReps || 0 }}</p>
            </div>
            <div class="glass p-4 rounded-xl border border-zinc-200 dark:border-white/5 text-center flex flex-col items-center justify-center group overflow-hidden relative">
                <div class="absolute -bottom-4 -right-4 w-12 h-12 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-colors"></div>
                <p class="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Racha Actual</p>
                <div class="flex items-center gap-2">
                  <p class="text-3xl font-black text-orange-500">{{ stats.streak || 0 }}</p>
                  <Flame class="w-6 h-6 text-orange-500 fill-orange-500/20 animate-pulse" />
                </div>
            </div>
            <div class="glass p-4 rounded-xl border border-zinc-200 dark:border-white/5 text-center flex flex-col items-center justify-center group overflow-hidden relative">
                <div class="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors"></div>
                <p class="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Meta Diaria</p>
                <p class="text-3xl font-black text-emerald-500">{{ user.daily_goal || 0 }}</p>
            </div>
            <div class="glass p-4 rounded-xl border border-zinc-200 dark:border-white/5 text-center flex flex-col items-center justify-center group overflow-hidden relative">
                <div class="absolute -bottom-4 -right-4 w-12 h-12 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-colors"></div>
                <p class="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Fav Exercise</p>
                <p class="text-sm font-black text-purple-500 uppercase tracking-tighter">{{ translateExercise(stats.favExercise) }}</p>
            </div>
        </div>

        <div class="space-y-4">
            <h4 class="text-xs font-black uppercase text-zinc-500 tracking-widest px-1">Distribución de Actividad</h4>
            <Heatmap :data="heatmapData" />
        </div>
      </div>

      <!-- Configuración Privada (Solo vista propia) -->
      <div v-if="isOwnProfile" class="glass p-8 rounded-[2.5rem] border-zinc-200 dark:border-white/10 space-y-8">
        <div class="flex items-center gap-4 mb-2">
          <div class="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <Settings class="w-6 h-6 text-zinc-500" />
          </div>
          <h3 class="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Configuración y Atributos</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Nombre Público</label>
            <input v-model="settingsForm.name" type="text"
              class="w-full bg-black/5 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm focus:border-primary-500/50 outline-none transition-all shadow-inner" />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Meta Diaria General</label>
            <input v-model.number="settingsForm.daily_goal" type="number"
              class="w-full bg-black/5 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm focus:border-primary-500/50 outline-none transition-all shadow-inner" />
          </div>
          <div class="space-y-1.5 md:col-span-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Peso Corporal (Kg)</label>
            <input v-model.number="settingsForm.body_weight" type="number" step="0.1"
              class="w-full bg-black/5 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm focus:border-primary-500/50 outline-none transition-all shadow-inner" />
          </div>
        </div>

        <button @click="saveSettings"
          class="w-full bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-primary-900/20 active:scale-[0.98]">
          Guardar Configuración
        </button>
      </div>

    </template>

    <!-- RPG Info Modal -->
    <Teleport to="body">
      <div v-if="showInfoModal" 
           class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="glass max-w-xl w-full p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
          <!-- Themed Background Deco -->
          <div class="absolute -top-12 -right-12 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="flex items-center justify-between mb-8">
            <div class="flex flex-col">
              <h3 class="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Códice de Guerra</h3>
              <p class="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em] mt-2">Guía de Ascensión RPG</p>
            </div>
            <button @click="showInfoModal = false" class="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90">
              <XIcon class="w-6 h-6 text-white" />
            </button>
          </div>

          <!-- Tabs Switcher -->
          <div class="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 mb-8">
            <button @click="infoTab = 'attributes'" 
                    class="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300"
                    :class="infoTab === 'attributes' ? 'bg-primary-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'">
              Atributos
            </button>
            <button @click="infoTab = 'ranks'" 
                    class="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300"
                    :class="infoTab === 'ranks' ? 'bg-primary-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'">
              Niveles de Rango
            </button>
          </div>

          <!-- Attributes Tab -->
          <div v-if="infoTab === 'attributes'" class="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div class="grid grid-cols-1 gap-4">
              <div class="flex gap-4 items-start p-5 bg-gradient-to-br from-red-500/10 to-red-950/20 border border-red-500/20 rounded-[1.5rem] group hover:border-red-500/40 transition-all">
                <div class="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:scale-110 transition-transform"><Sword class="w-5 h-5" /></div>
                <div>
                  <h4 class="font-black text-red-500 uppercase text-xs tracking-widest mb-1">Fuerza (STR)</h4>
                  <p class="text-zinc-400 text-xs leading-relaxed italic mb-1">"Kratos moviendo los templos del Olimpo."</p>
                  <p class="text-zinc-300 text-[11px]">Sube con la **Carga Total**. Influenciada por tu peso corporal y lastre acumulado.</p>
                </div>
              </div>

              <div class="flex gap-4 items-start p-5 bg-gradient-to-br from-orange-500/10 to-orange-950/20 border border-orange-500/20 rounded-[1.5rem] group hover:border-orange-500/40 transition-all">
                <div class="p-3 bg-orange-500/10 rounded-xl text-orange-500 group-hover:scale-110 transition-transform"><Zap class="w-5 h-5" /></div>
                <div>
                  <h4 class="font-black text-orange-500 uppercase text-xs tracking-widest mb-1">Potencia (PWR)</h4>
                  <p class="text-zinc-400 text-xs leading-relaxed italic mb-1">"Golpe crítico que rompe cualquier guardia."</p>
                  <p class="text-zinc-300 text-[11px]">Premia la intensidad absoluta. Basada en tu **Récord de Lastre** en una serie.</p>
                </div>
              </div>

              <div class="flex gap-4 items-start p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-950/20 border border-emerald-500/20 rounded-[1.5rem] group hover:border-emerald-500/40 transition-all">
                <div class="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform"><Heart class="w-5 h-5" /></div>
                <div>
                  <h4 class="font-black text-emerald-500 uppercase text-xs tracking-widest mb-1">Resistencia (END)</h4>
                  <p class="text-zinc-400 text-xs leading-relaxed italic mb-1">"Tu barra de estamina de Elden Ring."</p>
                  <p class="text-zinc-300 text-[11px]">Gasolina pura. Escala con el **Volumen Total de Repeticiones** sin descanso.</p>
                </div>
              </div>

              <div class="flex gap-4 items-start p-5 bg-gradient-to-br from-blue-500/10 to-blue-950/20 border border-blue-500/20 rounded-[1.5rem] group hover:border-blue-500/40 transition-all">
                <div class="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform"><Shield class="w-5 h-5" /></div>
                <div>
                  <h4 class="font-black text-blue-500 uppercase text-xs tracking-widest mb-1">Agilidad (AGI)</h4>
                  <p class="text-zinc-400 text-xs leading-relaxed italic mb-1">"Escudo recargable del Jefe Maestro."</p>
                  <p class="text-zinc-300 text-[11px]">Consistencia táctica. Subida por **Racha Diaria** y **Variedad de ejercicios**.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Ranks Tab -->
          <div v-if="infoTab === 'ranks'" class="space-y-4 animate-in slide-in-from-left-4 duration-300">
            <div class="space-y-2">
              <div v-for="rank in rankLevels" :key="rank.name" 
                   class="flex items-center gap-4 p-4 rounded-2xl border border-white/5 transition-all"
                   :class="stats.totalXP >= rank.min ? 'bg-white/5 border-primary-500/20 ring-1 ring-primary-500/10' : 'opacity-40 grayscale blur-[1px]'">
                <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-lg shadow-inner">
                  {{ rank.icon }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h5 class="text-[11px] font-black uppercase tracking-widest transition-colors" :class="stats.totalXP >= rank.min ? 'text-white' : 'text-zinc-600'">{{ rank.name }}</h5>
                    <span class="text-[10px] font-black" :class="stats.totalXP >= rank.min ? 'text-primary-400' : 'text-zinc-700'">{{ rank.min }}+ XP</span>
                  </div>
                  <p class="text-[10px] text-zinc-500 font-bold italic mt-0.5">{{ rank.game }}</p>
                </div>
                <div v-if="stats.totalXP >= rank.min" class="text-primary-500">
                  <Trophy class="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div class="bg-primary-500/10 p-4 rounded-2xl border border-primary-500/20">
            <p class="text-[10px] font-bold text-center text-primary-400 uppercase tracking-widest">Siguiente Nivel: Cada 100 XP acumulados</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { Camera, Settings, LogOut, Activity, Flame, Trophy, User, HelpCircle, X as XIcon, Sword, Zap, Heart, Shield } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import Heatmap from './Heatmap.vue';
import AvatarFrame from './AvatarFrame.vue';
import axios from 'axios';

const props = defineProps({
  userId: {
    type: String,
    default: null
  }
});

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const user = ref({});
const stats = ref({});
const heatmapData = ref([]);
const loading = ref(true);
const showInfoModal = ref(false);
const infoTab = ref('attributes');
const fileInput = ref(null);

const rankLevels = [
  { name: 'Novato de Midgard', min: 0, icon: '🛡️', game: 'Iniciado en el camino de Kratos' },
  { name: 'Guerrero Espartano', min: 501, icon: '⚔️', game: 'Disciplina de los 300' },
  { name: 'Asesino de Dragones', min: 1501, icon: '🐉', game: 'Sangre de Dovahkiin' },
  { name: 'Campeón del Olimpo', min: 5001, icon: '⛰️', game: 'Favor de los Dioses' },
  { name: 'Dios de la Guerra', min: 15001, icon: '🔥', game: 'Deidad del Dominio Físico' },
  { name: 'Espectro de Reppy', min: 40001, icon: '💀', game: 'Mito viviente de las barras' }
];

const attributes = computed(() => [
  { key: 'STR', xp: user.value.str_xp || 0, lvl: user.value.str_lvl || 1, labelColor: 'text-red-500' },
  { key: 'PWR', xp: user.value.pwr_xp || 0, lvl: user.value.pwr_lvl || 1, labelColor: 'text-orange-500' },
  { key: 'END', xp: user.value.end_xp || 0, lvl: user.value.end_lvl || 1, labelColor: 'text-emerald-500' },
  { key: 'AGI', xp: user.value.agi_xp || 0, lvl: user.value.agi_lvl || 1, labelColor: 'text-blue-500' }
]);

const getAttrColor = (lvl) => {
  if (lvl >= 31) return 'bg-orange-500/10 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2)] animate-pulse shadow-orange-500/20';
  if (lvl >= 16) return 'bg-amber-500/5 border-amber-500/30';
  if (lvl >= 6) return 'bg-blue-500/5 border-blue-500/20';
  return 'bg-zinc-100 dark:bg-black/30 border-zinc-200 dark:border-white/5';
};

const translateExercise = (type) => {
  const map = {
    'pullups': 'Dominadas',
    'pushups': 'Flexiones',
    'dips': 'Fondos',
    'squats': 'Sentadillas'
  };
  return map[type] || type;
};

const isOwnProfile = computed(() => {
  return !props.userId || props.userId === authStore.user?.id;
});

const settingsForm = ref({
  name: '',
  daily_goal: 0,
  body_weight: 0
});

const triggerAvatarUpload = () => {
  if (fileInput.value) fileInput.value.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    notificationStore.notify('El archivo es demasiado grande (Máx 5MB).', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const res = await axios.post('/api/users/avatar', { avatarBase64: e.target.result });
      authStore.user.avatar_url = res.data.avatarUrl;
      if (isOwnProfile.value) user.value.avatar_url = res.data.avatarUrl;
      notificationStore.notify('Avatar actualizado', 'success');
    } catch (err) {
      notificationStore.notify('Error al subir avatar', 'error');
    }
  };
  reader.readAsDataURL(file);
};

const saveSettings = async () => {
  try {
    const res = await axios.patch('/api/users/profile', settingsForm.value);
    authStore.user.name = res.data.user.name;
    authStore.user.daily_goal = res.data.user.daily_goal;
    authStore.user.body_weight = res.data.user.body_weight;
    
    user.value.name = res.data.user.name;
    user.value.daily_goal = res.data.user.daily_goal;
    notificationStore.notify('Configuracion guardada', 'success');
  } catch (error) {
    notificationStore.notify('Error guardando configuracion', 'error');
  }
};

const fetchProfile = async () => {
  loading.value = true;
  const targetId = props.userId || authStore.user?.id;
  try {
    const res = await axios.get(`/api/profile/${targetId}`);
    user.value = res.data.user;
    stats.value = res.data.stats;
    heatmapData.value = res.data.heatmap;
    
    if (isOwnProfile.value) {
        settingsForm.value = {
            name: user.value.name || '',
            daily_goal: user.value.daily_goal || 0,
            body_weight: user.value.body_weight || 75
        };
    }
  } catch (error) {
    console.error(error);
    notificationStore.notify('Error al cargar perfil', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});

watch(() => props.userId, () => {
  fetchProfile();
});
</script>

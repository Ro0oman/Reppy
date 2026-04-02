<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div v-if="loading" class="animate-pulse space-y-8">
      <div class="h-32 bg-zinc-200 dark:bg-white/5 rounded-[2rem]"></div>
      <div class="h-64 bg-zinc-200 dark:bg-white/5 rounded-[2rem]"></div>
    </div>
    
    <template v-else>
      <!-- Profile Header Showcase -->
      <div class="glass relative p-8 rounded-[2.5rem] border-zinc-200 dark:border-white/10 overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
        <!-- Magic Glow -->
        <div class="absolute -top-32 -right-32 w-96 h-96 bg-primary-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div class="relative group">
          <div class="w-32 h-32 rounded-[2rem] border-4 border-zinc-200 dark:border-white/10 overflow-hidden shadow-2xl transition-transform hover:scale-105"
               :class="user.border_css">
            <img :src="user.avatar_url" class="w-full h-full object-cover" />
          </div>
          <div v-if="isOwnProfile" @click="triggerAvatarUpload" class="absolute bottom-[-10px] right-[-10px] p-3 bg-primary-600 rounded-full cursor-pointer hover:bg-primary-500 shadow-xl text-white">
            <Camera class="w-5 h-5" />
            <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/jpeg, image/png, image/webp" class="hidden" />
          </div>
        </div>

        <div class="flex-1 space-y-2">
          <h2 class="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white" :class="user.title_css">{{ user.name }}</h2>
          <p class="text-sm font-bold text-zinc-500 uppercase tracking-widest">{{ user.title_name || 'Novato' }}</p>
          <div class="flex items-center justify-center md:justify-start gap-4 mt-2">
            <span class="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold rounded-lg text-sm border border-amber-500/20">
              🪙 {{ user.reppy_coins || 0 }}
            </span>
          </div>
          
          <div class="grid grid-cols-4 gap-2 mt-4 max-w-sm">
            <div class="text-center bg-zinc-100 dark:bg-black/30 p-2 rounded-xl border border-zinc-200 dark:border-white/5">
              <p class="text-[10px] font-black uppercase text-red-500">STR</p>
              <p class="font-bold text-zinc-900 dark:text-white">{{ user.str_xp || 0 }}</p>
            </div>
            <div class="text-center bg-zinc-100 dark:bg-black/30 p-2 rounded-xl border border-zinc-200 dark:border-white/5">
              <p class="text-[10px] font-black uppercase text-blue-500">PWR</p>
              <p class="font-bold text-zinc-900 dark:text-white">{{ user.pwr_xp || 0 }}</p>
            </div>
            <div class="text-center bg-zinc-100 dark:bg-black/30 p-2 rounded-xl border border-zinc-200 dark:border-white/5">
              <p class="text-[10px] font-black uppercase text-green-500">END</p>
              <p class="font-bold text-zinc-900 dark:text-white">{{ user.end_xp || 0 }}</p>
            </div>
            <div class="text-center bg-zinc-100 dark:bg-black/30 p-2 rounded-xl border border-zinc-200 dark:border-white/5">
              <p class="text-[10px] font-black uppercase text-purple-500">AGI</p>
              <p class="font-bold text-zinc-900 dark:text-white">{{ user.agi_xp || 0 }}</p>
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
      <div class="glass p-8 rounded-[2.5rem] border-zinc-200 dark:border-white/10 space-y-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <Activity class="w-6 h-6 text-zinc-500" />
          </div>
          <h3 class="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Actividad Histórica</h3>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="glass p-4 rounded-xl border border-zinc-200 dark:border-white/5 text-center">
                <p class="text-xs font-black uppercase text-zinc-500">Repeticiones Totales</p>
                <p class="text-3xl font-black text-primary-500">{{ stats.totalReps || 0 }}</p>
            </div>
            <div class="glass p-4 rounded-xl border border-zinc-200 dark:border-white/5 text-center">
                <p class="text-xs font-black uppercase text-zinc-500">Meta Diaria (Actual)</p>
                <p class="text-3xl font-black text-primary-500">{{ user.daily_goal || 0 }}</p>
            </div>
        </div>

        <div class="overflow-hidden h-[200px] pointer-events-none opacity-80" style="filter: grayscale(0.5);">
            <!-- Mock heatmap display or import Heatmap component if desired. To keep it simple we show a placeholder box -->
            <div class="h-full w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-white/5">
                <p class="text-xs font-bold text-zinc-500">(Heatmap Visualizer - PRÓXIMAMENTE)</p>
            </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { Camera, Settings, LogOut, Activity } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
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
const loading = ref(true);
const fileInput = ref(null);

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
    const res = await axios.put('/api/users/settings', settingsForm.value);
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

<template>
  <div class="max-w-6xl mx-auto w-full px-4 space-y-10 pb-20">
    <!-- Header -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div class="flex items-center gap-5">
        <div class="relative">
          <img :src="authStore.user?.avatar_url" class="w-16 h-16 rounded-full border-2 border-primary-500/50 p-0.5 shadow-lg shadow-primary-500/10" />
          <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[#09090b] rounded-full"></div>
        </div>
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-white">{{ authStore.user?.name }}</h2>
          <div class="flex items-center gap-2 text-zinc-500">
            <Mail class="w-3.5 h-3.5" />
            <span class="text-sm font-medium">{{ authStore.user?.email }}</span>
          </div>
        </div>
      </div>
      <div class="flex gap-3">
        <button 
          @click="fetchData"
          class="p-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
          title="Refresh data"
        >
          <RotateCw class="w-5 h-5 text-zinc-400" />
        </button>
        <button 
          @click="authStore.logout()"
          class="flex items-center gap-2 px-5 py-2.5 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl font-medium transition-all"
        >
          <LogOut class="w-4 h-4" />
          <span>{{ i18n.t('sign_out') }}</span>
        </button>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Reps -->
      <div class="glass glass-hover relative overflow-hidden p-6 rounded-3xl shadow-xl transition-all duration-500">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <Trophy class="w-12 h-12 text-primary-400" />
        </div>
        <span class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{{ i18n.t('stats_total') }}</span>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-5xl font-black text-white tracking-tighter">{{ totalReps }}</span>
          <span class="text-primary-500 text-[10px] font-black uppercase tracking-widest">{{ i18n.t('stats_gains') }}</span>
        </div>
      </div>
      
      <!-- Daily Goal Card -->
      <div class="glass glass-hover relative overflow-hidden p-6 rounded-3xl shadow-xl transition-all duration-500">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <Target class="w-12 h-12 text-blue-400" />
        </div>
        <span class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{{ i18n.t('daily_goal') }}</span>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-5xl font-black text-white tracking-tighter">{{ stats.dailyGoal }}</span>
          <span class="text-blue-500 text-[10px] font-black uppercase tracking-widest">{{ i18n.t('stats_reps') }}</span>
        </div>
      </div>

      <!-- Streak Card -->
      <div class="glass glass-hover relative overflow-hidden p-6 rounded-3xl shadow-xl transition-all duration-500">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <Flame class="w-12 h-12 text-orange-400" />
        </div>
        <span class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{{ i18n.t('stats_streak') }}</span>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-5xl font-black text-white tracking-tighter">{{ stats.streak }}</span>
          <span class="text-orange-500 text-[10px] font-black uppercase tracking-widest">{{ i18n.t('stats_days') }}</span>
        </div>
      </div>

      <!-- Top Month Card -->
      <div class="glass glass-hover relative overflow-hidden p-6 rounded-3xl shadow-xl transition-all duration-500">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <Zap class="w-12 h-12 text-yellow-400" />
        </div>
        <span class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{{ i18n.t('stats_top_month') }}</span>
        <div class="flex flex-col mt-2">
          <span class="text-2xl font-black text-white uppercase tracking-tighter">{{ stats.topMonth }}</span>
          <span class="text-yellow-500 text-[10px] font-black uppercase tracking-widest">{{ stats.topMonthCount }} REPS</span>
        </div>
      </div>
    </div>

    <!-- Daily Goal Progress -->
    <div class="glass p-8 rounded-[2.5rem] border-white/10 relative overflow-hidden group">
      <div class="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div class="relative z-10">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-black text-white uppercase tracking-tighter">{{ i18n.t('goal_progress') }}</h3>
            <p class="text-xs text-zinc-500">{{ todayProgress }} / {{ stats.dailyGoal }} {{ i18n.t('stats_reps') }}</p>
          </div>
          <div class="p-4 bg-primary-500/10 rounded-2xl shadow-lg border border-primary-500/20">
            <Zap class="w-6 h-6 text-primary-500 animate-pulse" />
          </div>
        </div>
        <div class="w-full h-5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-1 shadow-inner">
          <div 
            class="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            :style="{ width: `${Math.min((todayProgress / stats.dailyGoal) * 100, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Configuration Section (Settings & Management) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Profile Customization -->
      <div class="glass p-8 rounded-[2.5rem] border-white/10 space-y-8">
        <div class="flex items-center gap-4 mb-2">
          <div class="p-3 bg-zinc-800 rounded-2xl">
            <Settings class="w-6 h-6 text-zinc-400" />
          </div>
          <h3 class="text-xl font-black text-white uppercase tracking-tighter">{{ i18n.t('settings_title') }}</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">{{ i18n.t('profile_name') }}</label>
            <input 
              v-model="settingsForm.name" 
              type="text" 
              class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-500/50 outline-none transition-all shadow-inner"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">{{ i18n.t('daily_goal') }}</label>
            <input 
              v-model.number="settingsForm.daily_goal" 
              type="number" 
              class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary-500/50 outline-none transition-all shadow-inner"
            />
          </div>
        </div>
        
        <button 
          @click="saveSettings"
          class="w-full bg-primary-600 hover:bg-primary-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-primary-900/20 active:scale-[0.98]"
        >
          {{ i18n.t('save_settings') }}
        </button>
      </div>

      <!-- Identity & Privacy -->
      <div class="space-y-6">
        <!-- Avatar Change -->
        <div class="glass p-6 rounded-3xl border-white/5 flex items-center justify-between group">
          <div class="flex items-center gap-4">
            <div 
              @click="triggerAvatarUpload"
              class="p-4 bg-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-700 transition-colors relative overflow-hidden"
            >
              <Camera class="w-6 h-6 text-zinc-400" />
              <input type="file" ref="avatarInput" class="hidden" accept="image/*" @change="handleAvatarChange" />
            </div>
            <div>
              <h4 class="font-bold text-white uppercase tracking-tight">{{ i18n.t('change_avatar') }}</h4>
              <p class="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Protocol Identity</p>
            </div>
          </div>
          <div class="w-12 h-12 rounded-full border border-white/10 overflow-hidden shadow-2xl">
            <img :src="authStore.user?.avatar_url" class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- Privacy Toggle -->
        <div class="glass p-6 rounded-3xl border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="p-4 bg-zinc-800 rounded-2xl">
              <ShieldAlert class="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <h3 class="font-bold text-white uppercase tracking-tight">{{ i18n.t('privacy_settings') }}</h3>
              <p class="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{{ i18n.t('private_desc') }}</p>
            </div>
          </div>
          <button 
            @click="togglePrivacy"
            class="relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none shadow-inner"
            :class="authStore.user?.is_private ? 'bg-primary-600' : 'bg-zinc-800'"
          >
            <span
              class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg"
              :class="authStore.user?.is_private ? 'translate-x-[1.75rem]' : 'translate-x-1'"
            />
          </button>
        </div>

        <!-- Danger Zone -->
        <div class="glass p-6 rounded-3xl border-red-500/10 flex items-center justify-between">
           <div class="flex items-center gap-4">
            <div class="p-4 bg-red-500/5 rounded-2xl">
              <Trash2 class="w-6 h-6 text-red-500/50" />
            </div>
            <div>
              <h3 class="font-bold text-red-500/80 uppercase tracking-tight">{{ i18n.t('delete_account') }}</h3>
              <button @click="handleDeleteAccount" class="text-[9px] font-black text-red-500/30 hover:text-red-500 uppercase tracking-widest transition-colors">
                Terminal Termination
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Bottom -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Activity -->
      <div class="lg:col-span-2 space-y-10">
        <section class="space-y-4">
          <h3 class="text-base font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500 px-2">
            <Activity class="w-4 h-4 text-primary-500" />
            {{ i18n.t('activity_stream') }}
          </h3>
          <Heatmap :data="heatmapData" class="glass rounded-[2rem] p-8" />
        </section>

        <section class="space-y-4">
          <h3 class="text-base font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500 px-2">
            <History class="w-4 h-4 text-primary-500" />
            {{ i18n.t('recent_logs') }}
          </h3>
          <div class="glass rounded-[2rem] shadow-2xl overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-white/[0.02] text-zinc-600 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                <tr>
                  <th class="px-8 py-6">{{ i18n.t('table_date') }}</th>
                  <th class="px-8 py-6 text-right">{{ i18n.t('table_count') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.03]">
                <tr v-for="rep in reps" :key="rep.id" class="group hover:bg-white/[0.02] transition-all duration-300">
                  <td class="px-8 py-5 text-middle text-zinc-400 group-hover:text-white capitalize font-medium italic">{{ formatDate(rep.date) }}</td>
                  <td class="px-8 py-5 text-right font-mono text-xl font-black text-white group-hover:text-primary-500">
                    <div v-if="editingId === rep.id" class="flex items-center justify-end gap-3">
                      <input 
                        v-model.number="editValue" 
                        type="number" 
                        class="w-20 bg-zinc-900 border border-primary-500/50 rounded-lg px-2 py-1 text-right focus:outline-none shadow-inner"
                        @keyup.enter="saveEdit(rep.id)"
                      />
                      <button @click="saveEdit(rep.id)" class="p-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500 hover:text-white transition-all"><Check class="w-4 h-4" /></button>
                      <button @click="editingId = null" class="p-2 bg-zinc-800 text-zinc-500 rounded-lg hover:bg-zinc-700 hover:text-white transition-all"><X class="w-4 h-4" /></button>
                    </div>
                    <div v-else @click="startEdit(rep)" class="cursor-pointer">
                      {{ rep.count }}
                    </div>
                  </td>
                </tr>
                <tr v-if="reps.length === 0">
                  <td colspan="2" class="px-8 py-20 text-center">
                    <div class="flex flex-col items-center gap-4 opacity-20">
                      <Inbox class="w-12 h-12" />
                      <p class="text-xs font-black uppercase tracking-widest">{{ i18n.t('table_empty') }}</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Right Column: Input & Rankings -->
      <div class="space-y-10">
        <RepsInput @updated="fetchData" />
        
        <section class="space-y-6">
          <h3 class="text-base font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500 px-1">
            <BarChart3 class="w-4 h-4 text-primary-500" />
            {{ i18n.t('rankings') }}
          </h3>
          <Leaderboard ref="leaderboardRef" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import { 
  Trophy, Target, Flame, Zap, Activity, History, Mail, 
  RotateCw, LogOut, Inbox, BarChart3, Check, X, ShieldAlert, Camera, Trash2, Settings 
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import Heatmap from './Heatmap.vue';
import RepsInput from './RepsInput.vue';
import Leaderboard from './Leaderboard.vue';

const authStore = useAuthStore();
const i18n = useI18nStore();
const reps = ref([]);
const heatmapData = ref([]);
const totalReps = ref(0);
const stats = reactive({
  streak: 0,
  topMonth: 'N/A',
  topMonthCount: 0,
  dailyGoal: 50
});

const settingsForm = reactive({
  name: authStore.user?.name || '',
  daily_goal: authStore.user?.daily_goal || 50
});

const editingId = ref(null);
const editValue = ref(0);
const leaderboardRef = ref(null);
const avatarInput = ref(null);

const todayProgress = computed(() => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const todayEntry = reps.value.find(r => {
    return new Date(r.date).toLocaleDateString('en-CA') === today;
  });
  return todayEntry ? todayEntry.count : 0;
});

const fetchData = async () => {
  try {
    const statsPromises = [
      axios.get('/api/reps'),
      axios.get('/api/reps/heatmap'),
      axios.get('/api/reps/stats'),
      authStore.fetchProfile()
    ];
    
    const [repsRes, heatmapRes, statsRes] = await Promise.all(statsPromises);
    
    reps.value = repsRes.data;
    heatmapData.value = heatmapRes.data;
    totalReps.value = statsRes.data.totalReps;
    
    stats.streak = statsRes.data.streak;
    stats.topMonth = statsRes.data.topMonth;
    stats.topMonthCount = statsRes.data.topMonthCount;
    stats.dailyGoal = statsRes.data.dailyGoal || 50;
    
    // Sync settings form
    settingsForm.name = authStore.user?.name;
    settingsForm.daily_goal = stats.dailyGoal;

    if (leaderboardRef.value) {
      leaderboardRef.value.refresh();
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const saveSettings = async () => {
  try {
    await authStore.updateProfile(settingsForm);
    fetchData(); // Refresh everything
    alert(i18n.t('settings_success'));
  } catch (error) {
    alert('Failed to save settings');
  }
};

const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = async () => {
    try {
      await authStore.updateAvatar(reader.result);
    } catch (error) {
      alert('Failed to upload avatar');
    }
  };
  reader.readAsDataURL(file);
};

const handleDeleteAccount = async () => {
  if (confirm(i18n.t('delete_confirm'))) {
    try {
      await authStore.deleteAccount();
    } catch (error) {
      alert('Failed to delete account');
    }
  }
};

const togglePrivacy = async () => {
  try {
    await authStore.updateProfile({ is_private: !authStore.user?.is_private });
    // Also refresh leaderboard to reflect privacy change
    if (leaderboardRef.value) {
      leaderboardRef.value.refresh();
    }
  } catch (error) {
    console.error('Error toggling privacy:', error);
  }
};

const startEdit = (rep) => {
  editingId.value = rep.id;
  editValue.value = rep.count;
};

const saveEdit = async (id) => {
  try {
    await axios.put(`/api/reps/${id}`, { count: editValue.value });
    editingId.value = null;
    fetchData();
  } catch (error) {
    console.error('Error saving edit:', error);
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

onMounted(fetchData);
</script>

<style scoped>
.glass-hover:hover {
  transform: translateY(-4px);
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(249, 115, 22, 0.2);
}
</style>

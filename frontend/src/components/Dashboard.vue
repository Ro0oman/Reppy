<template>
  <div class="max-w-6xl mx-auto w-full px-4 space-y-10">
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
      
      <div class="glass glass-hover relative overflow-hidden p-6 rounded-3xl shadow-xl transition-all duration-500">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <Target class="w-12 h-12 text-blue-400" />
        </div>
        <span class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{{ i18n.t('stats_goal') }}</span>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-5xl font-black text-white tracking-tighter">20</span>
          <span class="text-blue-500 text-[10px] font-black uppercase tracking-widest">{{ i18n.t('stats_reps') }}</span>
        </div>
      </div>

      <div class="glass glass-hover relative overflow-hidden p-6 rounded-3xl shadow-xl transition-all duration-500">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <Flame class="w-12 h-12 text-orange-400" />
        </div>
        <span class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{{ i18n.t('stats_streak') }}</span>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-5xl font-black text-white tracking-tighter">{{ streak }}</span>
          <span class="text-orange-500 text-[10px] font-black uppercase tracking-widest">{{ i18n.t('stats_days') }}</span>
        </div>
      </div>

      <div class="glass glass-hover relative overflow-hidden p-6 rounded-3xl shadow-xl transition-all duration-500">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <Zap class="w-12 h-12 text-yellow-400" />
        </div>
        <span class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{{ i18n.t('stats_month') }}</span>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-5xl font-black text-white tracking-tighter">142</span>
          <span class="text-yellow-500 text-[10px] font-black uppercase tracking-widest">March</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-10">
        <section class="space-y-4">
          <div class="flex items-center justify-between px-2">
            <h3 class="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400">
              <Activity class="w-4 h-4 text-primary-500" />
              {{ i18n.t('activity_stream') }}
            </h3>
          </div>
          <Heatmap :data="heatmapData" class="glass rounded-3xl" />
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between px-2">
            <h3 class="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400">
              <History class="w-4 h-4 text-primary-500" />
              {{ i18n.t('recent_logs') }}
            </h3>
          </div>
          <div class="glass rounded-3xl shadow-xl overflow-hidden backdrop-blur-2xl">
            <table class="w-full text-left">
              <thead class="bg-white/[0.02] text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em]">
                <tr>
                  <th class="px-8 py-5">{{ i18n.t('table_date') }}</th>
                  <th class="px-8 py-5 text-right text-primary-500/50">{{ i18n.t('table_count') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.05]">
                <tr v-for="rep in reps" :key="rep.id" class="text-sm group hover:bg-white/[0.03] transition-all duration-300">
                  <td class="px-8 py-5 text-middle text-zinc-400 group-hover:text-white">{{ formatDate(rep.date) }}</td>
                  <td class="px-8 py-5 text-right font-mono font-black text-white group-hover:text-primary-400">
                    <div v-if="editingId === rep.id" class="flex items-center justify-end gap-2">
                      <input 
                        v-model.number="editValue" 
                        type="number" 
                        class="w-16 bg-zinc-800 border border-primary-500/50 rounded px-2 py-1 text-right focus:outline-none"
                        @keyup.enter="saveEdit(rep.id)"
                      />
                      <button @click="saveEdit(rep.id)" class="p-1 hover:text-green-500"><Check class="w-4 h-4" /></button>
                      <button @click="editingId = null" class="p-1 hover:text-red-500"><X class="w-4 h-4" /></button>
                    </div>
                    <div v-else @click="startEdit(rep)" class="cursor-pointer group-hover:underline">
                      {{ rep.count }}
                    </div>
                  </td>
                </tr>
                <tr v-if="reps.length === 0">
                  <td colspan="2" class="px-8 py-16 text-center">
                    <div class="flex flex-col items-center gap-2 opacity-30">
                      <Inbox class="w-10 h-10" />
                      <p class="text-sm italic">{{ i18n.t('table_empty') }}</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div class="space-y-10">
        <RepsInput @updated="fetchData" />
        
        <section class="space-y-4">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <BarChart3 class="w-5 h-5 text-primary-400" />
              {{ i18n.t('rankings') }}
            </h3>
          </div>
          <Leaderboard />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { 
  Trophy, Target, Flame, Zap, Activity, History, Mail, 
  RotateCw, LogOut, Inbox, BarChart3, Check, X 
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
const streak = ref(5); // Mock for now
const totalReps = ref(0);

const editingId = ref(null);
const editValue = ref(0);

const fetchData = async () => {
  try {
    const [repsRes, heatmapRes, statsRes] = await Promise.all([
      axios.get('/api/reps'),
      axios.get('/api/reps/heatmap'),
      axios.get('/api/reps/stats')
    ]);
    reps.value = repsRes.data;
    heatmapData.value = heatmapRes.data;
    totalReps.value = statsRes.data.totalReps;
    streak.value = statsRes.data.streak;
  } catch (error) {
    console.error('Error fetching data:', error);
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

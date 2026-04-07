<template>
  <div class="flex flex-col gap-6 p-2 sm:p-4 rounded-3xl overflow-hidden relative">
    
    <!-- Timeframe & Filter Controls -->
    <div class="flex flex-col gap-4 relative z-10 px-2">
      <!-- Friends vs Global Switcher -->
      <div v-if="authStore.isAuthenticated" class="flex p-1 bg-surface/40 rounded-xl border border-border mx-auto w-full max-w-md">
        <button 
          @click="type = 'friends'"
          class="flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-lg relative z-10"
          :class="type === 'friends' ? 'text-foreground' : 'text-muted hover:text-foreground'"
        >
          <span v-if="type === 'friends'" class="absolute inset-0 bg-foreground/5 border border-border rounded-lg"></span>
          FRIENDS
        </button>
        <button 
          @click="type = 'global'"
          class="flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-lg relative z-10"
          :class="type === 'global' ? 'text-foreground' : 'text-muted hover:text-foreground'"
        >
          <span v-if="type === 'global'" class="absolute inset-0 bg-foreground/5 border border-border rounded-lg"></span>
          GLOBAL
        </button>
      </div>

      <!-- Timeframe Segmented Control (Industrial Dock) -->
      <div class="flex gap-1 p-1 bg-surface/40 border border-border rounded-xl overflow-x-auto no-scrollbar">
        <button 
          v-for="tf in ['today', 'week', 'month', 'year', 'all']" 
          :key="tf"
          @click="timeframe = tf"
          class="flex-shrink-0 min-w-[70px] py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-lg relative z-10"
          :class="timeframe === tf ? 'text-primary-500' : 'text-muted hover:text-foreground'"
        >
          <span v-if="timeframe === tf" class="absolute inset-0 bg-foreground/5 border border-border rounded-lg"></span>
          {{ tf }}
        </button>
      </div>
    </div>

    <!-- Podium Section (Top 3) -->
    <div v-if="!loading && podiumUsers.length > 0" class="flex items-end justify-center gap-2 sm:gap-8 mt-12 mb-16 relative z-10">
      <!-- 2nd Place -->
      <div v-if="podiumUsers[1]" 
        @click="$emit('viewProfile', podiumUsers[1].id)"
        class="flex flex-col items-center group cursor-pointer transition-all">
        <div class="relative mb-3">
          <div class="p-1 rounded-full bg-gradient-to-b from-zinc-300 to-zinc-600 shadow-xl ring-2 ring-zinc-500/20">
            <AvatarFrame :src="podiumUsers[1].avatar_url" :border-css="podiumUsers[1].border_css" :avatar-css="podiumUsers[1].avatar_css" :size="72" />
          </div>
          <div class="absolute -bottom-2 -right-1 w-6 h-6 bg-muted rounded-full flex items-center justify-center border-2 border-background shadow-lg">
             <span class="text-[10px] font-black text-white">02</span>
          </div>
        </div>
        <p class="text-[10px] font-black text-muted uppercase tracking-tighter truncate w-20 text-center mb-0.5 font-tight">{{ podiumUsers[1].name }}</p>
        <span class="text-sm font-black text-foreground italic text-precision">{{ podiumUsers[1].total_reps }}</span>
      </div>

      <!-- 1st Place (Center) -->
      <div v-if="podiumUsers[0]" 
        @click="$emit('viewProfile', podiumUsers[0].id)"
        class="flex flex-col items-center group cursor-pointer transition-all -mt-8">
        <div class="relative mb-4">
          <div class="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl animate-bounce duration-[2000ms]">👑</div>
          <div class="p-1.5 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 shadow-[0_0_40px_rgba(255,69,0,0.2)] ring-4 ring-primary-500/20">
            <AvatarFrame :src="podiumUsers[0].avatar_url" :border-css="podiumUsers[0].border_css" :avatar-css="podiumUsers[0].avatar_css" :size="100" />
          </div>
          <div class="absolute -bottom-2 -right-1 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center border-4 border-background shadow-xl">
             <span class="text-xs font-black text-white">01</span>
          </div>
        </div>
        <p class="text-xs font-black text-foreground uppercase tracking-widest truncate w-28 text-center mb-0.5 leading-tight font-tight">{{ podiumUsers[0].name }}</p>
        <span class="text-2xl font-black text-primary-500 italic text-precision drop-shadow-lg">{{ podiumUsers[0].total_reps }}</span>
      </div>

      <!-- 3rd Place -->
      <div v-if="podiumUsers[2]" 
        @click="$emit('viewProfile', podiumUsers[2].id)"
        class="flex flex-col items-center group cursor-pointer transition-all">
        <div class="relative mb-3">
          <div class="p-1 rounded-full bg-gradient-to-b from-orange-400 to-orange-900 shadow-xl ring-2 ring-orange-500/20">
            <AvatarFrame :src="podiumUsers[2].avatar_url" :border-css="podiumUsers[2].border_css" :avatar-css="podiumUsers[2].avatar_css" :size="72" />
          </div>
          <div class="absolute -bottom-2 -right-1 w-6 h-6 bg-orange-950 rounded-full flex items-center justify-center border-2 border-background shadow-lg">
             <span class="text-[10px] font-black text-white">03</span>
          </div>
        </div>
        <p class="text-[10px] font-black text-muted uppercase tracking-tighter truncate w-20 text-center mb-0.5 font-tight">{{ podiumUsers[2].name }}</p>
        <span class="text-sm font-black text-foreground italic text-precision">{{ podiumUsers[2].total_reps }}</span>
      </div>
    </div>
    
    <!-- Regular List (Ranks 4+) -->
    <div class="space-y-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10 px-2 max-h-[500px]">
      <div 
        v-for="(user, index) in regularUsers" :key="user.id" 
        @click="$emit('viewProfile', user.id)"
        class="group flex items-center justify-between p-3 rounded-xl bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-all duration-300 border border-transparent hover:border-border"
        :class="{'!bg-primary-500/5 !border-primary-500/20' : user.id === authStore.user?.id}"
      >
        <div class="flex items-center gap-4 min-w-0 flex-1">
          <!-- Position Badge -->
          <div class="w-10 flex-shrink-0">
            <span class="text-[11px] font-black text-muted tracking-tighter font-precision italic">#{{ String(index + 4).padStart(2, '0') }}</span>
          </div>

          <!-- Avatar -->
          <div class="relative flex-shrink-0 transition-transform">
            <AvatarFrame :src="user.avatar_url" :border-css="user.border_css" :avatar-css="user.avatar_css" :size="42" />
            <div v-if="user.id === authStore.user?.id" class="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-background z-10 animate-pulse"></div>
          </div>

          <!-- User Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-black text-foreground truncate group-hover:text-primary-400 transition-colors tracking-tight uppercase italic leading-none font-tight">
                {{ user.id === authStore.user?.id ? 'YOU' : user.name }}
              </h4>
              <span v-if="user.title_name" class="hidden xs:inline-block text-[7px] uppercase tracking-widest px-2 py-0.5 rounded-md bg-foreground/5 border border-border font-black shrink-0" :class="user.title_css">
                {{ user.title_name }}
              </span>
            </div>
            <p class="text-[8px] text-muted font-bold uppercase tracking-widest mt-1">
              PRO ATLETA
            </p>
          </div>
        </div>
        
        <!-- Total Reps Stats -->
        <div class="flex flex-col items-end leading-none translate-y-[2px] ml-4">
          <span class="text-xl font-black text-foreground group-hover:text-primary-500 transition-colors italic text-precision leading-none">
            {{ user.total_reps }}
          </span>
          <p class="text-[7px] font-black text-muted uppercase tracking-widest mt-1 opacity-60 leading-none">REPS</p>
        </div>
      </div>
      
      <!-- Loading & Empty States -->
      <div v-if="loading" class="py-24 flex flex-col items-center gap-4">
        <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">SYNCING...</span>
      </div>
      
      <div v-if="!loading && users.length === 0" class="py-24 text-center opacity-30">
        <Users class="w-10 h-10 mx-auto mb-4 text-muted" />
        <p class="text-[10px] font-black text-muted uppercase tracking-widest leading-none">PROTOCOL DATA NULL</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { Users } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import AvatarFrame from './AvatarFrame.vue';

const authStore = useAuthStore();
const i18n = useI18nStore();

const props = defineProps({
  limit: { type: Number, default: 20 },
  exerciseType: { type: String, default: 'pullups' }
});

const emit = defineEmits(['viewProfile']);

const type = ref(authStore.isAuthenticated ? 'friends' : 'global');
const timeframe = ref('all');
const users = ref([]);
const loading = ref(false);

const podiumUsers = computed(() => users.value.slice(0, 3));
const regularUsers = computed(() => users.value.slice(3));

const fetchLeaderboard = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/api/leaderboard/${type.value}`, {
      params: { 
        timeframe: timeframe.value,
        type: props.exerciseType
      }
    });
    users.value = response.data.sort((a, b) => b.total_reps - a.total_reps);
  } catch (error) {
    console.error('Leaderboard sync error:', error);
  } finally {
    loading.value = false;
  }
};

watch([type, timeframe, () => props.exerciseType], fetchLeaderboard);
onMounted(fetchLeaderboard);

defineExpose({ refresh: fetchLeaderboard });
</script>

<style scoped>
.font-tight { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

</style>

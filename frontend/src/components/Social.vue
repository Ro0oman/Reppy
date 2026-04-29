<template>
  <div class="max-w-5xl mx-auto w-full px-4 pt-6 pb-32 space-y-8 relative">
    <!-- Animated Environment Blobs -->
    <div class="bg-glow">
      <div class="blob" style="top: 10%; left: -5%;"></div>
      <div class="blob" style="bottom: 20%; right: -5%; animation-delay: -10s; background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);"></div>
    </div>
    
    <div class="space-y-4 relative z-10">
      <!-- Community Hub simplified title -->
      <div class="flex flex-col gap-1 pt-2 relative">
          <h1 class="text-xl font-black text-foreground uppercase italic tracking-tighter">{{ i18n.t('community') }}</h1>
          <p class="text-[10px] text-muted uppercase tracking-widest opacity-60">{{ i18n.t('community_subtitle') }}</p>
          <LivePresence class="mt-4" />
      </div>


      <!-- Tab Navigation Premium (Tactical Redesign) -->
      <div class="flex items-center gap-1 p-1 bg-foreground/[0.04] border border-border rounded-2xl w-full sm:w-fit backdrop-blur-xl relative overflow-x-auto whitespace-nowrap no-scrollbar">
        <button 
          @click="activeTab = 'feed'"
          class="flex-none px-4 sm:px-6 py-3 rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2.5 relative group overflow-hidden whitespace-nowrap"
          :class="activeTab === 'feed' ? 'text-primary-400' : 'text-muted hover:text-foreground hover:bg-white/5'"
        >
          <Activity class="w-3.5 h-3.5" :class="activeTab === 'feed' ? 'animate-pulse' : ''" />
          <span>{{ i18n.t('social_wall') }}</span>
          
          <!-- Tactical Highlight Bar (Neon Precision) -->
          <div v-if="activeTab === 'feed'" class="absolute bottom-0 inset-x-4 h-[2px] bg-primary-500 tab-indicator-neon transition-all duration-300"></div>
        </button>

        <div class="h-4 w-px bg-foreground/10 hidden sm:block"></div>

        <button 
          @click="activeTab = 'rankings'"
          class="flex-none px-4 sm:px-6 py-3 rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2.5 relative group overflow-hidden whitespace-nowrap"
          :class="activeTab === 'rankings' ? 'text-primary-400' : 'text-muted hover:text-foreground hover:bg-white/5'"
        >
          <Trophy class="w-3.5 h-3.5" :class="activeTab === 'rankings' ? 'animate-pulse' : ''" />
          <span>{{ i18n.t('rankings') }}</span>
          
          <!-- Tactical Highlight Bar (Neon Precision) -->
          <div v-if="activeTab === 'rankings'" class="absolute bottom-0 inset-x-4 h-[2px] bg-primary-500 tab-indicator-neon transition-all duration-300"></div>
        </button>

        <div class="h-4 w-px bg-foreground/10 hidden sm:block"></div>

        <button 
          @click="activeTab = 'battles'"
          class="flex-none px-4 sm:px-6 py-3 rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2.5 relative group overflow-hidden whitespace-nowrap"
          :class="activeTab === 'battles' ? 'text-primary-400' : 'text-muted hover:text-foreground hover:bg-white/5'"
        >
          <Swords class="w-3.5 h-3.5" :class="activeTab === 'battles' ? 'animate-pulse' : ''" />
          <span>{{ i18n.t('pvp_tab') }}</span>
          
          <!-- Tactical Highlight Bar (Neon Precision) -->
          <div v-if="activeTab === 'battles'" class="absolute bottom-0 inset-x-4 h-[2px] bg-primary-500 tab-indicator-neon transition-all duration-300"></div>
        </button>
      </div>
    </div>

    <!-- Feed Tab -->
    <SocialFeed v-if="activeTab === 'feed'" @viewProfile="$emit('viewProfile', $event)" />

    <!-- Battles Tab -->
    <PvpBattlesTab v-else-if="activeTab === 'battles'" />

    <!-- Rankings Tab (Combined Search + Leaderboard) -->
    <div v-else class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Rankings Section -->
      <div class="space-y-4">
        <div class="card-stats !p-0 overflow-hidden border-border bg-surface/20 backdrop-blur-sm">
          <div class="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-foreground/[0.02]">
            <div class="flex items-center gap-3">
               <BarChart3 class="w-4 h-4 text-primary-500" />
               <div>
                 <h3 class="text-sm font-black text-industrial uppercase text-foreground tracking-tight leading-none">
                   {{ activeExerciseLabel }} <span class="text-muted/60 text-[10px]">{{ i18n.t('protocol_label') }}</span>
                 </h3>
                 <p class="text-[8px] font-black text-muted uppercase tracking-[0.2em] mt-1 opacity-50">{{ i18n.t('live_sync') }}</p>
               </div>
            </div>
            <ExerciseSelector v-model="activeExercise" class="!bg-transparent !p-0 w-full md:w-auto scale-90 md:origin-right" />
          </div>
          <Leaderboard 
            :exercise-type="activeExercise"
            @viewProfile="$emit('viewProfile', $event)"
            class="min-h-[300px]"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <!-- Search Users -->
        <section class="space-y-6">
          <div class="flex items-center gap-2">
            <Search class="w-4 h-4 text-primary-500" />
            <h3 class="text-xs font-black uppercase tracking-[0.4em] text-muted">{{ i18n.t('find_operatives') }}</h3>
          </div>

          <div class="relative group">
            <input v-model="searchQuery" @input="searchUsers" type="text" :placeholder="i18n.t('search_placeholder')"
              class="w-full bg-foreground/[0.04] border border-border rounded-2xl px-8 py-5 focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 shadow-2xl transition-all placeholder:text-muted/50 font-black text-foreground uppercase tracking-[0.2em] text-[10px]" />
            <div
              class="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-700">
            </div>
          </div>

          <div class="space-y-4">
            <TransitionGroup name="list">
              <div v-for="user in searchResults" :key="user.id"
                @click="$emit('viewProfile', user.id)"
                :title="i18n.locale === 'es' ? `Ver perfil de ${user.name}` : `View ${user.name}'s profile`"
                class="w-full text-left bg-foreground/[0.02] border border-border p-5 rounded-3xl flex items-center justify-between hover:bg-foreground/[0.04] transition-all group cursor-pointer active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary-500/50 outline-none">
                <div class="flex items-center gap-4">
                  <AvatarFrame :src="user.avatar_url" :border-css="user.border_css" :avatar-css="user.avatar_css" :size="48" />
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="font-black text-foreground uppercase tracking-tight group-hover:text-primary-500 transition-colors text-sm">{{ user.name }}</p>
                      <div class="flex items-center gap-1 bg-foreground/5 px-1.5 py-0.5 rounded border border-border/30">
                        <span class="text-[6px] font-black text-primary-500/80 tracking-widest uppercase">{{ i18n.t('ui_lvl') }}</span>
                        <span class="text-[8px] font-black text-foreground italic">{{ user.current_level }}</span>
                      </div>
                    </div>
                    <p class="text-[9px] text-muted font-black uppercase tracking-[0.2em] mt-1.5 opacity-70">{{ user.total_reps }} {{ i18n.t('reps_collected') }}</p>
                  </div>
                </div>
                <button @click.stop="addFriend(user.id)"
                  class="flex items-center gap-3 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 text-foreground-inverse">
                  <UserPlus class="w-3.5 h-3.5" />
                  {{ i18n.t('btn_add_friend') }}
                </button>
              </div>
            </TransitionGroup>

            <div v-if="searchQuery && !loadingSearch && searchResults.length === 0"
              class="p-12 text-center bg-surface/10 border border-dashed border-border rounded-2xl">
              <SearchX class="w-8 h-8 text-muted/30 mx-auto mb-2" />
              <p class="text-sm text-muted italic">{{ i18n.t('no_results') }}</p>
            </div>
          </div>
        </section>

        <!-- Friends List -->
        <section class="space-y-6">
          <div class="flex items-center gap-2">
            <Heart class="w-4 h-4 text-primary-500 fill-primary-500/20" />
            <h3 class="text-xs font-black uppercase tracking-[0.4em] text-muted">{{ i18n.t('inner_circle') }}</h3>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <TransitionGroup name="list">
              <div v-for="friend in friends" :key="friend.id"
                @click="$emit('viewProfile', friend.id)"
                :title="i18n.t('ui_view_profile', { name: friend.name })"
                class="w-full text-left bg-foreground/[0.02] border border-border hover:border-primary-500/30 group p-6 rounded-[2rem] flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary-500/50 outline-none">
                <div class="flex items-center gap-5">
                  <div class="relative">
                    <AvatarFrame :src="friend.avatar_url" :border-css="friend.border_css" :avatar-css="friend.avatar_css" :size="64" class="transition-transform" />
                    <div
                      class="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center border-4 border-background shadow-xl">
                      <Check class="w-3 h-3 text-foreground-inverse" />
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                      <p class="text-lg sm:text-xl font-black text-foreground tracking-tight group-hover:text-primary-500 transition-colors uppercase italic font-industrial truncate">{{ friend.name }}</p>
                      <div class="flex items-center gap-1.5 bg-primary-500/10 px-2 py-0.5 rounded-lg border border-primary-500/30 shrink-0">
                        <span class="text-[8px] font-black text-primary-500 uppercase tracking-widest">{{ i18n.t('ui_lvl') }}</span>
                        <span class="text-[10px] font-black text-foreground italic">{{ friend.current_level }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-3 mt-1.5">
                      <Trophy class="w-3 h-3 text-primary-500 drop-shadow-[0_0_5px_rgba(255,69,0,0.5)]" />
                      <p class="text-[10px] font-black uppercase text-muted tracking-[0.2em] opacity-80">{{ friend.total_reps }} {{ i18n.t('reps_scaled') }}</p>
                    </div>
                  </div>
                </div>
                <div
                  class="h-10 w-10 bg-foreground/5 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <ChevronRight class="w-5 h-5 text-primary-500" />
                </div>
              </div>
            </TransitionGroup>

            <div v-if="friends.length === 0"
              class="p-16 text-center bg-surface/10 border border-dashed border-border rounded-2xl">
              <Users2 class="w-10 h-10 text-muted/30 mx-auto mb-3" />
              <p class="text-sm font-medium text-muted">{{ i18n.t('solo_journey') }}</p>
              <p class="text-xs text-muted/60 mt-1">{{ i18n.t('solo_desc') }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import {
  Users, Search, SearchX, UserPlus, Heart, Check,
  Trophy, ChevronRight, Users2, BarChart3, Activity
} from 'lucide-vue-next';
import { Swords } from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useBossStore } from '../stores/boss';
import { useNotificationStore } from '../stores/notification';
import AvatarFrame from './AvatarFrame.vue';
import Leaderboard from './Leaderboard.vue';
import ExerciseSelector from './ExerciseSelector.vue';
import SocialFeed from './SocialFeed.vue';
import PvpBattlesTab from './PvpBattlesTab.vue';
import LivePresence from './LivePresence.vue';
import { computed } from 'vue';

const emit = defineEmits(['viewProfile', 'start']);

const i18n = useI18nStore();
const bossStore = useBossStore();
const notificationStore = useNotificationStore();
const searchQuery = ref('');
const searchResults = ref([]);
const friends = ref([]);
const loadingSearch = ref(false);
const activeExercise = ref('all');
const activeTab = ref('feed');

const activeExerciseLabel = computed(() => {
  return i18n.t(activeExercise.value);
});

const activeBoss = computed(() => bossStore.activeBoss?.boss || null);
const bossHealthPercent = computed(() => {
  if (!activeBoss.value || !activeBoss.value.total_hp) return 0;
  return (activeBoss.value.current_hp / activeBoss.value.total_hp) * 100;
});

const fetchActiveBoss = () => bossStore.fetchActiveBoss();

const searchUsers = async () => {
  if (!searchQuery.value) {
    searchResults.value = [];
    return;
  }
  loadingSearch.value = true;
  try {
    const response = await axios.get(`/api/social/search?q=${searchQuery.value}`);
    searchResults.value = response.data;
  } catch (error) {
    console.error('Error searching users:', error);
  } finally {
    loadingSearch.value = false;
  }
};

const addFriend = async (friendId) => {
  try {
    await axios.post('/api/social/add', { friendId });
    fetchFriends();
    searchResults.value = searchResults.value.filter(u => u.id !== friendId);
    notificationStore.notify(i18n.t('friend_added'), 'success');
  } catch (error) {
    console.error('Error adding friend:', error);
    notificationStore.notify(i18n.t('friend_add_failed'), 'error');
  }
};

const fetchFriends = async () => {
  try {
    const response = await axios.get('/api/social/list');
    friends.value = response.data;
  } catch (error) {
    console.error('Error fetching friends:', error);
  }
};

const socialStats = ref({ activeUsers: 0, raidStatus: 'IDLE' });

const fetchSocialStats = async () => {
  try {
    const res = await axios.get('/api/social-feed/stats');
    socialStats.value = res.data;
  } catch (e) {
    console.error('Error fetching social stats:', e);
  }
};

onMounted(() => {
  fetchFriends();
  fetchSocialStats();
  fetchActiveBoss();
});
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

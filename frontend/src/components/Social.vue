<template>
  <div class="max-w-5xl mx-auto w-full px-4 pt-12 pb-32 space-y-12">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl sm:text-4xl font-black tracking-tighter text-foreground uppercase italic truncate drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            {{ i18n.t('community') }}<span class="text-primary-500">.</span>CORE
          </h2>
          <p class="text-muted text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-80">{{ i18n.t('community_subtitle') }}</p>
        </div>
        <div class="p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl shadow-[0_0_30px_rgba(255,69,0,0.1)]">
          <Users class="w-6 h-6 text-primary-500" />
        </div>
      </div>

      <!-- Rankings Section -->
      <div class="space-y-6 pt-4">
        <div class="flex items-center gap-3 px-2">
          <Trophy class="w-4 h-4 text-primary-500" />
          <h3 class="text-xs font-black uppercase tracking-[0.4em] text-muted">GLOBAL.RANKINGS</h3>
        </div>
        
        <div class="card-stats !p-0 overflow-hidden border-border bg-surface/20 backdrop-blur-sm">
          <div class="p-4 sm:p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6 bg-foreground/[0.02]">
            <div class="flex items-center gap-4">
               <div class="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                 <BarChart3 class="w-5 h-5 text-primary-500" />
               </div>
               <div>
                 <h3 class="text-lg font-black text-industrial uppercase text-foreground tracking-tight leading-none">
                   {{ activeExerciseLabel }} <span class="text-muted/60">Protocol</span>
                 </h3>
                 <p class="text-[9px] font-black text-muted uppercase tracking-widest mt-1">Live ranking synchronization</p>
               </div>
            </div>
            <ExerciseSelector v-model="activeExercise" class="!bg-transparent !p-0 w-full md:w-auto" />
          </div>
          <Leaderboard 
            :exercise-type="activeExercise"
            @viewProfile="$emit('viewProfile', $event)"
            class="min-h-[400px]"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <!-- Search Users -->
      <section class="space-y-6">
        <div class="flex items-center gap-2">
          <Search class="w-4 h-4 text-primary-500" />
          <h3 class="text-xs font-black uppercase tracking-[0.4em] text-muted">FIND_OPERATIVES</h3>
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
            <button v-for="user in searchResults" :key="user.id"
              @click="$emit('viewProfile', user.id)"
              :title="i18n.locale === 'es' ? `Ver perfil de ${user.name}` : `View ${user.name}'s profile`"
              class="w-full text-left bg-foreground/[0.02] border border-border p-5 rounded-3xl flex items-center justify-between hover:bg-foreground/[0.04] transition-all group cursor-pointer active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary-500/50 outline-none">
              <div class="flex items-center gap-4">
                <AvatarFrame :src="user.avatar_url" :border-css="user.border_css" :avatar-css="user.avatar_css" :size="48" />
                <div>
                  <div class="flex items-center gap-2">
                    <p class="font-black text-foreground uppercase tracking-tight group-hover:text-primary-500 transition-colors text-sm">{{ user.name }}</p>
                    <div class="flex items-center gap-1 bg-foreground/5 px-1.5 py-0.5 rounded border border-border/30">
                      <span class="text-[6px] font-black text-primary-500/80 tracking-widest uppercase">LVL</span>
                      <span class="text-[8px] font-black text-foreground italic">{{ user.current_level }}</span>
                    </div>
                  </div>
                  <p class="text-[9px] text-muted font-black uppercase tracking-[0.2em] mt-1.5 opacity-70">{{ user.total_reps }} REPS COLLECTED</p>
                </div>
              </div>
              <button @click.stop="addFriend(user.id)"
                class="flex items-center gap-3 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 text-white">
                <UserPlus class="w-3.5 h-3.5" />
                {{ i18n.t('btn_add_friend') }}
              </button>
            </button>
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
          <h3 class="text-xs font-black uppercase tracking-[0.4em] text-muted">INNER_CIRCLE</h3>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <TransitionGroup name="list">
            <button v-for="friend in friends" :key="friend.id"
              @click="$emit('viewProfile', friend.id)"
              :title="i18n.locale === 'es' ? `Ver perfil de ${friend.name}` : `View ${friend.name}'s profile`"
              class="w-full text-left bg-foreground/[0.02] border border-border hover:border-primary-500/30 group p-6 rounded-[2rem] flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary-500/50 outline-none">
              <div class="flex items-center gap-5">
                <div class="relative">
                  <AvatarFrame :src="friend.avatar_url" :border-css="friend.border_css" :avatar-css="friend.avatar_css" :size="64" class="transition-transform" />
                  <div
                    class="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center border-4 border-background shadow-xl">
                    <Check class="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <div class="flex items-center gap-3">
                    <p class="text-xl font-black text-foreground tracking-tight group-hover:text-primary-500 transition-colors uppercase italic font-industrial drop-shadow-sm">{{ friend.name }}</p>
                    <div class="flex items-center gap-1.5 bg-primary-500/10 px-2 py-0.5 rounded-lg border border-primary-500/30">
                      <span class="text-[8px] font-black text-primary-500 uppercase tracking-widest">LVL</span>
                      <span class="text-[10px] font-black text-foreground italic">{{ friend.current_level }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 mt-1.5">
                    <Trophy class="w-3 h-3 text-primary-500 drop-shadow-[0_0_5px_rgba(255,69,0,0.5)]" />
                    <p class="text-[10px] font-black uppercase text-muted tracking-[0.2em] opacity-80">{{ friend.total_reps }} REPS SCALED</p>
                  </div>
                </div>
              </div>
              <div
                class="h-10 w-10 bg-foreground/5 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight class="w-5 h-5 text-primary-500" />
              </div>
            </button>
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import {
  Users, Search, SearchX, UserPlus, Heart, Check,
  Trophy, ChevronRight, Users2, BarChart3
} from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';
import { useNotificationStore } from '../stores/notification';
import AvatarFrame from './AvatarFrame.vue';
import Leaderboard from './Leaderboard.vue';
import ExerciseSelector from './ExerciseSelector.vue';
import { computed } from 'vue';

const emit = defineEmits(['viewProfile']);

const i18n = useI18nStore();
const notificationStore = useNotificationStore();
const searchQuery = ref('');
const searchResults = ref([]);
const friends = ref([]);
const loadingSearch = ref(false);
const activeExercise = ref('all');

const activeExerciseLabel = computed(() => {
  return i18n.t(activeExercise.value);
});

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
    notificationStore.notify('Friend added successfully!', 'success');
  } catch (error) {
    console.error('Error adding friend:', error);
    notificationStore.notify('Failed to add friend', 'error');
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

onMounted(fetchFriends);
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

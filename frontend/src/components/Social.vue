<template>
  <div class="max-w-5xl mx-auto w-full px-4 space-y-12">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-black tracking-tight text-white mb-2">{{ i18n.t('community') }}</h2>
        <p class="text-zinc-500 text-sm font-medium">{{ i18n.t('community_subtitle') }}</p>
      </div>
      <div class="p-3 bg-primary-500/10 border border-primary-500/20 rounded-2xl">
        <Users class="w-6 h-6 text-primary-400" />
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <!-- Search Users -->
      <section class="space-y-6">
        <div class="flex items-center gap-2">
          <Search class="w-4 h-4 text-zinc-500" />
          <h3 class="text-sm font-bold uppercase tracking-widest text-zinc-500">{{ i18n.t('find_friends') }}</h3>
        </div>
        
        <div class="relative group">
          <input 
            v-model="searchQuery"
            @input="searchUsers"
            type="text"
            :placeholder="i18n.t('search_placeholder')"
            class="w-full glass bg-white/[0.01] rounded-2xl px-8 py-5 focus:outline-none focus:ring-2 focus:ring-primary-500/30 shadow-2xl transition-all placeholder:text-zinc-600 font-medium"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-700"></div>
        </div>
        
        <div class="space-y-4">
          <TransitionGroup name="list">
            <div 
              v-for="user in searchResults" :key="user.id" 
              class="glass glass-hover p-4 rounded-3xl flex items-center justify-between"
            >
              <div class="flex items-center gap-4">
                <img :src="user.avatar_url" class="w-12 h-12 rounded-full border border-zinc-700/50" />
                <div>
                  <p class="font-bold text-white">{{ user.name }}</p>
                  <p class="text-xs text-zinc-500 font-medium">{{ user.total_reps }} reps accumulated</p>
                </div>
              </div>
              <button 
                @click="addFriend(user.id)"
                class="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary-600/20 active:scale-95"
              >
                <UserPlus class="w-3.5 h-3.5" />
                {{ i18n.t('btn_add_friend') }}
              </button>
            </div>
          </TransitionGroup>
          
          <div v-if="searchQuery && !loadingSearch && searchResults.length === 0" class="p-12 text-center bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl">
            <SearchX class="w-8 h-8 text-zinc-800 mx-auto mb-2" />
            <p class="text-sm text-zinc-600 italic">{{ i18n.t('no_results') }}</p>
          </div>
        </div>
      </section>

      <!-- Friends List -->
      <section class="space-y-6">
        <div class="flex items-center gap-2">
          <Heart class="w-4 h-4 text-primary-500" />
          <h3 class="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{{ i18n.t('inner_circle') }}</h3>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <TransitionGroup name="list">
            <div 
              v-for="friend in friends" :key="friend.id" 
              class="glass glass-hover group p-5 rounded-3xl flex items-center justify-between shadow-xl"
            >
              <div class="flex items-center gap-4">
                <div class="relative">
                  <img :src="friend.avatar_url" class="w-14 h-14 rounded-full border-2 border-zinc-800 group-hover:border-primary-500/30 transition-all p-0.5" />
                  <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                    <Check class="w-3 h-3 text-green-500" />
                  </div>
                </div>
                <div>
                  <p class="text-lg font-bold text-white tracking-tight">{{ friend.name }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <Trophy class="w-3 h-3 text-primary-400" />
                    <p class="text-[10px] font-black uppercase text-zinc-500 tracking-tighter">{{ friend.total_reps }} {{ i18n.t('stats_reps') }}</p>
                  </div>
                </div>
              </div>
              <div class="h-8 w-8 bg-zinc-800/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight class="w-4 h-4 text-zinc-600" />
              </div>
            </div>
          </TransitionGroup>

          <div v-if="friends.length === 0" class="p-16 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
            <Users2 class="w-10 h-10 text-zinc-800 mx-auto mb-3" />
            <p class="text-sm font-medium text-zinc-500">{{ i18n.t('solo_journey') }}</p>
            <p class="text-xs text-zinc-600 mt-1">{{ i18n.t('solo_desc') }}</p>
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
  Trophy, ChevronRight, Users2 
} from 'lucide-vue-next';
import { useI18nStore } from '../stores/i18n';

const i18n = useI18nStore();
const searchQuery = ref('');
const searchResults = ref([]);
const friends = ref([]);
const loadingSearch = ref(false);

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
  } catch (error) {
    console.error('Error adding friend:', error);
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

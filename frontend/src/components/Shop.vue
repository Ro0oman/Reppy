<template>
  <div class="max-w-7xl mx-auto px-4 py-12 animate-in relative z-10">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
      <div>
        <h1 class="text-4xl font-black text-industrial tracking-tighter text-white">
          ARMORY<span class="text-primary-500">.</span>
        </h1>
        <p class="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Equip your legend with elite protocol cosmetics.</p>
      </div>
      
      <!-- Currency Display (Precision Pill) -->
      <div class="flex items-center gap-4 bg-steel-grey/40 px-6 py-4 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl group hover:border-primary-500/30 transition-all">
        <div class="p-2 bg-primary-500/10 rounded-lg group-hover:scale-110 transition-transform">
          <Zap class="w-5 h-5 text-primary-500" />
        </div>
        <div class="flex flex-col">
          <span class="text-3xl font-black text-precision text-white tracking-tighter leading-none">{{ authStore.user?.reppy_coins || 0 }}</span>
          <span class="text-[8px] uppercase tracking-[0.3em] text-primary-500/70 font-black mt-1">REPPY COINS</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-24">
      <div class="animate-spin w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent mx-auto"></div>
      <p class="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mt-6">SYNCING ARMORY...</p>
    </div> 
    
    <div v-else class="space-y-16">
      <!-- Categories (Industrial Dock) -->
      <div class="flex flex-wrap items-center gap-2">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          @click="selectedCategory = cat.id"
          class="group relative px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all overflow-hidden"
          :class="selectedCategory === cat.id 
            ? 'bg-primary-500 text-white shadow-lg' 
            : 'bg-steel-grey/40 text-zinc-500 border border-white/5 hover:text-white'"
        >
          <div v-if="selectedCategory !== cat.id" class="absolute inset-x-0 bottom-0 h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
          <component :is="cat.icon" class="w-3.5 h-3.5 inline-block mr-2.5" />
          {{ cat.name }}
        </button>
      </div>

      <!-- Main Collection -->
      <section>
        <div class="flex items-center gap-4 mb-10">
          <h2 class="text-xl font-black text-industrial text-white tracking-tight italic">PERMANENT PROTOCOL</h2>
          <div class="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="item in regularItems" 
            :key="item.id"
            class="card-stats p-0 flex flex-col group/item border-white/10"
            :class="getCardClass(item)"
          >
            <!-- Lock Overlay -->
            <div v-if="!item.is_unlocked" class="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-[5] pointer-events-none flex items-center justify-center">
               <div class="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center border border-white/10">
                  <span class="text-xl">🔒</span>
               </div>
            </div>

            <!-- Header Info -->
            <div class="p-6 pb-0 flex items-start justify-between z-10">
              <span class="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 text-zinc-500 bg-white/5">
                #{{ item.roadmap_position || '??' }}
              </span>
              <span class="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border" :class="getRarityBadge(item).classes">
                {{ getRarityBadge(item).label }}
              </span>
            </div>

            <!-- Preview Area -->
            <div class="h-44 flex items-center justify-center m-6 mb-2 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden group-hover/item:border-primary-500/20 transition-colors">
               <div v-if="item.type === 'title'" class="text-2xl text-center px-6 leading-tight font-black" :class="item.css_value">
                 {{ item.name }}
               </div>
               <div v-if="item.type === 'border'">
                 <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :border-css="item.css_value" :size="90" />
               </div>
               <div v-if="item.type === 'avatar'">
                 <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :avatar-css="item.css_value" :size="90" />
               </div>
               <div v-if="item.type === 'background'" class="w-full h-full relative">
                  <BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0 !w-full !h-full" />
                  <div class="absolute inset-0 bg-black/10"></div>
               </div>
            </div>

            <!-- Content -->
            <div class="p-6 pt-2 flex-1">
              <h3 class="text-lg font-black text-industrial text-white mb-1">{{ item.name }}</h3>
              <p class="text-xs text-zinc-500 font-medium line-clamp-2 mb-4 leading-relaxed">{{ item.description }}</p>
              
              <div v-if="!item.is_unlocked" class="px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                <p class="text-[8px] font-black uppercase tracking-widest text-red-500/70">DECRYPT AT: {{ getCountdown(item) }}</p>
              </div>
            </div>

            <!-- Action Footer -->
            <div class="p-6 pt-0 mt-auto border-t border-white/5 bg-white/[0.01]">
              <div class="flex items-center justify-between mt-6">
                <div v-if="item.owned" class="flex items-center gap-2 text-neon-lime">
                  <Check class="w-4 h-4" />
                  <span class="text-[10px] font-black uppercase tracking-widest leading-none">ACQUIRED</span>
                </div>
                <div v-else-if="item.price > 0" class="flex items-baseline gap-1">
                  <span class="text-xl font-black text-precision" :class="canAfford(item) ? 'text-primary-500' : 'text-zinc-700'">{{ item.price }}</span>
                  <span class="text-[8px] font-black text-zinc-600 uppercase tracking-widest">COINS</span>
                </div>
                <div v-else class="text-[9px] font-black uppercase tracking-widest text-primary-500/60 leading-none">EVENT REWARD</div>

                <!-- Action Button -->
                <button 
                  v-if="!item.owned && item.price > 0"
                  @click="buyItem(item)"
                  :disabled="!canAfford(item) || buying || !item.is_unlocked"
                  class="btn-reppy !px-6 !py-3 !text-[10px] disabled:opacity-20 disabled:grayscale disabled:scale-100"
                >
                  {{ item.is_unlocked ? 'ACQUIRE' : 'LOCKED' }}
                </button>
                
                <button 
                  v-if="item.owned"
                  @click="equipItem(item)"
                  :disabled="isEquipped(item)"
                  class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  :class="isEquipped(item) ? 'bg-white/5 text-zinc-700 border border-white/5' : 'bg-neon-lime text-black hover:scale-105 active:scale-95 shadow-lg shadow-neon-lime/20'"
                >
                  {{ isEquipped(item) ? 'ACTIVE' : 'EQUIP' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Seasonal Section (Collapsed) -->
      <section v-if="seasonalItems.length > 0" class="pt-8 border-t border-white/5">
        <button 
          @click="showSeasonal = !showSeasonal"
          class="w-full flex items-center justify-between p-8 bg-steel-grey/40 rounded-3xl border border-white/5 hover:border-primary-500/20 transition-all group"
        >
          <div class="flex items-center gap-6">
            <div class="p-4 bg-primary-500/10 rounded-2xl group-hover:scale-110 transition-transform">
              <Sparkles class="w-7 h-7 text-primary-500" />
            </div>
            <div class="text-left">
              <h2 class="text-2xl font-black text-industrial text-white tracking-tight uppercase">SEASONAL PROTOCOL</h2>
              <p class="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Special event rewards & milestone artifacts.</p>
            </div>
          </div>
          <ChevronDown 
            class="w-6 h-6 text-zinc-600 transition-transform duration-500"
            :class="{ 'rotate-180': showSeasonal }"
          />
        </button>
        
        <Transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-300 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div v-if="showSeasonal" class="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 animate-in">
             <!-- Seasonal Items use same card template as regular items -->
             <div 
              v-for="item in seasonalItems" 
              :key="item.id"
              class="card-stats p-0 flex flex-col group/item border-white/10"
              :class="getCardClass(item)"
            >
              <div v-if="!item.is_unlocked" class="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-[5] pointer-events-none flex items-center justify-center">
                 <div class="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center border border-white/10"><span class="text-xl">🔒</span></div>
              </div>
              <div class="p-6 pb-0 flex items-start justify-between z-10">
                <span class="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-primary-500/20 text-primary-500 bg-primary-500/5">SEASONAL</span>
                <span class="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border" :class="getRarityBadge(item).classes">{{ getRarityBadge(item).label }}</span>
              </div>
              <div class="h-44 flex items-center justify-center m-6 mb-2 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden group-hover/item:border-primary-500/20 transition-colors">
                 <div v-if="item.type === 'title'" class="text-2xl text-center px-6 leading-tight font-black" :class="item.css_value">{{ item.name }}</div>
                 <div v-if="item.type === 'border'"><AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :border-css="item.css_value" :size="90" /></div>
                 <div v-if="item.type === 'avatar'"><AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :avatar-css="item.css_value" :size="90" /></div>
                 <div v-if="item.type === 'background'" class="w-full h-full relative"><BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0 !w-full !h-full" /><div class="absolute inset-0 bg-black/10"></div></div>
              </div>
              <div class="p-6 pt-2 flex-1">
                <h3 class="text-lg font-black text-industrial text-white mb-1">{{ item.name }}</h3>
                <p class="text-xs text-zinc-500 font-medium line-clamp-2 mb-4 leading-relaxed">{{ item.description }}</p>
              </div>
              <div class="p-6 pt-0 mt-auto border-t border-white/5 bg-white/[0.01]">
                <div class="flex items-center justify-between mt-6">
                  <div v-if="item.owned" class="flex items-center gap-2 text-neon-lime"><Check class="w-4 h-4" /><span class="text-[10px] font-black uppercase tracking-widest leading-none">ACQUIRED</span></div>
                  <div v-else class="text-[9px] font-black uppercase tracking-widest text-primary-500/60 leading-none">SPECIAL REWARD</div>
                  <button v-if="item.owned" @click="equipItem(item)" :disabled="isEquipped(item)" class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" :class="isEquipped(item) ? 'bg-white/5 text-zinc-700 border border-white/5' : 'bg-neon-lime text-black hover:scale-105 active:scale-95 shadow-lg shadow-neon-lime/20'">{{ isEquipped(item) ? 'ACTIVE' : 'EQUIP' }}</button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { LayoutGrid, Type, Frame, Sparkles, ChevronDown, Zap, Check } from 'lucide-vue-next';
import AvatarFrame from './AvatarFrame.vue';
import BackgroundEffect from './BackgroundEffect.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const items = ref([]);
const loading = ref(true);
const buying = ref(false);
const nowMs = ref(Date.now());
const showSeasonal = ref(false);
let countdownTimer = null;

const selectedCategory = ref('all');

const categories = [
  { id: 'all', name: 'ALL UNITS', icon: LayoutGrid },
  { id: 'title', name: 'TITLES', icon: Type },
  { id: 'border', name: 'BORDERS', icon: Frame },
  { id: 'avatar', name: 'AVATARS', icon: Sparkles },
  { id: 'background', name: 'SCREENS', icon: Sparkles }
];

const filteredItems = computed(() => {
  let result = [...items.value];
  if (selectedCategory.value !== 'all') {
    result = result.filter(item => item.type === selectedCategory.value);
  }
  return result.sort((a, b) => a.price - b.price);
});

const seasonalItems = computed(() => filteredItems.value.filter(item => item.is_seasonal));
const regularItems = computed(() => filteredItems.value.filter(item => !item.is_seasonal));

const checkShop = async () => {
  try {
    const res = await axios.get('/api/shop/cosmetics');
    items.value = res.data;
  } catch (error) {
    if (error.response?.status !== 401) notificationStore.notify('Armory sync failed', 'error');
  } finally {
    loading.value = false;
  }
};

const canAfford = (item) => (authStore.user?.reppy_coins || 0) >= item.price;

const getCountdown = (item) => {
  if (!item?.unlock_at) return '00:00:00';
  const diff = Math.max(0, new Date(item.unlock_at).getTime() - nowMs.value);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}D ${hours}H ${minutes}M ${seconds}S`;
};

const isEquipped = (item) => {
  if (!authStore.user) return false;
  if (item.type === 'title') return authStore.user.equipped_title_id === item.id;
  if (item.type === 'border') return authStore.user.equipped_border_id === item.id;
  if (item.type === 'background') return authStore.user.equipped_background_id === item.id;
  if (item.type === 'avatar') return authStore.user.equipped_avatar_id === item.id;
  return false;
};

const getRarityBadge = (item) => {
  const rarity = item.rarity || 'common';
  switch (rarity) {
    case 'legendary': return { label: 'LEGEND', classes: 'text-primary-500 bg-primary-500/10 border-primary-500/30 shadow-[0_0_10px_rgba(255,69,0,0.2)]' };
    case 'epic': return { label: 'EPIC', classes: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    case 'rare': return { label: 'RARE', classes: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    default: return { label: 'UNIT', classes: 'text-zinc-600 bg-white/5 border-white/10' };
  }
};

const getCardClass = (item) => {
  if (isEquipped(item)) return '!border-neon-lime/40 shadow-[0_0_30px_rgba(204,255,0,0.05)]';
  if (item.owned) return 'border-white/20';
  if (!item.is_unlocked) return 'opacity-60 grayscale';
  if (item.price >= 1200) return 'border-primary-500/30 hover:border-primary-500/60 shadow-[0_0_20px_rgba(255,69,0,0.05)]';
  return 'border-white/5 hover:border-white/20';
};

const buyItem = async (item) => {
  buying.value = true;
  try {
    const res = await axios.post(`/api/shop/buy/${item.id}`);
    authStore.user.reppy_coins = res.data.remaining_coins;
    notificationStore.notify(`Unit Acquired: ${item.name}`, 'success');
    await checkShop();
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Exchange failed', 'error');
  } finally {
    buying.value = false;
  }
};

const equipItem = async (item) => {
  try {
    await axios.post(`/api/shop/equip/${item.id}?type=${item.type}`);
    if (item.type === 'title') { authStore.user.equipped_title_id = item.id; authStore.user.title_css = item.css_value; authStore.user.title_name = item.name; }
    if (item.type === 'border') authStore.user.equipped_border_id = item.id;
    if (item.type === 'avatar') authStore.user.equipped_avatar_id = item.id;
    if (item.type === 'background') authStore.user.equipped_background_id = item.id;
    notificationStore.notify(`${item.name} active`, 'success');
  } catch (error) {
    notificationStore.notify('Activation failed', 'error');
  }
};

onMounted(() => {
  checkShop();
  countdownTimer = setInterval(() => { nowMs.value = Date.now(); }, 1000);
  if (!authStore.user) authStore.fetchProfile();
});

onBeforeUnmount(() => { if (countdownTimer) clearInterval(countdownTimer); });
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

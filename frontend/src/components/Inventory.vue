<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-10 text-center">
      <h1 class="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">
        Gestión de <span class="text-primary-600">Equipamiento</span>
      </h1>
      <p class="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Personaliza tu perfil con tus recompensas obtenidas.</p>
    </div>

    <!-- Section: Boss Chests (New) -->
    <div v-if="authStore.user?.boss_chests > 0" 
      class="mb-12 p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-600/5 to-transparent border border-amber-500/20 backdrop-blur-xl relative overflow-hidden group">
      
      <!-- Decorative Background Icon -->
      <Archive class="absolute -right-4 -bottom-4 w-48 h-48 text-amber-500/5 -rotate-12 transition-transform group-hover:scale-110 duration-700" />
      
      <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div class="flex items-center gap-6">
          <div class="relative">
            <div class="absolute inset-0 bg-amber-500 blur-2xl opacity-20 animate-pulse"></div>
            <div class="relative bg-zinc-900 rounded-2xl p-4 border border-amber-500/30">
              <Archive class="w-10 h-10 text-amber-500" />
            </div>
            <div class="absolute -top-2 -right-2 bg-rose-600 text-white text-xs font-black px-2 py-1 rounded-lg shadow-lg border border-white/10">
              x{{ authStore.user.boss_chests }}
            </div>
          </div>
          <div>
            <h2 class="text-2xl font-black text-white uppercase italic tracking-tighter">Cofres de <span class="text-amber-500">Temporada</span></h2>
            <p class="text-zinc-400 font-medium">Has obtenido estos cofres derrotando jefes. ¡Ábrelos para obtener recompensas legendarias!</p>
          </div>
        </div>
        
        <button @click="handleOpenChest" :disabled="openingChest"
          class="w-full md:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-amber-600/30 uppercase tracking-widest text-sm italic flex items-center justify-center gap-3">
          <Sparkles class="w-5 h-5" />
          {{ openingChest ? 'Abriendo...' : 'Abrir Cofre' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="inventory.length === 0" class="text-center py-20 bg-white/50 dark:bg-black/20 rounded-3xl border border-zinc-200 dark:border-white/5 backdrop-blur-xl">
      <div class="bg-zinc-100 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package class="w-10 h-10 text-zinc-400" />
      </div>
      <h3 class="text-xl font-bold text-zinc-900 dark:text-white">Aún no tienes equipo</h3>
      <p class="text-zinc-500 dark:text-zinc-400 mt-1">Visita la tienda de Goggins para empezar tu colección.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <!-- Section: Borders -->
      <div v-if="groupedItems.border">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-blue-500/10 rounded-lg">
            <Frame class="w-5 h-5 text-blue-500" />
          </div>
          <h2 class="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Bordes de Avatar</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="item in groupedItems.border" :key="item.id" 
            class="group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border transition-all"
            :class="isEquipped(item) ? 'border-primary-500 shadow-lg shadow-primary-500/10' : 'border-zinc-200 dark:border-white/5 hover:border-primary-500/50'">
            
            <div class="p-4 flex items-center gap-4 relative">
              <!-- NEW Badge -->
              <div v-if="item.is_new" 
                class="absolute -top-1 -right-1 z-20 px-2 py-0.5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-[8px] font-black text-white uppercase tracking-tighter shadow-lg shadow-pink-500/40 animate-pulse border border-white/20">
                NEW
              </div>

              <div class="relative">
                <AvatarFrame :src="authStore.user?.avatar_url" :border-css="item.css_value" :size="48" />
                <div v-if="isEquipped(item)" class="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 z-10">
                  <Check class="w-2.5 h-2.5 text-white stroke-[4]" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-zinc-900 dark:text-white truncate">{{ item.name }}</h4>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">{{ item.description }}</p>
              </div>
            </div>
            
            <div class="px-4 pb-4">
              <button @click="toggleEquip(item)" 
                class="w-full py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                :class="isEquipped(item) ? 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400' : 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/20'">
                {{ isEquipped(item) ? 'Desequipar' : 'Equipar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Titles -->
      <div v-if="groupedItems.title" class="md:col-span-1">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-amber-500/10 rounded-lg">
            <Type class="w-5 h-5 text-amber-500" />
          </div>
          <h2 class="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Títulos</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="item in groupedItems.title" :key="item.id" 
            class="group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border transition-all"
            :class="isEquipped(item) ? 'border-primary-500 shadow-lg shadow-primary-500/10' : 'border-zinc-200 dark:border-white/5 hover:border-primary-500/50'">
            
            <div class="p-4 relative">
              <!-- NEW Badge -->
              <div v-if="item.is_new" 
                class="absolute -top-1 -right-1 z-20 px-2 py-0.5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-[8px] font-black text-white uppercase tracking-tighter shadow-lg shadow-pink-500/40 animate-pulse border border-white/20">
                NEW
              </div>

              <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-zinc-900 dark:text-white truncate">{{ item.name }}</h4>
                <div v-if="isEquipped(item)" class="bg-primary-500/10 px-2 py-0.5 rounded-full">
                  <span class="text-[10px] font-black text-primary-600 uppercase">Equipado</span>
                </div>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 italic mb-4">"{{ item.description }}"</p>
              
              <button @click="toggleEquip(item)" 
                class="w-full py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                :class="isEquipped(item) ? 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400' : 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/20'">
                {{ isEquipped(item) ? 'Desequipar' : 'Equipar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Backgrounds -->
      <div v-if="groupedItems.background" class="md:col-span-2">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-purple-500/10 rounded-lg">
            <Sparkles class="w-5 h-5 text-purple-500" />
          </div>
          <h2 class="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Fondos de Perfil</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="item in groupedItems.background" :key="item.id" 
            class="group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border transition-all"
            :class="isEquipped(item) ? 'border-primary-500 shadow-lg shadow-primary-500/10' : 'border-zinc-200 dark:border-white/5 hover:border-primary-500/50'">
            
            <div class="p-4 relative">
              <!-- NEW Badge -->
              <div v-if="item.is_new" 
                class="absolute -top-1 -right-1 z-20 px-2 py-0.5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-[8px] font-black text-white uppercase tracking-tighter shadow-lg shadow-pink-500/40 animate-pulse border border-white/20">
                NEW
              </div>

              <!-- Preview Box -->
              <div class="w-full aspect-video rounded-xl mb-3 relative overflow-hidden bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10">
                <BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0 !w-full !h-full" />
                <div v-if="isEquipped(item)" class="absolute top-2 right-2 bg-primary-500 rounded-full p-1 border-2 border-white dark:border-zinc-950 z-10">
                   <Check class="w-2 h-2 text-white stroke-[4]" />
                </div>
              </div>

              <h4 class="font-bold text-sm text-zinc-900 dark:text-white mb-1">{{ item.name }}</h4>
              <p class="text-[10px] text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">{{ item.description }}</p>
              
              <button @click="toggleEquip(item)" 
                class="w-full py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                :class="isEquipped(item) ? 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400' : 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/20'">
                {{ isEquipped(item) ? 'Desequipar' : 'Equipar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Animated Avatars -->
      <div v-if="groupedItems.avatar">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-emerald-500/10 rounded-lg">
            <Sparkles class="w-5 h-5 text-emerald-500" />
          </div>
          <h2 class="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Avatares Animados</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="item in groupedItems.avatar" :key="item.id" 
            class="group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border transition-all"
            :class="isEquipped(item) ? 'border-primary-500 shadow-lg shadow-primary-500/10' : 'border-zinc-200 dark:border-white/5 hover:border-primary-500/50'">
            
            <div class="p-4 flex items-center gap-4 relative">
              <div v-if="item.is_new" 
                class="absolute -top-1 -right-1 z-20 px-2 py-0.5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-[8px] font-black text-white uppercase tracking-tighter shadow-lg shadow-pink-500/40 animate-pulse border border-white/20">
                NEW
              </div>

              <div class="relative">
                <AvatarFrame :src="authStore.user?.avatar_url" :avatar-css="item.css_value" :size="48" />
                <div v-if="isEquipped(item)" class="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 z-10">
                  <Check class="w-2.5 h-2.5 text-white stroke-[4]" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-zinc-900 dark:text-white truncate">{{ item.name }}</h4>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">{{ item.description }}</p>
              </div>
            </div>
            
            <div class="px-4 pb-4">
              <button @click="toggleEquip(item)" 
                class="w-full py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                :class="isEquipped(item) ? 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400' : 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/20'">
                {{ isEquipped(item) ? 'Desequipar' : 'Equipar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chest Opening Modal -->
    <ChestOpening 
      v-if="showChestModal" 
      :show="showChestModal" 
      :reward="chestReward" 
      :reel-items="reelItems" 
      @close="closeChestModal" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Package, Frame, Type, Check, Sparkles, Archive } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import AvatarFrame from './AvatarFrame.vue';
import BackgroundEffect from './BackgroundEffect.vue';
import ChestOpening from './ChestOpening.vue';
import axios from 'axios';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const inventory = ref([]);
const loading = ref(true);

// Chest logic
const showChestModal = ref(false);
const openingChest = ref(false);
const chestReward = ref(null);
const reelItems = ref([]);

const handleOpenChest = async () => {
  if (openingChest.value) return;
  openingChest.value = true;
  
  try {
    const res = await axios.post('/api/boss/open-chest');
    chestReward.value = res.data.reward;
    reelItems.value = res.data.reel_items;
    showChestModal.value = true;
    
    // Update local chest count immediately
    if (authStore.user) {
      authStore.user.boss_chests--;
    }
  } catch (error) {
    console.error('Error opening chest:', error);
    notificationStore.notify(error.response?.data?.message || 'Error al abrir el cofre', 'error');
  } finally {
    openingChest.value = false;
  }
};

const closeChestModal = async () => {
  showChestModal.value = false;
  // Refresh inventory to show new item
  await fetchInventory();
  // Also refresh profile for coins etc
  await authStore.fetchProfile();
};

const fetchInventory = async () => {
  try {
    const res = await axios.get('/api/shop/cosmetics');
    // Actual: shop.get('/cosmetics') devuelve todo con item.owned = true si es dueño
    inventory.value = res.data.filter(item => item.owned);
  } catch (error) {
    console.error('Error fetching inventory:', error);
  } finally {
    loading.value = false;
  }
};

const groupedItems = computed(() => {
  const groups = {};
  inventory.value.forEach(item => {
    if (!groups[item.type]) groups[item.type] = [];
    groups[item.type].push(item);
  });
  return groups;
});

const isEquipped = (item) => {
  if (item.type === 'title') {
    return authStore.user?.equipped_title_id === item.id;
  } else if (item.type === 'border') {
    return authStore.user?.equipped_border_id === item.id;
  } else if (item.type === 'background') {
    return authStore.user?.equipped_background_id === item.id;
  } else if (item.type === 'avatar') {
    return authStore.user?.equipped_avatar_id === item.id;
  }
  return false;
};

const toggleEquip = async (item) => {
  const alreadyEquipped = isEquipped(item);
  const targetId = alreadyEquipped ? 0 : item.id;
  
  try {
    await axios.post(`/api/shop/equip/${targetId}?type=${item.type}`);
    
    // Update local authStore
    if (item.type === 'title') {
      authStore.user.equipped_title_id = alreadyEquipped ? null : item.id;
      authStore.user.title_css = alreadyEquipped ? '' : item.css_value;
      authStore.user.title_name = alreadyEquipped ? '' : item.name;
    } else if (item.type === 'border') {
      authStore.user.equipped_border_id = alreadyEquipped ? null : item.id;
      authStore.user.border_css = alreadyEquipped ? '' : item.css_value;
    } else if (item.type === 'background') {
      authStore.user.equipped_background_id = alreadyEquipped ? null : item.id;
      authStore.user.background_css = alreadyEquipped ? '' : item.css_value;
    } else if (item.type === 'avatar') {
      authStore.user.equipped_avatar_id = alreadyEquipped ? null : item.id;
      authStore.user.avatar_css = alreadyEquipped ? '' : item.css_value;
    }

    notificationStore.notify(alreadyEquipped ? 'Objeto Desequipado' : 'Objeto Equipado', 'success');
  } catch (error) {

    console.error('Error toggling equipment:', error);
    notificationStore.notify('Error al gestionar equipo', 'error');
  }
};

const markSeen = async (item) => {
  if (!item.is_new) return;
  try {
    await axios.post(`/api/shop/mark-seen/${item.id}`);
    item.is_new = false;
  } catch (e) {
    console.error('Error marking as seen:', e);
  }
};

onMounted(async () => {
  await Promise.all([
    fetchInventory(),
    authStore.fetchProfile()
  ]);
  // Mark all as seen after 3 seconds of being in the inventory
  setTimeout(() => {
    inventory.value.forEach(item => {
      if (item.is_new) markSeen(item);
    });
  }, 3000);
});
</script>

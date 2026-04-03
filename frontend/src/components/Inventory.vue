<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-10 text-center">
      <h1 class="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">
        Gestión de <span class="text-primary-600">Equipamiento</span>
      </h1>
      <p class="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Personaliza tu perfil con tus recompensas obtenidas.</p>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Package, Frame, Type, Check, Sparkles } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import AvatarFrame from './AvatarFrame.vue';
import BackgroundEffect from './BackgroundEffect.vue';
import axios from 'axios';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const inventory = ref([]);
const loading = ref(true);

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
  await fetchInventory();
  // Mark all as seen after 3 seconds of being in the inventory
  setTimeout(() => {
    inventory.value.forEach(item => {
      if (item.is_new) markSeen(item);
    });
  }, 3000);
});
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">La Tienda Goggins</h1>
        <p class="text-zinc-400 dark:text-zinc-500 mt-1 font-medium">Equipa tu Leyenda.</p>
      </div>
      <div class="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/30">
        <span class="text-amber-500 font-black text-xl">{{ authStore.user?.reppy_coins || 0 }}</span>
        <span class="text-xs uppercase tracking-widest text-amber-500/70 font-bold">Reppy Coins</span>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent mx-auto"></div>
    </div> 
    
    <div v-else>
      <div class="flex flex-wrap items-center gap-2 mb-8">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          @click="selectedCategory = cat.id"
          class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2"
          :class="selectedCategory === cat.id 
            ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-black shadow-lg' 
            : 'bg-transparent border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-zinc-400 dark:hover:border-white/30'"
        >
          <component :is="cat.icon" class="w-3 h-3 inline-block mr-2" />
          {{ cat.name }}
        </button>
      </div>

      <div class="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <p class="text-xs uppercase tracking-widest text-emerald-500/80 font-bold">Estado de Desbloqueo</p>
        <p class="text-sm text-zinc-700 dark:text-zinc-300 font-medium">Filtra por categoría para encontrar lo que necesitas. Ordenado por precio.</p>
      </div>

      <!-- Seasonal Items Section -->
      <div v-if="seasonalItems.length > 0" class="mb-12">
        <div class="flex items-center gap-3 mb-6">
          <Sparkles class="w-6 h-6 text-amber-500" />
          <h2 class="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white italic">Objetos de Temporada</h2>
          <div class="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="item in seasonalItems" 
            :key="item.id"
            class="bg-white dark:bg-zinc-900 border-2 rounded-2xl p-6 transition-all relative overflow-hidden"
            :class="getCardClass(item)"
          >
            <div v-if="!item.is_unlocked" class="absolute inset-0 bg-black/35 backdrop-blur-[1px] z-[5] pointer-events-none"></div>

            <!-- Rarity Badge -->
            <div class="absolute top-3 right-3 z-10">
              <span class="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border"
                :class="getRarityBadge(item).classes">
                {{ getRarityBadge(item).label }}
              </span>
              <span class="ml-2 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border text-amber-500 bg-amber-500/10 border-amber-500/30">
                Temporada
              </span>
            </div>

            <div class="absolute top-3 left-3 z-10">
              <span class="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border bg-black/30 text-white border-white/20">
                #{{ item.roadmap_position }}
              </span>
            </div>

            <!-- Legendary/Epic glow effect -->
            <div v-if="item.price >= 1200" class="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none animate-pulse"
              :class="item.price >= 1500 ? 'bg-orange-500/20' : 'bg-purple-500/15'"></div>
            <div v-else-if="item.price >= 700" class="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none"
              :class="'bg-blue-500/10'"></div>

            <!-- Preview -->
            <div class="h-28 flex items-center justify-center bg-black/5 dark:bg-black/40 rounded-xl mb-4 border border-zinc-200 dark:border-white/5 relative">
               <div v-if="item.type === 'title'" class="text-xl text-center px-4 leading-tight" :class="item.css_value">
                 {{ item.name }}
                 <span v-if="item.price >= 1200" class="ml-1 inline-block">🔥</span>
               </div>
               <div v-if="item.type === 'border'">
                 <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :border-css="item.css_value" :size="64" />
               </div>
               <!-- Dynamic Background Preview -->
                <div v-if="item.type === 'background'" class="w-full h-full relative overflow-hidden rounded-xl">
                   <BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0 !w-full !h-full" />
                   <div class="absolute inset-0 bg-black/20 pointer-events-none"></div>
                  <span class="absolute bottom-2 left-2 text-[8px] uppercase tracking-widest text-white font-black drop-shadow-md">Vista Previa</span>
               </div>
            </div>

            <div>
              <h3 class="font-bold text-zinc-900 dark:text-white text-lg">{{ item.name }}</h3>
              <p class="text-sm text-zinc-400 dark:text-zinc-500 mb-4">{{ item.description }}</p>
              <p class="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
                Tipo: {{ getItemTypeLabel(item) }}
              </p>
              <p class="text-[11px] font-semibold uppercase tracking-wide text-emerald-500/90 mb-3">
                Desbloqueo: {{ getUnlockTypeLabel(item) }}
              </p>
              <p v-if="!item.is_unlocked" class="text-xs font-bold uppercase tracking-wide text-red-400 mb-3">
                Se desbloquea en {{ getCountdown(item) }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-white/5">
              <div v-if="item.owned" class="text-emerald-500 font-black text-sm uppercase tracking-wide">
                En Propiedad
              </div>
              <div v-else class="text-xs font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
                Recompensa Especial
              </div>

              <button 
                v-if="item.owned"
                @click="equipItem(item)"
                :disabled="isEquipped(item)"
                class="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all"
                :class="isEquipped(item) ? 'bg-white/10 text-zinc-900 dark:text-white/50 cursor-pointer' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'"
              >
                {{ isEquipped(item) ? 'Equipado' : 'Equipar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Regular Items Section -->
      <div>
        <div v-if="seasonalItems.length > 0" class="flex items-center gap-3 mb-6">
          <LayoutGrid class="w-6 h-6 text-zinc-400" />
          <h2 class="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white italic">Colección Permanente</h2>
          <div class="h-px flex-1 bg-gradient-to-r from-zinc-200 dark:from-white/10 to-transparent"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="item in regularItems" 
            :key="item.id"
            class="bg-white dark:bg-zinc-900 border-2 rounded-2xl p-6 transition-all relative overflow-hidden"
            :class="getCardClass(item)"
          >
            <div v-if="!item.is_unlocked" class="absolute inset-0 bg-black/35 backdrop-blur-[1px] z-[5] pointer-events-none"></div>

            <!-- Rarity Badge -->
            <div class="absolute top-3 right-3 z-10">
              <span class="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border"
                :class="getRarityBadge(item).classes">
                {{ getRarityBadge(item).label }}
              </span>
            </div>

            <div class="absolute top-3 left-3 z-10">
              <span class="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border bg-black/30 text-white border-white/20">
                #{{ item.roadmap_position }}
              </span>
            </div>

            <!-- Legendary/Epic glow effect -->
            <div v-if="item.price >= 1200" class="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none animate-pulse"
              :class="item.price >= 1500 ? 'bg-orange-500/20' : 'bg-purple-500/15'"></div>
            <div v-else-if="item.price >= 700" class="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none"
              :class="'bg-blue-500/10'"></div>

            <!-- Preview -->
            <div class="h-28 flex items-center justify-center bg-black/5 dark:bg-black/40 rounded-xl mb-4 border border-zinc-200 dark:border-white/5 relative">
               <div v-if="item.type === 'title'" class="text-xl text-center px-4 leading-tight" :class="item.css_value">
                 {{ item.name }}
                 <span v-if="item.price >= 1200" class="ml-1 inline-block">🔥</span>
               </div>
               <div v-if="item.type === 'border'">
                 <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :border-css="item.css_value" :size="64" />
               </div>
               <!-- Dynamic Background Preview -->
                <div v-if="item.type === 'background'" class="w-full h-full relative overflow-hidden rounded-xl">
                   <BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0 !w-full !h-full" />
                   <div class="absolute inset-0 bg-black/20 pointer-events-none"></div>
                  <span class="absolute bottom-2 left-2 text-[8px] uppercase tracking-widest text-white font-black drop-shadow-md">Vista Previa</span>
               </div>
            </div>

            <div>
              <h3 class="font-bold text-zinc-900 dark:text-white text-lg">{{ item.name }}</h3>
              <p class="text-sm text-zinc-400 dark:text-zinc-500 mb-4">{{ item.description }}</p>
              <p class="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
                Tipo: {{ getItemTypeLabel(item) }}
              </p>
              <p class="text-[11px] font-semibold uppercase tracking-wide text-emerald-500/90 mb-3">
                Desbloqueo: {{ getUnlockTypeLabel(item) }}
              </p>
              <p v-if="!item.is_unlocked" class="text-xs font-bold uppercase tracking-wide text-red-400 mb-3">
                Se desbloquea en {{ getCountdown(item) }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-white/5">
              <div v-if="item.owned" class="text-emerald-500 font-black text-sm uppercase tracking-wide">
                En Propiedad
              </div>
              <div v-else-if="item.price > 0" class="flex items-center gap-1">
                <span class="font-black" :class="canAfford(item) ? 'text-amber-500' : 'text-zinc-600'">{{ item.price }}</span>
                <span class="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">Coins</span>
              </div>
              <div v-else class="text-pink-500 font-bold text-[10px] uppercase tracking-widest">
                Recompensa de Evento
              </div>

              <button 
                v-if="!item.owned && item.price > 0"
                @click="buyItem(item)"
                :disabled="!canAfford(item) || buying || !item.is_unlocked"
                class="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all"
                :class="canAfford(item) && item.is_unlocked ? 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 cursor-not-allowed'"
              >
                {{ item.is_unlocked ? 'Comprar' : 'Bloqueado' }}
              </button>
              
              <button 
                v-if="item.owned"
                @click="equipItem(item)"
                :disabled="isEquipped(item)"
                class="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all"
                :class="isEquipped(item) ? 'bg-white/10 text-zinc-900 dark:text-white/50 cursor-pointer' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'"
              >
                {{ isEquipped(item) ? 'Equipado' : 'Equipar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { LayoutGrid, Type, Frame, Sparkles } from 'lucide-vue-next';
import AvatarFrame from './AvatarFrame.vue';
import BackgroundEffect from './BackgroundEffect.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const items = ref([]);
const loading = ref(true);
const buying = ref(false);
const nowMs = ref(Date.now());
let countdownTimer = null;

const selectedCategory = ref('all');

const categories = [
  { id: 'all', name: 'Todos', icon: LayoutGrid },
  { id: 'title', name: 'Títulos', icon: Type },
  { id: 'border', name: 'Marcos', icon: Frame },
  { id: 'background', name: 'Fondos', icon: Sparkles }
];

const filteredItems = computed(() => {
  let result = [...items.value];
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    result = result.filter(item => item.type === selectedCategory.value);
  }
  
  // Sort by price (Lowest to Highest)
  return result.sort((a, b) => a.price - b.price);
});

const seasonalItems = computed(() => {
  return filteredItems.value.filter(item => item.is_seasonal);
});

const regularItems = computed(() => {
  return filteredItems.value.filter(item => !item.is_seasonal);
});

const checkShop = async () => {
  try {
    const res = await axios.get('/api/shop/cosmetics');
    items.value = res.data;
  } catch (error) {
    if (error.response?.status !== 401) {
      notificationStore.notify('Error al cargar la tienda', 'error');
    }
  } finally {
    loading.value = false;
  }
};

const canAfford = (item) => {
  return (authStore.user?.reppy_coins || 0) >= item.price;
};

const getItemTypeLabel = (item) => {
  if (item.type === 'background') return 'Fondo';
  if (item.type === 'border') return 'Marco';
  if (item.type === 'title') return 'Titulo';
  return item.type || 'Cosmetico';
};

const getUnlockTypeLabel = (item) => {
  if (item.price === 0) return 'Evento';
  if (!item.is_unlocked) return 'Roadmap temporal';
  return 'Compra directa';
};

const getBackgroundPreviewClass = (item) => {
  if (typeof item.css_value === 'string' && item.css_value.trim().startsWith('bg-')) {
    return item.css_value;
  }
  return '';
};

const getBackgroundPreviewStyle = (item) => {
  const ref = `${item?.name || ''} ${item?.description || ''}`.toLowerCase();

  if (ref.includes('inferno') || ref.includes('fuego') || ref.includes('lava')) {
    return {
      background: 'linear-gradient(135deg, #3b0a00 0%, #991b1b 45%, #f97316 100%)'
    };
  }
  if (ref.includes('storm') || ref.includes('tormenta') || ref.includes('rayo')) {
    return {
      background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #93c5fd 100%)'
    };
  }
  if (ref.includes('cosmic') || ref.includes('nebula') || ref.includes('space')) {
    return {
      background: 'linear-gradient(135deg, #020617 0%, #312e81 45%, #7c3aed 100%)'
    };
  }
  if (ref.includes('ocean') || ref.includes('deep') || ref.includes('sea')) {
    return {
      background: 'linear-gradient(135deg, #082f49 0%, #0e7490 50%, #38bdf8 100%)'
    };
  }
  if (ref.includes('void') || ref.includes('night') || ref.includes('mist')) {
    return {
      background: 'linear-gradient(135deg, #09090b 0%, #27272a 55%, #52525b 100%)'
    };
  }

  const palette = [
    ['#111827', '#1f2937', '#4b5563'],
    ['#172554', '#1d4ed8', '#60a5fa'],
    ['#052e16', '#166534', '#4ade80'],
    ['#3f1d2e', '#7e22ce', '#c084fc'],
    ['#3f1d00', '#b45309', '#f59e0b']
  ];
  const key = item?.id || (item?.name || '').length || 0;
  const [c1, c2, c3] = palette[key % palette.length];
  return {
    background: `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`
  };
};

const getCountdown = (item) => {
  if (!item?.unlock_at) return '00:00:00';
  const diff = Math.max(0, new Date(item.unlock_at).getTime() - nowMs.value);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
};

const isEquipped = (item) => {
  if (!authStore.user) return false;
  if (item.type === 'title') return authStore.user.equipped_title_id === item.id;
  if (item.type === 'border') return authStore.user.equipped_border_id === item.id;
  if (item.type === 'background') return authStore.user.equipped_background_id === item.id;
  return false;
};

const getRarityBadge = (item) => {
  const rarity = item.rarity || 'common';
  switch (rarity) {
    case 'legendary': return { label: 'Legendary', classes: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    case 'epic': return { label: 'Epic', classes: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    case 'rare': return { label: 'Rare', classes: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    default: return { label: 'Common', classes: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30' };
  }
};

const getCardClass = (item) => {
  if (isEquipped(item)) return 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]';
  if (item.owned) return 'border-white/20';
  if (!item.is_unlocked) return 'border-zinc-300 dark:border-zinc-700 opacity-85 grayscale';
  if (item.price >= 1200) return 'border-orange-500/40 hover:border-orange-500/70 shadow-[0_0_20px_rgba(249,115,22,0.05)]';
  if (item.price >= 600) return 'border-purple-500/30 hover:border-purple-500/60';
  if (canAfford(item)) return 'border-amber-500/30 hover:border-amber-500/60';
  return 'border-zinc-200 dark:border-white/5 opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 grayscale hover:grayscale-0';
};

const buyItem = async (item) => {
  buying.value = true;
  try {
    const res = await axios.post(`/api/shop/buy/${item.id}`);
    authStore.user.reppy_coins = res.data.remaining_coins;
    notificationStore.notify(`Has comprado: ${item.name}!`, 'success');
    await checkShop();
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Error en la compra', 'error');
  } finally {
    buying.value = false;
  }
};

const equipItem = async (item) => {
  try {
    await axios.post(`/api/shop/equip/${item.id}?type=${item.type}`);
    
    // Optimistic update
    if (item.type === 'title') {
      authStore.user.equipped_title_id = item.id;
      authStore.user.title_css = item.css_value;
      authStore.user.title_name = item.name;
    }
    if (item.type === 'border') {
      authStore.user.equipped_border_id = item.id;
      authStore.user.border_css = item.css_value;
    }
    if (item.type === 'background') {
      authStore.user.equipped_background_id = item.id;
      authStore.user.background_css = item.css_value;
    }
    
    notificationStore.notify(`${item.name} equipado`, 'success');
  } catch (error) {
    notificationStore.notify('No se pudo equipar', 'error');
  }
};

onMounted(() => {
  checkShop();
  countdownTimer = setInterval(() => {
    nowMs.value = Date.now();
  }, 1000);
  // Fetch user if not loaded
  if (!authStore.user) {
    authStore.fetchProfile();
  }
});

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

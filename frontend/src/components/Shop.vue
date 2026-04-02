<template>
  <div class="max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-white uppercase italic">Taberna Mística</h1>
        <p class="text-zinc-400 mt-1 font-medium">Equipa tu Leyenda.</p>
      </div>
      <div class="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/30">
        <span class="text-amber-500 font-black text-xl">{{ authStore.user?.reppy_coins || 0 }}</span>
        <span class="text-xs uppercase tracking-widest text-amber-500/70 font-bold">Reppy Coins</span>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent mx-auto"></div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="item in items" 
        :key="item.id"
        class="bg-zinc-900 border-2 rounded-2xl p-6 transition-all relative overflow-hidden"
        :class="getCardClass(item)"
      >
        <!-- Preview -->
        <div class="h-24 flex items-center justify-center bg-black/40 rounded-xl mb-4 border border-white/5 relative">
           <div v-if="item.type === 'title'" class="text-xl" :class="item.css_value">
             {{ item.name }}
           </div>
           <div v-if="item.type === 'border'" class="w-16 h-16 rounded-full bg-zinc-800" :class="item.css_value"></div>
        </div>

        <div>
          <h3 class="font-bold text-white text-lg">{{ item.name }}</h3>
          <p class="text-sm text-zinc-500 mb-4">{{ item.description }}</p>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-white/5">
          <div v-if="item.owned" class="text-emerald-500 font-black text-sm uppercase tracking-wide">
            En Propiedad
          </div>
          <div v-else class="flex items-center gap-1">
            <span class="font-black" :class="canAfford(item) ? 'text-amber-500' : 'text-zinc-600'">{{ item.price }}</span>
            <span class="text-[10px] uppercase font-bold text-zinc-500">Coins</span>
          </div>

          <button 
            v-if="!item.owned"
            @click="buyItem(item)"
            :disabled="!canAfford(item) || buying"
            class="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all"
            :class="canAfford(item) ? 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'"
          >
            Comprar
          </button>
          
          <button 
            v-if="item.owned"
            @click="equipItem(item)"
            :disabled="isEquipped(item)"
            class="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all"
            :class="isEquipped(item) ? 'bg-white/10 text-white/50 cursor-pointer' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'"
          >
            {{ isEquipped(item) ? 'Equipado' : 'Equipar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const items = ref([]);
const loading = ref(true);
const buying = ref(false);

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

const isEquipped = (item) => {
  if (!authStore.user) return false;
  if (item.type === 'title') return authStore.user.equipped_title_id === item.id;
  if (item.type === 'border') return authStore.user.equipped_border_id === item.id;
  return false;
};

const getCardClass = (item) => {
  if (isEquipped(item)) return 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]';
  if (item.owned) return 'border-white/20';
  if (canAfford(item)) return 'border-amber-500/30 hover:border-amber-500/60';
  return 'border-white/5 opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 grayscale hover:grayscale-0';
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
    await axios.post(`/api/shop/equip/${item.id}`);
    
    // Optimistic update
    if (item.type === 'title') authStore.user.equipped_title_id = item.id;
    if (item.type === 'border') authStore.user.equipped_border_id = item.id;
    
    notificationStore.notify(`${item.name} equipado`, 'success');
  } catch (error) {
    notificationStore.notify('No se pudo equipar', 'error');
  }
};

onMounted(() => {
  checkShop();
  // Fetch user if not loaded
  if (!authStore.user) {
    authStore.fetchProfile();
  }
});
</script>

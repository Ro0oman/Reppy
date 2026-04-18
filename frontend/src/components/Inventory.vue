<template>
  <div class="max-w-6xl mx-auto px-4 py-12 space-y-12 animate-in relative z-10">
    <div class="text-center space-y-4">
      <h1 class="text-4xl md:text-6xl font-black text-industrial tracking-tighter text-foreground uppercase italic">
        GEAR<span class="text-primary-500">.</span>MANAGEMENT
      </h1>
      <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em] font-tight">Configure your legendary protocol loadout.</p>
    </div>

    <!-- Section: Level-Up Chests (Progression Reward) -->
    <div v-if="authStore.user?.level_chests > 0" 
      class="card-stats p-10 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent border-cyan-500/20 group relative overflow-hidden">
      
      <!-- Decorative Background Icon -->
      <TrendingUp class="absolute -right-8 -bottom-8 w-64 h-64 text-cyan-500/5 -rotate-12 transition-transform duration-1000" />
      
      <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div class="flex items-center gap-8">
          <div class="relative group/chest">
            <div class="absolute inset-0 bg-cyan-500/20 blur-3xl group-hover/chest:bg-cyan-500/40 transition-all duration-700"></div>
            <div class="relative bg-surface/60 rounded-3xl p-6 border border-cyan-500/30 shadow-2xl">
              <TrendingUp class="w-12 h-12 text-cyan-500" />
            </div>
            <div class="absolute -top-3 -right-3 bg-cyan-400 text-black text-xs font-black px-3 py-1.5 rounded-xl shadow-xl border-4 border-background z-20 font-precision">
              x{{ authStore.user.level_chests }}
            </div>
          </div>
          <div class="space-y-2">
            <h2 class="text-3xl font-black text-industrial text-foreground uppercase italic tracking-tighter">COFRES DE <span class="text-cyan-500">NIVEL</span></h2>
            <p class="text-muted font-bold uppercase tracking-widest text-[10px]">{{ i18n.t('inv_common_chest_desc') }}</p>
          </div>
        </div>
        
        <button @click="handleOpenLevelChest" :disabled="openingChest"
          title="Abrir Cofre de Nivel / Decode Progression Reward"
          class="btn-reppy !bg-cyan-500 hover:!bg-cyan-600 !px-12 !py-6 !text-lg !rounded-3xl shadow-[0_20px_50px_rgba(6,182,212,0.3)] disabled:opacity-20 disabled:grayscale transition-all">
          <Sparkles class="w-6 h-6" />
          {{ openingChest ? 'DESCIFRANDO...' : 'ABRIR COFRE DE NIVEL' }}
        </button>
      </div>
    </div>

    <!-- Section: Boss Chests (Industrial Reward) -->
    <div v-if="authStore.user?.boss_chests > 0" 
      class="card-stats p-10 bg-gradient-radial from-primary-500/10 via-transparent to-transparent border-primary-500/20 group relative overflow-hidden">
      
      <!-- Decorative Background Icon -->
      <Archive class="absolute -right-8 -bottom-8 w-64 h-64 text-primary-500/5 -rotate-12 transition-transform duration-1000" />
      
      <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div class="flex items-center gap-8">
          <div class="relative group/chest">
            <div class="absolute inset-0 bg-primary-500/20 blur-3xl group-hover/chest:bg-primary-500/40 transition-all duration-700"></div>
            <div class="relative bg-surface/60 rounded-3xl p-6 border border-primary-500/30 shadow-2xl">
              <Archive class="w-12 h-12 text-primary-500" />
            </div>
            <div class="absolute -top-3 -right-3 bg-neon-lime text-black text-xs font-black px-3 py-1.5 rounded-xl shadow-xl border-4 border-background z-20 font-precision">
              x{{ authStore.user.boss_chests }}
            </div>
          </div>
          <div class="space-y-2">
            <h2 class="text-3xl font-black text-industrial text-foreground uppercase italic tracking-tighter">COFRES DE <span class="text-primary-500">TEMPORADA</span></h2>
            <p class="text-muted font-bold uppercase tracking-widest text-[10px]">{{ i18n.t('inv_boss_chest_desc') }}</p>
          </div>
        </div>
        
        <button @click="handleOpenChest" :disabled="openingChest"
          title="Abrir Cofre de Boss / Decode Season Loot"
          class="btn-reppy !px-12 !py-6 !text-lg !rounded-3xl shadow-[0_20px_50px_rgba(255,69,0,0.3)] disabled:opacity-20 disabled:grayscale transition-all">
          <Sparkles class="w-6 h-6" />
          {{ openingChest ? 'DESCIFRANDO...' : 'ABRIR COFRE DE BOSS' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-6">
      <div class="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent"></div>
      <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">SYNCING INVENTORY...</p>
    </div>

    <div v-else-if="inventory.length === 0" class="card-stats py-32 text-center border-border bg-foreground/[0.01]">
      <div class="bg-foreground/5 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-border">
        <Package class="w-10 h-10 text-muted" />
      </div>
      <h3 class="text-2xl font-black text-industrial text-foreground uppercase tracking-tight">INVENTORY NULL</h3>
      <p class="text-[10px] font-black text-muted mt-4 uppercase tracking-[0.3em]">Visit THE ARMORY to initiate your collection.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <!-- Section: Borders (The Frame Deck) -->
      <div v-if="groupedItems.border" class="space-y-6">
        <div class="flex items-center justify-between px-2">
          <div class="flex items-center gap-3">
             <div class="p-2 bg-blue-500/10 rounded-xl"><Frame class="w-5 h-5 text-blue-500" /></div>
             <h2 class="text-lg font-black text-industrial text-foreground tracking-widest uppercase">AVATAR BORDERS</h2>
          </div>
          <span class="text-[10px] font-black text-muted uppercase tabular-nums tracking-widest font-precision">{{ groupedItems.border.length }} UNITS</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="item in groupedItems.border" :key="item.id" 
            class="card-stats !p-0 overflow-hidden border-border group/card transition-all"
            :class="isEquipped(item) ? '!border-primary-500/50 bg-primary-500/5' : 'hover:border-primary-500/30'">
            
            <div class="p-6 flex items-center gap-5 relative">
              <div v-if="item.is_new" class="absolute top-4 right-4 z-20 px-2 py-1 rounded-lg bg-neon-lime text-[8px] font-black text-black uppercase tracking-widest animate-pulse">NEW</div>
              <div class="relative flex-shrink-0">
                <AvatarFrame :src="authStore.user?.avatar_url" :border-css="item.css_value" :size="56" />
                <div v-if="isEquipped(item)" class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center border-2 border-background z-20"><Check class="w-3 h-3 text-white" /></div>
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-sm font-black text-foreground truncate font-tight uppercase italic leading-none group-hover/card:text-primary-500 transition-colors">{{ item.name }}</h4>
                <p class="text-[10px] font-bold text-muted mt-1 lines-clamp-1 truncate uppercase tracking-widest">{{ item.description }}</p>
              </div>
            </div>
            
            <div class="p-4 pt-0">
              <button @click="toggleEquip(item)" 
                class="w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                :class="isEquipped(item) ? 'bg-foreground/5 text-muted border border-border' : 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'">
                {{ isEquipped(item) ? 'DEACTIVATE' : 'ACTIVATE' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Titles (The Designation Deck) -->
      <div v-if="groupedItems.title" class="space-y-6">
        <div class="flex items-center justify-between px-2">
          <div class="flex items-center gap-3">
             <div class="p-2 bg-amber-500/10 rounded-xl"><Type class="w-5 h-5 text-amber-500" /></div>
             <h2 class="text-lg font-black text-industrial text-foreground tracking-widest uppercase">HONOR TITLES</h2>
          </div>
          <span class="text-[10px] font-black text-muted uppercase tabular-nums tracking-widest font-precision">{{ groupedItems.title.length }} UNITS</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="item in groupedItems.title" :key="item.id" 
            class="card-stats !p-0 overflow-hidden border-white/5 transition-all"
            :class="isEquipped(item) ? '!border-primary-500/50 bg-primary-500/5' : 'hover:border-primary-500/30'">
            
            <div class="p-6 relative space-y-4">
              <div v-if="item.is_new" class="absolute top-4 right-4 z-20 px-2 py-1 rounded-lg bg-neon-lime text-[8px] font-black text-black uppercase tracking-widest animate-pulse">NEW</div>
              <div class="flex flex-col">
                <h4 class="text-base font-black text-foreground truncate font-tight uppercase italic leading-none group-hover/card:text-primary-500 transition-colors" :class="item.css_value">{{ item.name }}</h4>
                <p class="text-[9px] font-black text-muted mt-2 uppercase tracking-widest italic line-clamp-1">"{{ item.description }}"</p>
              </div>
              <button @click="toggleEquip(item)" 
                class="w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                :class="isEquipped(item) ? 'bg-foreground/5 text-muted border border-border' : 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'">
                {{ isEquipped(item) ? 'DEACTIVATE' : 'ACTIVATE' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Backgrounds (The Screen Deck) -->
      <div v-if="groupedItems.background" class="md:col-span-2 space-y-6 pt-8">
        <div class="flex items-center justify-between px-2">
          <div class="flex items-center gap-3">
             <div class="p-2 bg-purple-500/10 rounded-xl"><Sparkles class="w-5 h-5 text-purple-500" /></div>
             <h2 class="text-lg font-black text-industrial text-foreground tracking-widest uppercase">INTERFACE SCREENS</h2>
          </div>
          <div class="h-px flex-1 bg-border mx-6 hidden md:block"></div>
          <span class="text-[10px] font-black text-muted uppercase tabular-nums tracking-widest font-precision">{{ groupedItems.background.length }} UNITS</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="item in groupedItems.background" :key="item.id" 
            class="card-stats !p-0 overflow-hidden border-white/5 group/card transition-all"
            :class="isEquipped(item) ? '!border-primary-500/50 bg-primary-500/5' : 'hover:border-primary-500/30'">
            
            <!-- Preview Map -->
            <div class="w-full aspect-video relative overflow-hidden bg-black border-b border-white/5">
              <BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0 !w-full !h-full" />
              <div v-if="isEquipped(item)" class="absolute top-3 right-3 bg-primary-500 rounded-full p-1.5 border-4 border-deep-abyss shadow-2xl z-20"><Check class="w-2.5 h-2.5 text-white" /></div>
              <div v-if="item.is_new" class="absolute top-3 left-3 px-2 py-1 rounded-lg bg-neon-lime text-[8px] font-black text-black uppercase tracking-widest z-20">NEW</div>
            </div>

            <div class="p-5 space-y-4">
              <div>
                <h4 class="text-xs font-black text-foreground font-tight uppercase italic leading-none group-hover/card:text-primary-500 transition-colors">{{ item.name }}</h4>
                <p class="text-[9px] font-black text-muted mt-2 uppercase tracking-widest line-clamp-1 italic">{{ item.description }}</p>
              </div>
              <button @click="toggleEquip(item)" 
                class="w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                :class="isEquipped(item) ? 'bg-foreground/5 text-muted border border-border' : 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'">
                {{ isEquipped(item) ? 'DEACTIVATE' : 'ACTIVATE' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chest Opening Modal Overlay -->
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
import { Package, Frame, Type, Check, Sparkles, Archive, Zap, TrendingUp } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import { useNotificationStore } from '../stores/notification';
import AvatarFrame from './AvatarFrame.vue';
import BackgroundEffect from './BackgroundEffect.vue';
import ChestOpening from './ChestOpening.vue';
import axios from 'axios';

const authStore = useAuthStore();
const i18n = useI18nStore();
const emit = defineEmits(['start', 'viewProfile']);
const notificationStore = useNotificationStore();
const inventory = ref([]);
const loading = ref(true);

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
    if (authStore.user) authStore.user.boss_chests--;
  } catch (err) { notificationStore.notify('Chest decryption failed', 'error'); }
  finally { openingChest.value = false; }
};

const handleOpenLevelChest = async () => {
  if (openingChest.value) return;
  openingChest.value = true;
  try {
    const res = await axios.post('/api/boss/open-level-chest');
    chestReward.value = res.data.reward;
    reelItems.value = res.data.reel_items;
    showChestModal.value = true;
    if (authStore.user) authStore.user.level_chests--;
  } catch (err) { notificationStore.notify('Level chest decryption failed', 'error'); }
  finally { openingChest.value = false; }
};

const closeChestModal = async () => {
  showChestModal.value = false;
  await fetchInventory();
  await authStore.fetchProfile();
};

const fetchInventory = async () => {
  try {
    const res = await axios.get('/api/shop/cosmetics');
    inventory.value = res.data.filter(item => item.owned);
  } catch (err) { console.error('Inventory sync error:', err); }
  finally { loading.value = false; }
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
  if (item.type === 'title') return authStore.user?.equipped_title_id === item.id;
  if (item.type === 'border') return authStore.user?.equipped_border_id === item.id;
  if (item.type === 'background') return authStore.user?.equipped_background_id === item.id;
  if (item.type === 'avatar') return authStore.user?.equipped_avatar_id === item.id;
  return false;
};

const toggleEquip = async (item) => {
  const alreadyEquipped = isEquipped(item);
  const targetId = alreadyEquipped ? 0 : item.id;
  try {
    await axios.post(`/api/shop/equip/${targetId}?type=${item.type}`);
    if (item.type === 'title') { authStore.user.equipped_title_id = alreadyEquipped ? null : item.id; authStore.user.title_css = alreadyEquipped ? '' : item.css_value; authStore.user.title_name = alreadyEquipped ? '' : item.name; }
    else if (item.type === 'border') { authStore.user.equipped_border_id = alreadyEquipped ? null : item.id; authStore.user.border_css = alreadyEquipped ? '' : item.css_value; }
    else if (item.type === 'background') { authStore.user.equipped_background_id = alreadyEquipped ? null : item.id; authStore.user.background_css = alreadyEquipped ? '' : item.css_value; }
    else if (item.type === 'avatar') { authStore.user.equipped_avatar_id = alreadyEquipped ? null : item.id; authStore.user.avatar_css = alreadyEquipped ? '' : item.css_value; }
    notificationStore.notify(alreadyEquipped ? 'Deactivated' : 'Activated', 'success');
  } catch (err) { notificationStore.notify('Activation error', 'error'); }
};

const markSeen = async (item) => {
  if (!item.is_new) return;
  try { await axios.post(`/api/shop/mark-seen/${item.id}`); item.is_new = false; } 
  catch (e) { console.error('Signalling error:', e); }
};

onMounted(async () => {
  await Promise.all([fetchInventory(), authStore.fetchProfile()]);
  setTimeout(() => { inventory.value.forEach(item => { if (item.is_new) markSeen(item); }); }, 3000);
});
</script>

<style scoped>
.text-industrial { font-family: 'Inter Tight', sans-serif; }
.font-tight { font-family: 'Inter Tight', sans-serif; }
.text-precision { font-family: 'JetBrains Mono', monospace; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in relative z-10 pb-32">
    <!-- Premium Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl md:text-5xl font-black text-industrial tracking-tighter text-foreground uppercase italic">
        INVENTARIO<span class="text-primary-500">.</span>RPG
      </h1>
      <div class="flex items-center justify-center gap-4">
        <div class="h-1 w-12 bg-primary-500 rounded-full"></div>
        <p class="text-[9px] font-black text-muted uppercase tracking-[0.4em] font-tight">Gestiona tus atributos y equipamiento</p>
        <div class="h-1 w-12 bg-primary-500 rounded-full"></div>
      </div>
    </div>

    <!-- Navigation Tabs (Mobile First) -->
    <div class="flex items-center justify-center p-2 bg-surface/40 backdrop-blur-xl border border-white/5 rounded-2xl max-w-sm mx-auto shadow-2xl">
      <button @click="activeTab = 'stats'" 
        class="flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        :class="activeTab === 'stats' ? 'bg-primary-500 text-white shadow-lg' : 'text-muted hover:text-foreground'">
        <Zap class="w-3.5 h-3.5" /> ATRIBUTOS
      </button>
      <button @click="activeTab = 'gear'" 
        class="flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        :class="activeTab === 'gear' ? 'bg-primary-500 text-white shadow-lg' : 'text-muted hover:text-foreground'">
        <Package class="w-3.5 h-3.5" /> EQUIPO
      </button>
    </div>

    <!-- TAB: STATS (The Character Profile) -->
    <div v-if="activeTab === 'stats'" class="space-y-8 animate-in">
      <!-- Character Level Card -->
      <div class="card-stats p-8 bg-gradient-to-br from-primary-500/20 to-transparent border-primary-500/30 relative overflow-hidden group">
        <div class="absolute -right-12 -bottom-12 opacity-5 group-hover:opacity-10 transition-opacity">
          <Trophy class="w-64 h-64 -rotate-12" />
        </div>
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div class="relative">
            <div class="w-24 h-24 rounded-3xl bg-surface border-4 border-primary-500 flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
               <img :src="authStore.user?.avatar_url" class="w-full h-full object-cover" />
            </div>
            <div class="absolute -bottom-3 -right-3 w-10 h-10 bg-primary-500 rounded-2xl border-4 border-background flex items-center justify-center text-white font-black text-sm z-20 shadow-xl">
              {{ authStore.user?.current_level || 1 }}
            </div>
          </div>
          <div class="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h2 class="text-2xl font-black text-foreground uppercase tracking-tighter italic">Nivel de Personaje</h2>
              <p class="text-[10px] font-bold text-muted uppercase tracking-widest">Sube de nivel para ganar cofres y poder destructivo</p>
            </div>
            <div class="space-y-2">
              <div class="h-4 bg-surface/60 rounded-full border border-white/5 overflow-hidden shadow-inner">
                <div class="h-full bg-primary-500 shadow-[0_0_20px_rgba(255,69,0,0.5)] transition-all duration-1000" 
                  :style="{ width: `${(authStore.user?.xp_into_level || 0) / 10}%` }"></div>
              </div>
              <div class="flex justify-between text-[9px] font-black text-muted uppercase tracking-widest italic">
                <span>XP: {{ authStore.user?.xp_into_level || 0 }}</span>
                <span>SIGUIENTE NIVEL: 1000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid (Clash Royale Style Attributes) -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="stat in rpgStats" :key="stat.key" 
          @click="selectedStat = stat"
          class="card-stats !p-4 border-white/5 hover:border-primary-500/30 cursor-pointer transition-all active:scale-95 group relative overflow-hidden bg-surface/30">
          
          <div class="flex flex-col items-center gap-3 text-center relative z-10">
            <div class="p-4 rounded-2xl bg-surface shadow-xl border border-white/5 group-hover:scale-110 transition-transform">
              <component :is="stat.icon" class="w-6 h-6" :class="stat.color" />
            </div>
            <div>
              <span class="text-[10px] font-black text-muted uppercase tracking-widest block">{{ stat.name }}</span>
              <span class="text-3xl font-black text-foreground tracking-tighter italic">{{ authStore.user?.[stat.xpKey] || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stat Detail Modal (Clash Royale Detail View) -->
      <Transition name="fade">
        <div v-if="selectedStat" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="selectedStat = null">
          <div class="bg-surface border border-primary-500/30 rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-in shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
            <!-- Close Button -->
            <button @click="selectedStat = null" class="absolute top-6 right-6 z-20 p-2 text-muted hover:text-white transition-colors">
              <X class="w-6 h-6" />
            </button>
            <div class="p-8 space-y-8 text-center">
              <div class="mx-auto p-8 rounded-[2rem] bg-gradient-radial from-primary-500/10 via-transparent to-transparent inline-block">
                <component :is="selectedStat.icon" class="w-16 h-16" :class="selectedStat.color" />
              </div>
              <div class="space-y-4">
                <h3 class="text-3xl font-black text-foreground uppercase italic tracking-tighter">{{ selectedStat.name }}</h3>
                <p class="text-muted text-sm font-medium leading-relaxed px-4">{{ selectedStat.description }}</p>
                <div class="py-4 px-6 bg-foreground/5 rounded-2xl border border-white/5 text-[11px] font-black text-primary-500 uppercase tracking-widest italic">
                  Efecto: {{ selectedStat.effect }}
                </div>
              </div>

              <!-- Improve Links -->
              <div class="space-y-3">
                <p class="text-[9px] font-black text-muted uppercase tracking-[0.2em]">CÓMO MEJORAR ESTE ATRIBUTO</p>
                <div class="flex flex-col gap-2">
                   <router-link v-for="link in selectedStat.links" :key="link.to" :to="link.to"
                    class="w-full py-4 bg-primary-500 rounded-2xl text-[10px] font-black text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                    <ExternalLink class="w-3.5 h-3.5" /> {{ link.label }}
                   </router-link>
                </div>
              </div>

              <button @click="selectedStat = null" class="text-[10px] font-black text-muted hover:text-foreground uppercase tracking-widest p-2">CERRAR DETALLES</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- TAB: GEAR (Clash Royale Style Grid) -->
    <div v-if="activeTab === 'gear'" class="space-y-12 animate-in pb-20">
      <!-- Section: Chests (Loot Management) -->
      <div v-if="authStore.user?.level_chests > 0 || authStore.user?.boss_chests > 0" class="flex flex-col md:flex-row gap-4">
        <button v-if="authStore.user?.level_chests > 0" @click="handleOpenLevelChest" :disabled="openingChest"
          class="flex-1 card-stats p-6 !bg-cyan-500/10 border-cyan-500/30 group hover:!bg-cyan-500/20 transition-all flex items-center justify-between">
          <div class="flex items-center gap-4 text-left">
            <div class="p-3 bg-cyan-500/20 rounded-2xl"><TrendingUp class="w-6 h-6 text-cyan-500" /></div>
            <div>
              <p class="text-[10px] font-black text-cyan-500 uppercase tracking-widest">COFRE DE NIVEL</p>
              <h4 class="text-xl font-black text-foreground italic">{{ authStore.user.level_chests }} DISPONIBLES</h4>
            </div>
          </div>
          <Zap class="w-5 h-5 text-cyan-500 animate-pulse" />
        </button>

        <button v-if="authStore.user?.boss_chests > 0" @click="handleOpenChest" :disabled="openingChest"
          class="flex-1 card-stats p-6 !bg-primary-500/10 border-primary-500/30 group hover:!bg-primary-500/20 transition-all flex items-center justify-between">
          <div class="flex items-center gap-4 text-left">
            <div class="p-3 bg-primary-500/20 rounded-2xl"><Archive class="w-6 h-6 text-primary-500" /></div>
            <div>
              <p class="text-[10px] font-black text-primary-500 uppercase tracking-widest">COFRE MECÁNICO</p>
              <h4 class="text-xl font-black text-foreground italic">{{ authStore.user.boss_chests }} DISPONIBLES</h4>
            </div>
          </div>
          <Sparkles class="w-5 h-5 text-primary-500 animate-pulse" />
        </button>
      </div>

      <div v-if="loading" class="py-32 flex flex-col items-center justify-center gap-4">
         <div class="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
         <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em]">SYNCING GEAR...</p>
      </div>

      <div v-else-if="inventory.length === 0" class="card-stats py-32 text-center border-dashed border-white/5 opacity-50">
        <Package class="w-16 h-16 mx-auto mb-6 text-muted" />
        <h3 class="text-2xl font-black uppercase italic tracking-tighter">Armería Vacía</h3>
        <p class="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mt-2">Derrota bosses para obtener equipo legendario</p>
      </div>

      <!-- Item Grids by Type -->
      <div v-else v-for="(items, type) in groupedItems" :key="type" class="space-y-6">
        <div class="flex items-center gap-4">
          <h2 class="text-xs font-black text-foreground uppercase tracking-[0.3em] font-industrial border-b-2 border-primary-500 pb-1">{{ type === 'title' ? 'DESIGNACIONES' : type === 'border' ? 'MARCOS' : 'ESCENARIOS' }}</h2>
          <div class="flex-1 h-px bg-white/5"></div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div v-for="item in items" :key="item.id" 
            @click="toggleEquip(item)"
            class="clash-card group" 
            :class="[isEquipped(item) ? 'equipped' : '', `rarity-${item.rarity || 'common'}`]">
            
            <div class="clash-card-inner">
               <div v-if="item.is_new" class="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full bg-neon-lime text-[7px] font-black text-black uppercase tracking-widest animate-pulse">NUEVO</div>
               
               <!-- Card Display -->
               <div class="h-32 flex items-center justify-center p-4 relative overflow-hidden bg-black/40">
                  <div v-if="type === 'border'" class="group-hover:scale-110 transition-transform">
                    <AvatarFrame :src="authStore.user?.avatar_url" :border-css="item.css_value" :size="70" />
                  </div>
                  <div v-else-if="type === 'title'" class="text-center group-hover:scale-110 transition-transform px-2">
                    <h4 class="text-sm font-black uppercase italic leading-tight" :class="item.css_value">{{ item.name }}</h4>
                  </div>
                  <div v-else-if="type === 'background'" class="w-full h-full">
                     <BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0" />
                  </div>
               </div>

               <!-- Bottom Info -->
               <div class="p-3 bg-surface/60 space-y-1 relative">
                  <div v-if="isEquipped(item)" class="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-primary-500 rounded-lg flex items-center justify-center border-4 border-surface shadow-xl"><Check class="w-3 h-3 text-white" /></div>
                  <h4 class="text-[10px] font-black text-foreground truncate uppercase text-center italic">{{ item.name }}</h4>
                  <div class="text-[7px] font-black text-muted uppercase text-center tracking-widest">{{ item.rarity || 'common' }}</div>
               </div>
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
import { ref, onMounted, computed, watch } from 'vue';
import { 
  Package, Frame, Type, Check, Sparkles, Archive, Zap, TrendingUp, 
  Dumbbell, Sword, Heart, Brain, Church, Trophy, ExternalLink, Activity, X
} from 'lucide-vue-next';
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

const activeTab = ref('stats');
const selectedStat = ref(null);

const rpgStats = computed(() => [
  {
    key: 'str',
    name: 'FUERZA (STR)',
    xpKey: 'str_xp',
    icon: Dumbbell,
    color: 'text-orange-500',
    description: 'Aumenta el daño base y el escalado de ejercicios pesados como Muscleups y Dominadas Lastradas.',
    effect: '+ Daño Físico',
    links: [{ label: 'Entrenar Fuerza', to: '/?exercise=weighted_pullups' }]
  },
  {
    key: 'dex',
    name: 'DESTREZA (DEX)',
    xpKey: 'dex_xp',
    icon: Sword,
    color: 'text-cyan-400',
    description: 'Aumenta tu probabilidad de Golpe Crítico y el multiplicador de daño crítico. Se mejora con técnica y variedad.',
    effect: '+ Prob. Crítico & Crit Dam',
    links: [{ label: 'Mejorar Técnica', to: '/?exercise=muscleups' }]
  },
  {
    key: 'end',
    name: 'RESISTENCIA (END)',
    xpKey: 'end_xp',
    icon: Activity,
    color: 'text-green-400',
    description: 'Escalado secundario de daño basado en el volumen total de repeticiones. Ideal para series largas.',
    effect: '+ Damage Momentum',
    links: [{ label: 'Aumentar Volumen', to: '/?exercise=pushups' }]
  },
  {
    key: 'vig',
    name: 'VIGOR (VIG)',
    xpKey: 'vig_xp',
    icon: Heart,
    color: 'text-red-500',
    description: 'Aumenta tu resiliencia ante el daño y aporta estabilidad a tus golpes críticos. Se gana con Rachas de entrenamiento.',
    effect: '+ Crit Stability',
    links: [{ label: 'Mantener Racha', to: '/' }]
  },
  {
    key: 'int',
    name: 'INTELECTO (INT)',
    xpKey: 'int_xp',
    icon: Brain,
    color: 'text-blue-400',
    description: 'Eficiencia en el entrenamiento. Mejora el multiplicador de Nivel Global. Se gana leyendo artículos del Blog.',
    effect: '+ Multipl. de Eficiencia',
    links: [{ label: 'Ganar Conocimiento', to: '/blog' }]
  },
  {
    key: 'fth',
    name: 'FE (FTH)',
    xpKey: 'fth_xp',
    icon: Church,
    color: 'text-yellow-400',
    description: 'Daño Sagrado adicional. Tu participación en Boss Battles pasadas alimenta tu aura divina actual.',
    effect: '+ Divine Bonus Damage',
    links: [{ label: 'Unirse al Raid', to: '/' }]
  }
]);

const showChestModal = ref(false);
const openingChest = ref(false);
const chestReward = ref(null);
const reelItems = ref([]);

// Scroll lock when modal is active
watch([selectedStat, showChestModal], ([newStat, newChest]) => {
  if (newStat || newChest) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

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
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Clash Royale Card Theme */
.clash-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.clash-card:hover { transform: translateY(-8px) scale(1.02); }
.clash-card:active { transform: scale(0.95); }

.clash-card-inner {
  background: white;
  border-radius: 1.25rem;
  overflow: hidden;
  border: 4px solid #4a4a4a;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  position: relative;
}

/* Rarity Variations */
.rarity-common .clash-card-inner { border-color: #8fa1b3; background: #dfe6ed; }
.rarity-rare .clash-card-inner { border-color: #f7b23b; background: #fff4e0; }
.rarity-epic .clash-card-inner { border-color: #a34df4; background: #f5edff; }
.rarity-legendary .clash-card-inner { 
  border-color: #ff9d00; 
  background: #fff9ed;
  box-shadow: 0 0 30px rgba(255,157,0,0.3), 0 10px 40px rgba(0,0,0,0.5);
  animation: card-glow 3s infinite;
}

.clash-card.equipped .clash-card-inner {
  border-color: #ff4500 !important;
  box-shadow: 0 0 40px rgba(255,69,0,0.4);
}

@keyframes card-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255,157,0,0.2), 0 10px 40px rgba(0,0,0,0.5); }
  50% { box-shadow: 0 0 40px rgba(255,157,0,0.5), 0 10px 50px rgba(0,0,0,0.6); }
}

/* Dark Mode Overrides for inner content */
:deep(.clash-card h4) { color: #1a1a1a; }
:deep(.clash-card p) { color: #4a4a4a; }
</style>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-in relative z-10 pb-32">
    <!-- Premium Armory Header -->
    <div class="relative py-8">
      <div class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <h1 class="text-[120px] font-black tracking-tighter uppercase italic select-none">ARMORY</h1>
      </div>
      <div class="text-center space-y-4 relative z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
          <span class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
          <span class="text-[8px] font-black text-primary-500 tracking-[0.3em] uppercase">{{ i18n.t('inv_title') }}</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic leading-none">
          {{ i18n.t('inv_loadout_title') }}<span class="text-primary-500">_</span>
        </h1>
        <p class="text-[10px] font-bold text-muted uppercase tracking-[0.5em] font-tight max-w-md mx-auto">{{ i18n.t('inv_subtitle') }}</p>
      </div>
    </div>

    <!-- Interface Navigation -->
    <div class="flex items-center justify-center p-1.5 bg-surface/20 backdrop-blur-2xl border border-white/5 rounded-2xl max-w-sm mx-auto shadow-2xl relative">
      <div class="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent rounded-2xl pointer-events-none"></div>
      <div 
        class="flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative z-10 bg-primary-500 text-white shadow-lg shadow-primary-500/20">
        <Package class="w-3.5 h-3.5" /> 
        {{ i18n.t('inv_tab_gear') }}
        <span v-if="hasNewInventoryOverall" 
              class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-surface animate-pulse"></span>
      </div>
    </div>


    <!-- TAB: TACTICAL GEAR (Armory Grid) -->
    <div v-if="activeTab === 'gear'" class="space-y-16 animate-in">
      <!-- Section: Modules (Chests) -->
      <div v-if="authStore.user?.level_chests > 0 || authStore.user?.boss_chests > 0" 
           class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div v-if="authStore.user?.level_chests > 0" @click="handleOpenLevelChest" :disabled="openingChest"
          class="tactical-chest-button p-1 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 group cursor-pointer hover:bg-cyan-500/20 transition-all overflow-hidden relative">
          <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none"></div>
          <div class="flex items-center justify-between p-6 relative z-10">
            <div class="flex items-center gap-6">
              <div class="p-4 bg-cyan-500/20 rounded-2xl border border-cyan-500/30 group-hover:scale-110 transition-transform">
                <TrendingUp class="w-8 h-8 text-cyan-500" />
              </div>
              <div class="text-left">
                <p class="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] font-mono leading-none mb-1">EVOLUTION_MODULE</p>
                <h4 class="text-2xl font-black text-foreground italic">{{ authStore.user.level_chests }} Ready</h4>
              </div>
            </div>
            <ChevronRight class="w-6 h-6 text-cyan-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div v-if="authStore.user?.boss_chests > 0" @click="handleOpenChest" :disabled="openingChest"
          class="tactical-chest-button p-1 rounded-3xl bg-primary-500/10 border border-primary-500/20 group cursor-pointer hover:bg-primary-500/20 transition-all overflow-hidden relative">
          <div class="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent pointer-events-none"></div>
          <div class="flex items-center justify-between p-6 relative z-10">
            <div class="flex items-center gap-6">
              <div class="p-4 bg-primary-500/20 rounded-2xl border border-primary-500/30 group-hover:scale-110 transition-transform">
                <Archive class="w-8 h-8 text-primary-500" />
              </div>
              <div class="text-left">
                <p class="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] font-mono leading-none mb-1">DECRYPTED_VAULT</p>
                <h4 class="text-2xl font-black text-foreground italic">{{ authStore.user.boss_chests }} Ready</h4>
              </div>
            </div>
            <Sparkles class="w-6 h-6 text-primary-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <!-- ACTIVE EFFECTS (Potions/Buffs) -->
      <div v-if="activePotion" class="space-y-6">
        <div class="flex items-center gap-4">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-500/20"></div>
          <h3 class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] font-mono">ACTIVE_NEURAL_BUFFS</h3>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/20"></div>
        </div>

        <div class="max-w-md mx-auto p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between group hover:bg-emerald-500/10 transition-all relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
          <div class="flex items-center gap-4 relative z-10">
            <div class="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <FlaskConical class="w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
            <div>
              <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">DAMAGE_MULTIPLIER</p>
              <h4 class="text-xl font-black text-white italic">x{{ activePotion.multiplier }} Boost Active</h4>
            </div>
          </div>
          <div class="text-right relative z-10">
            <p class="text-[8px] font-black text-muted uppercase tracking-widest mb-1">TIME_REMAINING</p>
            <span class="text-lg font-black text-white font-mono tracking-tighter">{{ activePotion.timeLeft }}</span>
          </div>
        </div>
      </div>

      <!-- LOADOUT CONSOLE (Active Equipment) -->
      <div class="space-y-8">
        <div class="flex items-center gap-4">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
          <h3 class="text-[10px] font-black text-muted uppercase tracking-[0.5em] font-mono">{{ i18n.t('inv_loadout_title') }}</h3>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          <div v-for="slot in gearSlots" :key="slot.type" 
               class="relative group rounded-2xl bg-surface/10 border border-white/5 p-4 flex flex-col items-center justify-center gap-3 min-h-[140px] transition-all hover:bg-white/5 overflow-hidden">
            <div class="absolute inset-x-0 h-px bg-primary-500/20 top-0 group-hover:top-full transition-all duration-[2s] ease-linear pointer-events-none z-10"></div>
            <div class="absolute top-2 left-2 text-[6px] font-mono text-muted/50 uppercase tracking-widest">{{ slot.label }}</div>
            
            <!-- Slot Content -->
            <div v-if="getEquippedItem(slot.type)" class="flex flex-col items-center gap-2 relative z-20">
               <div class="w-16 h-16 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <component :is="slot.icon" class="w-8 h-8 text-primary-500" />
               </div>
               <span class="text-[8px] font-black text-foreground uppercase truncate w-24 text-center tracking-tighter">{{ getEquippedItem(slot.type).name }}</span>
            </div>

            <!-- Empty Slot State -->
            <div v-else class="flex flex-col items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
              <component :is="slot.icon" class="w-8 h-8 text-muted" />
              <span class="text-[8px] font-black text-muted uppercase tracking-[0.2em]">{{ i18n.t('inv_empty_slot') || 'EMPTY_SLOT' }}</span>
            </div>
            <div v-if="getEquippedItem(slot.type)" 
                 class="absolute inset-0 rounded-2xl border border-primary-500/20 shadow-[0_0_20px_rgba(255,69,0,0.1)] pointer-events-none group-hover:border-primary-500/40 transition-colors"></div>
          </div>
        </div>

        <div class="flex items-center gap-4 pt-8">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
          <h3 class="text-[10px] font-black text-muted uppercase tracking-[0.5em] font-mono">{{ i18n.t('inv_aesthetic_title') || 'AESTHETIC_MODULES' }}</h3>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
          <div v-for="slot in loadoutSlots" :key="slot.type" 
               class="relative group rounded-2xl bg-surface/10 border border-white/5 p-4 flex flex-col items-center justify-center gap-3 min-h-[140px] transition-all hover:bg-white/5 overflow-hidden">
            
            <!-- Scanning Line -->
            <div class="absolute inset-x-0 h-px bg-primary-500/20 top-0 group-hover:top-full transition-all duration-[2s] ease-linear pointer-events-none z-10"></div>
            
            <div class="absolute top-2 left-2 text-[6px] font-mono text-muted/50 uppercase tracking-widest">{{ slot.label }}</div>
            
            <!-- Slot Content -->
            <div v-if="getEquippedItem(slot.type)" class="flex flex-col items-center gap-2 relative z-20">
              <div class="scale-90 origin-center transition-transform group-hover:scale-105 duration-500">
                <AvatarFrame v-if="slot.type === 'border'" :src="authStore.user?.avatar_url" :border-css="getEquippedItem(slot.type).css_value" :size="55" />
                <div v-else-if="slot.type === 'title'" class="text-center px-1">
                  <h4 class="text-[11px] font-black uppercase italic leading-tight" :class="getEquippedItem(slot.type).css_value">{{ getEquippedItem(slot.type).name }}</h4>
                </div>
                <div v-else-if="slot.type === 'background'" class="w-14 h-14 rounded-xl overflow-hidden border border-white/10 relative shadow-2xl">
                   <BackgroundEffect :background-css="getEquippedItem(slot.type).css_value" is-preview class="!absolute !inset-0" />
                </div>
                <div v-else-if="slot.type === 'post_background'" class="w-14 h-14 rounded-xl overflow-hidden border border-white/10 relative shadow-2xl">
                   <div :class="getEquippedItem(slot.type).css_value" class="absolute inset-0"></div>
                </div>
                <div v-else-if="slot.type === 'avatar'" class="w-14 h-14 rounded-xl overflow-hidden border border-white/10 relative shadow-2xl">
                   <div :class="getEquippedItem(slot.type).css_value" class="absolute inset-0 shadow-inner"></div>
                </div>
              </div>
              <span class="text-[8px] font-black text-foreground uppercase truncate w-24 text-center tracking-tighter">{{ getEquippedItem(slot.type).name }}</span>
            </div>

            <!-- Empty Slot State -->
            <div v-else class="flex flex-col items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
              <component :is="slot.icon" class="w-8 h-8 text-muted" />
              <span class="text-[8px] font-black text-muted uppercase tracking-[0.2em]">OFFLINE</span>
            </div>

            <!-- Glow based on rarity -->
            <div v-if="getEquippedItem(slot.type)" 
                 class="absolute inset-0 rounded-2xl border border-primary-500/20 shadow-[0_0_20px_rgba(255,69,0,0.1)] pointer-events-none group-hover:border-primary-500/40 transition-colors"></div>
          </div>
        </div>
      </div>

      <!-- Main Stash Layout -->
      <div class="space-y-12">
        <div v-if="loading" class="py-32 flex flex-col items-center justify-center gap-6">
           <div class="relative">
             <div class="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
             <div class="absolute inset-0 flex items-center justify-center">
               <span class="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
             </div>
           </div>
           <p class="text-[10px] font-black text-muted uppercase tracking-[0.6em] font-mono">SYNCHRONIZING_MAIN_STASH...</p>
        </div>

        <div v-else-if="inventory.length === 0" class="py-32 text-center max-w-xl mx-auto space-y-6">
          <div class="p-8 bg-surface/20 border-2 border-dashed border-white/5 rounded-[3rem] inline-block mb-4">
             <Package class="w-20 h-20 mx-auto text-muted/30" />
          </div>
          <div class="space-y-2">
            <h3 class="text-3xl font-black uppercase italic tracking-tighter">{{ i18n.t('inv_empty_title') }}</h3>
            <p class="text-[10px] font-bold text-muted uppercase tracking-[0.4em]">{{ i18n.t('inv_empty_desc') }}</p>
          </div>
        </div>

        <!-- Nexus Item Stash -->
        <div v-else class="space-y-12">
          <!-- Stash Filter Tabs -->
          <div class="flex items-center justify-start gap-2 p-1 bg-surface/10 backdrop-blur-xl border border-white/5 rounded-2xl overflow-x-auto scrollbar-hide">
            <button v-for="tab in [
              { id: 'all', label: i18n.t('inv_tab_all') || 'ALL_GEAR' },
              { id: 'gear', label: i18n.t('inv_tab_gear') || 'COMBAT_EQUIP' },
              { id: 'cores', label: i18n.t('inv_tab_cores') || 'NEURAL_FRAMES' },
              { id: 'titles', label: i18n.t('inv_tab_titles') || 'COMBAT_TITLES' },
              { id: 'hud', label: i18n.t('inv_tab_hud') || 'HUD_LAYOUTS' },
              { id: 'themes', label: i18n.t('inv_tab_themes') || 'FEED_THEMES' },
              { id: 'consumables', label: i18n.t('inv_tab_consumables') || 'CONSUMABLES' }
            ]" :key="tab.id"
              @click="activeStashTab = tab.id"
              class="px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap"
              :class="activeStashTab === tab.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-muted/60 hover:text-foreground hover:bg-white/5'">
              {{ tab.label }}
            </button>
          </div>

          <div v-for="(items, type) in groupedItems" :key="type" class="space-y-6">
            <!-- Category Header -->
            <div class="flex items-center gap-6 px-4">
              <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-primary-500"></div>
                <h2 class="text-xs font-black text-foreground uppercase tracking-[0.4em] font-mono">
                  {{ 
                    type === 'head' ? 'HELMET_MODULE' :
                    type === 'weapon' ? 'WEAPON_MODULE' :
                    type === 'armor' ? 'ARMOR_MODULE' :
                    type === 'boots' ? 'BOOTS_MODULE' :
                    type === 'title' ? i18n.t('inv_cat_titles') : 
                    type === 'border' ? i18n.t('inv_cat_borders') : 
                    type === 'background' ? i18n.t('inv_cat_backgrounds') : 
                    type === 'post_background' ? i18n.t('inv_cat_post_backgrounds') : 
                    type === 'avatar' ? i18n.t('inv_cat_avatar_effects') : 
                    i18n.t('inv_cat_consumables') 
                  }}
                </h2>
                <span class="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-mono text-muted tabular-nums">{{ items.length }}</span>
              </div>
              <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>

            <!-- Stash Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div v-for="item in items" :key="item.id" 
                @click="toggleEquip(item)"
                @mouseenter="markSeen(item)"
                class="nexus-slot group relative" 
                :class="[isEquipped(item) ? 'equipped' : '', getRarityClass(item.rarity)]">
                
                <div class="nexus-slot-inner">
                   <!-- New Item Indicator -->
                   <div v-if="item.is_new" class="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full bg-primary-500 text-[6px] font-black text-white uppercase tracking-widest animate-pulse border border-white/20">NEW_ENTRY</div>
                   
                   <!-- Slot Asset Display -->
                   <div class="h-28 flex items-center justify-center p-4 relative overflow-hidden bg-black/40">
                      <!-- Active Scan Effect -->
                      <div class="absolute inset-x-0 h-px bg-primary-500/20 top-0 group-hover:top-full transition-all duration-[1.5s] ease-linear pointer-events-none z-10"></div>
                      
                      <div v-if="type === 'border'" class="scale-90 group-hover:scale-100 transition-transform duration-500">
                        <AvatarFrame :src="authStore.user?.avatar_url" :border-css="item.css_value" :size="60" />
                      </div>
                      <div v-else-if="type === 'title'" class="text-center group-hover:scale-110 transition-transform px-2">
                        <h4 class="text-[10px] font-black uppercase italic leading-tight" :class="item.css_value">{{ item.name }}</h4>
                      </div>
                      <div v-else-if="type === 'background'" class="w-full h-full scale-110">
                         <BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0" />
                      </div>
                      <div v-else-if="type === 'post_background'" class="w-full h-full relative p-2 group-hover:scale-110 transition-transform duration-500">
                         <div :class="item.css_value" class="absolute inset-0"></div>
                         <div class="absolute inset-0 flex items-center justify-center opacity-40">
                            <div class="w-4/5 h-2/3 bg-surface/40 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg"></div>
                         </div>
                      </div>
                      <div v-else-if="type === 'avatar'" class="relative group-hover:scale-110 transition-transform duration-500">
                         <div class="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/5 relative">
                            <img :src="authStore.user?.avatar_url" class="w-full h-full object-cover blur-[2px] opacity-40" />
                            <div :class="item.css_value" class="absolute inset-0"></div>
                         </div>
                      </div>
                      <div v-else-if="type === 'consumable'" class="flex flex-col items-center gap-2">
                         <div class="relative group-hover:scale-110 transition-transform">
                            <Flame class="w-10 h-10 text-primary-500 animate-pulse" />
                            <div class="absolute -top-1 -right-1 bg-foreground text-background text-[9px] font-black px-1.5 py-0.5 rounded border border-surface shadow-xl">
                                x{{ item.quantity }}
                            </div>
                         </div>
                      </div>
                      <div v-else class="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform">
                         <div class="p-4 rounded-full bg-primary-500/10 border border-primary-500/20">
                            <component :is="getSlotIcon(type)" class="w-10 h-10 text-primary-500" />
                         </div>
                      </div>
                   </div>

                    <!-- Info Badge -->
                    <div class="p-3 bg-surface/60 border-t border-white/5 relative overflow-hidden">
                       <div class="flex items-center justify-between mb-1">
                          <span class="text-[7px] font-black uppercase tracking-widest opacity-40">{{ type }}</span>
                          <span class="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border" :class="getRarityClass(item.rarity)">{{ getRarityLabel(item.rarity) }}</span>
                       </div>
                       <div v-if="isEquipped(item)" class="absolute inset-0 bg-primary-500/10 flex items-center justify-center backdrop-blur-[1px]">
                          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-500 text-[7px] font-black text-white uppercase tracking-widest italic shadow-xl shadow-primary-500/20">
                            <Check class="w-2.5 h-2.5" /> LINKED
                          </div>
                       </div>
                       
                       <div v-if="type === 'consumable'" class="space-y-2">
                          <button @click.stop="handleActivate(item)" 
                             class="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white text-[7px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg active:scale-95">
                             ACTIVATE_MODULE
                          </button>
                       </div>
                       <div v-else-if="['head', 'weapon', 'armor', 'boots'].includes(type) && !isEquipped(item)" class="flex flex-col gap-1.5">
                          <button @click.stop="startComparison(item)" 
                             class="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[7px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2">
                             <Swords class="w-2.5 h-2.5" /> COMPARE
                          </button>
                          <h4 class="text-[8px] font-black text-foreground truncate uppercase italic tracking-wider leading-none group-hover:text-primary-500 transition-colors">{{ item.name }}</h4>
                       </div>
                       <div v-else class="text-center">
                         <h4 class="text-[8px] font-black text-foreground truncate uppercase italic tracking-wider leading-none mb-1 group-hover:text-primary-500 transition-colors">{{ item.name }}</h4>
                         <div class="text-[6px] font-mono text-muted uppercase tracking-[0.2em]">{{ item.rarity || 'common' }}</div>
                       </div>
                    </div>
                </div>
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

    <!-- Comparison Modal -->
    <CompareModal
      v-if="comparisonState.show"
      :show="comparisonState.show"
      :new-item="comparisonState.newItem"
      :current-item="comparisonState.currentItem"
      @close="comparisonState.show = false"
      @equip="handleEquipFromCompare"
    />
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { 
  Package, Frame, Type, Check, Sparkles, Archive, Zap, TrendingUp, 
  Dumbbell, Sword, Heart, Brain, Church, Trophy, ExternalLink, Activity, X, 
  ChevronDown, Flame, BookOpen, Swords, Info, ChevronRight, Users, Shield, Footprints,
  FlaskConical
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useI18nStore } from '../stores/i18n';
import { useNotificationStore } from '../stores/notification';
import AvatarFrame from './AvatarFrame.vue';
import BackgroundEffect from './BackgroundEffect.vue';
import ChestOpening from './ChestOpening.vue';
import CompareModal from './CompareModal.vue';
import axios from 'axios';
import { useAudio } from '../composables/useAudio';

const { playZip, playEquipBlip, playClickBlip } = useAudio();
const authStore = useAuthStore();
const i18n = useI18nStore();
const emit = defineEmits(['start', 'viewProfile']);
const notificationStore = useNotificationStore();
const inventory = ref([]);
const loading = ref(true);
const currentTime = ref(new Date());
let timerInterval = null;

const activePotion = computed(() => {
  const user = authStore.user;
  if (!user || !user.damage_multiplier || !user.damage_multiplier_expiry) return null;
  
  const expiry = new Date(user.damage_multiplier_expiry);
  const now = currentTime.value;
  
  if (expiry <= now) return null;
  
  const diff = expiry - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return {
    multiplier: parseFloat(user.damage_multiplier).toFixed(1),
    timeLeft: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  };
});

const activeTab = ref('gear'); // Default to gear for the redesign
const activeStashTab = ref('all');
const selectedStat = ref(null);
const openCategories = ref({}); // tracks open/closed state per category type

const comparisonState = ref({
  show: false,
  newItem: null,
  currentItem: null
});

const startComparison = (item) => {
  comparisonState.value = {
    show: true,
    newItem: item,
    currentItem: getEquippedItem(item.type)
  };
};

const handleEquipFromCompare = async (item) => {
  comparisonState.value.show = false;
  await toggleEquip(item);
};

const toggleCategory = (type) => {
  // default is open (undefined = truthy), so first click closes
  const isOpening = openCategories.value[type] === false;
  openCategories.value[type] = isOpening ? true : false;
  
  if (isOpening) {
    markCategorySeen(type);
  }
};

const gearSlots = computed(() => [
  { type: 'head', label: i18n.t('inv_slot_helmet') || 'HELMET', icon: Zap }, // Using Zap as placeholder for Helmet
  { type: 'weapon', label: 'WEAPON', icon: Sword },
  { type: 'armor', label: 'ARMOR', icon: Shield },
  { type: 'boots', label: 'BOOTS', icon: Footprints } // Need to import these icons
]);

const loadoutSlots = computed(() => [
  { type: 'title', label: i18n.t('shop_tab_titles'), icon: Type },
  { type: 'border', label: i18n.t('shop_tab_borders'), icon: Frame },
  { type: 'avatar', label: i18n.t('shop_tab_avatars'), icon: Users },
  { type: 'post_background', label: i18n.t('shop_tab_post_backgrounds'), icon: Activity },
  { type: 'background', label: i18n.t('shop_tab_backgrounds'), icon: Sparkles }
]);

const getSlotIcon = (type) => {
  const allSlots = [...gearSlots.value, ...loadoutSlots.value];
  return allSlots.find(s => s.type === type)?.icon || Package;
};

const getEquippedItem = (type) => {
  const equippedIdMap = {
    head: authStore.user?.equipped_head_id,
    weapon: authStore.user?.equipped_weapon_id,
    armor: authStore.user?.equipped_armor_id,
    boots: authStore.user?.equipped_boots_id,
    title: authStore.user?.equipped_title_id,
    border: authStore.user?.equipped_border_id,
    background: authStore.user?.equipped_background_id,
    post_background: authStore.user?.equipped_post_background_id,
    avatar: authStore.user?.equipped_avatar_id
  };
  const id = equippedIdMap[type];
  if (!id) return null;
  return inventory.value.find(item => item.id === id);
};

const rpgStats = computed(() => [
  {
    key: 'str',
    name: i18n.t('codex_str_name'),
    quote: i18n.t('codex_str_quote'),
    description: i18n.t('codex_str_desc'),
    action: i18n.t('codex_str_action'),
    xpKey: 'str_xp',
    lvlKey: 'str_lvl',
    xpIntoKey: 'str_xp_into_level',
    xpForKey: 'str_xp_for_next_level',
    icon: Dumbbell,
    color: 'text-orange-500',
    borderColor: 'border-orange-500',
    bgLight: 'bg-orange-500/10',
    gradient: 'from-orange-500 to-red-600',
    effectLabel: i18n.t('battle_overhaul_str_desc'),
    links: [{ label: i18n.locale === 'es' ? 'ENTRENAR FUERZA' : 'TRAIN STRENGTH', to: '/?exercise=weighted_pullups', icon: Zap }]
  },
  {
    key: 'dex',
    name: i18n.t('codex_dex_name'),
    quote: i18n.t('codex_dex_quote'),
    description: i18n.t('codex_dex_desc'),
    action: i18n.t('codex_dex_action'),
    xpKey: 'dex_xp',
    lvlKey: 'dex_lvl',
    xpIntoKey: 'dex_xp_into_level',
    xpForKey: 'dex_xp_for_next_level',
    icon: Sword,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400',
    bgLight: 'bg-cyan-400/10',
    gradient: 'from-cyan-400 to-blue-500',
    effectLabel: i18n.t('battle_overhaul_dex_desc'),
    links: [{ label: i18n.locale === 'es' ? 'MEJORAR TÉCNICA' : 'IMPROVE TECHNIQUE', to: '/?exercise=muscleups', icon: Swords }]
  },
  {
    key: 'end',
    name: i18n.t('codex_end_name'),
    quote: i18n.t('codex_end_quote'),
    description: i18n.t('codex_end_desc'),
    action: i18n.t('codex_end_action'),
    xpKey: 'end_xp',
    lvlKey: 'end_lvl',
    xpIntoKey: 'end_xp_into_level',
    xpForKey: 'end_xp_for_next_level',
    icon: Activity,
    color: 'text-green-400',
    borderColor: 'border-green-400',
    bgLight: 'bg-green-400/10',
    gradient: 'from-green-400 to-emerald-600',
    effectLabel: i18n.t('battle_overhaul_end_desc'),
    links: [{ label: i18n.locale === 'es' ? 'AUMENTAR VOLUMEN' : 'BOOST VOLUME', to: '/?exercise=pushups', icon: TrendingUp }]
  },
  {
    key: 'vig',
    name: i18n.t('codex_vig_name'),
    quote: i18n.t('codex_vig_quote'),
    description: i18n.t('codex_vig_desc'),
    action: i18n.t('codex_vig_action'),
    xpKey: 'vig_xp',
    lvlKey: 'vig_lvl',
    xpIntoKey: 'vig_xp_into_level',
    xpForKey: 'vig_xp_for_next_level',
    icon: Heart,
    color: 'text-red-500',
    borderColor: 'border-red-500',
    bgLight: 'bg-red-500/10',
    gradient: 'from-red-500 to-pink-600',
    effectLabel: i18n.t('battle_overhaul_vig_desc'),
    links: [{ label: i18n.locale === 'es' ? 'MANTENER RACHA' : 'KEEP STREAK', to: '/', icon: Flame }]
  },
  {
    key: 'int',
    name: i18n.t('codex_int_name'),
    quote: i18n.t('codex_int_quote'),
    description: i18n.t('codex_int_desc'),
    action: i18n.t('codex_int_action'),
    xpKey: 'int_xp',
    lvlKey: 'int_lvl',
    xpIntoKey: 'int_xp_into_level',
    xpForKey: 'int_xp_for_next_level',
    icon: Brain,
    color: 'text-blue-400',
    borderColor: 'border-blue-400',
    bgLight: 'bg-blue-400/10',
    gradient: 'from-blue-400 to-indigo-600',
    effectLabel: i18n.t('battle_overhaul_int_desc'),
    links: [{ label: i18n.locale === 'es' ? 'GANAR CONOCIMIENTO' : 'ACQUIRE KNOWLEDGE', to: '/blog', icon: BookOpen }]
  },
  {
    key: 'fth',
    name: i18n.t('codex_fth_name'),
    quote: i18n.t('codex_fth_quote'),
    description: i18n.t('codex_fth_desc'),
    action: i18n.t('codex_fth_action'),
    xpKey: 'fth_xp',
    lvlKey: 'fth_lvl',
    xpIntoKey: 'fth_xp_into_level',
    xpForKey: 'fth_xp_for_next_level',
    icon: Church,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400',
    bgLight: 'bg-yellow-400/10',
    gradient: 'from-yellow-400 to-orange-500',
    effectLabel: i18n.t('battle_overhaul_fth_desc'),
    links: [{ label: i18n.locale === 'es' ? 'UNIRSE AL RAID' : 'JOIN RAID', to: '/', icon: Sparkles }]
  },
  {
    key: 'cha',
    name: i18n.t('codex_cha_name'),
    quote: i18n.t('codex_cha_quote'),
    description: i18n.t('codex_cha_desc'),
    action: i18n.t('codex_cha_action'),
    xpKey: 'cha_xp',
    lvlKey: 'cha_lvl',
    xpIntoKey: 'cha_xp_into_level',
    xpForKey: 'cha_xp_for_next_level',
    icon: Sparkles,
    color: 'text-pink-400',
    borderColor: 'border-pink-400',
    bgLight: 'bg-pink-400/10',
    gradient: 'from-pink-400 to-fuchsia-600',
    effectLabel: i18n.t('battle_overhaul_cha_desc'),
    links: [{ label: i18n.locale === 'es' ? 'CONECTAR' : 'CONNECT', to: '/social', icon: Users }]
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
  
  // Filtering logic based on activeStashTab
  let filtered = inventory.value;
  if (activeStashTab.value !== 'all') {
    if (activeStashTab.value === 'gear') {
      filtered = inventory.value.filter(i => ['head', 'weapon', 'armor', 'boots'].includes(i.type));
    } else if (activeStashTab.value === 'cores') {
      filtered = inventory.value.filter(i => i.type === 'border');
    } else if (activeStashTab.value === 'titles') {
      filtered = inventory.value.filter(i => i.type === 'title');
    } else if (activeStashTab.value === 'hud') {
      filtered = inventory.value.filter(i => i.type === 'avatar');
    } else if (activeStashTab.value === 'themes') {
      filtered = inventory.value.filter(i => i.type === 'background' || i.type === 'post_background');
    } else if (activeStashTab.value === 'consumables') {
      filtered = inventory.value.filter(i => i.type === 'consumable');
    }
  }

  filtered.forEach(item => {
    if (!groups[item.type]) groups[item.type] = [];
    groups[item.type].push(item);
  });
  return groups;
});

const isEquipped = (item) => {
  if (item.type === 'head') return authStore.user?.equipped_head_id === item.id;
  if (item.type === 'weapon') return authStore.user?.equipped_weapon_id === item.id;
  if (item.type === 'armor') return authStore.user?.equipped_armor_id === item.id;
  if (item.type === 'boots') return authStore.user?.equipped_boots_id === item.id;
  if (item.type === 'title') return authStore.user?.equipped_title_id === item.id;
  if (item.type === 'border') return authStore.user?.equipped_border_id === item.id;
  if (item.type === 'background') return authStore.user?.equipped_background_id === item.id;
  if (item.type === 'post_background') return authStore.user?.equipped_post_background_id === item.id;
  if (item.type === 'avatar') return authStore.user?.equipped_avatar_id === item.id;
  return false;
};

const toggleEquip = async (item) => {
  const alreadyEquipped = isEquipped(item);
  const targetId = alreadyEquipped ? 0 : item.id;
  playEquipBlip();
  try {
    await axios.post(`/api/shop/equip/${targetId}?type=${item.type}`);
    if (item.type === 'head') authStore.user.equipped_head_id = alreadyEquipped ? null : item.id;
    else if (item.type === 'weapon') authStore.user.equipped_weapon_id = alreadyEquipped ? null : item.id;
    else if (item.type === 'armor') authStore.user.equipped_armor_id = alreadyEquipped ? null : item.id;
    else if (item.type === 'boots') authStore.user.equipped_boots_id = alreadyEquipped ? null : item.id;
    else if (item.type === 'title') { authStore.user.equipped_title_id = alreadyEquipped ? null : item.id; authStore.user.title_css = alreadyEquipped ? '' : item.css_value; authStore.user.title_name = alreadyEquipped ? '' : item.name; }
    else if (item.type === 'border') { authStore.user.equipped_border_id = alreadyEquipped ? null : item.id; authStore.user.border_css = alreadyEquipped ? '' : item.css_value; }
    else if (item.type === 'background') { authStore.user.equipped_background_id = alreadyEquipped ? null : item.id; authStore.user.background_css = alreadyEquipped ? '' : item.css_value; }
    else if (item.type === 'post_background') { authStore.user.equipped_post_background_id = alreadyEquipped ? null : item.id; authStore.user.post_background_css = alreadyEquipped ? '' : item.css_value; }
    else if (item.type === 'avatar') { authStore.user.equipped_avatar_id = alreadyEquipped ? null : item.id; authStore.user.avatar_css = alreadyEquipped ? '' : item.css_value; }
    notificationStore.notify(alreadyEquipped ? 'Deactivated' : 'Activated', 'success');
  } catch (err) { notificationStore.notify('Activation error', 'error'); }
};

const handleActivate = async (item) => {
  try {
    const res = await axios.post(`/api/shop/activate/${item.id}`);
    notificationStore.notify(res.data.message, 'success');
    await fetchInventory();
    await authStore.fetchProfile();
  } catch (err) {
    notificationStore.notify(err.response?.data?.message || 'Error al activar', 'error');
  }
};

const markCategorySeen = async (type) => {
  const newItems = groupedItems.value[type]?.filter(i => i.is_new) || [];
  if (newItems.length === 0) return;
  
  try {
    // Mark all as seen sequentially to be safe, though parallel is faster
    await Promise.all(newItems.map(item => markSeen(item)));
    // After marking all as seen, refresh the main profile flag
    await authStore.fetchProfile();
  } catch (e) {
    console.error('Error marking category as seen:', e);
  }
};

const getRarityClass = (rarity) => {
  const r = rarity?.toLowerCase() || 'common';
  let finalR = r;
  if (r === 'epic') finalR = 'especial';
  
  let classes = `rarity-${finalR}`;
  if (finalR === 'legendary') classes += ' glow-legendary';
  if (finalR === 'calistenico') classes += ' glow-calistenico';
  return classes;
};

const getRarityLabel = (rarity) => {
  const r = rarity?.toLowerCase() || 'common';
  switch (r) {
    case 'common': return 'COMÚN';
    case 'rare': return 'RARO';
    case 'epic':
    case 'especial': return 'ESPECIAL';
    case 'legendary': return 'LEGENDARIO';
    case 'calistenico': return 'CALISTÉNICO';
    default: return 'COMÚN';
  }
};

const markSeen = async (item) => {
  if (!item.is_new) return;
  try { 
    await axios.post(`/api/shop/mark-seen/${item.id}`); 
    item.is_new = false; 
    // Silently refresh profile to update navbar dot
    authStore.fetchProfile();
  } 
  catch (e) { console.error('Signalling error:', e); }
};

const hasNewInventoryOverall = computed(() => {
  return (authStore.user?.boss_chests > 0 || authStore.user?.has_new_inventory);
});

onMounted(async () => {
  playZip();
  await Promise.all([fetchInventory(), authStore.fetchProfile()]);
  
  timerInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
.font-tight { font-family: 'Inter Tight', sans-serif; }
.animate-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }

@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Tactical Stat Cards */
.tactical-stat-card {
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
.tactical-stat-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.5);
}

/* Nexus Stash Slots */
.nexus-slot {
  aspect-ratio: 3/4;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

.nexus-slot:hover {
  transform: scale(1.05) translateY(-5px);
}

.nexus-slot-inner {
  height: 100%;
  background: rgba(15, 15, 15, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.03);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Rarity Effects */
.rarity-common { --item-glow: rgba(148, 163, 184, 0.3); }
.rarity-rare { --item-glow: rgba(96, 165, 250, 0.3); }
.rarity-especial { --item-glow: rgba(168, 85, 247, 0.3); }
.rarity-legendary { --item-glow: rgba(245, 158, 11, 0.4); }
.rarity-calistenico { --item-glow: rgba(204, 255, 0, 0.5); }

.nexus-slot.equipped .nexus-slot-inner {
  border-color: rgba(255, 69, 0, 0.4);
  box-shadow: 0 0 30px -5px rgba(255, 69, 0, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Rarity-specific styles */
.rarity-common .nexus-slot-inner { border-color: rgba(148, 163, 184, 0.1); }
.rarity-rare .nexus-slot-inner { border-color: rgba(96, 165, 250, 0.2); }
.rarity-especial .nexus-slot-inner { border-color: rgba(168, 85, 247, 0.2); }
.rarity-legendary .nexus-slot-inner { 
  border-color: rgba(245, 158, 11, 0.4);
  background: linear-gradient(to bottom, rgba(245, 158, 11, 0.05), rgba(15, 15, 15, 0.6));
}
.rarity-calistenico .nexus-slot-inner {
  border-color: rgba(204, 255, 0, 0.4);
  background: linear-gradient(to bottom, rgba(204, 255, 0, 0.1), rgba(15, 15, 15, 0.6));
}

.nexus-slot:hover .nexus-slot-inner {
  border-color: var(--item-glow);
  box-shadow: 0 0 40px -10px var(--item-glow), 0 8px 32px rgba(0, 0, 0, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.nexus-slot.equipped .nexus-slot-inner::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 69, 0, 0.3);
  border-radius: 1.5rem;
  pointer-events: none;
}

/* Animations */
@keyframes scan {
  from { top: -10%; }
  to { top: 110%; }
}
.animate-scan {
  animation: scan 4s linear infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 2s infinite linear;
}

/* Deep selects for items in slots */
:deep(.nexus-slot h4) {
  transition: color 0.3s ease;
}

/* Chest Buttons */
.tactical-chest-button {
  transition: all 0.3s ease;
}
.tactical-chest-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.6);
}
.tactical-chest-button:active {
  transform: scale(0.98);
}

/* Slide Down Transition for categories */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 2000px;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-20px);
}
</style>

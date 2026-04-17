<template>
  <div class="max-w-7xl mx-auto px-4 py-12 animate-in relative z-10">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
      <div>
        <h1 class="text-4xl font-black text-industrial tracking-tighter text-foreground">
          ARMORY<span class="text-primary-500">.</span>
        </h1>
        <p class="text-muted mt-2 font-bold uppercase tracking-widest text-[10px]">Equip your legend with elite protocol cosmetics.</p>
      </div>
      
      <!-- Currency Display (Precision Pill) -->
      <div class="flex items-center gap-4 bg-surface/40 px-6 py-4 rounded-2xl border border-border shadow-2xl backdrop-blur-xl group hover:border-primary-500/30 transition-all">
        <div class="p-2 bg-primary-500/10 rounded-lg transition-transform">
          <Coins class="w-5 h-5 text-primary-500" />
        </div>
        <div class="flex flex-col">
          <span class="text-3xl font-black text-precision text-foreground tracking-tighter leading-none">{{ authStore.user?.reppy_coins || 0 }}</span>
          <span class="text-[8px] uppercase tracking-[0.3em] text-primary-500/70 font-black mt-1">REPPY COINS</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-24">
      <div class="animate-spin w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent mx-auto"></div>
      <p class="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mt-6">SYNCING ARMORY...</p>
    </div> 
    
    <div v-else class="space-y-16">
      <!-- Categories Dropdown (Compact Industrial) -->
      <div class="flex justify-center relative z-20">
        <div class="relative w-full max-w-md">
          <button 
            @click="showDropdown = !showDropdown"
            class="flex items-center gap-3 px-6 py-3 bg-surface/40 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary-500/30 transition-all w-full justify-between"
          >
            <div class="flex items-center gap-2">
              <component :is="categories.find(c => c.id === selectedCategory).icon" class="w-3.5 h-3.5 text-primary-500" />
              <span class="text-foreground">{{ i18n.t(categories.find(c => c.id === selectedCategory).label) }}</span>
            </div>
            <ChevronDown class="w-4 h-4 text-muted transition-transform" :class="{ 'rotate-180': showDropdown }" />
          </button>

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-2"
          >
            <div v-if="showDropdown" class="absolute top-full left-0 mt-2 w-full bg-surface/90 backdrop-blur-3xl border border-border rounded-2xl shadow-2xl overflow-hidden py-2 z-50">
              <button 
                v-for="cat in categories" 
                :key="cat.id"
                @click="selectedCategory = cat.id; showDropdown = false"
                class="w-full flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all text-left"
                :class="selectedCategory === cat.id ? 'bg-primary-500 text-white' : 'text-muted hover:bg-white/5 hover:text-foreground'"
              >
                <component :is="cat.icon" class="w-3.5 h-3.5" />
                {{ i18n.t(cat.label) }}
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Main Collection -->
      <section>
        <div class="flex items-center gap-4 mb-10">
          <h2 class="text-xl font-black text-industrial text-foreground tracking-tight italic">PERMANENT PROTOCOL</h2>
          <div class="h-px flex-1 bg-gradient-to-r from-muted/20 to-transparent"></div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div 
            v-for="item in paginatedItems" 
            :key="item.id"
            class="card-stats p-0 flex flex-col group/item border-white/10"
            :class="getCardClass(item)"
          >
            <!-- Lock Overlay -->
            <div v-if="!item.is_unlocked" class="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-[5] pointer-events-none flex items-center justify-center">
               <div class="w-12 h-12 bg-surface/60 rounded-full flex items-center justify-center border border-border">
                  <span class="text-xl">🔒</span>
               </div>
            </div>

            <!-- Header Info -->
            <div class="p-4 pb-0 flex items-start justify-between z-10">
              <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-border text-muted bg-foreground/5">
                #{{ item.roadmap_position || '??' }}
              </span>
              <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border" :class="getRarityBadge(item).classes">
                {{ getRarityBadge(item).label }}
              </span>
            </div>

            <!-- Preview Area -->
            <div class="h-32 flex items-center justify-center m-4 mb-2 bg-surface rounded-2xl border border-border relative overflow-hidden group-hover/item:border-primary-500/20 transition-colors shadow-inner">
               <div v-if="item.type === 'bundle'" class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-purple-500/10 relative">
                  <div class="grid grid-cols-2 gap-1 p-2 scale-75">
                     <div class="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center"><Type class="w-5 h-5 text-primary-500/40" /></div>
                     <div class="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center"><Frame class="w-5 h-5 text-purple-400/40" /></div>
                     <div class="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center"><Sparkles class="w-5 h-5 text-blue-400/40" /></div>
                     <div class="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center"><LayoutGrid class="w-5 h-5 text-neon-lime/40" /></div>
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div class="p-3 bg-surface/80 backdrop-blur-md rounded-2xl border border-primary-500/30 shadow-2xl">
                        <Swords class="w-6 h-6 text-primary-500 animate-pulse" />
                     </div>
                  </div>
               </div>

               <div v-if="item.type === 'title'" class="text-lg text-center px-4 leading-tight font-black" :class="item.css_value">
                 {{ item.name }}
               </div>
               <div v-if="item.type === 'border'">
                 <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :border-css="item.css_value" :size="64" />
               </div>
               <div v-if="item.type === 'avatar'">
                 <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :avatar-css="item.css_value" :size="64" />
               </div>
               <div v-if="item.type === 'background'" class="w-full h-full relative group/bg overflow-hidden">
                  <BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0 !w-full !h-full transition-transform duration-700 group-hover/item:scale-110" />
                  <!-- Screen Overlay Effect -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
                  <div class="absolute inset-0 opacity-20 pointer-events-none h-[200%] animate-scanline" style="background: linear-gradient(to bottom, transparent 50%, rgba(34, 211, 238, 0.5) 50.5%, transparent 51%); background-size: 100% 4px;"></div>
                  <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-[6px] font-black text-muted uppercase tracking-widest z-10">SCRN.PRVW</div>
               </div>
               <div v-if="item.type === 'post_background'" class="w-full h-full relative group/post-bg overflow-hidden flex items-center justify-center">
                  <div class="w-[90%] h-[80%] bg-black border border-border rounded-lg relative overflow-hidden flex flex-col p-2 gap-2 shadow-2xl shop-preview">
                     <div class="w-full h-full absolute inset-0 z-0" :class="item.css_value"></div>
                     
                     <!-- Particle Injector for Previews -->
                     <div v-if="item.css_value === 'post-bg-matrix'" class="absolute inset-0 pointer-events-none z-0 opacity-60">
                       <div v-for="i in 8" :key="i" class="matrix-column" :style="{ left: (i-1)*12 + '%', animationDelay: (i*0.2) + 's' }"></div>
                     </div>
                     <div v-if="item.css_value === 'post-bg-inferno'" class="absolute inset-0 pointer-events-none z-0">
                       <div v-for="i in 12" :key="i" class="ember" :style="{ left: Math.random()*100 + '%', animationDelay: Math.random()*5 + 's' }"></div>
                     </div>
                     <div class="flex items-center gap-2">
                       <div class="w-4 h-4 rounded-full bg-primary-500/20"></div>
                       <div class="w-12 h-1 bg-muted/20 rounded"></div>
                     </div>
                     <div class="flex-1 space-y-1">
                       <div class="w-full h-2 bg-foreground/5 rounded"></div>
                       <div class="w-2/3 h-2 bg-foreground/5 rounded"></div>
                     </div>
                  </div>
                  <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-[6px] font-black text-muted uppercase tracking-widest z-10">POST.PRVW</div>
               </div>
            </div>

            <!-- Content -->
            <div class="p-4 pt-2 flex-1">
              <h3 class="text-sm font-black text-industrial text-foreground mb-1">{{ item.name }}</h3>
              <p class="text-[10px] text-muted font-medium line-clamp-2 mb-4 leading-relaxed">{{ item.description }}</p>
              
              <div v-if="!item.is_unlocked" class="px-2 py-1.5 bg-red-500/5 border border-red-500/10 rounded-lg">
                <p class="text-[7px] font-black uppercase tracking-widest text-red-500/70">DECRYPT AT: {{ getCountdown(item) }}</p>
              </div>
            </div>

            <!-- Action Footer -->
            <div class="p-4 pt-0 mt-auto border-t border-border bg-foreground/[0.01]">
              <div class="flex items-center justify-between mt-4">
                <div v-if="item.owned" class="flex items-center gap-1.5 text-neon-lime">
                  <Check class="w-3.5 h-3.5" />
                  <span class="text-[8px] font-black uppercase tracking-widest leading-none">ACQUIRED</span>
                </div>
                <div v-else-if="item.price > 0" class="flex flex-col">
                  <div v-if="item.original_price" class="flex items-center gap-2 mb-0.5">
                    <span class="text-[9px] font-black text-muted line-through tracking-tighter">{{ item.original_price }}</span>
                    <span class="text-[7px] font-black bg-primary-500/20 text-primary-500 px-1 rounded">40% OFF</span>
                  </div>
                  <div class="flex items-baseline gap-1">
                    <span class="text-base font-black text-precision" :class="canAfford(item) ? 'text-primary-500' : 'text-muted'">{{ item.price }}</span>
                    <span class="text-[7px] font-black text-muted uppercase tracking-widest">COINS</span>
                  </div>
                </div>
                <div v-else class="text-[8px] font-black uppercase tracking-widest text-primary-500/60 leading-none">EVENT</div>

                <!-- Action Button -->
                <button 
                  v-if="!item.owned && item.price > 0"
                  @click="buyItem(item)"
                  :disabled="!canAfford(item) || buying || !item.is_unlocked"
                  class="btn-reppy !px-4 !py-2 !text-[8px] disabled:opacity-20 disabled:grayscale disabled:scale-100"
                >
                  {{ item.is_unlocked ? 'GET' : 'LOCK' }}
                </button>
                
                <button 
                  v-if="item.owned && item.type !== 'bundle'"
                  @click="equipItem(item)"
                  :disabled="isEquipped(item)"
                  class="px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                  :class="isEquipped(item) ? 'bg-foreground/5 text-muted border border-border' : 'bg-neon-lime text-black shadow-lg shadow-neon-lime/20'"
                >
                  {{ isEquipped(item) ? 'ON' : 'EQUIP' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination Metadata & Controls -->
        <div v-if="totalPages > 1" class="flex flex-col items-center gap-6 mt-16 p-10 bg-surface/20 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/pagination">
          <!-- Background Detail -->
          <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-primary-500/5 blur-[100px] rounded-full pointer-events-none group-hover/pagination:bg-primary-500/10 transition-colors duration-1000"></div>

          <div class="flex items-center gap-4 relative z-10">
            <button 
              @click="currentPage > 1 && (currentPage--)"
              :disabled="currentPage === 1"
              :title="i18n.locale === 'es' ? 'Página Anterior' : 'Previous Page'"
              :aria-label="i18n.locale === 'es' ? 'Página Anterior' : 'Previous Page'"
              class="p-5 bg-surface/60 border border-border rounded-2xl hover:border-primary-500/30 disabled:opacity-20 transition-all group/prev shadow-xl active:scale-95"
            >
              <ChevronLeft class="w-5 h-5 group-hover/prev:-translate-x-1 transition-transform" />
            </button>
            
            <div class="flex items-center gap-2.5">
              <button 
                v-for="p in totalPages" 
                :key="p"
                @click="currentPage = p"
                :title="i18n.locale === 'es' ? `Ir a la página ${p}` : `Go to page ${p}`"
                class="w-12 h-12 flex items-center justify-center rounded-2xl text-[11px] font-black tracking-widest transition-all border-2"
                :class="currentPage === p ? 'bg-primary-500 text-white border-primary-500 shadow-[0_0_25px_rgba(255,69,0,0.3)]' : 'bg-surface/40 text-muted border-border hover:border-primary-500/40 hover:text-foreground active:scale-90'"
              >
                {{ String(p).padStart(2, '0') }}
              </button>
            </div>

            <button 
              @click="currentPage < totalPages && (currentPage++)"
              :disabled="currentPage === totalPages"
              :title="i18n.locale === 'es' ? 'Siguiente Página' : 'Next Page'"
              :aria-label="i18n.locale === 'es' ? 'Siguiente Página' : 'Next Page'"
              class="p-5 bg-surface/60 border border-border rounded-2xl hover:border-primary-500/30 disabled:opacity-20 transition-all group/next shadow-xl active:scale-95"
            >
              <ChevronRight class="w-5 h-5 group-hover/next:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div class="flex flex-col items-center gap-2 relative z-10">
            <p class="text-[10px] font-black text-industrial text-foreground/40 uppercase tracking-[0.5em] italic">
              UNIT_PAGE <span class="text-primary-500">{{ currentPage }}</span> // TOTAL_CHUNKS: {{ totalPages }}
            </p>
            <div class="flex gap-1">
              <div v-for="d in totalPages" :key="d" 
                   class="h-1 rounded-full transition-all duration-500"
                   :class="currentPage === d ? 'w-8 bg-primary-500' : 'w-2 bg-border'"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Seasonal Section (Collapsed) -->
      <section v-if="seasonalItems.length > 0" class="pt-8 border-t border-border">
        <button 
          @click="showSeasonal = !showSeasonal"
          class="w-full flex items-center justify-between p-8 bg-surface/40 rounded-3xl border border-border hover:border-primary-500/20 transition-all group"
        >
          <div class="flex items-center gap-6">
            <div class="p-4 bg-primary-500/10 rounded-2xl transition-transform">
              <Sparkles class="w-7 h-7 text-primary-500" />
            </div>
            <div class="text-left">
              <h2 class="text-2xl font-black text-industrial text-foreground tracking-tight uppercase">SEASONAL PROTOCOL</h2>
              <p class="text-[10px] text-muted font-bold tracking-widest uppercase">Special event rewards & milestone artifacts.</p>
            </div>
          </div>
          <ChevronDown 
            class="w-6 h-6 text-muted transition-transform duration-500"
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
          <div v-if="showSeasonal" class="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-12 animate-in text-left">
             <!-- Seasonal Items use same card template as regular items -->
             <div 
              v-for="item in seasonalItems" 
              :key="item.id"
              class="card-stats p-0 flex flex-col group/item border-border"
              :class="getCardClass(item)"
            >
              <div v-if="!item.is_unlocked" class="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-[5] pointer-events-none flex items-center justify-center">
                 <div class="w-12 h-12 bg-surface/60 rounded-full flex items-center justify-center border border-border"><span class="text-xl">🔒</span></div>
              </div>
              <div class="p-4 pb-0 flex items-start justify-between z-10">
                <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-primary-500/20 text-primary-500 bg-primary-500/5">SEASONAL</span>
                <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border" :class="getRarityBadge(item).classes">{{ getRarityBadge(item).label }}</span>
              </div>
              <div class="h-32 flex items-center justify-center m-4 mb-2 bg-surface rounded-2xl border border-border relative overflow-hidden group-hover/item:border-primary-500/20 transition-colors shadow-inner">
                 <div v-if="item.type === 'title'" class="text-lg text-center px-4 leading-tight font-black" :class="item.css_value">{{ item.name }}</div>
                 <div v-if="item.type === 'border'"><AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :border-css="item.css_value" :size="64" /></div>
                 <div v-if="item.type === 'avatar'"><AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :avatar-css="item.css_value" :size="64" /></div>
                 <div v-if="item.type === 'background'" class="w-full h-full relative group/bg overflow-hidden">
                    <BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0 !w-full !h-full transition-transform duration-700 group-hover/item:scale-110" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
                    <div class="absolute inset-0 opacity-20 pointer-events-none h-[200%] animate-scanline" style="background: linear-gradient(to bottom, transparent 50%, rgba(34, 211, 238, 0.5) 50.5%, transparent 51%); background-size: 100% 4px;"></div>
                    <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-[6px] font-black text-muted uppercase tracking-widest z-10">SCRN.PRVW</div>
                 </div>
                 <div v-if="item.type === 'post_background'" class="w-full h-full relative group/post-bg overflow-hidden flex items-center justify-center">
                    <div class="w-[90%] h-[80%] bg-black border border-border rounded-lg relative overflow-hidden flex flex-col p-2 gap-2 shadow-2xl shop-preview">
                       <div class="w-full h-full absolute inset-0 z-0" :class="item.css_value"></div>
                       
                       <!-- Particle Injector for Previews -->
                       <div v-if="item.css_value === 'post-bg-matrix'" class="absolute inset-0 pointer-events-none z-0 opacity-60">
                         <div v-for="i in 8" :key="i" class="matrix-column" :style="{ left: (i-1)*12 + '%', animationDelay: (i*0.2) + 's' }"></div>
                       </div>
                       <div v-if="item.css_value === 'post-bg-inferno'" class="absolute inset-0 pointer-events-none z-0">
                         <div v-for="i in 12" :key="i" class="ember" :style="{ left: Math.random()*100 + '%', animationDelay: Math.random()*5 + 's' }"></div>
                       </div>

                        <div class="relative z-10 space-y-2 p-2 rounded-xl bg-background/20 backdrop-blur-sm">
                          <div class="flex items-center gap-2">
                            <div class="w-4 h-4 rounded-full bg-primary-500/20"></div>
                            <div class="w-12 h-1 bg-muted/20 rounded"></div>
                          </div>
                          <div class="flex-1 space-y-1">
                            <div class="w-full h-2 bg-foreground/10 rounded"></div>
                            <div class="w-2/3 h-2 bg-foreground/10 rounded"></div>
                          </div>
                        </div>
                    </div>
                    <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-[6px] font-black text-muted uppercase tracking-widest z-10">POST.PRVW</div>
                 </div>
              </div>
              <div class="p-4 pt-2 flex-1">
                <h3 class="text-sm font-black text-industrial text-foreground mb-1">{{ item.name }}</h3>
                <p class="text-[10px] text-muted font-medium line-clamp-2 mb-4 leading-relaxed">{{ item.description }}</p>
              </div>
              <div class="p-4 pt-0 mt-auto border-t border-border bg-foreground/[0.01]">
                <div class="flex items-center justify-between mt-4">
                  <div v-if="item.owned" class="flex items-center gap-1 text-neon-lime"><Check class="w-3.5 h-3.5" /><span class="text-[8px] font-black uppercase tracking-widest leading-none">ACQUIRED</span></div>
                  <div v-else class="text-[8px] font-black uppercase tracking-widest text-primary-500/60 leading-none">SPECIAL</div>
                  <button v-if="item.owned" @click="equipItem(item)" :disabled="isEquipped(item)" class="px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all" :class="isEquipped(item) ? 'bg-foreground/5 text-muted border border-border' : 'bg-neon-lime text-black shadow-lg shadow-neon-lime/20'">{{ isEquipped(item) ? 'ON' : 'EQUIP' }}</button>
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
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { useI18nStore } from '../stores/i18n';
import { LayoutGrid, Type, Frame, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Coins, Check, Swords } from 'lucide-vue-next';
import AvatarFrame from './AvatarFrame.vue';
import BackgroundEffect from './BackgroundEffect.vue';

const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();

const items = ref([]);
const loading = ref(true);
const buying = ref(false);
const nowMs = ref(Date.now());
const showSeasonal = ref(false);
const showDropdown = ref(false);
let countdownTimer = null;

const selectedCategory = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(15);

const categories = [
  { id: 'all', label: 'cat_all', icon: Swords },
  { id: 'bundle', label: 'cat_bundle', icon: LayoutGrid },
  { id: 'title', label: 'cat_title', icon: Type },
  { id: 'border', label: 'cat_border', icon: Frame },
  { id: 'avatar', label: 'cat_avatar', icon: Sparkles },
  { id: 'background', label: 'cat_background', icon: Sparkles },
  { id: 'post_background', label: 'shop_tab_post_backgrounds', icon: LayoutGrid }
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

const totalPages = computed(() => Math.ceil(regularItems.value.length / itemsPerPage.value));

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return regularItems.value.slice(start, start + itemsPerPage.value);
});

watch(selectedCategory, () => {
  currentPage.value = 1;
});

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
  if (!authStore.user || item.type === 'bundle') return false;
  if (item.type === 'title') return authStore.user.equipped_title_id === item.id;
  if (item.type === 'border') return authStore.user.equipped_border_id === item.id;
  if (item.type === 'background') return authStore.user.equipped_background_id === item.id;
  if (item.type === 'avatar') return authStore.user.equipped_avatar_id === item.id;
  if (item.type === 'post_background') return authStore.user.equipped_post_background_id === item.id;
  return false;
};

const getRarityBadge = (item) => {
  const rarity = item.rarity || 'common';
  switch (rarity) {
    case 'legendary': return { label: 'LEGEND', classes: 'text-primary-500 bg-primary-500/10 border-primary-500/30 shadow-[0_0_10px_rgba(255,69,0,0.2)]' };
    case 'epic': return { label: 'EPIC', classes: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    case 'rare': return { label: 'RARE', classes: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    default: return { label: 'UNIT', classes: 'text-muted bg-foreground/5 border-border' };
  }
};

const getCardClass = (item) => {
  if (isEquipped(item)) return '!border-neon-lime/40 shadow-[0_0_30px_rgba(204,255,0,0.05)]';
  if (item.owned) return 'border-border';
  if (!item.is_unlocked) return 'opacity-60 grayscale';
  if (item.price >= 1200) return 'border-primary-500/30 hover:border-primary-500/60 shadow-[0_0_20px_rgba(255,69,0,0.05)]';
  return 'border-border hover:border-foreground/20';
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
    if (item.type === 'post_background') authStore.user.equipped_post_background_id = item.id;
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
@keyframes scanline { from { transform: translateY(0); } to { transform: translateY(-50%); } }
.animate-scanline { animation: scanline 8s linear infinite; }
</style>

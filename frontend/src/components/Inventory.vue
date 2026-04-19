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
      <button @click="activeTab = 'stats'" 
        class="flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative z-10"
        :class="activeTab === 'stats' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-muted hover:text-foreground hover:bg-white/5'">
        <Activity class="w-3.5 h-3.5" /> {{ i18n.t('inv_tab_stats') }}
      </button>
      <button @click="activeTab = 'gear'" 
        class="flex-1 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative z-10"
        :class="activeTab === 'gear' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-muted hover:text-foreground hover:bg-white/5'">
        <Package class="w-3.5 h-3.5" /> 
        {{ i18n.t('inv_tab_gear') }}
        <span v-if="hasNewInventoryOverall && activeTab !== 'gear'" 
              class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-surface animate-pulse"></span>
      </button>
    </div>

    <!-- TAB: BIOMETRICS (Refined Stats) -->
    <div v-if="activeTab === 'stats'" class="space-y-12 animate-in max-w-5xl mx-auto">
      <!-- Elite Evolution Card -->
      <div class="relative group p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-2xl overflow-hidden">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
        <div class="bg-surface/40 backdrop-blur-3xl rounded-[2.3rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
          <!-- Decorative Scanning Line -->
          <div class="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
             <div class="w-full h-1 bg-primary-500/20 shadow-[0_0_20px_rgba(255,69,0,0.5)] animate-scan"></div>
          </div>
          
          <!-- Avatar Section -->
          <div class="relative group/avatar">
            <div class="w-32 h-32 rounded-[2rem] bg-black/40 border-2 border-primary-500/30 p-1 relative z-10 overflow-hidden transform group-hover/avatar:scale-105 transition-transform duration-500">
               <img :src="authStore.user?.avatar_url" class="w-full h-full object-cover rounded-[1.8rem] opacity-80 group-hover/avatar:opacity-100 transition-opacity" />
               <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
            <!-- Level Badge -->
            <div class="absolute -bottom-4 -right-4 w-14 h-14 bg-surface border-4 border-primary-500 rounded-2xl flex items-center justify-center shadow-2xl z-20">
              <span class="text-xl font-black text-primary-500 italic">{{ authStore.user?.current_level || 1 }}</span>
            </div>
            <!-- Decorative Hex Grid -->
            <div class="absolute -inset-4 border border-primary-500/10 rounded-[2.5rem] -z-10 animate-pulse"></div>
          </div>

          <!-- Rank Info -->
          <div class="flex-1 space-y-6 w-full">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div class="space-y-1">
                <span class="text-[10px] font-black text-primary-500 tracking-[0.4em] uppercase">{{ i18n.t('inv_level_card_title') }}</span>
                <h2 class="text-4xl font-black text-foreground italic tracking-tighter">{{ authStore.user?.display_name }}</h2>
              </div>
              <div class="text-right">
                <span class="text-[9px] font-black text-muted tracking-widest uppercase">{{ i18n.t('inv_next_level') }}</span>
                <p class="text-xl font-black text-foreground italic tabular-nums tracking-tighter">
                  {{ authStore.user?.xp_for_next_level - authStore.user?.xp_into_level }} <span class="text-primary-500 text-sm">XP</span>
                </p>
              </div>
            </div>
            
            <!-- Precision Progress Bar -->
            <div class="space-y-3">
              <div class="h-3 bg-black/40 rounded-full border border-white/5 overflow-hidden p-0.5 relative">
                <div class="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full shadow-[0_0_15px_rgba(255,69,0,0.4)] transition-all duration-1000 relative overflow-hidden" 
                  :style="{ width: `${((authStore.user?.xp_into_level || 0) / (authStore.user?.xp_for_next_level || 1000)) * 100}%` }">
                  <div class="absolute inset-0 bg-white/20 animate-shimmer"></div>
                </div>
              </div>
              <div class="flex justify-between text-[8px] font-black text-muted tracking-[0.2em] font-mono">
                <span>PROGRESS_STATUS: ACTIVE</span>
                <span class="text-foreground">[{{ Math.floor(((authStore.user?.xp_into_level || 0) / (authStore.user?.xp_for_next_level || 1000)) * 100) }}%]</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attributes Grid (Tactical Slots) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="stat in rpgStats" :key="stat.key" 
          @click="selectedStat = stat"
          class="tactical-stat-card p-6 bg-surface/20 border border-white/5 rounded-3xl group cursor-pointer hover:border-primary-500/30 transition-all active:scale-95">
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-start">
              <div class="p-3 rounded-2xl bg-black/20 border border-white/5 group-hover:scale-110 transition-all">
                <component :is="stat.icon" class="w-5 h-5" :class="stat.color" />
              </div>
              <div class="text-[8px] font-mono text-muted tracking-tighter italic">LVL.{{ authStore.user?.[stat.lvlKey] || 1 }}</div>
            </div>
            <div class="space-y-1">
              <span class="text-[10px] font-black text-muted uppercase tracking-widest block">{{ stat.name }}</span>
              <div class="h-1 w-full bg-black/40 rounded-full overflow-hidden mt-2">
                <div class="h-full bg-primary-500 transition-all duration-700"
                  :style="{ width: `${((authStore.user?.[stat.xpIntoKey] || 0) / (authStore.user?.[stat.xpForKey] || 100)) * 100}%` }"></div>
              </div>
            </div>
          </div>
        </div>
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

      <!-- LOADOUT CONSOLE (Active Equipment) -->
      <div class="space-y-8">
        <div class="flex items-center gap-4">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
          <h3 class="text-[10px] font-black text-muted uppercase tracking-[0.5em] font-mono">{{ i18n.t('inv_loadout_title') }}</h3>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div v-for="slot in loadoutSlots" :key="slot.type" 
               class="relative group rounded-2xl bg-surface/10 border border-white/5 p-4 flex flex-col items-center justify-center gap-3 min-h-[140px] transition-all hover:bg-white/5">
            
            <div class="absolute top-2 left-2 text-[6px] font-mono text-muted/50 uppercase">{{ slot.label }}</div>
            
            <!-- Slot Content -->
            <div v-if="getEquippedItem(slot.type)" class="flex flex-col items-center gap-2">
              <div class="scale-75 origin-center">
                <AvatarFrame v-if="slot.type === 'border'" :src="authStore.user?.avatar_url" :border-css="getEquippedItem(slot.type).css_value" :size="50" />
                <div v-else-if="slot.type === 'title'" class="text-center px-1">
                  <h4 class="text-[10px] font-black uppercase italic leading-tight" :class="getEquippedItem(slot.type).css_value">{{ getEquippedItem(slot.type).name }}</h4>
                </div>
                <div v-else-if="slot.type === 'background'" class="w-12 h-12 rounded-lg overflow-hidden border border-white/10 relative">
                   <BackgroundEffect :background-css="getEquippedItem(slot.type).css_value" is-preview class="!absolute !inset-0" />
                </div>
                <div v-else-if="slot.type === 'post_background'" class="w-12 h-12 rounded-lg overflow-hidden border border-white/10 relative">
                   <div :class="getEquippedItem(slot.type).css_value" class="absolute inset-0"></div>
                </div>
                <div v-else-if="slot.type === 'avatar'" class="w-12 h-12 rounded-lg overflow-hidden border border-white/10 relative">
                   <div :class="getEquippedItem(slot.type).css_value" class="absolute inset-0"></div>
                </div>
              </div>
              <span class="text-[8px] font-black text-foreground uppercase truncate w-24 text-center">{{ getEquippedItem(slot.type).name }}</span>
            </div>

            <!-- Empty Slot State -->
            <div v-else class="flex flex-col items-center gap-2 opacity-20">
              <component :is="slot.icon" class="w-8 h-8 text-muted" />
              <span class="text-[8px] font-black text-muted uppercase">OFFLINE</span>
            </div>

            <!-- Glow based on rarity -->
            <div v-if="getEquippedItem(slot.type)" 
                 class="absolute inset-0 rounded-2xl border border-primary-500/20 shadow-[0_0_20px_rgba(255,69,0,0.1)] pointer-events-none"></div>
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
        <div v-else class="space-y-16">
          <div v-for="(items, type) in groupedItems" :key="type" class="space-y-6">
            <!-- Category Header -->
            <div class="flex items-center gap-6 px-4">
              <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-primary-500"></div>
                <h2 class="text-xs font-black text-foreground uppercase tracking-[0.4em] font-mono">
                  {{ 
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
                :class="[isEquipped(item) ? 'equipped' : '', `rarity-${item.rarity || 'common'}`]">
                
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
                   </div>

                   <!-- Info Badge -->
                   <div class="p-3 bg-surface/60 border-t border-white/5 relative overflow-hidden">
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
    
    <!-- Stat Detail Modal (Codex Integration Style) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selectedStat" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md px-4" @click.self="selectedStat = null">
          <div class="bg-surface border rounded-[2.5rem] w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in shadow-2xl relative"
               :class="selectedStat.borderColor">
            <button @click="selectedStat = null" class="absolute top-6 right-6 z-20 p-2 text-muted hover:text-white transition-colors bg-white/5 rounded-full">
              <X class="w-5 h-5" />
            </button>
            <div class="absolute -top-12 -left-12 opacity-[0.03] rotate-12 pointer-events-none">
              <component :is="selectedStat.icon" class="w-64 h-64" />
            </div>
            <div class="p-8 sm:p-12 space-y-10 relative z-10">
              <div class="flex flex-col items-center text-center space-y-6">
                <div class="p-6 rounded-3xl bg-gradient-to-br transition-all duration-500 shadow-xl" 
                     :class="[selectedStat.bgLight, 'ring-1 ring-inset ' + selectedStat.borderColor.replace('border-', 'ring-') + '/20']">
                  <component :is="selectedStat.icon" class="w-16 h-16 drop-shadow-[0_0_15px_rgba(255,69,0,0.5)]" :class="selectedStat.color" />
                </div>
                <div class="space-y-2">
                  <h3 class="text-3xl sm:text-4xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                    {{ selectedStat.name }}
                  </h3>
                </div>
              </div>
              <div class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="p-4 rounded-2xl bg-foreground/[0.03] border border-white/5 space-y-1">
                    <p class="text-[8px] font-black text-muted uppercase tracking-widest">MECHANICAL EFFECT</p>
                    <p class="text-xs font-black text-foreground uppercase italic tracking-tight">{{ selectedStat.effectLabel }}</p>
                  </div>
                  <div class="p-4 rounded-2xl bg-foreground/[0.03] border border-white/5 space-y-1 text-right">
                    <p class="text-[8px] font-black text-muted uppercase tracking-widest">HOW TO UPGRADE</p>
                    <p class="text-xs font-black text-primary-500 uppercase italic tracking-tight">{{ selectedStat.action }}</p>
                  </div>
                </div>
              </div>
              <div v-if="selectedStat.links && selectedStat.links.length > 0" class="pt-4">
                <router-link 
                  v-for="link in selectedStat.links" 
                  :key="link.to" 
                  :to="link.to" 
                  @click="selectedStat = null"
                  class="group relative w-full py-5 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                  :class="['bg-gradient-to-r ' + selectedStat.gradient, 'shadow-' + selectedStat.key + '-500/20']"
                >
                  <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <component :is="link.icon || Zap" class="w-5 h-5 text-white animate-pulse" />
                  <span class="text-sm font-black text-white uppercase tracking-[0.15em] italic">
                    {{ link.label }}
                  </span>
                  <ChevronRight class="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                </router-link>
              </div>
              <div class="text-center pb-8">
                <button @click="selectedStat = null" class="text-[9px] font-black text-muted/50 hover:text-foreground uppercase tracking-[0.2em] transition-colors py-2">
                  {{ i18n.t('inv_dismiss_data') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { 
  Package, Frame, Type, Check, Sparkles, Archive, Zap, TrendingUp, 
  Dumbbell, Sword, Heart, Brain, Church, Trophy, ExternalLink, Activity, X, 
  ChevronDown, Flame, BookOpen, Swords, Info, ChevronRight, Users
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

const activeTab = ref('gear'); // Default to gear for the redesign
const activeStashTab = ref('all');
const selectedStat = ref(null);
const openCategories = ref({}); // tracks open/closed state per category type

const toggleCategory = (type) => {
  // default is open (undefined = truthy), so first click closes
  const isOpening = openCategories.value[type] === false;
  openCategories.value[type] = isOpening ? true : false;
  
  if (isOpening) {
    markCategorySeen(type);
  }
};

const loadoutSlots = computed(() => [
  { type: 'title', label: i18n.t('shop_tab_titles'), icon: Type },
  { type: 'border', label: i18n.t('shop_tab_borders'), icon: Frame },
  { type: 'avatar', label: i18n.t('shop_tab_avatars'), icon: Users },
  { type: 'post_background', label: i18n.t('shop_tab_post_backgrounds'), icon: Activity },
  { type: 'background', label: i18n.t('shop_tab_backgrounds'), icon: Sparkles }
]);

const getEquippedItem = (type) => {
  const equippedIdMap = {
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
    if (activeStashTab.value === 'cores') {
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
  try {
    await axios.post(`/api/shop/equip/${targetId}?type=${item.type}`);
    if (item.type === 'title') { authStore.user.equipped_title_id = alreadyEquipped ? null : item.id; authStore.user.title_css = alreadyEquipped ? '' : item.css_value; authStore.user.title_name = alreadyEquipped ? '' : item.name; }
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
  await Promise.all([fetchInventory(), authStore.fetchProfile()]);
  // Removed automatic global markSeen timeout
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
.rarity-common { --item-glow: rgba(143, 161, 179, 0.3); }
.rarity-rare { --item-glow: rgba(247, 178, 59, 0.3); }
.rarity-epic { --item-glow: rgba(163, 77, 244, 0.3); }
.rarity-legendary { --item-glow: rgba(255, 157, 0, 0.4); }

.nexus-slot.equipped .nexus-slot-inner {
  border-color: rgba(255, 69, 0, 0.4);
  box-shadow: 0 0 30px -5px rgba(255, 69, 0, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4);
}

.nexus-slot:hover .nexus-slot-inner {
  border-color: var(--item-glow);
  box-shadow: 0 0 40px -10px var(--item-glow), 0 8px 32px rgba(0, 0, 0, 0.4);
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

<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-in relative z-10 pb-32">
    <!-- Premium Armory Header -->
    <div class="relative py-8">
      <div class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <h1 class="text-[120px] font-black tracking-tighter uppercase italic select-none">ARMORY</h1>
      </div>
      <div class="text-center space-y-4 relative z-10">
        <h1 class="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic leading-none">
        </h1>
        <p class="text-[10px] font-bold text-muted uppercase tracking-[0.5em] font-tight max-w-md mx-auto">{{ i18n.t('inv_subtitle') }}</p>
      </div>
    </div>
    <!-- Tabs Navigation (Redesigned for separation) -->
    <div class="flex items-center justify-center gap-4 mb-8">
      <button @click="activeTab = 'combat'; activeStashTab = 'all'; playZip()" 
              class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border"
              :class="activeTab === 'combat' ? 'bg-primary-500 text-white border-primary-400 shadow-lg shadow-primary-500/20' : 'bg-surface/20 text-muted border-white/5 hover:border-white/10'">
        {{ i18n.t('inv_tab_combat') || 'COMBAT_PROTOCOL' }}
      </button>
      <button @click="activeTab = 'customization'; activeStashTab = 'all'; playZip()" 
              class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border"
              :class="activeTab === 'customization' ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-surface/20 text-muted border-white/5 hover:border-white/10'">
        {{ i18n.t('inv_tab_customization') || 'IDENTITY_STASH' }}
      </button>
    </div>

    <!-- COMBAT VIEW -->
    <div v-if="activeTab === 'combat'" class="space-y-12 animate-in">
      <!-- Combat Performance Dashboard remains at top -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div class="p-6 rounded-[2.5rem] bg-surface/10 border border-white/5 relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent"></div>
          <div class="relative z-10 flex flex-col gap-2">
            <p class="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] leading-none">{{ i18n.t('inv_total_power') || 'TOTAL_POWER' }}</p>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-black text-foreground italic">{{ combatStats.minDamage }} - {{ combatStats.maxDamage }}</span>
              <span class="text-sm font-bold text-primary-500/50 uppercase tracking-tighter">{{ i18n.t('dash_per_rep') }}</span>
            </div>
            <p class="text-[8px] font-black text-muted uppercase tracking-widest mt-1 opacity-60">Avg: {{ combatStats.total }}</p>
          </div>
          <Sword class="absolute -bottom-2 -right-2 w-24 h-24 text-white/5 rotate-12 group-hover:scale-110 transition-transform" />
        </div>

        <div class="p-6 rounded-[2.5rem] bg-surface/10 border border-white/5 relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent"></div>
          <div class="relative z-10 flex flex-col gap-2">
            <p class="text-[10px] font-black text-muted uppercase tracking-[0.3em] leading-none">{{ i18n.t('dash_gear_mod') }}</p>
            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-black text-orange-500 italic">+{{ combatStats.gear }}</span>
              <span class="text-sm font-bold text-orange-500/50 uppercase tracking-tighter">{{ i18n.t('dash_bonus_str') }}</span>
            </div>
          </div>
          <Zap class="absolute -bottom-2 -right-2 w-24 h-24 text-white/5 -rotate-12 group-hover:scale-110 transition-transform" />
        </div>

        <div class="p-6 rounded-[2.5rem] bg-surface/10 border border-white/5 relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
          <div class="relative z-10 flex flex-col gap-2">
            <p class="text-[10px] font-black text-muted uppercase tracking-[0.3em] leading-none">{{ i18n.t('dash_crit_overlay') }}</p>
            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-black text-emerald-400 italic">{{ combatStats.critChance }}%</span>
              <span class="text-sm font-bold text-emerald-500/50 uppercase tracking-tighter">{{ i18n.t('dash_success_prob') }}</span>
            </div>
          </div>
          <Activity class="absolute -bottom-2 -right-2 w-24 h-24 text-white/5 rotate-0 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      <!-- Section: Modules (Chests) -->
      <div v-if="authStore.user?.level_chests > 0 || authStore.user?.boss_chests > 0 || authStore.user?.legendary_chests > 0" 
           class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto justify-center">
        <div v-if="authStore.user?.legendary_chests > 0" @click="handleOpenLegendaryChest" :disabled="openingChest"
          class="tactical-chest-button p-1 rounded-3xl bg-amber-500/10 border border-amber-500/20 group cursor-pointer hover:bg-amber-500/20 transition-all overflow-hidden relative shadow-[0_0_40px_rgba(245,158,11,0.1)]">
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none"></div>
          <div class="flex items-center justify-between p-6 relative z-10">
            <div class="flex items-center gap-6">
              <div class="p-4 bg-amber-500/20 rounded-2xl border border-amber-500/30 group-hover:scale-110 transition-transform">
                <Trophy class="w-8 h-8 text-amber-500" />
              </div>
              <div class="text-left">
                <p class="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] font-mono leading-none mb-1">LEGENDARY_VAULT</p>
                <h4 class="text-2xl font-black text-foreground italic">{{ authStore.user.legendary_chests }} Ready</h4>
              </div>
            </div>
            <Sparkles class="w-6 h-6 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

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
      <!-- ACTIVE EFFECTS (Potions/Buffs) -->
      <div v-if="activePotions.length > 0" class="space-y-6">
        <div class="flex items-center gap-4">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-500/20"></div>
          <h3 class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] font-mono">{{ i18n.t('inv_active_buffs') }}</h3>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/20"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div v-for="potion in activePotions" :key="potion.type" 
               class="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between group hover:bg-emerald-500/10 transition-all relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
            <div class="flex items-center gap-4 relative z-10">
              <div class="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <FlaskConical class="w-6 h-6 text-emerald-500 animate-pulse" />
              </div>
              <div>
                <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">{{ i18n.t(potion.label) }}</p>
                <h4 class="text-xl font-black text-white italic leading-tight">{{ potion.value }} {{ i18n.t('inv_boost_active') }}</h4>
                <p class="text-[9px] font-bold text-emerald-500/60 uppercase tracking-wider mt-1">{{ potion.description }}</p>
              </div>
            </div>
            <div class="text-right relative z-10">
              <p class="text-[8px] font-black text-muted uppercase tracking-widest mb-1">{{ i18n.t('inv_time_left') }}</p>
              <span class="text-lg font-black text-white font-mono tracking-tighter">{{ potion.timeLeft }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- LOADOUT CONSOLE (Combat Gear Only) -->
      <div class="space-y-8 max-w-6xl mx-auto">
        <div class="flex items-center gap-4">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-primary-500/20"></div>
          <h3 class="text-[10px] font-black text-primary-500 uppercase tracking-[0.5em] font-mono">{{ i18n.t('inv_loadout_combat') || 'TACTICAL_LOADOUT' }}</h3>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-primary-500/20"></div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          <!-- Combat Gear Slots -->
          <div v-for="slot in gearSlots" :key="slot.type" 
               @click="getEquippedItem(slot.type) && openItemDetails(getEquippedItem(slot.type))"
               class="relative group rounded-2xl bg-surface/10 border border-white/5 p-4 flex flex-col items-center justify-center gap-3 min-h-[140px] transition-all hover:bg-white/5 overflow-hidden cursor-pointer">
            <div class="absolute inset-x-0 h-px bg-primary-500/20 top-0 group-hover:top-full transition-all duration-[2s] ease-linear pointer-events-none z-10"></div>
            <div class="absolute top-2 left-2 text-[6px] font-mono text-muted/50 uppercase tracking-widest">{{ slot.label }}</div>
            
            <div v-if="getEquippedItem(slot.type)" class="flex flex-col items-center gap-2 relative z-20">
               <div class="w-16 h-16 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ItemIcon :name="getEquippedItem(slot.type).svg_key" :type="slot.type" class-name="w-8 h-8 text-primary-500" />
               </div>
               <span class="text-[8px] font-black text-foreground uppercase truncate w-24 text-center tracking-tighter">{{ getEquippedItem(slot.type).name }}</span>
            </div>
            <div v-else class="flex flex-col items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
              <component :is="slot.icon" class="w-8 h-8 text-muted" />
              <span class="text-[8px] font-black text-muted uppercase tracking-[0.2em]">{{ i18n.t('inv_empty_slot') || 'EMPTY' }}</span>
            </div>
            <div v-if="getEquippedItem(slot.type)" class="absolute inset-0 rounded-2xl border border-primary-500/20 shadow-[0_0_20px_rgba(255,69,0,0.1)] pointer-events-none group-hover:border-primary-500/40"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- CUSTOMIZATION VIEW -->
    <div v-if="activeTab === 'customization'" class="space-y-12 animate-in">
      <div class="space-y-8 max-w-6xl mx-auto">
        <div class="flex items-center gap-4">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-purple-500/20"></div>
          <h3 class="text-[10px] font-black text-purple-400 uppercase tracking-[0.5em] font-mono">{{ i18n.t('inv_loadout_identity') || 'IDENTITY_LOADOUT' }}</h3>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-purple-500/20"></div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
          <!-- Aesthetic Slots -->
          <div v-for="slot in loadoutSlots" :key="slot.type" 
               @click="getEquippedItem(slot.type) && openItemDetails(getEquippedItem(slot.type))"
               class="relative group rounded-2xl bg-surface/10 border border-white/5 p-4 flex flex-col items-center justify-center gap-3 min-h-[140px] transition-all hover:bg-white/5 overflow-hidden cursor-pointer">
            <div class="absolute inset-x-0 h-px bg-purple-500/20 top-0 group-hover:top-full transition-all duration-[2s] ease-linear pointer-events-none z-10"></div>
            <div class="absolute top-2 left-2 text-[6px] font-mono text-muted/50 uppercase tracking-widest">{{ slot.label }}</div>
            
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
            <div v-else class="flex flex-col items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
              <component :is="slot.icon" class="w-8 h-8 text-muted" />
              <span class="text-[8px] font-black text-muted uppercase tracking-[0.2em]">{{ i18n.t('inv_offline') || 'OFFLINE' }}</span>
            </div>
            <div v-if="getEquippedItem(slot.type)" class="absolute inset-0 rounded-2xl border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] pointer-events-none group-hover:border-purple-500/40"></div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Main Stash Layout (Shared between tabs but filtered) -->
    <div class="space-y-12">
        <div v-if="loading" class="py-32 flex flex-col items-center justify-center gap-6">
           <div class="relative">
             <div class="w-16 h-16 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
             <div class="absolute inset-0 flex items-center justify-center">
               <span class="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
             </div>
           </div>
           <p class="text-[10px] font-black text-muted uppercase tracking-[0.6em] font-mono">{{ i18n.t('inv_sync_stash') }}</p>
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
          <!-- Modern Filters Interface (Replicating Store) -->
          <div class="flex flex-col lg:flex-row items-center gap-6 bg-surface/20 p-4 rounded-3xl border border-border/50 backdrop-blur-sm relative z-30 mb-8">
            
            <!-- Categories Dropdown -->
            <div class="w-full lg:w-72 relative z-50">
              <button 
                @click="showDropdown = !showDropdown"
                class="flex items-center gap-3 px-6 py-3 bg-surface/60 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary-500/30 transition-all w-full justify-between shadow-lg"
              >
                <div class="flex items-center gap-2">
                  <component :is="categories.find(c => c.id === activeStashTab)?.icon || Archive" class="w-3.5 h-3.5 text-primary-500" />
                  <span class="text-foreground">{{ i18n.t(categories.find(c => c.id === activeStashTab)?.label) || categories.find(c => c.id === activeStashTab)?.label }}</span>
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
                <div v-if="showDropdown" class="absolute top-full left-0 mt-2 w-full bg-surface/90 backdrop-blur-3xl border border-border rounded-2xl shadow-2xl overflow-hidden py-2 z-[60]">
                  <button 
                    v-for="cat in categories" 
                    :key="cat.id"
                    @click="activeStashTab = cat.id; showDropdown = false"
                    class="w-full flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all text-left"
                    :class="activeStashTab === cat.id ? 'bg-primary-500 text-white' : 'text-muted hover:bg-white/5 hover:text-foreground'"
                  >
                    <component :is="cat.icon" class="w-3.5 h-3.5" />
                    {{ i18n.t(cat.label) }}
                  </button>
                </div>
              </Transition>
            </div>

            <div class="hidden lg:block w-px h-10 bg-border/50"></div>

            <!-- Rarity Selector -->
            <div class="flex-1 flex flex-wrap items-center justify-start lg:justify-end gap-2">
              <button 
                v-for="rarity in rarities" 
                :key="rarity.id"
                @click="selectedRarity = rarity.id"
                class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 whitespace-nowrap"
                :class="selectedRarity === rarity.id ? rarity.activeClass : 'bg-surface/20 border-border text-muted hover:border-foreground/20'"
              >
                {{ i18n.t(rarity.label) }}
              </button>
            </div>
          </div>

          <div v-for="(items, type) in groupedItems" :key="type" class="space-y-6">
            <!-- Category Header -->
            <div class="flex items-center gap-6 px-4">
              <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-primary-500"></div>
                <h2 class="text-xs font-black text-foreground uppercase tracking-[0.4em] font-mono">
                  {{ 
                    type === 'head' ? i18n.t('inv_cat_helmet') :
                    type === 'weapon' ? i18n.t('inv_cat_weapon') :
                    type === 'armor' ? i18n.t('inv_cat_armor') :
                    type === 'boots' ? i18n.t('inv_cat_boots') :
                    type === 'title' ? i18n.t('inv_cat_titles') : 
                    type === 'border' ? i18n.t('inv_cat_borders') : 
                    type === 'background' ? i18n.t('inv_cat_backgrounds') : 
                    type === 'post_background' ? i18n.t('inv_cat_post_backgrounds') : 
                    type === 'avatar' ? i18n.t('inv_cat_avatar_effects') : 
                    type === 'bundle' ? i18n.t('shop_cat_bundles') || 'BUNDLES' :
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
                @click="openItemDetails(item)"
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
                            <ItemIcon :name="item.svg_key" :type="type" class-name="w-10 h-10 text-primary-500" />
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
                       
                       <div class="text-center">
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

    <!-- Chest Opening Modal Overlay -->
    <ChestOpening 
      v-if="showChestModal" 
      :show="showChestModal" 
      :reward="chestReward" 
      :reel-items="reelItems" 
      @close="closeChestModal" 
    />

    <!-- Item Details Modal (Issue #135) -->
    <Teleport to="body">
      <div v-if="showItemModal && selectedItem" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in">
        <div class="relative w-full max-w-xl bg-surface/40 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(255,69,0,0.1)] overflow-hidden">
          
          <!-- Modal Header -->
          <div class="p-8 pb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary-500/10 rounded-lg border border-primary-500/20">
                <Package class="w-4 h-4 text-primary-500" />
              </div>
              <div>
                <p class="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] font-mono leading-none mb-1">{{ i18n.t('inv_artifact_detail') }}</p>
                <h3 class="text-2xl font-black text-white italic uppercase tracking-tighter">{{ selectedItem.name }}</h3>
              </div>
            </div>
            <button @click="showItemModal = false" class="p-2 hover:bg-white/5 rounded-xl transition-all">
              <X class="w-6 h-6 text-muted" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-8 pt-0 space-y-6">
            <!-- Visual Preview -->
            <div class="aspect-video bg-black/40 rounded-3xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
               <!-- Scan Effect -->
               <div class="absolute inset-x-0 h-px bg-primary-500/20 top-0 group-hover:top-full transition-all duration-[3s] ease-linear pointer-events-none"></div>
               
               <div class="scale-150">
                  <ItemIcon v-if="['head', 'weapon', 'armor', 'boots'].includes(selectedItem.type)" :name="selectedItem.svg_key" :type="selectedItem.type" class-name="w-24 h-24 text-primary-500" />
                  <FlaskConical v-else-if="selectedItem.type === 'consumable'" class="w-24 h-24 text-primary-500 animate-pulse" />
                  <div v-else-if="selectedItem.type === 'title'" class="text-xl font-black uppercase italic" :class="selectedItem.css_value">{{ selectedItem.name }}</div>
                  <AvatarFrame v-else-if="selectedItem.type === 'border'" :src="authStore.user?.avatar_url" :border-css="selectedItem.css_value" :size="100" />
                  <div v-else-if="selectedItem.type === 'background'" class="w-32 h-32 rounded-2xl overflow-hidden border border-white/10 relative">
                     <BackgroundEffect :background-css="selectedItem.css_value" is-preview class="!absolute !inset-0" />
                  </div>
                  <div v-else-if="selectedItem.type === 'avatar'" class="w-32 h-32 rounded-2xl overflow-hidden border border-white/10 relative">
                     <div :class="selectedItem.css_value" class="absolute inset-0"></div>
                  </div>
                  <div v-else-if="selectedItem.type === 'post_background'" class="w-32 h-32 rounded-2xl overflow-hidden border border-white/10 relative">
                     <div :class="selectedItem.css_value" class="absolute inset-0"></div>
                  </div>
                  <Package v-else class="w-24 h-24 text-primary-500" />
               </div>
            </div>

            <!-- Stats & Description -->
            <div class="space-y-4">
              <div v-if="selectedItem.description" class="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p class="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{{ i18n.t('inv_artifact_description') }}</p>
                <p class="text-sm font-bold text-zinc-400 leading-relaxed">{{ selectedItem.description }}</p>
              </div>

              <div v-if="selectedItem.stats" class="grid grid-cols-2 gap-4">
                <div v-for="(val, key) in selectedItem.stats" :key="key" class="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                  <p class="text-[8px] font-black text-primary-500/60 uppercase tracking-widest">{{ key.replace('_', ' ') }}</p>
                  <p class="text-lg font-black text-white italic">
                    {{ key === 'multiplier' ? 'x' : '+' }}{{ val }}{{ key.includes('percent') || key.includes('chance') ? '%' : '' }}
                  </p>
                </div>
              </div>

              <!-- Rarity Badge -->
              <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <p class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18n.t('inv_artifact_rarity') }}</p>
                <span class="px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest" :class="getRarityClass(selectedItem.rarity)">
                  {{ getRarityLabel(selectedItem.rarity) }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 pt-4">
              <button v-if="selectedItem.type === 'consumable'" 
                @click="handleActivate(selectedItem); showItemModal = false"
                :disabled="isPotionTypeActive(selectedItem)"
                class="flex-1 btn-reppy !py-5 shadow-2xl shadow-primary-500/20 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed">
                {{ isPotionTypeActive(selectedItem) ? i18n.t('inv_already_active') || 'ALREADY_ACTIVE' : i18n.t('inv_activate_module') }} (x{{ selectedItem.quantity || 1 }})
              </button>
              <button v-else-if="selectedItem.type !== 'bundle'" @click="toggleEquip(selectedItem); showItemModal = false"
                class="flex-1 btn-reppy !py-5 shadow-2xl" :class="isEquipped(selectedItem) ? '!bg-zinc-800 !text-muted' : 'shadow-primary-500/20'">
                {{ isEquipped(selectedItem) ? i18n.t('inv_unlink_artifact') : i18n.t('inv_link_artifact') }}
              </button>
              <button @click="showItemModal = false" class="px-8 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all">
                {{ i18n.t('inv_close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

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
import ItemIcon from './ItemIcon.vue';

const { playZip, playEquipBlip, playClickBlip } = useAudio();
const authStore = useAuthStore();
const i18n = useI18nStore();
const emit = defineEmits(['start', 'viewProfile']);
const notificationStore = useNotificationStore();
const inventory = ref([]);
const loading = ref(true);
const currentTime = ref(new Date());
let timerInterval = null;

const formatTimeLeft = (diff) => {
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const activePotions = computed(() => {
  const user = authStore.user;
  if (!user) return [];
  
  const now = currentTime.value;
  const boosts = [];

  // Check Damage Multiplier
  if (user.damage_multiplier_expiry && new Date(user.damage_multiplier_expiry) > now) {
    const expiry = new Date(user.damage_multiplier_expiry);
    const diff = expiry - now;
    const mult = parseFloat(user.damage_multiplier);
    const percent = Math.round((mult - 1) * 100);
    boosts.push({
      type: 'multiplier',
      label: 'inv_dmg_mult',
      value: `x${mult.toFixed(1)}`,
      description: i18n.t('inv_dmg_mult_desc', { percent }),
      timeLeft: formatTimeLeft(diff)
    });
  }

  // Check DEX Bonus
  if (user.dex_bonus_expiry && new Date(user.dex_bonus_expiry) > now) {
    const expiry = new Date(user.dex_bonus_expiry);
    const diff = expiry - now;
    boosts.push({
      type: 'dex',
      label: 'inv_dex_boost',
      value: `+${user.dex_bonus}`,
      description: i18n.t('inv_dex_boost_desc'),
      timeLeft: formatTimeLeft(diff)
    });
  }

  return boosts;
});

const combatStats = ref({
  total: 0,
  base: 0,
  gear: 0,
  buff: 0,
  multiplier: 1.0,
  critChance: 0,
  minDamage: 0,
  maxDamage: 0
});

const fetchStats = async () => {
  try {
    const res = await axios.get('/api/reps/stats');
    if (res.data.combatPower) {
      combatStats.value = {
        total: res.data.combatPower.total,
        base: res.data.combatPower.base,
        gear: res.data.combatPower.gear,
        buff: res.data.combatPower.buff,
        multiplier: res.data.combatPower.multiplier,
        critChance: res.data.combatPower.critChance,
        minDamage: res.data.combatPower.minDamage,
        maxDamage: res.data.combatPower.maxDamage
      };
    }
  } catch (e) {
    console.error('Error fetching combat stats:', e);
  }
};

// Watch for potion expiry to refresh combat stats in Armory
watch(() => activePotions.value.length, (newLen, oldLen) => {
  if (newLen < oldLen) {
    fetchStats();
    authStore.fetchProfile();
  }
});

const isPotionTypeActive = (item) => {
  if (!item || !item.stats) return false;
  const user = authStore.user;
  if (!user) return false;
  const now = currentTime.value;
  
  if (item.stats.multiplier) {
    return user.damage_multiplier_expiry && new Date(user.damage_multiplier_expiry) > now;
  }
  if (item.stats.dex_bonus) {
    return user.dex_bonus_expiry && new Date(user.dex_bonus_expiry) > now;
  }
  return false;
};


const activeTab = ref('combat'); 
const activeStashTab = ref('all');
const showDropdown = ref(false);
const selectedRarity = ref('all');

const categories = computed(() => {
  if (activeTab.value === 'combat') {
    return [
      { id: 'all', label: 'shop_cat_all', icon: Archive },
      { id: 'head', label: 'shop_cat_head', icon: Zap },
      { id: 'weapon', label: 'shop_cat_weapons', icon: Sword },
      { id: 'armor', label: 'shop_cat_armor', icon: Shield },
      { id: 'boots', label: 'shop_cat_boots', icon: Footprints },
      { id: 'consumable', label: 'shop_cat_consumables', icon: Flame },
      { id: 'bundle', label: 'shop_cat_bundles', icon: Package }
    ];
  } else {
    return [
      { id: 'all', label: 'shop_cat_all', icon: Archive },
      { id: 'title', label: 'shop_tab_titles', icon: Type },
      { id: 'border', label: 'shop_tab_borders', icon: Frame },
      { id: 'avatar', label: 'shop_tab_avatars', icon: Users },
      { id: 'post_background', label: 'shop_tab_post_backgrounds', icon: Activity },
      { id: 'background', label: 'shop_tab_backgrounds', icon: Sparkles }
    ];
  }
});

const rarities = [
  { id: 'all', label: 'rarity_all', activeClass: 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20' },
  { id: 'common', label: 'rarity_common', activeClass: 'bg-zinc-800 text-white border-zinc-700' },
  { id: 'rare', label: 'rarity_rare', activeClass: 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' },
  { id: 'especial', label: 'rarity_special', activeClass: 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' },
  { id: 'legendary', label: 'rarity_legendary', activeClass: 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-500/20' },
  { id: 'calistenico', label: 'rarity_calisthenic', activeClass: 'bg-[#ccff00] text-black border-[#ccff00] shadow-lg shadow-[#ccff00]/20' }
];

const selectedStat = ref(null);
const openCategories = ref({}); // tracks open/closed state per category type

const comparisonState = ref({
  show: false,
  newItem: null,
  currentItem: null
});

const showItemModal = ref(false);
const selectedItem = ref(null);

const statLabels = {
  str: 'Fuerza',
  dex: 'Destreza',
  end: 'Resistencia',
  vig: 'Vigor',
  int: 'Inteligencia',
  fth: 'Fe',
  cha: 'Carisma'
};

const getStatDiff = (stat, newValue) => {
  if (!authStore.user || !selectedItem.value) return 0;
  
  const equippedItem = getEquippedItem(selectedItem.value.type);
  if (!equippedItem || !equippedItem.stats) return newValue;
  
  const oldVal = equippedItem.stats[stat] || 0;
  return newValue - oldVal;
};

const openItemDetails = (item) => {
  if (!item) return;
  selectedItem.value = item;
  showItemModal.value = true;
};

const getRarityBadge = (item) => {
  if (!item) return { label: i18n.t('rarity_common'), classes: 'text-muted bg-foreground/5 border-border' };
  const rarity = item.rarity?.toLowerCase() || 'common';
  switch (rarity) {
    case 'calistenico': return { label: i18n.t('rarity_calisthenic'), classes: 'text-[#ccff00] bg-[#ccff00]/10 border-[#ccff00]/30 shadow-[0_0_10px_rgba(204,255,0,0.2)]' };
    case 'legendary': return { label: i18n.t('rarity_legendary'), classes: 'text-primary-500 bg-primary-500/10 border-primary-500/30 shadow-[0_0_10px_rgba(255,69,0,0.2)]' };
    case 'epic':
    case 'especial': return { label: i18n.t('rarity_special'), classes: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    case 'rare': return { label: i18n.t('rarity_rare'), classes: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    default: return { label: i18n.t('rarity_common'), classes: 'text-muted bg-foreground/5 border-border' };
  }
};

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

const equippedStats = computed(() => {
  const stats = {
    str: 0,
    dex: 0,
    end: 0,
    vig: 0,
    int: 0,
    fth: 0,
    cha: 0,
    multiplier: 0,
    crit_chance: 0,
    crit_damage: 0
  };
  
  const slots = ['head', 'weapon', 'armor', 'boots'];
  slots.forEach(slot => {
    const item = getEquippedItem(slot);
    if (item && item.stats) {
      Object.entries(item.stats).forEach(([stat, val]) => {
        if (stats[stat] !== undefined) {
          stats[stat] += val;
        }
      });
    }
  });
  
  return stats;
});

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
  if (openingChest.value || authStore.user.boss_chests <= 0) return;
  openingChest.value = true;
  try {
    const res = await axios.post('/api/boss/open-chest');
    chestReward.value = res.data;
    reelItems.value = res.data.reel_items;
    showChestModal.value = true;
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Error al abrir cofre', 'error');
  } finally {
    openingChest.value = false;
  }
};

const handleOpenLegendaryChest = async () => {
  if (openingChest.value || authStore.user.legendary_chests <= 0) return;
  openingChest.value = true;
  try {
    const res = await axios.post('/api/boss/open-legendary-chest');
    chestReward.value = res.data;
    reelItems.value = res.data.reel_items;
    showChestModal.value = true;
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Error al abrir cofre legendario', 'error');
  } finally {
    openingChest.value = false;
  }
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
  let filtered = inventory.value;
  
  if (activeTab.value === 'combat') {
    filtered = filtered.filter(i => !i.is_customizable);
  } else {
    filtered = filtered.filter(i => i.is_customizable);
  }

  // Category filter
  if (activeStashTab.value !== 'all') {
    // Direct type match (head, weapon, etc)
    filtered = filtered.filter(i => i.type === activeStashTab.value);
  }

  // Rarity filter
  if (selectedRarity.value !== 'all') {
    filtered = filtered.filter(i => {
      const r = i.rarity?.toLowerCase() || 'common';
      const target = selectedRarity.value;
      if (target === 'especial') return r === 'especial' || r === 'epic';
      return r === target;
    });
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
    
    // Refresh stats to show immediate impact in Armory Dashboard
    await authStore.fetchProfile();
    await fetchStats();
    
    notificationStore.notify(alreadyEquipped ? 'Deactivated' : 'Activated', 'success');
  } catch (err) { notificationStore.notify('Activation error', 'error'); }
};

const handleActivate = async (item) => {
  try {
    const res = await axios.post(`/api/shop/activate/${item.id}`);
    notificationStore.notify(res.data.message, 'success');
    await fetchInventory();
    await authStore.fetchProfile();
    await fetchStats(); // Refresh combat stats for immediate feedback
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
    case 'common': return i18n.t('rarity_common');
    case 'rare': return i18n.t('rarity_rare');
    case 'epic':
    case 'especial': return i18n.t('rarity_special');
    case 'legendary': return i18n.t('rarity_legendary');
    case 'calistenico': return i18n.t('rarity_calisthenic');
    default: return i18n.t('rarity_common');
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
  return (authStore.user?.boss_chests > 0 || authStore.user?.legendary_chests > 0 || authStore.user?.has_new_inventory);
});

onMounted(async () => {
  await Promise.all([fetchInventory(), authStore.fetchProfile(), fetchStats()]);
  
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

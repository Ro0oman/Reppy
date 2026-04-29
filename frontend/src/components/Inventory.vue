<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-in relative z-10 pb-32">
    <!-- Premium Armory Header -->
    <div class="relative py-8">
      <div class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <h1 class="text-[120px] font-black tracking-tighter uppercase italic select-none">{{ i18n.t('inv_title') }}</h1>
      </div>
      <div class="text-center space-y-4 relative z-10">
        <h1 class="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic leading-none">
          {{ i18n.t('inv_title') }}
        </h1>
        <div class="flex items-center justify-center gap-4">
          <router-link :to="{ name: 'codex' }" class="flex items-center gap-2 bg-surface/10 hover:bg-surface/20 border border-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-muted hover:text-foreground">
            <BookOpen class="w-4 h-4 text-primary-500" />
            {{ i18n.t('nav_codex') }}
          </router-link>
        </div>
      </div>
    </div>
    <!-- Tabs Navigation (Redesigned for separation) -->
    <div class="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-8">
      <button @click="activeTab = 'combat'; activeStashTab = 'all'; playZip()" 
              class="flex-1 sm:flex-none px-4 md:px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border outline-none whitespace-nowrap"
              :class="activeTab === 'combat' ? 'bg-primary-500 text-white border-primary-400 shadow-lg shadow-primary-500/20' : 'bg-surface/10 text-muted/60 border-white/5 hover:border-white/10 hover:text-foreground'">
        {{ i18n.t('inv_tab_combat') }}
      </button>
      <button @click="activeTab = 'customization'; activeStashTab = 'all'; playZip()" 
              class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border outline-none"
              :class="activeTab === 'customization' ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-surface/10 text-muted/60 border-white/5 hover:border-white/10 hover:text-foreground'">
        {{ i18n.t('inv_tab_customization') }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      <!-- LEFT PANEL: Character & Stats (lg:col-span-5) -->
      <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
        
        <!-- COMBAT SIDEBAR -->
        <div v-if="activeTab === 'combat'" class="space-y-6">
          <!-- Compact Stats Dashboard -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-6 rounded-[2rem] bg-surface/20 border border-white/5 relative overflow-hidden group hover:border-primary-500/40 transition-all duration-500 backdrop-blur-xl shadow-2xl">
              <div class="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent"></div>
              <p class="text-[9px] font-black text-primary-500 uppercase tracking-[0.3em] leading-none mb-2">{{ i18n.t('inv_total_power') }}</p>
              <div class="flex items-baseline gap-1">
                <span class="text-2xl font-black text-foreground italic tracking-tighter" :class="{ 'animate-bump': recentlyEquipped }">{{ combatStats.minDamage }}-{{ combatStats.maxDamage }}</span>
              </div>
              <Sword class="absolute -bottom-2 -right-2 w-12 h-12 text-white/5 rotate-12 group-hover:scale-110 transition-transform" />
            </div>

            <div class="p-6 rounded-[2rem] bg-surface/20 border border-white/5 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-500 backdrop-blur-xl shadow-2xl">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
              <p class="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] leading-none mb-2">{{ i18n.t('inv_crit_prob') }}</p>
              <span class="text-2xl font-black text-emerald-400 italic tracking-tighter" :class="{ 'animate-bump': recentlyEquipped }">{{ combatStats.critChance }}%</span>
              <Activity class="absolute -bottom-2 -right-2 w-12 h-12 text-white/5 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          <!-- Character Diagram (Sidebar Compact) -->
          <div class="relative w-full aspect-[4/5] max-w-[320px] mx-auto flex items-center justify-center bg-surface/5 rounded-[3rem] border border-white/5 backdrop-blur-3xl overflow-hidden">
             <!-- Background FX -->
             <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,69,0,0.05)_0%,transparent_70%)] animate-pulse"></div>
             
             <!-- Center Silhouette -->
             <div class="relative z-10 opacity-20 transform scale-125">
               <Users class="w-32 h-32 text-white" />
             </div>

             <!-- Helmet (Top) -->
             <div class="absolute top-8 left-1/2 -translate-x-1/2" :class="{ 'animate-pulse-fast scale-110': equippingSlot === 'head' }">
                <div @click="getEquippedItem('head') && openItemDetails(getEquippedItem('head'))"
                     class="w-20 h-20 relative group rounded-2xl bg-surface/40 border border-white/10 p-2 flex flex-col items-center justify-center gap-1 transition-all hover:bg-white/10 overflow-hidden cursor-pointer shadow-2xl backdrop-blur-xl">
                  <div class="absolute top-1 left-1.5 text-[5px] font-black text-muted/40 uppercase tracking-widest z-10">{{ i18n.t('inv_slot_helmet') }}</div>
                  <div v-if="getEquippedItem('head')" class="flex flex-col items-center gap-1 relative z-20">
                     <ItemIcon :name="getEquippedItem('head').svg_key" type="head" class-name="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
                     <span class="text-[6px] font-black text-foreground uppercase truncate w-16 text-center">{{ getEquippedItem('head').name }}</span>
                  </div>
                  <Construction v-else class="w-6 h-6 text-muted opacity-20" />
                  <div v-if="getEquippedItem('head')" class="absolute inset-0 rounded-2xl border border-primary-500/40 pointer-events-none"></div>
                </div>
             </div>
             
             <!-- Weapon (Left) -->
             <div class="absolute top-1/2 left-4 -translate-y-1/2" :class="{ 'animate-pulse-fast scale-110': equippingSlot === 'weapon' }">
               <div @click="getEquippedItem('weapon') && openItemDetails(getEquippedItem('weapon'))"
                    class="w-20 h-20 relative group rounded-2xl bg-surface/40 border border-white/10 p-2 flex flex-col items-center justify-center gap-1 transition-all hover:bg-white/10 overflow-hidden cursor-pointer shadow-2xl backdrop-blur-xl">
                 <div class="absolute top-1 left-1.5 text-[5px] font-black text-muted/40 uppercase tracking-widest z-10">{{ i18n.t('inv_slot_weapon') }}</div>
                 <div v-if="getEquippedItem('weapon')" class="flex flex-col items-center gap-1 relative z-20">
                    <ItemIcon :name="getEquippedItem('weapon').svg_key" type="weapon" class-name="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
                    <span class="text-[6px] font-black text-foreground uppercase truncate w-16 text-center">{{ getEquippedItem('weapon').name }}</span>
                 </div>
                 <Sword v-else class="w-6 h-6 text-muted opacity-20" />
                 <div v-if="getEquippedItem('weapon')" class="absolute inset-0 rounded-2xl border border-primary-500/40 pointer-events-none"></div>
               </div>
             </div>
             
             <!-- Armor (Right) -->
             <div class="absolute top-1/2 right-4 -translate-y-1/2" :class="{ 'animate-pulse-fast scale-110': equippingSlot === 'armor' }">
               <div @click="getEquippedItem('armor') && openItemDetails(getEquippedItem('armor'))"
                    class="w-20 h-20 relative group rounded-2xl bg-surface/40 border border-white/10 p-2 flex flex-col items-center justify-center gap-1 transition-all hover:bg-white/10 overflow-hidden cursor-pointer shadow-2xl backdrop-blur-xl">
                 <div class="absolute top-1 left-1.5 text-[5px] font-black text-muted/40 uppercase tracking-widest z-10">{{ i18n.t('inv_slot_armor') }}</div>
                 <div v-if="getEquippedItem('armor')" class="flex flex-col items-center gap-1 relative z-20">
                    <ItemIcon :name="getEquippedItem('armor').svg_key" type="armor" class-name="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
                    <span class="text-[6px] font-black text-foreground uppercase truncate w-16 text-center">{{ getEquippedItem('armor').name }}</span>
                 </div>
                 <Shield v-else class="w-6 h-6 text-muted opacity-20" />
                 <div v-if="getEquippedItem('armor')" class="absolute inset-0 rounded-2xl border border-primary-500/40 pointer-events-none"></div>
               </div>
             </div>

             <!-- Boots (Bottom) -->
             <div class="absolute bottom-8 left-1/2 -translate-x-1/2" :class="{ 'animate-pulse-fast scale-110': equippingSlot === 'boots' }">
               <div @click="getEquippedItem('boots') && openItemDetails(getEquippedItem('boots'))"
                    class="w-20 h-20 relative group rounded-2xl bg-surface/40 border border-white/10 p-2 flex flex-col items-center justify-center gap-1 transition-all hover:bg-white/10 overflow-hidden cursor-pointer shadow-2xl backdrop-blur-xl">
                 <div class="absolute top-1 left-1.5 text-[5px] font-black text-muted/40 uppercase tracking-widest z-10">{{ i18n.t('inv_slot_boots') }}</div>
                 <div v-if="getEquippedItem('boots')" class="flex flex-col items-center gap-1 relative z-20">
                    <ItemIcon :name="getEquippedItem('boots').svg_key" type="boots" class-name="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
                    <span class="text-[6px] font-black text-foreground uppercase truncate w-16 text-center">{{ getEquippedItem('boots').name }}</span>
                 </div>
                 <Footprints v-else class="w-6 h-6 text-muted opacity-20" />
                 <div v-if="getEquippedItem('boots')" class="absolute inset-0 rounded-2xl border border-primary-500/40 pointer-events-none"></div>
               </div>
             </div>
          </div>

          <!-- Base Stats Grid (Sidebar) -->
          <div class="p-6 rounded-[2rem] bg-surface/10 border border-white/5 backdrop-blur-xl">
             <p class="text-[9px] font-black text-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
               <span class="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
               {{ i18n.t('ui_base_attrs') }}
             </p>
             <div class="grid grid-cols-2 gap-2">
               <div v-for="(val, stat) in equippedStats" :key="stat" v-show="val > 0 && stat !== 'multiplier' && stat !== 'crit_chance' && stat !== 'crit_damage'" 
                    class="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-xl border border-white/5 transition-all hover:bg-white/[0.05]">
                 <span class="text-[8px] font-black text-muted/60 uppercase tracking-widest">{{ statLabels[stat] || stat }}</span>
                 <span class="text-xs font-black text-primary-500 tabular-nums" :class="{ 'animate-bump': recentlyEquipped }">+{{ val }}</span>
               </div>
             </div>
          </div>

          <!-- Modules (Compact Chests) -->
          <div v-if="authStore.user?.level_chests > 0 || authStore.user?.boss_chests > 0 || authStore.user?.legendary_chests > 0" class="space-y-2">
            <div v-if="authStore.user?.legendary_chests > 0" @click="handleOpenLegendaryChest"
                 class="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 group cursor-pointer hover:bg-amber-500/20 transition-all">
              <div class="flex items-center gap-3">
                <Trophy class="w-5 h-5 text-amber-500" />
                <span class="text-[10px] font-black text-amber-400 uppercase tracking-widest">{{ authStore.user.legendary_chests }} {{ i18n.t('inv_vault_legendary') }}</span>
              </div>
              <Sparkles class="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
            <div v-if="authStore.user?.epic_chests > 0" @click="handleOpenEpicChest"
                 class="flex items-center justify-between p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 group cursor-pointer hover:bg-purple-500/20 transition-all">
              <div class="flex items-center gap-3">
                <Archive class="w-5 h-5 text-purple-500" />
                <span class="text-[10px] font-black text-purple-400 uppercase tracking-widest">{{ authStore.user.epic_chests }} {{ i18n.t('inv_vault_epic') }}</span>
              </div>
              <Sparkles class="w-4 h-4 text-purple-500 animate-pulse" />
            </div>
            <div v-if="authStore.user?.level_chests > 0" @click="handleOpenLevelChest"
                 class="flex items-center justify-between p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 group cursor-pointer hover:bg-cyan-500/20 transition-all">
              <div class="flex items-center gap-3">
                <TrendingUp class="w-5 h-5 text-cyan-500" />
                <span class="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{{ authStore.user.level_chests }} {{ i18n.t('inv_vault_evolution') }}</span>
              </div>
              <ChevronRight class="w-4 h-4 text-cyan-500" />
            </div>
            <div v-if="authStore.user?.boss_chests > 0" @click="handleOpenChest"
                 class="flex items-center justify-between p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 group cursor-pointer hover:bg-primary-500/20 transition-all">
              <div class="flex items-center gap-3">
                <Archive class="w-5 h-5 text-primary-500" />
                <span class="text-[10px] font-black text-primary-400 uppercase tracking-widest">{{ authStore.user.boss_chests }} {{ i18n.t('inv_vault_decrypted') }}</span>
              </div>
              <Sparkles class="w-4 h-4 text-primary-500 animate-pulse" />
            </div>
          </div>
        </div>

        <!-- CUSTOMIZATION SIDEBAR -->
        <div v-if="activeTab === 'customization'" class="space-y-6">
           <div class="p-8 rounded-[3rem] bg-surface/10 border border-white/5 backdrop-blur-xl text-center space-y-6">
              <div class="relative inline-block">
                <AvatarFrame :src="authStore.user?.avatar_url" :border-css="authStore.user?.border_css" :size="120" />
                <div class="absolute -bottom-2 inset-x-0">
                  <span v-if="authStore.user?.title_name" class="px-4 py-1.5 rounded-full bg-surface/90 border border-white/10 text-[10px] font-black uppercase italic tracking-tighter" :class="authStore.user?.title_css">
                    {{ authStore.user?.title_name }}
                  </span>
                </div>
              </div>
              <div class="space-y-1">
                <h3 class="text-2xl font-black text-white italic tracking-tighter uppercase">{{ authStore.user?.username }}</h3>
                <p class="text-[9px] font-black text-muted uppercase tracking-[0.4em]">{{ i18n.t('inv_loadout_identity') }}</p>
              </div>
           </div>

           <div class="grid grid-cols-2 gap-3">
             <div v-for="slot in loadoutSlots" :key="slot.type" 
                  @click="getEquippedItem(slot.type) && openItemDetails(getEquippedItem(slot.type))"
                  class="p-4 rounded-2xl bg-surface/10 border border-white/5 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-white/5 transition-all">
                <component :is="slot.icon" class="w-5 h-5 text-muted/40 group-hover:text-purple-400 transition-colors" />
                <span class="text-[7px] font-black text-muted uppercase tracking-widest">{{ slot.label }}</span>
                <div v-if="getEquippedItem(slot.type)" class="w-full h-1 bg-purple-500/40 rounded-full mt-1"></div>
             </div>
           </div>
        </div>
      </div>

      <!-- RIGHT PANEL: Item Stash (lg:col-span-7) -->
      <div class="lg:col-span-7 space-y-8">
        
        <!-- Nexus Item Stash Header & Filters -->
        <div class="bg-surface/10 rounded-[2.5rem] border border-white/5 backdrop-blur-xl p-6 md:p-8">
          <div class="flex flex-col md:flex-row items-center gap-6 mb-8">
            <!-- Categories Dropdown -->
            <div class="w-full md:w-64 relative z-50">
              <button @click="showDropdown = !showDropdown"
                      class="flex items-center gap-3 px-6 py-4 bg-surface/40 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary-500/30 transition-all w-full justify-between shadow-lg">
                <div class="flex items-center gap-2">
                  <component :is="categories.find(c => c.id === activeStashTab)?.icon || Archive" class="w-4 h-4 text-primary-500" />
                  <span class="text-foreground">{{ i18n.t(categories.find(c => c.id === activeStashTab)?.label) || categories.find(c => c.id === activeStashTab)?.label }}</span>
                </div>
                <ChevronDown class="w-4 h-4 text-muted transition-transform" :class="{ 'rotate-180': showDropdown }" />
              </button>

              <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0 -translate-y-2" enter-to-class="transform scale-100 opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100 translate-y-0" leave-to-class="transform scale-95 opacity-0 -translate-y-2">
                <div v-if="showDropdown" class="absolute top-full left-0 mt-2 w-full bg-surface/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-[60]">
                  <button v-for="cat in categories" :key="cat.id" @click="activeStashTab = cat.id; showDropdown = false"
                          class="w-full flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all text-left"
                          :class="activeStashTab === cat.id ? 'bg-primary-500 text-white' : 'text-muted hover:bg-white/5 hover:text-foreground'">
                    <component :is="cat.icon" class="w-3.5 h-3.5" />
                    {{ i18n.t(cat.label) }}
                  </button>
                </div>
              </Transition>
            </div>

            <!-- Rarity Selector -->
            <div class="flex-1 flex flex-wrap items-center justify-center md:justify-end gap-2">
              <button v-for="rarity in rarities" :key="rarity.id" @click="selectedRarity = rarity.id"
                      class="px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95"
                      :class="selectedRarity === rarity.id ? rarity.activeClass : 'bg-surface/20 border-white/5 text-muted hover:border-white/20'">
                {{ i18n.t(rarity.label) }}
              </button>
            </div>
          </div>

          <!-- Stash Inventory Grid -->
          <div v-if="loading" class="py-24 flex flex-col items-center justify-center gap-4">
             <div class="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
             <p class="text-[10px] font-black text-muted uppercase tracking-[0.4em] animate-pulse">{{ i18n.t('inv_sync_stash') }}</p>
          </div>

          <div v-else-if="inventory.length === 0" class="py-24 text-center space-y-6">
            <Package class="w-16 h-16 mx-auto text-muted/20" />
            <h3 class="text-xl font-black uppercase italic text-muted/40 tracking-tighter">{{ i18n.t('inv_empty_title') }}</h3>
          </div>

          <div v-else class="space-y-12">
            <div v-for="(items, type) in groupedItems" :key="type" class="space-y-6">
              <!-- Category Separator -->
              <div class="flex items-center gap-4">
                <span class="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] whitespace-nowrap">{{ i18n.t('ui_' + type) || type }}</span>
                <div class="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
              </div>

              <!-- Compact Item Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <div v-for="item in items" :key="item.id" 
                  @mouseenter="markSeen(item)"
                  class="nexus-item group relative flex flex-col min-h-[180px] rounded-[1.5rem] border transition-all duration-300" 
                  :class="[
                    getCardClass(item)
                  ]">
                     <!-- Item Preview -->
                     <div class="relative h-28 flex items-center justify-center p-4 bg-black/40 rounded-t-2xl cursor-pointer overflow-hidden" @click="openItemDetails(item)">
                        <div class="absolute inset-x-0 h-px bg-primary-500/20 top-0 group-hover:top-full transition-all duration-[1.5s] ease-linear pointer-events-none z-10"></div>
                        
                        <div class="transform group-hover:scale-110 transition-transform duration-500">
                          <ItemIcon v-if="['head', 'weapon', 'armor', 'boots', 'consumable'].includes(item.type)" :name="item.svg_key" :type="item.type" class-name="w-12 h-12 text-primary-500" />
                          <div v-else-if="item.type === 'title'" class="text-[10px] font-black italic uppercase" :class="item.css_value">{{ item.name }}</div>
                          <AvatarFrame v-else-if="item.type === 'border'" :src="authStore.user?.avatar_url" :border-css="item.css_value" :size="50" />
                          <div v-else-if="item.type === 'background'" class="w-full h-full absolute inset-0"><BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0" /></div>
                          <Package v-else class="w-10 h-10 text-muted/40" />
                        </div>

                        <div v-if="item.is_new" class="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-primary-500 text-[6px] font-black text-white uppercase tracking-widest animate-pulse border border-white/20 z-10">NEW</div>
                        <div v-if="isUpgrade(item)" class="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[6px] font-black uppercase tracking-widest rounded shadow-lg animate-pulse z-10">
                           {{ i18n.t('shop_upgrade_badge') || 'MEJORA' }}
                        </div>
                     </div>

                     <!-- Item Details -->
                     <div class="p-3 bg-surface/60 border-t border-white/5 flex-1 flex flex-col justify-between">
                        <div>
                          <div class="flex items-center justify-between mb-1.5">
                             <span class="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border" :class="getRarityClass(item.rarity)">{{ getRarityLabel(item.rarity) }}</span>
                             <Check v-if="isEquipped(item)" class="w-3 h-3 text-blue-500" />
                          </div>
                          <h4 class="text-[10px] font-black text-foreground truncate uppercase tracking-wide mb-1">{{ item.name }}</h4>
                          <div v-if="item.stats" class="flex flex-wrap gap-1">
                             <span v-for="(val, stat) in item.stats" :key="stat" v-show="val > 0 && stat !== 'duration' && stat !== 'multiplier'" class="text-[7px] font-black text-primary-500/80 uppercase">+{{ val }} {{ statLabels[stat] || stat }}</span>
                          </div>
                        </div>

                        <button @click.stop="toggleEquip(item)"
                                class="mt-3 w-full py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all active:scale-95"
                                :class="isEquipped(item) ? 'bg-blue-500 text-white' : 'bg-white/5 text-muted hover:bg-white/10 hover:text-primary-500 border border-white/10'">
                           {{ isEquipped(item) ? i18n.t('btn_on') : i18n.t('btn_equip') }}
                        </button>
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
    <!-- Item Details Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showItemModal && selectedItem" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/90 backdrop-blur-2xl" @click="showItemModal = false"></div>
          
          <!-- Modal Content -->
          <div class="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.9)] animate-modal-in flex flex-col max-h-[90vh]">
            
            <!-- Modal Header -->
            <div class="p-6 md:p-8 pb-4 flex items-center justify-between shrink-0 relative z-10">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                  <Package class="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p class="text-[9px] font-black text-primary-500 uppercase tracking-[0.3em] leading-none mb-1.5">{{ i18n.t('inv_artifact_detail') }}</p>
                  <h3 class="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{{ selectedItem.name }}</h3>
                </div>
              </div>
              <button @click="showItemModal = false" class="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all">
                <X class="w-5 h-5 text-muted" />
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <div class="p-6 md:p-8 pt-0 space-y-8 flex-1 overflow-y-auto no-scrollbar relative z-10">
              <!-- Visual Preview Area -->
              <div class="aspect-video bg-black/40 rounded-[22px] border border-white/5 flex items-center justify-center relative overflow-hidden group shadow-inner">
                 <!-- Background Glow -->
                 <div class="absolute inset-0 blur-3xl opacity-20 pointer-events-none" :class="getRarityClass(selectedItem.rarity).split(' ')[0].replace('text-', 'bg-')"></div>
                 
                 <div class="transform group-hover:scale-110 transition-transform duration-1000">
                    <ItemIcon v-if="['head', 'weapon', 'armor', 'boots'].includes(selectedItem.type)" :name="selectedItem.svg_key" :type="selectedItem.type" class-name="w-24 h-24 sm:w-32 sm:h-32 text-primary-500 drop-shadow-2xl" />
                    <FlaskConical v-else-if="selectedItem.type === 'consumable'" class="w-24 h-24 sm:w-32 sm:h-32 text-primary-500 animate-pulse drop-shadow-2xl" />
                    <div v-else-if="selectedItem.type === 'title'" class="text-xl sm:text-4xl font-black uppercase italic tracking-tighter text-center px-6 leading-tight" :class="selectedItem.css_value">{{ selectedItem.name }}</div>
                    <AvatarFrame v-else-if="selectedItem.type === 'border'" :src="authStore.user?.avatar_url" :border-css="selectedItem.css_value" :size="windowWidth < 640 ? 120 : 180" />
                    <div v-else-if="selectedItem.type === 'background' || selectedItem.type === 'post_background'" class="w-40 h-40 sm:w-56 sm:h-56 rounded-[22px] overflow-hidden border border-white/10 relative shadow-2xl">
                       <BackgroundEffect v-if="selectedItem.type === 'background'" :background-css="selectedItem.css_value" is-preview class="!absolute !inset-0 !w-full !h-full" />
                       <div v-else :class="selectedItem.css_value" class="absolute inset-0"></div>
                    </div>
                    <Package v-else class="w-24 h-24 text-primary-500" />
                 </div>
              </div>

              <!-- Info & Stats -->
              <div class="space-y-6">
                <div v-if="selectedItem.description" class="p-6 bg-white/5 rounded-[22px] border border-white/5">
                  <p class="text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-2 opacity-60">{{ i18n.t('inv_artifact_description') }}</p>
                  <p class="text-sm font-bold text-zinc-300 leading-relaxed">{{ selectedItem.description }}</p>
                </div>

                <div v-if="selectedItem.stats && Object.keys(selectedItem.stats).length > 0" class="space-y-4">
                   <h4 class="text-[9px] font-black text-muted uppercase tracking-[0.3em] flex items-center gap-3">
                     {{ i18n.t('shop_combat_analysis') }}
                     <div class="h-px flex-1 bg-white/5"></div>
                   </h4>
                   <div class="grid grid-cols-2 gap-4">
                    <div v-for="(val, key) in selectedItem.stats" :key="key" class="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1">
                      <p class="text-[8px] font-black text-primary-500/60 uppercase tracking-widest">{{ statLabels[key] || key.replace('_', ' ') }}</p>
                      <p class="text-xl font-black text-white italic tabular-nums">
                        {{ key === 'multiplier' ? 'x' : '+' }}{{ val }}{{ key.includes('percent') || key.includes('chance') ? '%' : '' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Rarity Section -->
                <div class="flex items-center justify-between p-6 bg-white/5 rounded-[22px] border border-white/5">
                  <div class="flex items-center gap-3">
                    <Sparkles class="w-4 h-4 text-muted" />
                    <span class="text-[10px] font-black text-muted uppercase tracking-widest">{{ i18n.t('inv_artifact_rarity') }}</span>
                  </div>
                  <span class="px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-lg" :class="getRarityClass(selectedItem.rarity)">
                    {{ getRarityLabel(selectedItem.rarity) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Modal Footer (Fixed) -->
            <div class="p-6 md:p-8 bg-black/60 border-t border-white/10 shrink-0 relative z-10">
              <div class="flex flex-col sm:flex-row gap-4">
                <button v-if="selectedItem.type === 'consumable'" 
                  @click="handleActivate(selectedItem); showItemModal = false"
                  :disabled="isPotionTypeActive(selectedItem)"
                  class="flex-1 py-5 rounded-[22px] bg-primary-500 text-white font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary-500/20 active:scale-95 disabled:opacity-40 disabled:grayscale">
                  {{ isPotionTypeActive(selectedItem) ? i18n.t('inv_already_active') : i18n.t('inv_activate_module') }} (x{{ selectedItem.quantity || 1 }})
                </button>
                <button v-else-if="selectedItem.type !== 'bundle'" @click="toggleEquip(selectedItem); showItemModal = false"
                  class="flex-1 py-5 rounded-[22px] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                  :class="isEquipped(selectedItem) ? 'bg-white/5 text-muted border border-white/10' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30'">
                  {{ isEquipped(selectedItem) ? i18n.t('inv_unlink_artifact') : i18n.t('inv_link_artifact') }}
                  <component :is="isEquipped(selectedItem) ? X : Check" class="w-4 h-4" />
                </button>
                <button @click="showItemModal = false" class="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[22px] text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all active:scale-95">
                  {{ i18n.t('inv_close') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
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
  Package, Frame, Type, Check, Sparkles, Archive, TrendingUp, 
  Dumbbell, Sword, Heart, Brain, Church, Trophy, ExternalLink, Activity, X, 
  ChevronDown, Flame, BookOpen, Swords, Info, ChevronRight, Users, Shield, Footprints,
  FlaskConical, Timer, Construction
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useShopStore } from '../stores/shop';
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
const shopStore = useShopStore();
const i18n = useI18nStore();
const emit = defineEmits(['start', 'viewProfile']);
const notificationStore = useNotificationStore();
const inventory = computed(() => shopStore.inventory);
const loading = computed(() => shopStore.loading);
const currentTime = ref(new Date());
const equippingSlot = ref(null);
const recentlyEquipped = ref(false);
let timerInterval = null;

function isUpgrade(item, specificStat = null) {
  if (!item) return false;
  
  // Ensure stats are parsed
  let stats = item.stats;
  if (typeof stats === 'string') {
    try { stats = JSON.parse(stats); } catch (e) { stats = {}; }
  }
  if (!stats || Object.keys(stats).length === 0) return false;

  const equipped = getEquippedItem(item.type);
  if (!equipped) return true; // If nothing equipped, it's an upgrade

  let equippedStats = equipped.stats;
  if (typeof equippedStats === 'string') {
    try { equippedStats = JSON.parse(equippedStats); } catch (e) { equippedStats = {}; }
  }
  
  if (specificStat) {
    const newVal = stats[specificStat] || 0;
    const oldVal = equippedStats?.[specificStat] || 0;
    return newVal > oldVal;
  }
  
  // Global check: is ANY stat better?
  return Object.entries(stats).some(([stat, val]) => {
    if (stat === 'duration' || stat === 'multiplier') return false;
    const oldVal = equippedStats?.[stat] || 0;
    return val > oldVal;
  });
}

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
      { id: 'head', label: 'shop_cat_head', icon: Construction },
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
  pwr: 'Potencia',
  end: 'Resistencia',
  agi: 'Agilidad',
  vig: 'Vigor',
  dex: 'Destreza',
  int: 'Inteligencia',
  fth: 'Fe',
  cha: 'Carisma',
  multiplier: 'Multiplicador',
  crit_chance: 'Prob. Crítica',
  crit_damage: 'Daño Crítico',
  duration: 'Duración'
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
  { type: 'head', label: i18n.t('inv_slot_helmet') || 'HELMET', icon: Construction }, // Using Construction for Helmet
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

function getEquippedItem(type) {
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
}

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
    links: [{ label: i18n.locale === 'es' ? 'ENTRENAR FUERZA' : 'TRAIN STRENGTH', to: '/?exercise=weighted_pullups', icon: Construction }]
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

const handleOpenEpicChest = async () => {
  if (openingChest.value || authStore.user.epic_chests <= 0) return;
  openingChest.value = true;
  try {
    const res = await axios.post('/api/boss/open-epic-chest');
    chestReward.value = res.data;
    reelItems.value = res.data.reel_items;
    showChestModal.value = true;
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Error al abrir cofre épico', 'error');
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
    await shopStore.fetchInventory(true);
  } catch (err) { console.error('Inventory sync error:', err); }
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
  const id = item.item_id || item.id;
  if (item.type === 'head') return authStore.user?.equipped_head_id === id;
  if (item.type === 'weapon') return authStore.user?.equipped_weapon_id === id;
  if (item.type === 'armor') return authStore.user?.equipped_armor_id === id;
  if (item.type === 'boots') return authStore.user?.equipped_boots_id === id;
  if (item.type === 'title') return authStore.user?.equipped_title_id === id;
  if (item.type === 'border') return authStore.user?.equipped_border_id === id;
  if (item.type === 'background') return authStore.user?.equipped_background_id === id;
  if (item.type === 'post_background') return authStore.user?.equipped_post_background_id === id;
  if (item.type === 'avatar') return authStore.user?.equipped_avatar_id === id;
  return false;
};

const toggleEquip = async (item) => {
  const alreadyEquipped = isEquipped(item);
  const realId = item.item_id || item.id;
  const targetId = alreadyEquipped ? 0 : realId;
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
    
    // TACTILE FEEDBACK LOGIC
    equippingSlot.value = item.type;
    recentlyEquipped.value = true;
    setTimeout(() => {
      equippingSlot.value = null;
      recentlyEquipped.value = false;
    }, 400);

    // Refresh stats to show immediate impact in Armory Dashboard
    await authStore.fetchProfile();
    await fetchStats();
    
    notificationStore.notify(alreadyEquipped ? 'Deactivated' : 'Activated', 'success');
  } catch (err) { notificationStore.notify('Activation error', 'error'); }
};

const handleActivate = async (item) => {
  try {
    const realId = item.item_id || item.id;
    const res = await axios.post(`/api/shop/activate/${realId}`);
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

const getCardClass = (item) => {
  const r = item.rarity?.toLowerCase();
  if (isEquipped(item)) return 'ring-2 ring-blue-500 border-transparent bg-blue-500/5 cursor-pointer';
  if (!item.is_unlocked) return 'opacity-60 grayscale';

  if (r === 'legendary') return 'border-yellow-400 bg-yellow-400/5 cursor-pointer';
  if (r === 'epic' || r === 'especial') return 'border-purple-500/50 bg-purple-500/5 cursor-pointer';
  if (r === 'rare') return 'border-blue-500/50 bg-blue-500/5 cursor-pointer';
  if (r === 'calistenico') return 'border-[#ccff00]/50 bg-[#ccff00]/5 cursor-pointer';
  return 'border-gray-700 opacity-80 bg-background/20 cursor-pointer';
};

const getRarityClass = (rarity) => {
  const r = rarity?.toLowerCase() || 'common';
  let finalR = r;
  if (r === 'epic') finalR = 'especial';
  return `rarity-${finalR}`;
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
.nexus-item {
  cursor: pointer;
  background: rgba(20, 20, 20, 0.4);
  backdrop-filter: blur(20px);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.nexus-item:hover {
  transform: translateY(-5px);
  background: rgba(30, 30, 30, 0.6);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}



/* Rarity Effects */
.rarity-common { --item-glow: rgba(148, 163, 184, 0.3); }
.rarity-rare { --item-glow: rgba(96, 165, 250, 0.3); }
.rarity-especial { --item-glow: rgba(168, 85, 247, 0.3); }
.rarity-legendary { --item-glow: rgba(245, 158, 11, 0.4); }
.rarity-calistenico { --item-glow: rgba(204, 255, 0, 0.5); }

/* Animations */
@keyframes bump {
  0% { transform: scale(1); }
  50% { transform: scale(1.4) translateY(-2px); color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.8); }
  100% { transform: scale(1); }
}
.animate-bump {
  animation: bump 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pulse-fast {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 transparent; }
  50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(255,69,0,0.8); }
}
.animate-pulse-fast {
  animation: pulse-fast 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

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
:deep(.nexus-item h4) {
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

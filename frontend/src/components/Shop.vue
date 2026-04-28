<template>
  <div class="shop-page-wrapper">
    <div class="max-w-7xl mx-auto px-4 py-12 animate-in relative z-10">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
      <div>
        <h1 class="text-4xl font-black text-industrial tracking-tighter text-foreground">
          {{ i18n.t('shop_armory_title') }}<span class="text-primary-500">.</span>
        </h1>
        <p class="text-muted mt-2 font-bold uppercase tracking-widest text-[10px]">{{ i18n.t('shop_armory_subtitle') }}</p>
      </div>
      
      <!-- Currency Display (Precision Pills) -->
      <div class="flex items-center gap-4">
        <!-- Coins -->
        <div class="flex items-center gap-4 bg-surface/40 px-6 py-4 rounded-2xl border border-border shadow-2xl backdrop-blur-xl group hover:border-primary-500/30 transition-all">
          <div class="p-2 bg-primary-500/10 rounded-lg transition-transform">
            <Coins class="w-5 h-5 text-primary-500" />
          </div>
          <div class="flex flex-col">
            <span data-testid="reppy-coins" class="text-3xl font-black text-precision text-foreground tracking-tighter leading-none">{{ authStore.user?.reppy_coins || 0 }}</span>
            <span class="text-[8px] uppercase tracking-[0.3em] text-primary-500/70 font-black mt-1">{{ i18n.t('shop_reppy_coins') }}</span>
          </div>
        </div>
        <!-- Gems -->
        <div class="flex items-center gap-4 bg-surface/40 px-6 py-4 rounded-2xl border border-border shadow-2xl backdrop-blur-xl group hover:border-emerald-500/30 transition-all">
          <div class="p-2 bg-emerald-500/10 rounded-lg transition-transform">
            <Diamond class="w-5 h-5 text-emerald-500" />
          </div>
          <div class="flex flex-col">
            <span class="text-3xl font-black text-precision text-foreground tracking-tighter leading-none">{{ authStore.user?.reppy_gems || 0 }}</span>
            <span class="text-[8px] uppercase tracking-[0.3em] text-emerald-500/70 font-black mt-1">{{ i18n.t('shop_reppy_gems') || 'REPPY_GEMS' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="space-y-16">
      <div class="flex flex-col items-center justify-center py-24 gap-4 animate-skeleton">
        <div class="w-16 h-16 bg-foreground/10 rounded-2xl"></div>
        <div class="h-4 w-48 bg-foreground/10 rounded"></div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div v-for="i in 10" :key="'skeleton-' + i" class="h-64 bg-surface/40 border border-border rounded-[2rem] animate-skeleton"></div>
      </div>
    </div>
    
    <div v-else class="space-y-16">
      <!-- Tabs Navigation (Separation Filter) -->
      <div class="flex items-center justify-center gap-4 mb-8">
        <button @click="activeTab = 'combat'; selectedCategory = 'all'" 
                class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border"
                :class="activeTab === 'combat' ? 'bg-primary-500 text-white border-primary-400 shadow-lg shadow-primary-500/20' : 'bg-surface/20 text-muted border-white/5 hover:border-white/10'">
          {{ i18n.t('inv_tab_combat') || 'SISTEMA_DE_COMBATE' }}
        </button>
        <button @click="activeTab = 'customization'; selectedCategory = 'all'" 
                class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border"
                :class="activeTab === 'customization' ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-surface/20 text-muted border-white/5 hover:border-white/10'">
          {{ i18n.t('inv_tab_customization') || 'IDENTITY_STASH' }}
        </button>
      </div>

      <!-- Modern Filters Interface (Grid Layout) -->
      

      <!-- Bundle Details Modal (Enhanced) -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 backdrop-blur-0"
    enter-to-class="opacity-100 backdrop-blur-xl"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 backdrop-blur-xl"
    leave-to-class="opacity-0 backdrop-blur-0"
  >
    <div v-if="showBundleModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <div 
        @click.stop
        class="bg-surface/90 border border-white/10 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
      >
        <!-- Close Button -->
        <button 
          @click="showBundleModal = false"
          class="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all z-50 group"
        >
          <X class="w-6 h-6 text-muted group-hover:text-foreground transition-colors" />
        </button>

        <div class="flex flex-col lg:flex-row h-full">
          <!-- Left: Bundle Preview -->
          <div class="lg:w-1/3 p-8 bg-gradient-to-br border-r border-white/5 flex flex-col items-center justify-center gap-6" :class="getBundleBgClass(selectedBundle?.rarity)">
            <div class="p-8 rounded-[3rem] border shadow-2xl" :class="[getBundleBorderClass(selectedBundle?.rarity), getBundleBgClass(selectedBundle?.rarity)]">
              <LayoutGrid class="w-24 h-24" :class="getBundleTextClass(selectedBundle?.rarity)" />
            </div>
            <div class="text-center">
              <h2 class="text-3xl font-black text-industrial tracking-tighter" :class="getBundleTextClass(selectedBundle?.rarity)">{{ selectedBundle?.name }}</h2>
              <span class="text-[10px] font-black uppercase tracking-[0.3em] mt-2 block" :class="getBundleTextClass(selectedBundle?.rarity, 0.6)">PACK {{ getRarityBadge(selectedBundle).label }}</span>
            </div>
            <div class="flex items-center gap-4 px-6 py-4 border rounded-2xl w-full" :class="[getBundleBorderClass(selectedBundle?.rarity), getBundleBgClass(selectedBundle?.rarity)]">
              <div class="flex flex-col flex-1">
                <span class="text-[8px] font-black uppercase tracking-widest" :class="getBundleTextClass(selectedBundle?.rarity, 0.5)">{{ i18n.t('shop_bundle_value') }}</span>
                <span class="text-2xl font-black tabular-nums" :class="getBundleTextClass(selectedBundle?.rarity)">{{ selectedBundle?.price }} RC</span>
              </div>
              <div class="px-3 py-1.5 text-black text-[9px] font-black rounded-lg" :class="getBundleBgClass(selectedBundle?.rarity).split(' ')[1].replace('/10', '')">
                30% OFF
              </div>
            </div>
          </div>

          <!-- Right: Bundle Items -->
          <div class="flex-1 p-8 overflow-y-auto no-scrollbar">
            <h3 class="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-8">{{ i18n.t('shop_bundle_contents') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="item in selectedBundleItems" 
                :key="item.id"
                @click="openItemDetails(item)"
                class="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-3xl hover:border-white/20 transition-all cursor-pointer group"
              >
                <div class="p-3 bg-foreground/5 rounded-2xl group-hover:scale-110 transition-transform" :class="getRarityBadge(item).classes">
                  <ItemIcon :name="item.svg_key" :type="item.type" class-name="w-6 h-6" />
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-black text-foreground">{{ item.name }}</span>
                  <span class="text-[9px] font-black uppercase tracking-widest" :class="getRarityBadge(item).classes.split(' ')[0]">{{ item.type }}</span>
                </div>
                <ChevronRight class="w-4 h-4 text-muted ml-auto" />
              </div>
            </div>

            <div class="mt-12 flex gap-4">
              <button 
                @click="buyItem(selectedBundle); showBundleModal = false"
                :disabled="!canAfford(selectedBundle) || buying || selectedBundle?.owned"
                class="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black py-5 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all disabled:opacity-20 shadow-2xl shadow-yellow-500/20 active:scale-95"
              >
                {{ selectedBundle?.owned ? i18n.t('btn_acquired') : i18n.t('shop_initiate_acquisition') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Item Details Modal (Comparison) -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="showItemModal" class="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-2xl">
      <div 
        @click.stop
        class="bg-surface/90 border border-white/10 w-full max-w-2xl rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden relative p-6 sm:p-10 max-h-[95vh] overflow-y-auto no-scrollbar"
      >
        <button 
          @click="showItemModal = false"
          class="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group z-20"
        >
          <X class="w-5 h-5 text-muted group-hover:text-foreground" />
        </button>

        <div class="flex flex-col gap-6 sm:gap-8">
          <div class="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div class="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br border shadow-2xl flex-shrink-0" :class="getRarityBadge(selectedItem).classes">
              <ItemIcon :name="selectedItem?.svg_key" :type="selectedItem?.type" class-name="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <div class="flex-1 text-center sm:text-left">
              <span class="px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border mb-2 sm:mb-3 inline-block" :class="getRarityBadge(selectedItem).classes">
                {{ getRarityBadge(selectedItem).label }}
              </span>
              <h2 class="text-2xl sm:text-3xl font-black text-industrial tracking-tighter text-foreground">{{ selectedItem?.name }}</h2>
              <p class="text-[11px] sm:text-sm text-muted mt-2 leading-relaxed">{{ selectedItem?.description }}</p>
            </div>
          </div>

          <!-- Stats Comparison -->
          <div class="grid grid-cols-1 gap-3 sm:gap-4">
            <h3 class="text-[9px] sm:text-[10px] font-black text-muted uppercase tracking-[0.4em]">{{ i18n.t('shop_combat_analysis') }}</h3>
            <div class="space-y-2 sm:space-y-3">
              <div v-for="(val, stat) in selectedItem?.stats" :key="stat" class="flex items-center justify-between p-4 sm:p-5 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl">
                <div class="flex items-center gap-3 sm:gap-4">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 bg-foreground/5 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-[10px] sm:text-xs uppercase">{{ statLabels[stat] || stat }}</div>
                  <span class="text-[11px] sm:text-sm font-black text-foreground uppercase tracking-widest">{{ statLabels[stat] || stat }}</span>
                </div>
                <div class="flex items-center gap-3 sm:gap-4">
                  <span class="text-lg sm:text-xl font-black text-foreground tabular-nums">
                    {{ stat === 'duration' ? formatDuration(val) : (stat === 'multiplier' ? 'x' + val : (stat.includes('bonus') ? '+' + val : '+' + val)) }}
                  </span>
                  <!-- Comparison -->
                  <div v-if="stat !== 'duration' && stat !== 'multiplier' && getStatDiff(stat, val) !== 0" class="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black" :class="getStatDiff(stat, val) > 0 ? 'text-neon-lime bg-neon-lime/10' : 'text-red-500 bg-red-500/10'">
                    <component :is="getStatDiff(stat, val) > 0 ? ChevronUp : ChevronDown" class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {{ Math.abs(getStatDiff(stat, val)) }}
                  </div>
                  <div v-else-if="stat !== 'duration' && stat !== 'multiplier'" class="text-[9px] sm:text-[10px] font-black text-muted opacity-30">{{ i18n.t('shop_stat_equal') }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between gap-6 mt-4 p-6 bg-black/40 rounded-[2rem] border border-white/5">
            <div class="flex flex-col gap-2">
              <span class="text-[9px] font-black text-muted uppercase tracking-[0.2em]">{{ i18n.t('shop_acquisition_cost') }}</span>
              <div class="flex flex-col gap-1">
                <div v-if="selectedItem?.price > 0" class="flex items-center gap-2">
                  <span class="text-3xl font-black text-primary-500 tabular-nums leading-none">{{ selectedItem?.price }}</span>
                  <span class="text-[10px] font-black text-muted uppercase tracking-widest">RC</span>
                </div>
                <div v-if="selectedItem?.price_gems > 0" class="flex items-center gap-2">
                  <span class="text-3xl font-black text-emerald-500 tabular-nums leading-none">{{ selectedItem?.price_gems }}</span>
                  <span class="text-[10px] font-black text-muted uppercase tracking-widest">GEM</span>
                </div>
              </div>
            </div>

            <button 
              @click="buyItem(selectedItem); showItemModal = false"
              :disabled="!canAfford(selectedItem) || buying || selectedItem?.owned"
              class="w-full sm:w-auto px-10 py-5 bg-primary-500 hover:bg-primary-400 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] transition-all disabled:opacity-20 shadow-2xl shadow-primary-500/20 active:scale-95"
            >
              {{ selectedItem?.owned ? i18n.t('btn_acquired') : i18n.t('shop_initiate_acquisition') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

      <!-- Elite Bundles Highlight (Premium Tactical Look) -->
      <section v-if="bundleItems.length > 0 && selectedCategory === 'all' && selectedRarity === 'all'" class="relative z-10">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
          <div class="flex items-center gap-3">
             <div class="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
               <LayoutGrid class="w-5 h-5 text-yellow-500" />
             </div>
             <div>
               <h2 class="text-3xl font-black text-industrial text-foreground tracking-tighter italic uppercase leading-none flex items-center gap-2">
                 {{ i18n.t('shop_bundles_title') }}
                 <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
               </h2>
               <p class="text-[9px] font-black text-muted uppercase tracking-[0.4em] mt-1.5 opacity-60">{{ i18n.t('shop_bundles_subtitle') }}</p>
             </div>
          </div>
          <div class="hidden sm:block h-px flex-1 bg-gradient-to-r from-yellow-500/30 via-yellow-500/10 to-transparent"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="item in bundleItems" 
            :key="item.id"
            @click="openBundleModal(item)"
            class="group/bundle relative flex flex-col bg-surface/30 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] cursor-pointer h-full"
            :class="[
              item.rarity?.toLowerCase() === 'legendary' ? 'hover:border-yellow-500/30' : 
              item.rarity?.toLowerCase() === 'especial' || item.rarity?.toLowerCase() === 'epic' ? 'hover:border-purple-500/30' : 
              'hover:border-white/20'
            ]"
          >
            <!-- Background Rarity Glow -->
            <div class="absolute -top-24 -right-24 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-opacity duration-700 opacity-20 group-hover/bundle:opacity-40"
                 :class="[
                   item.rarity?.toLowerCase() === 'legendary' ? 'bg-yellow-500' : 
                   item.rarity?.toLowerCase() === 'especial' || item.rarity?.toLowerCase() === 'epic' ? 'bg-purple-500' : 
                   'bg-slate-400'
                 ]"></div>

            <!-- Header Info (Rarity & Discount) -->
            <div class="p-6 pb-0 flex items-start justify-between z-10">
              <div class="flex items-center gap-2">
                <div class="px-3 py-1 bg-surface/60 backdrop-blur-md border border-white/10 rounded-xl">
                  <span class="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/80">
                    PACK {{ getRarityBadge(item).label }}
                  </span>
                </div>
                <div v-if="!item.owned" class="px-2 py-1 bg-yellow-500 text-black text-[8px] font-black rounded-lg shadow-lg shadow-yellow-500/20">
                  30% OFF
                </div>
              </div>
              
              <div class="px-3 py-1 rounded-xl border font-black text-[8px] tracking-[0.2em] uppercase backdrop-blur-md"
                   :class="getRarityBadge(item).classes">
                {{ getRarityBadge(item).label }}
              </div>
            </div>

            <!-- Preview Area (Tactical Display) -->
            <div class="h-40 sm:h-56 m-3 sm:m-4 mt-2 mb-0 rounded-[1.5rem] sm:rounded-[2rem] relative overflow-hidden bg-black/40 border border-white/5 group-hover/bundle:border-white/10 transition-colors shadow-inner">
               <!-- Tactical Grid Background -->
               <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(white 1px, transparent 0); background-size: 20px 20px;"></div>
               
               <!-- Rarity Aura -->
               <div class="absolute inset-0 opacity-10"
                    :class="[
                      item.rarity?.toLowerCase() === 'legendary' ? 'bg-gradient-to-b from-yellow-500/20 to-transparent' : 
                      item.rarity?.toLowerCase() === 'especial' || item.rarity?.toLowerCase() === 'epic' ? 'bg-gradient-to-b from-purple-500/20 to-transparent' : 
                      'bg-gradient-to-b from-slate-400/20 to-transparent'
                    ]"></div>

               <!-- Center Hologram -->
               <div class="absolute inset-0 flex items-center justify-center">
                  <div class="relative">
                    <!-- Rotating Rings -->
                    <div class="absolute inset-0 border-2 border-white/5 rounded-full scale-[1.8] border-dashed animate-[spin_10s_linear_infinite]"></div>
                    <div class="absolute inset-0 border border-white/10 rounded-full scale-[2.2] animate-[spin_15s_linear_infinite_reverse]"></div>
                    
                    <!-- Core Icon -->
                    <div class="relative z-10 p-6 rounded-3xl bg-surface/40 backdrop-blur-xl border border-white/10 shadow-2xl transform group-hover/bundle:scale-110 transition-transform duration-700">
                       <LayoutGrid class="w-10 h-10 transition-colors" 
                                   :class="[
                                     item.rarity?.toLowerCase() === 'legendary' ? 'text-yellow-500' : 
                                     item.rarity?.toLowerCase() === 'especial' || item.rarity?.toLowerCase() === 'epic' ? 'text-purple-400' : 
                                     'text-slate-400'
                                   ]" />
                       
                       <!-- Scanning Line -->
                       <div class="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent h-1/2 w-full animate-[scan_2s_ease-in-out_infinite] pointer-events-none"></div>
                    </div>
                  </div>
               </div>

               <!-- Corner Slots Preview (Actual Items) -->
               <div class="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                  <div class="flex justify-between">
                    <div v-for="cItem in getBundlePreviewItems(item).slice(0, 2)" :key="cItem.id"
                         class="w-11 h-11 rounded-xl bg-surface/60 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-40 group-hover/bundle:opacity-100 transition-all hover:scale-110 shadow-lg">
                      <ItemIcon :name="cItem.svg_key" :type="cItem.type" class-name="w-6 h-6" />
                    </div>
                    <!-- Fillers if bundle has < 2 items in top row -->
                    <div v-if="getBundlePreviewItems(item).length < 1" class="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center opacity-10"><Sword class="w-5 h-5" /></div>
                    <div v-if="getBundlePreviewItems(item).length < 2" class="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center opacity-10"><Shield class="w-5 h-5" /></div>
                  </div>
                  <div class="flex justify-between">
                    <div v-for="cItem in getBundlePreviewItems(item).slice(2, 4)" :key="cItem.id"
                         class="w-11 h-11 rounded-xl bg-surface/60 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-40 group-hover/bundle:opacity-100 transition-all hover:scale-110 shadow-lg">
                      <ItemIcon :name="cItem.svg_key" :type="cItem.type" class-name="w-6 h-6" />
                    </div>
                    <!-- Fillers if bundle has < 4 items -->
                    <div v-if="getBundlePreviewItems(item).length < 3" class="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center opacity-10"><Construction class="w-5 h-5" /></div>
                    <div v-if="getBundlePreviewItems(item).length < 4" class="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center opacity-10"><Footprints class="w-5 h-5" /></div>
                  </div>
               </div>

            </div>

            <!-- Content Area -->
            <div class="p-4 sm:p-6 flex-1 flex flex-col">
              <h3 class="text-xl font-black text-foreground tracking-tight group-hover/bundle:text-primary-500 transition-colors duration-300">
                {{ item.name }}
              </h3>
              <p class="text-[10px] text-muted font-medium mt-1 line-clamp-1 opacity-60">{{ item.description }}</p>
              
              <!-- Footer / Action -->
              <div class="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <div v-if="item.owned" class="flex items-center gap-2 text-neon-lime">
                  <div class="w-5 h-5 rounded-full bg-neon-lime/10 flex items-center justify-center border border-neon-lime/20">
                    <Check class="w-3 h-3" />
                  </div>
                  <span class="text-[9px] font-black uppercase tracking-[0.2em]">{{ i18n.t('btn_acquired') }}</span>
                </div>
                
                <div v-else class="flex flex-col">
                  <div v-if="item.original_price" class="flex items-center gap-2 mb-0.5 opacity-40">
                    <span class="text-[10px] font-bold text-muted line-through tracking-tighter">{{ item.original_price }}</span>
                    <span class="text-[7px] font-black bg-white/10 px-1 rounded uppercase">VALOR REAL</span>
                  </div>
                  <div class="flex flex-col gap-1">
                    <!-- RC Price -->
                    <div v-if="item.price > 0" class="flex items-baseline gap-1.5">
                      <span class="text-2xl font-black text-precision transition-colors"
                            :class="[
                              item.rarity?.toLowerCase() === 'legendary' ? 'text-yellow-500' : 
                              item.rarity?.toLowerCase() === 'especial' || item.rarity?.toLowerCase() === 'epic' ? 'text-purple-400' : 
                              'text-foreground'
                            ]">{{ item.price }}</span>
                      <span class="text-[9px] font-black text-muted uppercase tracking-widest opacity-60">{{ i18n.t('stats_reps') }}</span>
                    </div>
                    <!-- Gem Price -->
                    <div v-if="item.price_gems > 0" class="flex items-baseline gap-1.5">
                      <span class="text-2xl font-black text-emerald-500 tabular-nums">{{ item.price_gems }}</span>
                      <span class="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">GEM</span>
                    </div>
                  </div>
                </div>

                <button 
                  v-if="!item.owned"
                  @click.stop="buyItem(item)"
                  :disabled="!canAfford(item) || buying"
                  class="relative overflow-hidden group/btn px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
                  :class="[
                    item.rarity?.toLowerCase() === 'legendary' ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20' : 
                    item.rarity?.toLowerCase() === 'especial' || item.rarity?.toLowerCase() === 'epic' ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20' : 
                    'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10'
                  ]"
                >
                  <span class="relative z-10">{{ i18n.t('btn_acquire') }}</span>
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer pointer-events-none"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Modern Filters & Layout Interface -->
      <div class="flex flex-col lg:flex-row gap-8 items-start relative z-10">
        
        <!-- Sidebar Filters (Desktop) / Top Bar (Mobile) -->
        <aside class="w-full lg:w-64 flex-shrink-0 space-y-8 sticky top-24 z-50 lg:z-10">
          <!-- Category Selector -->
          <div class="space-y-4">
            <h3 class="text-[10px] font-black text-muted uppercase tracking-[0.4em] px-2">{{ i18n.t('shop_filter_categories') || 'CATEGORÍAS' }}</h3>
            <!-- Mobile Dropdown -->
            <div class="lg:hidden relative">
              <button 
                @click="showMobileCategoryDropdown = !showMobileCategoryDropdown"
                class="w-full flex items-center justify-between px-5 py-4 bg-surface/30 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-foreground"
              >
                <div class="flex items-center gap-4">
                  <component :is="categories.find(c => c.id === selectedCategory)?.icon || Swords" class="w-4 h-4 text-primary-500" />
                  <span>{{ i18n.t(categories.find(c => c.id === selectedCategory)?.label || 'cat_all') }}</span>
                </div>
                <ChevronDown class="w-4 h-4 transition-transform text-muted" :class="{ 'rotate-180': showMobileCategoryDropdown }" />
              </button>
              
              <div v-if="showMobileCategoryDropdown" 
                   class="absolute top-full left-0 right-0 mt-2 z-[60] bg-surface/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-top-2">
                <button 
                  v-for="cat in categories" 
                  :key="cat.id"
                  @click="selectedCategory = cat.id; currentPage = 1; showMobileCategoryDropdown = false"
                  class="w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5 border-b border-white/5 last:border-0"
                  :class="selectedCategory === cat.id ? 'text-primary-500 bg-primary-500/5' : 'text-muted'"
                >
                  <component :is="cat.icon" class="w-4 h-4" />
                  <span>{{ i18n.t(cat.label) || cat.label }}</span>
                </button>
              </div>
            </div>

            <!-- Desktop List -->
            <div class="hidden lg:flex flex-col gap-1">
              <button 
                v-for="cat in categories" 
                :key="cat.id"
                @click="selectedCategory = cat.id; currentPage = 1"
                class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group"
                :class="selectedCategory === cat.id ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20 border border-primary-400' : 'text-muted hover:bg-white/5 hover:text-foreground border border-transparent'"
              >
                <component :is="cat.icon" class="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{{ i18n.t(cat.label) || cat.label }}</span>
              </button>
            </div>
          </div>

          <!-- Rarity Selector -->
          <div class="space-y-4">
            <h3 class="text-[10px] font-black text-muted uppercase tracking-[0.4em] px-2">{{ i18n.t('shop_filter_rarity') || 'FILTRAR POR RAREZA' }}</h3>
            <div class="flex flex-wrap gap-2 px-1">
              <button 
                v-for="rarity in rarities" 
                :key="rarity.id"
                @click="selectedRarity = rarity.id; currentPage = 1"
                class="px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95"
                :class="selectedRarity === rarity.id ? rarity.activeClass : 'bg-surface/20 border-border text-muted hover:border-foreground/20'"
              >
                {{ rarity.label }}
              </button>
            </div>
          </div>

          <!-- Summary / Quick Stats -->
          <div class="p-6 bg-surface/30 rounded-[2rem] border border-white/5 backdrop-blur-md hidden lg:block">
            <div class="flex items-center gap-3 mb-4">
               <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span class="text-[9px] font-black text-foreground uppercase tracking-widest">{{ i18n.t('shop_status_online') || 'ARMERÍA_EN_LINEA' }}</span>
            </div>
            <p class="text-[10px] text-muted font-bold leading-relaxed uppercase tracking-tight opacity-60">
              {{ filteredItems.length }} {{ i18n.t('shop_artifacts_available') || 'ARTEFACTOS DISPONIBLES EN TU SECTOR' }}
            </p>
          </div>
        </aside>

        <!-- Main Collection Grid (Bento Style) -->
        <main class="flex-1 w-full">
          <div class="flex items-center gap-4 mb-8">
            <h2 class="text-xl font-black text-industrial text-foreground tracking-tight italic uppercase">{{ i18n.t('shop_permanent_protocol') }}</h2>
            <div class="h-px flex-1 bg-gradient-to-r from-muted/20 to-transparent"></div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 grid-auto-flow-dense">
            <div 
              v-for="item in paginatedItems" 
              :key="item.id"
              class="card-stats p-0 flex flex-col group/item border-white/10 relative transition-all duration-500 h-full"
              :class="getCardClass(item)"
            >
              <!-- Lock Overlay -->
              <div v-if="!item.is_unlocked" class="absolute inset-0 bg-background/60 backdrop-blur-[4px] z-[5] pointer-events-none flex items-center justify-center rounded-[2.5rem]">
                 <div class="flex flex-col items-center gap-3 bg-surface/80 p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                    <Lock class="w-8 h-8 text-muted/60" />
                    <span class="text-[9px] font-black text-muted uppercase tracking-[0.3em]">{{ i18n.t('shop_locked') || 'BLOQUEADO' }}</span>
                 </div>
              </div>

              <!-- Header Info -->
              <div class="p-4 sm:p-6 pb-0 flex items-start justify-between z-10 gap-2" @click="openItemDetails(item)">
                <div class="flex flex-col gap-1.5 min-w-0">
                  <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-border text-muted bg-foreground/5 w-fit">
                    #{{ item.roadmap_position || '??' }}
                  </span>
                  <div v-if="isUpgrade(item) && item.price > 0" class="flex items-center gap-1.5">
                    <div class="w-1 h-1 rounded-full bg-neon-lime animate-ping"></div>
                    <span class="text-[8px] font-black text-neon-lime tracking-widest uppercase">↑ MEJORA</span>
                  </div>
                </div>
                
                <div class="flex flex-col items-end gap-1.5 shrink-0">
                  <div v-if="isEquipped(item)" class="flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                    <span class="text-[8px] font-black uppercase tracking-widest text-blue-400">ACTIVE</span>
                  </div>
                  <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border backdrop-blur-md whitespace-nowrap" :class="getRarityBadge(item).classes">
                    {{ getRarityBadge(item).label }}
                  </span>
                </div>
              </div>

              <!-- Preview Area (Dynamic Height for Bento) -->
              <div 
                class="flex items-center justify-center m-3 sm:m-6 mb-1 sm:mb-2 bg-surface/50 rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 relative overflow-hidden group-hover/item:border-primary-500/30 transition-all duration-700 shadow-inner h-32 sm:h-48"
                @click="openItemDetails(item)"
              >
                 <!-- Background Rarity Glow -->
                 <div class="absolute inset-0 opacity-10 blur-3xl pointer-events-none"
                      :class="[
                        item.rarity?.toLowerCase() === 'legendary' ? 'bg-yellow-500' : 
                        item.rarity?.toLowerCase() === 'especial' || item.rarity?.toLowerCase() === 'epic' ? 'bg-purple-500' : 
                        'bg-foreground'
                      ]"></div>

                 <div v-if="item.type === 'bundle'" class="w-full h-full flex items-center justify-center bg-gradient-to-br relative" :class="getBundleBgClass(item.rarity)">
                    <div class="grid grid-cols-2 gap-2 p-4" :class="item.rarity?.toLowerCase() === 'legendary' ? 'scale-110' : 'scale-90'">
                       <div class="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center"><Type class="w-6 h-6" :class="getBundleTextClass(item.rarity, 0.4)" /></div>
                       <div class="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center"><Frame class="w-6 h-6" :class="getBundleTextClass(item.rarity, 0.4)" /></div>
                       <div class="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center"><Sparkles class="w-6 h-6" :class="getBundleTextClass(item.rarity, 0.4)" /></div>
                       <div class="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center"><LayoutGrid class="w-6 h-6" :class="getBundleTextClass(item.rarity, 0.4)" /></div>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div class="p-4 bg-surface/80 backdrop-blur-md rounded-[2rem] border shadow-2xl" :class="getBundleBorderClass(item.rarity)">
                          <Swords class="w-8 h-8 animate-pulse" :class="getBundleTextClass(item.rarity)" />
                       </div>
                    </div>
                 </div>

                 <div v-if="item.type === 'title'" class="text-sm sm:text-xl text-center px-4 sm:px-6 leading-tight font-black transition-transform group-hover/item:scale-110 duration-700" :class="item.css_value">
                   {{ item.name }}
                 </div>
                 <div v-if="item.type === 'border'" class="transition-transform group-hover/item:scale-110 duration-700">
                   <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :border-css="item.css_value" :size="64" class="sm:hidden" />
                   <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :border-css="item.css_value" :size="96" class="hidden sm:block" />
                 </div>
                 <div v-if="item.type === 'avatar'" class="transition-transform group-hover/item:scale-110 duration-700">
                   <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :avatar-css="item.css_value" :size="64" class="sm:hidden" />
                   <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :avatar-css="item.css_value" :size="96" class="hidden sm:block" />
                 </div>
                 <div v-if="item.type === 'background'" class="w-full h-full relative group/bg overflow-hidden">
                    <BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0 !w-full !h-full transition-transform duration-1000 group-hover/item:scale-125" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>
                    <div class="absolute inset-0 opacity-10 pointer-events-none h-[200%] animate-scanline" style="background: linear-gradient(to bottom, transparent 50%, rgba(34, 211, 238, 0.5) 50.5%, transparent 51%); background-size: 100% 4px;"></div>
                 </div>
                 <div v-if="['head', 'weapon', 'armor', 'boots'].includes(item.type)" class="flex flex-col items-center gap-4">
                     <div class="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br border shadow-2xl transition-all duration-700 group-hover/item:scale-110 group-hover/item:rotate-3"
                          :class="[getRarityBadge(item).classes, getRarityBadge(item).classes.includes('primary') ? 'from-primary-500/20 to-primary-500/5' : 'from-foreground/10 to-transparent']">
                       <ItemIcon :name="item.svg_key" :type="item.type" class-name="w-10 h-10 sm:w-14 h-14" :class="getRarityBadge(item).classes?.split(' ')[0]" />
                     </div>
                  </div>
                  <div v-if="item.type === 'consumable'" class="flex flex-col items-center gap-3">
                     <FlaskConical class="w-16 h-16 animate-pulse transition-transform group-hover/item:scale-110 duration-700" :class="getRarityBadge(item).classes?.split(' ')[0]" />
                     <div v-if="item.stats?.multiplier" class="px-3 py-1 bg-foreground/10 rounded-lg">
                        <span class="text-[10px] font-black uppercase tracking-widest" :class="getRarityBadge(item).classes?.split(' ')[0]">BOOST x{{ item.stats.multiplier }}</span>
                     </div>
                  </div>
                 <div v-if="item.type === 'post_background'" class="w-full h-full relative group/post-bg overflow-hidden flex items-center justify-center p-6">
                    <div class="w-full h-full bg-black border border-white/10 rounded-2xl relative overflow-hidden flex flex-col p-4 gap-3 shadow-2xl shop-preview group-hover/item:scale-105 transition-transform duration-700">
                       <div class="w-full h-full absolute inset-0 z-0" :class="item.css_value"></div>
                       <div class="flex items-center gap-3 relative z-10">
                         <div class="w-6 h-6 rounded-full bg-primary-500/30"></div>
                         <div class="w-20 h-2 bg-muted/20 rounded"></div>
                       </div>
                       <div class="flex-1 space-y-2 relative z-10">
                         <div class="w-full h-3 bg-foreground/10 rounded-lg"></div>
                         <div class="w-2/3 h-3 bg-foreground/10 rounded-lg"></div>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Content Area -->
              <div class="p-3 sm:p-6 pt-2 sm:pt-4 flex-1" @click="openItemDetails(item)">
                <h3 class="font-black text-industrial text-foreground mb-1 sm:mb-2 tracking-tight group-hover/item:text-primary-500 transition-colors text-xs sm:text-base">
                  {{ item.name }}
                </h3>
                
                <!-- Expanded Stats for Bento -->
                <div v-if="['head', 'weapon', 'armor', 'boots'].includes(item.type) && item.stats" class="mt-3 flex flex-wrap gap-2 mb-4">
                  <div
                    v-for="(value, stat) in item.stats"
                    :key="stat"
                    v-show="stat !== 'duration' && stat !== 'multiplier' && value !== 0"
                    class="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2"
                  >
                    <span class="text-[10px] font-black uppercase tracking-widest text-muted">{{ statLabels[stat] || stat }}</span>
                    <span class="text-xs font-black tabular-nums" :class="getStatDifference(item, stat) >= 0 ? 'text-neon-lime' : 'text-red-500'">
                      {{ value > 0 ? '+' : '' }}{{ value }}
                    </span>
                  </div>
                </div>
                <p v-else class="text-[11px] text-muted font-bold line-clamp-2 mb-4 leading-relaxed opacity-60">{{ item.description }}</p>
                
                <div v-if="!item.is_unlocked" class="px-2 sm:px-3 py-1 sm:py-2 bg-red-500/5 border border-red-500/10 rounded-lg sm:rounded-xl">
                  <p class="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-red-500/70 flex items-center gap-1 sm:gap-2">
                    <Clock class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {{ i18n.t('shop_decrypt_at') }}: {{ getCountdown(item) }}
                  </p>
                </div>
              </div>              <!-- Action Footer -->
              <div class="p-3 sm:p-4 mt-auto border-t border-white/5 bg-black/60">
                <div class="flex flex-col gap-3">
                  <!-- Top Row: Prices & Status -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex flex-col gap-1 min-w-0">
                      <!-- Owned Status -->
                      <div v-if="item.owned" class="flex items-center gap-1.5">
                        <div v-if="item.type !== 'consumable'" class="flex items-center gap-1 text-neon-lime">
                          <CheckCircle2 class="w-3 h-3" />
                          <span class="text-[9px] font-black uppercase tracking-widest">{{ i18n.t('btn_acquired') }}</span>
                        </div>
                        <div v-else class="flex items-center gap-1 text-primary-500">
                          <Package class="w-3 h-3" />
                          <span class="text-[9px] font-black uppercase tracking-widest">{{ i18n.t('shop_stock') }}: {{ item.quantity }}</span>
                        </div>
                      </div>

                      <!-- Prices (Only if not owned OR if consumable) -->
                      <div v-if="!item.owned || item.type === 'consumable'" class="flex flex-col gap-0.5">
                        <div v-if="item.price > 0" class="flex items-center gap-1.5">
                          <span class="text-sm font-black tabular-nums leading-none" :class="(authStore.user?.reppy_coins || 0) >= item.price ? 'text-primary-500' : 'text-muted/60'">{{ item.price }}</span>
                          <span class="text-[7px] font-black text-muted/40 uppercase tracking-widest">RC</span>
                        </div>
                        <div v-if="item.price_gems > 0" class="flex items-center gap-1.5">
                          <span class="text-sm font-black tabular-nums leading-none" :class="(authStore.user?.reppy_gems || 0) >= item.price_gems ? 'text-emerald-400' : 'text-muted/60'">{{ item.price_gems }}</span>
                          <span class="text-[7px] font-black text-muted/40 uppercase tracking-widest">GEM</span>
                        </div>
                      </div>
                    </div>

                    <!-- Primary Action Button (Equip/Activate/Buy) -->
                    <div class="flex items-center gap-2">
                      <button 
                        v-if="item.owned && item.type !== 'bundle'"
                        @click="item.type === 'consumable' ? activateConsumable(item) : equipItem(item)"
                        :disabled="item.type !== 'consumable' && isEquipped(item)"
                        class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap shadow-lg"
                        :class="item.type === 'consumable' ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20' : (isEquipped(item) ? 'bg-white/5 text-muted border border-white/10 cursor-default' : 'bg-blue-500 text-white hover:bg-blue-400 shadow-blue-500/20')"
                      >
                        {{ item.type === 'consumable' ? i18n.t('btn_activate') : (isEquipped(item) ? i18n.t('btn_on') : i18n.t('btn_equip')) }}
                      </button>

                      <!-- Buy Button (Secondary if already owned consumable) -->
                      <button 
                        v-if="(!item.owned || item.type === 'consumable') && (item.price > 0 || item.price_gems > 0)"
                        @click="buyItem(item)"
                        :disabled="!canAfford(item) || buying || !item.is_unlocked"
                        class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-xl"
                        :class="item.owned && item.type === 'consumable' ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : (!canAfford(item) || buying || !item.is_unlocked ? 'bg-white/5 text-muted/40 border border-white/5 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-400 text-white shadow-primary-500/20 active:scale-95')"
                      >
                        {{ item.owned ? i18n.t('btn_buy_more') || 'MÁS' : (item.is_unlocked ? i18n.t('btn_get') : i18n.t('btn_lock')) }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex flex-col items-center gap-8 mt-16 p-12 bg-surface/20 rounded-[3rem] border border-white/5 relative overflow-hidden group/pagination">
            <div class="flex items-center gap-6 relative z-10">
              <button 
                @click="currentPage > 1 && (currentPage--)"
                :disabled="currentPage === 1"
                class="p-5 bg-surface/60 border border-border rounded-2xl hover:border-primary-500/30 disabled:opacity-20 transition-all group/prev shadow-xl active:scale-95"
              >
                <ChevronLeft class="w-6 h-6 group-hover/prev:-translate-x-1 transition-transform" />
              </button>
              
              <div class="flex items-center gap-3">
                <button 
                  v-for="p in totalPages" 
                  :key="p"
                  @click="currentPage = p"
                  class="w-14 h-14 flex items-center justify-center rounded-2xl text-sm font-black tracking-widest transition-all border-2"
                  :class="currentPage === p ? 'bg-primary-500 text-white border-primary-500 shadow-2xl shadow-primary-500/40' : 'bg-surface/40 text-muted border-border hover:border-primary-500/40 hover:text-foreground'"
                >
                  {{ p }}
                </button>
              </div>

              <button 
                @click="currentPage < totalPages && (currentPage++)"
                :disabled="currentPage === totalPages"
                class="p-5 bg-surface/60 border border-border rounded-2xl hover:border-primary-500/30 disabled:opacity-20 transition-all group/next shadow-xl active:scale-95"
              >
                <ChevronRight class="w-6 h-6 group-hover/next:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </main>
      </div>

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
              <h2 class="text-2xl font-black text-industrial text-foreground tracking-tight uppercase">{{ i18n.t('shop_seasonal_title') }}</h2>
              <p class="text-[10px] text-muted font-bold tracking-widest uppercase">{{ i18n.t('shop_seasonal_subtitle') }}</p>
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
              class="card-stats p-0 flex flex-col group/item border-border h-full"
              :class="getCardClass(item)"
            >
              <div v-if="!item.is_unlocked" class="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-[5] pointer-events-none flex items-center justify-center">
                 <div class="w-12 h-12 bg-surface/60 rounded-full flex items-center justify-center border border-border"><span class="text-xl">🔒</span></div>
              </div>
              <div class="p-4 pb-0 flex items-start justify-between z-10">
                <div class="flex flex-col gap-1">
                  <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-primary-500/20 text-primary-500 bg-primary-500/5 w-fit">
                    {{ i18n.t('shop_seasonal_badge') }}
                  </span>
                  <span v-if="isUpgrade(item)" class="text-[10px] font-black text-neon-lime mt-1 tracking-widest">
                    ↑ MEJORA
                  </span>
                </div>
                
                <div class="flex flex-col items-end gap-2">
                  <span v-if="isEquipped(item)" class="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-blue-500 text-white rounded shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    EQUIPADO
                  </span>
                  <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border" :class="getRarityBadge(item).classes">
                    {{ getRarityBadge(item).label }}
                  </span>
                </div>
              </div>
              <div class="h-32 flex items-center justify-center m-4 mb-2 bg-surface rounded-2xl border border-border relative overflow-hidden group-hover/item:border-primary-500/20 transition-colors shadow-inner">
                 <div v-if="item.type === 'title'" class="text-lg text-center px-4 leading-tight font-black" :class="item.css_value">{{ item.name }}</div>
                 <div v-if="item.type === 'border'"><AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :border-css="item.css_value" :size="64" /></div>
                 <div v-if="item.type === 'avatar'"><AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'" :avatar-css="item.css_value" :size="64" /></div>
                 <div v-if="item.type === 'background'" class="w-full h-full relative group/bg overflow-hidden">
                    <BackgroundEffect :background-css="item.css_value" is-preview class="!absolute !inset-0 !w-full !h-full transition-transform duration-700 group-hover/item:scale-110" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
                    <div class="absolute inset-0 opacity-20 pointer-events-none h-[200%] animate-scanline" style="background: linear-gradient(to bottom, transparent 50%, rgba(34, 211, 238, 0.5) 50.5%, transparent 51%); background-size: 100% 4px;"></div>
                    <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-[6px] font-black text-muted uppercase tracking-widest z-10">{{ i18n.t('shop_screen_preview') }}</div>
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
                    <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-[6px] font-black text-muted uppercase tracking-widest z-10">{{ i18n.t('shop_post_preview') }}</div>
                 </div>
              </div>
              <div class="p-4 pt-2 flex-1" @click="openItemDetails(item)">
                <h3 class="text-sm font-black text-industrial text-foreground mb-1">{{ item.name }}</h3>
                
                <!-- Inline Stats Diff -->
                <div v-if="['head', 'weapon', 'armor', 'boots'].includes(item.type) && item.stats" class="mt-2 flex flex-col gap-1 mb-3">
                  <span
                    v-for="(value, stat) in item.stats"
                    :key="stat"
                    v-show="stat !== 'duration' && stat !== 'multiplier' && value !== 0"
                    class="text-[11px] font-black tracking-widest uppercase flex items-center"
                    :class="getStatDifference(item, stat) > 0 ? 'text-neon-lime' : (getStatDifference(item, stat) < 0 ? 'text-red-500' : 'text-foreground/80')"
                  >
                    {{ value > 0 ? '+' : '' }}{{ value }} {{ statLabels[stat] || stat }}
                    <span v-if="getStatDifference(item, stat) !== 0" class="text-muted ml-2 font-bold opacity-60">
                      ( {{ getStatDifference(item, stat) > 0 ? '+' : '' }}{{ getStatDifference(item, stat) }} )
                    </span>
                  </span>
                </div>
                <p v-else class="text-[10px] text-muted font-medium line-clamp-2 mb-4 leading-relaxed">{{ item.description }}</p>
              </div>
              <div class="p-4 pt-0 mt-auto border-t border-border bg-foreground/[0.01]">
                <div class="flex items-center justify-between mt-4">
                  <div v-if="item.owned" class="flex items-center gap-1 text-neon-lime"><Check class="w-3.5 h-3.5" /><span class="text-[8px] font-black uppercase tracking-widest leading-none">{{ i18n.t('btn_acquired') }}</span></div>
                  <div v-else class="text-[8px] font-black uppercase tracking-widest text-primary-500/60 leading-none">{{ i18n.t('shop_special_badge') }}</div>
                  <button v-if="item.owned" @click="equipItem(item)" :disabled="isEquipped(item)" class="px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all" :class="isEquipped(item) ? 'bg-foreground/5 text-muted border border-border' : 'bg-neon-lime text-black shadow-lg shadow-neon-lime/20'">{{ isEquipped(item) ? i18n.t('btn_on') : i18n.t('btn_equip') }}</button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </section>
    </div>
  </div>

  <!-- Bundle Detail Modal -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="showBundleModal" class="fixed inset-0 z-[100] flex justify-center items-start overflow-y-auto p-4 md:p-8 bg-background/80 backdrop-blur-xl" @click.self="showBundleModal = false">
      <div class="glass max-w-xl w-full p-8 rounded-[2.5rem] border border-yellow-500/30 shadow-[0_0_80px_rgba(234,179,8,0.1)] relative overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 my-auto">
        <!-- Background Glow -->
        <div class="absolute -top-32 -right-32 w-64 h-64 bg-yellow-400/10 rounded-full blur-[100px] pointer-events-none"></div>

        <!-- Close Button -->
        <button @click="showBundleModal = false" class="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
           <X class="w-6 h-6 text-muted group-hover:text-foreground" />
        </button>

        <!-- Header -->
        <div class="mb-10 pr-12">
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500 mb-2 block">{{ i18n.t('shop_module_contents') }}</span>
          <h2 class="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-none">{{ selectedBundle?.name }}</h2>
          <p class="text-xs text-muted font-medium mt-3 leading-relaxed">{{ selectedBundle?.description }}</p>
        </div>

        <!-- Items List -->
        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-4">
          <div v-for="item in selectedBundleItems" :key="item.id" class="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-yellow-500/20 transition-all">
            <div class="w-16 h-16 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
               <component :is="['head', 'weapon', 'armor', 'boots'].includes(item.type) ? getSlotIcon(item.type) : (item.type === 'title' ? Type : item.type === 'border' ? Frame : item.type === 'post_background' ? LayoutGrid : Sparkles)" class="w-6 h-6 text-muted group-hover:text-yellow-500 transition-colors" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <h4 class="text-sm font-black text-foreground">{{ item.name }}</h4>
                <span class="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg border" :class="getRarityBadge(item).classes">{{ getRarityBadge(item).label }}</span>
              </div>
              <p class="text-[10px] text-muted font-medium uppercase tracking-widest">{{ item.type.replace('_', ' ') }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-8 pt-8 border-t border-white/10 flex items-center justify-between gap-6">
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{{ i18n.t('shop_bundle_cost') }}</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-black text-yellow-500 tabular-nums">{{ selectedBundle?.price }}</span>
              <span class="text-[10px] font-black text-muted uppercase tracking-widest">RC</span>
            </div>
          </div>
          
          <button 
            @click="buyItem(selectedBundle); showBundleModal = false"
            :disabled="!canAfford(selectedBundle) || buying || selectedBundle?.owned"
            class="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-20 shadow-xl shadow-yellow-500/20 active:scale-95"
          >
            {{ selectedBundle?.owned ? i18n.t('btn_acquired') : i18n.t('shop_initiate_acquisition') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useShopStore } from '../stores/shop';
import { useNotificationStore } from '../stores/notification';
import { useI18nStore } from '../stores/i18n';
import { LayoutGrid, Type, Frame, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Coins, Diamond, Check, Swords, X, Flame, Package, Sword, Shield, Footprints, Construction, FlaskConical, Zap, Info, ChevronUp, ChevronDown as ChevronDownIcon, Users, Activity, Lock, CheckCircle2, Clock } from 'lucide-vue-next';
import AvatarFrame from './AvatarFrame.vue';
import BackgroundEffect from './BackgroundEffect.vue';
import ItemIcon from './ItemIcon.vue';

const emit = defineEmits(['start', 'viewProfile']);
const authStore = useAuthStore();
const shopStore = useShopStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();

const items = computed(() => shopStore.cosmetics);
const loading = computed(() => shopStore.loading);
const buying = ref(false);
const nowMs = ref(Date.now());
const showSeasonal = ref(false);
const showDropdown = ref(false);
const showMobileCategoryDropdown = ref(false);
const showBundleModal = ref(false);
const showItemModal = ref(false);
const selectedBundle = ref(null);
const selectedItem = ref(null);
const selectedBundleItems = ref([]);
let countdownTimer = null;

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
  duration: 'Duración',
  multiplier: 'Multiplicador',
  crit_chance: 'Prob. Crítica',
  crit_damage: 'Daño Crítico'
};

const formatDuration = (seconds) => {
  if (!seconds) return '0m';
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} ${i18n.t('tf_minutes') || 'Minutos'}`;
  }
  const hours = Math.floor(seconds / 3600);
  return `${hours} ${hours === 1 ? (i18n.t('tf_hour') || 'Hora') : (i18n.t('tf_hours') || 'Horas')}`;
};

const selectedCategory = ref('all');
const activeTab = ref('combat');
const seasonalItems = computed(() => filteredItems.value.filter(item => item.is_seasonal));
const currentPage = ref(1);
const itemsPerPage = ref(15);

const categories = computed(() => {
  if (activeTab.value === 'combat') {
    return [
      { id: 'all', label: 'cat_all', icon: Swords },
      { id: 'bundle', label: 'cat_bundle', icon: LayoutGrid },
      { id: 'weapon', label: 'cat_weapon', icon: Sword },
      { id: 'head', label: 'cat_head', icon: Construction },
      { id: 'armor', label: 'cat_armor', icon: Shield },
      { id: 'boots', label: 'cat_boots', icon: Footprints },
      { id: 'consumable', label: 'cat_consumable', icon: Flame }
    ];
  } else {
    return [
      { id: 'all', label: 'cat_all', icon: Swords },
      { id: 'title', label: 'shop_tab_titles', icon: Type },
      { id: 'border', label: 'shop_tab_borders', icon: Frame },
      { id: 'avatar', label: 'shop_tab_avatars', icon: Users },
      { id: 'background', label: 'shop_tab_backgrounds', icon: Sparkles },
      { id: 'post_background', label: 'shop_tab_post_backgrounds', icon: Activity }
    ];
  }
});

const selectedRarity = ref('all');
const rarities = [
  { id: 'all', label: 'TODOS', activeClass: 'bg-foreground text-background border-foreground' },
  { id: 'common', label: 'COMÚN', activeClass: 'bg-muted text-white border-muted' },
  { id: 'rare', label: 'RARO', activeClass: 'bg-blue-500 text-white border-blue-500' },
  { id: 'especial', label: 'ESPECIAL', activeClass: 'bg-purple-500 text-white border-purple-500' },
  { id: 'legendary', label: 'LEGENDARIO', activeClass: 'bg-primary-500 text-white border-primary-500' },
  { id: 'calistenico', label: 'CALISTÉNICO', activeClass: 'bg-[#ccff00] text-black border-[#ccff00]' }
];

const filteredItems = computed(() => {
  let result = [...items.value];
  
  if (activeTab.value === 'combat') {
    result = result.filter(item => ['head', 'weapon', 'armor', 'boots', 'consumable', 'bundle'].includes(item.type));
  } else {
    result = result.filter(item => ['title', 'border', 'avatar', 'background', 'post_background'].includes(item.type));
  }

  if (selectedCategory.value !== 'all') {
    result = result.filter(item => item.type === selectedCategory.value);
  }
  if (selectedRarity.value !== 'all') {
    result = result.filter(item => item.rarity?.toLowerCase() === selectedRarity.value);
  }
  return result.sort((a, b) => a.price - b.price);
});

const bundleItems = computed(() => filteredItems.value.filter(item => item.type === 'bundle'));
const getBundlePreviewItems = (bundle) => {
  if (!bundle.bundle_items) return [];
  const ids = bundle.bundle_items.split(',').map(id => parseInt(id.trim()));
  return items.value.filter(i => ids.includes(i.id)).slice(0, 4);
};

const regularItems = computed(() => {
  if (selectedCategory.value === 'all') {
    return filteredItems.value.filter(item => !item.is_seasonal && item.type !== 'bundle');
  }
  return filteredItems.value.filter(item => !item.is_seasonal);
});

const totalPages = computed(() => Math.ceil(regularItems.value.length / itemsPerPage.value));

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return regularItems.value.slice(start, start + itemsPerPage.value);
});

watch([selectedCategory, selectedRarity, activeTab], () => {
  currentPage.value = 1;
});

const checkShop = async () => {
  try {
    await shopStore.fetchCosmetics();
  } catch (error) {
    if (error.response?.status !== 401) notificationStore.notify('Armory sync failed', 'error');
  }
};

const canAfford = (item) => {
  if (!item) return false;
  const hasCoins = (authStore.user?.reppy_coins || 0) >= (item.price || 0);
  const hasGems = (authStore.user?.reppy_gems || 0) >= (item.price_gems || 0);
  return hasCoins && hasGems;
};

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
  if (item.type === 'head') return authStore.user.equipped_head_id === item.id;
  if (item.type === 'weapon') return authStore.user.equipped_weapon_id === item.id;
  if (item.type === 'armor') return authStore.user.equipped_armor_id === item.id;
  if (item.type === 'boots') return authStore.user.equipped_boots_id === item.id;
  if (item.type === 'title') return authStore.user.equipped_title_id === item.id;
  if (item.type === 'border') return authStore.user.equipped_border_id === item.id;
  if (item.type === 'background') return authStore.user.equipped_background_id === item.id;
  if (item.type === 'avatar') return authStore.user.equipped_avatar_id === item.id;
  if (item.type === 'post_background') return authStore.user.equipped_post_background_id === item.id;
  return false;
};

const getRarityBadge = (item) => {
  if (!item) return { label: 'COMÚN', classes: 'text-muted bg-foreground/5 border-border' };
  const rarity = item.rarity?.toLowerCase() || 'common';
  switch (rarity) {
    case 'calistenico': return { label: 'CALISTÉNICO', classes: 'text-[#ccff00] bg-[#ccff00]/10 border-[#ccff00]/40 shadow-[0_0_25px_rgba(204,255,0,0.4)] animate-pulse-subtle' };
    case 'legendary': return { label: 'LEGENDARIO', classes: 'text-primary-500 bg-primary-500/10 border-primary-500/30 shadow-[0_0_10px_rgba(255,69,0,0.2)]' };
    case 'epic':
    case 'especial': return { label: 'ESPECIAL', classes: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    case 'rare': return { label: 'RARO', classes: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    default: return { label: 'COMÚN', classes: 'text-muted bg-foreground/5 border-border' };
  }
};

const getCardClass = (item) => {
  const r = item.rarity?.toLowerCase();
  if (isEquipped(item)) return 'ring-2 ring-blue-500 border-transparent bg-blue-500/5 cursor-pointer';
  if (!item.is_unlocked) return 'opacity-60 grayscale';
  if (item.owned) return 'border-border opacity-80 cursor-pointer';

  if (r === 'calistenico') return 'border-[#ccff00]/50 bg-[#ccff00]/5 cursor-pointer hover:shadow-[0_0_30px_rgba(204,255,0,0.15)] hover:border-[#ccff00]';
  if (r === 'legendary') return 'border-primary-500/50 bg-primary-500/5 cursor-pointer hover:shadow-[0_0_30px_rgba(255,69,0,0.15)] hover:border-primary-500';
  if (r === 'epic' || r === 'especial') return 'border-purple-500/50 bg-purple-500/5 cursor-pointer hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:border-purple-500';
  if (r === 'rare') return 'border-blue-500/50 bg-blue-500/5 cursor-pointer hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-blue-500';
  return 'border-gray-700 opacity-80 bg-background/20 cursor-pointer hover:border-foreground/30';
};

const getBundleBgClass = (rarity) => {
  const r = rarity?.toLowerCase() || 'common';
  switch (r) {
    case 'calistenico': return 'from-[#ccff00]/10 to-[#ccff00]/5';
    case 'legendary': return 'from-primary-500/10 to-primary-500/5';
    case 'epic':
    case 'especial': return 'from-purple-500/10 to-purple-500/5';
    case 'rare': return 'from-blue-500/10 to-blue-500/5';
    default: return 'from-foreground/10 to-foreground/5';
  }
};

const getBundleBorderClass = (rarity) => {
  const r = rarity?.toLowerCase() || 'common';
  switch (r) {
    case 'calistenico': return 'border-[#ccff00]/30';
    case 'legendary': return 'border-primary-500/30';
    case 'epic':
    case 'especial': return 'border-purple-500/30';
    case 'rare': return 'border-blue-500/30';
    default: return 'border-foreground/30';
  }
};

const getBundleTextClass = (rarity, opacity = 1) => {
  const r = rarity?.toLowerCase() || 'common';
  let base = 'text-foreground';
  switch (r) {
    case 'calistenico': base = 'text-[#ccff00]'; break;
    case 'legendary': base = 'text-primary-500'; break;
    case 'epic':
    case 'especial': base = 'text-purple-400'; break;
    case 'rare': base = 'text-blue-400'; break;
  }
  if (opacity < 1) {
    return opacity === 0.4 ? `${base}/40` : (opacity === 0.5 ? `${base}/50` : `${base}/60`);
  }
  return base;
};

const getSlotIcon = (slot) => {
  switch (slot) {
    case 'head': return Construction;
    case 'weapon': return Sword;
    case 'armor': return Shield;
    case 'boots': return Footprints;
    default: return Sword;
  }
};

const getStatDifference = (item, stat) => {
  if (!authStore.user || !item.stats || item.type === 'consumable') return item.stats[stat] || 0;
  
  const slotMap = {
    head: authStore.user.equipped_head_id,
    weapon: authStore.user.equipped_weapon_id,
    armor: authStore.user.equipped_armor_id,
    boots: authStore.user.equipped_boots_id
  };
  
  const equippedId = slotMap[item.type];
  if (!equippedId) return item.stats[stat] || 0;
  
  const equippedItem = items.value.find(i => i.id === equippedId);
  if (!equippedItem || !equippedItem.stats) return item.stats[stat] || 0;
  
  return (item.stats[stat] || 0) - (equippedItem.stats[stat] || 0);
};

const equippedItems = computed(() => {
  if (!authStore.user) return [];
  const ids = [
    authStore.user.equipped_head_id,
    authStore.user.equipped_weapon_id,
    authStore.user.equipped_armor_id,
    authStore.user.equipped_boots_id
  ].filter(Boolean);
  return items.value.filter(i => ids.includes(i.id));
});

const currentBuildStats = computed(() => {
  const stats = { str: 0, pwr: 0, end: 0, agi: 0, vig: 0, dex: 0, cha: 0 };
  equippedItems.value.forEach(item => {
    if (item.stats) {
      for (const key in item.stats) {
        if (stats[key] !== undefined) stats[key] += item.stats[key];
      }
    }
  });
  return stats;
});

const isUpgrade = (item) => {
  if (!['head', 'weapon', 'armor', 'boots'].includes(item.type) || !item.stats || item.owned) return false;
  for (const stat in item.stats) {
    if (stat === 'duration' || stat === 'multiplier') continue;
    if (getStatDifference(item, stat) > 0) return true;
  }
  return false;
};

const getStatDiff = (stat, newValue) => {
  if (!authStore.user || !selectedItem.value) return 0;
  
  const slotMap = {
    head: authStore.user.equipped_head_id,
    weapon: authStore.user.equipped_weapon_id,
    armor: authStore.user.equipped_armor_id,
    boots: authStore.user.equipped_boots_id
  };
  
  const equippedId = slotMap[selectedItem.value.type];
  if (!equippedId) return newValue;
  
  const equippedItem = items.value.find(i => i.id === equippedId);
  if (!equippedItem || !equippedItem.stats) return newValue;
  
  const oldVal = equippedItem.stats[stat] || 0;
  return newValue - oldVal;
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
    if (item.type === 'head') authStore.user.equipped_head_id = item.id;
    if (item.type === 'weapon') authStore.user.equipped_weapon_id = item.id;
    if (item.type === 'armor') authStore.user.equipped_armor_id = item.id;
    if (item.type === 'boots') authStore.user.equipped_boots_id = item.id;
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

const activateConsumable = async (item) => {
  try {
    const res = await axios.post(`/api/shop/activate/${item.id}`);
    notificationStore.notify(i18n.t('consumable_activated'), 'success');
    // Refresh user data to get new multiplier
    await authStore.fetchProfile();
    // Refresh shop to update quantities
    await checkShop();
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Activation failed', 'error');
  }
};

const openBundleModal = (bundle) => {
  selectedBundle.value = bundle;
  const ids = bundle.bundle_items?.split(',').map(id => parseInt(id.trim())) || [];
  selectedBundleItems.value = items.value.filter(i => ids.includes(i.id));
  showBundleModal.value = true;
};

const openItemDetails = (item) => {
  if (item.type === 'bundle') {
    openBundleModal(item);
    return;
  }
  selectedItem.value = item;
  showItemModal.value = true;
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
@keyframes skeleton-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}
.animate-skeleton {
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(200%); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>


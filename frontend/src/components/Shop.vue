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
      
      <!-- Currency Display (Precision Pill) -->
      <div class="flex items-center gap-4 bg-surface/40 px-6 py-4 rounded-2xl border border-border shadow-2xl backdrop-blur-xl group hover:border-primary-500/30 transition-all">
        <div class="p-2 bg-primary-500/10 rounded-lg transition-transform">
          <Coins class="w-5 h-5 text-primary-500" />
        </div>
        <div class="flex flex-col">
          <span class="text-3xl font-black text-precision text-foreground tracking-tighter leading-none">{{ authStore.user?.reppy_coins || 0 }}</span>
          <span class="text-[8px] uppercase tracking-[0.3em] text-primary-500/70 font-black mt-1">{{ i18n.t('shop_reppy_coins') }}</span>
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
      <!-- Modern Filters Interface (Grid Layout) -->
      <div class="flex flex-col lg:flex-row items-center gap-6 bg-surface/20 p-4 rounded-3xl border border-border/50 backdrop-blur-sm relative z-30">
        
        <!-- Categories Dropdown (Left Side) -->
        <div class="w-full lg:w-72 relative z-20">
          <button 
            @click="showDropdown = !showDropdown"
            class="flex items-center gap-3 px-6 py-3 bg-surface/60 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary-500/30 transition-all w-full justify-between shadow-lg"
          >
            <div class="flex items-center gap-2">
              <component :is="categories.find(c => c.id === selectedCategory).icon" class="w-3.5 h-3.5 text-primary-500" />
              <span class="text-foreground">{{ i18n.t(categories.find(c => c.id === selectedCategory).label) || categories.find(c => c.id === selectedCategory).label }}</span>
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
                {{ i18n.t(cat.label) || cat.label }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Divider (Desktop only) -->
        <div class="hidden lg:block w-px h-10 bg-border/50"></div>

        <!-- Rarity Protocol Selector (Right Side) -->
        <div class="flex-1 flex flex-wrap items-center justify-start lg:justify-end gap-2">
          <button 
            v-for="rarity in rarities" 
            :key="rarity.id"
            @click="selectedRarity = rarity.id"
            class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 whitespace-nowrap"
            :class="selectedRarity === rarity.id ? rarity.activeClass : 'bg-surface/20 border-border text-muted hover:border-foreground/20'"
          >
            {{ rarity.label }}
          </button>
        </div>
      </div>

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
          <div class="lg:w-1/3 p-8 bg-gradient-to-br from-yellow-500/20 to-transparent border-r border-white/5 flex flex-col items-center justify-center gap-6">
            <div class="p-8 bg-yellow-500/10 rounded-[3rem] border border-yellow-500/20 shadow-2xl">
              <LayoutGrid class="w-24 h-24 text-yellow-500" />
            </div>
            <div class="text-center">
              <h2 class="text-3xl font-black text-industrial tracking-tighter text-yellow-500">{{ selectedBundle?.name }}</h2>
              <span class="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500/60 mt-2 block">{{ i18n.t('shop_elite_pack') }}</span>
            </div>
            <div class="flex items-center gap-4 px-6 py-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl w-full">
              <div class="flex flex-col flex-1">
                <span class="text-[8px] font-black text-yellow-500/50 uppercase tracking-widest">{{ i18n.t('shop_bundle_value') }}</span>
                <span class="text-2xl font-black text-yellow-500 tabular-nums">{{ selectedBundle?.price }} RC</span>
              </div>
              <div class="px-3 py-1.5 bg-yellow-500 text-black text-[9px] font-black rounded-lg">
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
                  <div class="w-8 h-8 sm:w-10 sm:h-10 bg-foreground/5 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-[10px] sm:text-xs uppercase">{{ stat }}</div>
                  <span class="text-[11px] sm:text-sm font-black text-foreground uppercase tracking-widest">{{ statLabels[stat] || stat }}</span>
                </div>
                <div class="flex items-center gap-3 sm:gap-4">
                  <span class="text-lg sm:text-xl font-black text-foreground tabular-nums">+{{ val }}</span>
                  <!-- Comparison -->
                  <div v-if="getStatDiff(stat, val) !== 0" class="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black" :class="getStatDiff(stat, val) > 0 ? 'text-neon-lime bg-neon-lime/10' : 'text-red-500 bg-red-500/10'">
                    <component :is="getStatDiff(stat, val) > 0 ? ChevronUp : ChevronDown" class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {{ Math.abs(getStatDiff(stat, val)) }}
                  </div>
                  <div v-else class="text-[9px] sm:text-[10px] font-black text-muted opacity-30">{{ i18n.t('shop_stat_equal') }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-2">
            <div class="flex flex-col items-center sm:items-start">
              <span class="text-[8px] sm:text-[10px] font-black text-muted uppercase tracking-widest mb-0.5 sm:mb-1">{{ i18n.t('shop_acquisition_cost') }}</span>
              <div class="flex items-baseline gap-1.5 sm:gap-2">
                <span class="text-2xl sm:text-3xl font-black text-foreground tabular-nums">{{ selectedItem?.price }}</span>
                <span class="text-[8px] sm:text-[10px] font-black text-muted uppercase tracking-widest">RC</span>
              </div>
            </div>
            <button 
              @click="buyItem(selectedItem); showItemModal = false"
              :disabled="!canAfford(selectedItem) || buying || selectedItem?.owned"
              class="w-full sm:flex-1 bg-primary-500 hover:bg-primary-400 text-white py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-black uppercase tracking-[0.2em] transition-all disabled:opacity-20 shadow-2xl shadow-primary-500/20 active:scale-95"
            >
              {{ selectedItem?.owned ? i18n.t('btn_acquired') : i18n.t('shop_initiate_acquisition') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

      <!-- Elite Bundles Highlight (Industrial Gold) -->
      <section v-if="bundleItems.length > 0 && selectedCategory === 'all' && selectedRarity === 'all'" class="relative z-10">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
          <div class="flex items-center gap-3">
             <div class="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
               <LayoutGrid class="w-5 h-5 text-yellow-500" />
             </div>
             <div>
               <h2 class="text-2xl font-black text-industrial text-yellow-500 tracking-tighter italic uppercase leading-none">
                 {{ i18n.t('shop_bundles_title') }}
               </h2>
               <p class="text-[9px] font-black text-muted uppercase tracking-[0.3em] mt-1">{{ i18n.t('shop_bundles_subtitle') }}</p>
             </div>
          </div>
          <div class="hidden sm:block h-px flex-1 bg-gradient-to-r from-yellow-500/40 to-transparent"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="item in bundleItems" 
            :key="item.id"
            @click="openBundleModal(item)"
            class="card-stats p-0 flex flex-col group/item bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.05)] overflow-hidden relative cursor-pointer"
            :class="getCardClass(item)"
          >
            <!-- Gold Glow Detail -->
            <div class="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/10 blur-[60px] rounded-full pointer-events-none transition-opacity group-hover/item:opacity-100 opacity-50"></div>

            <!-- Header Info -->
            <div class="p-4 pb-0 flex items-start justify-between z-10">
              <div class="flex items-center gap-2">
                <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-yellow-500/20 text-yellow-500 bg-yellow-500/10">
                  {{ i18n.t('shop_elite_pack') }}
                </span>
                <span class="px-2 py-1 bg-yellow-500 text-black text-[7px] font-black rounded-md shadow-lg shadow-yellow-500/20">30% OFF</span>
              </div>
              <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border" :class="getRarityBadge(item).classes">
                {{ getRarityBadge(item).label }}
              </span>
            </div>

            <!-- Preview Area -->
            <div class="h-48 flex items-center justify-center m-6 mb-2 bg-yellow-500/5 rounded-[2rem] border border-yellow-500/10 relative overflow-hidden group-hover/item:border-yellow-500/30 transition-colors shadow-inner">
               <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-500/10 to-transparent relative">
                  <div class="grid grid-cols-2 gap-2 p-4 scale-90">
                     <div class="w-12 h-12 bg-yellow-500/5 rounded-xl border border-yellow-500/10 flex items-center justify-center"><Sword class="w-6 h-6 text-yellow-500/40" /></div>
                     <div class="w-12 h-12 bg-yellow-500/5 rounded-xl border border-yellow-500/10 flex items-center justify-center"><Shield class="w-6 h-6 text-yellow-500/40" /></div>
                     <div class="w-12 h-12 bg-yellow-500/5 rounded-xl border border-yellow-500/10 flex items-center justify-center"><Zap class="w-6 h-6 text-yellow-500/40" /></div>
                     <div class="w-12 h-12 bg-yellow-500/5 rounded-xl border border-yellow-500/10 flex items-center justify-center"><Footprints class="w-6 h-6 text-yellow-500/40" /></div>
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div class="p-4 bg-surface/90 backdrop-blur-md rounded-2xl border border-yellow-500/30 shadow-2xl">
                        <LayoutGrid class="w-8 h-8 text-yellow-500 animate-pulse" />
                     </div>
                  </div>
               </div>
            </div>

            <div class="p-4 pt-0 mt-auto border-t border-yellow-500/10 bg-yellow-500/[0.02]">
              <div class="flex items-center justify-between mt-4">
                <div v-if="item.owned" class="flex items-center gap-1.5 text-neon-lime">
                  <Check class="w-3.5 h-3.5" />
                  <span class="text-[8px] font-black uppercase tracking-widest leading-none">{{ i18n.t('btn_acquired') }}</span>
                </div>
                <div v-else class="flex flex-col">
                  <div v-if="item.original_price" class="flex items-center gap-2 mb-0.5">
                    <span class="text-[10px] font-black text-muted line-through tracking-tighter">{{ item.original_price }}</span>
                    <span class="text-[8px] font-black bg-yellow-500/20 text-yellow-500 px-1.5 rounded uppercase">{{ i18n.t('shop_special_deal') }}</span>
                  </div>
                  <div class="flex items-baseline gap-1">
                    <span class="text-xl font-black text-precision text-yellow-500">{{ item.price }}</span>
                    <span class="text-[8px] font-black text-muted uppercase tracking-widest">{{ i18n.t('stats_reps') }}</span>
                  </div>
                </div>

                <button 
                  v-if="!item.owned"
                  @click.stop="buyItem(item)"
                  :disabled="!canAfford(item) || buying"
                  class="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 shadow-lg shadow-yellow-500/20 active:scale-95"
                >
                  {{ i18n.t('btn_acquire') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Collection -->
      <section>
        <div class="flex items-center gap-4 mb-10">
          <h2 class="text-xl font-black text-industrial text-foreground tracking-tight italic">{{ i18n.t('shop_permanent_protocol') }}</h2>
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
            <div class="p-4 pb-0 flex items-start justify-between z-10" @click="openItemDetails(item)">
              <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-border text-muted bg-foreground/5">
                #{{ item.roadmap_position || '??' }}
              </span>
              <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border" :class="getRarityBadge(item).classes">
                {{ getRarityBadge(item).label }}
              </span>
            </div>

            <!-- Preview Area -->
            <div class="h-32 flex items-center justify-center m-4 mb-2 bg-surface rounded-2xl border border-border relative overflow-hidden group-hover/item:border-primary-500/20 transition-colors shadow-inner" @click="openItemDetails(item)">
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
                  <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-[6px] font-black text-muted uppercase tracking-widest z-10">{{ i18n.t('shop_screen_preview') }}</div>
               </div>
               <div v-if="['head', 'weapon', 'armor', 'boots'].includes(item.type)" class="flex flex-col items-center gap-3">
                   <div class="p-4 rounded-2xl bg-gradient-to-br border shadow-2xl transition-transform duration-500 group-hover/item:scale-110"
                        :class="[getRarityBadge(item).classes, getRarityBadge(item).classes.includes('primary') ? 'from-primary-500/20 to-primary-500/5' : 'from-foreground/10 to-transparent']">
                     <ItemIcon :name="item.svg_key" :type="item.type" class-name="w-12 h-12" :class="getRarityBadge(item).classes?.split(' ')[0]" />
                   </div>
                   <div class="flex items-center gap-1.5">
                     <span class="text-[8px] font-black uppercase tracking-widest opacity-40">{{ item.type }}</span>
                   </div>
                </div>
                <div v-if="item.type === 'consumable'" class="flex flex-col items-center gap-2">
                   <FlaskConical class="w-10 h-10 animate-pulse" :class="getRarityBadge(item).classes?.split(' ')[0]" />
                   <span class="text-[8px] font-black uppercase tracking-widest" :class="getRarityBadge(item).classes?.split(' ')[0]">BOOST x{{ item.css_value }}</span>
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
                  <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 rounded border border-white/10 text-[6px] font-black text-muted uppercase tracking-widest z-10">{{ i18n.t('shop_post_preview') }}</div>
               </div>
            </div>

            <!-- Content -->
            <div class="p-4 pt-2 flex-1" @click="openItemDetails(item)">
              <h3 class="text-sm font-black text-industrial text-foreground mb-1">{{ item.name }}</h3>
              <p class="text-[10px] text-muted font-medium line-clamp-2 mb-4 leading-relaxed">{{ item.description }}</p>
              
              <div v-if="!item.is_unlocked" class="px-2 py-1.5 bg-red-500/5 border border-red-500/10 rounded-lg">
                <p class="text-[7px] font-black uppercase tracking-widest text-red-500/70">{{ i18n.t('shop_decrypt_at') }}: {{ getCountdown(item) }}</p>
              </div>
            </div>

            <!-- Action Footer -->
            <div class="p-4 pt-0 mt-auto border-t border-border bg-foreground/[0.01]">
              <div class="flex items-center justify-between mt-4">
                <div v-if="item.owned && item.type !== 'consumable'" class="flex items-center gap-1.5 text-neon-lime">
                  <Check class="w-3.5 h-3.5" />
                  <span class="text-[8px] font-black uppercase tracking-widest leading-none">{{ i18n.t('btn_acquired') }}</span>
                </div>
                <div v-else-if="item.owned && item.type === 'consumable'" class="flex items-center gap-1.5 text-primary-500">
                  <Package class="w-3.5 h-3.5" />
                  <span class="text-[8px] font-black uppercase tracking-widest leading-none">{{ i18n.t('shop_stock') }}: {{ item.quantity }}</span>
                </div>
                <div v-else-if="item.price > 0" class="flex flex-col">
                  <div v-if="item.original_price" class="flex items-center gap-2 mb-0.5">
                    <span class="text-[9px] font-black text-muted line-through tracking-tighter">{{ item.original_price }}</span>
                    <span class="text-[7px] font-black bg-primary-500/20 text-primary-500 px-1 rounded">{{ i18n.t('shop_special_deal') }}</span>
                  </div>
                  <div class="flex items-baseline gap-1">
                    <span class="text-base font-black text-precision" :class="canAfford(item) ? 'text-primary-500' : 'text-muted'">{{ item.price }}</span>
                    <span class="text-[7px] font-black text-muted uppercase tracking-widest">{{ i18n.t('shop_reppy_coins') }}</span>
                  </div>
                </div>
                <div v-else class="text-[8px] font-black uppercase tracking-widest text-primary-500/60 leading-none">{{ i18n.t('shop_event_badge') }}</div>

                <!-- Action Button -->
                <button 
                  v-if="(!item.owned || item.type === 'consumable') && item.price > 0"
                  @click="buyItem(item)"
                  :disabled="!canAfford(item) || buying || !item.is_unlocked"
                  class="btn-reppy !px-4 !py-2 !text-[8px] disabled:opacity-20 disabled:grayscale disabled:scale-100"
                >
                  {{ item.is_unlocked ? i18n.t('btn_get') : i18n.t('btn_lock') }}
                </button>
                
                <button 
                  v-if="item.owned && item.type !== 'bundle'"
                  @click="item.type === 'consumable' ? activateConsumable(item) : equipItem(item)"
                  :disabled="item.type !== 'consumable' && isEquipped(item)"
                  class="px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                  :class="item.type === 'consumable' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : (isEquipped(item) ? 'bg-foreground/5 text-muted border border-border' : 'bg-neon-lime text-black shadow-lg shadow-neon-lime/20')"
                >
                  {{ item.type === 'consumable' ? i18n.t('btn_activate') : (isEquipped(item) ? i18n.t('btn_on') : i18n.t('btn_equip')) }}
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
              :title="i18n.t('shop_prev')"
              :aria-label="i18n.t('shop_prev')"
              class="p-5 bg-surface/60 border border-border rounded-2xl hover:border-primary-500/30 disabled:opacity-20 transition-all group/prev shadow-xl active:scale-95"
            >
              <ChevronLeft class="w-5 h-5 group-hover/prev:-translate-x-1 transition-transform" />
            </button>
            
            <div class="flex items-center gap-2.5">
              <button 
                v-for="p in totalPages" 
                :key="p"
                @click="currentPage = p"
                :title="`${i18n.t('shop_go_to')} ${p}`"
                class="w-12 h-12 flex items-center justify-center rounded-2xl text-[11px] font-black tracking-widest transition-all border-2"
                :class="currentPage === p ? 'bg-primary-500 text-white border-primary-500 shadow-[0_0_25px_rgba(255,69,0,0.3)]' : 'bg-surface/40 text-muted border-border hover:border-primary-500/40 hover:text-foreground active:scale-90'"
              >
                {{ String(p).padStart(2, '0') }}
              </button>
            </div>

            <button 
              @click="currentPage < totalPages && (currentPage++)"
              :disabled="currentPage === totalPages"
              :title="i18n.t('shop_next')"
              :aria-label="i18n.t('shop_next')"
              class="p-5 bg-surface/60 border border-border rounded-2xl hover:border-primary-500/30 disabled:opacity-20 transition-all group/next shadow-xl active:scale-95"
            >
              <ChevronRight class="w-5 h-5 group-hover/next:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div class="flex flex-col items-center gap-2 relative z-10">
            <p class="text-[10px] font-black text-industrial text-foreground/40 uppercase tracking-[0.5em] italic">
              {{ i18n.t('shop_unit_page') }} <span class="text-primary-500">{{ currentPage }}</span> // {{ i18n.t('shop_total_chunks') }}: {{ totalPages }}
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
              class="card-stats p-0 flex flex-col group/item border-border"
              :class="getCardClass(item)"
            >
              <div v-if="!item.is_unlocked" class="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-[5] pointer-events-none flex items-center justify-center">
                 <div class="w-12 h-12 bg-surface/60 rounded-full flex items-center justify-center border border-border"><span class="text-xl">🔒</span></div>
              </div>
              <div class="p-4 pb-0 flex items-start justify-between z-10">
                <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-primary-500/20 text-primary-500 bg-primary-500/5">{{ i18n.t('shop_seasonal_badge') }}</span>
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
              <div class="p-4 pt-2 flex-1">
                <h3 class="text-sm font-black text-industrial text-foreground mb-1">{{ item.name }}</h3>
                <p class="text-[10px] text-muted font-medium line-clamp-2 mb-4 leading-relaxed">{{ item.description }}</p>
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
import { useNotificationStore } from '../stores/notification';
import { useI18nStore } from '../stores/i18n';
import { LayoutGrid, Type, Frame, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Coins, Check, Swords, X, Flame, Package, Sword, Shield, Footprints, Construction, FlaskConical, Zap, Info, ChevronUp, ChevronDown as ChevronDownIcon } from 'lucide-vue-next';
import AvatarFrame from './AvatarFrame.vue';
import BackgroundEffect from './BackgroundEffect.vue';
import ItemIcon from './ItemIcon.vue';

const emit = defineEmits(['start', 'viewProfile']);
const authStore = useAuthStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();

const items = ref([]);
const loading = ref(true);
const buying = ref(false);
const nowMs = ref(Date.now());
const showSeasonal = ref(false);
const showDropdown = ref(false);
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
  cha: 'Carisma'
};

const selectedCategory = ref('all');
const seasonalItems = computed(() => filteredItems.value.filter(item => item.is_seasonal));
const currentPage = ref(1);
const itemsPerPage = ref(15);

const categories = [
  { id: 'all', label: 'cat_all', icon: Swords },
  { id: 'bundle', label: 'cat_bundle', icon: LayoutGrid },
  { id: 'weapon', label: 'WEAPON', icon: Sword },
  { id: 'head', label: 'HELMET', icon: Zap },
  { id: 'armor', label: 'ARMOR', icon: Shield },
  { id: 'boots', label: 'BOOTS', icon: Footprints },
  { id: 'consumable', label: 'cat_consumable', icon: Flame }
];

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
  if (selectedCategory.value !== 'all') {
    result = result.filter(item => item.type === selectedCategory.value);
  }
  if (selectedRarity.value !== 'all') {
    result = result.filter(item => item.rarity?.toLowerCase() === selectedRarity.value);
  }
  return result.sort((a, b) => a.price - b.price);
});

const bundleItems = computed(() => items.value.filter(item => item.type === 'bundle'));
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

watch([selectedCategory, selectedRarity], () => {
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
  if (!item) return { label: 'COMÚN', classes: 'text-muted bg-foreground/5 border-border' };
  const rarity = item.rarity?.toLowerCase() || 'common';
  switch (rarity) {
    case 'calistenico': return { label: 'CALISTÉNICO', classes: 'text-[#ccff00] bg-[#ccff00]/10 border-[#ccff00]/30 shadow-[0_0_10px_rgba(204,255,0,0.2)]' };
    case 'legendary': return { label: 'LEGENDARIO', classes: 'text-primary-500 bg-primary-500/10 border-primary-500/30 shadow-[0_0_10px_rgba(255,69,0,0.2)]' };
    case 'epic':
    case 'especial': return { label: 'ESPECIAL', classes: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    case 'rare': return { label: 'RARO', classes: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    default: return { label: 'COMÚN', classes: 'text-muted bg-foreground/5 border-border' };
  }
};

const getCardClass = (item) => {
  const r = item.rarity?.toLowerCase();
  if (isEquipped(item)) return '!border-neon-lime/40 shadow-[0_0_30px_rgba(204,255,0,0.05)] cursor-pointer';
  if (item.owned) return 'border-border cursor-pointer';
  if (!item.is_unlocked) return 'opacity-60 grayscale';
  if (r === 'legendary') return 'border-primary-500/30 hover:border-primary-500/60 shadow-[0_0_20px_rgba(255,69,0,0.05)] cursor-pointer';
  if (r === 'calistenico') return 'border-[#ccff00]/30 hover:border-[#ccff00]/60 shadow-[0_0_25px_rgba(204,255,0,0.1)] cursor-pointer';
  return 'border-border hover:border-foreground/20 cursor-pointer';
};

const getSlotIcon = (slot) => {
  switch (slot) {
    case 'head': return Zap;
    case 'weapon': return Sword;
    case 'armor': return Shield;
    case 'boots': return Footprints;
    default: return Sword;
  }
};

const getStatDiff = (stat, newValue) => {
  if (!authStore.user || !selectedItem.value) return 0;
  
  // Find equipped item in the same slot
  const slotMap = {
    head: authStore.user.equipped_head_id,
    weapon: authStore.user.equipped_weapon_id,
    armor: authStore.user.equipped_armor_id,
    boots: authStore.user.equipped_boots_id
  };
  
  const equippedId = slotMap[selectedItem.value.type];
  if (!equippedId) return newValue; // No item equipped, full gain
  
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
</style>

<template>
  <div class="shop-page-wrapper pb-32">
    <div class="max-w-7xl mx-auto px-4 py-8 sm:py-12 animate-in relative z-10">

      <!-- DYNAMIC HEADER -->
      <div class="mb-8 space-y-4">
        <!-- Legendary Alert Banner -->
        <Transition name="fade-down">
          <div v-if="hasLegendaryDaily"
            class="bg-gradient-to-r from-yellow-600 to-yellow-400 p-2.5 rounded-[22px] flex items-center justify-center gap-3 shadow-lg shadow-yellow-500/20 border border-yellow-300/50 cursor-pointer mb-6 animate-pulse-glow"
            @click="activeTab = 'combat'; selectedCategory = 'all'">
            <Trophy class="w-4 h-4 text-white" />
            <span class="text-[10px] font-black text-white uppercase tracking-widest">{{
              i18n.t('shop_legendary_appeared') }}</span>
            <ArrowRight class="w-3 h-3 text-white" />
          </div>
        </Transition>

        <div class="flex items-center justify-between">
          <div>
            <h1
              class="text-3xl sm:text-4xl font-black text-industrial tracking-tighter text-foreground italic flex items-center gap-2">
              {{ i18n.t('shop_armory_title') }}<span class="text-primary-500">.</span>
            </h1>
            <p class="text-muted font-bold uppercase tracking-widest text-[8px] opacity-60">{{
              i18n.t('shop_armory_subtitle') }}</p>
          </div>

          <div class="flex items-center gap-2 sm:gap-4">
            <!-- Coins -->
            <div
              class="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-[22px] backdrop-blur-md shadow-inner group">
              <div class="p-1.5 bg-primary-500/10 rounded-lg group-hover:scale-110 transition-transform">
                <Coins class="w-4 h-4 text-primary-500" />
              </div>
              <span class="text-lg font-black tabular-nums">{{ authStore.user?.reppy_coins || 0 }}</span>
            </div>
            <!-- Gems -->
            <div
              class="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-[22px] backdrop-blur-md shadow-inner group">
              <div class="p-1.5 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                <Diamond class="w-4 h-4 text-emerald-500" />
              </div>
              <span class="text-lg font-black tabular-nums">{{ authStore.user?.reppy_gems || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-2 pt-4 overflow-x-auto no-scrollbar pb-2">
          <button
            v-for="tab in [{ id: 'combat', label: 'inv_tab_combat' }, { id: 'customization', label: 'inv_tab_customization' }]"
            :key="tab.id" @click="activeTab = tab.id; selectedCategory = 'all'; currentPage = 1"
            class="px-8 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] transition-all border whitespace-nowrap active:scale-95"
            :class="activeTab === tab.id ? 'bg-foreground text-background border-foreground shadow-2xl' : 'bg-white/5 text-muted border-white/5 hover:border-white/10'">
            {{ i18n.t(tab.label) }}
          </button>
        </div>
      </div>

      <!-- LOADING STATE -->
      <div v-if="loading" class="space-y-12">
        <div class="flex flex-col items-center justify-center py-24 gap-4">
          <Flame class="w-12 h-12 text-primary-500 animate-pulse" />
          <div class="h-4 w-48 bg-foreground/10 rounded animate-skeleton"></div>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="'skeleton-' + i"
            class="h-80 bg-white/5 border border-white/5 rounded-[22px] animate-skeleton"></div>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div v-else class="space-y-12 sm:space-y-16">

        <!-- SECTION 1: MERCADER DEL DÍA -->
        <section v-if="shopStore.dailyItems.length > 0 && selectedCategory === 'all' && activeTab === 'combat'"
          class="animate-in">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                <Flame class="w-6 h-6 text-primary-500 animate-pulse" />
              </div>
              <div>
                <h2
                  class="text-2xl sm:text-3xl font-black text-industrial text-foreground tracking-tighter uppercase italic leading-none">
                  {{ i18n.t('shop_daily_merchant') }}
                </h2>
                <div class="flex items-center gap-2 mt-1.5">
                  <Clock class="w-3.5 h-3.5 text-primary-500/60" />
                  <span class="text-[9px] font-black text-muted uppercase tracking-[0.3em]">{{
                    countdownText }}</span>
                </div>
              </div>
            </div>

            <button @click="refreshDailyShop"
              :disabled="buying || (authStore.user?.reppy_gems || 0) < shopStore.refreshCostGems"
              class="flex flex-col items-center gap-1 group px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[22px] transition-all active:scale-95 disabled:opacity-30">
              <span class="text-[7px] font-black text-muted uppercase tracking-widest">{{ i18n.t('shop_refresh_market')
                }}</span>
              <div class="flex items-center gap-2">
                <RefreshCcw class="w-4 h-4 text-primary-500 group-hover:rotate-180 transition-transform duration-700"
                  :class="{ 'animate-spin': buying }" />
                <span class="text-sm font-black tabular-nums">{{ shopStore.refreshCostGems || 1 }}</span>
                <Gem class="w-4 h-4 text-emerald-500" />
              </div>
            </button>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <div v-for="item in shopStore.dailyItems" :key="'daily-' + item.id"
              class="premium-card group/item relative h-full flex flex-col" 
              :class="[getCardClass(item), item.reward_type ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : '']"
              @click="item.reward_type ? claimReward(item) : openItemDetails(item)">
              <!-- Rarity Aura Overlay -->
              <div class="absolute inset-0 opacity-10 pointer-events-none rounded-[22px]" :class="[
                item.rarity === 'common' ? 'bg-slate-500' :
                  item.rarity === 'rare' ? 'bg-blue-500' :
                    item.rarity === 'epic' || item.rarity === 'especial' ? 'bg-purple-500' :
                      item.rarity === 'legendary' ? 'bg-yellow-500' :
                        item.rarity === 'calistenico' ? 'bg-red-600' : 'bg-primary-500'
              ]"></div>

              <div class="p-4 sm:p-8 flex-1 flex flex-col items-center relative z-10">
                <!-- Visual Area -->
                <div
                  class="w-full aspect-square bg-black/40 rounded-[22px] border border-white/5 relative overflow-hidden flex items-center justify-center mb-6 shadow-inner group-hover/item:border-white/10 transition-colors">
                  <!-- Global Upgrade Badge -->
                  <div v-if="isUpgrade(item)"
                    class="absolute top-2 right-2 z-20 px-2 py-1 bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest rounded-lg shadow-lg animate-bounce-subtle">
                    {{ i18n.t('shop_upgrade_badge') || 'MEJORA' }}
                  </div>

                  <!-- Animated Glow -->
                  <div class="absolute inset-0 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" :class="[
                    item.rarity === 'common' ? 'bg-slate-500' :
                      item.rarity === 'rare' ? 'bg-blue-500' :
                        item.rarity === 'epic' || item.rarity === 'especial' ? 'bg-purple-500' :
                          item.rarity === 'legendary' ? 'bg-yellow-500' :
                            item.rarity === 'calistenico' ? 'bg-red-600' : 'bg-primary-500'
                  ]"></div>

                  <div v-if="item.reward_type"
                    class="flex flex-col items-center transform group-hover/item:scale-110 transition-transform duration-700">
                    <component :is="item.reward_type === 'coins' ? Coins : Diamond"
                      class="w-16 h-16 sm:w-24 sm:h-24 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      :class="item.reward_type === 'coins' ? 'text-primary-500' : 'text-emerald-500'" />
                    <span class="mt-2 text-xl font-black italic tracking-tighter" :class="item.reward_type === 'coins' ? 'text-primary-500' : 'text-emerald-500'">
                      +{{ item.reward_amount }}
                    </span>
                  </div>
                  <ItemIcon v-else :name="item.svg_key" :type="item.type"
                    class-name="w-1/2 h-1/2 transform group-hover/item:scale-110 transition-transform duration-700"
                    :class="getRarityBadge(item).classes?.split(' ')[0]" />
                </div>

                <!-- Info Area -->
                <h3
                  class="font-black text-xs sm:text-xl uppercase italic tracking-tighter text-center line-clamp-1 mb-1">
                  {{ item.reward_type ? `${item.reward_amount} ${item.reward_type === 'coins' ? 'Reppy Coins' : 'Reppy Gems'}` : item.name }}
                </h3>
                <div
                  class="px-3 py-1 rounded-xl border font-black text-[8px] sm:text-[10px] tracking-[0.2em] uppercase mb-4"
                  :class="[item.reward_type ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/20' : getRarityBadge(item).classes]">
                  {{ item.reward_type ? i18n.t('shop_free_reward') : getRarityBadge(item).label }}
                </div>

                <!-- Stats Preview -->
                <div v-if="item.stats && Object.keys(item.stats).length > 0"
                  class="flex flex-wrap justify-center gap-2 mb-2">
                  <div v-for="(val, stat) in item.stats" :key="stat"
                    class="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                    <span class="text-[7px] font-black text-muted uppercase">{{ statLabels[stat]?.substring(0, 3) || stat
                      }}</span>
                    <span class="text-[9px] font-black" :class="val >= 0 ? 'text-neon-lime' : 'text-red-500'">+{{ val
                      }}</span>
                  </div>
                </div>
              </div>

              <!-- Purchase Footer -->
              <div
                class="mt-auto p-3 sm:p-5 border-t border-white/5 bg-black/60 rounded-b-[22px] flex items-center justify-center relative z-10">
                <div v-if="item.owned" class="flex items-center gap-2 text-neon-lime py-1.5">
                  <CheckCircle2 class="w-5 h-5" />
                  <span class="text-[10px] font-black uppercase tracking-widest">{{ i18n.t('btn_acquired') }}</span>
                </div>
                <button v-else-if="item.reward_type" @click.stop="claimReward(item)"
                  class="w-full py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                  {{ i18n.t('boss_claim_loot') }}
                  <Gift class="w-4 h-4" />
                </button>
                <button v-else @click.stop="tryOpenItemDetails(item)"
                  class="w-full min-h-[64px] p-2 bg-primary-500 text-white rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-lg shadow-primary-500/20 hover:bg-primary-400 group/buy"
                  :disabled="false">
                  <span
                    class="text-[10px] font-black uppercase tracking-[0.2em] text-center leading-tight break-words group-hover/buy:translate-x-[-2px] transition-transform">{{
                      i18n.t('btn_buy') || 'COMPRAR' }}</span>
                  <div class="flex flex-wrap items-center justify-center gap-2 bg-black/20 px-2 py-1 rounded-lg max-w-full">
                    <template v-if="item.price > 0">
                      <span class="text-xs font-black tabular-nums">{{ item.price }}</span>
                      <Coins class="w-3.5 h-3.5 text-primary-300" />
                    </template>
                    <template v-if="item.price_gems > 0">
                      <span class="text-xs font-black tabular-nums text-emerald-300">{{ item.price_gems }}</span>
                      <Gem class="w-3.5 h-3.5 text-emerald-300" />
                    </template>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 2: COFRES PREMIUM -->
        <section v-if="shopStore.chests.length > 0 && activeTab === 'combat' && selectedCategory === 'all'"
          class="animate-in">
          <div class="flex items-center gap-4 mb-8 ">
            <div class="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <ChestIcon variant="normal" class-name=" w-6 h-6" />
            </div>
            <h2
              class="text-2xl sm:text-3xl font-black text-industrial text-foreground tracking-tighter uppercase italic leading-none">
              {{ i18n.t('shop_premium_chests') }}
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
            <!-- Premium Chests -->
            <div v-for="chest in shopStore.chests" :key="chest.type"
              class="premium-card w-full p-0 flex flex-col group/chest relative overflow-hidden transition-all duration-500 hover:scale-[1.05] shadow-2xl border-emerald-500/10 hover:border-emerald-500/40">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent -z-10">
              </div>

              <div class="p-8 flex flex-col items-center">
                <!-- Animated Chest Visual -->
                <div
                  class="relative w-32 h-32 sm:w-40 sm:h-40 mb-6 group-hover/chest:scale-110 transition-transform duration-700 flex items-center justify-center">
                  <ChestIcon :variant="chest.id" class-name="w-full h-full relative z-10 object-contain" />
                  <div
                    class="absolute inset-0 bg-emerald-500/20 blur-[50px] -z-10 opacity-0 group-hover/chest:opacity-100 transition-opacity">
                  </div>
                </div>

                <h3 class="font-black text-xl sm:text-2xl uppercase italic mb-2 text-center tracking-tighter">{{
                  chest.name }}
                </h3>
                <p
                  class="text-[10px] text-muted font-bold uppercase tracking-tight opacity-60 text-center mb-8 px-6 leading-relaxed">
                  {{ chest.description }}</p>

                <button @click="purchaseChest(chest)"
                  :disabled="buying"
                  class="w-full py-4 rounded-[22px] bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-400 shadow-xl shadow-emerald-500/30 transition-all active:scale-95 disabled:grayscale disabled:opacity-50 flex items-center justify-center gap-3">
                  <span class="tabular-nums text-xl">{{ chest.price ?? chest.price_gems }}</span>
                  <Coins v-if="chest.currency === 'coins'" class="w-5 h-5 fill-white/20" />
                  <Gem v-else class="w-5 h-5 fill-white/20" />
                </button>
              </div>
            </div>

            <!-- Roulette Ticket Special Card in Chests Section -->
            <div v-if="rouletteTicketItem" 
              class="premium-card w-full p-0 flex flex-col group/ticket relative overflow-hidden transition-all duration-500 hover:scale-[1.05] shadow-2xl border-emerald-500/10 hover:border-emerald-500/40">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent -z-10"></div>
              
              <div class="p-8 flex flex-col items-center">
                <div class="relative w-32 h-32 sm:w-40 sm:h-40 mb-6 group-hover/ticket:scale-110 transition-transform duration-700 flex items-center justify-center">
                  <ItemIcon name="ticket" type="consumable" class-name="w-full h-full relative z-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] opacity-90 group-hover/ticket:opacity-100" />
                  <div class="absolute inset-0 bg-emerald-500/20 blur-[50px] -z-10 opacity-0 group-hover/ticket:opacity-100 transition-opacity"></div>
                </div>

                <h3 class="font-black text-xl sm:text-2xl uppercase italic mb-2 text-center tracking-tighter">{{ rouletteTicketItem.name }}</h3>
                <p class="text-[10px] text-muted font-bold uppercase tracking-tight opacity-60 text-center mb-8 px-6 leading-relaxed">
                  {{ rouletteTicketItem.description }}
                </p>

                <div class="mt-auto w-full">
                  <button @click="buyItem(rouletteTicketItem)"
                    :disabled="buying"
                    class="w-full py-4 rounded-[22px] bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-400 shadow-xl shadow-emerald-500/30 transition-all active:scale-95 disabled:grayscale disabled:opacity-50 flex items-center justify-center gap-3">
                    <span class="tabular-nums text-xl">{{ rouletteTicketItem.price_gems }}</span>
                    <Gem class="w-5 h-5 fill-white/20" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 3: OFERTAS LIMITADAS (PACKS) -->
        <section v-if="bundleItems.length > 0 && selectedCategory === 'all' && activeTab === 'combat'"
          class="animate-in">
          <div class="flex items-center gap-4 mb-8">
            <div class="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
              <Trophy class="w-6 h-6 text-yellow-500" />
            </div>
            <h2
              class="text-2xl sm:text-3xl font-black text-industrial text-foreground tracking-tighter uppercase italic leading-none">
              {{ i18n.t('shop_limited_offers') }}
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div v-for="item in bundleItems" :key="item.id" @click="openBundleModal(item)"
              class="premium-card p-6 sm:p-8 flex items-center gap-8 relative overflow-hidden group/bundle cursor-pointer hover:border-yellow-500/40 shadow-2xl">
              <!-- Bundle Visual -->
              <div
                class="relative w-28 h-28 sm:w-40 sm:h-40 flex-shrink-0 bg-black/40 rounded-[22px] border border-white/10 overflow-hidden flex items-center justify-center shadow-inner group-hover/bundle:border-yellow-500/20 transition-colors">
                <LayoutGrid
                  class="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 group-hover/bundle:scale-110 transition-transform duration-1000 animate-pulse" />
                <div
                  class="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-[12px] font-black px-4 py-2 rounded-tl-[22px] shadow-xl animate-bounce-subtle">
                  -30%</div>
                <!-- Scanning Effect -->
                <div
                  class="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent h-1/2 w-full animate-[scan_3s_infinite] pointer-events-none">
                </div>
              </div>

              <div class="flex-1 flex flex-col h-full">
                <div class="flex items-center gap-3 mb-2">
                  <span
                    class="text-[8px] font-black bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded uppercase tracking-widest">{{
                      i18n.t('shop_elite_pack') }}</span>
                </div>
                <h3 class="text-xl sm:text-3xl font-black tracking-tighter italic uppercase mb-2 leading-tight">{{
                  item.name }}
                </h3>
                <p class="text-[10px] text-muted font-bold uppercase tracking-widest opacity-60 line-clamp-1 mb-6">{{
                  item.description }}</p>

                <div class="mt-auto flex items-center justify-between">
                  <div class="flex flex-col">
                    <span v-if="item.original_price"
                      class="text-[9px] text-muted line-through opacity-40 font-black mb-1">VALOR: {{
                        item.original_price
                      }}</span>
                    <div class="flex items-center gap-4">
                      <span v-if="item.price > 0" class="text-2xl font-black tabular-nums">{{ item.price }} <span
                          class="text-[10px] text-muted font-black">RC</span></span>
                      <span v-if="item.price_gems > 0" class="text-2xl font-black tabular-nums text-emerald-400">{{
                        item.price_gems }}
                        <Gem class="w-5 h-5 inline fill-emerald-400/10" />
                      </span>
                    </div>
                  </div>
                  <div
                    class="px-6 py-3 bg-yellow-500 text-black text-xs font-black rounded-[18px] uppercase tracking-[0.2em] group-hover/bundle:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20 active:scale-95">
                    {{ i18n.t('btn_get') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 4: CONSUMIBLES -->
        <section
          v-if="consumableItems.length > 0 && activeTab === 'combat' && (selectedCategory === 'all' || selectedCategory === 'consumable')"
          class="animate-in">
          <div class="flex items-center gap-4 mb-8">
            <div class="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-lg shadow-purple-500/10">
              <Zap class="w-6 h-6 text-purple-500" />
            </div>
            <h2
              class="text-2xl sm:text-3xl font-black text-industrial text-foreground tracking-tighter uppercase italic leading-none">
              {{ i18n.t('shop_consumables') }}
            </h2>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div v-for="item in consumableItems" :key="item.id"
              class="premium-card p-4 sm:p-6 flex flex-col items-center group/cons cursor-pointer hover:border-purple-500/40 shadow-xl"
              @click="openItemDetails(item)">
              <div
                class="w-full aspect-square bg-black/40 rounded-[22px] border border-white/5 flex items-center justify-center mb-5 relative overflow-hidden shadow-inner group-hover/cons:border-white/10 transition-colors">
                <ItemIcon :name="item.svg_key" :type="item.type"
                  class-name="w-1/2 h-1/2 text-purple-400 group-hover/cons:scale-110 transition-transform duration-700" />
                <div
                  class="absolute inset-0 bg-purple-500/10 opacity-0 group-hover/cons:opacity-100 transition-opacity">
                </div>
              </div>

              <h3
                class="text-[10px] sm:text-xs font-black uppercase italic tracking-tighter text-center mb-2 line-clamp-1">
                {{
                item.name }}</h3>

              <div class="mt-auto pt-4 flex flex-col items-center gap-2">
                <div v-if="item.price > 0" class="flex items-center gap-2">
                  <span class="text-sm font-black tabular-nums">{{ item.price }}</span>
                  <Coins class="w-4 h-4 text-primary-500" />
                </div>
                <div v-if="item.price_gems > 0" class="flex items-center gap-2">
                  <span class="text-sm font-black tabular-nums text-emerald-400">{{ item.price_gems }}</span>
                  <Gem class="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- REGULAR CATALOG -->
        <section v-if="paginatedItems.length > 0 && (activeTab === 'customization' || selectedCategory !== 'all')"
          class="space-y-12 relative pt-16 border-t border-white/5 animate-in">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                <component :is="activeTab === 'combat' ? Swords : Sparkles" class="w-6 h-6 text-foreground/60" />
              </div>
              <div>
                <h2
                  class="text-2xl sm:text-3xl font-black text-industrial text-foreground tracking-tighter italic uppercase leading-none">
                  {{ activeTab === 'combat' ? i18n.t('shop_gear_title') : i18n.t('shop_custom_title') }}
                </h2>
                <p class="text-[9px] font-black text-muted uppercase tracking-[0.4em] mt-1.5 opacity-60">
                  {{ activeTab === 'combat' ? 'EQUIPAMIENTO TÁCTICO ESTÁNDAR' : 'MÓDULOS DE IDENTIDAD REPPY' }}
                </p>
              </div>
            </div>

            <!-- Category Filters -->
            <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <button v-for="cat in categories" :key="cat.id" @click="selectedCategory = cat.id; currentPage = 1"
                class="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 flex items-center gap-3 active:scale-95"
                :class="selectedCategory === cat.id ? 'bg-foreground text-background border-foreground shadow-2xl' : 'bg-white/5 text-muted border-white/5 hover:border-white/10'">
                <component :is="cat.icon" class="w-4 h-4" />
                {{ i18n.t(cat.label) }}
              </button>
            </div>
          </div>

          <!-- Items Grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8">
            <div v-for="item in paginatedItems" :key="'reg-' + item.id"
              class="premium-card p-0 flex flex-col group/item relative overflow-hidden cursor-pointer"
              :class="getCardClass(item)" @click="openItemDetails(item)">
              <!-- Rarity Badge -->
              <div class="absolute top-3 left-3 z-20">
                <div
                  class="px-2.5 py-1 rounded-lg border font-black text-[7px] sm:text-[9px] tracking-widest uppercase backdrop-blur-md shadow-xl"
                  :class="getRarityBadge(item).classes">
                  {{ getRarityBadge(item).label }}
                </div>
              </div>

              <!-- Visual Preview -->
              <div
                class="flex items-center justify-center m-2 sm:m-4 bg-black/40 rounded-[18px] border border-white/5 relative overflow-hidden group-hover/item:border-white/10 transition-colors shadow-inner h-32 sm:h-48">
                <!-- Global Upgrade Badge -->
                <div v-if="isUpgrade(item)"
                  class="absolute top-2 right-2 z-20 px-1.5 py-0.5 bg-emerald-500 text-white text-[6px] font-black uppercase tracking-widest rounded shadow-lg animate-pulse">
                  {{ i18n.t('shop_upgrade_badge') || 'MEJORA' }}
                </div>

                <div class="absolute inset-0 opacity-10 blur-2xl pointer-events-none transition-colors"
                  :class="[getRarityBadge(item).classes.split(' ')[1].replace('/10', '/20')]"></div>

                <div v-if="item.type === 'title'"
                  class="text-xs sm:text-xl text-center px-4 leading-tight font-black uppercase italic tracking-tighter"
                  :class="item.css_value">{{ item.name }}</div>
                <div v-else-if="item.type === 'border'">
                  <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'"
                    :border-css="item.css_value" :size="windowWidth < 640 ? 70 : 100" />
                </div>
                <div v-else-if="item.type === 'avatar'">
                  <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'"
                    :avatar-css="item.css_value" :size="windowWidth < 640 ? 70 : 100" />
                </div>
                <div v-else-if="item.type === 'background' || item.type === 'post_background'"
                  class="w-full h-full relative overflow-hidden">
                  <div v-if="item.type === 'background'" class="w-full h-full">
                    <BackgroundEffect :background-css="item.css_value" is-preview
                      class="!absolute !inset-0 !w-full !h-full" />
                  </div>
                  <div v-else class="w-full h-full flex items-center justify-center p-4">
                    <div class="w-full h-full bg-black border border-white/10 rounded-xl relative overflow-hidden"
                      :class="selectedItem?.css_value"></div>
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>
                <ItemIcon v-else :name="item.svg_key" :type="item.type" class-name="w-1/2 h-1/2 p-2"
                  :class="getRarityBadge(item).classes?.split(' ')[0]" />
              </div>

              <!-- Content -->
              <div class="p-4 pt-0 text-center flex-1 flex flex-col justify-center">
                <h3 class="font-black text-[10px] sm:text-sm uppercase italic tracking-tight line-clamp-1 mb-3">{{
                  item.name }}
                </h3>

                <div
                  class="flex items-center justify-center mt-auto border-t border-white/5 bg-black/40 rounded-b-[22px] -mx-4 -mb-4 overflow-hidden">
                  <div v-if="item.owned" class="flex items-center justify-center gap-2 text-neon-lime p-3">
                    <CheckCircle2 class="w-4 h-4" />
                    <span class="text-[9px] font-black uppercase tracking-widest">{{ i18n.t('btn_acquired') }}</span>
                  </div>
                  <button v-else @click.stop="openItemDetails(item)"
                    class="w-full flex items-center justify-center gap-4 p-3 bg-primary-500/10 hover:bg-primary-500 text-white transition-all group/catbuy"
                    :disabled="!canAfford(item)">
                    <span
                      class="text-[9px] font-black uppercase tracking-widest group-hover/catbuy:scale-110 transition-transform">{{
                        i18n.t('btn_buy') || 'COMPRAR' }}</span>
                    <div class="flex items-center gap-2">
                      <div v-if="item.price > 0" class="flex items-center gap-1">
                        <span class="text-xs font-black tabular-nums">{{ item.price }}</span>
                        <Coins class="w-3.5 h-3.5 text-primary-400" />
                      </div>
                      <div v-if="item.price_gems > 0" class="flex items-center gap-1">
                        <span class="text-xs font-black tabular-nums text-emerald-400">{{ item.price_gems }}</span>
                        <Gem class="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 mt-12 pb-24">
            <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
              class="p-4 rounded-[18px] bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all active:scale-90">
              <ChevronLeft class="w-5 h-5" />
            </button>
            <div
              class="px-6 py-3 rounded-[18px] bg-white/5 border border-white/10 font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <span class="text-primary-500">{{ currentPage }}</span>
              <span class="opacity-30">/</span>
              <span>{{ totalPages }}</span>
            </div>
            <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages"
              class="p-4 rounded-[18px] bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all active:scale-90">
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
        </section>

      </div>
    </div>

    <!-- MODALS -->

    <!-- Bundle Details Modal -->
    <Transition name="modal-fade">
      <div v-if="showBundleModal && selectedBundle" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-2xl" @click="showBundleModal = false"></div>
        <div
          class="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] animate-modal-in max-h-[90vh] flex flex-col">

          <div class="absolute top-4 right-4 z-20">
            <button @click="showBundleModal = false"
              class="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
              <X class="w-5 h-5 text-white" />
            </button>
          </div>

          <div class="p-8 flex-1 overflow-y-auto no-scrollbar">
            <div class="flex items-center gap-6 mb-8">
              <div
                class="w-24 h-24 sm:w-32 sm:h-32 bg-yellow-500/10 rounded-[22px] border border-yellow-500/30 flex items-center justify-center">
                <LayoutGrid class="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 animate-pulse" />
              </div>
              <div>
                <h2
                  class="text-3xl sm:text-4xl font-black text-industrial tracking-tighter italic uppercase leading-none">
                  {{ selectedBundle.name }}</h2>
                <p class="text-xs text-muted font-bold uppercase tracking-widest mt-2 opacity-60">{{
                  selectedBundle.description }}</p>
                <div
                  class="mt-4 px-3 py-1 bg-yellow-500 text-black text-[10px] font-black rounded-lg inline-flex items-center gap-2">
                  <Timer class="w-3 h-3" /> OFERTA POR TIEMPO LIMITADO
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <h3 class="text-xs font-black uppercase tracking-[0.3em] text-muted flex items-center gap-3">
                {{ i18n.t('shop_bundle_contents') }}
                <div class="h-px flex-1 bg-white/5"></div>
              </h3>

              <div class="grid grid-cols-2 gap-4">
                <div v-for="item in selectedBundleItems" :key="item.id"
                  class="p-4 bg-white/5 border border-white/5 rounded-[22px] flex items-center gap-4 group hover:border-white/10 transition-all cursor-pointer"
                  @click="openItemDetails(item)">
                  <div
                    class="w-12 h-12 sm:w-16 sm:h-16 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                    <ItemIcon :name="item.svg_key" :type="item.type"
                      class-name="w-1/2 h-1/2 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <div class="text-[10px] sm:text-xs font-black uppercase italic tracking-tighter line-clamp-1">{{
                      item.name }}</div>
                    <div class="text-[7px] font-black uppercase tracking-widest opacity-40 mt-1">{{ item.type }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-8 bg-black/40 border-t border-white/5">
            <div class="flex items-center justify-between gap-6">
              <div class="flex flex-col">
                <span class="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{{
                  i18n.t('shop_bundle_value') }}</span>
                <div class="flex items-center gap-4">
                  <div v-if="selectedBundle.price > 0" class="flex items-center gap-2">
                    <span class="text-3xl font-black tabular-nums">{{ selectedBundle.price }}</span>
                    <span class="text-[10px] font-black text-muted uppercase">RC</span>
                  </div>
                  <div v-if="selectedBundle.price_gems > 0" class="flex items-center gap-2">
                    <span class="text-3xl font-black tabular-nums text-emerald-400">{{ selectedBundle.price_gems
                      }}</span>
                    <Gem class="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
              </div>

              <button v-if="!selectedBundle.owned" @click="buyItem(selectedBundle); showBundleModal = false"
                :disabled="buying"
                class="flex-1 sm:flex-initial px-10 py-5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-[22px] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-yellow-500/20 active:scale-95 disabled:grayscale">
                {{ i18n.t('shop_initiate_acquisition') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Item Details Modal -->
    <Transition name="modal-fade">
      <div v-if="showItemModal && selectedItem" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/90 backdrop-blur-2xl" @click="showItemModal = false"></div>
        <div
          class="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.9)] animate-modal-in flex flex-col max-h-[90vh]">

          <button @click="showItemModal = false"
            class="absolute top-4 right-4 z-20 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
            <X class="w-5 h-5 text-white" />
          </button>

          <div class="p-8 flex-1 overflow-y-auto no-scrollbar">
            <!-- Rarity Aura -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[100px] opacity-20 pointer-events-none"
              :class="[
                selectedItem.rarity === 'common' ? 'bg-slate-500' :
                  selectedItem.rarity === 'rare' ? 'bg-blue-500' :
                    selectedItem.rarity === 'epic' || selectedItem.rarity === 'especial' ? 'bg-purple-500' :
                      selectedItem.rarity === 'legendary' ? 'bg-yellow-500' :
                        selectedItem.rarity === 'calistenico' ? 'bg-red-600' : 'bg-primary-500'
              ]"></div>

            <div class="flex flex-col items-center mb-10 relative z-10">
              <div class="px-4 py-1.5 rounded-xl border font-black text-[10px] tracking-[0.3em] uppercase mb-8"
                :class="getRarityBadge(selectedItem).classes">
                {{ getRarityBadge(selectedItem).label }}
              </div>

              <div
                class="w-48 h-48 sm:w-64 sm:h-64 bg-black/40 rounded-[32px] border border-white/5 flex items-center justify-center relative overflow-hidden group shadow-2xl mb-8">
                <div v-if="selectedItem.type === 'title'"
                  class="text-xl sm:text-3xl text-center px-6 leading-tight font-black uppercase italic tracking-tighter"
                  :class="selectedItem.css_value">{{ selectedItem.name }}</div>
                <div v-else-if="selectedItem.type === 'border'">
                  <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'"
                    :border-css="selectedItem.css_value" :size="160" />
                </div>
                <div v-else-if="selectedItem.type === 'avatar'">
                  <AvatarFrame :src="authStore.user?.avatar_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=reppy'"
                    :avatar-css="selectedItem.css_value" :size="160" />
                </div>
                <div v-else-if="selectedItem.type === 'background' || selectedItem.type === 'post_background'"
                  class="w-full h-full">
                  <BackgroundEffect v-if="selectedItem.type === 'background'" :background-css="selectedItem.css_value"
                    is-preview class="!absolute !inset-0 !w-full !h-full" />
                  <div v-else class="w-full h-full bg-black border border-white/10 rounded-xl relative overflow-hidden"
                    :class="selectedItem.css_value"></div>
                </div>
                <ItemIcon v-else :name="selectedItem.svg_key" :type="selectedItem.type"
                  class-name="w-1/2 h-1/2 drop-shadow-2xl"
                  :class="getRarityBadge(selectedItem).classes?.split(' ')[0]" />
              </div>

              <h2
                class="text-3xl sm:text-5xl font-black text-industrial tracking-tighter italic uppercase text-center mb-2">
                {{ selectedItem.name }}</h2>
              <p
                class="text-[10px] sm:text-xs text-muted font-bold uppercase tracking-[0.3em] opacity-40 text-center px-12 leading-relaxed">
                {{ selectedItem.description }}</p>
            </div>

            <!-- Stats & Benefits -->
            <div v-if="selectedItem.stats && Object.keys(selectedItem.stats).length > 0"
              class="space-y-6 relative z-10">
              <h3 class="text-xs font-black uppercase tracking-[0.3em] text-muted flex items-center gap-3">
                {{ i18n.t('shop_combat_analysis') }}
                <div class="h-px flex-1 bg-white/5"></div>
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="(val, stat) in selectedItem.stats" :key="stat"
                  class="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-white/5 rounded-lg border border-white/10">
                      <component :is="stat === 'duration' ? Clock : (stat === 'multiplier' ? Zap : Activity)"
                        class="w-4 h-4 text-muted" />
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-muted">{{ statLabels[stat] ||
                      stat
                      }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span v-if="isUpgrade(selectedItem, stat)" class="text-[9px] font-black text-neon-lime">↑</span>
                    <span class="text-xl font-black tabular-nums"
                      :class="val >= 0 ? 'text-neon-lime' : 'text-red-500'">{{
                        val > 0 ? '+' : '' }}{{ val }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-8 bg-black/60 border-t border-white/10 relative z-10">
            <div v-if="selectedItem.owned" class="flex flex-col gap-4">
              <div
                class="flex items-center justify-center gap-3 py-4 bg-neon-lime/10 border border-neon-lime/20 rounded-[22px] text-neon-lime">
                <CheckCircle2 class="w-5 h-5" />
                <span class="text-sm font-black uppercase tracking-widest">{{ i18n.t('btn_acquired') }}</span>
              </div>
              <button v-if="selectedItem.type !== 'bundle' && selectedItem.type !== 'consumable' && selectedItem.type !== 'custom'"
                @click="equipItem(selectedItem); showItemModal = false" :disabled="isEquipped(selectedItem)"
                class="w-full py-5 rounded-[22px] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95"
                :class="isEquipped(selectedItem) ? 'bg-white/5 text-muted border border-white/10 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-400 shadow-xl shadow-blue-600/20'">
                {{ isEquipped(selectedItem) ? i18n.t('inv_unlink_artifact') : i18n.t('btn_equip') }}
                <component :is="isEquipped(selectedItem) ? Check : Zap" class="w-4 h-4" />
              </button>
            </div>

            <div v-else class="flex flex-col sm:flex-row items-center gap-6">
              <div class="flex-1 flex flex-col items-center sm:items-start">
                <span class="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{{
                  i18n.t('shop_initiate_acquisition') }}</span>
                <div class="flex items-center gap-4">
                  <div v-if="selectedItem.price > 0" class="flex items-center gap-2">
                    <span class="text-3xl font-black tabular-nums">{{ selectedItem.price }}</span>
                    <Coins class="w-5 h-5 text-primary-500" />
                  </div>
                  <div v-if="selectedItem.price_gems > 0" class="flex items-center gap-2">
                    <span class="text-3xl font-black tabular-nums text-emerald-400">{{ selectedItem.price_gems }}</span>
                    <Gem class="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
              </div>

              <button @click="buyItem(selectedItem); showItemModal = false"
                :disabled="buying"
                class="w-full sm:w-auto px-12 py-5 rounded-[22px] bg-primary-500 hover:bg-primary-400 text-white font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary-500/30 active:scale-95 disabled:grayscale">
                {{ i18n.t('btn_get') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Chest Opening Modal -->
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
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useShopStore } from '../stores/shop';
import { useRouletteStore } from '../stores/roulette';
import { useNotificationStore } from '../stores/notification';
import { useI18nStore } from '../stores/i18n';
import { LayoutGrid, Type, Frame, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Coins, Diamond, Check, Swords, X, Flame, Package, Sword, Shield, Footprints, Construction, FlaskConical, Zap, Info, ChevronUp, Users, Activity, Lock, CheckCircle2, Clock, Timer, Box, Trophy, RefreshCcw, Gem, Gift, ArrowRight } from 'lucide-vue-next';
import AvatarFrame from './AvatarFrame.vue';
import BackgroundEffect from './BackgroundEffect.vue';
import ItemIcon from './ItemIcon.vue';
import ChestIcon from './ChestIcon.vue';
import ChestOpening from './ChestOpening.vue';
import { getCombatScore, isItemUpgrade, normalizeStats } from '../composables/useItemUpgrade';

const emit = defineEmits(['start', 'viewProfile']);
const authStore = useAuthStore();
const shopStore = useShopStore();
const rouletteStore = useRouletteStore();
const i18n = useI18nStore();
const notificationStore = useNotificationStore();

const items = computed(() => shopStore.cosmetics);
const allPossibleItems = computed(() => [...shopStore.cosmetics, ...shopStore.dailyItems]);
const loading = computed(() => shopStore.loading);
const buying = ref(false);
const nowMs = ref(Date.now());
const showBundleModal = ref(false);
const showItemModal = ref(false);
const selectedBundle = ref(null);
const selectedItem = ref(null);
const selectedBundleItems = ref([]);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
let countdownTimer = null;
const showChestModal = ref(false);
const chestReward = ref(null);
const reelItems = ref([]);

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

const selectedCategory = ref('all');
const activeTab = ref('combat');
const currentPage = ref(1);
const itemsPerPage = ref(15);

const categories = computed(() => {
  if (activeTab.value === 'combat') {
    return [
      { id: 'all', label: 'cat_all', icon: Swords },
      { id: 'bundle', label: 'cat_bundle', icon: LayoutGrid },
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

const countdownText = computed(() => {
  if (!shopStore.nextRotation) return '00:00:00';
  const target = new Date(shopStore.nextRotation).getTime();
  if (isNaN(target)) return '00:00:00';
  
  const diff = Math.max(0, target - nowMs.value);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const purchaseChest = async (chest) => {
  const required = chest.price ?? chest.price_gems ?? 0;
  const hasFunds = chest.currency === 'coins'
    ? (authStore.user?.reppy_coins || 0) >= required
    : (authStore.user?.reppy_gems || 0) >= required;
  if (!hasFunds) {
    notificationStore.notify(i18n.locale === 'es' ? 'No tienes suficiente dinero' : 'Not enough funds', 'error');
    return;
  }
  buying.value = true;
  try {
    const res = await shopStore.buyChest(chest.id);
    if (authStore.user) {
      if (typeof res.remaining_coins === 'number') authStore.user.reppy_coins = res.remaining_coins;
      if (typeof res.remaining_gems === 'number') authStore.user.reppy_gems = res.remaining_gems;
    }
    notificationStore.notify(`Chest Acquired: ${chest.name}`, 'success');
    await authStore.fetchProfile();
    await openPurchasedChest(chest.id);
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Exchange failed', 'error');
  } finally {
    buying.value = false;
  }
};

const openPurchasedChest = async (type) => {
  try {
    let endpoint = '/api/boss/open-chest';
    if (type === 'epic') endpoint = '/api/boss/open-epic-chest';
    if (type === 'legendary') endpoint = '/api/boss/open-legendary-chest';

    const res = await axios.post(endpoint);
    chestReward.value = res.data?.reward || res.data;
    reelItems.value = res.data?.reel_items || [];
    showChestModal.value = true;
    await authStore.fetchProfile();
  } catch (error) {
    notificationStore.notify(
      i18n.locale === 'es'
        ? 'Cofre comprado. No se pudo abrir automáticamente, puedes abrirlo desde Inventario.'
        : 'Chest purchased. Auto-open failed, you can open it from Inventory.',
      'warning'
    );
  }
};

const closeChestModal = async () => {
  showChestModal.value = false;
  await authStore.fetchProfile();
  await shopStore.fetchInventory(true);
};

const claimReward = async (deal) => {
  if (deal.owned || buying.value) return;
  buying.value = true;
  try {
    const res = await shopStore.claimDailyReward(deal.id);
    notificationStore.notify(`${res.type === 'coins' ? 'RC' : 'Gems'} claimed: ${res.amount}`, 'success');
    if (authStore.user) {
      if (res.reppy_coins !== undefined) authStore.user.reppy_coins = res.reppy_coins;
      if (res.reppy_gems !== undefined) authStore.user.reppy_gems = res.reppy_gems;
    }
    await authStore.fetchProfile(true);
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Claim failed', 'error');
  } finally {
    buying.value = false;
  }
};

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
  return result.sort((a, b) => a.price - b.price);
});

const rouletteTicketItem = computed(() => items.value.find(item => item.name === 'Ticket de Ruleta'));
const bundleItems = computed(() => filteredItems.value.filter(item => item.type === 'bundle' && item.name !== 'Ticket de Ruleta'));
const consumableItems = computed(() => items.value.filter(item => item.type === 'consumable'));
const hasLegendaryDaily = computed(() => shopStore.dailyItems.some(item => item.rarity === 'legendary' || item.rarity === 'calistenico'));

const getBundlePreviewItems = (bundle) => {
  const ids = extractBundleItemIds(bundle);
  return allPossibleItems.value
    .filter(i => ids.includes(i.id) || ids.includes(i.item_id))
    .slice(0, 4);
};

const extractBundleItemIds = (bundle) => {
  if (!bundle) return [];

  // Supports legacy CSV field: "12,13,14"
  if (typeof bundle.bundle_items === 'string' && bundle.bundle_items.trim()) {
    return bundle.bundle_items
      .split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(Number.isFinite);
  }

  // Supports array/object payloads from API variants: pack.items / pack.contents
  const rawList = bundle.items || bundle.contents || bundle.bundle_items;
  if (Array.isArray(rawList)) {
    return rawList
      .map(entry => {
        if (typeof entry === 'number') return entry;
        if (typeof entry === 'string') return parseInt(entry, 10);
        if (entry && typeof entry === 'object') return entry.id ?? entry.item_id;
        return null;
      })
      .map(v => (typeof v === 'string' ? parseInt(v, 10) : v))
      .filter(Number.isFinite);
  }

  return [];
};

const regularItems = computed(() => {
  return filteredItems.value.filter(item => !item.is_seasonal && item.type !== 'bundle');
});

const totalPages = computed(() => Math.ceil(regularItems.value.length / itemsPerPage.value));
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return regularItems.value.slice(start, start + itemsPerPage.value);
});

watch([selectedCategory, activeTab], () => {
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
  const price = item.discounted_price ?? item.price ?? 0;
  const gems = item.discounted_gems ?? item.price_gems ?? 0;
  return (authStore.user?.reppy_coins || 0) >= price && (authStore.user?.reppy_gems || 0) >= gems;
};

const tryOpenItemDetails = (item) => {
  if (!canAfford(item)) {
    notificationStore.notify(i18n.locale === 'es' ? 'No tienes suficiente dinero' : 'Not enough funds', 'error');
    return;
  }
  openItemDetails(item);
};

const isEquipped = (item) => {
  if (!authStore.user || item.type === 'bundle') return false;
  const id = item.item_id || item.id;
  const u = authStore.user;
  if (item.type === 'head') return u.equipped_head_id === id;
  if (item.type === 'weapon') return u.equipped_weapon_id === id;
  if (item.type === 'armor') return u.equipped_armor_id === id;
  if (item.type === 'boots') return u.equipped_boots_id === id;
  if (item.type === 'title') return u.equipped_title_id === id;
  if (item.type === 'border') return u.equipped_border_id === id;
  if (item.type === 'background') return u.equipped_background_id === id;
  if (item.type === 'avatar') return u.equipped_avatar_id === id;
  if (item.type === 'post_background') return u.equipped_post_background_id === id;
  return false;
};

const getRarityBadge = (item) => {
  if (!item) return { label: 'COMÚN', classes: 'text-muted border-white/10' };
  const rarity = item.rarity?.toLowerCase() || 'common';
  switch (rarity) {
    case 'calistenico': return { label: 'MÍTICO', classes: 'text-red-500 bg-red-500/10 border-red-500/40 shadow-red-500/20' };
    case 'legendary': return { label: 'LEGENDARIO', classes: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/40 shadow-yellow-500/20' };
    case 'especial':
    case 'epic': return { label: 'ÉPICO', classes: 'text-purple-400 bg-purple-500/10 border-purple-500/30 shadow-purple-500/20' };
    case 'rare': return { label: 'RARO', classes: 'text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-blue-500/20' };
    default: return { label: 'COMÚN', classes: 'text-slate-400 bg-white/5 border-white/10' };
  }
};

const getCardClass = (item) => {
  const r = item.rarity?.toLowerCase();
  if (isEquipped(item)) return 'ring-2 ring-blue-500 border-transparent bg-blue-500/5';
  if (item.owned) return 'opacity-80';
  return '';
};

function getStatDifference(item, stat) {
  const itemStats = normalizeStats(item?.stats);
  if (!authStore.user || !itemStats || item.type === 'consumable') return itemStats?.[stat] || 0;
  const slotMap = { head: 'equipped_head_id', weapon: 'equipped_weapon_id', armor: 'equipped_armor_id', boots: 'equipped_boots_id' };
  const equippedId = authStore.user[slotMap[item.type]];
  if (!equippedId) return itemStats[stat] || 0;
  const equippedItem = allPossibleItems.value.find(i => i.id === equippedId);
  const equippedStats = normalizeStats(equippedItem?.stats);
  if (!equippedItem || !equippedStats) return itemStats[stat] || 0;
  return (itemStats[stat] || 0) - (equippedStats[stat] || 0);
}

function isUpgrade(item, stat = null) {
  if (!['head', 'weapon', 'armor', 'boots'].includes(item.type) || !item.stats || item.owned) return false;
  if (!authStore.user) return false;

  if (stat) {
    // Keep per-stat display local to that stat.
    return getStatDifference(item, stat) > 0;
  }

  const slotMap = {
    head: 'equipped_head_id',
    weapon: 'equipped_weapon_id',
    armor: 'equipped_armor_id',
    boots: 'equipped_boots_id'
  };

  const equippedId = authStore.user[slotMap[item.type]];
  if (!equippedId) {
    // Nothing equipped in slot: treat as upgrade if item has positive score.
    return getCombatScore(item.stats) > 0;
  }

  const equippedItem = allPossibleItems.value.find(i => i.id === equippedId || i.item_id === equippedId);
  if (!equippedItem || !equippedItem.stats) {
    return getCombatScore(item.stats) > 0;
  }

  return isItemUpgrade({ item, equippedItem });
}

const buyItem = async (item) => {
  if (!canAfford(item)) {
    notificationStore.notify(i18n.locale === 'es' ? 'No tienes suficiente dinero' : 'Not enough funds', 'error');
    return;
  }
  buying.value = true;
  try {
    const realId = item.item_id || item.id;
    const res = await axios.post(`/api/shop/buy/${realId}`);
    item.owned = true;
    authStore.user.reppy_coins = res.data.remaining_coins;
    authStore.user.reppy_gems = res.data.remaining_gems;
    notificationStore.notify(`Unit Acquired: ${item.name}`, 'success');
    await checkShop();
    await shopStore.fetchDailyShop(true);
    await shopStore.fetchInventory(true); // SYNC INVENTORY
    
    // Auto-open roulette if it's a ticket
    if (item.name === 'Ticket de Ruleta') {
      rouletteStore.checkStatus(true);
      rouletteStore.openModal();
    }
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Exchange failed', 'error');
  } finally {
    buying.value = false;
  }
};

const equipItem = async (item) => {
  try {
    const realId = item.item_id || item.id;
    await axios.post(`/api/shop/equip/${realId}?type=${item.type}`);
    await authStore.fetchProfile();
    notificationStore.notify(i18n.locale === 'es' ? `${item.name} equipado` : `${item.name} equipped`, 'success');
  } catch (error) {
    notificationStore.notify(i18n.locale === 'es' ? 'Error al equipar' : 'Equip failed', 'error');
  }
};

const refreshDailyShop = async () => {
  if (buying.value) return;
  try {
    buying.value = true;
    await shopStore.refreshDailyShop();
    notificationStore.notify(i18n.locale === 'es' ? 'Mercado Actualizado' : 'Market Refreshed', 'success');
  } catch (error) {
    notificationStore.notify(error.response?.data?.message || 'Refresh failed', 'error');
  } finally {
    buying.value = false;
  }
};

const openBundleModal = async (bundle) => {
  selectedBundle.value = bundle;
  const ids = extractBundleItemIds(bundle);
  selectedBundleItems.value = allPossibleItems.value.filter(i => ids.includes(i.id) || ids.includes(i.item_id));

  // Robust fallback: fetch resolved bundle contents directly from backend
  try {
    const res = await axios.get(`/api/shop/bundle/${bundle.id}/contents`);
    if (Array.isArray(res.data?.items) && res.data.items.length > 0) {
      selectedBundleItems.value = res.data.items;
    }
  } catch (error) {
    // Keep local fallback silently if request fails
  }
  showBundleModal.value = true;
};

const openItemDetails = (item) => {
  if (item.type === 'bundle') {
    openBundleModal(item);
    return;
  }
  let itemToSelect = { ...item };
  if (typeof itemToSelect.stats === 'string') {
    try { itemToSelect.stats = JSON.parse(itemToSelect.stats); } catch (e) { itemToSelect.stats = {}; }
  }
  selectedItem.value = itemToSelect;
  showItemModal.value = true;
};

const handleResize = () => { windowWidth.value = window.innerWidth; };

onMounted(() => {
  checkShop();
  shopStore.fetchDailyShop();
  countdownTimer = setInterval(() => { nowMs.value = Date.now(); }, 1000);
  window.addEventListener('resize', handleResize);
  if (!authStore.user) authStore.fetchProfile();
});

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.shop-page-wrapper {
  background: radial-gradient(circle at 50% -10%, rgba(59, 130, 246, 0.08), transparent 80%);
  min-height: 100vh;
}

.premium-card {
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(15px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
}

/* Rarity specific border glows */
.rarity-common:hover {
  border-color: rgba(148, 163, 184, 0.4);
}

.rarity-rare:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 20px 50px rgba(59, 130, 246, 0.2);
}

.rarity-epic:hover {
  border-color: rgba(168, 85, 247, 0.5);
  box-shadow: 0 20px 50px rgba(168, 85, 247, 0.2);
}

.rarity-legendary:hover {
  border-color: rgba(234, 179, 8, 0.6);
  box-shadow: 0 20px 50px rgba(234, 179, 8, 0.3);
}

.rarity-mythic:hover {
  border-color: rgba(220, 38, 38, 0.6);
  box-shadow: 0 20px 50px rgba(220, 38, 38, 0.3);
}

.animate-in {
  animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-glow {

  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
    filter: brightness(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.02);
    filter: brightness(1.2);
  }
}

@keyframes scan {
  from {
    transform: translateY(-100%);
  }

  to {
    transform: translateY(200%);
  }
}

@keyframes bounce-subtle {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

.animate-skeleton {
  animation: skeleton-pulse 2s infinite;
}

@keyframes skeleton-pulse {

  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 0.2;
  }
}

.animate-modal-in {
  animation: modal-zoom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-zoom {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.4s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>

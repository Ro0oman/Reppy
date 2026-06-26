<template>
  <div>
    <!-- Header -->
    <div class="mb-1.5 flex items-center justify-between px-1">
      <div class="flex items-center gap-1.5">
        <Zap class="h-4 w-4 text-orange-400" />
        <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">{{ i18n.t('battle_quick_access') }}</h3>
      </div>
      <router-link :to="{ name: 'inventory', params: { lang: i18n.locale } }"
        class="text-[11px] font-semibold text-primary-400 transition-colors hover:text-primary-300">
        {{ i18n.t('battle_view_inventory') }}
      </router-link>
    </div>

    <!-- Cards (potions + empty shop slots to fill the row of 4) -->
    <div class="grid grid-cols-4 gap-2">
      <button v-for="p in potions" :key="p.id || p.item_id" @click="open(p)"
        class="relative flex flex-col items-center gap-0.5 rounded-2xl border border-white/10 bg-black/30 px-1.5 py-2 backdrop-blur-sm transition-all active:scale-95"
        :class="isPotionTypeActive(p) ? 'opacity-60' : 'hover:border-orange-400/40'">
        <!-- NEW dot -->
        <span v-if="p.is_new" class="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-black/40"></span>

        <span class="flex h-8 w-8 items-center justify-center rounded-xl border" :class="accentClasses(p).box">
          <FlaskConical class="h-4 w-4" :class="accentClasses(p).icon" />
        </span>
        <span class="w-full truncate text-center text-[9px] font-bold leading-tight text-white/80">{{ shortName(p.name) }}</span>
        <span class="text-[9px] font-black text-orange-300">{{ effectLabel(p) }}<span v-if="durationLabel(p)" class="font-semibold text-white/40"> · {{ durationLabel(p) }}</span></span>
      </button>

      <!-- Empty slots → shop, so the row never looks lopsided -->
      <router-link v-for="n in emptySlots" :key="'empty-' + n"
        :to="{ name: 'shop', params: { lang: i18n.locale } }"
        class="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-1.5 py-2 text-white/25 transition-all hover:border-orange-400/30 hover:text-orange-300/60">
        <Plus class="h-4 w-4" />
        <span class="text-[8px] font-bold uppercase tracking-wide">{{ i18n.t('battle_get_potion') }}</span>
      </router-link>
    </div>

    <PotionUseModal :item="selected" :show="showModal" @close="showModal = false" @activated="onActivated" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { Zap, FlaskConical, Plus } from 'lucide-vue-next';
import { useI18nStore } from '@/stores/i18n';
import { usePotions } from '@/composables/usePotions';
import PotionUseModal from './PotionUseModal.vue';

const emit = defineEmits(['activated']);
const i18n = useI18nStore();
const { consumables, isPotionTypeActive, effectLabel, durationLabel, accent } = usePotions();

const selected = ref(null);
const showModal = ref(false);

// Show up to 4, with non-active potions first so usable buffs stay in reach.
const potions = computed(() => {
  const list = [...consumables.value];
  list.sort((a, b) => Number(isPotionTypeActive(a)) - Number(isPotionTypeActive(b)));
  return list.slice(0, 4);
});

const emptySlots = computed(() => Math.max(0, 4 - potions.value.length));

const accentClasses = (p) => {
  const a = accent(p);
  if (a === 'damage') return { box: 'border-rose-500/30 bg-rose-500/10', icon: 'text-rose-400' };
  if (a === 'crit') return { box: 'border-cyan-500/30 bg-cyan-500/10', icon: 'text-cyan-300' };
  return { box: 'border-emerald-500/30 bg-emerald-500/10', icon: 'text-emerald-300' };
};

const shortName = (name) => {
  if (!name) return '';
  return name.length > 16 ? name.slice(0, 15) + '…' : name;
};

const open = async (p) => {
  selected.value = p;
  showModal.value = true;
  // Clear the inventory "NEW" flag once the user opens it.
  if (p.is_new) {
    p.is_new = false;
    try { await axios.post(`/api/shop/mark-seen/${p.item_id || p.id}`); } catch (_) {}
  }
};

const onActivated = () => emit('activated');
</script>

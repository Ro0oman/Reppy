<template>
  <Teleport to="body">
    <Transition name="st-fade">
      <div
        v-if="store.showModal"
        class="fixed inset-0 z-[120] flex items-stretch justify-center sm:items-center bg-background/80 backdrop-blur-sm sm:p-6"
        @click.self="store.closeModal()"
      >
       <!-- Bounded dialog: full-screen on mobile, centered card on desktop -->
       <div class="relative flex flex-col w-full h-full sm:h-[86vh] sm:max-h-[880px] sm:max-w-3xl bg-card sm:rounded-3xl sm:border sm:border-border/60 overflow-hidden shadow-2xl">
        <!-- Header -->
        <header class="shrink-0 flex items-center justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top)+12px)] sm:pt-4 pb-3 border-b border-border/40">
          <div class="flex items-center gap-2 min-w-0">
            <Network class="h-5 w-5 text-[hsl(var(--neon))]" aria-hidden="true" />
            <h2 class="text-base font-bold tracking-tight text-foreground truncate">{{ i18n.t('skilltree_title') }}</h2>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span
              class="rounded-full px-3 py-1 text-xs font-bold tabular-nums"
              :class="store.skillPoints > 0 ? 'bg-[hsl(var(--neon))]/15 text-[hsl(var(--neon))] glow-neon' : 'bg-foreground/[0.06] text-muted/70'"
            >{{ i18n.t('skilltree_points', { n: store.skillPoints }) }}</span>
            <button type="button" class="grid place-items-center h-9 w-9 rounded-xl bg-foreground/[0.06] text-muted hover:text-foreground transition" @click="store.closeModal()">
              <X class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <!-- Branch tabs -->
        <nav class="shrink-0 flex items-center gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
          <button
            v-for="(b, i) in branchViews"
            :key="b.id"
            type="button"
            class="shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
            :class="activeIndex === i ? 'text-background' : 'border-border/60 bg-foreground/[0.03] text-muted'"
            :style="activeIndex === i ? { background: b.color, borderColor: b.color } : null"
            @click="goToBranch(i)"
          >
            <component :is="b.icon" class="h-3.5 w-3.5" aria-hidden="true" />
            {{ i18n.t(b.labelKey) }}
          </button>
        </nav>

        <!-- Horizontal pannable branches (swipe X) -->
        <div
          ref="scroller"
          class="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar"
          @scroll="onScroll"
        >
          <section
            v-for="b in branchViews"
            :key="b.id"
            class="w-full shrink-0 snap-center h-full overflow-y-auto px-4 pb-44 pt-2 no-scrollbar"
          >
            <!-- Constellation: tiers stacked vertically (pan Y by scrolling) -->
            <div class="flex flex-col items-center justify-center gap-0 min-h-full">
              <template v-for="(row, ti) in b.tierRows" :key="ti">
                <!-- connector from previous tier -->
                <div v-if="ti > 0" class="h-7 w-px" :style="{ background: `linear-gradient(${b.color}, transparent)` }"></div>
                <div class="flex items-start justify-center gap-4">
                  <button
                    v-for="perk in row"
                    :key="perk.id"
                    type="button"
                    class="relative flex flex-col items-center gap-1.5 w-24 transition"
                    @click="selectedId = perk.id"
                  >
                    <div
                      class="relative grid place-items-center h-16 w-16 rounded-2xl border-2 transition"
                      :class="[
                        selectedId === perk.id ? 'scale-105' : '',
                        perk.unlocked ? '' : 'opacity-45 grayscale',
                      ]"
                      :style="nodeStyle(perk, b.color)"
                    >
                      <component :is="perk.icon" class="h-7 w-7" :style="{ color: perk.rank > 0 ? b.color : 'hsl(var(--muted))' }" aria-hidden="true" />
                      <!-- lock -->
                      <div v-if="!perk.unlocked" class="absolute inset-0 grid place-items-center rounded-2xl bg-background/40">
                        <Lock class="h-4 w-4 text-muted" aria-hidden="true" />
                      </div>
                      <!-- maxed check -->
                      <span v-else-if="perk.rank >= perk.maxRank" class="absolute -top-1.5 -right-1.5 grid place-items-center h-5 w-5 rounded-full text-background" :style="{ background: b.color }">
                        <Check class="h-3 w-3" aria-hidden="true" />
                      </span>
                      <!-- upgradeable -->
                      <span v-else-if="perk.unlocked && store.skillPoints > 0" class="absolute -top-1.5 -right-1.5 grid place-items-center h-5 w-5 rounded-full text-background animate-pulse" :style="{ background: b.color }">+</span>
                    </div>
                    <span class="text-[11px] font-semibold leading-tight text-center" :class="perk.unlocked ? 'text-foreground' : 'text-muted/60'">{{ i18n.t(perk.nameKey) }}</span>
                    <div class="flex items-center gap-0.5">
                      <span v-for="r in perk.maxRank" :key="r" class="h-1 w-2 rounded-full" :style="{ background: r <= perk.rank ? b.color : 'hsl(var(--foreground) / 0.15)' }"></span>
                    </div>
                  </button>
                </div>
              </template>
            </div>
          </section>
        </div>

        <!-- Detail sheet -->
        <Transition name="st-slide">
          <div v-if="selected" class="absolute inset-x-0 bottom-0 z-10 rounded-t-3xl border-t border-border/60 bg-card/95 backdrop-blur p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="text-base font-bold text-foreground">{{ i18n.t(selected.nameKey) }}</h3>
                <p class="mt-0.5 text-xs text-muted/80">{{ i18n.t(selected.descKey) }}</p>
              </div>
              <span class="shrink-0 text-xs font-semibold text-muted/70 tabular-nums">{{ i18n.t('skilltree_rank') }} {{ selected.rank }}/{{ selected.maxRank }}</span>
            </div>

            <div class="mt-3 flex items-center gap-2 text-xs">
              <span class="rounded-md bg-foreground/[0.06] px-2 py-1 font-semibold tabular-nums" :style="{ color: selectedColor }">{{ selected.currentEffect }}</span>
              <template v-if="selected.rank < selected.maxRank">
                <ChevronRight class="h-3.5 w-3.5 text-muted/50" aria-hidden="true" />
                <span class="rounded-md px-2 py-1 font-semibold tabular-nums" :style="{ color: selectedColor, background: 'hsl(var(--foreground) / 0.06)' }">{{ selected.nextEffect }}</span>
              </template>
            </div>

            <!-- locked requirement -->
            <p v-if="!selected.unlocked" class="mt-3 flex items-center gap-1.5 text-xs text-amber-400">
              <Lock class="h-3.5 w-3.5" aria-hidden="true" />
              {{ i18n.t('skilltree_requires', { perk: i18n.t(`perk_${selected.requires.perk}_name`), rank: selected.requires.rank }) }}
            </p>

            <button
              type="button"
              class="mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
              :class="canUpgradeSelected ? 'text-background' : 'bg-foreground/[0.06] text-muted/70'"
              :style="canUpgradeSelected ? { background: selectedColor } : null"
              :disabled="!canUpgradeSelected || store.upgrading === selected.id"
              @click="doUpgrade(selected.id)"
            >
              <span v-if="!selected.unlocked">{{ i18n.t('skilltree_locked') }}</span>
              <span v-else-if="selected.rank >= selected.maxRank">{{ i18n.t('skilltree_maxed') }}</span>
              <span v-else-if="store.skillPoints < 1">{{ i18n.t('skilltree_no_points') }}</span>
              <span v-else>{{ i18n.t('skilltree_upgrade') }} · {{ i18n.t('skilltree_one_point') }}</span>
            </button>
          </div>
        </Transition>
       </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import {
  Network, X, Lock, Check, ChevronRight,
  Sword, Target, Zap, Crosshair, Skull,
  Coins, HandCoins, Gift, Gem,
  FlaskConical, Clover, CalendarCheck,
  GraduationCap, Package, Sparkles,
} from 'lucide-vue-next';
import { useSkillTreeStore } from '../../stores/skilltree';
import { useI18nStore } from '../../stores/i18n';
import { useNotificationStore } from '../../stores/notification';

const store = useSkillTreeStore();
const i18n = useI18nStore();
const notify = useNotificationStore();

const scroller = ref(null);
const activeIndex = ref(0);
const selectedId = ref(null);

const BRANCH_META = {
  war:    { icon: Sword,         labelKey: 'branch_war',    color: 'hsl(var(--neon))' },
  gold:   { icon: Coins,         labelKey: 'branch_gold',   color: 'hsl(45 92% 58%)' },
  vigor:  { icon: FlaskConical,  labelKey: 'branch_vigor',  color: 'hsl(var(--neon-violet))' },
  wisdom: { icon: GraduationCap, labelKey: 'branch_wisdom', color: 'hsl(190 90% 58%)' },
};

const PERK_META = {
  power:           { icon: Sword },
  crit_chance:     { icon: Target },
  crit_damage:     { icon: Zap },
  weakness_hunter: { icon: Crosshair },
  execution:       { icon: Skull },
  coin_gain:       { icon: Coins },
  coin_flat:       { icon: HandCoins },
  chest_bounty:    { icon: Gift },
  gem_vein:        { icon: Gem },
  potion_master:   { icon: FlaskConical },
  chest_luck:      { icon: Clover },
  daily_blessing:  { icon: CalendarCheck },
  scholar:         { icon: GraduationCap },
  treasure:        { icon: Package },
  mentor:          { icon: Sparkles },
};

// Format an aggregate effect value (rank × perRank) by perk kind.
function fmtEffect(kind, v) {
  switch (kind) {
    case 'crit_chance': return `+${v}%`;
    case 'crit_mult': return `+${v.toFixed(2)}×`;
    case 'coin_flat': return `+${v.toFixed(1)}/rep`;
    case 'gem_chance':
    case 'chest_item_chance':
    case 'point_chance': return `${Math.round(v * 100)}%`;
    default: return `+${Math.round(v * 100)}%`;
  }
}

function decorate(perk) {
  const meta = PERK_META[perk.id] || { icon: Sparkles };
  const cur = perk.rank * perk.perRank;
  const next = (perk.rank + 1) * perk.perRank;
  return {
    ...perk,
    icon: meta.icon,
    nameKey: `perk_${perk.id}_name`,
    descKey: `perk_${perk.id}_desc`,
    currentEffect: perk.rank > 0 ? fmtEffect(perk.kind, cur) : '—',
    nextEffect: fmtEffect(perk.kind, next),
  };
}

// Branches in order, each with its perks grouped into tier rows.
const branchViews = computed(() => {
  const order = (store.branches.length ? store.branches : [{ id: 'war' }, { id: 'gold' }, { id: 'vigor' }, { id: 'wisdom' }]);
  return order.map((b) => {
    const meta = BRANCH_META[b.id] || { icon: Sparkles, labelKey: b.id, color: 'hsl(var(--neon))' };
    const perks = store.perks.filter((p) => p.branch === b.id).map(decorate);
    const tiers = [...new Set(perks.map((p) => p.tier))].sort((a, z) => a - z);
    const tierRows = tiers.map((t) => perks.filter((p) => p.tier === t));
    return { ...b, ...meta, tierRows };
  });
});

const selected = computed(() => {
  for (const b of branchViews.value) {
    for (const row of b.tierRows) {
      const found = row.find((p) => p.id === selectedId.value);
      if (found) return found;
    }
  }
  return null;
});
const selectedColor = computed(() => {
  const b = branchViews.value.find((bv) => bv.id === selected.value?.branch);
  return b?.color || 'hsl(var(--neon))';
});
const canUpgradeSelected = computed(
  () => !!selected.value && selected.value.unlocked && store.skillPoints > 0 && selected.value.rank < selected.value.maxRank
);

function nodeStyle(perk, color) {
  if (perk.rank > 0) {
    return { borderColor: color, background: 'hsl(var(--foreground) / 0.04)', boxShadow: `0 0 16px -4px ${color}` };
  }
  return { borderColor: 'hsl(var(--border))', background: 'hsl(var(--foreground) / 0.02)' };
}

function goToBranch(i) {
  activeIndex.value = i;
  const el = scroller.value;
  if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
}
function onScroll(e) {
  const el = e.target;
  activeIndex.value = Math.round(el.scrollLeft / el.clientWidth);
}

async function doUpgrade(perkId) {
  const res = await store.upgrade(perkId);
  if (res?.ok) notify.notify(i18n.t('skilltree_upgraded'), 'success');
  else if (res?.code === 'NO_POINTS') notify.notify(i18n.t('skilltree_no_points'), 'error');
  else if (res?.code === 'LOCKED') notify.notify(i18n.t('skilltree_locked'), 'error');
  else if (res?.error) notify.notify(res.error, 'error');
}

// When the modal opens, default the selection to the first perk of the active branch.
watch(() => store.showModal, (open) => {
  if (open) {
    selectedId.value = null;
    nextTick(() => { activeIndex.value = 0; if (scroller.value) scroller.value.scrollLeft = 0; });
  }
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.st-fade-enter-active, .st-fade-leave-active { transition: opacity 0.2s ease; }
.st-fade-enter-from, .st-fade-leave-to { opacity: 0; }
.st-slide-enter-active, .st-slide-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.st-slide-enter-from, .st-slide-leave-to { transform: translateY(100%); opacity: 0; }
</style>

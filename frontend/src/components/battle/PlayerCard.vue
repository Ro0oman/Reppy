<template>
  <div class="rounded-2xl border border-white/10 bg-black/30 p-2.5 backdrop-blur-md">
    <div class="flex items-center gap-3">
      <!-- Avatar + level badge -->
      <div class="relative shrink-0">
        <AvatarFrame :src="authStore.user?.avatar_url" :border-css="authStore.user?.border_css" :size="40" />
        <span class="absolute -bottom-1 -right-1 rounded-full bg-primary-500 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white ring-2 ring-black/40">
          LVL {{ level }}
        </span>
      </div>

      <!-- Name + XP -->
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-white">{{ authStore.user?.name || 'Player' }}</p>
        <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-500"
            :style="{ width: xpPct + '%' }"></div>
        </div>
        <p class="mt-0.5 text-[10px] font-semibold tabular-nums text-white/50">
          {{ formatNum(xpInto) }} / {{ formatNum(xpFor) }} XP
        </p>
      </div>

      <!-- Quick shortcuts: Misiones / Cofres / Ranking -->
      <div class="flex items-center gap-1.5">
        <button v-for="s in shortcuts" :key="s.id" @click="s.onClick"
          class="relative flex h-10 w-10 flex-col items-center justify-center gap-0.5 rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all active:scale-95 hover:text-white"
          :title="s.label">
          <component :is="s.icon" class="h-4 w-4" />
          <span class="text-[8px] font-bold uppercase tracking-tight">{{ s.label }}</span>
          <span v-if="s.count > 0"
            class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-black/40">
            {{ s.count }}
          </span>
          <span v-else-if="s.dot"
            class="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-black/40"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ScrollText, Gift, Trophy } from 'lucide-vue-next';
import AvatarFrame from '@/components/ui/AvatarFrame.vue';
import { useAuthStore } from '@/stores/auth';
import { useI18nStore } from '@/stores/i18n';
import { useBadgesStore } from '@/stores/badges';

const authStore = useAuthStore();
const i18n = useI18nStore();
const badges = useBadgesStore();
const router = useRouter();

const level = computed(() => authStore.user?.current_level || 1);
const xpInto = computed(() => Math.max(0, authStore.user?.xp_into_level || 0));
const xpFor = computed(() => Math.max(1, authStore.user?.xp_for_next_level || 1));
const xpPct = computed(() => Math.min(100, Math.round((xpInto.value / xpFor.value) * 100)));

const formatNum = (n) => new Intl.NumberFormat('en-US').format(n);

const go = (name, query) => router.push({ name, params: { lang: i18n.locale }, ...(query ? { query } : {}) });

const shortcuts = computed(() => [
  {
    id: 'missions',
    icon: ScrollText,
    label: i18n.locale === 'es' ? 'Misiones' : 'Quests',
    count: badges.missions_claimable,
    dot: false,
    onClick: () => go('missions'),
  },
  {
    id: 'chests',
    icon: Gift,
    label: i18n.locale === 'es' ? 'Cofres' : 'Chests',
    count: badges.chests_total,
    dot: false,
    onClick: () => go('inventory', { cat: 'chests' }),
  },
  {
    id: 'ranking',
    icon: Trophy,
    label: i18n.locale === 'es' ? 'Ranking' : 'Ranking',
    count: 0,
    dot: badges.ranking_new,
    onClick: () => { badges.clearRanking(); go('social', { tab: 'rankings' }); },
  },
]);
</script>

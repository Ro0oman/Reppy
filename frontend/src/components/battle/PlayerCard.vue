<template>
  <div class="os-player p-2.5 backdrop-blur-md">
    <div class="flex items-center gap-3">
      <!-- Avatar + level badge -->
      <div class="relative shrink-0">
        <AvatarFrame :src="authStore.user?.avatar_url" :border-css="authStore.user?.border_css" :size="40" />
        <span class="os-player-lvl os-num absolute -bottom-1 -right-1">
          LV.{{ level }}
        </span>
      </div>

      <!-- Name + XP (cian = lectura de sistema) -->
      <div class="min-w-0 flex-1">
        <p class="os-player-name truncate">{{ authStore.user?.name || 'Player' }}</p>
        <div class="os-minibar mt-1.5 w-full" style="height: 5px;">
          <i :style="{ width: xpPct + '%' }"></i>
        </div>
        <p class="os-player-xp os-num mt-1">
          {{ formatNum(xpInto) }} / {{ formatNum(xpFor) }} XP
        </p>
      </div>

      <!-- Quick shortcuts: Misiones / Cofres / Ranking -->
      <div class="flex items-center gap-1.5">
        <button v-for="s in shortcuts" :key="s.id" @click="s.onClick"
          class="os-player-shortcut relative flex h-11 w-11 flex-col items-center justify-center gap-0.5 transition-all active:scale-95"
          :title="s.label">
          <component :is="s.icon" class="h-4 w-4" />
          <span class="text-[8px] font-bold uppercase tracking-tight">{{ s.label }}</span>
          <span v-if="s.count > 0"
            class="os-player-badge os-num absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center px-1">
            {{ s.count }}
          </span>
          <span v-else-if="s.dot"
            class="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-black/40" style="background: var(--os-danger)"></span>
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

<style scoped>
.os-player {
  background: rgba(8, 13, 21, 0.88);
  border: 1px solid var(--os-line);
  border-radius: 2px;
}
.os-player-lvl {
  border-radius: 2px;
  background: var(--os-blue);
  padding: 2px 5px;
  font: 700 9px var(--os-font-mono);
  letter-spacing: 0.5px;
  color: #fff;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4);
}
.os-player-name {
  font: 700 0.95rem var(--os-font-display);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--os-text);
}
.os-player-xp {
  font: 500 10px var(--os-font-mono);
  letter-spacing: 0.8px;
  color: var(--os-cyan);
}
.os-player-shortcut {
  border: 1px solid var(--os-line);
  border-radius: 2px;
  background: var(--os-panel);
  color: var(--os-muted);
}
.os-player-shortcut:hover { color: var(--os-text); border-color: var(--os-line-strong); }
.os-player-badge {
  border-radius: 2px;
  background: var(--os-danger);
  font: 700 9px var(--os-font-mono);
  color: #fff;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4);
}
</style>

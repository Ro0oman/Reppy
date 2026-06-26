import { computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useShopStore } from '@/stores/shop';
import { useNotificationStore } from '@/stores/notification';
import { useI18nStore } from '@/stores/i18n';

// Shared potion/consumable logic for the inventory and the battle quick-access
// strip: list owned consumables, know which buff types are already running,
// format their effect/duration, and activate them via the existing endpoint.
const POTION_STAT_KEYS = ['str', 'dex', 'end', 'vig', 'int', 'fth'];

export function usePotions() {
  const authStore = useAuthStore();
  const shopStore = useShopStore();
  const notificationStore = useNotificationStore();
  const i18n = useI18nStore();

  const isEs = computed(() => i18n.locale !== 'en');

  // Owned consumables (one card per stack).
  const consumables = computed(() =>
    (shopStore.inventory || []).filter(
      (it) => it.type === 'consumable' || it.type === 'custom'
    )
  );

  // Is a buff of this potion's type already active? (mirrors Inventory.vue)
  const isPotionTypeActive = (item) => {
    if (!item || !item.stats) return false;
    const user = authStore.user;
    if (!user) return false;
    const now = new Date();

    if (
      (item.stats.multiplier || item.stats.damage_multiplier) &&
      user.damage_multiplier_expiry &&
      new Date(user.damage_multiplier_expiry) > now
    ) {
      return true;
    }
    const buffs = user.stat_buffs || {};
    for (const k of POTION_STAT_KEYS) {
      if (
        (item.stats[k] || item.stats[`${k}_bonus`]) &&
        buffs[k] &&
        new Date(buffs[k].expiry) > now
      ) {
        return true;
      }
    }
    return false;
  };

  // Human effect label, e.g. "+25% Daño" or "+12 DEX".
  const effectLabel = (item) => {
    const s = item?.stats || {};
    const mult = s.multiplier || s.damage_multiplier;
    if (mult) {
      const pct = Math.round((Number(mult) - 1) * 100);
      return `+${pct}% ${isEs.value ? 'Daño' : 'Damage'}`;
    }
    if (s.dex_bonus || s.dex) {
      return `+${s.dex_bonus || s.dex} DEX`;
    }
    for (const k of POTION_STAT_KEYS) {
      if (s[k] || s[`${k}_bonus`]) {
        return `+${s[k] || s[`${k}_bonus`]} ${k.toUpperCase()}`;
      }
    }
    return isEs.value ? 'Buff temporal' : 'Temporary buff';
  };

  // Duration like "30m", "1h", "24h".
  const durationLabel = (item) => {
    const secs = Number(item?.stats?.duration) || 0;
    if (secs <= 0) return '';
    if (secs < 3600) return `${Math.round(secs / 60)}m`;
    return `${Math.round(secs / 3600)}h`;
  };

  // Accent color family for the card (damage = ember, dex = arcane).
  const accent = (item) => {
    const s = item?.stats || {};
    if (s.multiplier || s.damage_multiplier) return 'damage';
    if (s.dex_bonus || s.dex) return 'crit';
    return 'stat';
  };

  const activate = async (item) => {
    try {
      const realId = item.item_id || item.id;
      const res = await axios.post(`/api/shop/activate/${realId}`);
      notificationStore.notify(res.data.message, 'success');
      await shopStore.fetchInventory(true);
      await authStore.fetchProfile();
      return true;
    } catch (err) {
      notificationStore.notify(err.response?.data?.message || 'Error al activar', 'error');
      return false;
    }
  };

  return {
    consumables,
    isPotionTypeActive,
    effectLabel,
    durationLabel,
    accent,
    activate,
  };
}

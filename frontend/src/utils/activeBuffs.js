// Centralized active-consumable-buff derivation, shared by the Dashboard,
// Inventory and ActiveEffects views so the three can never drift apart.

const STAT_KEYS = ['str', 'dex', 'end', 'vig', 'int', 'fth'];

export function formatTimeLeft(diff) {
  const p = (n) => String(n).padStart(2, '0');
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${p(hours)}:${p(minutes)}:${p(seconds)}`;
}

// Reads the temporary stat buffs stored on the user as
// { str: { value, expiry }, ... }. node-postgres returns JSONB as an object,
// but parse defensively in case it arrives as a string.
function parseStatBuffs(user) {
  let buffs = user.stat_buffs || {};
  if (typeof buffs === 'string') {
    try { buffs = JSON.parse(buffs); } catch { buffs = {}; }
  }
  return buffs;
}

// Returns the list of currently-active consumable buffs for `user`, evaluated
// against `now`. `i18n` is the i18n store (used for labels).
// Each entry: { type, label, value, description, timeLeft }.
export function buildActiveBoosts(user, now, i18n) {
  if (!user) return [];
  const boosts = [];

  // Global damage multiplier (e.g. Poción Omega).
  if (user.damage_multiplier_expiry && new Date(user.damage_multiplier_expiry) > now) {
    const mult = parseFloat(user.damage_multiplier) || 1;
    boosts.push({
      type: 'multiplier',
      label: i18n.t('inv_dmg_mult'),
      value: `x${mult.toFixed(1)}`,
      description: i18n.t('inv_dmg_mult_desc', { percent: Math.round((mult - 1) * 100) }),
      timeLeft: formatTimeLeft(new Date(user.damage_multiplier_expiry) - now)
    });
  }

  // Temporary per-stat bonuses.
  const buffs = parseStatBuffs(user);
  for (const stat of STAT_KEYS) {
    const b = buffs[stat];
    if (b && b.expiry && new Date(b.expiry) > now) {
      const statName = i18n.t(`stat_${stat}`);
      boosts.push({
        type: stat,
        label: i18n.t('inv_stat_boost', { stat: statName }),
        value: `+${b.value}`,
        description: i18n.t('inv_stat_boost_desc', { stat: statName }),
        timeLeft: formatTimeLeft(new Date(b.expiry) - now)
      });
    }
  }

  return boosts;
}

const SCORE_WEIGHTS = {
  str: 1.0,
  pwr: 1.0,
  end: 0.9,
  vig: 0.9,
  dex: 0.8,
  agi: 0.7,
  int: 0.5,
  fth: 0.5,
  cha: 0.4,
  crit_chance: 0.7,
  crit_damage: 0.7
};

export function normalizeStats(stats) {
  if (!stats) return {};
  if (typeof stats === 'string') {
    try { return JSON.parse(stats) || {}; } catch { return {}; }
  }
  return stats;
}

export function getCombatScore(stats = {}) {
  const parsed = normalizeStats(stats);
  return Object.entries(parsed).reduce((acc, [key, val]) => {
    if (key === 'duration' || key === 'multiplier') return acc;
    const weight = SCORE_WEIGHTS[key] ?? 0.6;
    return acc + (Number(val) || 0) * weight;
  }, 0);
}

export function isItemUpgrade({ item, equippedItem, specificStat = null }) {
  if (!item) return false;
  const itemStats = normalizeStats(item.stats);
  if (!itemStats || Object.keys(itemStats).length === 0) return false;

  if (!equippedItem) return getCombatScore(itemStats) > 0;
  const equippedStats = normalizeStats(equippedItem.stats);

  if (specificStat) {
    return (itemStats[specificStat] || 0) > (equippedStats[specificStat] || 0);
  }

  return getCombatScore(itemStats) > getCombatScore(equippedStats);
}

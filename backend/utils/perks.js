/**
 * Skill Tree — Combat Perks, organised into branches.
 *
 * A perk layer ON TOP of the auto-derived 7-stat system. Players earn 1 skill
 * point per character level-up (granted in utils/stats.js) and spend them here.
 * Perks are bounded, single-hook modifiers consumed across the backend
 * (damage.js, reps.js, boss.js, shop.js, stats.js).
 *
 * Branches (slide horizontally in the UI). Deeper tiers unlock by investing in
 * the node's `requires` prerequisite — so each branch reads as a real path.
 * Allocations live in `users.skill_perks` (JSONB): { "<perkId>": <rank> }.
 */

export const BRANCHES = {
  war:    { id: 'war',    order: 0, color: 'neon' },     // ⚔️ damage
  gold:   { id: 'gold',   order: 1, color: 'gold' },     // 💰 economy
  vigor:  { id: 'vigor',  order: 2, color: 'violet' },   // 🔥 utility
  wisdom: { id: 'wisdom', order: 3, color: 'cyan' },     // 📘 progression
};

// `tier` = vertical position (1 = root). `requires` gates the node behind a rank
// of an earlier node in the same branch. `perRank` is the effect added per rank.
export const PERKS = {
  // ── ⚔️ WAR (damage) ──────────────────────────────────────────────
  power:           { branch: 'war', tier: 1, maxRank: 5, perRank: 0.04, kind: 'damage_pct',  requires: null },
  crit_chance:     { branch: 'war', tier: 2, maxRank: 5, perRank: 2,    kind: 'crit_chance', requires: { perk: 'power', rank: 1 } },
  crit_damage:     { branch: 'war', tier: 2, maxRank: 5, perRank: 0.15, kind: 'crit_mult',   requires: { perk: 'power', rank: 1 } },
  weakness_hunter: { branch: 'war', tier: 3, maxRank: 3, perRank: 0.10, kind: 'weakness',    requires: { perk: 'crit_damage', rank: 2 } },
  execution:       { branch: 'war', tier: 4, maxRank: 3, perRank: 0.15, kind: 'execution',   requires: { perk: 'weakness_hunter', rank: 1 } },

  // ── 💰 GOLD (economy) ────────────────────────────────────────────
  coin_gain:    { branch: 'gold', tier: 1, maxRank: 5, perRank: 0.05, kind: 'coin_pct',       requires: null },
  coin_flat:    { branch: 'gold', tier: 2, maxRank: 5, perRank: 0.10, kind: 'coin_flat',      requires: { perk: 'coin_gain', rank: 1 } },
  chest_bounty: { branch: 'gold', tier: 3, maxRank: 5, perRank: 0.10, kind: 'chest_coin_pct', requires: { perk: 'coin_flat', rank: 2 } },
  gem_vein:     { branch: 'gold', tier: 4, maxRank: 5, perRank: 0.02, kind: 'gem_chance',     requires: { perk: 'chest_bounty', rank: 1 } },

  // ── 🔥 VIGOR (utility) ───────────────────────────────────────────
  potion_master: { branch: 'vigor', tier: 1, maxRank: 5, perRank: 0.10, kind: 'potion_dur',     requires: null },
  chest_luck:    { branch: 'vigor', tier: 2, maxRank: 3, perRank: 0.05, kind: 'chest_luck',     requires: { perk: 'potion_master', rank: 1 } },
  daily_blessing:{ branch: 'vigor', tier: 3, maxRank: 3, perRank: 0.10, kind: 'daily_coin_pct', requires: { perk: 'chest_luck', rank: 1 } },

  // ── 📘 WISDOM (progression) ──────────────────────────────────────
  scholar:  { branch: 'wisdom', tier: 1, maxRank: 5, perRank: 0.02, kind: 'xp_pct',            requires: null },
  treasure: { branch: 'wisdom', tier: 2, maxRank: 3, perRank: 0.10, kind: 'chest_item_chance', requires: { perk: 'scholar', rank: 1 } },
  mentor:   { branch: 'wisdom', tier: 3, maxRank: 3, perRank: 0.10, kind: 'point_chance',      requires: { perk: 'treasure', rank: 1 } },
};

export const PERK_IDS = Object.keys(PERKS);

// Clamp a stored rank to [0, maxRank].
export const perkRank = (skillPerks, id) => {
  if (!PERKS[id]) return 0;
  return Math.max(0, Math.min(PERKS[id].maxRank, Number((skillPerks || {})[id]) || 0));
};

// A node is unlocked when it has no prereq, or its prereq is at/above the needed rank.
export const isPerkUnlocked = (skillPerks, id) => {
  const req = PERKS[id]?.requires;
  if (!req) return true;
  return perkRank(skillPerks, req.perk) >= req.rank;
};

/**
 * Aggregate the equipped perks into the modifiers the backend reads. Every value
 * is 0 when the perk is unranked, so callers can apply them unconditionally.
 */
export const getPerkBonuses = (skillPerks) => ({
  // war
  damagePct:      perkRank(skillPerks, 'power') * PERKS.power.perRank,
  critChanceFlat: perkRank(skillPerks, 'crit_chance') * PERKS.crit_chance.perRank,
  critMultFlat:   perkRank(skillPerks, 'crit_damage') * PERKS.crit_damage.perRank,
  weaknessPct:    perkRank(skillPerks, 'weakness_hunter') * PERKS.weakness_hunter.perRank,
  executionPct:   perkRank(skillPerks, 'execution') * PERKS.execution.perRank,
  // gold
  coinPct:        perkRank(skillPerks, 'coin_gain') * PERKS.coin_gain.perRank,
  coinFlatPerRep: perkRank(skillPerks, 'coin_flat') * PERKS.coin_flat.perRank,
  chestCoinPct:   perkRank(skillPerks, 'chest_bounty') * PERKS.chest_bounty.perRank,
  gemChance:      perkRank(skillPerks, 'gem_vein') * PERKS.gem_vein.perRank,
  // vigor
  potionDur:      perkRank(skillPerks, 'potion_master') * PERKS.potion_master.perRank,
  chestLuck:      perkRank(skillPerks, 'chest_luck') * PERKS.chest_luck.perRank,
  dailyCoinPct:   perkRank(skillPerks, 'daily_blessing') * PERKS.daily_blessing.perRank,
  // wisdom
  xpPct:          perkRank(skillPerks, 'scholar') * PERKS.scholar.perRank,
  chestItemChance: perkRank(skillPerks, 'treasure') * PERKS.treasure.perRank,
  pointChance:    perkRank(skillPerks, 'mentor') * PERKS.mentor.perRank,
});

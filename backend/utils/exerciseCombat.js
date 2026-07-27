/**
 * Exercise → combat stat mapping (auditoría 2026-07, "Combate: ejercicio → daño
 * vs weakness/resist", opción B).
 *
 * Beyond the existing per-level weakness bonus, the exercise a player LOGS now
 * matters: it maps to a "combat stat" (str/vig/end) which is compared against the
 * enemy's weakness_stat / resist_stat inside calculateDamage:
 *   - matches weakness_stat → ×1.4
 *   - matches resist_stat   → ×0.7  (this is what finally makes resist_stat bite)
 *   - otherwise             → ×1.0
 *
 * How the combat stat is resolved (per the audit decision):
 *   - Reppy built-in exercises already carry a `stat_type` (str_xp/end_xp/pwr_xp…)
 *     → mapped via STAT_TYPE_TO_COMBAT_STAT.
 *   - Hevy imports carry a `primary_muscle_group` (chest, quadriceps, …) captured
 *     at ingest → mapped via MUSCLE_GROUP_TO_COMBAT_STAT (finer: distinguishes
 *     legs → VIG, which stat_type alone can't).
 *
 * DEX/INT/FTH/CHA don't map to a muscle group, so an exercise never yields one of
 * those combat stats — bosses weak to them are covered by the per-level weakness
 * bonus, and the exercise multiplier simply lands on the neutral ×1.0 branch.
 */

// Hevy `primary_muscle_group` → combat stat (from the audit's decided table).
export const MUSCLE_GROUP_TO_COMBAT_STAT = {
  // STR — upper body push/pull.
  chest: 'str',
  lats: 'str',
  upper_back: 'str',
  lower_back: 'str',
  triceps: 'str',
  biceps: 'str',
  forearms: 'str',
  traps: 'str',
  shoulders: 'str',
  // VIG — lower body.
  quadriceps: 'vig',
  hamstrings: 'vig',
  glutes: 'vig',
  calves: 'vig',
  abductors: 'vig',
  adductors: 'vig',
  // END — core / conditioning / misc.
  abdominals: 'end',
  cardio: 'end',
  full_body: 'end',
  neck: 'end',
  other: 'end',
};

// Reppy `stat_type` (the XP bag an exercise feeds) → combat stat.
export const STAT_TYPE_TO_COMBAT_STAT = {
  str_xp: 'str',
  pwr_xp: 'str', // weighted pull-ups / muscle-ups: upper-body pull → STR
  end_xp: 'end',
  vig_xp: 'vig',
  // dex_xp / int_xp / fth_xp / cha_xp → no muscle mapping (see header).
};

/**
 * Resolve the combat stat of a logged exercise.
 *
 * @param {object|null} exercise row-like `{ stat_type, primary_muscle_group }`
 * @returns {'str'|'vig'|'end'|null} null when the exercise has no combat stat
 *          (leaves the exercise multiplier neutral).
 */
export function getExerciseCombatStat(exercise) {
  if (!exercise) return null;
  // Prefer the muscle group (Hevy imports) — it's the finer signal.
  const mg = exercise.primary_muscle_group
    ? String(exercise.primary_muscle_group).toLowerCase()
    : null;
  if (mg && MUSCLE_GROUP_TO_COMBAT_STAT[mg]) return MUSCLE_GROUP_TO_COMBAT_STAT[mg];
  // Fall back to the exercise's stat_type (Reppy built-ins).
  const st = exercise.stat_type ? String(exercise.stat_type).toLowerCase() : null;
  if (st && STAT_TYPE_TO_COMBAT_STAT[st]) return STAT_TYPE_TO_COMBAT_STAT[st];
  return null;
}

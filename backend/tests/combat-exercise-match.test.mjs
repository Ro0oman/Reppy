// Pure-function tests for the combat exercise-match multiplier (auditoría 2026-07,
// "Combate: ejercicio → daño vs weakness/resist", opción B). No DB, no env.
//
// Covers: (1) exercise → combat-stat resolution (muscle group vs stat_type), and
// (2) that calculateDamage applies ×1.4 on weakness match, ×0.7 on resist match,
// ×1.0 otherwise, and stays neutral when the exercise stat is unknown.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getExerciseCombatStat } from '../utils/exerciseCombat.js';
import { calculateDamage } from '../utils/damage.js';

test('getExerciseCombatStat — Reppy exercises resolve via stat_type', () => {
  assert.equal(getExerciseCombatStat({ stat_type: 'str_xp' }), 'str');
  assert.equal(getExerciseCombatStat({ stat_type: 'pwr_xp' }), 'str');
  assert.equal(getExerciseCombatStat({ stat_type: 'end_xp' }), 'end');
  assert.equal(getExerciseCombatStat({ stat_type: 'vig_xp' }), 'vig');
  // Stats with no muscle mapping (covered by the per-level bonus) → null.
  assert.equal(getExerciseCombatStat({ stat_type: 'int_xp' }), null);
  assert.equal(getExerciseCombatStat({ stat_type: 'fth_xp' }), null);
  assert.equal(getExerciseCombatStat({}), null);
  assert.equal(getExerciseCombatStat(null), null);
});

test('getExerciseCombatStat — Hevy imports resolve via muscle group', () => {
  assert.equal(getExerciseCombatStat({ primary_muscle_group: 'chest' }), 'str');
  assert.equal(getExerciseCombatStat({ primary_muscle_group: 'lats' }), 'str');
  assert.equal(getExerciseCombatStat({ primary_muscle_group: 'quadriceps' }), 'vig');
  assert.equal(getExerciseCombatStat({ primary_muscle_group: 'glutes' }), 'vig');
  assert.equal(getExerciseCombatStat({ primary_muscle_group: 'abdominals' }), 'end');
  assert.equal(getExerciseCombatStat({ primary_muscle_group: 'cardio' }), 'end');
  // Muscle group is case-insensitive and wins over stat_type when both present.
  assert.equal(getExerciseCombatStat({ primary_muscle_group: 'QUADRICEPS', stat_type: 'str_xp' }), 'vig');
  // Unknown muscle group → fall back to stat_type.
  assert.equal(getExerciseCombatStat({ primary_muscle_group: 'tail', stat_type: 'str_xp' }), 'str');
});

// A modest user so damage stays finite and comparable across runs. deterministic
// = true removes crit randomness so the only variable is the exercise multiplier.
const USER = {
  current_level: 10, str_lvl: 20, dex_lvl: 5, end_lvl: 15,
  vig_lvl: 10, int_lvl: 1, fth_lvl: 8, cha_lvl: 1,
  base_str_lvl: 20, base_end_lvl: 15, base_fth_lvl: 8,
};

function dmg(boss, exerciseStat) {
  // reps=10, type=pullups, deterministic (no crit), no override, no weight.
  return calculateDamage(USER, 10, 'pullups', boss, false, true, null, 0, exerciseStat).totalDamage;
}

test('calculateDamage — exercise matching weakness_stat amplifies ×1.4', () => {
  const boss = { weakness_stat: 'str', resist_stat: 'vig' };
  const neutral = dmg(boss, null);       // no exercise stat → ×1.0
  const matched = dmg(boss, 'str');      // str exercise vs str weakness → ×1.4
  const ratio = matched / neutral;
  assert.ok(Math.abs(ratio - 1.4) < 0.001, `expected ×1.4, got ×${ratio.toFixed(3)}`);
});

test('calculateDamage — exercise matching resist_stat dampens ×0.7', () => {
  const boss = { weakness_stat: 'str', resist_stat: 'vig' };
  const neutral = dmg(boss, null);
  const resisted = dmg(boss, 'vig');     // vig exercise vs vig resist → ×0.7
  const ratio = resisted / neutral;
  assert.ok(Math.abs(ratio - 0.7) < 0.001, `expected ×0.7, got ×${ratio.toFixed(3)}`);
});

test('calculateDamage — non-matching exercise stat is neutral', () => {
  const boss = { weakness_stat: 'str', resist_stat: 'vig' };
  const neutral = dmg(boss, null);
  const other = dmg(boss, 'end');        // end matches neither → ×1.0
  assert.equal(other, neutral);
});

test('calculateDamage — no boss / no weakness metadata → no exercise multiplier', () => {
  // No boss at all.
  const noBoss = calculateDamage(USER, 10, 'pullups', null, false, true, null, 0, 'str').totalDamage;
  const noBossNeutral = calculateDamage(USER, 10, 'pullups', null, false, true, null, 0, null).totalDamage;
  assert.equal(noBoss, noBossNeutral);

  // Boss without weakness_stat/resist_stat (e.g. community boss SELECT) → neutral.
  const bareBoss = { current_hp: 1000, total_hp: 1000 };
  const withStat = calculateDamage(USER, 10, 'pullups', bareBoss, false, true, null, 0, 'str').totalDamage;
  const withoutStat = calculateDamage(USER, 10, 'pullups', bareBoss, false, true, null, 0, null).totalDamage;
  assert.equal(withStat, withoutStat);
});

test('calculateDamage — exerciseMatchMult is reported in the breakdown', () => {
  const boss = { weakness_stat: 'str', resist_stat: 'vig' };
  assert.equal(calculateDamage(USER, 10, 'pullups', boss, false, true, null, 0, 'str').exerciseMatchMult, 1.4);
  assert.equal(calculateDamage(USER, 10, 'pullups', boss, false, true, null, 0, 'vig').exerciseMatchMult, 0.7);
  assert.equal(calculateDamage(USER, 10, 'pullups', boss, false, true, null, 0, 'end').exerciseMatchMult, 1.0);
});

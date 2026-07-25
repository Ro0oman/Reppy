// Pure-function economy tests. No DB, no env — always runnable via `npm test`.
// Covers the reward/damage math that turns real reps into virtual money and
// boss damage. A silent change to these multipliers directly inflates or
// deflates the economy, so they are worth pinning.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getExerciseRewards, getBossDamageMultiplier } from '../utils/rewards.js';

test('getExerciseRewards — coin multipliers per exercise', () => {
  assert.equal(getExerciseRewards('pullups', 10).coins, 10);   // ×1
  assert.equal(getExerciseRewards('pushups', 10).coins, 10);   // ×1
  assert.equal(getExerciseRewards('legs', 10).coins, 10);      // ×1
  assert.equal(getExerciseRewards('dips', 10).coins, 20);      // ×2
  assert.equal(getExerciseRewards('weighted_pullups', 10).coins, 30); // ×3
  assert.equal(getExerciseRewards('muscleups', 10).coins, 50); // ×5
});

test('getExerciseRewards — stat routing', () => {
  assert.equal(getExerciseRewards('pullups', 1).statToUpgrade, 'str_xp');
  assert.equal(getExerciseRewards('pushups', 1).statToUpgrade, 'end_xp');
  assert.equal(getExerciseRewards('dips', 1).statToUpgrade, 'str_xp');
  assert.equal(getExerciseRewards('weighted_pullups', 1).statToUpgrade, 'pwr_xp');

  const mu = getExerciseRewards('muscleups', 1);
  assert.equal(mu.statToUpgrade, 'pwr_xp');
  assert.equal(mu.extraStatToUpgrade, 'str_xp'); // muscle-ups feed two stats
});

test('getExerciseRewards — unknown exercise falls back to ×1 / end_xp, honoring override', () => {
  const unknown = getExerciseRewards('handstand', 7);
  assert.equal(unknown.coins, 7);
  assert.equal(unknown.statToUpgrade, 'end_xp');

  const overridden = getExerciseRewards('handstand', 7, 'agi_xp');
  assert.equal(overridden.coins, 7);
  assert.equal(overridden.statToUpgrade, 'agi_xp');
});

test('getExerciseRewards — coins scale linearly with count', () => {
  assert.equal(getExerciseRewards('dips', 0).coins, 0);
  assert.equal(getExerciseRewards('dips', 100).coins, 200);
});

test('getBossDamageMultiplier — per exercise', () => {
  assert.equal(getBossDamageMultiplier('pullups'), 1);
  assert.equal(getBossDamageMultiplier('pushups'), 1);
  assert.equal(getBossDamageMultiplier('dips'), 1);
  assert.equal(getBossDamageMultiplier('muscleups'), 2);
  assert.equal(getBossDamageMultiplier('weighted_pullups'), 3);
  assert.equal(getBossDamageMultiplier('anything_else'), 1);
});

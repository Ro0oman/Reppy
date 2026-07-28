// Pure-function tests for the campaign enemy HP curve. No DB, no env.
//
// The level term went quadratic in the 2026-07 rebalance (`1 + a·L + b·L²`) because
// player damage is superlinear and a linear HP curve made enemies melt faster the
// further you got. These pin the shape and the tuning knobs, since a silent change
// here rebalances the whole campaign.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scaleEnemyHp } from '../utils/campaignEngine.js';

const enemy = (over = {}) => ({ base_hp: 1200, tier: 1, scaling: {}, ...over });
// Mirrors config.hp of backend/data/campaigns/main-campaign.json.
const CFG = {
  hp: { base_per_level: 0.06, quad_per_level: 0.03, tier_mult: [1, 1.8, 3, 6, 12], prestige_mult: 1.5 },
};

test('HP follows base·(1 + a·L + b·L²)·tierMult·prestigeMult', () => {
  for (const L of [1, 5, 10, 20, 50]) {
    const expected = Math.round(1200 * (1 + 0.06 * L + 0.03 * L * L));
    assert.equal(scaleEnemyHp(enemy(), CFG, L, 0), expected, `level ${L}`);
  }
});

test('the quadratic term dominates as level rises (it is what tracks player damage)', () => {
  const linearOnly = (L) => Math.round(1200 * (1 + 0.06 * L));
  // At level 1 the quadratic barely registers; by level 50 it is the whole curve.
  assert.ok(scaleEnemyHp(enemy(), CFG, 1, 0) / linearOnly(1) < 1.05);
  assert.ok(scaleEnemyHp(enemy(), CFG, 50, 0) / linearOnly(50) > 15);
});

test('HP is strictly increasing in player level', () => {
  let prev = 0;
  for (let L = 1; L <= 100; L++) {
    const hp = scaleEnemyHp(enemy(), CFG, L, 0);
    assert.ok(hp > prev, `HP must grow at level ${L} (got ${hp} after ${prev})`);
    prev = hp;
  }
});

test('the quadratic coefficient is tunable per campaign and per enemy', () => {
  const softer = { hp: { ...CFG.hp, quad_per_level: 0 } };
  assert.equal(scaleEnemyHp(enemy(), softer, 20, 0), Math.round(1200 * (1 + 0.06 * 20)));

  // A per-enemy `scaling` override wins over the campaign config.
  const override = enemy({ scaling: { hp_quad_per_level: 0.1 } });
  assert.equal(scaleEnemyHp(override, CFG, 20, 0), Math.round(1200 * (1 + 0.06 * 20 + 0.1 * 400)));
});

test('code default matches the shipped campaign JSON when config lacks the key', () => {
  // An already-seeded DB may hold a campaign row predating `quad_per_level`; the
  // fallback must produce the same curve as the JSON, not a different one.
  const legacyCfg = { hp: { base_per_level: 0.06, tier_mult: [1, 1.8, 3, 6, 12], prestige_mult: 1.5 } };
  assert.equal(scaleEnemyHp(enemy(), legacyCfg, 20, 0), scaleEnemyHp(enemy(), CFG, 20, 0));
});

test('tier and prestige multipliers still stack on top of the level curve', () => {
  const lvl = 1 + 0.06 * 10 + 0.03 * 100;
  assert.equal(scaleEnemyHp(enemy({ tier: 3 }), CFG, 10, 0), Math.round(1200 * lvl * 3));
  assert.equal(scaleEnemyHp(enemy(), CFG, 10, 2), Math.round(1200 * lvl * 1.5 * 1.5));
});

test('degenerate inputs stay clamped to at least 1 HP', () => {
  assert.equal(scaleEnemyHp(enemy({ base_hp: 0 }), CFG, 1, 0), Math.round(1000 * (1 + 0.06 + 0.03)));
  assert.ok(scaleEnemyHp(enemy(), CFG, 0, 0) >= 1);
  assert.ok(scaleEnemyHp(enemy(), CFG, -5, 0) >= 1);
  assert.ok(scaleEnemyHp(enemy(), null, 10, 0) >= 1); // no campaign config at all
});

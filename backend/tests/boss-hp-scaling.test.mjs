// Pure-function tests para el escalado de HP del boss comunitario.
// El boss sigue siempre activo; lo único que escala es el HP con la comunidad
// (`max(50.000, activos × 400)`, decisión 2026-07-27).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bossHpForActiveUsers, BASE_BOSS_HP, HP_PER_ACTIVE_USER } from '../utils/boss.js';

test('el suelo de 50.000 manda mientras la comunidad sea pequeña', () => {
  assert.equal(bossHpForActiveUsers(0), BASE_BOSS_HP);
  assert.equal(bossHpForActiveUsers(1), BASE_BOSS_HP);
  assert.equal(bossHpForActiveUsers(100), BASE_BOSS_HP);
  // 125 × 400 = 50.000 exactos: el punto en el que el escalado alcanza al suelo.
  assert.equal(bossHpForActiveUsers(125), BASE_BOSS_HP);
});

test('por encima de ~125 activos el HP escala linealmente', () => {
  assert.equal(bossHpForActiveUsers(126), 126 * HP_PER_ACTIVE_USER);
  assert.equal(bossHpForActiveUsers(500), 200000);
  assert.equal(bossHpForActiveUsers(2000), 800000);
});

test('nunca devuelve menos que el suelo, pase lo que pase', () => {
  for (const bad of [-1, -9999, null, undefined, NaN, Infinity, 'abc', {}]) {
    assert.ok(bossHpForActiveUsers(bad) >= BASE_BOSS_HP, `entrada ${String(bad)}`);
  }
});

test('el HP es entero (va a una columna integer)', () => {
  assert.ok(Number.isInteger(bossHpForActiveUsers(126.7)));
  assert.ok(Number.isInteger(bossHpForActiveUsers(999.5)));
});

test('el HP es monótono en el número de activos', () => {
  let prev = 0;
  for (let n = 0; n <= 400; n += 7) {
    const hp = bossHpForActiveUsers(n);
    assert.ok(hp >= prev, `no debe bajar al subir activos (n=${n})`);
    prev = hp;
  }
});

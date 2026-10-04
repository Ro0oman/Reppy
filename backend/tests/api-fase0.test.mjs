// Fase 0 (B1, B3, B4, B5, B6, B7): comportamiento de la API contra una BD real.
// Necesita Postgres en DATABASE_URL y SOLO corre contra localhost.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import express from 'express';

const URL_DB = process.env.DATABASE_URL || '';
const HAS_DB = /@(localhost|127\.0\.0\.1)[:/]/.test(URL_DB);
const __dirname = dirname(fileURLToPath(import.meta.url));
process.env.JWT_SECRET ||= 'test-secret';

// Contraseña de prueba generada en cada ejecución (no hay secretos en el repo).
const TEST_PASSWORD = `pw-${randomUUID()}`;
let query, pool, server, base;
const stamp = Date.now();
const emailA = `fase0_a_${stamp}@test.local`;
const emailB = `fase0_b_${stamp}@test.local`;
let tokenA, tokenB, idA, idB;

const call = (method, path, { token, body } = {}) => fetch(`${base}${path}`, {
  method,
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: body ? JSON.stringify(body) : undefined,
});
const ymd = (offsetDays) => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

before(async () => {
  if (!HAS_DB) return;
  ({ query, default: pool } = await import('../db.js'));
  await query(readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8'));
  const app = express();
  app.use(express.json());
  app.use('/auth', (await import('../auth.js')).default);
  app.use('/users', (await import('../users.js')).default);
  app.use('/profile', (await import('../profile.js')).default);
  app.use('/reps', (await import('../reps.js')).default);
  server = http.createServer(app);
  await new Promise(r => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (!HAS_DB) return;
  await query('DELETE FROM users WHERE email IN ($1, $2)', [emailA, emailB]);
  await new Promise(r => server.close(r));
  await pool.end();
});

test('B3: el registro valida nombre, email y contraseña con códigos ERR_*', { skip: !HAS_DB }, async () => {
  const cases = [
    [{ name: '', email: emailA, password: TEST_PASSWORD }, 'ERR_INVALID_NAME'],
    [{ name: 'x'.repeat(51), email: emailA, password: TEST_PASSWORD }, 'ERR_INVALID_NAME'],
    [{ name: 'Ana', email: 'no-es-un-email', password: TEST_PASSWORD }, 'ERR_INVALID_EMAIL'],
    [{ name: 'Ana', email: emailA, password: 'corta' }, 'ERR_WEAK_PASSWORD'],
  ];
  for (const [body, code] of cases) {
    const res = await call('POST', '/auth/signup', { body });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).code, code);
  }
  assert.equal((await query('SELECT 1 FROM users WHERE email = $1', [emailA])).rowCount, 0);
});

test('B4: una cuenta nueva nace con has_seen_rpg_release = true', { skip: !HAS_DB }, async () => {
  for (const [name, email, set] of [['Ana', emailA, (t, i) => { tokenA = t; idA = i; }], ['Bea', emailB, (t, i) => { tokenB = t; idB = i; }]]) {
    const res = await call('POST', '/auth/signup', { body: { name, email, password: TEST_PASSWORD } });
    assert.equal(res.status, 200);
    const out = await res.json();
    set(out.token, out.user.id);
  }
  const row = (await query('SELECT has_seen_rpg_release FROM users WHERE id = $1', [idA])).rows[0];
  assert.equal(row.has_seen_rpg_release, true);
});

test('B5: /users/me y PATCH /profile no devuelven campos sensibles', { skip: !HAS_DB }, async () => {
  await query(`UPDATE users SET hevy_api_key = 'cifrada', hevy_webhook_token = 'tok' WHERE id = $1`, [idA]);
  const bad = ['password_hash', 'hevy_api_key', 'hevy_webhook_token', 'token_version'];

  const me = await (await call('GET', '/users/me', { token: tokenA })).json();
  assert.equal(me.id, idA);
  for (const f of bad) assert.ok(!(f in me), `/users/me no debe incluir ${f}`);
  assert.ok('is_admin' in me, 'el cliente necesita is_admin (B7)');

  const patched = await (await call('PATCH', '/users/profile', { token: tokenA, body: { name: 'Ana 2' } })).json();
  for (const f of bad) assert.ok(!(f in patched.user), `PATCH /profile no debe incluir ${f}`);
});

test('B6: el perfil ajeno no muestra peso, monedas ni gemas; el propio sí', { skip: !HAS_DB }, async () => {
  await query('UPDATE users SET body_weight = 70, reppy_coins = 123, reppy_gems = 7 WHERE id = $1', [idA]);
  const other = (await (await call('GET', `/profile/${idA}`, { token: tokenB })).json()).user;
  assert.equal(other.id, idA);
  for (const f of ['body_weight', 'reppy_coins', 'reppy_gems']) assert.ok(!(f in other), `perfil ajeno no debe incluir ${f}`);
  const own = (await (await call('GET', `/profile/${idA}`, { token: tokenA })).json()).user;
  assert.equal(own.reppy_coins, 123);
  assert.equal(own.reppy_gems, 7);
});

test('B1: reps acepta hoy, ayer y mañana; rechaza fechas lejanas con 400', { skip: !HAS_DB }, async () => {
  for (const off of [-1, 0, 1]) {
    const res = await call('POST', '/reps', { token: tokenA, body: { count: 1, date: ymd(off), exercise_type: 'pullups' } });
    assert.notEqual(res.status, 400, `date ${ymd(off)} (offset ${off}) no debe dar 400`);
  }
  for (const off of [-2, 2, 30]) {
    const res = await call('POST', '/reps', { token: tokenA, body: { count: 1, date: ymd(off), exercise_type: 'pullups' } });
    assert.equal(res.status, 400, `date ${ymd(off)} (offset ${off}) debe dar 400`);
    assert.ok((await res.json()).message);
  }
});

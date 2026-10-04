// Fase 3: el estado del onboarding vive en el servidor. Solo corre contra localhost.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express from 'express';
import jwt from 'jsonwebtoken';

const URL_DB = process.env.DATABASE_URL || '';
const HAS_DB = /@(localhost|127\.0\.0\.1)[:/]/.test(URL_DB);
const __dirname = dirname(fileURLToPath(import.meta.url));
process.env.JWT_SECRET ||= 'test-secret';

let query, pool, server, base;
const uid = `test_onboarding_${Date.now()}`;
const headers = () => ({ Authorization: `Bearer ${jwt.sign({ id: uid, tv: 0 }, process.env.JWT_SECRET)}`, 'Content-Type': 'application/json' });
const patch = (body) => fetch(`${base}/onboarding`, { method: 'PATCH', headers: headers(), body: JSON.stringify(body) });

before(async () => {
  if (!HAS_DB) return;
  ({ query, default: pool } = await import('../db.js'));
  await query(readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8'));
  await query(`INSERT INTO users (id, name, email, password_hash) VALUES ($1,'Onb',$2,'h')`, [uid, `${uid}@test.local`]);
  const app = express();
  app.use(express.json());
  app.use('/', (await import('../users.js')).default);
  server = http.createServer(app);
  await new Promise(r => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (!HAS_DB) return;
  await query('DELETE FROM users WHERE id = $1', [uid]);
  await new Promise(r => server.close(r));
  await pool.end();
});

test('guarda y acumula flags, y /me los devuelve', { skip: !HAS_DB }, async () => {
  assert.equal((await patch({ key: 'quickstart_seen' })).status, 200);
  const res = await patch({ key: 'goal_dismissed', value: true });
  assert.deepEqual(await res.json(), { onboarding_flags: { quickstart_seen: true, goal_dismissed: true } });

  const me = await (await fetch(`${base}/me`, { headers: headers() })).json();
  assert.equal(me.onboarding_flags.quickstart_seen, true);

  // Se puede volver a poner a false (p. ej. al reabrir la promo de planes).
  const off = await (await patch({ key: 'goal_dismissed', value: false })).json();
  assert.equal(off.onboarding_flags.goal_dismissed, false);
  assert.equal(off.onboarding_flags.quickstart_seen, true);
});

test('rechaza claves fuera de la lista y valores que no son booleanos', { skip: !HAS_DB }, async () => {
  assert.equal((await patch({ key: 'is_admin' })).status, 400);
  assert.equal((await patch({ key: 'quickstart_seen', value: 'yes' })).status, 400);
  assert.equal((await patch({})).status, 400);
  const row = (await query('SELECT onboarding_flags FROM users WHERE id = $1', [uid])).rows[0];
  assert.deepEqual(Object.keys(row.onboarding_flags).sort(), ['goal_dismissed', 'quickstart_seen']);
});

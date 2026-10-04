// Regresión: con solo schema.sql (BD nueva), GET /boss/active no debe dar 500.
// Fallaba con «column "epic_chests" does not exist». Solo corre contra localhost.
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
const uid = `test_boss_${Date.now()}`;
const bossName = `Jefe de prueba ${Date.now()}`;

before(async () => {
  if (!HAS_DB) return;
  ({ query, default: pool } = await import('../db.js'));
  await query(readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8'));
  await query(`INSERT INTO users (id, name, email, password_hash) VALUES ($1,'B',$2,'h')`, [uid, `${uid}@test.local`]);
  await query(
    `INSERT INTO boss_fights (name, total_hp, current_hp, start_date, end_date, status, order_index)
     VALUES ($1, 1000, 600, now(), now() + interval '7 days', 'active', -1)`, [bossName]);
  const app = express();
  app.use(express.json());
  app.use('/', (await import('../boss.js')).default);
  server = http.createServer(app);
  await new Promise(r => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (!HAS_DB) return;
  await query('DELETE FROM boss_fights WHERE name = $1', [bossName]);
  await query('DELETE FROM users WHERE id = $1', [uid]);
  await new Promise(r => server.close(r));
  await pool.end();
});

test('GET /boss/active responde 200 con el jefe y los datos personales', { skip: !HAS_DB }, async () => {
  const token = jwt.sign({ id: uid, tv: 0 }, process.env.JWT_SECRET);
  const res = await fetch(`${base}/active`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.boss.name, bossName);
  assert.equal(body.boss.current_hp, 600);
  assert.equal(body.personal_damage, 0);
});

test('también responde 200 sin sesión', { skip: !HAS_DB }, async () => {
  const res = await fetch(`${base}/active`);
  assert.equal(res.status, 200);
});

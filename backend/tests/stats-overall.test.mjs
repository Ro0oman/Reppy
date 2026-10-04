// D2/D3: /reps/stats devuelve los totales de TODOS los ejercicios en `overall`,
// aunque se pida un ejercicio concreto. Solo corre contra localhost.
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
const uid = `test_stats_${Date.now()}`;
const token = () => jwt.sign({ id: uid, tv: 0 }, process.env.JWT_SECRET);
const ymd = (off) => {
  const d = new Date(Date.now() + off * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

before(async () => {
  if (!HAS_DB) return;
  ({ query, default: pool } = await import('../db.js'));
  await query(readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8'));
  await query(`INSERT INTO users (id, name, email, password_hash, body_weight) VALUES ($1,'S',$2,'h',80)`, [uid, `${uid}@test.local`]);
  const ins = (date, type, count, w = 0) =>
    query('INSERT INTO reps (user_id, date, exercise_type, count, added_weight) VALUES ($1,$2,$3,$4,$5)', [uid, date, type, count, w]);
  await ins(ymd(0), 'pullups', 10);
  await ins(ymd(0), 'pushups', 25);
  await ins(ymd(-1), 'pullups', 100, 5);
  const app = express();
  app.use(express.json());
  app.use('/', (await import('../reps.js')).default);
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

test('overall suma todos los ejercicios aunque se filtre por uno', { skip: !HAS_DB }, async () => {
  const res = await fetch(`${base}/stats?type=pullups&today=${ymd(0)}`, { headers: { Authorization: `Bearer ${token()}` } });
  assert.equal(res.status, 200);
  const s = await res.json();
  assert.equal(s.totalReps, 110, 'el filtro por ejercicio se mantiene');
  assert.equal(s.overall.totalReps, 135);
  assert.equal(s.overall.todayReps, 35);
  // 10·80 + 25·80 + 100·(80+5)
  assert.equal(s.overall.totalVolume, 800 + 2000 + 8500);
});

test('`today` es la fecha del cliente: ayer solo suma lo de ayer', { skip: !HAS_DB }, async () => {
  const res = await fetch(`${base}/stats?type=pushups&today=${ymd(-1)}`, { headers: { Authorization: `Bearer ${token()}` } });
  assert.equal((await res.json()).overall.todayReps, 100);
});

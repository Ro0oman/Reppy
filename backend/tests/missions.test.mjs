// Misiones: progreso, y refill diario durante muchos días (B2).
//
// Necesita Postgres en DATABASE_URL y SOLO se ejecuta contra localhost: el
// before() vacía tablas. Sin DATABASE_URL se omite (igual que economy-concurrency).
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
if (URL_DB && !HAS_DB) console.warn('missions.test: DATABASE_URL no es localhost; se omite por seguridad.');
const __dirname = dirname(fileURLToPath(import.meta.url));
process.env.JWT_SECRET ||= 'test-secret';

let query, pool, updateMissionProgress, server, base;
const uid = `test_missions_${Date.now()}`;
const auth = () => ({ Authorization: `Bearer ${jwt.sign({ id: uid, tv: 0 }, process.env.JWT_SECRET)}` });

before(async () => {
  if (!HAS_DB) return;
  ({ query, default: pool } = await import('../db.js'));
  ({ updateMissionProgress } = await import('../utils/missions.js'));
  const router = (await import('../missions.js')).default;
  await query(readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8'));
  await query('DELETE FROM user_missions');
  await query('DELETE FROM missions');
  for (let i = 1; i <= 6; i++) {
    await query(`INSERT INTO missions (title_key, goal_type, goal_value, reward_coins, is_daily) VALUES ($1,'reps',50,10,true)`, [`t_daily_${i}`]);
  }
  for (let i = 1; i <= 2; i++) {
    await query(`INSERT INTO missions (title_key, goal_type, goal_value, reward_coins, is_daily) VALUES ($1,'streak',3,10,false)`, [`t_special_${i}`]);
  }
  await query(`INSERT INTO users (id, name, email, password_hash) VALUES ($1,'Test',$2,'hash')`, [uid, `${uid}@test.local`]);
  const app = express();
  app.use(express.json());
  app.use('/', router);
  server = http.createServer(app);
  await new Promise(r => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (!HAS_DB) return;
  await query('DELETE FROM user_missions WHERE user_id = $1', [uid]);
  await query('DELETE FROM users WHERE id = $1', [uid]);
  await new Promise(r => server.close(r));
  await pool.end();
});

const get = async () => (await fetch(`${base}/`, { headers: auth() })).json();

test('el progreso de reps completa la misión', { skip: !HAS_DB }, async () => {
  const { missions } = await get();
  const daily = missions.filter(m => m.is_daily);
  assert.equal(daily.length, 2);
  await updateMissionProgress(uid, 'reps', 20, true);
  let row = (await query('SELECT current_value, is_completed FROM user_missions WHERE user_id=$1 AND mission_id=$2', [uid, daily[0].id])).rows[0];
  assert.equal(row.current_value, 20);
  assert.equal(row.is_completed, false);
  await updateMissionProgress(uid, 'reps', 40, true);
  row = (await query('SELECT current_value, is_completed FROM user_missions WHERE user_id=$1 AND mission_id=$2', [uid, daily[0].id])).rows[0];
  assert.equal(row.current_value, 60);
  assert.equal(row.is_completed, true);
});

test('B2: tras 20 días reclamando todo siguen saliendo 2 diarias', { skip: !HAS_DB }, async () => {
  await query('DELETE FROM user_missions WHERE user_id = $1', [uid]);
  await query('UPDATE users SET last_daily_missions_refill = NULL WHERE id = $1', [uid]);
  for (let day = 1; day <= 20; day++) {
    const { missions } = await get();
    const daily = missions.filter(m => m.is_daily);
    assert.equal(daily.length, 2, `día ${day}: debía haber 2 diarias activas, hay ${daily.length}`);
    for (const m of daily) {
      await query('UPDATE user_missions SET is_completed = true, current_value = $3 WHERE user_id=$1 AND mission_id=$2', [uid, m.id, m.goal_value]);
      const res = await fetch(`${base}/claim/${m.id}`, { method: 'POST', headers: auth() });
      assert.equal(res.status, 200, `día ${day}: el claim de ${m.id} debía dar 200`);
    }
    // Pasa al día siguiente.
    await query(`UPDATE users SET last_daily_missions_refill = CURRENT_TIMESTAMP - INTERVAL '2 days' WHERE id = $1`, [uid]);
  }
});

test('B2: dos peticiones simultáneas no duplican el refill', { skip: !HAS_DB }, async () => {
  await query('DELETE FROM user_missions WHERE user_id = $1', [uid]);
  await query('UPDATE users SET last_daily_missions_refill = NULL WHERE id = $1', [uid]);
  const results = await Promise.all([get(), get(), get(), get()]);
  assert.ok(results.every(r => r.missions.length > 0));
  const active = (await query(
    `SELECT count(*)::int AS n FROM user_missions um JOIN missions m ON m.id = um.mission_id
     WHERE um.user_id = $1 AND um.is_active AND m.is_daily`, [uid])).rows[0].n;
  assert.equal(active, 2);
});

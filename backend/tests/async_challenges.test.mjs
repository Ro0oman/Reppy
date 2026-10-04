// Desafíos asíncronos de 24 h: puntuación, resolución automática y empates.
//
// Necesita Postgres en DATABASE_URL y SOLO se ejecuta contra localhost.
// Crea usuarios efímeros con email único y los borra al terminar.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const URL_DB = process.env.DATABASE_URL || '';
const HAS_DB = /@(localhost|127\.0\.0\.1)[:/]/.test(URL_DB);
const __dirname = dirname(fileURLToPath(import.meta.url));

const stamp = Date.now();
const uid1 = `test_challenge_a_${stamp}`;
const uid2 = `test_challenge_b_${stamp}`;
let query, pool, updateChallengeScores, resolveExpiredChallenges;

const scores = async (id) => (await query('SELECT * FROM async_challenges WHERE id = $1', [id])).rows[0];
const insert = async (cols, vals) => (await query(
  `INSERT INTO async_challenges (challenger_id, challenged_id, ${cols.join(', ')})
   VALUES ($1, $2, ${vals.map((_, i) => `$${i + 3}`).join(', ')}) RETURNING *`, [uid1, uid2, ...vals])).rows[0];

before(async () => {
  if (!HAS_DB) return;
  ({ query, default: pool } = await import('../db.js'));
  ({ updateChallengeScores, resolveExpiredChallenges } = await import('../utils/challenges.js'));
  await query(readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8'));
  for (const [id, n] of [[uid1, 'a'], [uid2, 'b']]) {
    await query(`INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, 'hash')`, [id, `Challenger ${n}`, `${id}@test.local`]);
  }
});

after(async () => {
  if (!HAS_DB) return;
  await query('DELETE FROM async_challenges WHERE challenger_id = $1 OR challenged_id = $1', [uid1]);
  await query('DELETE FROM users WHERE id IN ($1, $2)', [uid1, uid2]);
  await pool.end();
});

test('puntuación por reps y por daño, cada una ignora la otra', { skip: !HAS_DB }, async () => {
  const exp = new Date(Date.now() + 86400000);
  const reps = await insert(['goal_type', 'goal_value', 'status', 'expires_at'], ['reps', 100, 'active', exp]);
  const dmg = await insert(['goal_type', 'goal_value', 'status', 'expires_at'], ['damage', 5000, 'active', exp]);

  await updateChallengeScores(uid1, { reps: 30, damage: 1200 });
  await updateChallengeScores(uid2, { reps: 45, damage: 800 });

  const r = await scores(reps.id);
  assert.equal(r.challenger_score, 30);
  assert.equal(r.challenged_score, 45);
  const d = await scores(dmg.id);
  assert.equal(d.challenger_score, 1200);
  assert.equal(d.challenged_score, 800);
});

test('los desafíos pendientes no reciben puntos', { skip: !HAS_DB }, async () => {
  const pending = await insert(['goal_type', 'goal_value', 'status'], ['reps', 100, 'pending']);
  await updateChallengeScores(uid1, { reps: 999 });
  assert.equal((await scores(pending.id)).challenger_score, 0);
});

test('al expirar gana la mayor puntuación y no se resuelve dos veces', { skip: !HAS_DB }, async () => {
  const c = await insert(['goal_type', 'goal_value', 'status', 'expires_at', 'challenger_score', 'challenged_score'],
    ['reps', 100, 'active', new Date(Date.now() - 1000), 30, 45]);
  await resolveExpiredChallenges();
  const done = await scores(c.id);
  assert.equal(done.status, 'finished');
  assert.equal(String(done.winner_id), uid2);
  assert.ok(done.resolved_at);

  const before = (await query(`SELECT count(*)::int AS n FROM async_challenges WHERE status = 'finished'`)).rows[0].n;
  await resolveExpiredChallenges();
  const after = (await query(`SELECT count(*)::int AS n FROM async_challenges WHERE status = 'finished'`)).rows[0].n;
  assert.equal(after, before);
});

test('un empate termina sin ganador', { skip: !HAS_DB }, async () => {
  const c = await insert(['goal_type', 'goal_value', 'status', 'expires_at', 'challenger_score', 'challenged_score'],
    ['reps', 100, 'active', new Date(Date.now() - 1000), 50, 50]);
  await resolveExpiredChallenges();
  const done = await scores(c.id);
  assert.equal(done.status, 'finished');
  assert.equal(done.winner_id, null);
});

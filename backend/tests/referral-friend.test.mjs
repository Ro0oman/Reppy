// D5: registrarse con ?ref=CODE crea la amistad y avisa al invitador.
// Solo corre contra localhost.
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
const emails = [`ref_a_${stamp}@test.local`, `ref_b_${stamp}@test.local`];
const signup = (name, email, extra = {}) => fetch(`${base}/auth/signup`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password: TEST_PASSWORD, ...extra }),
});

before(async () => {
  if (!HAS_DB) return;
  ({ query, default: pool } = await import('../db.js'));
  await query(readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8'));
  const app = express();
  app.use(express.json());
  app.use('/auth', (await import('../auth.js')).default);
  server = http.createServer(app);
  await new Promise(r => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (!HAS_DB) return;
  await query('DELETE FROM users WHERE email = ANY($1)', [emails]);
  await new Promise(r => server.close(r));
  await pool.end();
});

test('el referido queda como amigo del invitador y este recibe un aviso', { skip: !HAS_DB }, async () => {
  const a = await (await signup('Invitadora', emails[0])).json();
  const code = (await query('SELECT referral_code FROM users WHERE id = $1', [a.user.id])).rows[0].referral_code;

  const res = await signup('Invitado', emails[1], { referral_code: code });
  assert.equal(res.status, 200);
  const b = await res.json();

  const f = await query(
    'SELECT * FROM friendships WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)',
    [a.user.id, b.user.id]);
  assert.equal(f.rowCount, 1, 'debe existir exactamente una amistad');
  assert.equal(f.rows[0].status, 'accepted');

  const n = await query(`SELECT * FROM notifications WHERE user_id = $1 AND type = 'FRIEND_ADDED'`, [a.user.id]);
  assert.equal(n.rowCount, 1);
  assert.equal(n.rows[0].actor_id, b.user.id);

  const gems = (await query('SELECT reppy_gems FROM users WHERE id = $1', [b.user.id])).rows[0].reppy_gems;
  assert.ok(gems >= 50, 'el bono de bienvenida sigue funcionando');
});

test('un código inexistente no crea amistades ni rompe el alta', { skip: !HAS_DB }, async () => {
  const email = `ref_c_${stamp}@test.local`;
  emails.push(email);
  const res = await signup('Sin invitador', email, { referral_code: 'NOEXISTE' });
  assert.equal(res.status, 200);
  const id = (await res.json()).user.id;
  assert.equal((await query('SELECT 1 FROM friendships WHERE user_id_1 = $1 OR user_id_2 = $1', [id])).rowCount, 0);
});

// D6: búsqueda por username, aviso al añadir y eliminar amigo. Solo corre contra localhost.
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
const stamp = Date.now();
const A = `test_friend_a_${stamp}`;
const B = `test_friend_b_${stamp}`;
const tok = (id) => ({ Authorization: `Bearer ${jwt.sign({ id, tv: 0 }, process.env.JWT_SECRET)}`, 'Content-Type': 'application/json' });

before(async () => {
  if (!HAS_DB) return;
  ({ query, default: pool } = await import('../db.js'));
  await query(readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8'));
  await query(`INSERT INTO users (id, name, email, password_hash) VALUES ($1,'Ana Test',$2,'h')`, [A, `${A}@test.local`]);
  await query(`INSERT INTO users (id, name, email, password_hash, username) VALUES ($1,'Bea Test',$2,'h',$3)`, [B, `${B}@test.local`, `bea_${stamp}`]);
  const app = express();
  app.use(express.json());
  app.use('/', (await import('../social.js')).default);
  server = http.createServer(app);
  await new Promise(r => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (!HAS_DB) return;
  await query('DELETE FROM users WHERE id IN ($1, $2)', [A, B]);
  await new Promise(r => server.close(r));
  await pool.end();
});

test('la búsqueda encuentra por username, con o sin @, y no trata % como comodín', { skip: !HAS_DB }, async () => {
  const find = async (q) => (await (await fetch(`${base}/search?q=${encodeURIComponent(q)}`, { headers: tok(A) })).json());
  assert.ok((await find(`bea_${stamp}`)).some(u => u.id === B), 'por username');
  assert.ok((await find(`@bea_${stamp}`)).some(u => u.id === B), 'con @');
  assert.ok((await find('Bea Te')).some(u => u.id === B), 'por nombre sigue funcionando');
  assert.equal((await find('%')).length, 0, '% literal no coincide con todo');
  assert.ok(!(await find('b_a')).some(u => u.id === B), '_ literal no es comodín (b_a no debe casar con bea)');
});

test('añadir avisa a la otra persona, y se puede eliminar la amistad', { skip: !HAS_DB }, async () => {
  const add = await fetch(`${base}/add`, { method: 'POST', headers: tok(A), body: JSON.stringify({ friendId: B }) });
  assert.equal(add.status, 200);
  const n = await query(`SELECT * FROM notifications WHERE user_id = $1 AND type = 'FRIEND_ADDED'`, [B]);
  assert.equal(n.rowCount, 1);
  assert.equal(n.rows[0].actor_id, A);

  // Quien fue añadido también puede romperla.
  const del = await fetch(`${base}/remove/${A}`, { method: 'DELETE', headers: tok(B) });
  assert.equal(del.status, 200);
  assert.equal((await query('SELECT 1 FROM friendships WHERE user_id_1 = ANY($1) AND user_id_2 = ANY($1)', [[A, B]])).rowCount, 0);

  const again = await fetch(`${base}/remove/${A}`, { method: 'DELETE', headers: tok(B) });
  assert.equal(again.status, 404);
});

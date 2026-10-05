// Vibe por defecto (oct 2026): la migración de schema.sql pasa a Vibe a quien tenía el
// estilo por defecto, respeta a quien eligió otro, y no se repite en cada arranque.
// Solo corre contra localhost.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const URL_DB = process.env.DATABASE_URL || '';
const HAS_DB = /@(localhost|127\.0\.0\.1)[:/]/.test(URL_DB);
const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA = () => readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8');

let query, pool;
const stamp = Date.now();
const ids = { op: `t_vibe_op_${stamp}`, cl: `t_vibe_cl_${stamp}`, nul: `t_vibe_nul_${stamp}`, au: `t_vibe_au_${stamp}` };
const styleOf = async (id) => (await query('SELECT ui_style FROM users WHERE id = $1', [id])).rows[0].ui_style;

before(async () => {
  if (!HAS_DB) return;
  ({ query, default: pool } = await import('../db.js'));
  await query(SCHEMA());
  for (const id of Object.values(ids)) {
    await query(`INSERT INTO users (id, name, email, password_hash) VALUES ($1,'V',$2,'h')`, [id, `${id}@test.local`]);
  }
  await query(`UPDATE users SET ui_style = 'operative' WHERE id = $1`, [ids.op]);
  await query(`UPDATE users SET ui_style = 'classic' WHERE id = $1`, [ids.cl]);
  await query(`UPDATE users SET ui_style = NULL WHERE id = $1`, [ids.nul]);
  await query(`UPDATE users SET ui_style = 'aurora' WHERE id = $1`, [ids.au]);
  // Simula el primer arranque tras el despliegue.
  await query(`DELETE FROM app_migrations WHERE id = '2026-10-vibe-por-defecto'`);
  await query(SCHEMA());
});

after(async () => {
  if (!HAS_DB) return;
  await query('DELETE FROM users WHERE id = ANY($1)', [Object.values(ids)]);
  await pool.end();
});

test('el estilo por defecto (y el clásico retirado) pasan a Vibe; Aurora se respeta', { skip: !HAS_DB }, async () => {
  assert.equal(await styleOf(ids.op), 'vibe');
  assert.equal(await styleOf(ids.cl), 'vibe');
  assert.equal(await styleOf(ids.nul), 'vibe');
  assert.equal(await styleOf(ids.au), 'aurora');
});

test('las cuentas nuevas nacen en Vibe', { skip: !HAS_DB }, async () => {
  const id = `t_vibe_new_${stamp}`;
  await query(`INSERT INTO users (id, name, email, password_hash) VALUES ($1,'N',$2,'h')`, [id, `${id}@test.local`]);
  assert.equal(await styleOf(id), 'vibe');
  await query('DELETE FROM users WHERE id = $1', [id]);
});

test('no se repite: quien vuelve a Operative OS lo conserva tras otro arranque', { skip: !HAS_DB }, async () => {
  await query(`UPDATE users SET ui_style = 'operative' WHERE id = $1`, [ids.op]);
  await query(SCHEMA());
  assert.equal(await styleOf(ids.op), 'operative');
});

// Con solo schema.sql (BD nueva) deben existir las tablas que consulta el código vivo.
// Solo corre contra localhost.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const URL_DB = process.env.DATABASE_URL || '';
const HAS_DB = /@(localhost|127\.0\.0\.1)[:/]/.test(URL_DB);
const __dirname = dirname(fileURLToPath(import.meta.url));

let query, pool;

before(async () => {
  if (!HAS_DB) return;
  ({ query, default: pool } = await import('../db.js'));
  await query(readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8'));
});

after(async () => {
  if (HAS_DB && pool) await pool.end();
});

const REQUIRED = [
  'users', 'reps', 'items', 'missions', 'user_missions', 'boss_fights', 'event_participants',
  'daily_shop_items', 'streak_freezes', 'async_challenges', 'friendships', 'notifications',
  'daily_summaries', 'summary_interactions',
  'social_xp_rewards', 'boss_kill_posts', 'summary_comment_subscribers',
];

test('el esquema crea todas las tablas que usa el código', { skip: !HAS_DB }, async () => {
  const res = await query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
  const have = new Set(res.rows.map(r => r.table_name));
  const missing = REQUIRED.filter(t => !have.has(t));
  assert.deepEqual(missing, []);
});

test('el esquema es idempotente: aplicarlo dos veces no falla', { skip: !HAS_DB }, async () => {
  await query(readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8'));
});

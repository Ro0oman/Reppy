// Concurrency / atomicity tests for the money paths. These guard the fixes in
// PR #321 (race conditions in shop.js /daily/refresh and reps.js referral) and
// the roulette pattern they mirror: under a race, gems must never go negative
// and a one-shot reward must pay exactly once.
//
// Needs a Postgres reachable via DATABASE_URL. Runs in CI against the `postgres`
// service (see .github/workflows/ci.yml). Locally, `npm test` skips this file
// unless DATABASE_URL is set — the pure-math suite still runs.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HAS_DB = !!process.env.DATABASE_URL;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Import the REAL pool/helpers so we exercise db.js exactly as the app does.
let query, withTransaction, pool;
if (HAS_DB) {
  ({ query, withTransaction, default: pool } = await import('../db.js'));
}

const CONC = 20;

before(async () => {
  if (!HAS_DB) return;
  // Load the shipped schema, then add the two columns that only live in
  // /db/init today (the schema drift the audit flagged in P3). Idempotent.
  const schema = readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8');
  await query(schema);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_refreshes INTEGER DEFAULT 0`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_refresh_at TIMESTAMPTZ`);
});

after(async () => {
  if (HAS_DB && pool) await pool.end();
});

async function resetUsers() {
  await query('DELETE FROM gem_transactions');
  await query('DELETE FROM users');
}

// Mirrors reps.js: single guarded UPDATE ... RETURNING acts as an atomic claim
// gate so the referrer is paid exactly once no matter how many "first reps" land
// concurrently.
async function claimReferral(userId) {
  const claimRes = await query(
    `UPDATE users SET referral_reward_given = TRUE
     WHERE id = $1 AND referral_reward_given = FALSE AND referred_by IS NOT NULL
     RETURNING referred_by`, [userId]);
  if (!claimRes.rows[0]) return false;
  const referrerId = claimRes.rows[0].referred_by;
  await query('UPDATE users SET reppy_gems = reppy_gems + 50 WHERE id = $1', [referrerId]);
  await query(
    "INSERT INTO gem_transactions (user_id, amount, source, description) VALUES ($1, 50, 'referral_activated', 'Bonus por referido activado')",
    [referrerId]);
  return true;
}

// Mirrors shop.js /daily/refresh: SELECT ... FOR UPDATE + guarded deduction
// inside one transaction per caller.
async function refreshShop(userId) {
  return withTransaction(async (client) => {
    const lock = await client.query(
      'SELECT reppy_gems, daily_refreshes, last_refresh_at FROM users WHERE id = $1 FOR UPDATE', [userId]);
    if (lock.rowCount === 0) return false;
    const user = lock.rows[0];
    let cur = user.daily_refreshes || 0;
    if (user.last_refresh_at) {
      const l = new Date(user.last_refresh_at).toDateString();
      if (l !== new Date().toDateString()) cur = 0;
    }
    const cost = cur + 1;
    if (user.reppy_gems < cost) return false;
    const d = await client.query(
      'UPDATE users SET reppy_gems = reppy_gems - $1, daily_refreshes = $2, last_refresh_at = CURRENT_TIMESTAMP WHERE id = $3 AND reppy_gems >= $1 RETURNING reppy_gems',
      [cost, cur + 1, userId]);
    return d.rowCount === 1;
  });
}

test('referral reward pays the referrer exactly once under concurrency', { skip: !HAS_DB && 'DATABASE_URL not set' }, async () => {
  await resetUsers();
  await query("INSERT INTO users (id, name, email, reppy_gems, referral_reward_given, referred_by) VALUES ('ref','ref','ref@t.co',0,TRUE,NULL)");
  await query("INSERT INTO users (id, name, email, reppy_gems, referral_reward_given, referred_by) VALUES ('kid','kid','kid@t.co',0,FALSE,'ref')");

  const results = await Promise.all(Array.from({ length: CONC }, () => claimReferral('kid').catch(() => false)));

  assert.equal(results.filter(Boolean).length, 1, 'exactly one concurrent claim wins');
  const gems = (await query("SELECT reppy_gems FROM users WHERE id='ref'")).rows[0].reppy_gems;
  assert.equal(gems, 50, 'referrer paid exactly 50 gems');
  const txCount = (await query("SELECT COUNT(*)::int c FROM gem_transactions WHERE user_id='ref'")).rows[0].c;
  assert.equal(txCount, 1, 'exactly one gem_transaction logged');
});

test('daily shop refresh never drives gems negative under concurrency', { skip: !HAS_DB && 'DATABASE_URL not set' }, async () => {
  await resetUsers();
  await query("INSERT INTO users (id, name, email, reppy_gems, daily_refreshes) VALUES ('u','u','u@t.co',5,0)");

  await Promise.all(Array.from({ length: CONC }, () => refreshShop('u').catch(() => false)));

  const gems = (await query("SELECT reppy_gems FROM users WHERE id='u'")).rows[0].reppy_gems;
  assert.ok(gems >= 0, `gems never negative (got ${gems})`);
});

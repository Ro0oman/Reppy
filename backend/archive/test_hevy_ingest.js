/**
 * Manual end-to-end test for the Hevy ingestion (issue #214).
 * Imports ONLY today's latest workout into a sandbox user and prints before/after.
 *
 *   node test_hevy_ingest.js
 */
import pool, { query } from './db.js';
import { getLatestWorkout, getWorkout } from './utils/hevyClient.js';
import { ingestHevyWorkout } from './utils/hevyIngest.js';
import { getLocalDateString } from './utils/date.js';

const API_KEY = process.env.HEVY_TEST_KEY; // never hardcode secrets — pass via env
const USER_ID = process.env.HEVY_TEST_USER; // target Reppy user id
if (!API_KEY || !USER_ID) {
  console.error('Usage: HEVY_TEST_KEY=<hevy-api-key> HEVY_TEST_USER=<reppy-user-id> node test_hevy_ingest.js');
  process.exit(1);
}

async function snapshot(userId) {
  const u = (await query('SELECT total_xp, total_reps, str_xp, end_xp, reppy_coins, hevy_volume_kg FROM users WHERE id = $1', [userId])).rows[0];
  const boss = (await query(`SELECT name, current_hp FROM boss_fights WHERE status != 'defeated' ORDER BY order_index ASC LIMIT 1`)).rows[0];
  return { ...u, boss: boss ? `${boss.name} (${boss.current_hp} hp)` : 'none' };
}

(async () => {
  try {
    const latest = await getLatestWorkout(API_KEY);
    if (!latest) { console.log('No workouts on this account.'); return; }
    console.log(`Latest workout: "${latest.title}" @ ${latest.start_time} (${latest.id})`);
    if (getLocalDateString(latest.start_time) !== getLocalDateString()) {
      console.log(`⚠️  Latest workout is NOT from today (${getLocalDateString(latest.start_time)} vs ${getLocalDateString()}). Ingesting anyway for test.`);
    }

    const before = await snapshot(USER_ID);
    console.log('\nBEFORE:', before);

    const full = await getWorkout(API_KEY, latest.id);
    const result = await ingestHevyWorkout(USER_ID, full);
    console.log('\nINGEST RESULT:', JSON.stringify(result, null, 2));

    const after = await snapshot(USER_ID);
    console.log('\nAFTER:', after);

    console.log('\nDELTA:', {
      total_xp: after.total_xp - before.total_xp,
      total_reps: after.total_reps - before.total_reps,
      coins: after.reppy_coins - before.reppy_coins,
      hevy_volume_kg: Number(after.hevy_volume_kg) - Number(before.hevy_volume_kg),
    });
  } catch (e) {
    console.error('TEST FAILED:', e);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

import pool, { query } from './db.js';

/**
 * Migration for issue #214 — Hevy (hevy.com) integration.
 *
 * - users: stores the encrypted Hevy API key, a per-user webhook token,
 *   last sync cursor, and cumulative kg volume moved (new metric).
 * - hevy_exercise_map: Hevy exercise_template_id → Reppy exercise_type.
 *   Default Hevy templates share IDs across all users, so a global seed works.
 *   Anything not in this map is ingested as a user-custom exercise.
 * - hevy_imported_workouts: idempotency ledger + lets us revert on delete.
 *
 *   node apply_hevy_migration.js
 */

// Hevy default exercise_template_id → Reppy exercise slug.
// weighted=true means the set carries external load (track added_weight + tonnage).
const EXERCISE_MAP = [
  // ── Pull ───────────────────────────────────────────────
  ['1B2B1E7C', 'pullups',          false], // Pull Up
  ['7C50F118', 'pullups',          false], // Wide Pull Up
  ['5F09F0FC', 'pullups',          false], // Ring Pull Up
  ['A91838C0', 'pullups',          false], // Kipping Pull Up
  ['EE2938D1', 'pullups',          false], // Sternum Pull up (Gironda)
  ['29083183', 'pullups',          false], // Chin Up
  ['729237D1', 'weighted_pullups', true ], // Pull Up (Weighted)
  ['023943F1', 'weighted_pullups', true ], // Chin Up (Weighted)
  ['2C37EC5E', 'assisted_pullups', false], // Pull Up (Assisted)
  ['56808FD2', 'assisted_pullups', false], // Pull Up (Band)
  ['D23C609B', 'assisted_pullups', false], // Chin Up (Assisted)
  ['F60BDDF8', 'negative_pullups', false], // Negative Pull Up
  ['C7AE420A', 'scapular_pulls',   false], // Scapular Pull Ups
  // ── Push (horizontal) ──────────────────────────────────
  ['392887AA', 'pushups',          false], // Push Up
  ['6575F52D', 'pushups',          false], // Diamond Push Up
  ['C43825EA', 'pushups',          false], // Decline Push Up
  ['10D76E8F', 'pushups',          false], // Clap Push Ups
  ['947DAC23', 'pushups',          false], // Push Up - Close Grip
  ['B140095E', 'pushups',          false], // One Arm Push Up
  ['0EFE8162', 'pushups',          false], // Pike Pushup
  ['31436F5D', 'pushups',          false], // Plank Pushup
  ['AEA56BDC', 'pushups',          false], // Ring Push Up
  ['90B04F96', 'pushups',          false], // Handstand Push Up
  ['19372ABC', 'pushups',          true ], // Push Up (Weighted)
  ['39C99849', 'incline_pushups',  false], // Incline Push Ups
  ['B74A95BB', 'incline_pushups',  false], // Kneeling Push Up
  // ── Dips ───────────────────────────────────────────────
  ['28BB4A95', 'dips',             false], // Triceps Dip
  ['6FCD7755', 'dips',             false], // Chest Dip
  ['CD6DC8E5', 'dips',             false], // Bench Dip
  ['A57D38D5', 'dips',             false], // Floor Triceps Dip
  ['29472BE1', 'dips',             true ], // Chest Dip (Weighted)
  ['10347BAC', 'dips',             true ], // Triceps Dip (Weighted)
  ['E9E4089F', 'dips',             false], // Chest Dip (Assisted)
  ['4B4BF8C2', 'dips',             false], // Triceps Dip (Assisted)
  // ── Muscle up ──────────────────────────────────────────
  ['9F9C164B', 'muscleups',        false], // Muscle Up
  // ── Legs (all squat variants) ──────────────────────────
  ['9694DA61', 'legs', false], ['3FF6A22E', 'legs', false], ['5BFF35BA', 'legs', false],
  ['3F5F8D40', 'legs', false], ['70D4EBBF', 'legs', false], ['D731CCA8', 'legs', false],
  ['B82D6418', 'legs', false], ['1283BBA6', 'legs', true ], ['5046D0A9', 'legs', true ],
  ['D04AC939', 'legs', true ], ['3D0C7C75', 'legs', true ], ['B5D3A742', 'legs', true ],
  // ── Static / core ──────────────────────────────────────
  ['B9380898', 'dead_hang', false], // Dead Hang
  ['C6C9B8A0', 'plank',     false], // Plank
  ['425805F4', 'inverted_rows', false], // Inverted Row
];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS hevy_api_key TEXT,
        ADD COLUMN IF NOT EXISTS hevy_webhook_token TEXT,
        ADD COLUMN IF NOT EXISTS hevy_last_sync TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS hevy_volume_kg BIGINT DEFAULT 0;
    `);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_hevy_token ON users(hevy_webhook_token) WHERE hevy_webhook_token IS NOT NULL;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hevy_exercise_map (
        hevy_template_id   VARCHAR(64) PRIMARY KEY,
        reppy_exercise_type VARCHAR(80) NOT NULL,
        is_weighted        BOOLEAN DEFAULT FALSE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS hevy_imported_workouts (
        hevy_workout_id VARCHAR(64) PRIMARY KEY,
        user_id         VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        imported_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        workout_date    DATE,
        volume_kg       BIGINT DEFAULT 0,
        counts          JSONB
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_hevy_imported_user ON hevy_imported_workouts(user_id);`);

    for (const [tid, slug, weighted] of EXERCISE_MAP) {
      await client.query(
        `INSERT INTO hevy_exercise_map (hevy_template_id, reppy_exercise_type, is_weighted)
         VALUES ($1, $2, $3)
         ON CONFLICT (hevy_template_id)
         DO UPDATE SET reppy_exercise_type = EXCLUDED.reppy_exercise_type, is_weighted = EXCLUDED.is_weighted`,
        [tid, slug, weighted]
      );
    }

    await client.query('COMMIT');
    console.log(`✅ Hevy migration done. Seeded ${EXERCISE_MAP.length} exercise mappings.`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Hevy migration failed:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();

import { query } from './db.js';

async function migrate() {
  console.log('Starting migration: Add last_hit_user_id to boss_fights...');

  try {
    await query('BEGIN');

    await query(`
      ALTER TABLE boss_fights 
      ADD COLUMN IF NOT EXISTS last_hit_user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL
    `);

    await query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  }

  process.exit(0);
}

migrate();

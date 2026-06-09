import { query } from './db.js';

async function migrate() {
  try {
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_spin_at TIMESTAMP WITH TIME ZONE');
    console.log('Database migration successful: last_spin_at column added.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrate();

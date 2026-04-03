import { query } from './db.js';

async function migrate() {
  try {
    console.log('Running migration: Adding is_admin and image_url...');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE');
    await query('UPDATE users SET is_admin = TRUE WHERE id = \'113903862264612270084\'');
    await query('ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS image_url TEXT');
    console.log('Migration successful!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

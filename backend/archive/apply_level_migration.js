import { query } from './db.js';

const migrate = async () => {
  try {
    console.log('Applying migrations for level system...');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS level_chests INTEGER DEFAULT 0');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS level_chests_claimed INTEGER DEFAULT 1');
    
    // Safety updates
    await query('UPDATE users SET level_chests = GREATEST(level_chests, 0) WHERE level_chests IS NULL');
    await query('UPDATE users SET level_chests_claimed = GREATEST(level_chests_claimed, 1) WHERE level_chests_claimed IS NULL OR level_chests_claimed = 0');
    
    console.log('Migration successful.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();

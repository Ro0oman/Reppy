import { query } from './db.js';

const migrate = async () => {
  try {
    console.log('Syncing total_xp across all users...');
    
    // Ensure the column exists (Safety first)
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0');
    
    // Recalculate total_xp based on existing stats
    await query(`
      UPDATE users 
      SET total_xp = COALESCE(str_xp, 0) + COALESCE(pwr_xp, 0) + COALESCE(end_xp, 0) + COALESCE(agi_xp, 0)
    `);
    
    console.log('Migration successful: total_xp is now in sync with attributes.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();

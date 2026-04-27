import { query } from './db.js';

const migrate = async () => {
  try {
    console.log('Applying Reppy Gems migration...');
    
    // Add reppy_gems to users
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reppy_gems INTEGER DEFAULT 0;
    `);

    // Create gem_transactions table
    await query(`
      CREATE TABLE IF NOT EXISTS gem_transactions (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          amount INTEGER NOT NULL,
          source VARCHAR(50) NOT NULL, -- 'mission', 'battle_pass', 'purchase', 'admin'
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query('CREATE INDEX IF NOT EXISTS idx_gem_trans_user ON gem_transactions(user_id)');
    
    console.log('Migration successful.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();

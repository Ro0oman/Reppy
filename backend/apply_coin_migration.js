import { query } from './db.js';

const migrate = async () => {
  try {
    console.log('Applying coin history migration...');
    await query(`
      CREATE TABLE IF NOT EXISTS coin_transactions (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          amount INTEGER NOT NULL,
          source VARCHAR(50) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_coin_trans_user ON coin_transactions(user_id)');
    console.log('Migration successful.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();

import { query } from './db.js';

const migrate = async () => {
  try {
    console.log('Applying Missions migration...');
    
    // Create missions table
    await query(`
      CREATE TABLE IF NOT EXISTS missions (
          id SERIAL PRIMARY KEY,
          title_key VARCHAR(100) NOT NULL, -- Translation key
          description_key VARCHAR(100),
          goal_type VARCHAR(50) NOT NULL, -- 'reps', 'streak', 'damage'
          goal_value INTEGER NOT NULL,
          reward_xp INTEGER DEFAULT 0, -- Battle Pass XP
          reward_gems INTEGER DEFAULT 0,
          reward_coins INTEGER DEFAULT 0,
          is_daily BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(title_key)
      );
    `);

    // Create user_missions table
    await query(`
      CREATE TABLE IF NOT EXISTS user_missions (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
          current_value INTEGER DEFAULT 0,
          is_completed BOOLEAN DEFAULT FALSE,
          is_claimed BOOLEAN DEFAULT FALSE,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, mission_id)
      );
    `);

    await query('CREATE INDEX IF NOT EXISTS idx_user_missions_user ON user_missions(user_id)');
    
    console.log('Migration successful.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();

import pool from './db.js';

const queries = [
  `CREATE TABLE IF NOT EXISTS pvp_fights (
      id SERIAL PRIMARY KEY,
      challenger_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
      challenged_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'pending', 
      hp1 INTEGER,
      hp2 INTEGER,
      max_hp INTEGER DEFAULT 5000,
      time_limit INTEGER DEFAULT 60,
      battlefield VARCHAR(50) DEFAULT 'default',
      allowed_exercises JSONB DEFAULT '["pullups", "pushups", "dips"]'::jsonb,
      winner_id VARCHAR(255) REFERENCES users(id),
      damage1 INTEGER DEFAULT 0,
      damage2 INTEGER DEFAULT 0,
      anticheat_enabled BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      started_at TIMESTAMP WITH TIME ZONE,
      ended_at TIMESTAMP WITH TIME ZONE,
      state JSONB DEFAULT '{}'::jsonb
  )`,
  `CREATE TABLE IF NOT EXISTS pvp_events (
      id SERIAL PRIMARY KEY,
      fight_id INTEGER REFERENCES pvp_fights(id) ON DELETE CASCADE,
      user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
      type VARCHAR(50) NOT NULL, 
      payload JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  `ALTER TABLE pvp_fights ADD COLUMN IF NOT EXISTS state JSONB DEFAULT '{}'::jsonb`,
  `CREATE INDEX IF NOT EXISTS idx_pvp_events_fight ON pvp_events(fight_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_pvp_fights_active ON pvp_fights(status) WHERE status = 'active'`
];

async function migrate() {
  console.log('Starting PvP Migration...');
  for (const q of queries) {
    try {
      await pool.query(q);
      console.log('Executed query successfully');
    } catch (e) {
      console.error('Error executing query:', e.message);
    }
  }
  console.log('Migration finished');
  process.exit(0);
}

migrate();

import { query } from './db.js';

const run = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS async_challenges (
        id SERIAL PRIMARY KEY,
        challenger_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        challenged_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        goal_type VARCHAR(20) NOT NULL DEFAULT 'reps',
        goal_value INT NOT NULL DEFAULT 100,
        challenger_score INT NOT NULL DEFAULT 0,
        challenged_score INT NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        winner_id VARCHAR REFERENCES users(id),
        reward_coins INT NOT NULL DEFAULT 75,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ,
        resolved_at TIMESTAMPTZ,
        CONSTRAINT no_self_challenge CHECK (challenger_id != challenged_id)
      )
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_async_challenges_challenger ON async_challenges(challenger_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_async_challenges_challenged ON async_challenges(challenged_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_async_challenges_status ON async_challenges(status)`);

    console.log('async_challenges table created.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

run();

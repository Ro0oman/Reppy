import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './auth.js';
import repsRoutes from './reps.js';
import socialRoutes from './social.js';
import leaderboardRoutes from './leaderboard.js';
import usersRoutes from './users.js';
import { query } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/reps', repsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', usersRoutes);

// Automated DB initialization for the user
app.get('/api/db/init', async (req, res) => {
  try {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          avatar_url TEXT,
          total_reps INTEGER DEFAULT 0,
          is_private BOOLEAN DEFAULT FALSE,
          daily_goal INTEGER DEFAULT 50,
          body_weight DECIMAL DEFAULT 75.0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS reps (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          count INTEGER NOT NULL DEFAULT 0,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          exercise_type VARCHAR(50) DEFAULT 'pullups',
          added_weight DECIMAL DEFAULT 0.0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, date, exercise_type)
      )`,
      // Migration for existing tables
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS body_weight DECIMAL DEFAULT 75.0`,
      `ALTER TABLE reps ADD COLUMN IF NOT EXISTS added_weight DECIMAL DEFAULT 0.0`,
      `ALTER TABLE reps ADD COLUMN IF NOT EXISTS exercise_type VARCHAR(50) DEFAULT 'pullups'`,
      `UPDATE reps SET exercise_type = 'pullups' WHERE exercise_type IS NULL`,
      `ALTER TABLE reps DROP CONSTRAINT IF EXISTS reps_user_id_date_key`,
      `DO $$ 
       BEGIN 
         IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reps_user_id_date_exercise_type_key') THEN
           ALTER TABLE reps ADD CONSTRAINT reps_user_id_date_exercise_type_key UNIQUE(user_id, date, exercise_type);
         END IF;
       END $$;`,
      `CREATE TABLE IF NOT EXISTS friendships (
          id SERIAL PRIMARY KEY,
          user_id_1 VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          user_id_2 VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'accepted',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id_1, user_id_2)
      )`,
      `CREATE INDEX IF NOT EXISTS idx_reps_user_date ON reps(user_id, date)`,
      `CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(user_id_1, user_id_2)`
    ];
    
    for (const q of queries) {
      await query(q);
    }
    
    res.json({ message: 'Database initialized successfully! You can now log in.' });
  } catch (error) {
    console.error('Database initialization failed:', error);
    res.status(500).json({ error: 'Database initialization failed', detail: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Reppy API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

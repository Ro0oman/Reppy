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
import shopRoutes from './shop.js';
import bossRoutes from './boss.js';
import profileRoutes from './profile.js';
import rouletteRoutes from './roulette.js';
import { query } from './db.js';


import adminRoutes from './admin.js';

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
app.use('/api/shop', shopRoutes);
app.use('/api/boss', bossRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/roulette', rouletteRoutes);
app.use('/api/admin', adminRoutes);


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
      `CREATE TABLE IF NOT EXISTS cosmetics (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          type VARCHAR(50) NOT NULL,
          price INTEGER NOT NULL,
          css_value VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS user_inventory (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          cosmetic_id INTEGER REFERENCES cosmetics(id) ON DELETE CASCADE,
          is_new BOOLEAN DEFAULT TRUE,
          acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, cosmetic_id)
      )`,
      `ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT TRUE`,
      `CREATE TABLE IF NOT EXISTS boss_fights (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          total_hp INTEGER NOT NULL,
          current_hp INTEGER NOT NULL,
          start_date TIMESTAMP WITH TIME ZONE NOT NULL,
          end_date TIMESTAMP WITH TIME ZONE NOT NULL,
          status VARCHAR(50) DEFAULT 'active'
      )`,
      `CREATE TABLE IF NOT EXISTS event_participants (
          id SERIAL PRIMARY KEY,
          boss_fight_id INTEGER REFERENCES boss_fights(id) ON DELETE CASCADE,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          damage_dealt INTEGER DEFAULT 0,
          chests_claimed INTEGER DEFAULT 0,
          UNIQUE(boss_fight_id, user_id)
      )`,
      `CREATE TABLE IF NOT EXISTS friendships (
          id SERIAL PRIMARY KEY,
          user_id_1 VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          user_id_2 VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'accepted',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id_1, user_id_2)
      )`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE`,
      `UPDATE users SET is_admin = TRUE WHERE email = 'romainot99@gmail.com'`,
      `ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS image_url TEXT`,
      `ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT FALSE`,
      `UPDATE cosmetics SET is_seasonal = TRUE WHERE name IN ('Aura de Pascua', 'Rabbit Slayer', 'Easter Celebration')`,
      `ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS rarity VARCHAR(50) DEFAULT 'common'`,
      `UPDATE cosmetics SET rarity = 'legendary' WHERE price >= 1200`,
      `UPDATE cosmetics SET rarity = 'epic' WHERE price < 1200 AND price >= 600`,
      `UPDATE cosmetics SET rarity = 'rare' WHERE price < 600 AND price >= 200`,
      `CREATE INDEX IF NOT EXISTS idx_reps_user_date ON reps(user_id, date)`,
      `CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(user_id_1, user_id_2)`,
      `CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id)`
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

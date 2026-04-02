-- Use this schema for PostgreSQL (Supabase/Neon)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Google ID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    avatar_url TEXT,
    total_reps INTEGER DEFAULT 0,
    -- RPG and Currency fields
    reppy_coins INTEGER DEFAULT 0,
    str_xp INTEGER DEFAULT 0,
    pwr_xp INTEGER DEFAULT 0,
    end_xp INTEGER DEFAULT 0,
    agi_xp INTEGER DEFAULT 0,
    last_seen_version VARCHAR(50) DEFAULT '1.0.0',
    equipped_title_id INTEGER,
    equipped_border_id INTEGER,
    is_private BOOLEAN DEFAULT false,
    body_weight DECIMAL DEFAULT 75.0,
    daily_goal INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reps (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    count INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    exercise_type VARCHAR(50) DEFAULT 'pullups',
    added_weight DECIMAL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date, exercise_type)
);

CREATE TABLE IF NOT EXISTS friendships (
    id SERIAL PRIMARY KEY,
    user_id_1 VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'accepted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id_1, user_id_2)
);

-- Cosmetics Store
CREATE TABLE IF NOT EXISTS cosmetics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'title', 'border', 'avatar'
    price INTEGER NOT NULL,
    css_value VARCHAR(255), -- Helper for frontend styling
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Inventory
CREATE TABLE IF NOT EXISTS user_inventory (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    cosmetic_id INTEGER REFERENCES cosmetics(id) ON DELETE CASCADE,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, cosmetic_id)
);

-- Boss Fights
CREATE TABLE IF NOT EXISTS boss_fights (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_hp INTEGER NOT NULL,
    current_hp INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'defeated', 'expired'
    tier1_chest_unlocked BOOLEAN DEFAULT false,
    tier2_chest_unlocked BOOLEAN DEFAULT false,
    tier3_chest_unlocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event Participants (Damage calculation per boss)
CREATE TABLE IF NOT EXISTS event_participants (
    id SERIAL PRIMARY KEY,
    boss_fight_id INTEGER REFERENCES boss_fights(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    damage_dealt INTEGER DEFAULT 0,
    chests_claimed INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(boss_fight_id, user_id)
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_reps_user_date ON reps(user_id, date);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(user_id_1, user_id_2);
CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id);

-- Migraciones seguras para tablas que ya existan
ALTER TABLE users ADD COLUMN IF NOT EXISTS reppy_coins INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS str_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pwr_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS end_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS agi_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_version VARCHAR(50) DEFAULT '1.0.0';
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_title_id INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_border_id INTEGER;


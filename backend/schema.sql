-- Use this schema for PostgreSQL (Supabase/Neon)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- Google ID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    avatar_url TEXT,
    theme VARCHAR(20) DEFAULT 'dark',
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
    equipped_avatar_id INTEGER,
    is_private BOOLEAN DEFAULT false,
    body_weight DECIMAL DEFAULT 75.0,
    daily_goal INTEGER DEFAULT 50,
    has_seen_easter_modal BOOLEAN DEFAULT false,
    boss_chests INTEGER DEFAULT 1,
    int_xp INTEGER DEFAULT 0,
    fth_xp INTEGER DEFAULT 0,
    dex_xp INTEGER DEFAULT 0,
    vig_xp INTEGER DEFAULT 0,
    damage_multiplier DECIMAL DEFAULT 1.0,
    damage_multiplier_expiry TIMESTAMP WITH TIME ZONE,
    cha_xp INTEGER DEFAULT 0,
    last_streak_reward_date DATE,
    reppy_gems INTEGER DEFAULT 0,
    onboarding_mode VARCHAR(30),
    goal_onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reps (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    count INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    exercise_type VARCHAR(50) DEFAULT 'pullups',
    added_weight DECIMAL DEFAULT 0.0,
    boss_damage_dealt INTEGER DEFAULT 0,
    active_multiplier DECIMAL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date, exercise_type)
);

CREATE TABLE IF NOT EXISTS training_plans (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(80) UNIQUE NOT NULL,
    title_key VARCHAR(120) NOT NULL,
    description_key VARCHAR(120) NOT NULL,
    goal_type VARCHAR(80) NOT NULL,
    duration_days INTEGER NOT NULL,
    difficulty VARCHAR(40) DEFAULT 'beginner',
    is_active BOOLEAN DEFAULT TRUE,
    -- NULL owner = predefined/global plan; otherwise a user-created (custom) plan
    owner_user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    is_custom BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_training_plans_owner ON training_plans(owner_user_id);

CREATE TABLE IF NOT EXISTS training_plan_days (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES training_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title_key VARCHAR(120) NOT NULL,
    focus VARCHAR(80) NOT NULL,
    estimated_minutes INTEGER DEFAULT 12,
    reward_xp INTEGER DEFAULT 100,
    reward_coins INTEGER DEFAULT 50,
    UNIQUE(plan_id, day_number)
);

CREATE TABLE IF NOT EXISTS training_plan_blocks (
    id SERIAL PRIMARY KEY,
    plan_day_id INTEGER REFERENCES training_plan_days(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    block_type VARCHAR(40) NOT NULL,
    title VARCHAR(120) NOT NULL,
    instructions TEXT,
    exercise_type VARCHAR(50),
    target_sets INTEGER DEFAULT 1,
    target_reps INTEGER DEFAULT 1,
    rest_seconds INTEGER DEFAULT 60
);

CREATE TABLE IF NOT EXISTS user_active_plans (
    user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES training_plans(id) ON DELETE CASCADE,
    started_at DATE DEFAULT CURRENT_DATE,
    current_day INTEGER DEFAULT 1,
    days_per_week INTEGER DEFAULT 3,
    baseline JSONB DEFAULT '{}'::jsonb,
    equipment JSONB DEFAULT '{}'::jsonb,
    last_completed_date DATE,
    last_completed_day INTEGER,
    status VARCHAR(30) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS workout_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES training_plans(id),
    plan_day_id INTEGER REFERENCES training_plan_days(id),
    status VARCHAR(30) DEFAULT 'started',
    total_reps INTEGER DEFAULT 0,
    total_damage INTEGER DEFAULT 0,
    reward_xp INTEGER DEFAULT 0,
    reward_coins INTEGER DEFAULT 0,
    completion_rate INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS workout_set_logs (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES workout_sessions(id) ON DELETE CASCADE,
    block_id INTEGER REFERENCES training_plan_blocks(id),
    set_index INTEGER NOT NULL,
    exercise_type VARCHAR(50),
    target_reps INTEGER DEFAULT 0,
    actual_reps INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS exercises (
    slug VARCHAR(80) PRIMARY KEY,
    title_key VARCHAR(120) NOT NULL,
    description_key TEXT NOT NULL,
    technique_key TEXT,
    unit VARCHAR(20) DEFAULT 'reps',
    difficulty_multiplier DECIMAL(5,2) DEFAULT 1.0,
    coin_multiplier DECIMAL(5,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    stat_type VARCHAR(20) DEFAULT 'end_xp'
);

CREATE TABLE IF NOT EXISTS user_favorite_exercises (
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    exercise_slug VARCHAR(80) REFERENCES exercises(slug) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    PRIMARY KEY (user_id, exercise_slug)
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
    css_value TEXT, -- Helper for frontend styling
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
);

-- User Inventory
CREATE TABLE IF NOT EXISTS user_inventory (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    cosmetic_id INTEGER REFERENCES cosmetics(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    is_new BOOLEAN DEFAULT TRUE,
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
    weakness_stat VARCHAR(50) DEFAULT 'str', -- 'str', 'dex', 'end', 'vig', 'int', 'fth'
    image_url TEXT,           -- static fallback art
    boss_gif TEXT,            -- idle video filename, served from /public/video (optional)
    boss_damaged TEXT,        -- hit-reaction video filename, served from /public/video (optional)
    order_index INTEGER DEFAULT 0,
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


-- Blog Tracking for Intelligence (INT)
CREATE TABLE IF NOT EXISTS user_read_blogs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    post_slug VARCHAR(255) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_slug)
);

CREATE TABLE IF NOT EXISTS gem_transactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gem_trans_user ON gem_transactions(user_id);

CREATE TABLE IF NOT EXISTS streak_freezes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    freeze_date DATE NOT NULL,
    spent_coins INTEGER NOT NULL DEFAULT 250,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, freeze_date)
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_reps_user_date ON reps(user_id, date);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(user_id_1, user_id_2);
CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_freezes_user_date ON streak_freezes(user_id, freeze_date);

-- Migraciones seguras para tablas que ya existan
ALTER TABLE users ADD COLUMN IF NOT EXISTS reppy_coins INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS str_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pwr_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS end_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS agi_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_version VARCHAR(50) DEFAULT '1.0.0';
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_title_id INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_border_id INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_background_id INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_post_background_id INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_seen_easter_modal BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level_chests INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level_chests_claimed INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS int_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS fth_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dex_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vig_xp INTEGER DEFAULT 0;
ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS weakness_stat VARCHAR(50) DEFAULT 'str';

-- Grant 1 chest to all existing users (Safety Update)
UPDATE users SET boss_chests = GREATEST(boss_chests, 1) WHERE boss_chests IS NULL OR boss_chests = 0;
UPDATE users SET level_chests = GREATEST(level_chests, 0) WHERE level_chests IS NULL;
UPDATE users SET current_level = GREATEST(current_level, 1) WHERE current_level IS NULL OR current_level = 0;
UPDATE users SET level_chests_claimed = GREATEST(level_chests_claimed, 1) WHERE level_chests_claimed IS NULL OR level_chests_claimed = 0;

-- Damage & Consumables Update
ALTER TABLE users ADD COLUMN IF NOT EXISTS damage_multiplier DECIMAL DEFAULT 1.0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS damage_multiplier_expiry TIMESTAMP WITH TIME ZONE;
-- Temporary per-stat consumable buffs: { "str": { "value": 3, "expiry": "<iso>" }, ... }
ALTER TABLE users ADD COLUMN IF NOT EXISTS stat_buffs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cha_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_spin_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_spin_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_seen_avatar_overhaul BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_streak_reward_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_disabled BOOLEAN DEFAULT FALSE;
-- "Reto vs tu semana pasada": Monday-anchored week key of the last claimed weekly challenge.
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_weekly_reto_week TEXT;
ALTER TABLE user_active_plans ADD COLUMN IF NOT EXISTS last_completed_date DATE;
ALTER TABLE user_active_plans ADD COLUMN IF NOT EXISTS last_completed_day INTEGER;
ALTER TABLE training_plans ADD COLUMN IF NOT EXISTS owner_user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE training_plans ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;

-- Push Notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    subscription_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, subscription_json)
);
CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);

-- Skill Tree (combat perks). 1 skill point per level-up (granted in utils/stats.js,
-- mirroring level_chests_claimed). Perks are bounded modifiers on top of the
-- auto-derived stats; allocations live in skill_perks JSONB: { "<perkId>": <rank> }.
-- Existing users keep claimed=1 so they retroactively earn points up to their level.
ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_points_claimed INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_perks JSONB DEFAULT '{}'::jsonb;

-- Referral System
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(255) REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_reward_given BOOLEAN DEFAULT FALSE;
-- Ensures the referral-invite push is sent at most once per user (see referralReminders.js).
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_reminder_sent BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- Backfill referral codes for existing users who don't have one yet
-- (Run once; safe to re-run due to WHERE filter)
DO $$
DECLARE
  rec RECORD;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT;
BEGIN
  FOR rec IN SELECT id FROM users WHERE referral_code IS NULL LOOP
    LOOP
      code := '';
      FOR i IN 1..8 LOOP
        code := code || substr(chars, (floor(random() * length(chars)) + 1)::int, 1);
      END LOOP;
      BEGIN
        UPDATE users SET referral_code = code WHERE id = rec.id;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        -- retry with a new code
      END;
    END LOOP;
  END LOOP;
END $$;

-- Per-user "feature seen" flags that drive the NEW badges/dots in the UI.
CREATE TABLE IF NOT EXISTS user_feature_seen (
    user_id     VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    feature_key VARCHAR(64) NOT NULL,
    seen_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, feature_key)
);

-- ============================================================================
-- CAMPAIGN ENGINE (RPG campaign redesign — see docs/combat-campaign-redesign.md)
--
-- Engine vs content split: the tables below are GENERIC. All actual enemies,
-- zones, nodes, NPCs and quests are CONTENT, seeded from
-- backend/data/campaigns/<slug>.json by scripts/seed_campaign.js (upsert by
-- slug). User-facing text lives in JSONB {"es": "...", "en": "..."} so adding a
-- monster or a whole new themed campaign requires no code and no locale edits.
-- ============================================================================

-- ── Content (populated by the seed) ────────────────────────────────────────

-- A campaign = one themed playthrough (the launch one, plus future expansions).
CREATE TABLE IF NOT EXISTS campaigns (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(80) UNIQUE NOT NULL,
    name        JSONB NOT NULL DEFAULT '{}'::jsonb,   -- {"es":..,"en":..}
    description JSONB NOT NULL DEFAULT '{}'::jsonb,
    status      VARCHAR(20) DEFAULT 'draft',          -- draft | active | archived
    config      JSONB NOT NULL DEFAULT '{}'::jsonb,   -- scaling/prestige/path/map params
    version     INTEGER DEFAULT 1,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enemy templates. campaign_id NULL = shared across campaigns.
CREATE TABLE IF NOT EXISTS enemy_types (
    id            SERIAL PRIMARY KEY,
    campaign_id   INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    slug          VARCHAR(80) UNIQUE NOT NULL,
    family        VARCHAR(50) NOT NULL,               -- minion|goblin|skeleton|zombie|spider|bandit|demon|knight...
    tier          SMALLINT DEFAULT 1,                 -- 1 grunt .. 5 act boss
    name          JSONB NOT NULL DEFAULT '{}'::jsonb,
    description   JSONB NOT NULL DEFAULT '{}'::jsonb,
    base_hp       INTEGER NOT NULL DEFAULT 1000,
    weakness_stat VARCHAR(10),                        -- reuses calculateDamage weakness
    resist_stat   VARCHAR(10),                        -- mirror: dampens that stat's damage
    scaling       JSONB NOT NULL DEFAULT '{}'::jsonb, -- {hp_per_level, hp_tier_mult, ...}
    loot          JSONB NOT NULL DEFAULT '{}'::jsonb, -- {coins:[min,max], xp, chest_chance, drop_table}
    art           JSONB NOT NULL DEFAULT '{}'::jsonb, -- {image, idle_video, damaged_video} (filenames)
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NPCs that hand out quest chains.
CREATE TABLE IF NOT EXISTS npcs (
    id          SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    slug        VARCHAR(80) UNIQUE NOT NULL,
    name        JSONB NOT NULL DEFAULT '{}'::jsonb,
    faction     VARCHAR(20) DEFAULT 'neutral',        -- light | dark | neutral
    art         JSONB NOT NULL DEFAULT '{}'::jsonb,
    dialogue    JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Zones group nodes into acts; path_required gates a zone behind a chosen path.
CREATE TABLE IF NOT EXISTS campaign_zones (
    id            SERIAL PRIMARY KEY,
    campaign_id   INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    slug          VARCHAR(80) NOT NULL,
    act           SMALLINT DEFAULT 1,
    name          JSONB NOT NULL DEFAULT '{}'::jsonb,
    theme         VARCHAR(50),
    order_index   INTEGER DEFAULT 0,
    path_required VARCHAR(10),                         -- NULL | light | dark
    art           JSONB NOT NULL DEFAULT '{}'::jsonb,
    config        JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE(campaign_id, slug)
);

-- Nodes are the graph vertices the player fights/interacts with.
CREATE TABLE IF NOT EXISTS campaign_nodes (
    id            SERIAL PRIMARY KEY,
    zone_id       INTEGER REFERENCES campaign_zones(id) ON DELETE CASCADE,
    slug          VARCHAR(80) NOT NULL,
    type          VARCHAR(20) NOT NULL DEFAULT 'combat', -- combat|elite|boss|raid|npc|crossroads|treasure
    enemy_type_id INTEGER REFERENCES enemy_types(id) ON DELETE SET NULL,
    pack          JSONB NOT NULL DEFAULT '{}'::jsonb,    -- {count:3} for enemy groups
    npc_id        INTEGER REFERENCES npcs(id) ON DELETE SET NULL,
    map_x         REAL DEFAULT 0,
    map_y         REAL DEFAULT 0,
    requires      JSONB NOT NULL DEFAULT '{}'::jsonb,    -- {min_level, path, stat:{str:15}, nodes:[slugs]}
    rewards       JSONB NOT NULL DEFAULT '{}'::jsonb,    -- first-clear bonus on top of enemy loot
    UNIQUE(zone_id, slug)
);

-- Directed edges: the map is a graph (main path + optional side paths).
CREATE TABLE IF NOT EXISTS campaign_edges (
    id           SERIAL PRIMARY KEY,
    from_node_id INTEGER REFERENCES campaign_nodes(id) ON DELETE CASCADE,
    to_node_id   INTEGER REFERENCES campaign_nodes(id) ON DELETE CASCADE,
    kind         VARCHAR(10) DEFAULT 'main',            -- main | side
    UNIQUE(from_node_id, to_node_id)
);

-- Quest templates, chainable per NPC.
CREATE TABLE IF NOT EXISTS npc_quests (
    id                  SERIAL PRIMARY KEY,
    npc_id              INTEGER REFERENCES npcs(id) ON DELETE CASCADE,
    slug                VARCHAR(80) UNIQUE NOT NULL,
    chain_slug          VARCHAR(80),
    chain_step          SMALLINT DEFAULT 1,
    name                JSONB NOT NULL DEFAULT '{}'::jsonb,
    description         JSONB NOT NULL DEFAULT '{}'::jsonb,
    objective           JSONB NOT NULL DEFAULT '{}'::jsonb, -- {type:'kill',family,zone,count} | reps | damage | clear_node | stat_check | streak
    time_limit_hours    INTEGER,                            -- dark-path pacts only
    path_required       VARCHAR(10),                        -- NULL | light | dark
    rewards             JSONB NOT NULL DEFAULT '{}'::jsonb,
    penalty             JSONB NOT NULL DEFAULT '{}'::jsonb, -- pacts: coin loss / curse on expiry
    requires_quest_slug VARCHAR(80)
);

-- ── Player state ───────────────────────────────────────────────────────────

-- One run per (user, campaign, prestige). A partial unique index enforces at
-- most one ACTIVE run per user+campaign.
CREATE TABLE IF NOT EXISTS campaign_runs (
    id             SERIAL PRIMARY KEY,
    user_id        VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    campaign_id    INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    prestige_level INTEGER DEFAULT 0,
    path           VARCHAR(10),                         -- NULL | light | dark
    status         VARCHAR(20) DEFAULT 'active',        -- active | completed | abandoned
    started_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at   TIMESTAMP WITH TIME ZONE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_runs_active
    ON campaign_runs(user_id, campaign_id) WHERE status = 'active';

-- Per-node progress within a run; enemy HP is snapshotted on engage so it stays
-- stable mid-fight even if the player levels up.
CREATE TABLE IF NOT EXISTS user_node_progress (
    id               SERIAL PRIMARY KEY,
    run_id           INTEGER REFERENCES campaign_runs(id) ON DELETE CASCADE,
    node_id          INTEGER REFERENCES campaign_nodes(id) ON DELETE CASCADE,
    status           VARCHAR(20) DEFAULT 'available',   -- available | engaged | cleared
    enemy_current_hp INTEGER,
    enemy_total_hp   INTEGER,
    kills            INTEGER DEFAULT 0,
    cleared_at       TIMESTAMP WITH TIME ZONE,
    UNIQUE(run_id, node_id)
);

-- Per-run quest state.
CREATE TABLE IF NOT EXISTS user_npc_quests (
    id            SERIAL PRIMARY KEY,
    run_id        INTEGER REFERENCES campaign_runs(id) ON DELETE CASCADE,
    quest_id      INTEGER REFERENCES npc_quests(id) ON DELETE CASCADE,
    status        VARCHAR(20) DEFAULT 'offered',        -- offered | accepted | completed | claimed | failed
    current_value INTEGER DEFAULT 0,
    deadline_at   TIMESTAMP WITH TIME ZONE,
    UNIQUE(run_id, quest_id)
);

-- Persistent codex across prestiges.
CREATE TABLE IF NOT EXISTS user_bestiary (
    user_id       VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    enemy_type_id INTEGER REFERENCES enemy_types(id) ON DELETE CASCADE,
    kills         INTEGER DEFAULT 0,
    first_kill_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, enemy_type_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_nodes_zone ON campaign_nodes(zone_id);
CREATE INDEX IF NOT EXISTS idx_campaign_edges_from ON campaign_edges(from_node_id);
CREATE INDEX IF NOT EXISTS idx_user_node_progress_run ON user_node_progress(run_id);
CREATE INDEX IF NOT EXISTS idx_user_npc_quests_run ON user_npc_quests(run_id);

-- Raid nodes reuse the existing community boss system: a boss_fight can be
-- pinned to a campaign node so clearing your part of the raid clears the node.
ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS campaign_node_id INTEGER REFERENCES campaign_nodes(id) ON DELETE SET NULL;

-- Estilo de interfaz elegido por el usuario ('operative' | 'classic').
-- Se sincroniza con localStorage (reppy_ui_style) vía PATCH /users/profile.
ALTER TABLE users ADD COLUMN IF NOT EXISTS ui_style VARCHAR(20) DEFAULT 'operative';

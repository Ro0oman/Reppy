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
    -- TRUE = free weekly "rest day" (día de descanso activo); FALSE = paid 250-coin freeze.
    -- Tracked apart so the rest-day weekly limit never touches the paid-freeze economy.
    is_rest_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, freeze_date)
);
-- Idempotent migration for existing DBs (the CREATE above only helps fresh ones).
ALTER TABLE streak_freezes ADD COLUMN IF NOT EXISTS is_rest_day BOOLEAN DEFAULT FALSE;

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_reps_user_date ON reps(user_id, date);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(user_id_1, user_id_2);
CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_freezes_user_date ON streak_freezes(user_id, freeze_date);
-- Ranking global (feed social, weekly-summary, sitemap de atletas): se consultaba
-- con seq scan de `users` en subqueries correlacionadas por cada fila del feed.
-- El índice de notifications(user_id, created_at) vive en index.js: esa tabla solo
-- se crea en /db/init, no aquí (ver task de unificar las 3 fuentes de esquema).
CREATE INDEX IF NOT EXISTS idx_users_total_reps ON users(total_reps DESC) WHERE is_private = false;

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
-- Streak weekly-jackpot bookkeeping (antes se creaba en runtime dentro de getStreakStatus).
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_jackpot_week TEXT;
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

-- Revocación de JWT. Los tokens duran 30 días y no había forma de invalidarlos:
-- subir `token_version` invalida de golpe TODOS los tokens vivos de ese usuario
-- (logout global, ban, cambio de rol). El claim `tv` del token se compara contra
-- esta columna en cada petición (backend/middleware.js). Default 0 = los tokens
-- ya emitidos, que no llevan `tv`, siguen siendo válidos tras desplegar.
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0;

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

-- Grupo muscular principal del ejercicio (Hevy `primary_muscle_group`: chest,
-- quadriceps, abdominals…). Alimenta el multiplicador de combate ejercicio→daño
-- (auditoría 2026-07, opción B): el grupo mapea a un stat de combate (str/vig/end)
-- que se compara con weakness_stat/resist_stat del enemigo. NULL para los
-- ejercicios built-in de Reppy, que resuelven vía `stat_type`.
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS primary_muscle_group VARCHAR(50);

-- =====================================================================
-- Absorbido de las otras fuentes de esquema (auditoría 2026-07, opción A)
-- =====================================================================
-- Hasta ahora el esquema vivía repartido en CUATRO sitios: este fichero,
-- el DDL de `GET /db/init`, `ensureSchemaMigrations()` y —el más sorprendente—
-- `ensureProfileSchema()` en profile.js, que creaba `items` y `user_items`
-- (las tablas de las que cuelga toda la economía) en la PRIMERA petición a
-- /profile. Esto es lo que faltaba aquí; ahora `schema.sql` es la fuente única
-- y el arranque lo aplica entero.

-- Tienda / inventario. `equipped_*_id` de users referencia items(id), así que
-- esta tabla tiene que existir antes que esas columnas.
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    rarity VARCHAR(50) DEFAULT 'common', -- common | rare | especial | legendary | calistenico | cosmico
    stats JSONB DEFAULT '{}',
    image_url TEXT,
    css_value TEXT,
    price INTEGER DEFAULT 0,
    price_gems INTEGER DEFAULT 0,
    svg_key TEXT,
    is_seasonal BOOLEAN DEFAULT FALSE,
    bundle_items TEXT,
    original_price INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
);
ALTER TABLE items ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN IF NOT EXISTS price_gems INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN IF NOT EXISTS svg_key TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT FALSE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS bundle_items TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS original_price INTEGER;
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_customizable BOOLEAN DEFAULT FALSE;
-- Cosméticos exclusivos (títulos de prestigio «Renacido I…V»): no se compran, no
-- se venden y no pueden salir de un cofre — solo se otorgan al prestigiar. Lo
-- consultan la tienda, la rotación diaria y TODAS las queries de loot por rareza.
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS user_items (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    is_equipped BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT TRUE,
    quantity INTEGER DEFAULT 1,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id)
);

-- Columnas de users que sólo declaraban /db/init o ensureProfileSchema.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_boss_damage INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_boss_damage_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level_chests_claimed INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level_chests INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stat_buffs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_spin_at TIMESTAMP WITH TIME ZONE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(LOWER(username)) WHERE username IS NOT NULL;

-- Equipo y cosméticos equipados (FK a items, no a la tabla legacy `cosmetics`).
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_title_id INTEGER REFERENCES items(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_border_id INTEGER REFERENCES items(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_avatar_id INTEGER REFERENCES items(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_background_id INTEGER REFERENCES items(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_post_background_id INTEGER REFERENCES items(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_head_id INTEGER REFERENCES items(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_weapon_id INTEGER REFERENCES items(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_armor_id INTEGER REFERENCES items(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_boots_id INTEGER REFERENCES items(id) ON DELETE SET NULL;

-- Cosméticos legacy: columnas que sólo declaraba /db/init.
ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT FALSE;
ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS rarity VARCHAR(50) DEFAULT 'common';

-- Feed social: resumen diario + likes/comentarios.
CREATE TABLE IF NOT EXISTS daily_summaries (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_summaries_user_date ON daily_summaries(user_id, date);

CREATE TABLE IF NOT EXISTS summary_interactions (
    id SERIAL PRIMARY KEY,
    summary_id INTEGER REFERENCES daily_summaries(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_summary_interactions_summary_type ON summary_interactions(summary_id, type);

CREATE TABLE IF NOT EXISTS boss_kill_posts (
    id SERIAL PRIMARY KEY,
    boss_fight_id INTEGER REFERENCES boss_fights(id) ON DELETE CASCADE,
    boss_name VARCHAR(255),
    boss_image TEXT,
    killer_user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    killer_name VARCHAR(255),
    top3 JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(boss_fight_id)
);
CREATE INDEX IF NOT EXISTS idx_boss_kill_posts_created ON boss_kill_posts(created_at DESC);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    actor_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    content TEXT,
    target_id VARCHAR(255),
    target_user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Boss comunitario: tiers que multiplican el HP (×8 legendario, ×3 épico).
ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS is_legendary BOOLEAN DEFAULT FALSE;
ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS is_epic BOOLEAN DEFAULT FALSE;

-- Índices calientes (antes sólo en ensureSchemaMigrations o en scripts de archive/).
CREATE INDEX IF NOT EXISTS idx_users_total_reps ON users(total_reps DESC) WHERE is_private = false;
CREATE TABLE IF NOT EXISTS user_feature_seen (
    user_id     VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    feature_key VARCHAR(64) NOT NULL,
    seen_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, feature_key)
);

-- --- PvP y retos asíncronos ---------------------------------------------
-- Estas dos features vivas existían en producción SÓLO porque alguien ejecutó
-- una vez `archive/migrate_pvp_tables.js` y `archive/apply_async_challenges_migration.js`;
-- ninguna fuente canónica las declaraba. Absorbidas desde ahí.
CREATE TABLE IF NOT EXISTS pvp_fights (
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
);
ALTER TABLE pvp_fights ADD COLUMN IF NOT EXISTS state JSONB DEFAULT '{}'::jsonb;
ALTER TABLE pvp_fights ADD COLUMN IF NOT EXISTS seed VARCHAR(64);
CREATE INDEX IF NOT EXISTS idx_pvp_fights_active ON pvp_fights(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pvp_fights_status ON pvp_fights(status);

CREATE TABLE IF NOT EXISTS pvp_events (
    id SERIAL PRIMARY KEY,
    fight_id INTEGER REFERENCES pvp_fights(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pvp_events_fight ON pvp_events(fight_id, created_at DESC);

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
    reward_gems INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    CONSTRAINT no_self_challenge CHECK (challenger_id != challenged_id)
);
ALTER TABLE async_challenges ADD COLUMN IF NOT EXISTS reward_gems INT NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_async_challenges_challenger ON async_challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_async_challenges_challenged ON async_challenges(challenged_id);
CREATE INDEX IF NOT EXISTS idx_async_challenges_status ON async_challenges(status);

-- --- Columnas de `reps` que NINGUNA fuente declaraba ---------------------
-- Sólo existían en producción por migraciones manuales. Sin ellas, `POST /reps`
-- devuelve 500 en una BD recién creada (verificado en el test de arranque virgen).
ALTER TABLE reps ADD COLUMN IF NOT EXISTS is_crit BOOLEAN DEFAULT FALSE;
ALTER TABLE reps ADD COLUMN IF NOT EXISTS base_damage INTEGER DEFAULT 0;
ALTER TABLE reps ADD COLUMN IF NOT EXISTS gear_bonus INTEGER DEFAULT 0;
ALTER TABLE reps ADD COLUMN IF NOT EXISTS boss_fight_id INTEGER REFERENCES boss_fights(id) ON DELETE SET NULL;

-- Columnas legacy de `cosmetics` que sólo aparecían en scripts sueltos.
ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS price_gems INTEGER DEFAULT 0;
ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS bundle_items TEXT;
ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS original_price INTEGER;

-- --- Columnas de `users` que sólo declaraban módulos sueltos o scripts ----
-- Detectadas ejercitando la app contra una BD recién creada: sin ellas fallan
-- POST /reps, /shop/daily, /missions y /roulette/status.
ALTER TABLE users ADD COLUMN IF NOT EXISTS buff_bonus INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_refreshes INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_refresh_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_missions_refill TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS roulette_tickets_bought_today INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_roulette_ticket_bought_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_spin_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_jackpot_week TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_disabled BOOLEAN DEFAULT FALSE;
-- Integración con Hevy (la API key va cifrada AES-256-GCM, ver utils/hevyCrypto.js).
ALTER TABLE users ADD COLUMN IF NOT EXISTS hevy_api_key TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hevy_webhook_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hevy_volume_kg BIGINT DEFAULT 0;

-- --- Misiones e integración Hevy ----------------------------------------
-- Absorbido de `archive/apply_missions_migration.js` y `archive/apply_hevy_migration.js`,
-- que eran su única declaración (scripts de un solo uso que NO corren en runtime).
CREATE TABLE IF NOT EXISTS missions (
    id SERIAL PRIMARY KEY,
    title_key VARCHAR(100) NOT NULL,
    description_key VARCHAR(100),
    goal_type VARCHAR(50) NOT NULL, -- 'reps' | 'streak' | 'damage'
    goal_value INTEGER NOT NULL,
    reward_xp INTEGER DEFAULT 0,
    reward_gems INTEGER DEFAULT 0,
    reward_coins INTEGER DEFAULT 0,
    is_daily BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(title_key)
);

CREATE TABLE IF NOT EXISTS user_missions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
    current_value INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE,
    is_claimed BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, mission_id)
);
ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_user_missions_user ON user_missions(user_id);

CREATE TABLE IF NOT EXISTS hevy_exercise_map (
    hevy_template_id    VARCHAR(64) PRIMARY KEY,
    reppy_exercise_type VARCHAR(80) NOT NULL,
    is_weighted         BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS hevy_imported_workouts (
    hevy_workout_id VARCHAR(64) PRIMARY KEY,
    user_id         VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    imported_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    workout_date    DATE,
    volume_kg       BIGINT DEFAULT 0,
    counts          JSONB
);
CREATE INDEX IF NOT EXISTS idx_hevy_imported_user ON hevy_imported_workouts(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_hevy_token ON users(hevy_webhook_token) WHERE hevy_webhook_token IS NOT NULL;

-- `buff_bonus` va en `reps` (desglose del daño), no en `users`.
ALTER TABLE reps ADD COLUMN IF NOT EXISTS buff_bonus INTEGER DEFAULT 0;

-- =====================================================================
-- PENDIENTE: tablas que NO se pueden reconstruir desde el repositorio
-- =====================================================================
-- Estas cuatro tablas existen en producción pero su `CREATE TABLE` no está en
-- NINGÚN sitio del repo (ni aquí, ni en /db/init, ni en archive/, ni en scripts/).
-- Se crearon a mano en algún momento y nunca se versionaron:
--
--   · daily_shop_items      (rotación diaria de la tienda — GET /shop/daily)
--   · boss_participants     (daño por usuario en el boss comunitario)
--   · weekly_challenges     (reto semanal)
--   · user_skills           (árbol de habilidades)
--
-- Consecuencia: `schema.sql` todavía NO levanta una BD 100% funcional desde
-- cero; `GET /shop/daily` falla en una base recién creada. Cerrar esto exige un
-- `pg_dump --schema-only` de producción y pegar aquí su DDL — trabajo que encaja
-- con la Fase 2/3 de la migración de BD, no con este PR.

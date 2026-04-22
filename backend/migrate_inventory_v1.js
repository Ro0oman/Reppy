import { query } from './db.js';

async function migrate() {
  console.log('Starting migration: Inventory Core V1...');

  try {
    await query('BEGIN');

    // 1. Create items table
    console.log('Creating items table...');
    await query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL, -- 'head', 'weapon', 'armor', 'boots', 'title', 'border', 'avatar', 'background', 'post_background', 'consumable'
        rarity VARCHAR(50) DEFAULT 'common', -- 'common', 'rare', 'special', 'legendary', 'calisthenic'
        stats JSONB DEFAULT '{}', -- e.g. {"str": 5, "dex": 2}
        image_url TEXT,
        css_value TEXT, -- for legacy cosmetics
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name)
      )
    `);

    // 2. Create user_items table
    console.log('Creating user_items table...');
    await query(`
      CREATE TABLE IF NOT EXISTS user_items (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
        is_equipped BOOLEAN DEFAULT FALSE,
        is_new BOOLEAN DEFAULT TRUE,
        quantity INTEGER DEFAULT 1,
        acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, item_id)
      )
    `);

    // 3. Update users table with equipment slots
    console.log('Updating users table with equipment slots...');
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS equipped_head_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS equipped_weapon_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS equipped_armor_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS equipped_boots_id INTEGER REFERENCES items(id) ON DELETE SET NULL
    `);

    await query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (err) {
    await query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  }

  process.exit(0);
}

migrate();

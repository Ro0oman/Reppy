import { query } from './db.js';

async function migrate() {
  console.log('--- STARTING DAMAGE BREAKDOWN MIGRATION ---');
  try {
    await query(`
      ALTER TABLE reps 
      ADD COLUMN IF NOT EXISTS base_damage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS gear_bonus INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS buff_bonus INTEGER DEFAULT 0
    `);
    console.log('✅ Added damage breakdown columns to reps table');

    // Optional: Populate existing reps with total damage as base_damage if needed
    // await query('UPDATE reps SET base_damage = boss_damage_dealt WHERE base_damage = 0');
    
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
  process.exit();
}

migrate();

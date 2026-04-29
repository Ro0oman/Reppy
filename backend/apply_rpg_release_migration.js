import { query } from './db.js';

async function migrate() {
    console.log('--- STARTING RPG RELEASE MIGRATION ---');
    try {
        // Add has_seen_rpg_release column if it doesn't exist
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS has_seen_rpg_release BOOLEAN DEFAULT FALSE;
        `);
        console.log('✅ Column has_seen_rpg_release added to users table');
        
        // Also ensure has_seen_damage_overhaul exists as it was used in code
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS has_seen_damage_overhaul BOOLEAN DEFAULT FALSE;
        `);
        console.log('✅ Column has_seen_damage_overhaul ensured in users table');

        // And has_seen_armory_update
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS has_seen_armory_update BOOLEAN DEFAULT FALSE;
        `);
        console.log('✅ Column has_seen_armory_update ensured in users table');

        console.log('--- MIGRATION COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();

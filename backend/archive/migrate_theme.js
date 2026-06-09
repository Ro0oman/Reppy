import { query } from './db.js';

async function migrate() {
    try {
        console.log('--- Theme Persistence Migration ---');
        
        // 1. Add theme column if it doesn't exist
        console.log('Adding "theme" column to users table...');
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'dark';
        `);
        
        // 2. Keep explicit user choices, but dark is the default for users without a preference.
        console.log('Setting missing user themes to "dark"...');
        await query(`
            UPDATE users SET theme = 'dark' WHERE theme IS NULL;
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();

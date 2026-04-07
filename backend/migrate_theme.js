import { query } from './db.js';

async function migrate() {
    try {
        console.log('--- Theme Persistence Migration ---');
        
        // 1. Add theme column if it doesn't exist
        console.log('Adding "theme" column to users table...');
        await query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'light';
        `);
        
        // 2. Ensure all existing users are set to light mode by default
        // (Even if they had a default before, let's enforce the user's request)
        console.log('Setting default theme to "light" for all users...');
        await query(`
            UPDATE users SET theme = 'light' WHERE theme IS NULL;
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();

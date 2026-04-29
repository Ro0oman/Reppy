import { query } from './db.js';

const run = async () => {
  try {
    console.log('Adding last_daily_missions_refill to users table...');
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_daily_missions_refill TIMESTAMP WITH TIME ZONE DEFAULT '1970-01-01';
    `);
    console.log('Successfully added column.');
    process.exit(0);
  } catch (err) {
    console.error('Error adding column:', err);
    process.exit(1);
  }
};

run();

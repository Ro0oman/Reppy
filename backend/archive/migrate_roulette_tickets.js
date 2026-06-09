import { query } from './db.js';

async function migrate() {
  try {
    console.log('Migrating users table for Roulette Tickets...');
    
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS roulette_tickets_bought_today INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_roulette_ticket_bought_at TIMESTAMP WITH TIME ZONE
    `);
    
    console.log('Migration complete!');
  } catch (e) {
    console.error('Error during migration:', e);
  } finally {
    process.exit();
  }
}

migrate();

import { query } from './db.js';

const migrate = async () => {
  try {
    console.log('Adding price_gems to items and cosmetics...');
    await query('ALTER TABLE items ADD COLUMN IF NOT EXISTS price_gems INTEGER DEFAULT 0');
    await query('ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS price_gems INTEGER DEFAULT 0');
    
    // Update some "Legendary" or high-end items to cost gems
    console.log('Updating high-end items to cost gems...');
    
    // Example: Mythic items cost gems instead of coins (or in addition to)
    await query(`
      UPDATE items 
      SET price_gems = 50, price = 0 
      WHERE rarity = 'Legendary' AND price > 10000
    `);

    await query(`
      UPDATE cosmetics 
      SET price_gems = 20, price = 0 
      WHERE type = 'avatar' AND price > 5000
    `);

    console.log('Migration successful.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();

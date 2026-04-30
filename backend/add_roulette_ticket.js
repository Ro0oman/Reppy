import { query } from './db.js';

async function seed() {
  try {
    console.log('Seeding Roulette Ticket...');
    
    // Check if it already exists
    const existing = await query("SELECT id FROM items WHERE name = 'Ticket de Ruleta' OR svg_key = 'gi:ticket'");
    
    if (existing.rows.length > 0) {
      console.log('Roulette Ticket already exists. Updating properties...');
      await query(`
        UPDATE items 
        SET type = 'consumable', price = 0, price_gems = 5, rarity = 'especial', 
            svg_key = 'gi:ticket', description = 'Permite realizar un giro extra en la ruleta diaria.'
        WHERE id = $1
      `, [existing.rows[0].id]);
    } else {
      console.log('Inserting new Roulette Ticket...');
      await query(`
        INSERT INTO items (name, type, price, price_gems, rarity, svg_key, description, is_customizable)
        VALUES ('Ticket de Ruleta', 'consumable', 0, 5, 'especial', 'gi:ticket', 'Permite realizar un giro extra en la ruleta diaria.', false)
      `);
    }
    
    console.log('Done!');
  } catch (e) {
    console.error('Error seeding Roulette Ticket:', e);
  } finally {
    process.exit();
  }
}

seed();

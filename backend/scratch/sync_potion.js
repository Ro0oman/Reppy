import { query } from '../db.js';

async function syncPotion() {
  console.log('Syncing Poción de Fuerza (x1.5)...');
  try {
    // 1. Ensure the item exists and is correct
    // We'll use a specific name to avoid issues or update existing ones
    const potionName = 'Poción de Fuerza (x1.5)';
    const description = 'Aumenta tu daño contra bosses un x1.5 durante 24 horas.';
    
    await query(`
      INSERT INTO cosmetics (name, description, type, price, css_value, rarity, is_seasonal)
      VALUES ($1, $2, 'consumable', 150, '1.5', 'common', false)
      ON CONFLICT (name) DO UPDATE SET 
        description = EXCLUDED.description,
        css_value = EXCLUDED.css_value,
        rarity = 'common'
    `, [potionName, description]);

    console.log('Potion synced successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing potion:', error);
    process.exit(1);
  }
}

syncPotion();

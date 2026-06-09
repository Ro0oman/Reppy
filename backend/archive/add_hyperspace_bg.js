import { query } from './db.js';

async function addHyperspace() {
  console.log('Adding Hyperspace Background...');
  try {
    const item = { 
      name: 'Hyperspace Jump', 
      description: 'Legendary Screen. Warp speed protocol engaged. High-velocity visual feedback.', 
      type: 'background', 
      price: 1200, 
      css_value: 'bg-hyperspace',
      rarity: 'legendary'
    };

    await query(
      `INSERT INTO cosmetics (name, description, type, price, css_value, rarity) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (name) DO UPDATE SET 
         description = EXCLUDED.description, 
         price = EXCLUDED.price, 
         css_value = EXCLUDED.css_value,
         rarity = EXCLUDED.rarity`,
       [item.name, item.description, item.type, item.price, item.css_value, item.rarity]
    );

    console.log('Hyperspace Jump added successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error adding background:', error);
    process.exit(1);
  }
}

addHyperspace();

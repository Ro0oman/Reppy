import { query } from './db.js';

async function addLegendarySets() {
  console.log('Adding New Legendary Sets...');
  try {
    const items = [
      // 1. Void Knight Set
      { name: 'Void Knight', description: 'Legendary Title. El vacío te llama.', type: 'title', price: 2500, css_value: 'title-void-knight', rarity: 'legendary', is_seasonal: true },
      { name: 'Event Horizon', description: 'Legendary Border. Más allá del punto de no retorno.', type: 'border', price: 2500, css_value: 'frame-void', rarity: 'legendary', is_seasonal: true },
      { name: 'Cosmic Nebula', description: 'Legendary Background. Viaja entre las estrellas.', type: 'background', price: 2500, css_value: 'bg-void', rarity: 'legendary', is_seasonal: true },
      
      // 2. Cyber Ronin Set
      { name: 'Ronin.exe', description: 'Legendary Title. Un programador errante.', type: 'title', price: 2500, css_value: 'title-ronin', rarity: 'legendary', is_seasonal: true },
      { name: 'Digital Katana', description: 'Legendary Border. Filo de neón puro.', type: 'border', price: 2500, css_value: 'frame-ronin', rarity: 'legendary', is_seasonal: true },
      { name: 'Neo Tokyo', description: 'Legendary Background. Lluvia de datos en la ciudad eterna.', type: 'background', price: 2500, css_value: 'bg-ronin', rarity: 'legendary', is_seasonal: true },
      
      // 3. Blood God Set
      { name: 'BLOOD GOD', description: 'Legendary Title. Sangre por la gloria.', type: 'title', price: 2500, css_value: 'title-blood-god', rarity: 'legendary', is_seasonal: true },
      { name: 'Sacrificial Altar', description: 'Legendary Border. Runas bañadas en poder.', type: 'border', price: 2500, css_value: 'frame-blood-god', rarity: 'legendary', is_seasonal: true },
      { name: 'Crimson Tide', description: 'Legendary Background. Océano de energía vital.', type: 'background', price: 2500, css_value: 'bg-blood', rarity: 'legendary', is_seasonal: true }
    ];

    for (const item of items) {
      await query(
        `INSERT INTO cosmetics (name, description, type, price, css_value, rarity, is_seasonal) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (name) 
         DO UPDATE SET description = EXCLUDED.description, price = EXCLUDED.price, css_value = EXCLUDED.css_value, rarity = EXCLUDED.rarity, is_seasonal = EXCLUDED.is_seasonal`,
         [item.name, item.description, item.type, item.price, item.css_value, item.rarity, item.is_seasonal]
      );
      console.log(`Added/Updated: ${item.name}`);
    }

    console.log('Expansion de sets terminada.');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sets:', error);
    process.exit(1);
  }
}

addLegendarySets();

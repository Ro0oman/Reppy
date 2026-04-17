import { query } from './db.js';

async function addWelcomePack() {
  console.log('Adding Welcome Pack bundle...');
  try {
    // 1. Ensure bundle_items column exists
    await query('ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS bundle_items TEXT');
    await query('ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS original_price INTEGER');
    
    // 2. Define bundle contents (IDs)
    // No Excuses (14), Brick by Brick (9), Cyber Pulse (135), Crimson Tide (134), Carbon Scan (140)
    const itemIds = [14, 9, 135, 134, 140];
    const bundleItemsStr = itemIds.join(',');
    
    const bundle = {
      name: 'Pack de Bienvenida',
      description: 'El pack de inicio definitivo: Incluye un Título, Borde, Avatar, Fondo de Perfil y Fondo de Post para personalizar tu leyenda al máximo.',
      type: 'bundle',
      price: 2527, // ~40% off from 4211
      original_price: 4211,
      css_value: 'bundle-welcome',
      bundle_items: bundleItemsStr,
      rarity: 'rare'
    };

    await query(
      `INSERT INTO cosmetics (name, description, type, price, css_value, bundle_items, rarity, original_price) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       ON CONFLICT (name) DO UPDATE SET 
         description = EXCLUDED.description, 
         price = EXCLUDED.price, 
         css_value = EXCLUDED.css_value,
         bundle_items = EXCLUDED.bundle_items,
         rarity = EXCLUDED.rarity,
         original_price = EXCLUDED.original_price`,
       [bundle.name, bundle.description, bundle.type, bundle.price, bundle.css_value, bundle.bundle_items, bundle.rarity, bundle.original_price]
    );

    console.log('Welcome Pack added successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error adding Welcome Pack:', error);
    process.exit(1);
  }
}

addWelcomePack();

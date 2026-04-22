import { query } from './db.js';

async function addWelcomePack() {
  console.log('Updating Welcome Pack bundle with real items...');
  try {
    // Define bundle contents (IDs based on current DB)
    // No Excuses (14), Brick by Brick (9), Cyber Pulse (135), Pure Black Glass (16), Carbon Scan (140)
    const itemIds = [14, 9, 135, 16, 140];
    const bundleItemsStr = itemIds.join(',');
    
    // Calculate total price of components
    const itemsRes = await query('SELECT SUM(price) as total FROM items WHERE id = ANY($1)', [itemIds]);
    const originalPrice = parseInt(itemsRes.rows[0].total) || 750; // 150 * 5 = 750

    const bundle = {
      name: 'Pack de Bienvenida',
      description: 'El pack de inicio definitivo para tu transformación digital. Incluye Título, Borde, Avatar, Fondo de Perfil y Fondo de Post con estética Industrial.',
      type: 'bundle',
      price: Math.round(originalPrice * 0.6), // 40% discount
      original_price: originalPrice,
      css_value: 'bundle-welcome',
      bundle_items: bundleItemsStr,
      rarity: 'rare'
    };

    await query(
      `INSERT INTO items (name, description, type, price, css_value, bundle_items, rarity, original_price) 
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

    console.log('Welcome Pack updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating Welcome Pack:', error);
    process.exit(1);
  }
}

addWelcomePack();

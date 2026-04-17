import { query } from './db.js';

async function seedBundles() {
  console.log('Seeding all Bundles (Starter, Epic, Legendary)...');
  try {
    // 1. Ensure columns exist
    await query('ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS bundle_items TEXT');
    await query('ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS original_price INTEGER');
    
    const bundles = [
      {
        name: 'Pack de Bienvenida',
        description: 'El pack de inicio definitivo: Incluye un Título, Borde, Avatar, Fondo de Perfil y Fondo de Post.',
        type: 'bundle',
        price: 2527, // 40% off from 4211
        original_price: 4211,
        css_value: 'bundle-welcome',
        bundle_items: '14,9,135,134,140', // No Excuses, Brick by Brick, Cyber Pulse, Crimson Tide, Carbon Scan
        rarity: 'rare'
      },
      {
        name: 'Pack Épico',
        description: 'Equipamiento de alto rendimiento para atletas avanzados.',
        type: 'bundle',
        price: 3600, // Roughly 40% off from ~6000
        original_price: 6000,
        css_value: 'bundle-epic',
        bundle_items: '10,12,141', // Guardián del Tubo (400), Aura Fuego Ámbar (800), Neon Pulse (2222) + more if found
        rarity: 'epic'
      },
      {
        name: 'Pack Legendario',
        description: 'Solo para leyendas. El equipamiento más prestigioso de la armería.',
        type: 'bundle',
        price: 8033, // 40% off from 13388
        original_price: 13388,
        css_value: 'bundle-legendary',
        bundle_items: '17,13,136,142,144', // Built Different, Furia Infinita, Glitch Master, Matrix Rain, Void Gravity
        rarity: 'legendary'
      }
    ];

    for (const bundle of bundles) {
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
      console.log(`- ${bundle.name} seeded`);
    }

    console.log('Todos los packs operativos.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding bundles:', error);
    process.exit(1);
  }
}

seedBundles();

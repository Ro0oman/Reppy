import { query } from './db.js';

async function addPostBackgrounds() {
  console.log('Adding New Training Post Backgrounds...');
  try {
    // Ensure column exists first (Safety)
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_post_background_id INTEGER');

    const items = [
      { 
        name: 'Carbon Scan', 
        description: 'Textura de carbono oscuro con línea de escaneo láser. Eficiente y letal.', 
        type: 'post_background', 
        price: 1000, 
        css_value: 'post-bg-carbon', 
        rarity: 'rare' 
      },
      { 
        name: 'Neon Pulse', 
        description: 'Borde de neón con pulso reactivo. Destaca entre la multitud.', 
        type: 'post_background', 
        price: 2500, 
        css_value: 'post-bg-neon', 
        rarity: 'epic' 
      },
      { 
        name: 'Matrix Rain', 
        description: '¿Ves el código? Lluvia de datos digital optimizada para tu muro.', 
        type: 'post_background', 
        price: 15000, 
        css_value: 'post-bg-matrix', 
        rarity: 'legendary' 
      },
      { 
        name: 'Inferno Core', 
        description: 'Calor extremo. Brasas ascendentes y distorsión térmica.', 
        type: 'post_background', 
        price: 35000, 
        css_value: 'post-bg-inferno', 
        rarity: 'legendary' 
      },
      { 
        name: 'Void Gravity', 
        description: 'Punto de no retorno. Polvo cósmico y distorsión gravitacional pura.', 
        type: 'post_background', 
        price: 65000, 
        css_value: 'post-bg-void', 
        rarity: 'legendary' 
      }
    ];

    for (const item of items) {
      await query(
        `INSERT INTO cosmetics (name, description, type, price, css_value, rarity) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (name) 
         DO UPDATE SET description = EXCLUDED.description, price = EXCLUDED.price, css_value = EXCLUDED.css_value, rarity = EXCLUDED.rarity`,
         [item.name, item.description, item.type, item.price, item.css_value, item.rarity]
      );
      console.log(`Added/Updated: ${item.name}`);
    }

    console.log('Todos los fondos operativos han sido cargados.');
    process.exit(0);
  } catch (error) {
    console.error('Error adding post backgrounds:', error);
    process.exit(1);
  }
}

addPostBackgrounds();

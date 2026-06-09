import { query } from './db.js';

async function seed() {
  const avatars = [
    { 
      name: 'Cyber Pulse', 
      description: 'Rare Avatar. Un brillo rítmico cian que emana de tu esencia digital.', 
      type: 'avatar', 
      price: 400, 
      css_value: 'avatar-pulse',
      rarity: 'rare'
    },
    { 
      name: 'Glitch Master', 
      description: 'Legendary Avatar. Domina las anomalías de la realidad con este efecto de distorsión cromática.', 
      type: 'avatar', 
      price: 1500, 
      css_value: 'avatar-glitch',
      rarity: 'legendary'
    },
    { 
      name: 'Spectral Soul', 
      description: 'Legendary Avatar. Una presencia etérea que trasciende el plano físico del entrenamiento.', 
      type: 'avatar', 
      price: 1800, 
      css_value: 'avatar-spectral',
      rarity: 'legendary'
    },
    { 
      name: 'Infernal Spirit', 
      description: 'Legendary Avatar. El calor de mil dominadas concentrado en un aura de fuego persistente.', 
      type: 'avatar', 
      price: 2000, 
      css_value: 'avatar-infernal',
      rarity: 'legendary'
    }
  ];

  console.log('Seeding Animated Avatars...');

  try {
    for (const avatar of avatars) {
      await query(
        `INSERT INTO cosmetics (name, description, type, price, css_value, rarity) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (name) DO UPDATE SET 
            description = EXCLUDED.description, 
            price = EXCLUDED.price, 
            css_value = EXCLUDED.css_value,
            rarity = EXCLUDED.rarity`,
        [avatar.name, avatar.description, avatar.type, avatar.price, avatar.css_value, avatar.rarity]
      );
      console.log(`- ${avatar.name} seeded`);
    }
    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

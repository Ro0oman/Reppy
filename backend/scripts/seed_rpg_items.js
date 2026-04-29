import { query } from '../db.js';

async function seed() {
  console.log('Seeding RPG items...');

  const items = [
    // HEAD
    { name: 'Casco de Novato', type: 'head', rarity: 'common', stats: { str: 1, vig: 1 }, description: 'Un casco de cuero básico.' },
    { name: 'Gran Yelmo de Hierro', type: 'head', rarity: 'rare', stats: { str: 3, vig: 2 }, description: 'Protección sólida para la cabeza.' },
    { name: 'Corona del Rey Reppy', type: 'head', rarity: 'legendary', stats: { str: 10, cha: 5 }, description: 'Solo para los más dignos.' },
    
    // WEAPON
    { name: 'Espada de Madera', type: 'weapon', rarity: 'common', stats: { dex: 1, str: 1 }, description: 'Ideal para practicar.' },
    { name: 'Hacha de Guerra', type: 'weapon', rarity: 'rare', stats: { str: 5 }, description: 'Pesada y letal.' },
    { name: 'Katana de Electrum', type: 'weapon', rarity: 'special', stats: { dex: 8, str: 2 }, description: 'Corta el aire mismo.' },
    { name: 'Maza Calisténica', type: 'weapon', rarity: 'calisthenic', stats: { str: 15, end: 5 }, description: 'Forjada en el fuego de mil dominadas.' },
    
    // ARMOR
    { name: 'Túnica de Tela', type: 'armor', rarity: 'common', stats: { end: 1 }, description: 'Ligera y cómoda.' },
    { name: 'Cota de Malla', type: 'armor', rarity: 'rare', stats: { vig: 4, str: 1 }, description: 'Equilibrio entre peso y protección.' },
    { name: 'Armadura de Placas Rúnicas', type: 'armor', rarity: 'legendary', stats: { vig: 12, end: 5, fth: 3 }, description: 'Infundida con magia antigua.' },
    
    // BOOTS
    { name: 'Sandalias Gastadas', type: 'boots', rarity: 'common', stats: { dex: 1 }, description: 'Mejor que ir descalzo.' },
    { name: 'Botas de Explorador', type: 'boots', rarity: 'rare', stats: { dex: 3, end: 2 }, description: 'Diseñadas para largas distancias.' },
    { name: 'Botas de Hermes', type: 'boots', rarity: 'legendary', stats: { dex: 10, agi: 5 }, description: 'Sientes que flotas.' }
  ];

  try {
    await query('BEGIN');
    for (const item of items) {
      await query(`
        INSERT INTO items (name, type, rarity, stats, description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO UPDATE SET
          type = EXCLUDED.type,
          rarity = EXCLUDED.rarity,
          stats = EXCLUDED.stats,
          description = EXCLUDED.description
      `, [item.name, item.type, item.rarity, item.stats, item.description]);
    }
    await query('COMMIT');
    console.log('RPG items seeded successfully.');
  } catch (err) {
    await query('ROLLBACK');
    console.error('Seeding failed:', err);
  }
  process.exit(0);
}

seed();

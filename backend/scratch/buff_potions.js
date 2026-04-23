import { query } from '../db.js';

const updates = [
  { name: 'Frasco de Concentración', stats: { duration: 1800, multiplier: 1.5 } },
  { name: 'Vial de Energía Brutal', stats: { duration: 1800, dex_bonus: 30 } },
  { name: 'Elixir de Resistencia', stats: { duration: 3600, multiplier: 2.0 } },
  { name: 'Brebaje de Potencia', stats: { duration: 3600, dex_bonus: 75 } },
  { name: 'Esencia de Guerrero', stats: { duration: 10800, multiplier: 3.0 } },
  { name: 'Sérum de Precisión Químico', stats: { duration: 10800, dex_bonus: 150 } },
  { name: 'Ambrosía del Olimpo', stats: { duration: 21600, multiplier: 5.0 } },
  { name: 'Sangre de Dragón', stats: { duration: 21600, dex_bonus: 300 } },
  { name: 'Protocolo de Gravedad Zero', stats: { duration: 86400, multiplier: 10.0 } },
  { name: 'Maestría del Cuerpo', stats: { duration: 86400, dex_bonus: 1000 } }
];

const runUpdates = async () => {
  for (const u of updates) {
    try {
      await query('UPDATE items SET stats = $1 WHERE name = $2', [JSON.stringify(u.stats), u.name]);
      console.log(`Updated: ${u.name}`);
    } catch (err) {
      console.error(`Failed to update ${u.name}:`, err.message);
    }
  }
  process.exit();
};

runUpdates();

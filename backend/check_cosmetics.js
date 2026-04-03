import { query } from './db.js';

async function checkCosmetics() {
  const res = await query('SELECT id, name, type FROM cosmetics WHERE name IN (\'Marca del Slayer\', \'Easter Celebration\', \'Aura Neón Rosa\')');
  console.log(JSON.stringify(res.rows));
  process.exit(0);
}

checkCosmetics();

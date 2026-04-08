import { query } from '../db.js';

async function updatePrices() {
  try {
    await query('UPDATE cosmetics SET price = 1111 WHERE name = $1::text', ['Carbon Scan']);
    await query('UPDATE cosmetics SET price = 2222 WHERE name = $1::text', ['Neon Pulse']);
    await query('UPDATE cosmetics SET price = 3333 WHERE name = $1::text', ['Matrix Rain']);
    await query('UPDATE cosmetics SET price = 4444 WHERE name = $1::text', ['Inferno Core']);
    await query('UPDATE cosmetics SET price = 5555 WHERE name = $1::text', ['Void Gravity']);
    console.log('Prices updated successfully in PostgreSQL');
    process.exit(0);
  } catch (err) {
    console.error('Error updating prices:', err);
    process.exit(1);
  }
}

updatePrices();

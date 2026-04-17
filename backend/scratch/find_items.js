import { query } from '../db.js';

async function findItems() {
  try {
    const res = await query("SELECT id, name, type, price, rarity FROM cosmetics");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

findItems();

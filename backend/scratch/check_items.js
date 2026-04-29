import { query } from '../db.js';

async function checkItems() {
  try {
    const itemsRes = await query("SELECT id, name, price, price_gems FROM items WHERE (price = 0 OR price IS NULL) AND (price_gems = 0 OR price_gems IS NULL)");
    console.log('Items with 0/NULL prices:');
    console.table(itemsRes.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkItems();

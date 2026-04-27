import { query } from '../db.js';

async function listBundles() {
  const res = await query("SELECT id, name, price, bundle_items FROM items WHERE type = 'bundle'");
  console.log('Bundles:', JSON.stringify(res.rows, null, 2));
  
  if (res.rows.length > 0) {
    const itemIds = res.rows[0].bundle_items.split(',').map(id => id.trim());
    const itemsRes = await query(`SELECT id, name, price FROM items WHERE id = ANY($1::int[])`, [itemIds]);
    console.log('Items in first bundle:', JSON.stringify(itemsRes.rows, null, 2));
  }
  process.exit(0);
}

listBundles();

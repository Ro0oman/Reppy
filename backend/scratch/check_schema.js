import { query } from '../db.js';

async function check() {
  try {
    const res = await query("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'daily_shop_items'");
    console.log('Columns of daily_shop_items:', res.rows);
    
    const itemsRes = await query("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'items'");
    console.log('Columns of items:', itemsRes.rows);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();

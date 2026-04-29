import { query } from '../backend/db.js';

async function checkColumns() {
  try {
    const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'daily_shop_items'");
    console.log('Columns of daily_shop_items:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  }
}

checkColumns();

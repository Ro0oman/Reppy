import { query } from '../db.js';

async function checkItems() {
  try {
    const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'items'");
    console.log('Items Columns:', res.rows.map(r => r.column_name));
    
    const sampleRes = await query("SELECT * FROM items LIMIT 1");
    console.log('Sample Item:', sampleRes.rows[0]);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkItems();

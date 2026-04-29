import { query } from './db.js';

async function test() {
  try {
    const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'items'");
    console.log('Columns:', res.rows.map(r => r.column_name));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();

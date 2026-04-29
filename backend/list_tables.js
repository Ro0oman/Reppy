import { query } from './db.js';

async function test() {
  try {
    const res = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', res.rows.map(r => r.table_name));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();

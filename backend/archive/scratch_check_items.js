import { query } from './db.js';

async function check() {
  try {
    const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tables.rows.map(r => r.table_name));

    const items = await query("SELECT id, name, type FROM items LIMIT 10");
    console.log('Items:', items.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();

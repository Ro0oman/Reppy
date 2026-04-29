import { query } from '../db.js';

async function check() {
  const r = await query("SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'daily_shop_items'");
  console.table(r.rows);
  process.exit(0);
}
check();

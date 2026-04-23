import { query } from '../db.js';

async function run() {
  try {
    const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'boss_fights'");
    console.log(res.rows.map(r => r.column_name));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

run();

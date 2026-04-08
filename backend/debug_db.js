import { query } from './db.js';

async function check() {
  try {
    const res = await query('SELECT * FROM cosmetics WHERE name = $1', ['Neural Grid']);
    console.log('NEURAL GRID:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();

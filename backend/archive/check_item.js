import { query } from './db.js';

async function test() {
  try {
    const res = await query("SELECT * FROM items WHERE id = 704");
    console.log('Item 704:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();

import { query } from './db.js';

async function test() {
  try {
    const res = await query("SELECT id FROM users LIMIT 1");
    console.log('User ID:', res.rows[0]?.id);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();

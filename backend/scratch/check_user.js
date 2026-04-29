import { query } from '../db.js';

async function check() {
  try {
    const res = await query("SELECT id, name, email, reppy_coins, reppy_gems FROM users WHERE email = 'romainot99@gmail.com'");
    console.log('User Data:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();

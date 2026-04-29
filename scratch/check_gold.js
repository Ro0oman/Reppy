import { query } from '../backend/db.js';

async function checkUser() {
  try {
    const res = await query('SELECT name, reppy_coins, reppy_gems FROM users LIMIT 5');
    console.log('Users found:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  }
}

checkUser();

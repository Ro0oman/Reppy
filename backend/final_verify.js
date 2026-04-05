import pool from './db.js';

async function verify() {
  const user = (await pool.query('SELECT boss_chests FROM users WHERE email = $1', ['comomolosiempre@gmail.com'])).rows[0];
  console.log('Final chest count for comomolosiempre:', user.boss_chests);
  process.exit(0);
}

verify();

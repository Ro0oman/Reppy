import { query } from '../db.js';

async function run() {
  try {
    const res = await query('SELECT email, boss_chests, legendary_chests FROM users WHERE email = $1', ['romainot99@gmail.com']);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

run();

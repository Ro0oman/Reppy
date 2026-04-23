import { query } from '../db.js';

async function run() {
  try {
    const res = await query('UPDATE users SET legendary_chests = COALESCE(legendary_chests, 0) + 1 WHERE email = $1', ['romainot99@gmail.com']);
    console.log('Update result:', res.rowCount);
    
    const verify = await query('SELECT email, legendary_chests FROM users WHERE email = $1', ['romainot99@gmail.com']);
    console.log('Current state:', JSON.stringify(verify.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

run();

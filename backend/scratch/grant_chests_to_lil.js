import { query } from '../db.js';

async function run() {
  try {
    const res = await query('SELECT email, name FROM users WHERE name ILIKE $1', ['%LIL ALEXANDRU%']);
    console.log(JSON.stringify(res.rows, null, 2));
    
    if (res.rows.length > 0) {
       const email = res.rows[0].email;
       await query('UPDATE users SET legendary_chests = COALESCE(legendary_chests, 0) + 1, boss_chests = COALESCE(boss_chests, 0) + 1 WHERE email = $1', [email]);
       console.log(`Granted chests to ${email}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

run();

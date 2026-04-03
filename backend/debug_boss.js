import { query } from './db.js';

async function setBossHP() {
  const res = await query('UPDATE boss_fights SET current_hp = 1 WHERE status = \'active\' RETURNING *');
  console.log('Boss HP set to 1:', JSON.stringify(res.rows));
  process.exit(0);
}

setBossHP();

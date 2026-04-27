import pool from './db.js';

async function checkBattlefields() {
  try {
    const res = await pool.query('SELECT DISTINCT battlefield FROM pvp_fights');
    console.log('Distinct Battlefields in DB:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

checkBattlefields();

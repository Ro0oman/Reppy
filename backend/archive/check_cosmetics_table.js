import pool from './db.js';

async function checkCosmetics() {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM cosmetics');
    console.log('Total cosmetics:', res.rows[0].count);
    
    const typesRes = await pool.query('SELECT type, COUNT(*) FROM cosmetics GROUP BY type');
    console.log('Cosmetic types:', typesRes.rows);

    const seasonalRes = await pool.query('SELECT is_seasonal, COUNT(*) FROM cosmetics GROUP BY is_seasonal');
    console.log('Seasonal status:', seasonalRes.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCosmetics();

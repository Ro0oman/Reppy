import pool from './db.js';
async function run() {
  const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'exercises';
  `);
  console.log(res.rows);
  await pool.end();
}
run();

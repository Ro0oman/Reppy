import { query } from '../db.js';

async function checkSchema() {
  try {
    const bossFightsCols = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'boss_fights'
    `);
    console.log('--- boss_fights columns ---');
    bossFightsCols.rows.forEach(col => console.log(`${col.column_name}: ${col.data_type}`));

    const usersCols = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log('\n--- users columns ---');
    usersCols.rows.forEach(col => console.log(`${col.column_name}: ${col.data_type}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();

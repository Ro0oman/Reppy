import { query } from './db.js';

const fix = async () => {
  try {
    console.log('Adding UNIQUE constraint to missions(title_key)...');
    // First check if it exists
    const check = await query(`
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'missions' AND constraint_name = 'missions_title_key_key'
    `);
    
    if (check.rows.length === 0) {
      await query('ALTER TABLE missions ADD CONSTRAINT missions_title_key_key UNIQUE (title_key)');
      console.log('Constraint added.');
    } else {
      console.log('Constraint already exists.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Fix failed:', err);
    process.exit(1);
  }
};

fix();

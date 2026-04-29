import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

dotenv.config({ path: path.resolve('backend/.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') ? { rejectUnauthorized: false } : false
});

async function checkUserItems() {
  try {
    const userId = '113903862264612270084'; // Roman
    const res = await pool.query(`
      SELECT ui.*, i.name 
      FROM user_items ui 
      JOIN items i ON ui.item_id = i.id 
      WHERE ui.user_id = $1
    `, [userId]);
    console.log('User items (Roman):', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkUserItems();

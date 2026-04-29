import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

dotenv.config({ path: path.resolve('backend/.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') ? { rejectUnauthorized: false } : false
});

async function checkSpecificUser() {
  try {
    const res = await pool.query("SELECT id, name, email, reppy_coins, reppy_gems FROM users WHERE email = 'romainot99@gmail.com'");
    console.log('Target user:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkSpecificUser();

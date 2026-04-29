import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

dotenv.config({ path: path.resolve('backend/.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') ? { rejectUnauthorized: false } : false
});

async function healDB() {
  try {
    console.log('Healing NULL coins and gems...');
    await pool.query("UPDATE users SET reppy_coins = 0 WHERE reppy_coins IS NULL");
    await pool.query("UPDATE users SET reppy_gems = 0 WHERE reppy_gems IS NULL");
    
    console.log('Restoring balance to Roman (romainot99@gmail.com)...');
    await pool.query("UPDATE users SET reppy_coins = 5000, reppy_gems = 100 WHERE email = 'romainot99@gmail.com'");
    
    console.log('Heal complete.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

healDB();

import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

dotenv.config({ path: path.resolve('backend/.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') ? { rejectUnauthorized: false } : false
});

async function checkUsersTable() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log('Columns in users:', res.rows.map(r => r.column_name));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkUsersTable();

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') || process.env.DATABASE_URL?.includes('neon') 
    ? { rejectUnauthorized: false } 
    : false
});

console.log('Database Pool initialized with host:', process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : 'None');

export const query = (text, params) => pool.query(text, params);

export default pool;

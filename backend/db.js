import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, types } = pg;

// Force DATE (oid 1082) to be returned as string to avoid UTC shift
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1')
    ? { rejectUnauthorized: false } 
    : false
});

// Safer logging that doesn't crash on malformed URLs
if (process.env.DATABASE_URL) {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    console.log('Database Pool initialized with host:', dbUrl.hostname);
  } catch (e) {
    console.log('Database Pool initialized (URL host could not be parsed)');
  }
} else {
  console.log('Database Pool initialized with no DATABASE_URL');
}

export const query = (text, params) => pool.query(text, params);

export default pool;

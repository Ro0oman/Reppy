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

/**
 * Runs `fn` inside a real DB transaction on a single dedicated client.
 *
 * IMPORTANT: the bare `query()` helper checks out a *different* pooled
 * connection per call, so `query('BEGIN')` + `query('UPDATE')` do NOT share a
 * transaction. Any multi-statement atomic operation MUST use this helper and
 * issue every statement through the `client` it provides.
 *
 * @param {(client: import('pg').PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('[DB] ROLLBACK failed:', rollbackErr);
    }
    throw err;
  } finally {
    client.release();
  }
};

export default pool;

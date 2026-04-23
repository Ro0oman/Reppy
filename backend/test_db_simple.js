import { query } from './db.js';

async function test() {
  try {
    console.log('Testing DB connection...');
    // Create a timeout promise
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout after 5s')), 5000)
    );
    
    const res = await Promise.race([
      query('SELECT NOW()'),
      timeout
    ]);
    
    console.log('DB Result:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('DB Error:', err.message);
    process.exit(1);
  }
}

test();

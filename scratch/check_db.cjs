const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  const res = await client.query('SELECT DISTINCT type FROM items');
  console.log('Types:', res.rows.map(r => r.type));
  
  const res2 = await client.query('SELECT type, is_customizable, COUNT(*) FROM items GROUP BY type, is_customizable');
  console.table(res2.rows);
  
  await client.end();
}
check();

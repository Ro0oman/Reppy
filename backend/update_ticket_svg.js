import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();
  try {
    const res = await client.query("UPDATE items SET svg_key = 'ticket', type = 'bundle' WHERE name = 'Ticket de Ruleta'");
    console.log(`Updated ${res.rowCount} item(s).`);
  } catch (err) {
    console.error('Error updating item:', err);
  } finally {
    await client.end();
  }
}

run();

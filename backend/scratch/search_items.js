import { query } from '../db.js';

async function search() {
  try {
    const res = await query(`
      SELECT id, name, type FROM items 
      WHERE name ILIKE '%Furia%' OR name ILIKE '%Built%'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

search();

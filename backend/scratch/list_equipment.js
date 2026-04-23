import { query } from '../db.js';

async function list() {
  try {
    const res = await query(`
      SELECT id, name, type, rarity FROM items 
      WHERE type IN ('weapon', 'head', 'armor', 'boots') 
      ORDER BY rarity, type
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

list();

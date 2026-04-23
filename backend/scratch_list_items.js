import { query } from './db.js';

async function listItems() {
  try {
    const res = await query("SELECT id, name, type, is_seasonal, is_customizable FROM items WHERE type IN ('head', 'weapon', 'armor', 'boots') ORDER BY id ASC");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

listItems();

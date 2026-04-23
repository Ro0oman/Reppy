import { query } from '../db.js';

const run = async () => {
  const res = await query("SELECT id, name, stats FROM items WHERE type = 'consumable'");
  const toDelete = res.rows.filter(item => item.stats && item.stats.dex_bonus);
  
  if (toDelete.length > 0) {
    const ids = toDelete.map(i => i.id);
    // Use format that works for pg
    await query(`DELETE FROM items WHERE id IN (${ids.join(',')})`);
    console.log('Deleted DEX potions:', toDelete.map(i => i.name));
  } else {
    console.log('No DEX potions found');
  }
  process.exit();
};

run();

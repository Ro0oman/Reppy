import { query } from './db.js';

const clean = async () => {
  try {
    console.log('Cleaning debug items...');
    const res = await query("DELETE FROM items WHERE name LIKE '%DEBU%'");
    console.log(`Deleted ${res.rowCount} debug items.`);
    process.exit(0);
  } catch (err) {
    console.error('Clean failed:', err);
    process.exit(1);
  }
};

clean();

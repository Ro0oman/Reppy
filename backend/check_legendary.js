import { query } from './db.js';

const check = async () => {
  try {
    const res = await query("SELECT name, price FROM items WHERE LOWER(rarity) = 'legendary'");
    console.log(`Found ${res.rows.length} legendary items.`);
    res.rows.forEach(r => console.log(`- ${r.name}: ${r.price} RC`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();

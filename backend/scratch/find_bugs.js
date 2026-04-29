import { query } from '../db.js';

async function findBugs() {
  try {
    const res = await query(`
      SELECT d.id, d.user_id, d.item_id, i.name, d.discounted_price, d.discounted_gems, d.reward_type
      FROM daily_shop_items d
      LEFT JOIN items i ON d.item_id = i.id
      WHERE (d.discounted_price = 0 OR d.discounted_price IS NULL) 
        AND (d.discounted_gems = 0 OR d.discounted_gems IS NULL)
        AND d.reward_type IS NULL
    `);
    console.log('Daily items with 0 price (Bugged):');
    console.table(res.rows);

    const timeRes = await query("SELECT rotated_at FROM daily_shop_items LIMIT 1");
    console.log('Rotated At:', timeRes.rows[0]?.rotated_at);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findBugs();

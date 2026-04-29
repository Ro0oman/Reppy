import { query } from '../db.js';

async function checkDaily() {
  try {
    const res = await query(`
      SELECT d.id, d.user_id, d.item_id, i.name, d.discounted_price, d.discounted_gems, d.reward_type, d.reward_amount, d.rotated_at
      FROM daily_shop_items d
      LEFT JOIN items i ON d.item_id = i.id
    `);
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDaily();

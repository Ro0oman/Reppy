const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.pjxaqeeealtcbfaxcuuk:reppypasswordreppy@aws-1-eu-west-1.pooler.supabase.com:6543/postgres' });

async function rotateDailyShop(userId) {
  // Logic from backend/shop.js
  const itemsRes = await client.query("SELECT id FROM items WHERE is_customizable = false ORDER BY RANDOM() LIMIT 6");
  const itemIds = itemsRes.rows.map(r => r.id);
  
  await client.query("DELETE FROM daily_shop_items WHERE user_id = $1", [userId]);
  
  for (const itemId of itemIds) {
    await client.query(
      "INSERT INTO daily_shop_items (user_id, item_id, rotated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)",
      [userId, itemId]
    );
  }
}

async function forceRefresh() {
  try {
    await client.connect();
    const userRes = await client.query("SELECT id FROM users WHERE email = 'romainot99@gmail.com'");
    if (userRes.rows.length === 0) {
      console.error('User not found');
      return;
    }
    const userId = userRes.rows[0].id;
    await rotateDailyShop(userId);
    console.log(`Successfully refreshed daily shop for user ${userId} (romainot99@gmail.com)`);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

forceRefresh();

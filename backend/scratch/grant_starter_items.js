import { query } from '../db.js';

async function grantItems() {
  const email = 'romainot99@gmail.com';
  const userRes = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (userRes.rows.length === 0) return;
  const userId = userRes.rows[0].id;

  // 1. Remove the items I granted by mistake (any high rarity ones)
  // Actually, I'll just clear the user_items that are head/weapon/armor/boots/consumable and re-grant common ones
  await query(`
    DELETE FROM user_items 
    WHERE user_id = $1 
    AND item_id IN (SELECT id FROM items WHERE rarity IN ('legendary', 'calistenico', 'especial'))
  `, [userId]);

  const types = ['head', 'weapon', 'armor', 'boots', 'consumable'];
  for (const type of types) {
    const itemRes = await query(`
      SELECT id FROM items 
      WHERE type = $1 AND rarity = 'common' 
      ORDER BY RANDOM() LIMIT 2
    `, [type]);
    for (const item of itemRes.rows) {
      await query(
        'INSERT INTO user_items (user_id, item_id, quantity) VALUES ($1, $2, 1) ON CONFLICT DO NOTHING',
        [userId, item.id]
      );
    }
  }
  console.log('Granted COMMON starter items to', email);
  process.exit(0);
}

grantItems();

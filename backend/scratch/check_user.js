import { query } from '../db.js';

async function check() {
  const email = 'romainot99@gmail.com';
  const userRes = await query('SELECT id, name FROM users WHERE email = $1', [email]);
  if (userRes.rows.length === 0) {
    console.log('User not found');
    process.exit(0);
  }
  const user = userRes.rows[0];
  console.log(`User: ${user.name} (${user.id})`);

  const invRes = await query(`
    SELECT ui.*, i.name as item_name, i.type 
    FROM user_items ui 
    JOIN items i ON ui.item_id = i.id 
    WHERE ui.user_id = $1
  `, [user.id]);
  
  console.log('Inventory Items:', invRes.rows.length);
  console.log(JSON.stringify(invRes.rows, null, 2));

  const legacyInvRes = await query(`
    SELECT ui.*, c.name as cosmetic_name 
    FROM user_inventory ui 
    JOIN cosmetics c ON ui.cosmetic_id = c.id 
    WHERE ui.user_id = $1
  `, [user.id]);
  
  console.log('Legacy Inventory (cosmetics):', legacyInvRes.rows.length);
  console.log(JSON.stringify(legacyInvRes.rows, null, 2));
  
  process.exit(0);
}

check();

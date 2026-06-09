import { query } from './db.js';

async function run() {
  try {
    const ng = (await query('SELECT id, price FROM cosmetics WHERE name = $1', ['Neural Grid'])).rows[0];
    if (!ng) {
      console.log('Neural Grid not found');
      return;
    }
    
    console.log('Found Neural Grid:', ng);
    
    // 1. Refund coins to everyone who bought it
    const refundResult = await query(`
      UPDATE users 
      SET reppy_coins = reppy_coins + $1 
      WHERE id IN (SELECT user_id FROM user_inventory WHERE cosmetic_id = $2)`,
      [ng.price, ng.id]
    );
    console.log(`Refunded ${refundResult.rowCount} users.`);
    
    // 2. Add to inventory for everyone who doesn't have it
    const grantResult = await query(`
      INSERT INTO user_inventory (user_id, cosmetic_id)
      SELECT id, $1 FROM users
      ON CONFLICT (user_id, cosmetic_id) DO NOTHING`,
      [ng.id]
    );
    console.log(`Granted item to ${grantResult.rowCount} new users.`);
    
    // 3. Equip for everyone
    const equipResult = await query('UPDATE users SET equipped_background_id = $1', [ng.id]);
    console.log(`Equipped item for ${equipResult.rowCount} users.`);
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();

const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('--- STARTING USER INVENTORY SYNCHRONIZATION ---');

    // 1. Migrate from user_cosmeticos to user_items
    console.log('Migrating from legacy user_cosmeticos table...');
    const res1 = await client.query(`
      INSERT INTO user_items (user_id, item_id, is_new, acquired_at, quantity)
      SELECT uc.user_id, uc.cosmetico_id, uc.is_new, uc.acquired_at, 1
      FROM user_cosmeticos uc
      JOIN items i ON uc.cosmetico_id = i.id
      ON CONFLICT (user_id, item_id) DO NOTHING
    `);
    console.log(`✅ Synced ${res1.rowCount} valid legacy records from user_cosmeticos.`);

    // 2. Migrate from user_inventory to user_items
    console.log('Migrating from legacy user_inventory table...');
    const res2 = await client.query(`
      INSERT INTO user_items (user_id, item_id, is_new, acquired_at, quantity)
      SELECT ui.user_id, ui.cosmetic_id, ui.is_new, ui.acquired_at, ui.quantity
      FROM user_inventory ui
      JOIN items i ON ui.cosmetic_id = i.id
      ON CONFLICT (user_id, item_id) 
      DO UPDATE SET quantity = GREATEST(user_items.quantity, EXCLUDED.quantity)
    `);
    console.log(`✅ Synced ${res2.rowCount} valid legacy records from user_inventory.`);

    await client.query('COMMIT');
    console.log('--- SYNCHRONIZATION COMPLETE ---');
    console.log('All users have successfully retained their previous items in the new unified items system.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed! Rolled back changes.', error);
  } finally {
    await client.end();
  }
}

migrate();

import { query } from '../db.js';

async function migrate() {
  console.log('Migrating existing cosmetics to items table...');

  try {
    await query('BEGIN');

    // 1. Get all current cosmetics
    const cosmetics = await query('SELECT * FROM cosmetics');
    console.log(`Found ${cosmetics.rows.length} cosmetics.`);

    for (const cos of cosmetics.rows) {
      console.log(`Migrating: ${cos.name} (${cos.type})`);
      
      // Map rarity based on name or price if not present
      let rarity = 'common';
      if (cos.price >= 5000) rarity = 'legendary';
      else if (cos.price >= 2000) rarity = 'special';
      else if (cos.price >= 500) rarity = 'rare';

      // Insert into items table
      // Note: we use id from cosmetics if possible to maintain relations, 
      // but SERIAL might conflict. Better to let it generate new and update users later.
      // Actually, since we want to keep relations, we'll try to insert with same ID.
      await query(`
        INSERT INTO items (id, name, description, type, rarity, css_value, stats)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          type = EXCLUDED.type,
          rarity = EXCLUDED.rarity,
          css_value = EXCLUDED.css_value,
          stats = EXCLUDED.stats
      `, [cos.id, cos.name, cos.description, cos.type, rarity, cos.css_value, {}]);
    }

    // 2. Migrate user inventory
    const inventory = await query('SELECT * FROM user_inventory');
    console.log(`Found ${inventory.rows.length} inventory entries.`);

    for (const inv of inventory.rows) {
      await query(`
        INSERT INTO user_items (user_id, item_id, is_new, quantity, acquired_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, item_id) DO NOTHING
      `, [inv.user_id, inv.cosmetic_id, inv.is_new, inv.quantity, inv.acquired_at]);
    }

    // 3. Update sequences
    await query("SELECT setval('items_id_seq', (SELECT MAX(id) FROM items))");
    await query("SELECT setval('user_items_id_seq', (SELECT MAX(id) FROM user_items))");

    await query('COMMIT');
    console.log('Migration of cosmetics to items completed.');
  } catch (err) {
    await query('ROLLBACK');
    console.error('Migration failed:', err);
  }
  process.exit(0);
}

migrate();

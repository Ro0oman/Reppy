import { query } from './db.js';

async function migrate() {
  try {
    console.log('🚀 Starting migration from cosmetics to items...');
    
    // 1. Get all cosmetics
    const cosmetics = await query('SELECT * FROM cosmetics');
    console.log(`📊 Found ${cosmetics.rows.length} cosmetics to migrate.`);
    
    // 2. Insert into items
    for (const c of cosmetics.rows) {
      await query(`
        INSERT INTO items (id, name, description, type, price, css_value, is_seasonal, rarity, bundle_items)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET 
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          type = EXCLUDED.type,
          price = EXCLUDED.price,
          css_value = EXCLUDED.css_value,
          is_seasonal = EXCLUDED.is_seasonal,
          rarity = EXCLUDED.rarity,
          bundle_items = EXCLUDED.bundle_items
      `, [c.id, c.name, c.description, c.type, c.price, c.css_value, c.is_seasonal || false, c.rarity || 'common', c.bundle_items]);
      console.log(`✅ Migrated item: ${c.name} (ID: ${c.id})`);
    }
    
    console.log('✨ Migration complete!');
  } catch (e) {
    console.error('❌ Migration failed:', e);
  } finally {
    process.exit();
  }
}

migrate();

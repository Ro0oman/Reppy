import { query } from '../db.js';

async function migrate() {
  try {
    console.log('Starting migration for damage consumables...');

    // 1. Update users table
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS damage_multiplier DECIMAL DEFAULT 1.0,
      ADD COLUMN IF NOT EXISTS damage_multiplier_expiry TIMESTAMP WITH TIME ZONE;
    `);
    console.log('Updated users table.');

    // 2. Update user_inventory table
    await query(`
      ALTER TABLE user_inventory 
      ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
    `);
    console.log('Updated user_inventory table.');

    // 3. Insert items into cosmetics table
    // Common: 2000, Rare: 3000, Legendary: 4000
    const items = [
      {
        name: 'Poción de Fuerza Común',
        description: 'Aumenta tu daño contra bosses un x1.5 durante 24 horas.',
        type: 'consumable',
        price: 2000,
        css_value: '1.5',
        rarity: 'common'
      },
      {
        name: 'Poción de Fuerza Rara',
        description: 'Aumenta tu daño contra bosses un x2.0 durante 24 horas.',
        type: 'consumable',
        price: 3000,
        css_value: '2.0',
        rarity: 'rare'
      },
      {
        name: 'Poción de Fuerza Legendaria',
        description: 'Aumenta tu daño contra bosses un x3.0 durante 24 horas.',
        type: 'consumable',
        price: 4000,
        css_value: '3.0',
        rarity: 'legendary'
      }
    ];

    for (const item of items) {
      await query(`
        INSERT INTO cosmetics (name, description, type, price, css_value, rarity)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          css_value = EXCLUDED.css_value,
          rarity = EXCLUDED.rarity;
      `, [item.name, item.description, item.type, item.price, item.css_value, item.rarity]);
      console.log(`Inserted/Updated item: ${item.name}`);
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();

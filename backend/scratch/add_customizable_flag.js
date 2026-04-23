import { query } from '../db.js';

async function migrate() {
  try {
    console.log('Adding is_customizable column to items...');
    await query("ALTER TABLE items ADD COLUMN IF NOT EXISTS is_customizable BOOLEAN DEFAULT FALSE");
    
    console.log('Updating existing cosmetic items...');
    await query(`
      UPDATE items 
      SET is_customizable = TRUE 
      WHERE type IN ('title', 'border', 'background', 'post_background', 'avatar')
    `);
    
    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}
migrate();

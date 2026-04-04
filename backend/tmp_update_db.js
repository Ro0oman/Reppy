import { query } from './db.js';

async function update() {
  try {
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_avatar_id INTEGER');
    console.log('Column equipped_avatar_id added successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error adding column:', err);
    process.exit(1);
  }
}

update();

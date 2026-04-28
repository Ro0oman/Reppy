import { query } from './db.js';

async function applyIndices() {
  console.log('--- APPLYING PERFORMANCE INDICES ---');
  
  const indices = [
    { name: 'idx_reps_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_reps_user_id ON reps(user_id);' },
    { name: 'idx_user_inventory_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);' },
    { name: 'idx_user_items_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_user_items_user_id ON user_items(user_id);' },
    { name: 'idx_friendships_users', sql: 'CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(user_id_1, user_id_2);' },
    { name: 'idx_notifications_user_id_created', sql: 'CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON notifications(user_id, created_at DESC);' }
  ];

  for (const idx of indices) {
    try {
      console.log(`Applying ${idx.name}...`);
      await query(idx.sql);
      console.log(`✅ ${idx.name} applied or already exists.`);
    } catch (err) {
      console.error(`❌ Error applying ${idx.name}:`, err.message);
    }
  }

  console.log('--- DONE ---');
  process.exit(0);
}

applyIndices();

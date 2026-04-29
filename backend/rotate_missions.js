import { query } from './db.js';

const rotate = async () => {
  try {
    console.log('Rotating Missions...');
    
    await query('BEGIN');
    
    // 1. Deactivate all
    await query('UPDATE missions SET is_active = false');
    
    // 2. Activate 2 random daily missions
    await query(`
      UPDATE missions SET is_active = true 
      WHERE id IN (
        SELECT id FROM missions 
        WHERE is_daily = true 
        ORDER BY RANDOM() 
        LIMIT 2
      )
    `);
    
    // 3. Activate 1 random long-term (special) mission
    await query(`
      UPDATE missions SET is_active = true 
      WHERE id IN (
        SELECT id FROM missions 
        WHERE is_daily = false 
        ORDER BY RANDOM() 
        LIMIT 1
      )
    `);
    
    await query('COMMIT');
    
    console.log('Rotation successful. 3 missions active (2 Daily, 1 Special).');
    process.exit(0);
  } catch (err) {
    await query('ROLLBACK');
    console.error('Rotation failed:', err);
    process.exit(1);
  }
};

rotate();

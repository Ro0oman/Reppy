import { query } from './db.js';

/**
 * Script to migrate chests that were mistakenly granted as boss_chests
 * because the columns weren't separated yet.
 */
const migrate = async () => {
  try {
    console.log('--- STARTING CHEST MIGRATION ---');
    const usersRes = await query('SELECT id, name, boss_chests, level_chests, current_level FROM users');
    
    for (const user of usersRes.rows) {
      const earnedByLevel = user.current_level - 1;
      
      // If user has level chests earned but they are sitting in boss_chests
      if (earnedByLevel > 0 && user.level_chests === 0 && user.boss_chests > 0) {
        const toMove = Math.min(user.boss_chests, earnedByLevel);
        
        console.log(`Migrating ${toMove} chests for ${user.name} (ID: ${user.id})`);
        
        await query(`
          UPDATE users 
          SET boss_chests = boss_chests - $1,
              level_chests = level_chests + $1
          WHERE id = $2
        `, [toMove, user.id]);
      }
    }
    
    console.log('--- MIGRATION COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();

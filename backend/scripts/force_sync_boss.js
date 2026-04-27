import { query } from '../db.js';
import { syncBossHealth } from '../utils/boss.js';

async function run() {
  try {
    console.log('--- FORCING BOSS HP RECALCULATION ---');
    const result = await syncBossHealth();
    console.log('Result:', result);
    
    // Optional: If you want to force proportionality for the active boss
    const activeBossRes = await query("SELECT id, current_hp, total_hp, is_legendary, is_epic FROM boss_fights WHERE status = 'active' LIMIT 1");
    if (activeBossRes.rows.length > 0) {
      const boss = activeBossRes.rows[0];
      console.log(`Current active boss: ${boss.total_hp} HP total, ${boss.current_hp} HP current.`);
      
      let scaledHp = result.newTotalHp;
      if (boss.is_legendary) scaledHp *= 8;
      else if (boss.is_epic) scaledHp *= 3;

      console.log(`Resetting active boss to ${scaledHp} HP (Full Health)...`);
      await query("UPDATE boss_fights SET total_hp = $1, current_hp = $1 WHERE id = $2", [scaledHp, boss.id]);
      console.log('Active boss reset to full health with new scale.');
    }
    
    console.log('------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();

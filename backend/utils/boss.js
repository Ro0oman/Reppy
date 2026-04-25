import { query } from '../db.js';

/**
 * Recalculates the total HP for all bosses based on the number of active users in the last 7 days.
 * Formula: ActiveUsers * 350 (Min: 350)
 */
export async function syncBossHealth() {
  try {
    console.log('[BOSS_SYNC] Starting health recalculation...');
    
    // 1. Get count of active users (users who submitted reps in the last 7 days)
    const activeUsersRes = await query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM reps 
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    const activeUsers = parseInt(activeUsersRes.rows[0]?.count) || 0;
    const newTotalHp = 50000;
    
    console.log(`[BOSS_SYNC] Manual override: ${newTotalHp} HP.`);

    // 2. Update ALL bosses total_hp
    // We also update current_hp if the boss is currently at full health (meaning it hasn't been attacked yet)
    await query(`
      UPDATE boss_fights 
      SET total_hp = $1,
          current_hp = CASE 
            WHEN current_hp >= total_hp THEN $1 
            ELSE current_hp 
          END
    `, [newTotalHp]);

    console.log('[BOSS_SYNC] Successfully updated boss health templates.');
    return { activeUsers, newTotalHp };
  } catch (error) {
    console.error('[BOSS_SYNC] Error sincronizando vida del boss:', error);
    throw error;
  }
}

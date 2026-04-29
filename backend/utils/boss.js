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

    // 2. Update bosses total_hp and current_hp with rarity-based scaling
    // We apply scaling if the boss hasn't been defeated yet
    await query(`
      UPDATE boss_fights 
      SET total_hp = CASE 
            WHEN is_legendary THEN $1 * 8 
            WHEN is_epic THEN $1 * 3
            ELSE $1 
          END,
          current_hp = CASE 
            WHEN current_hp >= total_hp THEN (
              CASE 
                WHEN is_legendary THEN $1 * 8 
                WHEN is_epic THEN $1 * 3
                ELSE $1 
              END
            )
            ELSE current_hp 
          END
      WHERE status != 'defeated'
    `, [newTotalHp]);

    console.log('[BOSS_SYNC] Successfully updated boss health templates.');
    return { activeUsers, newTotalHp };
  } catch (error) {
    console.error('[BOSS_SYNC] Error sincronizando vida del boss:', error);
    throw error;
  }
}

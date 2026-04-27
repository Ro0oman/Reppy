import { query } from '../db.js';
import { createNotification } from './notifications.js';

/**
 * Checks for any defeated bosses the user participated in but hasn't claimed a chest for.
 * Grants the chests automatically to the user's account.
 * Returns the number of chests granted.
 */
export async function autoGrantPendingChests(userId) {
  try {
    const pendingChestsRes = await query(
      `SELECT b.id FROM boss_fights b
       JOIN event_participants p ON p.boss_fight_id = b.id
       WHERE b.status = 'defeated' 
       AND p.user_id = $1 
       AND p.damage_dealt > 0 
       AND p.chests_claimed = 0`,
      [userId]
    );

    if (pendingChestsRes.rows.length > 0) {
      const pendingBossIds = pendingChestsRes.rows.map(b => b.id);
      
      // Separate normal, epic and legendary chests
      const typesRes = await query(
        `SELECT is_legendary, is_epic, COUNT(*) as count 
         FROM boss_fights 
         WHERE id = ANY($1) 
         GROUP BY is_legendary, is_epic`,
        [pendingBossIds]
      );
      
      let normalCount = 0;
      let epicCount = 0;
      let legendaryCount = 0;
      
      typesRes.rows.forEach(row => {
        if (row.is_legendary) legendaryCount = parseInt(row.count);
        else if (row.is_epic) epicCount = parseInt(row.count);
        else normalCount = parseInt(row.count);
      });

      await query('BEGIN');
      try {
        // Increase user's chest count correctly
        if (normalCount > 0) {
          await query('UPDATE users SET boss_chests = boss_chests + $1 WHERE id = $2', [normalCount, userId]);
        }
        if (epicCount > 0) {
          await query('UPDATE users SET epic_chests = epic_chests + $1 WHERE id = $2', [epicCount, userId]);
        }
        if (legendaryCount > 0) {
          await query('UPDATE users SET legendary_chests = legendary_chests + $1 WHERE id = $2', [legendaryCount, userId]);
        }
        
        // Mark these bosses as claimed for this user
        await query(
          `UPDATE event_participants SET chests_claimed = 1 
           WHERE user_id = $1 AND boss_fight_id = ANY($2)`,
          [userId, pendingBossIds]
        );
        
        await query('COMMIT');

        const pendingCount = normalCount + epicCount + legendaryCount;

        // Trigger Notification
        await createNotification(
          userId,
          'NEW_CHEST',
          null,
          `¡Has recibido ${pendingCount} cofre(s) de jefe!`,
          'BOSS_CHEST'
        );

        return pendingCount;
      } catch (err) {
        await query('ROLLBACK');
        console.error('Error in autoGrantPendingChests transaction:', err);
        throw err;
      }
    }
    return 0;
  } catch (error) {
    console.error('Error auto-granting chests for user:', userId, error);
    return 0;
  }
}

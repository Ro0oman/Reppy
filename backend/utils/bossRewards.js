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
      const pendingCount = pendingChestsRes.rows.length;
      await query('BEGIN');
      try {
        // Increase user's chest count
        await query(
          'UPDATE users SET boss_chests = boss_chests + $1 WHERE id = $2', 
          [pendingCount, userId]
        );
        
        // Mark these bosses as claimed for this user
        await query(
          `UPDATE event_participants SET chests_claimed = 1 
           WHERE user_id = $1 AND boss_fight_id IN (
             SELECT id FROM boss_fights WHERE status = 'defeated'
           ) AND damage_dealt > 0 AND chests_claimed = 0`,
          [userId]
        );
        
        await query('COMMIT');

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

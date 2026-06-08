import { query, withTransaction } from '../db.js';
import { createNotification } from './notifications.js';

/**
 * Checks for any defeated bosses the user participated in but hasn't claimed a chest for.
 * Grants the chests automatically to the user's account.
 * Returns the number of chests granted.
 */
export async function autoGrantPendingChests(userId) {
  try {
    const pendingCount = await withTransaction(async (client) => {
      // ATOMIC GATE: claim the pending bosses FIRST with a guarded UPDATE that
      // returns exactly the rows this call won. Concurrent invocations (e.g. two
      // /active hits, or this racing grantAllPendingChestsBeforeReset) can never
      // both claim the same participation, so chests are granted exactly once.
      const claimed = await client.query(
        `UPDATE event_participants p
         SET chests_claimed = 1
         FROM boss_fights b
         WHERE p.boss_fight_id = b.id
           AND b.status = 'defeated'
           AND p.user_id = $1
           AND p.damage_dealt > 0
           AND p.chests_claimed = 0
         RETURNING b.is_legendary, b.is_epic`,
        [userId]
      );

      if (claimed.rowCount === 0) return 0;

      let normalCount = 0;
      let epicCount = 0;
      let legendaryCount = 0;
      for (const row of claimed.rows) {
        if (row.is_legendary) legendaryCount++;
        else if (row.is_epic) epicCount++;
        else normalCount++;
      }

      if (normalCount > 0) {
        await client.query('UPDATE users SET boss_chests = boss_chests + $1 WHERE id = $2', [normalCount, userId]);
      }
      if (epicCount > 0) {
        await client.query('UPDATE users SET epic_chests = epic_chests + $1 WHERE id = $2', [epicCount, userId]);
      }
      if (legendaryCount > 0) {
        await client.query('UPDATE users SET legendary_chests = legendary_chests + $1 WHERE id = $2', [legendaryCount, userId]);
      }

      return normalCount + epicCount + legendaryCount;
    });

    if (pendingCount > 0) {
      // Notify outside the transaction (best-effort).
      await createNotification(
        userId,
        'NEW_CHEST',
        null,
        `¡Has recibido ${pendingCount} cofre(s) de jefe!`,
        'BOSS_CHEST'
      );
    }

    return pendingCount;
  } catch (error) {
    console.error('Error auto-granting chests for user:', userId, error);
    return 0;
  }
}

/**
 * Called right before the boss loop resets (all bosses defeated).
 * Grants pending chests to EVERY user who participated in any defeated boss
 * but has not yet received their chest. Must run BEFORE resetting event_participants.
 */
export async function grantAllPendingChestsBeforeReset() {
  try {
    console.log('[BOSS_RESET] Granting pending chests to all participants before loop reset...');

    // Find all users with unclaimed chests on defeated bosses
    const usersRes = await query(`
      SELECT DISTINCT p.user_id
      FROM event_participants p
      JOIN boss_fights b ON b.id = p.boss_fight_id
      WHERE b.status = 'defeated'
        AND p.damage_dealt > 0
        AND p.chests_claimed = 0
    `);

    let totalGranted = 0;
    for (const { user_id } of usersRes.rows) {
      const granted = await autoGrantPendingChests(user_id);
      if (granted > 0) {
        console.log(`[BOSS_RESET] Granted ${granted} chest(s) to user ${user_id}`);
        totalGranted += granted;
      }
    }

    console.log(`[BOSS_RESET] Done. Total chests granted: ${totalGranted} to ${usersRes.rows.length} users.`);
    return totalGranted;
  } catch (error) {
    console.error('[BOSS_RESET] Error granting chests before reset:', error);
    return 0;
  }
}

/**
 * Grants a special bonus to the user who delivered the "Last Hit" (Golpe de Gracia) to a boss.
 * Bonus can be a random amount of coins or a random unowned item.
 */
export async function grantLastHitBonus(userId, bossId, client = null) {
  const q = client ? client.query.bind(client) : query;
  
  try {
    const bossRes = await q('SELECT name FROM boss_fights WHERE id = $1', [bossId]);
    const bossName = bossRes.rows[0]?.name || 'Boss';

    const rand = Math.random();
    let reward = null;

    if (rand < 0.5) {
      // 50% chance: Coin bonus
      const coinAmount = Math.floor(Math.random() * 1501) + 1000; // 1000 to 2500
      await q('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [coinAmount, userId]);
      reward = { type: 'coins', amount: coinAmount, message: `¡GOLPE DE GRACIA! Has recibido ${coinAmount} Reppy Coins.` };
    } else {
      // 50% chance: Item bonus
      const itemRes = await q(`
        SELECT * FROM items 
        WHERE rarity IN ('rare', 'especial') 
        AND type != 'bundle'
        AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = items.id)
        ORDER BY RANDOM() LIMIT 1
      `, [userId]);

      if (itemRes.rows.length > 0) {
        const item = itemRes.rows[0];
        await q(`INSERT INTO user_items (user_id, item_id, is_new) VALUES ($1, $2, TRUE) ON CONFLICT DO NOTHING`, [userId, item.id]);
        reward = { type: 'item', data: item, message: `¡GOLPE DE GRACIA! Has obtenido un objeto raro: ${item.name}` };
      } else {
        // Fallback coins if all items are owned
        const coinAmount = 2000;
        await q('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [coinAmount, userId]);
        reward = { type: 'coins', amount: coinAmount, message: `¡GOLPE DE GRACIA! (Colección completa) Has recibido ${coinAmount} Reppy Coins.` };
      }
    }

    // Update boss record with last hit info
    await q('UPDATE boss_fights SET last_hit_user_id = $1 WHERE id = $2', [userId, bossId]);

    // Create Notification
    await createNotification(
      userId,
      'BOSS_DEFEATED',
      null,
      `¡Has asestado el golpe de gracia a ${bossName}! Recompensa otorgada.`,
      'BOSS_REWARD'
    );

    return reward;
  } catch (error) {
    console.error('Error granting last hit bonus:', error);
    return null;
  }
}

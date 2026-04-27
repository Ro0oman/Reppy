import pool, { query } from '../db.js';
import { getExerciseRewards } from '../utils/rewards.js';
import { recalculateUserStats } from '../utils/stats.js';

/**
 * Reverts boss damage for a specific rep record.
 */
async function revertBossDamage(client, rep, userId) {
  if (rep.boss_damage_dealt > 0) {
    const bossRes = await client.query(
      `SELECT id, current_hp, total_hp, status FROM boss_fights 
       WHERE id = $1 OR (status != 'defeated' AND $1 IS NULL)
       ORDER BY CASE WHEN id = $1 THEN 0 ELSE 1 END, order_index ASC LIMIT 1`,
      [rep.boss_fight_id]
    );

    if (bossRes.rows.length > 0) {
      const boss = bossRes.rows[0];
      
      console.log(`Reverting ${rep.boss_damage_dealt} damage to boss ${boss.id}...`);
      
      // Atomic restoration
      await client.query(
          `UPDATE boss_fights 
           SET current_hp = LEAST(total_hp, current_hp + $1),
               status = CASE WHEN current_hp + $1 > 0 AND status = 'defeated' THEN 'active' ELSE status END
           WHERE id = $2`, 
          [rep.boss_damage_dealt, boss.id]
      );

      await client.query(
        `UPDATE event_participants 
         SET damage_dealt = GREATEST(0, damage_dealt - $1) 
         WHERE boss_fight_id = $2 AND user_id = $3`,
        [rep.boss_damage_dealt, boss.id, userId]
      );
    }
  }
}

async function cleanup() {
  console.log('--- Cleaning up TEST users and reverting damage ---');
  
  const client = await pool.connect();
  try {
    // 1. Find all test users
    const usersRes = await client.query("SELECT id, name FROM users WHERE name LIKE 'REFUND_TEST_%' OR name LIKE 'COMBAT_TEST_%' OR name LIKE 'REWARD_TEST_%'");
    const testUsers = usersRes.rows;

    if (testUsers.length === 0) {
      console.log('No test users found.');
      return;
    }

    console.log(`Found ${testUsers.length} test users.`);

    for (const user of testUsers) {
      console.log(`Cleaning up user: ${user.name} (${user.id})`);
      
      await client.query('BEGIN');
      
      // 2. Get all reps for this user
      const repsRes = await client.query('SELECT * FROM reps WHERE user_id = $1', [user.id]);
      const reps = repsRes.rows;
      
      console.log(`  - Reverting ${reps.length} rep records...`);
      
      for (const rep of reps) {
        await revertBossDamage(client, rep, user.id);
      }
      
      // 3. Delete everything related to the user
      console.log('  - Deleting user data (cascading)...');
      await client.query('DELETE FROM users WHERE id = $1', [user.id]);
      
      await client.query('COMMIT');
      console.log(`Done with ${user.name}.`);
    }

    console.log('Cleanup finished successfully.');
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Cleanup failed:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

cleanup();

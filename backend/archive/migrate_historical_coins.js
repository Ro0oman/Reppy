import { query } from './db.js';
import { getExerciseRewards } from './utils/rewards.js';

/**
 * Migration Script: Synchronize historical coins and RPG stats for all users.
 * This script recalculates rewards from the entire repetition history and 
 * ensures users have at least that amount (minus spent coins).
 */
async function migrate() {
  console.log('--- STARTING HISTORICAL COINS MIGRATION ---');
  
  try {
    // 1. Get all users
    const usersRes = await query('SELECT id, name, reppy_coins FROM users');
    const users = usersRes.rows;
    console.log(`Found ${users.length} users to process.`);

    let totalAdjusted = 0;
    let totalCoinsGranted = 0;

    for (const user of users) {
      console.log(`Processing user: ${user.name} (${user.id})...`);

      // 2. Calculate total earned from history
      const repsRes = await query(
        'SELECT count, exercise_type FROM reps WHERE user_id = $1',
        [user.id]
      );
      
      let totalRepsCount = 0;
      let totalEarned = 0;
      let stats = {
        str_xp: 0,
        pwr_xp: 0,
        end_xp: 0,
        agi_xp: 0
      };

      for (const rep of repsRes.rows) {
        totalRepsCount += rep.count;
        const rewards = getExerciseRewards(rep.exercise_type, rep.count);
        totalEarned += rewards.coins;
        
        if (rewards.statToUpgrade) stats[rewards.statToUpgrade] += rep.count;
        if (rewards.extraStatToUpgrade) stats[rewards.extraStatToUpgrade] += rep.count;
      }

      // 3. Calculate total spent from inventory
      const spentRes = await query(
        `SELECT SUM(c.price) as total_spent 
         FROM user_inventory ui
         JOIN cosmetics c ON ui.cosmetic_id = c.id
         WHERE ui.user_id = $1`,
        [user.id]
      );
      const totalSpent = parseInt(spentRes.rows[0].total_spent) || 0;

      // 4. Determine expected minimum balance
      // Rule: History - Spent (Ignoring boss rewards as extra bonus)
      const expectedMinBalance = Math.max(0, totalEarned - totalSpent);
      
      let updateNeeded = false;
      let updateCoins = user.reppy_coins;

      if (user.reppy_coins < expectedMinBalance) {
        const diff = expectedMinBalance - user.reppy_coins;
        totalCoinsGranted += diff;
        updateCoins = expectedMinBalance;
        updateNeeded = true;
      }

      // Always sync XP stats to ensure table cache is correct
      // (Even if coins are already balanced)
      
      console.log(`  - History Earned: ${totalEarned}, Spent: ${totalSpent}, Expected: ${expectedMinBalance}`);
      console.log(`  - Current Balance: ${user.reppy_coins} -> New Balance: ${updateCoins}`);

      // 5. Apply Updates
      await query(
        `UPDATE users 
         SET reppy_coins = $1,
             total_reps = $2,
             str_xp = $3,
             pwr_xp = $4,
             end_xp = $5,
             agi_xp = $6
         WHERE id = $7`,
        [updateCoins, totalRepsCount, stats.str_xp, stats.pwr_xp, stats.end_xp, stats.agi_xp, user.id]
      );

      totalAdjusted++;
    }

    console.log('--- MIGRATION COMPLETE ---');
    console.log(`Total users processed: ${totalAdjusted}`);
    console.log(`Total coins granted: ${totalCoinsGranted}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

migrate();

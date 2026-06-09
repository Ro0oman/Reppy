import { query } from './db.js';
import { recalculateUserStats } from './utils/stats.js';

/**
 * Script to recalculate XP and levels for ALL users in the database.
 * This ensures that everyone's rank and stats are consistent with the latest logic.
 * 
 * Usage: node recalculate_all_users.js
 */

const run = async () => {
  console.log('--- STARTING GLOBAL STATS RECALCULATION ---');
  try {
    const usersRes = await query('SELECT id, name FROM users');
    const users = usersRes.rows;
    console.log(`Found ${users.length} users to process.`);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      try {
        console.log(`[${i + 1}/${users.length}] Processing ${user.name} (${user.id})...`);
        const newStats = await recalculateUserStats(user.id);
        console.log(`   Done. Level: ${newStats.currentLevel} (Total XP: ${newStats.totalXP})`);
      } catch (userErr) {
        console.error(`   ERROR processing user ${user.id}:`, userErr.message);
      }
    }

    console.log('--- RECALCULATION COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
  }
};

run();

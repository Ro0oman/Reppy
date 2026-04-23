import { recalculateUserStats } from './utils/stats.js';

async function test() {
  const userId = '112044860553934841829'; // A known user ID or any ID from your DB
  try {
    console.log('Recalculating stats for user:', userId);
    await recalculateUserStats(userId);
    console.log('Success!');
    process.exit(0);
  } catch (err) {
    console.error('CRASH:', err.message);
    process.exit(1);
  }
}

test();

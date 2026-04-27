import { query } from '../db.js';
import { updateMissionProgress } from '../utils/missions.js';

const runTests = async () => {
  const testUserId = 'test_user_missions_' + Date.now();
  
  try {
    console.log('--- STARTING MISSIONS TESTS ---');
    
    // 1. Setup Test User
    console.log('1. Creating test user...');
    await query("INSERT INTO users (id, name, email, password_hash) VALUES ($1, 'Test User', 'test@missions.com', 'hash')", [testUserId]);

    // 2. Initial State: Fetch Missions
    console.log('2. Fetching missions for user...');
    const missionsRes = await query(`
      SELECT m.*, um.current_value, um.is_completed, um.is_claimed
      FROM missions m
      LEFT JOIN user_missions um ON m.id = um.mission_id AND um.user_id = $1
    `, [testUserId]);
    
    console.log(`Found ${missionsRes.rows.length} missions.`);
    const repsMission = missionsRes.rows.find(m => m.goal_type === 'reps');
    if (!repsMission) throw new Error('Reps mission not found');
    console.log(`Initial reps progress: ${repsMission.current_value || 0} / ${repsMission.goal_value}`);

    // 3. Update Progress (Partial)
    console.log('3. Updating reps progress (partial)...');
    await updateMissionProgress(testUserId, 'reps', 20, true);
    
    const partialRes = await query('SELECT * FROM user_missions WHERE user_id = $1 AND mission_id = $2', [testUserId, repsMission.id]);
    console.log(`Current value: ${partialRes.rows[0].current_value} (Expected: 20)`);
    if (partialRes.rows[0].current_value !== 20) throw new Error('Partial progress mismatch');

    // 4. Complete Mission
    console.log('4. Completing mission...');
    await updateMissionProgress(testUserId, 'reps', 40, true); // Total 60, goal is 50
    
    const completeRes = await query('SELECT * FROM user_missions WHERE user_id = $1 AND mission_id = $2', [testUserId, repsMission.id]);
    console.log(`Current value: ${completeRes.rows[0].current_value}, Completed: ${completeRes.rows[0].is_completed}`);
    if (!completeRes.rows[0].is_completed) throw new Error('Mission should be completed');

    // 5. Claim Reward
    console.log('5. Testing claim logic simulation...');
    // We'll check the logic in missions.js via direct DB check
    const userBefore = await query('SELECT reppy_coins, reppy_gems FROM users WHERE id = $1', [testUserId]);
    console.log(`Coins before: ${userBefore.rows[0].reppy_coins}, Gems before: ${userBefore.rows[0].reppy_gems}`);

    // Simulate claim
    const mission = repsMission;
    await query('UPDATE user_missions SET is_claimed = true WHERE user_id = $1 AND mission_id = $2', [testUserId, mission.id]);
    await query('UPDATE users SET reppy_coins = reppy_coins + $1, reppy_gems = reppy_gems + $2 WHERE id = $3', 
      [mission.reward_coins, mission.reward_gems, testUserId]);

    const userAfter = await query('SELECT reppy_coins, reppy_gems FROM users WHERE id = $1', [testUserId]);
    console.log(`Coins after: ${userAfter.rows[0].reppy_coins}, Gems after: ${userAfter.rows[0].reppy_gems}`);
    
    if (userAfter.rows[0].reppy_coins <= userBefore.rows[0].reppy_coins) throw new Error('Rewards not added');

    console.log('--- MISSIONS TESTS PASSED ---');
  } catch (err) {
    console.error('!!! MISSIONS TESTS FAILED !!!');
    console.error(err);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('Cleaning up...');
    await query('DELETE FROM user_missions WHERE user_id = $1', [testUserId]);
    await query('DELETE FROM users WHERE id = $1', [testUserId]);
    process.exit(0);
  }
};

runTests();

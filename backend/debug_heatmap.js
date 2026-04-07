import { query } from './db.js';

async function checkHeatmapData() {
  const email = 'romainot99@gmail.com';
  try {
    const user = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (!user.rows[0]) {
      console.log('User not found');
      process.exit(0);
    }
    const userId = user.rows[0].id;
    
    console.log('Checking global data for user:', userId);
    
    // Check all reps for a specific date where there might be multiples
    const allReps = await query(
      `SELECT date, count, exercise_type FROM reps WHERE user_id = $1 ORDER BY date DESC LIMIT 20`,
      [userId]
    );
    console.log('Recent reps:', allReps.rows);

    // Run the global heatmap query
    const heatmapRes = await query(
      `SELECT date, SUM(count)::int as count FROM reps 
       WHERE user_id = $1 
       GROUP BY date 
       ORDER BY date DESC LIMIT 5`,
      [userId]
    );
    console.log('Heatmap (Global) results:', heatmapRes.rows);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkHeatmapData();

import { query } from './db.js';

async function checkReps() {
  const email = 'romainot99@gmail.com';
  try {
    const user = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      console.log('User not found');
      return;
    }
    const userId = user.rows[0].id;
    const reps = await query('SELECT exercise_type, SUM(count) as total FROM reps WHERE user_id = $1 GROUP BY exercise_type', [userId]);
    console.log('Reps per type for', email, ':', reps.rows);
    process.exit(0);
  } catch (e) {
    console.error('FAILED:', e);
    process.exit(1);
  }
}

checkReps();

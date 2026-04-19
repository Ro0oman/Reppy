import { query } from '../db.js';

async function debugLikes() {
  try {
    console.log('--- REPS ---');
    const reps = await query('SELECT user_id, date, exercise_type FROM reps ORDER BY date DESC LIMIT 5');
    console.table(reps.rows);

    console.log('\n--- DAILY SUMMARIES ---');
    const summaries = await query('SELECT id, user_id, date, title FROM daily_summaries ORDER BY date DESC LIMIT 5');
    console.table(summaries.rows);

    console.log('\n--- INTERACTIONS ---');
    const interactions = await query('SELECT summary_id, user_id, type FROM summary_interactions ORDER BY created_at DESC LIMIT 5');
    console.table(interactions.rows);

    console.log('\n--- JOIN CHECK ---');
    const joinCheck = await query(`
      SELECT r.user_id, r.date, ds.id as summary_id
      FROM reps r
      LEFT JOIN daily_summaries ds ON ds.user_id = r.user_id AND ds.date = r.date
      WHERE r.user_id = (SELECT user_id FROM reps LIMIT 1)
      LIMIT 5
    `);
    console.table(joinCheck.rows);

  } catch (e) {
    console.error(e);
  }
}

debugLikes();

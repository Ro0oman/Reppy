import { query } from '../db.js';

async function debugLikes() {
  try {
    console.log('\n--- TARGETED JOIN CHECK ---');
    const result = await query(`
      SELECT 
        ds.id as summary_id, 
        ds.user_id, 
        ds.date as ds_date,
        si.type,
        si.user_id as interaction_user,
        (SELECT COUNT(*) FROM reps r WHERE r.user_id = ds.user_id AND r.date = ds.date) as rep_count
      FROM daily_summaries ds
      LEFT JOIN summary_interactions si ON si.summary_id = ds.id
      ORDER BY ds.date DESC
      LIMIT 10
    `);
    console.table(result.rows);

  } catch (e) {
    console.error(e);
  }
}

debugLikes();

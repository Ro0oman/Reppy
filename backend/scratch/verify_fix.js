import { query } from '../db.js';

async function verifyFix() {
  try {
    const testUser = '104874471911797443021'; // From previous logs
    console.log(`Verifying for user: ${testUser}`);

    const result = await query(`
      SELECT 
        r.date,
        ds.id as summary_id,
        EXISTS(SELECT 1 FROM summary_interactions WHERE summary_id = ds.id AND user_id = $1 AND type = 'LIKE') as user_has_liked
      FROM reps r
      LEFT JOIN daily_summaries ds ON ds.user_id = r.user_id AND ds.date::date = r.date::date
      WHERE r.user_id = $1
      ORDER BY r.date DESC
      LIMIT 10
    `, [testUser]);

    console.table(result.rows);
    
    const hasAnySummary = result.rows.some(r => r.summary_id !== null);
    if (hasAnySummary) {
      console.log('✅ Found joined summaries!');
    } else {
      console.log('⚠️ No joined summaries found for this user. They might not have liked anything yet or summaries are missing.');
    }

  } catch (e) {
    console.error(e);
  }
}

verifyFix();

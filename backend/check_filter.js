import { query } from './db.js';

async function checkFilter() {
  const email = 'romainot99@gmail.com';
  const type = 'dips';
  const year = 2026;
  try {
    const user = await query('SELECT id FROM users WHERE email = $1', [email]);
    const userId = user.rows[0].id;
    
    const isGlobal = !type || type === 'all';
    let typeFilter = isGlobal ? '' : 'AND exercise_type = $2';
    let params = isGlobal ? [userId] : [userId, type];

    let dateFilter = `AND date >= '${year}-01-01' AND date <= '${year}-12-31'`;

    const q = `SELECT date, SUM(count)::int as count FROM reps 
               WHERE user_id = $1 ${typeFilter} ${dateFilter}
               GROUP BY date
               ORDER BY date ASC`;
    
    console.log('Query:', q);
    console.log('Params:', params);
    
    const result = await query(q, params);
    console.log('Results (Dips only):', result.rows);
    const sum = result.rows.reduce((acc, r) => acc + Number(r.count), 0);
    console.log('Total Sum calculated from results:', sum);
    
    process.exit(0);
  } catch (e) {
    console.error('FAILED:', e);
    process.exit(1);
  }
}

checkFilter();

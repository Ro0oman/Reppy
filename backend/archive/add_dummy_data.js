import { query } from './db.js';

async function addDummyData() {
  const userId = 'user_test';
  const data = [
    { date: '2026-01-05', count: 50, type: 'pullups' },
    { date: '2026-01-15', count: 30, type: 'pushups' },
    { date: '2026-02-10', count: 40, type: 'pullups' },
    { date: '2026-03-20', count: 100, type: 'pushups' },
    { date: '2026-04-01', count: 60, type: 'pullups' }
  ];

  for (const item of data) {
    await query(
      'INSERT INTO reps (user_id, count, date, exercise_type) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, date, exercise_type) DO UPDATE SET count = EXCLUDED.count',
      [userId, item.count, item.date, item.type]
    );
  }
  console.log('Dummy data added for 2026');
  process.exit(0);
}

addDummyData();

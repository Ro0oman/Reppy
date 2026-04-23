import { query } from '../db.js';

const run = async () => {
  const userRes = await query('SELECT id FROM users WHERE email = $1', ['romainot99@gmail.com']);
  if (userRes.rows.length === 0) process.exit();
  
  const userId = userRes.rows[0].id;
  const today = new Date().toISOString().split('T')[0];
  
  await query("UPDATE daily_summaries SET description = '¡He activado un Frasco de Concentración! (+50% de daño global durante 30m)' WHERE user_id = $1 AND date = $2", [userId, today]);
  console.log('Cleaned up user social post');
  process.exit();
};

run();

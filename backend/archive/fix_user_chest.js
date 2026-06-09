import pool from './db.js';

const email = 'comomolosiempre@gmail.com';

async function grantManualChest() {
  try {
    const userRes = await pool.query('SELECT id, boss_chests FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      console.log('User not found');
      process.exit(1);
    }
    const user = userRes.rows[0];

    // Find pending chests for defeated bosses (like ID 3)
    const pendingRes = await pool.query(
      `SELECT b.id, b.name FROM boss_fights b
       JOIN event_participants p ON p.boss_fight_id = b.id
       WHERE b.status = 'defeated' AND p.user_id = $1 AND p.damage_dealt > 0 AND p.chests_claimed = 0`,
      [user.id]
    );

    if (pendingRes.rows.length === 0) {
      console.log('No pending chests found for this user.');
      process.exit(0);
    }

    console.log(`Found ${pendingRes.rows.length} pending chests for bosses: ${pendingRes.rows.map(b => b.name).join(', ')}`);

    await pool.query('BEGIN');
    try {
      await pool.query('UPDATE users SET boss_chests = boss_chests + $1 WHERE id = $2', [pendingRes.rows.length, user.id]);
      await pool.query(
        `UPDATE event_participants SET chests_claimed = 1 
         WHERE user_id = $1 AND boss_fight_id IN (
           SELECT b.id FROM boss_fights b WHERE b.status = 'defeated'
         ) AND damage_dealt > 0 AND chests_claimed = 0`,
        [user.id]
      );
      await pool.query('COMMIT');
      console.log('Successfully granted chests and updated participation records.');
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }

    process.exit(0);
  } catch (err) {
    console.error('Error granting manual chest:', err);
    process.exit(1);
  }
}

grantManualChest();

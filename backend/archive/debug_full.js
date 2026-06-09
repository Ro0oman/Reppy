import pool from './db.js';

const email = 'comomolosiempre@gmail.com';

async function debugAll() {
  try {
    const user = (await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0];
    if (!user) {
      console.log('USER NOT FOUND');
      process.exit(0);
    }
    console.log('--- USER ---');
    console.log(JSON.stringify(user, null, 2));

    const reps = (await pool.query('SELECT * FROM reps WHERE user_id = $1', [user.id])).rows;
    console.log('\n--- REPS (last 5) ---');
    console.log(JSON.stringify(reps.slice(0, 5), null, 2));

    const participation = (await pool.query('SELECT p.*, b.name as boss_name, b.status as boss_status FROM event_participants p JOIN boss_fights b ON p.boss_fight_id = b.id WHERE p.user_id = $1', [user.id])).rows;
    console.log('\n--- PARTICIPATION ---');
    console.log(JSON.stringify(participation, null, 2));

    const inventory = (await pool.query('SELECT ui.*, c.name, c.type FROM user_inventory ui JOIN cosmetics c ON ui.cosmetic_id = c.id WHERE ui.user_id = $1', [user.id])).rows;
    console.log('\n--- INVENTORY ---');
    console.log(JSON.stringify(inventory, null, 2));

    const cosmetics = (await pool.query('SELECT * FROM cosmetics ORDER BY id')).rows;
    console.log('\n--- ALL COSMETICS (count: ' + cosmetics.length + ') ---');
    // console.log(JSON.stringify(cosmetics, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugAll();

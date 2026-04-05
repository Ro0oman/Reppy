import pool from './db.js';

const email = 'comomolosiempre@gmail.com';

async function checkUser() {
  try {
    const user = (await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0];
    if (!user) {
      console.log(`User ${email} NOT FOUND`);
      process.exit(0);
    }
    
    const participants = (await pool.query('SELECT * FROM event_participants WHERE user_id = $1', [user.id])).rows;
    const inventory = (await pool.query(
      'SELECT ui.*, c.name, c.type FROM user_inventory ui JOIN cosmetics c ON ui.cosmetic_id = c.id WHERE ui.user_id = $1',
      [user.id]
    )).rows;
    const activeBoss = (await pool.query("SELECT * FROM boss_fights WHERE status = 'active'")).rows;

    console.log('USER_ID:', user.id);
    console.log('REPPY_COINS:', user.reppy_coins);
    console.log('BOSS_CHESTS:', user.boss_chests);
    console.log('PARTICIPATION:', JSON.stringify(participants, null, 2));
    console.log('INVENTORY_COUNT:', inventory.length);
    console.log('INVENTORY:', JSON.stringify(inventory.map(i => i.name), null, 2));
    console.log('ACTIVE_BOSS:', JSON.stringify(activeBoss.map(b => ({ id: b.id, name: b.name, status: b.status })), null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();

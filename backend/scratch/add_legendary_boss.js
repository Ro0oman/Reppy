import { query } from '../db.js';

async function run() {
  try {
    const res = await query('SELECT MAX(order_index) as max_idx FROM boss_fights');
    const nextIdx = (res.rows[0].max_idx || 0) + 1;
    await query(`
      INSERT INTO boss_fights 
      (name, total_hp, current_hp, image_url, order_index, is_legendary, description, status, start_date, end_date) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      'Malenia, Goddess of Rot', 
      25000, 
      25000, 
      'https://static.wikia.nocookie.net/eldenring/images/4/4b/Malenia%2C_Blade_of_Miquella_Render.png', 
      nextIdx, 
      true, 
      'I am Malenia, Blade of Miquella. And I have never known defeat.', 
      'active',
      new Date(),
      new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)
    ]);
    console.log('Legendary Boss added');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

run();

import { query } from '../db.js';

async function run() {
  try {
    // Get all bosses sorted by order_index
    const res = await query('SELECT id, name, order_index FROM boss_fights ORDER BY order_index ASC');
    const bosses = res.rows;
    
    console.log(`Found ${bosses.length} bosses.`);
    
    for (let i = 0; i < bosses.length; i++) {
      // 1 in every 3 (3rd, 6th, 9th...)
      const isLegendary = (i + 1) % 3 === 0;
      await query('UPDATE boss_fights SET is_legendary = $1 WHERE id = $2', [isLegendary, bosses[i].id]);
      console.log(`Boss ${bosses[i].name} (ID: ${bosses[i].id}) set to is_legendary: ${isLegendary}`);
    }
    
    console.log('Update complete.');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

run();

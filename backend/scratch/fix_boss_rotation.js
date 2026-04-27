import { query } from '../db.js';

async function run() {
  try {
    // Get all bosses sorted by order_index
    const res = await query('SELECT id, name, order_index FROM boss_fights ORDER BY order_index ASC');
    const bosses = res.rows;
    
    console.log(`Found ${bosses.length} bosses.`);
    
    for (let i = 0; i < bosses.length; i++) {
      const position = (i % 3) + 1;
      const isLegendary = position === 3;
      const isEpic = position === 2;
      
      await query('UPDATE boss_fights SET is_legendary = $1, is_epic = $2 WHERE id = $3', 
        [isLegendary, isEpic, bosses[i].id]);
      console.log(`Boss ${bosses[i].name} set to: ${isLegendary ? 'LEGENDARY' : (isEpic ? 'EPIC' : 'NORMAL')}`);
    }
    
    console.log('Update complete.');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

run();

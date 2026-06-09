import { query } from './db.js';

async function makeHalfSeasonal() {
  try {
    const res = await query("SELECT id FROM items WHERE type IN ('head', 'weapon', 'armor', 'boots', 'consumable') ORDER BY id ASC");
    const items = res.rows;
    
    // Select half of them
    const halfCount = Math.floor(items.length / 2);
    
    // Just grab every other item, or the first half. Let's do a random half.
    // Or simpler: shuffle the array and pick the first half.
    const shuffled = items.sort(() => 0.5 - Math.random());
    const seasonalItems = shuffled.slice(0, halfCount);
    
    console.log(`Total combat items: ${items.length}`);
    console.log(`Marking ${seasonalItems.length} as seasonal...`);
    
    let updatedCount = 0;
    for (const item of seasonalItems) {
      await query("UPDATE items SET is_seasonal = true WHERE id = $1", [item.id]);
      updatedCount++;
    }
    
    console.log(`Successfully updated ${updatedCount} items to be seasonal.`);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

makeHalfSeasonal();

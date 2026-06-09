import { query } from './db.js';

async function fixBundles() {
  try {
    console.log('Fixing bundles...');
    // Welcome Pack (Consumable, Boots, Armor, Weapon)
    await query('UPDATE items SET bundle_items = $1 WHERE id = 147', ['413,384,359,334']);
    // Epic Pack
    await query('UPDATE items SET bundle_items = $1 WHERE id = 151', ['419,395,370,345']);
    // Legendary Pack
    await query('UPDATE items SET bundle_items = $1 WHERE id = 152', ['425,400,375,350']);
    console.log('Bundles updated successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error updating bundles:', err);
    process.exit(1);
  }
}

fixBundles();

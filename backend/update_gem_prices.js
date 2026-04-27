import { query } from './db.js';

const update = async () => {
  try {
    console.log('Updating Calistenico items price...');
    const resCal = await query("UPDATE items SET price_gems = 100 WHERE rarity = 'calistenico'");
    console.log(`Updated ${resCal.rowCount} Calistenico items.`);
    
    console.log('Setting gem prices for Legendary items (50 Gems)...');
    const resLeg = await query(`
      UPDATE items 
      SET price_gems = 50 
      WHERE rarity = 'legendary'
    `);
    console.log(`Updated ${resLeg.rowCount} Legendary items.`);
    
    console.log('Setting gem prices for Avatars (20 Gems)...');
    const resAva = await query(`
      UPDATE items 
      SET price_gems = 20 
      WHERE type = 'avatar' AND rarity != 'calistenico' AND rarity != 'legendary'
    `);
    console.log(`Updated ${resAva.rowCount} Avatar items.`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

update();

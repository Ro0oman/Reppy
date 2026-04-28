import { query } from '../db.js';

/**
 * Probabilities for each rarity
 */
const RARITY_WEIGHTS = {
  'common': 0,
  'rare': 0,
  'especial': 600,     // 60%
  'legendary': 300,    // 30%
  'calistenico': 100   // 10%
};

/**
 * Rotates the daily shop items
 * Selects 3 items with a 20% discount
 */
export const rotateDailyShop = async () => {
  try {
    console.log('Rotating Daily Shop...');
    
    // 1. Fetch all eligible items (exclude bundles and customizable items)
    const itemsRes = await query('SELECT id, price, price_gems, rarity, is_seasonal FROM items WHERE type != \'bundle\' AND is_customizable = false');
    const allItems = itemsRes.rows;
    
    if (allItems.length === 0) {
      console.error('No items found to rotate');
      return;
    }

    // 2. Select 3 items using weighted random
    const selectedItems = [];
    const availableItems = [...allItems];

    for (let i = 0; i < 3; i++) {
      if (availableItems.length === 0) break;

      const totalWeight = availableItems.reduce((sum, item) => sum + (RARITY_WEIGHTS[item.rarity] || 10), 0);
      let random = Math.random() * totalWeight;
      
      let selectedIndex = -1;
      for (let j = 0; j < availableItems.length; j++) {
        const weight = RARITY_WEIGHTS[availableItems[j].rarity] || 10;
        if (random < weight) {
          selectedIndex = j;
          break;
        }
        random -= weight;
      }

      if (selectedIndex === -1) selectedIndex = availableItems.length - 1;
      
      const item = availableItems.splice(selectedIndex, 1)[0];
      selectedItems.push(item);
    }

    // 3. Clear and Insert into DB
    await query('BEGIN');
    await query('DELETE FROM daily_shop_items');
    
    for (const item of selectedItems) {
      const discPrice = Math.floor((item.price || 0) * 0.8);
      const discGems = Math.floor((item.price_gems || 0) * 0.8);
      
      await query(`
        INSERT INTO daily_shop_items (item_id, discounted_price, discounted_gems, is_seasonal_deal)
        VALUES ($1, $2, $3, $4)
      `, [item.id, discPrice, discGems, item.is_seasonal]);
    }
    
    await query('COMMIT');
    console.log(`Daily Shop rotated successfully. ${selectedItems.length} items added.`);
  } catch (err) {
    await query('ROLLBACK');
    console.error('Failed to rotate daily shop:', err);
    throw err;
  }
};

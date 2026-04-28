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
 * Selects 6 items with specific rarity rules
 */
export const rotateDailyShop = async (userId = null) => {
  try {
    console.log('Rotating Daily Shop...');
    
    // 1. Fetch eligible items (exclude bundles and customizable)
    const itemsRes = await query('SELECT id, price, price_gems, rarity, is_seasonal FROM items WHERE type != \'bundle\' AND is_customizable = false');
    const allItems = itemsRes.rows;
    
    if (allItems.length === 0) {
      console.error('No items found to rotate');
      return;
    }

    const RARITY_WEIGHTS = {
      'common': 20,
      'rare': 30,
      'especial': 30,
      'legendary': 15,
      'calistenico': 5
    };

    const selectedItems = [];
    const availablePool = [...allItems];
    
    for (let i = 0; i < 6; i++) {
      if (availablePool.length === 0) break;

      const totalWeight = availablePool.reduce((sum, item) => sum + (RARITY_WEIGHTS[item.rarity] || 10), 0);
      let random = Math.random() * totalWeight;
      
      let selectedIndex = -1;
      for (let j = 0; j < availablePool.length; j++) {
        const weight = RARITY_WEIGHTS[availablePool[j].rarity] || 10;
        if (random < weight) {
          selectedIndex = j;
          break;
        }
        random -= weight;
      }

      if (selectedIndex === -1) selectedIndex = availablePool.length - 1;
      
      const item = availablePool.splice(selectedIndex, 1)[0];
      selectedItems.push(item);
    }

    // 3. Clear and Insert into DB
    // If userId is provided, we only update for that user? 
    // Wait, the requirement implies a global daily rotation but manual refresh per user.
    // So the daily_shop_items table should probably have a user_id column if we want per-user rotation.
    // But the issue description implies "daily rotation" like Clash Royale.
    // In Clash Royale, everyone sees different things? Actually, yes.
    
    // If the table daily_shop_items is global, then a refresh by one user changes it for everyone.
    // We need to add a user_id column to daily_shop_items to make it individual.

    if (userId) {
      console.log(`Rotating for user: ${userId}`);
      // Manual refresh for specific user
      await query('DELETE FROM daily_shop_items WHERE user_id = $1', [userId]);
    } else {
      console.log('Rotating for SYSTEM');
      // Global daily rotation (legacy support or system-wide)
      await query('DELETE FROM daily_shop_items WHERE user_id IS NULL');
    }
    
    for (const item of selectedItems) {
      const discPrice = Math.floor((item.price || 0) * 0.8);
      const discGems = Math.floor((item.price_gems || 0) * 0.8);
      
      console.log(`Inserting item ${item.id} for user ${userId || 'SYSTEM'}`);
      await query(`
        INSERT INTO daily_shop_items (item_id, discounted_price, discounted_gems, is_seasonal_deal, user_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [item.id, discPrice, discGems, item.is_seasonal, userId]);
    }
    
    console.log(`Daily Shop rotated successfully for ${userId || 'SYSTEM'}. ${selectedItems.length} items added.`);
  } catch (err) {
    console.error('Failed to rotate daily shop:', err);
    throw err;
  }
};

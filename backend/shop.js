import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';
import { recalculateUserStats } from './utils/stats.js';
import { updateMissionProgress } from './utils/missions.js';
import { rotateDailyShop } from './utils/shop_rotation.js';


const router = express.Router();
// Get available items
router.get('/cosmetics', authenticate, async (req, res) => {
  try {
    // Show all items (seasonal included)
    const itemsRes = await query(`
      SELECT i.* 
      FROM items i
      LEFT JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = $1
      WHERE (i.is_customizable = true OR i.type IN ('bundle', 'consumable'))
      ORDER BY i.type ASC, i.id ASC
    `, [req.user.id]);
    const inventoryRes = await query('SELECT item_id, is_new, quantity FROM user_items WHERE user_id = $1', [req.user.id]);
    
    const inventoryMap = {};
    inventoryRes.rows.forEach(row => {
      inventoryMap[row.item_id] = { owned: true, is_new: row.is_new, quantity: row.quantity || 1 };
    });
    
    const shopItems = itemsRes.rows.map((item, index) => {
      const invData = inventoryMap[item.id] || { owned: false, is_new: false, quantity: 0 };
      return {
        ...item,
        owned: invData.owned,
        is_new: invData.is_new,
        quantity: invData.quantity,
        roadmap_position: index + 1,
        unlock_at: item.created_at,
        is_unlocked: true,
        seconds_until_unlock: 0
      };
    });
    
    res.json(shopItems);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Error fetching items' });
  }
});

// Get single item details
router.get('/item/:id', authenticate, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    if (!Number.isFinite(itemId)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const itemRes = await query('SELECT * FROM items WHERE id = $1', [itemId]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const item = itemRes.rows[0];
    if (typeof item.stats === 'string') {
        try { item.stats = JSON.parse(item.stats); } catch(e) { item.stats = {}; }
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Error fetching item details' });
  }
});

// Get concrete bundle contents (resolved items) to power pack preview modal
router.get('/bundle/:id/contents', authenticate, async (req, res) => {
  try {
    const bundleId = parseInt(req.params.id, 10);
    if (!Number.isFinite(bundleId)) {
      return res.status(400).json({ message: 'Invalid bundle id' });
    }

    const bundleRes = await query('SELECT id, bundle_items FROM items WHERE id = $1 AND type = $2', [bundleId, 'bundle']);
    if (bundleRes.rows.length === 0) {
      return res.status(404).json({ message: 'Bundle not found' });
    }

    const raw = bundleRes.rows[0].bundle_items || '';
    const ids = raw
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(Number.isFinite);

    if (ids.length === 0) return res.json({ items: [] });

    const itemsRes = await query(`
      SELECT id, name, type, rarity, svg_key, css_value, description, stats, price, price_gems
      FROM items
      WHERE id = ANY($1::int[])
      ORDER BY array_position($1::int[], id)
    `, [ids]);

    res.json({ items: itemsRes.rows });
  } catch (error) {
    console.error('Error fetching bundle contents:', error);
    res.status(500).json({ message: 'Error fetching bundle contents' });
  }
});

// Get daily shop items
router.get('/daily', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`GET /daily for userId: ${userId}`);
    
    // Check if user has daily deals
    let dailyRes = await query(`
      SELECT d.*, i.name, i.description, i.rarity, i.type, i.image_url, i.svg_key, i.stats,
             CASE WHEN d.item_id IS NOT NULL THEN EXISTS(SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = i.id) ELSE d.is_claimed END as owned
      FROM daily_shop_items d
      LEFT JOIN items i ON d.item_id = i.id
      WHERE d.user_id = $1
    `, [userId]);

    console.log(`Found ${dailyRes.rows.length} deals for user`);

    // Check if rotation is expired (24h)
    let needsRotation = dailyRes.rows.length === 0;
    if (!needsRotation) {
      const rotatedAt = new Date(dailyRes.rows[0].rotated_at);
      const now = new Date();
      if (now.getTime() - rotatedAt.getTime() > 24 * 60 * 60 * 1000) {
        console.log(`Deals for user ${userId} expired (${rotatedAt}), rotating...`);
        needsRotation = true;
      }
    }

    if (needsRotation) {
      await rotateDailyShop(userId);
      dailyRes = await query(`
        SELECT d.*, i.name, i.description, i.rarity, i.type, i.image_url, i.svg_key, i.stats,
               CASE WHEN d.item_id IS NOT NULL THEN EXISTS(SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = i.id) ELSE d.is_claimed END as owned
        FROM daily_shop_items d
        LEFT JOIN items i ON d.item_id = i.id
        WHERE d.user_id = $1
      `, [userId]);
    }

    // Get user refresh status
    const userRes = await query('SELECT daily_refreshes, last_refresh_at FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found in database' });
    }
    const userData = userRes.rows[0];
    
    // Reset daily refresh if it's a new day
    let currentRefreshes = userData.daily_refreshes || 0;
    const lastRefresh = new Date(userData.last_refresh_at);
    const today = new Date();
    
    if (lastRefresh.toDateString() !== today.toDateString()) {
      currentRefreshes = 0;
      await query('UPDATE users SET daily_refreshes = 0 WHERE id = $1', [userId]);
    }

    // Fixed chests pricing
    const chests = [
      { id: 'normal', name: 'Cofre de Batalla', rarity: 'common', price: 1000, currency: 'coins', type: 'chest', description: 'Contiene 1-3 objetos aleatorios y oro.' },
      { id: 'epic', name: 'Cofre Épico', rarity: 'especial', price_gems: 25, currency: 'gems', type: 'chest', description: 'Garantiza al menos un objeto ÉPICO.' },
      { id: 'legendary', name: 'Cofre Legendario', rarity: 'legendary', price_gems: 60, currency: 'gems', type: 'chest', description: 'Garantiza al menos un objeto LEGENDARIO.' }
    ];

    // Calculate next rotation time from the deals themselves
    let nextRotation = null;
    if (dailyRes.rows.length > 0 && dailyRes.rows[0].rotated_at) {
      const rotatedAt = new Date(dailyRes.rows[0].rotated_at);
      nextRotation = new Date(rotatedAt.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }

    // Map deals to ensure stats are objects
    const deals = dailyRes.rows.map(item => {
      let parsedStats = item.stats;
      if (typeof item.stats === 'string') {
        try { parsedStats = JSON.parse(item.stats); } catch(e) { parsedStats = {}; }
      }
      return { ...item, stats: parsedStats || {} };
    });

    console.log(`Sending ${deals.length} deals to user ${userId}. Next rotation: ${nextRotation}`);

    res.json({ 
      deals, 
      chests, 
      next_rotation: nextRotation, 
      daily_refreshes: currentRefreshes,
      refresh_cost_gems: currentRefreshes + 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh daily shop
router.post('/daily/refresh', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRes = await query('SELECT reppy_gems, daily_refreshes, last_refresh_at FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];
    
    let currentRefreshes = user.daily_refreshes || 0;
    const lastRefresh = new Date(user.last_refresh_at);
    const today = new Date();
    
    if (lastRefresh.toDateString() !== today.toDateString()) {
      currentRefreshes = 0;
    }

    const cost = currentRefreshes + 1;
    
    if (user.reppy_gems < cost) {
      return res.status(400).json({ message: 'INSUFFICIENT GEMS FOR REFRESH' });
    }

    await query('UPDATE users SET reppy_gems = reppy_gems - $1, daily_refreshes = $2, last_refresh_at = CURRENT_TIMESTAMP WHERE id = $3', [cost, currentRefreshes + 1, userId]);
    await rotateDailyShop(userId);

    res.json({ message: 'Shop refreshed', remaining_gems: user.reppy_gems - cost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Claim free reward
router.post('/daily/claim/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const dealId = req.params.id;

    const dealRes = await query('SELECT * FROM daily_shop_items WHERE id = $1 AND user_id = $2', [dealId, userId]);
    if (dealRes.rows.length === 0) return res.status(404).json({ message: 'DEAL NOT FOUND' });
    
    const deal = dealRes.rows[0];
    if (deal.is_claimed) return res.status(400).json({ message: 'REWARD ALREADY CLAIMED' });
    if (!deal.reward_type) return res.status(400).json({ message: 'NOT A FREE REWARD' });

    await query('BEGIN');
    
    if (deal.reward_type === 'coins') {
      await query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [deal.reward_amount, userId]);
    } else if (deal.reward_type === 'gems') {
      await query('UPDATE users SET reppy_gems = reppy_gems + $1 WHERE id = $2', [deal.reward_amount, userId]);
      await query(`
        INSERT INTO gem_transactions (user_id, amount, source, description)
        VALUES ($1, $2, 'SHOP_FREE', 'Daily Free Reward')
      `, [userId, deal.reward_amount]);
    }

    await query('UPDATE daily_shop_items SET is_claimed = TRUE WHERE id = $1', [dealId]);
    await query('COMMIT');

    res.json({ message: 'Reward claimed', type: deal.reward_type, amount: deal.reward_amount });
  } catch (error) {
    await query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// Mark item as seen
router.post('/mark-seen/:id', authenticate, async (req, res) => {
  const itemId = parseInt(req.params.id);
  const userId = req.user.id;
  try {
    await query('UPDATE user_items SET is_new = FALSE WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
    res.json({ message: 'Marked as seen' });
  } catch (error) {
    console.error('Error marking as seen:', error);
    res.status(500).json({ message: 'Error marking as seen' });
  }
});

// Buy item
router.post('/buy/:id', authenticate, async (req, res) => {
  const itemId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    // Determine cost and users coins
    const itemRes = await query('SELECT * FROM items WHERE id = $1', [itemId]);
    if (itemRes.rows.length === 0) return res.status(404).json({ message: 'Item not found' });
    const item = itemRes.rows[0];

    const userRes = await query('SELECT reppy_coins, reppy_gems FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    // Check inventory
    const inventoryRes = await query('SELECT * FROM user_items WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
    if (inventoryRes.rows.length > 0 && item.type !== 'consumable') {
      return res.status(400).json({ message: 'UNIT DETECTED: PROTOCOL ALREADY ACQUIRED' });
    }

    // Check if it's a daily deal for this user (to get discount AND allow purchase of gear)
    const dailyDealRes = await query('SELECT * FROM daily_shop_items WHERE item_id = $1 AND user_id = $2', [itemId, userId]);
    const isDailyDeal = dailyDealRes.rows.length > 0;

    // RESTRICTION: Non-customizable combat gear can ONLY be bought via Daily Rotation
    if (!item.is_customizable && !['bundle', 'consumable'].includes(item.type) && !isDailyDeal) {
      return res.status(400).json({ message: 'ERROR: UNIT RESTRICTED - ACQUISITION VIA DAILY MERCHANT ONLY' });
    }

    if (item.is_seasonal && !isDailyDeal) {
      return res.status(400).json({ message: 'ERROR: SEASONAL UNIT - ACQUISITION VIA DAILY MERCHANT ONLY' });
    }

    let price = isDailyDeal ? dailyDealRes.rows[0].discounted_price : (item.price || 0);
    let priceGems = isDailyDeal ? dailyDealRes.rows[0].discounted_gems : (item.price_gems || 0);
    let finalDeduction = price;

    // Bundle Refund Logic (Only for Coins for now to keep it simple, or we could skip gems refund)
    if (item.type === 'bundle' && item.bundle_items) {
      const bundleItemIds = item.bundle_items.split(',').map(id => parseInt(id.trim()));
      let refundAmount = 0;
      
      for (const id of bundleItemIds) {
        const checkRes = await query('SELECT id FROM user_items WHERE user_id = $1 AND item_id = $2', [userId, id]);
        if (checkRes.rows.length > 0) {
          const subItemRes = await query('SELECT price, type FROM items WHERE id = $1', [id]);
          if (subItemRes.rows.length > 0) {
            const subItem = subItemRes.rows[0];
            if (subItem.type !== 'consumable') {
              refundAmount += (subItem.price || 0);
            }
          }
        }
      }
      finalDeduction = Math.max(0, price - refundAmount);
    }

    if (user.reppy_coins < finalDeduction) {
      return res.status(400).json({ message: 'INSUFFICIENT FUNDS: REPPY COINS REQUIRED' });
    }

    if (user.reppy_gems < priceGems) {
      return res.status(400).json({ message: 'INSUFFICIENT GEMS: SECTOR MISSION COMPLETION REQUIRED' });
    }

    // Process Purchase
    await query('BEGIN');
    
    if (item.type === 'bundle' && item.bundle_items) {
      const bundleItemIds = item.bundle_items.split(',').map(id => parseInt(id.trim()));
      for (const id of bundleItemIds) {
        await query(`
          INSERT INTO user_items (user_id, item_id, quantity) 
          VALUES ($1, $2, 1) 
          ON CONFLICT (user_id, item_id) 
          DO UPDATE SET quantity = user_items.quantity + 1, is_new = TRUE
        `, [userId, id]);
      }
      
      await query(`
        INSERT INTO user_items (user_id, item_id) 
        VALUES ($1, $2) 
        ON CONFLICT (user_id, item_id) DO NOTHING
      `, [userId, itemId]);
    } else {
      if (item.type === 'consumable' && inventoryRes.rows.length > 0) {
        await query('UPDATE user_items SET quantity = quantity + 1, is_new = TRUE WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
      } else {
        await query(`
          INSERT INTO user_items (user_id, item_id, quantity) 
          VALUES ($1, $2, 1) 
          ON CONFLICT (user_id, item_id) 
          DO UPDATE SET quantity = user_items.quantity + 1, is_new = TRUE
        `, [userId, itemId]);
      }
    }

    await query('UPDATE users SET reppy_coins = reppy_coins - $1, reppy_gems = reppy_gems - $2 WHERE id = $3', [finalDeduction, priceGems, userId]);
    
    if (priceGems > 0) {
      await query(`
        INSERT INTO gem_transactions (user_id, amount, source, description)
        VALUES ($1, $2, 'SHOP', $3)
      `, [userId, -priceGems, `Purchased ${item.name}`]);
    }

    await query('COMMIT');
    
    // Mission Triggers
    await updateMissionProgress(userId, 'buy_any', 1);
    await updateMissionProgress(userId, 'spend_coins', finalDeduction);
    if (item.rarity === 'Legendary' || item.rarity === 'Calisthenics') {
      await updateMissionProgress(userId, 'buy_legendary', 1);
    }
    
    // Mission: Own Items (Absolute count)
    const ownRes = await query('SELECT COUNT(*) as count FROM user_items WHERE user_id = $1', [userId]);
    await updateMissionProgress(userId, 'own_items', parseInt(ownRes.rows[0].count), false);

    // Recalculate stats
    await recalculateUserStats(userId);

    res.json({ 
      message: 'Purchase successful', 
      remaining_coins: user.reppy_coins - finalDeduction,
      remaining_gems: user.reppy_gems - priceGems,
      refunded: price - finalDeduction
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error purchasing item:', error);
    res.status(500).json({ message: 'Error processing purchase' });
  }
});

// Equip item
router.post('/equip/:id', authenticate, async (req, res) => {
  const itemId = parseInt(req.params.id);
  const typeParam = req.query.type;
  const userId = req.user.id;

  try {
    // Validate type
    const validTypes = ['head', 'weapon', 'armor', 'boots', 'title', 'border', 'avatar', 'background', 'post_background'];
    if (!validTypes.includes(typeParam)) {
      return res.status(400).json({ message: `Invalid equipment type: ${typeParam}` });
    }

    if (itemId === 0) {
      const slotMap = {
        head: 'equipped_head_id',
        weapon: 'equipped_weapon_id',
        armor: 'equipped_armor_id',
        boots: 'equipped_boots_id',
        title: 'equipped_title_id',
        border: 'equipped_border_id',
        avatar: 'equipped_avatar_id',
        background: 'equipped_background_id',
        post_background: 'equipped_post_background_id'
      };
      const column = slotMap[typeParam];
      if (column) {
        await query(`UPDATE users SET ${column} = NULL WHERE id = $1`, [userId]);
      }
      return res.json({ message: 'Un-equipped successfully' });
    }

    // Check ownership
    console.log(`[SHOP_EQUIP] User ${userId} attempting to equip item ${itemId} (Type: ${typeParam})`);
    const inventoryRes = await query('SELECT * FROM user_items WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
    
    if (inventoryRes.rows.length === 0) {
      console.log(`[SHOP_EQUIP_ERROR] User ${userId} does NOT own item ${itemId}. Inventory check failed.`);
      const itemExists = await query('SELECT name FROM items WHERE id = $1', [itemId]);
      const itemName = itemExists.rows[0]?.name || 'Unknown Item';
      return res.status(403).json({ 
        message: `You do not own this item: ${itemName} (${itemId})`,
        debug: { userId, itemId, itemName }
      });
    }
    
    const itemRes = await query('SELECT type FROM items WHERE id = $1', [itemId]);
    if (itemRes.rows.length === 0) return res.status(404).json({ message: 'Item not found in database' });
    const actualType = itemRes.rows[0].type;
    
    // Verify type matches what was sent
    if (actualType !== typeParam) {
      console.warn(`[SHOP_EQUIP_MISMATCH] Item ${itemId} is type '${actualType}' but frontend sent '${typeParam}'`);
      return res.status(400).json({ message: `Item type mismatch. Expected ${actualType}, got ${typeParam}` });
    }
    
    const slotMap = {
      head: 'equipped_head_id',
      weapon: 'equipped_weapon_id',
      armor: 'equipped_armor_id',
      boots: 'equipped_boots_id',
      title: 'equipped_title_id',
      border: 'equipped_border_id',
      avatar: 'equipped_avatar_id',
      background: 'equipped_background_id',
      post_background: 'equipped_post_background_id'
    };

    const column = slotMap[actualType];
    if (column) {
      // Only update the specific slot for this item type - don't touch other slots
      await query(`UPDATE users SET ${column} = $1 WHERE id = $2`, [itemId, userId]);
    }

    res.json({ message: 'Equipped successfully' });
  } catch (error) {
    console.error('Error equipping item:', error);
    res.status(500).json({ message: 'Error equipping item' });
  }
});


// Activate consumable
router.post('/activate/:id', authenticate, async (req, res) => {
  const itemId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const itemRes = await query('SELECT * FROM items WHERE id = $1', [itemId]);
    if (itemRes.rows.length === 0) return res.status(404).json({ message: 'Item no encontrado' });
    const item = itemRes.rows[0];

    if (item.type !== 'consumable') {
      return res.status(400).json({ message: 'Este objeto no es un consumible' });
    }

    // Check ownership and quantity
    const invRes = await query('SELECT * FROM user_items WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
    if (invRes.rows.length === 0 || invRes.rows[0].quantity <= 0) {
      return res.status(403).json({ message: 'No tienes este objeto en tu inventario' });
    }

    await query('BEGIN');

        // 2. Activate specific stat boost or generic multiplier
        let updateQuery = '';
        let updateParams = [];
        let bonusDesc = '';
        let bonusValue = '';
        const durationSeconds = item.stats.duration || 3600;

        if (item.stats.dex_bonus) {
            bonusDesc = 'DEX +' + item.stats.dex_bonus;
            bonusValue = '+' + item.stats.dex_bonus;
            updateQuery = `
                UPDATE users 
                SET dex_bonus = $2, 
                    dex_bonus_expiry = NOW() + INTERVAL '1 second' * $3 
                WHERE id = $1
            `;
            updateParams = [userId, item.stats.dex_bonus, durationSeconds];
        } else {
            const multiplier = item.stats.multiplier || 1.5;
            bonusDesc = 'Daño x' + multiplier;
            bonusValue = 'x' + multiplier;
            updateQuery = `
                UPDATE users 
                SET damage_multiplier = $2, 
                    damage_multiplier_expiry = NOW() + INTERVAL '1 second' * $3 
                WHERE id = $1
            `;
            updateParams = [userId, multiplier, durationSeconds];
        }

        await query(updateQuery, updateParams);

    // 2. Consume item
    if (invRes.rows[0].quantity > 1) {
      await query('UPDATE user_items SET quantity = quantity - 1 WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
    } else {
      await query('DELETE FROM user_items WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
    }

    // 3. Post to social feed
    try {
      const today = new Date().toISOString().split('T')[0];
      const durationDesc = durationSeconds >= 3600 ? `${Math.floor(durationSeconds/3600)}h` : `${Math.floor(durationSeconds/60)}m`;
      const summaryRes = await query('SELECT id, description FROM daily_summaries WHERE user_id = $1 AND date = $2', [userId, today]);
      if (summaryRes.rows.length > 0) {
        let newDesc = summaryRes.rows[0].description || '';
        // If it already has buffs, just add a comma or newline without repeating the prefix too much
        if (newDesc.includes('🚀 [BUFFS]:')) {
          newDesc = newDesc.replace('🚀 [BUFFS]:', `🚀 [BUFFS]: ${item.name} (${bonusDesc}), `);
        } else {
          newDesc += `\n\n🚀 [BUFFS]: ${item.name} (${bonusDesc})`;
        }
        
        await query(`
          UPDATE daily_summaries 
          SET description = $1
          WHERE id = $2
        `, [newDesc, summaryRes.rows[0].id]);
      } else {
        await query(`
          INSERT INTO daily_summaries (user_id, date, title, description)
          VALUES ($1, $2, 'Preparación para el Combate', '¡He activado un ' || $3 || '! (' || $4 || ' durante ' || $5 || ')')
        `, [userId, today, item.name, bonusDesc, durationDesc]);
      }
    } catch (socialErr) {
      console.error('Error updating social feed for consumable:', socialErr);
    }

    await query('COMMIT');

    // Mission: Use Consumable
    await updateMissionProgress(userId, 'use_consumable', 1);

    res.json({ 
      message: `${item.name} activado con éxito`, 
      bonus: bonusValue,
      expiry: new Date(Date.now() + durationSeconds * 1000)
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error activating consumable:', error);
    res.status(500).json({ message: 'Error al activar el consumible' });
  }
});

// Buy chest (coins or gems depending on chest type)
router.post('/buy-chest/:type', authenticate, async (req, res) => {
  const type = req.params.type; // normal, epic, legendary
  const userId = req.user.id;

  const chestPricing = {
    normal: { amount: 1000, currency: 'coins' },
    epic: { amount: 25, currency: 'gems' },
    legendary: { amount: 60, currency: 'gems' }
  };

  const pricing = chestPricing[type];
  if (!pricing) return res.status(400).json({ message: 'Invalid chest type' });

  try {
    const userRes = await query('SELECT reppy_coins, reppy_gems FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    if (pricing.currency === 'coins' && user.reppy_coins < pricing.amount) {
      return res.status(400).json({ message: 'INSUFFICIENT COINS' });
    }

    if (pricing.currency === 'gems' && user.reppy_gems < pricing.amount) {
      return res.status(400).json({ message: 'INSUFFICIENT GEMS' });
    }

    await query('BEGIN');
    
    let column = 'boss_chests';
    if (type === 'epic') column = 'epic_chests';
    if (type === 'legendary') column = 'legendary_chests';

    if (pricing.currency === 'coins') {
      await query(`UPDATE users SET ${column} = ${column} + 1, reppy_coins = reppy_coins - $1 WHERE id = $2`, [pricing.amount, userId]);
    } else {
      await query(`UPDATE users SET ${column} = ${column} + 1, reppy_gems = reppy_gems - $1 WHERE id = $2`, [pricing.amount, userId]);
      await query(`
        INSERT INTO gem_transactions (user_id, amount, source, description)
        VALUES ($1, $2, 'SHOP', $3)
      `, [userId, -pricing.amount, `Purchased ${type} chest`]);
    }

    await query('COMMIT');

    res.json({
      message: 'Chest purchased successfully',
      remaining_coins: pricing.currency === 'coins' ? user.reppy_coins - pricing.amount : user.reppy_coins,
      remaining_gems: pricing.currency === 'gems' ? user.reppy_gems - pricing.amount : user.reppy_gems
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error buying chest:', error);
    res.status(500).json({ message: 'Error processing chest purchase' });
  }
});

export default router;

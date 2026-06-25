import express from 'express';
import { query, withTransaction } from './db.js';
import { authenticate } from './middleware.js';
import { recalculateUserStats } from './utils/stats.js';
import { updateMissionProgress } from './utils/missions.js';
import { rotateDailyShop } from './utils/shop_rotation.js';
import { getPerkBonuses } from './utils/perks.js';


const router = express.Router();

// Helper to get current roulette ticket price
async function getRouletteTicketPrice(userId, basePrice) {
  const userRes = await query('SELECT roulette_tickets_bought_today, last_roulette_ticket_bought_at FROM users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) return basePrice;
  
  const user = userRes.rows[0];
  let boughtToday = user.roulette_tickets_bought_today || 0;
  const lastBought = user.last_roulette_ticket_bought_at;
  
  // Check if reset is needed (if last bought was on a different day)
  if (lastBought) {
    const lastDate = new Date(lastBought).toDateString();
    const today = new Date().toDateString();
    if (lastDate !== today) {
      boughtToday = 0;
    }
  }
  
  // Price = base * 2^boughtToday
  return basePrice * Math.pow(2, boughtToday);
}

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
    
    const shopItems = await Promise.all(itemsRes.rows.map(async (item, index) => {
      const invData = inventoryMap[item.id] || { owned: false, is_new: false, quantity: 0 };
      
      let finalPriceGems = item.price_gems;
      if (item.name === 'Ticket de Ruleta') {
        finalPriceGems = await getRouletteTicketPrice(req.user.id, item.price_gems || 5);
      }

      return {
        ...item,
        price_gems: finalPriceGems,
        owned: invData.owned,
        is_new: invData.is_new,
        quantity: invData.quantity,
        roadmap_position: index + 1,
        unlock_at: item.created_at,
        is_unlocked: true,
        seconds_until_unlock: 0
      };
    }));
    
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
             i.price as item_price, i.price_gems as item_price_gems,
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
               i.price as item_price, i.price_gems as item_price_gems,
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

    // Map deals to ensure stats are objects and fix stale 0-price entries
    const deals = dailyRes.rows.map(item => {
      let parsedStats = item.stats;
      if (typeof item.stats === 'string') {
        try { parsedStats = JSON.parse(item.stats); } catch(e) { parsedStats = {}; }
      }

      // If this deal has both discounted prices at 0 but the item has a real base price,
      // the entry was created when the item was mispriced. Fix in DB and in the response.
      let discountedPrice = item.discounted_price || 0;
      let discountedGems = item.discounted_gems || 0;
      if (!item.reward_type && discountedPrice === 0 && discountedGems === 0) {
        const basePrice = item.item_price || 0;
        const baseGems  = item.item_price_gems || 0;
        if (basePrice > 0 || baseGems > 0) {
          discountedPrice = Math.floor(basePrice * 0.8);
          discountedGems  = Math.floor(baseGems  * 0.8);
          // Persist fix so subsequent fetches also show the correct price
          query(
            'UPDATE daily_shop_items SET discounted_price = $1, discounted_gems = $2 WHERE id = $3',
            [discountedPrice, discountedGems, item.deal_id]
          ).catch(err => console.error('[SHOP] Failed to fix stale 0-price deal', item.deal_id, err));
        }
      }

      return { ...item, stats: parsedStats || {}, discounted_price: discountedPrice, discounted_gems: discountedGems };
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

    const result = await withTransaction(async (client) => {
      // ATOMIC CLAIM GATE — same shape as the mission claim. The guarded UPDATE
      // flips is_claimed false->true and returns the reward only if this caller
      // wins the row lock. Concurrent spam of this endpoint matches 0 rows on
      // every loser, so the free reward is paid out exactly once.
      const claimRes = await client.query(`
        UPDATE daily_shop_items
        SET is_claimed = TRUE
        WHERE id = $1 AND user_id = $2
          AND is_claimed = FALSE
          AND reward_type IS NOT NULL
        RETURNING reward_type, reward_amount
      `, [dealId, userId]);

      if (claimRes.rowCount === 0) {
        // Did not win — disambiguate, grant nothing.
        const stateRes = await client.query(
          'SELECT is_claimed, reward_type FROM daily_shop_items WHERE id = $1 AND user_id = $2',
          [dealId, userId]
        );
        if (stateRes.rowCount === 0) return { status: 404, body: { message: 'DEAL NOT FOUND' } };
        if (!stateRes.rows[0].reward_type) return { status: 400, body: { message: 'NOT A FREE REWARD' } };
        return { status: 400, body: { message: 'REWARD ALREADY CLAIMED' } };
      }

      const { reward_type: rewardType, reward_amount: rewardAmount } = claimRes.rows[0];

      if (rewardType === 'coins') {
        await client.query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [rewardAmount, userId]);
      } else if (rewardType === 'gems') {
        await client.query('UPDATE users SET reppy_gems = reppy_gems + $1 WHERE id = $2', [rewardAmount, userId]);
        await client.query(`
          INSERT INTO gem_transactions (user_id, amount, source, description)
          VALUES ($1, $2, 'SHOP_FREE', 'Daily Free Reward')
        `, [userId, rewardAmount]);
      }

      const userBalance = await client.query('SELECT reppy_coins, reppy_gems FROM users WHERE id = $1', [userId]);
      return {
        status: 200,
        body: {
          message: 'Reward claimed',
          type: rewardType,
          amount: rewardAmount,
          reppy_coins: userBalance.rows[0].reppy_coins,
          reppy_gems: userBalance.rows[0].reppy_gems
        }
      };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Error claiming daily reward:', error);
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

    // Guard: an item with no price in either currency is not for sale.
    // (Bundles you already own can still net to 0 via the refund logic below,
    // because their base price is > 0 — this only blocks misconfigured 0/0 items.)
    if ((item.price || 0) <= 0 && (item.price_gems || 0) <= 0) {
      return res.status(400).json({ message: 'ERROR: UNIT NOT AVAILABLE FOR PURCHASE' });
    }

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

    let price = isDailyDeal ? (dailyDealRes.rows[0].discounted_price || 0) : (item.price || 0);
    let priceGems = isDailyDeal ? (dailyDealRes.rows[0].discounted_gems || 0) : (item.price_gems || 0);

    // Safeguard: daily deal may have been created when the item was mispriced (price=0).
    // If the discounted prices are both 0 but the item now has a real base price,
    // recalculate the discount so we never allow a free purchase via a stale entry.
    if (isDailyDeal && price === 0 && priceGems === 0) {
      price     = Math.floor((item.price      || 0) * 0.8);
      priceGems = Math.floor((item.price_gems || 0) * 0.8);
    }

    // Special logic for Roulette Ticket
    if (item.name === 'Ticket de Ruleta') {
      priceGems = await getRouletteTicketPrice(userId, item.price_gems || 5);
    }

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

    const result = await withTransaction(async (client) => {
      // Lock the buyer's row so every economy op for this user serializes.
      // This closes the check-then-deduct race that let two concurrent buys
      // both pass the funds check and overspend into a negative balance.
      const lockRes = await client.query(
        'SELECT reppy_coins, reppy_gems FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      );
      if (lockRes.rowCount === 0) return { status: 404, body: { message: 'User not found' } };
      const balance = lockRes.rows[0];

      if (balance.reppy_coins < finalDeduction) {
        return { status: 400, body: { message: 'INSUFFICIENT FUNDS: REPPY COINS REQUIRED' } };
      }
      if (balance.reppy_gems < priceGems) {
        return { status: 400, body: { message: 'INSUFFICIENT GEMS: SECTOR MISSION COMPLETION REQUIRED' } };
      }

      if (item.type === 'bundle' && item.bundle_items) {
        const bundleItemIds = item.bundle_items.split(',').map(id => parseInt(id.trim()));
        for (const id of bundleItemIds) {
          await client.query(`
            INSERT INTO user_items (user_id, item_id, quantity)
            VALUES ($1, $2, 1)
            ON CONFLICT (user_id, item_id)
            DO UPDATE SET quantity = user_items.quantity + 1, is_new = TRUE
          `, [userId, id]);
        }

        await client.query(`
          INSERT INTO user_items (user_id, item_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, item_id) DO NOTHING
        `, [userId, itemId]);
      } else {
        if (item.type === 'consumable' && inventoryRes.rows.length > 0) {
          await client.query('UPDATE user_items SET quantity = quantity + 1, is_new = TRUE WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
        } else {
          await client.query(`
            INSERT INTO user_items (user_id, item_id, quantity)
            VALUES ($1, $2, 1)
            ON CONFLICT (user_id, item_id)
            DO UPDATE SET quantity = user_items.quantity + 1, is_new = TRUE
          `, [userId, itemId]);
        }
      }

      // Guarded deduction — even if the checks above were somehow stale, the
      // WHERE clause refuses to drive either balance negative. rowCount === 0
      // means we lost a race for the funds; throwing rolls back the item grant.
      const deductRes = await client.query(
        `UPDATE users SET reppy_coins = reppy_coins - $1, reppy_gems = reppy_gems - $2
         WHERE id = $3 AND reppy_coins >= $1 AND reppy_gems >= $2
         RETURNING reppy_coins, reppy_gems`,
        [finalDeduction, priceGems, userId]
      );
      if (deductRes.rowCount === 0) {
        throw new Error('Insufficient balance at deduction time');
      }

      // Update ticket tracking if applicable
      if (item.name === 'Ticket de Ruleta') {
        await client.query(`
          UPDATE users
          SET roulette_tickets_bought_today = CASE
              WHEN last_roulette_ticket_bought_at::date = CURRENT_DATE THEN roulette_tickets_bought_today + 1
              ELSE 1
          END,
          last_roulette_ticket_bought_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [userId]);
      }

      if (priceGems > 0) {
        await client.query(`
          INSERT INTO gem_transactions (user_id, amount, source, description)
          VALUES ($1, $2, 'SHOP', $3)
        `, [userId, -priceGems, `Purchased ${item.name}`]);
      }

      return {
        status: 200,
        body: {
          message: 'Purchase successful',
          remaining_coins: deductRes.rows[0].reppy_coins,
          remaining_gems: deductRes.rows[0].reppy_gems,
          refunded: price - finalDeduction
        }
      };
    });

    if (result.status === 200) {
      // Mission Triggers (separate rows; run after commit)
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
    }

    return res.status(result.status).json(result.body);
  } catch (error) {
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

    // potion_master perk extends consumable buff duration.
    const perkRes = await query('SELECT skill_perks FROM users WHERE id = $1', [userId]);
    const { potionDur } = getPerkBonuses(perkRes.rows[0]?.skill_perks);
    const durationSeconds = Math.round((item.stats.duration || 3600) * (1 + potionDur));

    const result = await withTransaction(async (client) => {
      // ATOMIC CONSUME FIRST. The guarded decrement is the gate: a unit must be
      // spent before any buff is granted, so spamming activate can never apply
      // the buff more times than units owned, nor drive quantity negative.
      const consumeRes = await client.query(
        `UPDATE user_items SET quantity = quantity - 1
         WHERE user_id = $1 AND item_id = $2 AND quantity > 0
         RETURNING quantity`,
        [userId, itemId]
      );
      if (consumeRes.rowCount === 0) {
        return { status: 403, body: { message: 'No tienes este objeto en tu inventario' } };
      }
      // Clean up empty stacks.
      if (consumeRes.rows[0].quantity <= 0) {
        await client.query('DELETE FROM user_items WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
      }

      // Map the consumable's stats onto the two buff mechanics the engine
      // applies: temporary per-stat level bonuses (stat_buffs JSONB, read by
      // augmentUserWithLevels) and a global damage multiplier. This is what makes
      // the activated effect actually match the stats shown on the item.
      const STAT_KEYS = ['str', 'dex', 'end', 'vig', 'int', 'fth'];
      const STAT_LABELS = { str: 'FUE', dex: 'DES', end: 'RES', vig: 'VIG', int: 'INT', fth: 'FE' };

      const statBonuses = {};
      for (const k of STAT_KEYS) {
        // Accept both the plain key (e.g. `dex`) and the legacy `${k}_bonus` key.
        const v = (Number(item.stats[k]) || 0) + (Number(item.stats[`${k}_bonus`]) || 0);
        if (v > 0) statBonuses[k] = v;
      }
      const multiplier = Number(item.stats.multiplier) || Number(item.stats.damage_multiplier) || 0;

      const expiryIso = new Date(Date.now() + durationSeconds * 1000).toISOString();
      const descParts = [];

      if (Object.keys(statBonuses).length > 0) {
        const buffPayload = {};
        for (const [stat, value] of Object.entries(statBonuses)) {
          buffPayload[stat] = { value, expiry: expiryIso };
          descParts.push(`${STAT_LABELS[stat]} +${value}`);
        }
        // Merge so a still-running buff on a different stat survives this drink.
        await client.query(
          `UPDATE users SET stat_buffs = COALESCE(stat_buffs, '{}'::jsonb) || $2::jsonb WHERE id = $1`,
          [userId, JSON.stringify(buffPayload)]
        );
      }

      if (multiplier > 1) {
        await client.query(
          `UPDATE users SET damage_multiplier = $2, damage_multiplier_expiry = NOW() + INTERVAL '1 second' * $3 WHERE id = $1`,
          [userId, multiplier, durationSeconds]
        );
        descParts.push(`Daño x${multiplier}`);
      }

      // Fallback so a misconfigured consumable still grants something visible.
      if (descParts.length === 0) {
        await client.query(
          `UPDATE users SET damage_multiplier = 1.5, damage_multiplier_expiry = NOW() + INTERVAL '1 second' * $2 WHERE id = $1`,
          [userId, durationSeconds]
        );
        descParts.push('Daño x1.5');
      }

      const bonusDesc = descParts.join(', ');
      const bonusValue = descParts.join(' · ');

      // Post to social feed (best-effort). A SAVEPOINT keeps a failure here from
      // poisoning the transaction: in Postgres any error aborts the whole tx, so
      // we must roll back to the savepoint to let the consume/buff still commit.
      await client.query('SAVEPOINT social_feed');
      try {
        const today = new Date().toISOString().split('T')[0];
        const durationDesc = durationSeconds >= 3600 ? `${Math.floor(durationSeconds/3600)}h` : `${Math.floor(durationSeconds/60)}m`;
        const summaryRes = await client.query('SELECT id, description FROM daily_summaries WHERE user_id = $1 AND date = $2', [userId, today]);
        if (summaryRes.rows.length > 0) {
          let newDesc = summaryRes.rows[0].description || '';
          if (newDesc.includes('🚀 [BUFFS]:')) {
            newDesc = newDesc.replace('🚀 [BUFFS]:', `🚀 [BUFFS]: ${item.name} (${bonusDesc}), `);
          } else {
            newDesc += `\n\n🚀 [BUFFS]: ${item.name} (${bonusDesc})`;
          }
          await client.query('UPDATE daily_summaries SET description = $1 WHERE id = $2', [newDesc, summaryRes.rows[0].id]);
        } else {
          await client.query(`
            INSERT INTO daily_summaries (user_id, date, title, description)
            VALUES ($1, $2, 'Preparación para el Combate', '¡He activado un ' || $3 || '! (' || $4 || ' durante ' || $5 || ')')
          `, [userId, today, item.name, bonusDesc, durationDesc]);
        }
      } catch (socialErr) {
        await client.query('ROLLBACK TO SAVEPOINT social_feed');
        console.error('Error updating social feed for consumable:', socialErr);
      }

      return {
        status: 200,
        body: {
          message: `${item.name} activado con éxito`,
          bonus: bonusValue,
          expiry: new Date(Date.now() + durationSeconds * 1000)
        }
      };
    });

    if (result.status === 200) {
      // Mission: Use Consumable (separate row; run after commit)
      await updateMissionProgress(userId, 'use_consumable', 1);
    }

    return res.status(result.status).json(result.body);
  } catch (error) {
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

  let column = 'boss_chests';
  if (type === 'epic') column = 'epic_chests';
  if (type === 'legendary') column = 'legendary_chests';

  try {
    const result = await withTransaction(async (client) => {
      // Lock the buyer's row so concurrent chest buys serialize against each
      // other (and against /buy), then deduct with a guard so the balance can
      // never go negative even if two requests interleave.
      const lockRes = await client.query('SELECT reppy_coins, reppy_gems FROM users WHERE id = $1 FOR UPDATE', [userId]);
      if (lockRes.rowCount === 0) return { status: 404, body: { message: 'User not found' } };
      const balance = lockRes.rows[0];

      if (pricing.currency === 'coins' && balance.reppy_coins < pricing.amount) {
        return { status: 400, body: { message: 'INSUFFICIENT COINS' } };
      }
      if (pricing.currency === 'gems' && balance.reppy_gems < pricing.amount) {
        return { status: 400, body: { message: 'INSUFFICIENT GEMS' } };
      }

      let deductRes;
      if (pricing.currency === 'coins') {
        deductRes = await client.query(
          `UPDATE users SET ${column} = ${column} + 1, reppy_coins = reppy_coins - $1
           WHERE id = $2 AND reppy_coins >= $1
           RETURNING reppy_coins, reppy_gems`,
          [pricing.amount, userId]
        );
      } else {
        deductRes = await client.query(
          `UPDATE users SET ${column} = ${column} + 1, reppy_gems = reppy_gems - $1
           WHERE id = $2 AND reppy_gems >= $1
           RETURNING reppy_coins, reppy_gems`,
          [pricing.amount, userId]
        );
      }
      if (deductRes.rowCount === 0) {
        throw new Error('Insufficient balance at deduction time');
      }

      if (pricing.currency === 'gems') {
        await client.query(`
          INSERT INTO gem_transactions (user_id, amount, source, description)
          VALUES ($1, $2, 'SHOP', $3)
        `, [userId, -pricing.amount, `Purchased ${type} chest`]);
      }

      return {
        status: 200,
        body: {
          message: 'Chest purchased successfully',
          remaining_coins: deductRes.rows[0].reppy_coins,
          remaining_gems: deductRes.rows[0].reppy_gems
        }
      };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Error buying chest:', error);
    res.status(500).json({ message: 'Error processing chest purchase' });
  }
});

export default router;

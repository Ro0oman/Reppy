import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';
import { recalculateUserStats } from './utils/stats.js';
import { updateMissionProgress } from './utils/missions.js';


const router = express.Router();
// Get available items
router.get('/cosmetics', authenticate, async (req, res) => {
  try {
    // Show all items (seasonal included)
    const itemsRes = await query(`
      SELECT i.* 
      FROM items i
      LEFT JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = $1
      WHERE i.type IN ('head', 'weapon', 'armor', 'boots', 'consumable', 'bundle', 'title', 'border', 'background', 'post_background', 'avatar')
      ORDER BY i.is_customizable ASC, i.type ASC, i.id ASC
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

// Get daily shop items
router.get('/daily', authenticate, async (req, res) => {
  try {
    const dailyRes = await query(`
      SELECT d.*, i.name, i.description, i.rarity, i.type, i.image_url, i.svg_key,
             EXISTS(SELECT 1 FROM user_items WHERE user_id = $1 AND item_id = i.id) as owned
      FROM daily_shop_items d
      JOIN items i ON d.item_id = i.id
    `, [req.user.id]);
    
    // Fixed chests with gem prices
    const chests = [
      { id: 'normal', name: 'Cofre de Batalla', rarity: 'common', price_gems: 10, type: 'chest', description: 'Contiene 1-3 objetos aleatorios y oro.' },
      { id: 'epic', name: 'Cofre Épico', rarity: 'especial', price_gems: 25, type: 'chest', description: 'Garantiza al menos un objeto ÉPICO.' },
      { id: 'legendary', name: 'Cofre Legendario', rarity: 'legendary', price_gems: 60, type: 'chest', description: 'Garantiza al menos un objeto LEGENDARIO.' }
    ];

    const nextRotationRes = await query('SELECT rotated_at FROM daily_shop_items LIMIT 1');
    let nextRotation = null;
    if (nextRotationRes.rows.length > 0) {
      const rotatedAt = new Date(nextRotationRes.rows[0].rotated_at);
      nextRotation = new Date(rotatedAt.getTime() + 24 * 60 * 60 * 1000);
    }

    res.json({
      deals: dailyRes.rows,
      chests,
      next_rotation: nextRotation
    });
  } catch (error) {
    console.error('Error fetching daily shop:', error);
    res.status(500).json({ message: 'Error fetching daily shop' });
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

    // Check if it's a daily deal for discount
    const dailyDealRes = await query('SELECT * FROM daily_shop_items WHERE item_id = $1', [itemId]);
    const isDailyDeal = dailyDealRes.rows.length > 0;

    if (item.is_seasonal && !isDailyDeal) {
      return res.status(400).json({ message: 'ERROR: SEASONAL UNIT - ACQUISITION VIA EVENT ONLY' });
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
    const inventoryRes = await query('SELECT * FROM user_items WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
    if (inventoryRes.rows.length === 0) return res.status(403).json({ message: 'You do not own this item' });
    
    const itemRes = await query('SELECT type FROM items WHERE id = $1', [itemId]);
    const type = itemRes.rows[0].type;
    
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

    const column = slotMap[type];
    if (column) {
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

// Buy chest with gems
router.post('/buy-chest/:type', authenticate, async (req, res) => {
  const type = req.params.type; // normal, epic, legendary
  const userId = req.user.id;

  const chestPrices = {
    normal: 10,
    epic: 25,
    legendary: 60
  };

  const price = chestPrices[type];
  if (!price) return res.status(400).json({ message: 'Invalid chest type' });

  try {
    const userRes = await query('SELECT reppy_gems FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    if (user.reppy_gems < price) {
      return res.status(400).json({ message: 'INSUFFICIENT GEMS' });
    }

    await query('BEGIN');
    
    let column = 'boss_chests';
    if (type === 'epic') column = 'epic_chests';
    if (type === 'legendary') column = 'legendary_chests';

    await query(`UPDATE users SET ${column} = ${column} + 1, reppy_gems = reppy_gems - $1 WHERE id = $2`, [price, userId]);
    
    await query(`
      INSERT INTO gem_transactions (user_id, amount, source, description)
      VALUES ($1, $2, 'SHOP', $3)
    `, [userId, -price, `Purchased ${type} chest`]);

    await query('COMMIT');

    res.json({ message: 'Chest purchased successfully', remaining_gems: user.reppy_gems - price });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error buying chest:', error);
    res.status(500).json({ message: 'Error processing chest purchase' });
  }
});

export default router;

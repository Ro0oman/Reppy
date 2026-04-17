import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';
import { trackCoinTransaction } from './utils/transactions.js';

const router = express.Router();
// Get available cosmetics
router.get('/cosmetics', authenticate, async (req, res) => {
  try {
    // Show all items (seasonal included)
    const cosmeticsRes = await query(`
      SELECT c.* 
      FROM cosmetics c
      LEFT JOIN user_inventory ui ON c.id = ui.cosmetic_id AND ui.user_id = $1
      ORDER BY c.price ASC, c.id ASC
    `, [req.user.id]);
    const inventoryRes = await query('SELECT cosmetic_id, is_new FROM user_inventory WHERE user_id = $1', [req.user.id]);
    
    const inventoryMap = {};
    inventoryRes.rows.forEach(row => {
      inventoryMap[row.cosmetic_id] = { owned: true, is_new: row.is_new };
    });
    
    const shopItems = cosmeticsRes.rows.map((item, index) => {
      const invData = inventoryMap[item.id] || { owned: false, is_new: false };
      return {
        ...item,
        owned: invData.owned,
        is_new: invData.is_new,
        roadmap_position: index + 1,
        unlock_at: item.created_at,
        is_unlocked: true,
        seconds_until_unlock: 0
      };
    });
    
    res.json(shopItems);
  } catch (error) {
    console.error('Error fetching cosmetics:', error);
    res.status(500).json({ message: 'Error fetching cosmetics' });
  }
});

// Mark cosmetic as seen
router.post('/mark-seen/:id', authenticate, async (req, res) => {
  const cosmeticId = parseInt(req.params.id);
  const userId = req.user.id;
  try {
    await query('UPDATE user_inventory SET is_new = FALSE WHERE user_id = $1 AND cosmetic_id = $2', [userId, cosmeticId]);
    res.json({ message: 'Marked as seen' });
  } catch (error) {
    console.error('Error marking as seen:', error);
    res.status(500).json({ message: 'Error marking as seen' });
  }
});

// Buy cosmetic
router.post('/buy/:id', authenticate, async (req, res) => {
  const cosmeticId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    // Determine cost and users coins
    const cosmeticRes = await query('SELECT * FROM cosmetics WHERE id = $1', [cosmeticId]);
    if (cosmeticRes.rows.length === 0) return res.status(404).json({ message: 'Cosmetic not found' });
    const item = cosmeticRes.rows[0];

    const userRes = await query('SELECT reppy_coins FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    // Check inventory
    const inventoryRes = await query('SELECT * FROM user_inventory WHERE user_id = $1 AND cosmetic_id = $2', [userId, cosmeticId]);
    if (inventoryRes.rows.length > 0) {
      return res.status(400).json({ message: 'UNIT DETECTED: PROTOCOL ALREADY ACQUIRED' });
    }

    if (item.is_seasonal) {
      return res.status(400).json({ message: 'ERROR: SEASONAL UNIT - ACQUISITION VIA EVENT ONLY' });
    }

    if (user.reppy_coins < item.price) {
      return res.status(400).json({ message: 'INSUFFICIENT FUNDS: REPPY COINS REQUIRED' });
    }

    // Process Purchase
    await query('BEGIN');
    
    if (item.type === 'bundle' && item.bundle_items) {
      // Handle Bundle Purchase
      const itemIds = item.bundle_items.split(',').map(id => parseInt(id.trim()));
      
      // Add all items in bundle to inventory
      for (const id of itemIds) {
        // Check if user already has it (skip if so, but bundle allows buying even if partial items owned)
        const checkInv = await query('SELECT * FROM user_inventory WHERE user_id = $1 AND cosmetic_id = $2', [userId, id]);
        if (checkInv.rows.length === 0) {
          await query('INSERT INTO user_inventory (user_id, cosmetic_id) VALUES ($1, $2)', [userId, id]);
        }
      }
      
      // Also add the bundle itself to inventory so we know they bought it
      await query('INSERT INTO user_inventory (user_id, cosmetic_id) VALUES ($1, $2)', [userId, cosmeticId]);
    } else {
      // Regular Item Purchase
      await query('INSERT INTO user_inventory (user_id, cosmetic_id) VALUES ($1, $2)', [userId, cosmeticId]);
    }

    await query('UPDATE users SET reppy_coins = reppy_coins - $1 WHERE id = $2', [item.price, userId]);
    
    // Log the transaction (negative amount)
    await trackCoinTransaction(userId, -item.price, 'PURCHASE', `Compra de: ${item.name}`);
    
    await query('COMMIT');

    res.json({ message: 'Purchase successful', remaining_coins: user.reppy_coins - item.price });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error purchasing cosmetic:', error);
    res.status(500).json({ message: 'Error processing purchase' });
  }
});

// Equip cosmetic
router.post('/equip/:id', authenticate, async (req, res) => {
  const cosmeticId = parseInt(req.params.id);
  const typeParam = req.query.type;
  const userId = req.user.id;

  try {
    if (cosmeticId === 0) {
      if (typeParam === 'title') {
        await query('UPDATE users SET equipped_title_id = NULL WHERE id = $1', [userId]);
      } else if (typeParam === 'border') {
        await query('UPDATE users SET equipped_border_id = NULL WHERE id = $1', [userId]);
      } else if (typeParam === 'avatar') {
        await query('UPDATE users SET equipped_avatar_id = NULL WHERE id = $1', [userId]);
      } else if (typeParam === 'background') {
        await query('UPDATE users SET equipped_background_id = NULL WHERE id = $1', [userId]);
      } else if (typeParam === 'post_background') {
        await query('UPDATE users SET equipped_post_background_id = NULL WHERE id = $1', [userId]);
      }
      return res.json({ message: 'Un-equipped successfully' });
    }

    // Check ownership
    const inventoryRes = await query('SELECT * FROM user_inventory WHERE user_id = $1 AND cosmetic_id = $2', [userId, cosmeticId]);
    if (inventoryRes.rows.length === 0) return res.status(403).json({ message: 'You do not own this item' });
    
    const cosmeticRes = await query('SELECT type FROM cosmetics WHERE id = $1', [cosmeticId]);
    const type = cosmeticRes.rows[0].type;
    
    if (type === 'title') {
      await query('UPDATE users SET equipped_title_id = $1 WHERE id = $2', [cosmeticId, userId]);
    } else if (type === 'border') {
      await query('UPDATE users SET equipped_border_id = $1 WHERE id = $2', [cosmeticId, userId]);
    } else if (type === 'avatar') {
      await query('UPDATE users SET equipped_avatar_id = $1 WHERE id = $2', [cosmeticId, userId]);
    } else if (type === 'background') {
      await query('UPDATE users SET equipped_background_id = $1 WHERE id = $2', [cosmeticId, userId]);
    } else if (type === 'post_background') {
      await query('UPDATE users SET equipped_post_background_id = $1 WHERE id = $2', [cosmeticId, userId]);
    }

    res.json({ message: 'Equipped successfully' });
  } catch (error) {
    console.error('Error equipping cosmetic:', error);
    res.status(500).json({ message: 'Error equipping cosmetic' });
  }
});


export default router;

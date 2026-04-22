import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';


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
    const inventoryRes = await query('SELECT cosmetic_id, is_new, quantity FROM user_inventory WHERE user_id = $1', [req.user.id]);
    
    const inventoryMap = {};
    inventoryRes.rows.forEach(row => {
      inventoryMap[row.cosmetic_id] = { owned: true, is_new: row.is_new, quantity: row.quantity || 1 };
    });
    
    const shopItems = cosmeticsRes.rows.map((item, index) => {
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
    if (inventoryRes.rows.length > 0 && item.type !== 'consumable') {
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
      // Regular Item Purchase OR Consumable
      if (item.type === 'consumable' && inventoryRes.rows.length > 0) {
        await query('UPDATE user_inventory SET quantity = quantity + 1, is_new = TRUE WHERE user_id = $1 AND cosmetic_id = $2', [userId, cosmeticId]);
      } else {
        await query('INSERT INTO user_inventory (user_id, cosmetic_id, quantity) VALUES ($1, $2, 1)', [userId, cosmeticId]);
      }
    }

    await query('UPDATE users SET reppy_coins = reppy_coins - $1 WHERE id = $2', [item.price, userId]);
    
    
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


// Activate consumable
router.post('/activate/:id', authenticate, async (req, res) => {
  const cosmeticId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const itemRes = await query('SELECT * FROM cosmetics WHERE id = $1', [cosmeticId]);
    if (itemRes.rows.length === 0) return res.status(404).json({ message: 'Item no encontrado' });
    const item = itemRes.rows[0];

    if (item.type !== 'consumable') {
      return res.status(400).json({ message: 'Este objeto no es un consumible' });
    }

    // Check ownership and quantity
    const invRes = await query('SELECT * FROM user_inventory WHERE user_id = $1 AND cosmetic_id = $2', [userId, cosmeticId]);
    if (invRes.rows.length === 0 || invRes.rows[0].quantity <= 0) {
      return res.status(403).json({ message: 'No tienes este objeto en tu inventario' });
    }

    const multiplier = parseFloat(item.css_value) || 1.5;

    await query('BEGIN');

    // 1. Update user bonus (Resetting the 24h timer)
    await query(`
      UPDATE users 
      SET damage_multiplier = $1, 
          damage_multiplier_expiry = CURRENT_TIMESTAMP + INTERVAL '24 hours' 
      WHERE id = $2
    `, [multiplier, userId]);

    // 2. Consume item
    if (invRes.rows[0].quantity > 1) {
      await query('UPDATE user_inventory SET quantity = quantity - 1 WHERE user_id = $1 AND cosmetic_id = $2', [userId, cosmeticId]);
    } else {
      await query('DELETE FROM user_inventory WHERE user_id = $1 AND cosmetic_id = $2', [userId, cosmeticId]);
    }

    // 3. Post to social feed (Optional: simplified as description update or standalone)
    try {
      const today = new Date().toISOString().split('T')[0];
      const summaryRes = await query('SELECT id FROM daily_summaries WHERE user_id = $1 AND date = $2', [userId, today]);
      if (summaryRes.rows.length > 0) {
        await query(`
          UPDATE daily_summaries 
          SET description = COALESCE(description, '') || '\n\n🚀 [POTENCIADOR ACTIVADO]: ' || $1 || ' (Bonus x' || $2 || ' durante 24h)'
          WHERE id = $3
        `, [item.name, multiplier, summaryRes.rows[0].id]);
      } else {
        await query(`
          INSERT INTO daily_summaries (user_id, date, title, description)
          VALUES ($1, $2, 'Preparación para el Combate', '¡He activado un ' || $3 || '! Daño x' || $4 || ' durante las próximas 24 horas.')
        `, [userId, today, item.name, multiplier]);
      }
    } catch (socialErr) {
      console.error('Error updating social feed for consumable:', socialErr);
    }

    await query('COMMIT');

    res.json({ 
      message: `${item.name} activado con éxito`, 
      multiplier,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error activating consumable:', error);
    res.status(500).json({ message: 'Error al activar el consumible' });
  }
});

export default router;

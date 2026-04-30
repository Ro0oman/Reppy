import express from 'express';
import { query } from './db.js';
import { authenticate, optionalAuthenticate } from './middleware.js';

// Helper to get current roulette ticket price
async function getRouletteTicketPrice(userId, basePrice = 5) {
  const userRes = await query('SELECT roulette_tickets_bought_today, last_roulette_ticket_bought_at FROM users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) return basePrice;
  
  const user = userRes.rows[0];
  let boughtToday = user.roulette_tickets_bought_today || 0;
  const lastBought = user.last_roulette_ticket_bought_at;
  
  if (lastBought) {
    const lastDate = new Date(lastBought).toDateString();
    const today = new Date().toDateString();
    if (lastDate !== today) {
      boughtToday = 0;
    }
  }
  
  return basePrice * Math.pow(2, boughtToday);
}


const router = express.Router();

// Get roulette status (can the user spin today?)
router.get('/status', optionalAuthenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ canSpin: false });
    }

    const userRes = await query(`
      SELECT last_spin_at, 
      (last_spin_at AT TIME ZONE 'UTC')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date as already_spun
      FROM users WHERE id = $1
    `, [req.user.id]);

    const row = userRes.rows[0];
    const alreadySpun = row.last_spin_at && row.already_spun;
    
    // Check for tickets
    const ticketRes = await query(`
      SELECT quantity 
      FROM user_items ui
      JOIN items i ON ui.item_id = i.id
      WHERE ui.user_id = $1 AND i.name = 'Ticket de Ruleta'
    `, [req.user.id]);
    
    const ticketCount = ticketRes.rows.length > 0 ? ticketRes.rows[0].quantity : 0;
    const canSpin = !alreadySpun || ticketCount > 0;
    const extraSpinCost = await getRouletteTicketPrice(req.user.id);

    res.json({ 
      canSpin,
      hasTicket: ticketCount > 0,
      ticketCount,
      extraSpinCost,
      lastSpinAt: row.last_spin_at 
    });
  } catch (error) {
    console.error('Error checking roulette status:', error);
    res.status(500).json({ message: 'Error checking status' });
  }
});

// Spin the wheel
router.post('/spin', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Double check eligibility
    const userRes = await query(`
      SELECT last_spin_at, reppy_coins,
      (last_spin_at AT TIME ZONE 'UTC')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date as already_spun
      FROM users WHERE id = $1
    `, [userId]);
    
    const user = userRes.rows[0];
    const alreadySpun = user.last_spin_at && user.already_spun;
    let usingTicket = false;

    if (alreadySpun) {
      // Check for ticket
      const ticketRes = await query(`
        SELECT ui.item_id, ui.quantity 
        FROM user_items ui
        JOIN items i ON ui.item_id = i.id
        WHERE ui.user_id = $1 AND i.name = 'Ticket de Ruleta'
      `, [userId]);
      
      if (ticketRes.rows.length === 0 || ticketRes.rows[0].quantity <= 0) {
        return res.status(400).json({ message: 'Ya has girado la ruleta hoy. ¡Compra un Ticket de Ruleta para girar de nuevo!' });
      }
      usingTicket = true;
      const ticketId = ticketRes.rows[0].item_id;
      const ticketQuantity = ticketRes.rows[0].quantity;

      await query('BEGIN');
      if (ticketQuantity > 1) {
        await query('UPDATE user_items SET quantity = quantity - 1 WHERE user_id = $1 AND item_id = $2', [userId, ticketId]);
      } else {
        await query('DELETE FROM user_items WHERE user_id = $1 AND item_id = $2', [userId, ticketId]);
      }
    } else {
      await query('BEGIN');
    }

    // 2. Define Prizes with Weights
    const prizes = [
      { id: 0, value: 200, weight: 20, type: 'coins' },
      { id: 1, value: 400, weight: 15, type: 'coins' },
      { id: 2, value: 600, weight: 12, type: 'coins' },
      { id: 3, value: 800, weight: 10, type: 'coins' },
      { id: 4, value: 1000, weight: 8, type: 'coins' },
      { id: 5, value: 2000, weight: 4, type: 'coins' },
      { id: 10, value: 3, weight: 20, type: 'gems', label: '3 Gemas' },
      { id: 6, rarity: 'common', weight: 6, type: 'consumable', label: 'Poción de Fuerza (x1.5)' },
      { id: 7, type: 'chest', rarity: 'level', weight: 3, label: 'Cofre de Nivel' },
      { id: 8, type: 'chest', rarity: 'boss', weight: 1.5, label: 'Cofre de Boss' },
      { id: 9, type: 'chest', rarity: 'epic', weight: 0.5, label: 'Cofre Épico' }
    ];

    // Pick a prize
    const random = Math.random() * 100;
    let cumulativeWeight = 0;
    let selectedPrize = prizes[0];

    for (const p of prizes) {
      cumulativeWeight += p.weight;
      if (random <= cumulativeWeight) {
        selectedPrize = p;
        break;
      }
    }

    let result = { ...selectedPrize };
    
    // 3. Update last_spin_at (only if NOT using a ticket, otherwise we don't want to block the free spin if they somehow got a ticket before their free spin)
    // Actually, if they have a free spin, they should use it first.
    if (!usingTicket) {
      await query('UPDATE users SET last_spin_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
    }

    // 4. Process Prize
    if (selectedPrize.type === 'coins') {
      await query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [selectedPrize.value, userId]);

    } else if (selectedPrize.type === 'gems') {
      await query('UPDATE users SET reppy_gems = reppy_gems + $1 WHERE id = $2', [selectedPrize.value, userId]);
      await query(`
        INSERT INTO gem_transactions (user_id, amount, source, description)
        VALUES ($1, $2, 'roulette', 'Premio de la Ruleta Diaria')
      `, [userId, selectedPrize.value]);

    } else if (selectedPrize.type === 'chest') {
      if (selectedPrize.rarity === 'level') {
        await query('UPDATE users SET level_chests = level_chests + 1 WHERE id = $1', [userId]);
      } else if (selectedPrize.rarity === 'boss') {
        await query('UPDATE users SET boss_chests = boss_chests + 1 WHERE id = $1', [userId]);
      } else if (selectedPrize.rarity === 'epic') {
        await query('UPDATE users SET epic_chests = epic_chests + 1 WHERE id = $1', [userId]);
      }
    } else if (selectedPrize.type === 'consumable') {
      // Find the specific item ID
      // Find a common consumable as a prize
      const itemRes = await query(`
        SELECT id, name FROM items 
        WHERE type = 'consumable' AND rarity = 'common'
        ORDER BY RANDOM()
        LIMIT 1
      `);
      
      let item;
      if (itemRes.rows.length > 0) {
        item = itemRes.rows[0];
      } else {
        // Fallback to searching by rarity if explicit multiplier fails
        const fallbackRes = await query("SELECT id, name FROM items WHERE type = 'consumable' AND rarity = 'common' LIMIT 1");
        item = fallbackRes.rows[0];
      }

      if (item) {
        // Check if user already has it to update quantity
        const invRes = await query('SELECT * FROM user_items WHERE user_id = $1 AND item_id = $2', [userId, item.id]);
        
        if (invRes.rows.length > 0) {
          await query('UPDATE user_items SET quantity = quantity + 1, is_new = TRUE WHERE user_id = $1 AND item_id = $2', [userId, item.id]);
        } else {
          await query('INSERT INTO user_items (user_id, item_id, quantity) VALUES ($1, $2, 1)', [userId, item.id]);
        }
        
        result.item = item;
      } else {
        // Ultimate Fallback: 500 coins if nothing found
        await query('UPDATE users SET reppy_coins = reppy_coins + 500 WHERE id = $1', [userId]);

        result.type = 'coins';
        result.value = 500;
      }
    }

    await query('COMMIT');

    const finalUserRes = await query('SELECT reppy_coins, reppy_gems FROM users WHERE id = $1', [userId]);
    const finalUser = finalUserRes.rows[0];

    res.json({
      message: '¡Giro completado!',
      prize: result,
      new_coins: finalUser.reppy_coins,
      new_gems: finalUser.reppy_gems,
      extraSpinCost: await getRouletteTicketPrice(userId)
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error spinning roulette:', error);
    res.status(500).json({ message: 'Error al procesar el premio' });
  }
});

// Buy ticket and spin (all-in-one for UI convenience)
router.post('/buy-and-spin', authenticate, async (req, res) => {
  const userId = req.user.id;
  
  try {
    // 1. Get cost
    const cost = await getRouletteTicketPrice(userId);
    
    // 2. Check gems
    const userRes = await query('SELECT reppy_gems FROM users WHERE id = $1', [userId]);
    if (userRes.rows[0].reppy_gems < cost) {
      return res.status(400).json({ message: 'No tienes suficientes gemas para un giro extra' });
    }
    
    // 3. Find Ticket Item ID
    const itemRes = await query("SELECT id FROM items WHERE name = 'Ticket de Ruleta' LIMIT 1");
    if (itemRes.rows.length === 0) return res.status(500).json({ message: 'Ticket item not configured' });
    const itemId = itemRes.rows[0].id;
    
    // 4. Perform combined purchase and spin update
    await query('BEGIN');
    
    // Deduct gems
    await query('UPDATE users SET reppy_gems = reppy_gems - $1 WHERE id = $2', [cost, userId]);
    
    // Log transaction
    await query(`
      INSERT INTO gem_transactions (user_id, amount, source, description)
      VALUES ($1, $2, 'SHOP', 'Giro Extra Ruleta')
    `, [userId, -cost]);
    
    // Increment bought counter
    await query(`
      UPDATE users 
      SET roulette_tickets_bought_today = CASE 
          WHEN last_roulette_ticket_bought_at::date = CURRENT_DATE THEN roulette_tickets_bought_today + 1 
          ELSE 1 
      END,
      last_roulette_ticket_bought_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [userId]);
    
    // We DON'T update last_spin_at here because it was already set by the daily spin, 
    // and tickets allow bypassing the 'already_spun' check.
    
    await query('COMMIT');
    
    // Now just call the spin logic (refactored or duplicated for simplicity)
    // Actually, I'll just redirect to the spin logic internally if I could, 
    // but better to just trigger a normal spin from the frontend if they have a ticket.
    // WAIT: if they buy it here, they have 1 ticket.
    
    // Let's just grant the ticket and then the frontend can call /spin.
    // OR, I can do everything here. I'll do everything here to save a request.
    
    // ... Copy of spin logic ...
    // Define Prizes
    const prizes = [
      { id: 0, value: 200, weight: 20, type: 'coins' },
      { id: 1, value: 400, weight: 15, type: 'coins' },
      { id: 2, value: 600, weight: 12, type: 'coins' },
      { id: 3, value: 800, weight: 10, type: 'coins' },
      { id: 4, value: 1000, weight: 8, type: 'coins' },
      { id: 5, value: 2000, weight: 4, type: 'coins' },
      { id: 10, value: 3, weight: 20, type: 'gems', label: '3 Gemas' },
      { id: 6, rarity: 'common', weight: 6, type: 'consumable', label: 'Poción de Fuerza (x1.5)' },
      { id: 7, type: 'chest', rarity: 'level', weight: 3, label: 'Cofre de Nivel' },
      { id: 8, type: 'chest', rarity: 'boss', weight: 1.5, label: 'Cofre de Boss' },
      { id: 9, type: 'chest', rarity: 'epic', weight: 0.5, label: 'Cofre Épico' }
    ];

    const random = Math.random() * 100;
    let cumulativeWeight = 0;
    let selectedPrize = prizes[0];

    for (const p of prizes) {
      cumulativeWeight += p.weight;
      if (random <= cumulativeWeight) {
        selectedPrize = p;
        break;
      }
    }

    let result = { ...selectedPrize };
    
    await query('BEGIN');
    if (selectedPrize.type === 'coins') {
      await query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [selectedPrize.value, userId]);
    } else if (selectedPrize.type === 'gems') {
      await query('UPDATE users SET reppy_gems = reppy_gems + $1 WHERE id = $2', [selectedPrize.value, userId]);
      await query("INSERT INTO gem_transactions (user_id, amount, source, description) VALUES ($1, $2, 'roulette', 'Premio Ruleta Extra')", [userId, selectedPrize.value]);
    } else if (selectedPrize.type === 'chest') {
      const col = selectedPrize.rarity === 'level' ? 'level_chests' : (selectedPrize.rarity === 'boss' ? 'boss_chests' : 'epic_chests');
      await query(`UPDATE users SET ${col} = ${col} + 1 WHERE id = $1`, [userId]);
    } else if (selectedPrize.type === 'consumable') {
      const itemRes = await query("SELECT id, name FROM items WHERE type = 'consumable' AND rarity = 'common' ORDER BY RANDOM() LIMIT 1");
      if (itemRes.rows.length > 0) {
        const item = itemRes.rows[0];
        await query(`INSERT INTO user_items (user_id, item_id, quantity) VALUES ($1, $2, 1) ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = user_items.quantity + 1, is_new = TRUE`, [userId, item.id]);
        result.item = item;
      }
    }
    await query('COMMIT');

    const finalUser = (await query('SELECT reppy_coins, reppy_gems FROM users WHERE id = $1', [userId])).rows[0];
    res.json({
      message: '¡Giro extra completado!',
      prize: result,
      new_coins: finalUser.reppy_coins,
      new_gems: finalUser.reppy_gems,
      extraSpinCost: await getRouletteTicketPrice(userId)
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error in buy-and-spin:', error);
    res.status(500).json({ message: 'Error al procesar el giro extra' });
  }
});

export default router;

import express from 'express';
import { query } from './db.js';
import { authenticate, optionalAuthenticate } from './middleware.js';


const router = express.Router();

// Get roulette status (can the user spin today?)
router.get('/status', optionalAuthenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ canSpin: false });
    }

    const userRes = await query('SELECT last_spin_at FROM users WHERE id = $1', [req.user.id]);
    const lastSpin = userRes.rows[0].last_spin_at;

    if (!lastSpin) {
      return res.json({ canSpin: true });
    }

    const now = new Date();
    const lastSpinDate = new Date(lastSpin);

    // Reset daily at midnight in server time (or user time if we had it, but server time is safer)
    const canSpin = now.toDateString() !== lastSpinDate.toDateString();

    res.json({ 
      canSpin,
      lastSpinAt: lastSpin 
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
    const userRes = await query('SELECT last_spin_at, reppy_coins FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];
    const now = new Date();

    if (user.last_spin_at && new Date(user.last_spin_at).toDateString() === now.toDateString()) {
      return res.status(400).json({ message: 'Ya has girado la ruleta hoy. Vuelve mañana!' });
    }

    // 2. Define Prizes with Weights
    const prizes = [
      { id: 0, value: 200, weight: 25, type: 'coins' },
      { id: 1, value: 400, weight: 18, type: 'coins' },
      { id: 2, value: 600, weight: 15, type: 'coins' },
      { id: 3, value: 800, weight: 12, type: 'coins' },
      { id: 4, value: 1000, weight: 10, type: 'coins' },
      { id: 5, value: 2000, weight: 5, type: 'coins' },
      { id: 6, rarity: 'common', weight: 8, type: 'consumable', label: 'Poción de Fuerza (x1.5)' },
      { id: 7, type: 'chest', rarity: 'level', weight: 4, label: 'Cofre de Nivel' },
      { id: 8, type: 'chest', rarity: 'boss', weight: 2, label: 'Cofre de Boss' },
      { id: 9, type: 'chest', rarity: 'epic', weight: 1, label: 'Cofre Épico' }
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
    
    await query('BEGIN');

    // 3. Update last_spin_at
    await query('UPDATE users SET last_spin_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);

    // 4. Process Prize
    if (selectedPrize.type === 'coins') {
      await query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [selectedPrize.value, userId]);

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

    res.json({
      message: '¡Giro completado!',
      prize: result,
      new_balance: result.type === 'coins' ? user.reppy_coins + result.value : user.reppy_coins
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error spinning roulette:', error);
    res.status(500).json({ message: 'Error al procesar el premio' });
  }
});

export default router;

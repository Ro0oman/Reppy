import express from 'express';
import { query } from './db.js';
import { authenticate, optionalAuthenticate } from './middleware.js';
import { trackCoinTransaction } from './utils/transactions.js';

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

    // 2. Define Prized with Weights
    // Total weights = 100
    const prizes = [
      { id: 0, value: 20, weight: 25, type: 'coins' },
      { id: 1, value: 50, weight: 20, type: 'coins' },
      { id: 2, value: 100, weight: 15, type: 'coins' },
      { id: 3, value: 200, weight: 10, type: 'coins' },
      { id: 4, value: 400, weight: 5, type: 'coins' },
      { id: 5, value: 0, weight: 5, type: 'nothing', msg: 'Sigue entrenando!' },
      { id: 6, rarity: 'common', weight: 10, type: 'consumable', label: 'Poción Común (x1.5)' },
      { id: 7, rarity: 'rare', weight: 7, type: 'consumable', label: 'Poción Rara (x2.0)' },
      { id: 8, rarity: 'legendary', weight: 3, type: 'consumable', label: 'Poción Legendaria (x3.0)' }
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
      await trackCoinTransaction(userId, selectedPrize.value, 'ROULETTE', `Premio de la Ruleta Diaria`);
    } else if (selectedPrize.type === 'consumable') {
      // Find the specific cosmetic ID
      const cosmeticRes = await query('SELECT id, name FROM cosmetics WHERE type = \'consumable\' AND rarity = $1', [selectedPrize.rarity]);
      
      if (cosmeticRes.rows.length > 0) {
        const item = cosmeticRes.rows[0];
        
        // Check if user already has it to update quantity
        const invRes = await query('SELECT * FROM user_inventory WHERE user_id = $1 AND cosmetic_id = $2', [userId, item.id]);
        
        if (invRes.rows.length > 0) {
          await query('UPDATE user_inventory SET quantity = quantity + 1, is_new = TRUE WHERE user_id = $1 AND cosmetic_id = $2', [userId, item.id]);
        } else {
          await query('INSERT INTO user_inventory (user_id, cosmetic_id, quantity) VALUES ($1, $2, 1)', [userId, item.id]);
        }
        
        result.item = item;
      } else {
        // Fallback: 500 coins if item not found (safety)
        await query('UPDATE users SET reppy_coins = reppy_coins + 500 WHERE id = $1', [userId]);
        await trackCoinTransaction(userId, 500, 'ROULETTE', 'Ruleta: Bono Especial (Fallback)');
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

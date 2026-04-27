import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';
import { recalculateUserStats } from './utils/stats.js';

const router = express.Router();

// ALWAYS ALLOW FOR PLAYWRIGHT E2E TESTING
const isTestAllowed = true;

if (!isTestAllowed) {
  router.use((req, res) => res.status(403).json({ message: 'Test endpoints disabled' }));
}

// Give coins to a user
router.post('/add-coins', authenticate, async (req, res) => {
  const { amount } = req.body;
  try {
    await query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [amount, req.user.id]);
    res.json({ message: `Added ${amount} coins` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Give a specific item to a user
router.post('/add-item', authenticate, async (req, res) => {
  const { itemName } = req.body;
  try {
    let itemRes = await query('SELECT id FROM items WHERE name = $1', [itemName]);
    if (itemRes.rows.length === 0) {
      await query(`INSERT INTO items (name, description, type, rarity, stats) VALUES ($1, 'Test Item', 'weapon', 'legendary', '{"str": 50}')`, [itemName]);
      itemRes = await query('SELECT id FROM items WHERE name = $1', [itemName]);
    }
    
    const itemId = itemRes.rows[0].id;
    await query(
      `INSERT INTO user_items (user_id, item_id, quantity) 
       VALUES ($1, $2, 1) 
       ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = user_items.quantity + 1`,
      [req.user.id, itemId]
    );
    res.json({ message: `Added item ${itemName}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Force set user stats for testing
router.post('/set-stats', authenticate, async (req, res) => {
  const { str, pwr, dex, end, int, fth, vig, cha, level } = req.body;
  try {
    // Note: This is simplified. In a real RPG we might need to set XP to match the levels.
    // For testing damage formulas, we'll just set the XP values that result in these levels.
    // Level = 1 + floor(total_xp / 1000) usually, but here we use stats.js logic.
    
    // Let's assume we set XP directly to a high enough value.
    // We'll use a simple approximation: Level X = X * 1000 XP
    const updates = [];
    const params = [];
    let i = 1;

    if (str) { updates.push(`str_xp = $${i++}`); params.push(str * 1000); }
    if (end) { updates.push(`end_xp = $${i++}`); params.push(end * 1000); }
    if (dex) { updates.push(`dex_xp = $${i++}`); params.push(dex * 1000); }
    if (vig) { updates.push(`vig_xp = $${i++}`); params.push(vig * 1000); }
    if (int) { updates.push(`int_xp = $${i++}`); params.push(int * 1000); }
    if (fth) { updates.push(`fth_xp = $${i++}`); params.push(fth * 1000); }
    if (cha) { updates.push(`cha_xp = $${i++}`); params.push(cha * 1000); }
    if (level) { updates.push(`current_level = $${i++}`); params.push(level); }

    if (updates.length > 0) {
      params.push(req.user.id);
      await query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${i}`, params);
      await recalculateUserStats(req.user.id);
    }
    
    res.json({ message: 'Stats updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Give chests to a user
router.post('/add-chests', authenticate, async (req, res) => {
  const { boss = 0, level = 0 } = req.body;
  try {
    await query(
      'UPDATE users SET boss_chests = boss_chests + $1, level_chests = level_chests + $2 WHERE id = $3',
      [boss, level, req.user.id]
    );
    res.json({ message: `Added ${boss} boss chests and ${level} level chests` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Force complete active missions
router.post('/complete-missions', authenticate, async (req, res) => {
  try {
    await query(`
      UPDATE user_missions um
      SET current_value = m.goal_value, is_completed = true
      FROM missions m
      WHERE um.mission_id = m.id AND um.user_id = $1 AND um.is_active = true
    `, [req.user.id]);
    res.json({ message: 'Active missions marked as completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from 'express';
import { query } from './db.js';
import { authenticate, isAdmin } from './middleware.js';

const router = express.Router();

// --- Cosmetics Management ---

// Create cosmetic
router.post('/cosmetics', authenticate, isAdmin, async (req, res) => {
  const { name, description, type, price, css_value, is_seasonal, rarity } = req.body;
  try {
    const result = await query(
      'INSERT INTO items (name, description, type, price, css_value, is_seasonal, rarity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description, type, price, css_value, is_seasonal || false, rarity || 'common']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating cosmetic' });
  }
});

// Update cosmetic
router.put('/cosmetics/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, type, price, css_value, is_seasonal, rarity } = req.body;
  try {
    const result = await query(
      'UPDATE items SET name=$1, description=$2, type=$3, price=$4, css_value=$5, is_seasonal=$6, rarity=$7 WHERE id=$8 RETURNING *',
      [name, description, type, price, css_value, is_seasonal || false, rarity || 'common', id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cosmetic' });
  }
});

// Delete cosmetic
router.delete('/cosmetics/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM items WHERE id = $1', [id]);
    res.json({ message: 'Cosmetic deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting cosmetic' });
  }
});

// --- Boss Management ---

// Get all bosses
router.get('/bosses', authenticate, isAdmin, async (req, res) => {
  try {
    const result = await query('SELECT * FROM boss_fights ORDER BY start_date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bosses' });
  }
});

// Create/Spawn Boss
router.post('/bosses', authenticate, isAdmin, async (req, res) => {
  const { name, description, total_hp, start_date, end_date, image_url, order_index } = req.body;
  try {
    const result = await query(
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, image_url, order_index)
       VALUES ($1, $2, $3, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, total_hp, start_date || new Date(), end_date || new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), image_url, order_index || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating boss:', error);
    res.status(500).json({ message: 'Error creating boss' });
  }
});

// Update Boss
router.put('/bosses/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, total_hp, current_hp, start_date, end_date, image_url, status, order_index } = req.body;
  try {
    // Get current boss data to fill missing fields
    const currentBossRes = await query('SELECT * FROM boss_fights WHERE id = $1', [id]);
    if (currentBossRes.rows.length === 0) return res.status(404).json({ message: 'Boss not found' });
    const b = currentBossRes.rows[0];

    const result = await query(
      `UPDATE boss_fights SET 
        name=$1, 
        description=$2, 
        total_hp=$3, 
        current_hp=$4, 
        start_date=$5, 
        end_date=$6, 
        image_url=$7, 
        status=$8,
        order_index=$9
       WHERE id=$10 RETURNING *`,
      [
        name || b.name, 
        description || b.description, 
        total_hp ?? b.total_hp, 
        current_hp ?? b.current_hp, 
        start_date || b.start_date, 
        end_date || b.end_date, 
        image_url ?? b.image_url, 
        status || b.status, 
        order_index ?? b.order_index,
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating boss:', error);
    res.status(500).json({ message: 'Error updating boss', detail: error.message });
  }
});

// Delete Boss
router.delete('/bosses/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM boss_fights WHERE id = $1', [id]);
    res.json({ message: 'Boss event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting boss' });
  }
});


export default router;

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
      'INSERT INTO cosmetics (name, description, type, price, css_value, is_seasonal, rarity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
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
      'UPDATE cosmetics SET name=$1, description=$2, type=$3, price=$4, css_value=$5, is_seasonal=$6, rarity=$7 WHERE id=$8 RETURNING *',
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
    await query('DELETE FROM cosmetics WHERE id = $1', [id]);
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
  const { name, description, total_hp, start_date, end_date, image_url } = req.body;
  try {
    const result = await query(
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, image_url)
       VALUES ($1, $2, $3, $3, $4, $5, $6) RETURNING *`,
      [name, description, total_hp, start_date, end_date, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating boss' });
  }
});

// Update Boss
router.put('/bosses/:id', authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, total_hp, current_hp, start_date, end_date, image_url, status } = req.body;
  try {
    const result = await query(
      `UPDATE boss_fights SET name=$1, description=$2, total_hp=$3, current_hp=$4, start_date=$5, end_date=$6, image_url=$7, status=$8 
       WHERE id=$9 RETURNING *`,
      [name, description, total_hp, current_hp, start_date, end_date, image_url, status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating boss' });
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

import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.avatar_url, u.total_reps, u.is_private, u.has_seen_easter_modal, u.daily_goal, u.body_weight, u.reppy_coins, u.str_xp, u.pwr_xp, u.end_xp, u.agi_xp, u.equipped_title_id, u.equipped_border_id,
              t.name as title_name, t.css_value as title_css,
              b.css_value as border_css
       FROM users u
       LEFT JOIN cosmetics t ON u.equipped_title_id = t.id
       LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.patch('/profile', authenticate, async (req, res) => {
  const { is_private, name, daily_goal, body_weight } = req.body;
  
  try {
    // Dynamically build the update query
    let updateFields = [];
    let params = [];
    let i = 1;

    if (is_private !== undefined) {
      updateFields.push(`is_private = $${i++}`);
      params.push(is_private);
    }
    if (name) {
      updateFields.push(`name = $${i++}`);
      params.push(name);
    }
    if (daily_goal !== undefined) {
      updateFields.push(`daily_goal = $${i++}`);
      params.push(daily_goal);
    }
    if (body_weight !== undefined) {
      updateFields.push(`body_weight = $${i++}`);
      params.push(body_weight);
    }

    if (updateFields.length === 0) return res.json({ message: 'No changes provided' });

    params.push(req.user.id);
    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Update avatar (specifically)
router.patch('/avatar', authenticate, async (req, res) => {
  const { avatar_url } = req.body;
  
  try {
    const result = await query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING *',
      [avatar_url, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Error updating avatar' });
  }
});

// Mark easter modal as seen
router.patch('/seen-easter-modal', authenticate, async (req, res) => {
  try {
    await query(
      'UPDATE users SET has_seen_easter_modal = true WHERE id = $1',
      [req.user.id]
    );
    res.json({ message: 'Modal marked as seen' });
  } catch (error) {
    console.error('Error updating modal state:', error);
    res.status(500).json({ message: 'Error updating modal state' });
  }
});

// Delete account (New requirement)
router.delete('/me', authenticate, async (req, res) => {
  try {
    // Note: reps and friendships should have ON DELETE CASCADE in the DB
    // but we can also manually clean them just in case.
    await query('DELETE FROM reps WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM friendships WHERE user_id_1 = $1 OR user_id_2 = $1', [req.user.id]);
    await query('DELETE FROM users WHERE id = $1', [req.user.id]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

export default router;

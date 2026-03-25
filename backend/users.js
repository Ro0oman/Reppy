import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, avatar_url, total_reps, is_private FROM users WHERE id = $1',
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
  const { is_private, name, daily_goal } = req.body;
  
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

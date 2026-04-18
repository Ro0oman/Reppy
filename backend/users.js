import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';
import { autoGrantPendingChests } from './utils/bossRewards.js';
import { compressAvatar } from './utils/image.js';
import { getXPForLevel } from './utils/stats.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    // Auto-grant any pending chests before returning profile
    await autoGrantPendingChests(req.user.id);

    const result = await query(
      `SELECT u.id, u.name, u.email, u.avatar_url, u.total_reps, u.is_private, u.has_seen_easter_modal, u.has_seen_damage_overhaul, u.daily_goal, u.body_weight, u.reppy_coins, u.boss_chests, u.level_chests, u.str_xp, u.dex_xp, u.end_xp, u.vig_xp, u.int_xp, u.fth_xp, u.total_xp, u.current_level, u.equipped_title_id, u.equipped_border_id, u.equipped_avatar_id, u.equipped_background_id, u.equipped_post_background_id, u.is_admin, u.theme,
              t.name as title_name, t.css_value as title_css,
              b.css_value as border_css,
              a.css_value as avatar_css,
              bg.css_value as background_css
       FROM users u
       LEFT JOIN cosmetics t ON u.equipped_title_id = t.id
       LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
       LEFT JOIN cosmetics a ON u.equipped_avatar_id = a.id
       LEFT JOIN cosmetics bg ON u.equipped_background_id = bg.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = result.rows[0];
    // Calculate derived stats using quadratic logic
    const level = user.current_level || 1;
    const totalXp = user.total_xp || 0;
    const xpCurrentLevelStart = getXPForLevel(level, 1000);
    const xpNextLevelStart = getXPForLevel(level + 1, 1000);
    
    user.xp_into_level = totalXp - xpCurrentLevelStart;
    user.xp_for_next_level = xpNextLevelStart - xpCurrentLevelStart;
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.patch('/profile', authenticate, async (req, res) => {
  const { is_private, name, daily_goal, body_weight, theme } = req.body;
  
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
    if (theme) {
      updateFields.push(`theme = $${i++}`);
      params.push(theme);
    }

    if (updateFields.length === 0) return res.json({ message: 'No changes provided' });

    params.push(req.user.id);
    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Update avatar (specifically) - Supporting both PATCH and POST
const updateAvatar = async (req, res) => {
  const { avatar_url, avatarBase64 } = req.body;
  let finalUrl = avatarBase64 || avatar_url;
  
  if (!finalUrl) return res.status(400).json({ message: 'No avatar provided' });

  // Only compress if it's a base64 string
  if (finalUrl.startsWith('data:image')) {
    finalUrl = await compressAvatar(finalUrl);
  }

  try {
    const result = await query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING *',
      [finalUrl, req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Error updating avatar' });
  }
};

router.patch('/avatar', authenticate, updateAvatar);
router.post('/avatar', authenticate, updateAvatar);

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

// Mark damage overhaul modal as seen
router.patch('/seen-damage-modal', authenticate, async (req, res) => {
  try {
    await query(
      'UPDATE users SET has_seen_damage_overhaul = true WHERE id = $1',
      [req.user.id]
    );
    res.json({ message: 'Damage modal marked as seen' });
  } catch (error) {
    console.error('Error updating modal state:', error);
    res.status(500).json({ message: 'Error updating modal state' });
  }
});

export default router;

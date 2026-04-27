import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';
import { autoGrantPendingChests } from './utils/bossRewards.js';

import { recalculateUserStats, getXPForLevel, augmentUserWithLevels } from './utils/stats.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    // Auto-grant any pending chests before returning profile
    await autoGrantPendingChests(req.user.id);

    const result = await query(
      `SELECT u.*,
              t.name as title_name, t.css_value as title_css,
              b.css_value as border_css,
              a.css_value as avatar_css,
              bg.css_value as background_css,
              iHead.stats as head_stats,
              iWeapon.stats as weapon_stats,
              iArmor.stats as armor_stats,
              iBoots.stats as boots_stats
       FROM users u
       LEFT JOIN cosmetics t ON u.equipped_title_id = t.id
       LEFT JOIN cosmetics b ON u.equipped_border_id = b.id
       LEFT JOIN cosmetics a ON u.equipped_avatar_id = a.id
       LEFT JOIN cosmetics bg ON u.equipped_background_id = bg.id
       LEFT JOIN items iHead ON u.equipped_head_id = iHead.id
       LEFT JOIN items iWeapon ON u.equipped_weapon_id = iWeapon.id
       LEFT JOIN items iArmor ON u.equipped_armor_id = iArmor.id
       LEFT JOIN items iBoots ON u.equipped_boots_id = iBoots.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    // Get read blogs list for indicators
    const readBlogsRes = await query(
      'SELECT post_slug FROM user_read_blogs WHERE user_id = $1',
      [req.user.id]
    );
    const readBlogs = readBlogsRes.rows.map(r => r.post_slug);

    // Calculate derived stats using augmented logic
    const user = {
      ...augmentUserWithLevels(result.rows[0]),
      read_blogs: readBlogs
    };
    
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
  const { avatar_url, is_custom } = req.body;
  
  if (is_custom) {
    // Basic safety check for base64 images
    if (!avatar_url.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid custom avatar format' });
    }
    // Limit size of base64 string to ~100KB (just in case)
    if (avatar_url.length > 150000) { 
      return res.status(400).json({ message: 'Avatar too large even after compression' });
    }
  } else {
    // Only allow valid avatar paths
    const validAvatars = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 14, 16, 17, 27, 28, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40].map(i => `/img/avatars/avatar_${i}.webp`);
    
    if (!validAvatars.includes(avatar_url)) {
      return res.status(400).json({ message: 'Invalid avatar selection' });
    }
  }

  try {
    const result = await query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING *',
      [avatar_url, req.user.id]
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

// Mark avatar overhaul modal as seen
router.patch('/seen-avatar-modal', authenticate, async (req, res) => {
  try {
    await query(
      'UPDATE users SET has_seen_avatar_overhaul = true WHERE id = $1',
      [req.user.id]
    );
    res.json({ message: 'Avatar modal marked as seen' });
  } catch (error) {
    console.error('Error updating modal state:', error);
    res.status(500).json({ message: 'Error updating modal state' });
  }
});

// Mark armory update modal as seen
router.patch('/seen-armory-modal', authenticate, async (req, res) => {
  try {
    await query(
      'UPDATE users SET has_seen_armory_update = true WHERE id = $1',
      [req.user.id]
    );
    res.json({ message: 'Armory modal marked as seen' });
  } catch (error) {
    console.error('Error updating modal state:', error);
    res.status(500).json({ message: 'Error updating modal state' });
  }
});

export default router;

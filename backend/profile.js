import express from 'express';
import { query } from './db.js';
import { recalculateUserStats, augmentUserWithLevels, getStatLevel, getGlobalLevel, getXPForLevel } from './utils/stats.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  const { type = 'pullups' } = req.query;
  console.log(`[PROFILE_API] INCOMING - ID: ${userId}, TYPE: ${type}`);

  try {
    const userResult = await query(`
        SELECT u.id, u.name, u.email, u.avatar_url, u.reppy_coins, u.reppy_gems, u.daily_goal,
               u.str_xp, u.dex_xp, u.end_xp, u.vig_xp, u.int_xp, u.fth_xp, u.total_xp, u.body_weight, u.is_private,
               u.current_level, u.level_chests_claimed, u.level_chests,
               u.damage_multiplier, u.damage_multiplier_expiry,
               u.equipped_title_id, u.equipped_border_id, u.equipped_background_id, u.equipped_post_background_id,
               u.equipped_head_id, u.equipped_weapon_id, u.equipped_armor_id, u.equipped_boots_id,
               cTitle.name as title_name, cTitle.css_value as title_css,
               cBorder.name as border_name, cBorder.css_value as border_css,
               cAvatar.css_value as avatar_css,
               cBackground.css_value as background_css,
               iHead.name as head_name, iHead.rarity as head_rarity, iHead.stats as head_stats,
               iWeapon.name as weapon_name, iWeapon.rarity as weapon_rarity, iWeapon.stats as weapon_stats,
               iArmor.name as armor_name, iArmor.rarity as armor_rarity, iArmor.stats as armor_stats,
               iBoots.name as boots_name, iBoots.rarity as boots_rarity, iBoots.stats as boots_stats
        FROM users u
        LEFT JOIN items cTitle ON u.equipped_title_id = cTitle.id AND cTitle.type = 'title'
        LEFT JOIN items cBorder ON u.equipped_border_id = cBorder.id AND cBorder.type = 'border'
        LEFT JOIN items cAvatar ON u.equipped_avatar_id = cAvatar.id AND cAvatar.type = 'avatar'
        LEFT JOIN items cBackground ON u.equipped_background_id = cBackground.id AND cBackground.type = 'background'
        LEFT JOIN items iHead ON u.equipped_head_id = iHead.id
        LEFT JOIN items iWeapon ON u.equipped_weapon_id = iWeapon.id
        LEFT JOIN items iArmor ON u.equipped_armor_id = iArmor.id
        LEFT JOIN items iBoots ON u.equipped_boots_id = iBoots.id
        WHERE u.id = $1
      `, [userId]);

    if (!userResult || userResult.rowCount === 0) {
      console.log(`[PROFILE_API] User ${userId} not found`);
      return res.status(404).json({ message: 'User not found' });
    }
    const userRaw = userResult.rows[0];

    const isGlobal = type === 'all';
    const typeFilter = isGlobal ? '' : 'AND exercise_type = $2';
    const params = isGlobal ? [userId] : [userId, type];

    const heatmapResult = await query(
      `SELECT date, exercise_type, SUM(count)::int as count FROM reps 
       WHERE user_id = $1 ${typeFilter} AND date > CURRENT_DATE - INTERVAL '1 year'
       GROUP BY date, exercise_type ORDER BY date ASC`,
      params
    );

    const totalRes = await query(
      `SELECT SUM(count)::int as total FROM reps WHERE user_id = $1 ${typeFilter}`,
      params
    );
    const totalReps = parseInt(totalRes.rows[0]?.total || 0);

    const recentLogs = await query(
      `SELECT id, date, count, exercise_type FROM reps WHERE user_id = $1 ${typeFilter} ORDER BY date DESC LIMIT 20`,
      params
    );

    

    // Get read blogs list for indicators
    const readBlogsRes = await query(
      'SELECT post_slug FROM user_read_blogs WHERE user_id = $1',
      [userId]
    );
    const readBlogs = readBlogsRes.rows.map(r => r.post_slug);

    // Check for new inventory items
    const hasNewInventoryRes = await query(
      'SELECT EXISTS(SELECT 1 FROM user_items WHERE user_id = $1 AND is_new = TRUE)',
      [userId]
    );
    const hasNewInventory = hasNewInventoryRes.rows[0].exists;

    // Calculate favorite exercise
    const favResult = await query(
      'SELECT exercise_type, SUM(count) as total FROM reps WHERE user_id = $1 GROUP BY exercise_type ORDER BY total DESC LIMIT 1',
      [userId]
    );
    const favExercise = favResult.rows[0]?.exercise_type || 'pullups';

    // Calculate total breakdown (count and volume) by exercise
    const breakdownRes = await query(
      `SELECT r.exercise_type as type, 
              SUM(r.count)::int as count,
              SUM(r.count * (COALESCE(r.added_weight, 0) + u.body_weight))::float as volume
       FROM reps r
       JOIN users u ON r.user_id = u.id
       WHERE r.user_id = $1 
       GROUP BY r.exercise_type 
       ORDER BY volume DESC`,
      [userId]
    );

    // --- BUNDLE AUTO-SYNC PROTOCOL ---
    // Ensure all items from purchased bundles are assigned to the user's inventory
    try {
      const purchasedBundles = await query(`
        SELECT i.bundle_items FROM user_items ui
        JOIN items i ON ui.item_id = i.id
        WHERE ui.user_id = $1 AND i.type = 'bundle' AND i.bundle_items IS NOT NULL
      `, [userId]);

      for (const bundle of purchasedBundles.rows) {
        const itemIds = bundle.bundle_items.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        for (const itemId of itemIds) {
          await query(`
            INSERT INTO user_items (user_id, item_id, is_new)
            VALUES ($1, $2, TRUE)
            ON CONFLICT (user_id, item_id) DO NOTHING
          `, [userId, itemId]);
        }
      }
    } catch (syncError) {
      console.error('[PROFILE_API] Bundle Sync Warning:', syncError.message);
      // Non-blocking, continue with profile fetch
    }

    // RPG CALCULATIONS - Now handled by shared utility
    const statsResult = await recalculateUserStats(userId);
    
    // Dynamic Title Selection
    const totalXPForTitle = statsResult.total_xp || 0;
    let dynamicTitle = 'Novato de Midgard';
    if (totalXPForTitle > 40000) dynamicTitle = 'Espectro de Reppy';
    else if (totalXPForTitle > 15000) dynamicTitle = 'Dios de la Guerra';
    else if (totalXPForTitle > 5000) dynamicTitle = 'Campeón del Olimpo';
    else if (totalXPForTitle > 1500) dynamicTitle = 'Asesino de Dragones';
    else if (totalXPForTitle > 500) dynamicTitle = 'Guerrero Espartano';

    const finalTitleName = userRaw.title_name ? userRaw.title_name : dynamicTitle;
    const finalTitleCss = userRaw.title_name ? userRaw.title_css : '';

    // Create the augmented user object
    const finalUser = augmentUserWithLevels({
      ...userRaw,
      ...statsResult,
      read_blogs: readBlogs,
      has_new_inventory: hasNewInventory,
      title_name: finalTitleName,
      title_css: finalTitleCss
    });

    console.log(`[PROFILE_API] SUCCESS for ${userId} - Title: ${finalTitleName} XP: ${finalUser.total_xp}`);
    
    res.json({
      user: finalUser,
      heatmap: heatmapResult.rows || [],
      stats: { 
        totalReps: finalUser.total_reps, 
        streak: finalUser.streak, 
        favExercise, 
        totalXP: finalUser.total_xp, 
        totalVolume: finalUser.total_volume, 
        breakdown: breakdownRes.rows || [] 
      },
      recentLogs: recentLogs.rows || []
    });
  } catch (error) {
    console.error('CRITICAL ERROR IN /api/profile/[id]:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

export default router;

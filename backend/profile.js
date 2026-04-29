import express from 'express';
import { query } from './db.js';
import { recalculateUserStats, augmentUserWithLevels, getStatLevel, getGlobalLevel, getXPForLevel } from './utils/stats.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const rawId = req.params.id;
  const { type = 'pullups' } = req.query;
  console.log(`[PROFILE_API] INCOMING - ID: ${rawId}, TYPE: ${type}`);

  try {
    // Try to find the user. If they have a 'user_' prefix or not, we want to be robust.
    let userResult = await query(`
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
      `, [rawId]);

    // If not found and ID starts with 'user_', try without it. Or vice versa.
    if (!userResult || userResult.rowCount === 0) {
      const altId = rawId.startsWith('user_') ? rawId.replace('user_', '') : `user_${rawId}`;
      console.log(`[PROFILE_API] Not found with ${rawId}, trying ${altId}`);
      userResult = await query(`
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
      `, [altId]);
    }

    if (!userResult || userResult.rowCount === 0) {
      console.log(`[PROFILE_API] User ${rawId} not found even with alt ID`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userRaw = userResult.rows[0];
    const userId = userRaw.id; // Use the actual ID found in DB

    const isGlobal = type === 'all';
    const typeFilter = isGlobal ? '' : 'AND exercise_type = $2';
    const params = isGlobal ? [userId] : [userId, type];

    const [
      heatmapResult,
      totalRes,
      recentLogs,
      readBlogsRes,
      hasNewInventoryRes,
      favResult,
      breakdownRes,
      purchasedBundles
    ] = await Promise.all([
      query(
        `SELECT date, exercise_type, SUM(count)::int as count FROM reps 
         WHERE user_id = $1 ${typeFilter} AND date > CURRENT_DATE - INTERVAL '1 year'
         GROUP BY date, exercise_type ORDER BY date ASC`,
        params
      ),
      query(
        `SELECT SUM(count)::int as total FROM reps WHERE user_id = $1 ${typeFilter}`,
        params
      ),
      query(
        `SELECT id, date, count, exercise_type FROM reps WHERE user_id = $1 ${typeFilter} ORDER BY date DESC LIMIT 20`,
        params
      ),
      query('SELECT post_slug FROM user_read_blogs WHERE user_id = $1', [userId]),
      query('SELECT EXISTS(SELECT 1 FROM user_items WHERE user_id = $1 AND is_new = TRUE)', [userId]),
      query('SELECT exercise_type, SUM(count) as total FROM reps WHERE user_id = $1 GROUP BY exercise_type ORDER BY total DESC LIMIT 1', [userId]),
      query(
        `SELECT r.exercise_type as type, 
                SUM(r.count)::int as count,
                SUM(r.count * (COALESCE(r.added_weight, 0) + u.body_weight))::float as volume
         FROM reps r
         JOIN users u ON r.user_id = u.id
         WHERE r.user_id = $1 
         GROUP BY r.exercise_type 
         ORDER BY volume DESC`,
        [userId]
      ),
      query(`
        SELECT i.bundle_items FROM user_items ui
        JOIN items i ON ui.item_id = i.id
        WHERE ui.user_id = $1 AND i.type = 'bundle' AND i.bundle_items IS NOT NULL
      `, [userId])
    ]);

    const totalReps = parseInt(totalRes.rows[0]?.total || 0);
    const readBlogs = readBlogsRes.rows.map(r => r.post_slug);
    const hasNewInventory = hasNewInventoryRes.rows[0].exists;
    const favExercise = favResult.rows[0]?.exercise_type || 'pullups';

    // --- BUNDLE AUTO-SYNC PROTOCOL ---
    try {
      const allItemIds = purchasedBundles.rows
        .flatMap(bundle => bundle.bundle_items.split(','))
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));

      if (allItemIds.length > 0) {
        await query(`
          INSERT INTO user_items (user_id, item_id, is_new)
          SELECT $1, unnest($2::int[]), TRUE
          ON CONFLICT (user_id, item_id) DO NOTHING
        `, [userId, allItemIds]);
      }
    } catch (syncError) {
      console.error('[PROFILE_API] Bundle Sync Warning:', syncError.message);
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

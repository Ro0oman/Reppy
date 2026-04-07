import express from 'express';
import { query } from './db.js';
import { recalculateUserStats } from './utils/stats.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  const { type = 'pullups' } = req.query;
  console.log(`[PROFILE_API] INCOMING - ID: ${userId}, TYPE: ${type}`);

  try {
    const userResult = await query(`
        SELECT u.id, u.name, u.email, u.avatar_url, u.reppy_coins, u.daily_goal,
               u.str_xp, u.pwr_xp, u.end_xp, u.agi_xp, u.total_xp, u.body_weight, u.is_private,
               u.current_level, u.level_chests_claimed, u.level_chests,
               u.equipped_title_id, u.equipped_border_id, u.equipped_background_id,
               cTitle.name as title_name, cTitle.css_value as title_css,
               cBorder.name as border_name, cBorder.css_value as border_css,
               cAvatar.css_value as avatar_css,
               cBackground.css_value as background_css
        FROM users u
        LEFT JOIN cosmetics cTitle ON u.equipped_title_id = cTitle.id AND cTitle.type = 'title'
        LEFT JOIN cosmetics cBorder ON u.equipped_border_id = cBorder.id AND cBorder.type = 'border'
        LEFT JOIN cosmetics cAvatar ON u.equipped_avatar_id = cAvatar.id AND cAvatar.type = 'avatar'
        LEFT JOIN cosmetics cBackground ON u.equipped_background_id = cBackground.id AND cBackground.type = 'background'
        WHERE u.id = $1
      `, [userId]);

    if (!userResult || userResult.rowCount === 0) {
      console.log(`[PROFILE_API] User ${userId} not found`);
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userResult.rows[0];

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

    const transactions = await query(
      `SELECT amount, source, description, created_at 
       FROM coin_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );

    // Calculate favorite exercise
    const favResult = await query(
      'SELECT exercise_type, SUM(count) as total FROM reps WHERE user_id = $1 GROUP BY exercise_type ORDER BY total DESC LIMIT 1',
      [userId]
    );
    const favExercise = favResult.rows[0]?.exercise_type || 'pullups';

    // Calculate total breakdown by exercise
    const breakdownRes = await query(
      'SELECT exercise_type as type, SUM(count)::int as count FROM reps WHERE user_id = $1 GROUP BY exercise_type ORDER BY count DESC',
      [userId]
    );

    // RPG CALCULATIONS - Now handled by shared utility
    const stats = await recalculateUserStats(userId);
    const { strXP: str_xp, pwrXP: pwr_xp, endXP: end_xp, agiXP: agi_xp, streak, totalVolume } = stats;

    const getLevel = (xp) => Math.floor((xp || 0) / 100) + 1;

    // Dynamic Title Selection
    const totalXP = str_xp + pwr_xp + end_xp + agi_xp;
    let dynamicTitle = 'Novato de Midgard';
    if (totalXP > 40000) dynamicTitle = 'Espectro de Reppy';
    else if (totalXP > 15000) dynamicTitle = 'Dios de la Guerra';
    else if (totalXP > 5000) dynamicTitle = 'Campeón del Olimpo';
    else if (totalXP > 1500) dynamicTitle = 'Asesino de Dragones';
    else if (totalXP > 500) dynamicTitle = 'Guerrero Espartano';

    const finalTitleName = user.title_name ? user.title_name : dynamicTitle;
    const finalTitleCss = user.title_name ? user.title_css : '';

    console.log(`[PROFILE_API] SUCCESS for ${userId} - Title: ${finalTitleName} XP: ${totalXP}`);
    
    res.json({
      user: {
        ...user,
        title_name: finalTitleName,
        title_css: finalTitleCss,
        str_xp, pwr_xp, end_xp, agi_xp, 
        total_xp: totalXP,
        str_lvl: getLevel(str_xp),
        pwr_lvl: getLevel(pwr_xp),
        end_lvl: getLevel(end_xp),
        agi_lvl: getLevel(agi_xp)
      },
      heatmap: heatmapResult.rows || [],
      stats: { totalReps, streak, favExercise, totalXP, totalVolume, breakdown: breakdownRes.rows || [] },
      recentLogs: recentLogs.rows || [],
      transactions: transactions.rows || []
    });
  } catch (error) {
    console.error('CRITICAL ERROR IN /api/profile/[id]:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

export default router;

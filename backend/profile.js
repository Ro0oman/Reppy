import express from 'express';
import { query } from './db.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  const { type = 'pullups' } = req.query;
  console.log(`[PROFILE_API] INCOMING - ID: ${userId}, TYPE: ${type}`);

  try {
    const userResult = await query(`
        SELECT u.id, u.name, u.email, u.avatar_url, u.reppy_coins, u.daily_goal,
               u.str_xp, u.pwr_xp, u.end_xp, u.agi_xp, u.body_weight, u.is_private,
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
      `SELECT date, SUM(count)::int as count FROM reps 
       WHERE user_id = $1 ${typeFilter} AND date > CURRENT_DATE - INTERVAL '1 year'
       GROUP BY date ORDER BY date ASC`,
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

    // Calculate current streak (PULLUPS ONLY as requested)
    const streakResult = await query(
      'SELECT DISTINCT date FROM reps WHERE user_id = $1 AND exercise_type = \'pullups\' ORDER BY date DESC',
      [userId]
    );
    
    let streak = 0;
    if (streakResult && streakResult.rowCount > 0) {
      const dates = streakResult.rows.map(r => new Date(r.date).toISOString().split('T')[0]);
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let checkDate = dates.includes(today) ? today : (dates.includes(yesterday) ? yesterday : null);
      
      if (checkDate) {
        let current = new Date(checkDate);
        while (dates.includes(current.toISOString().split('T')[0])) {
          streak++;
          current.setDate(current.getDate() - 1);
        }
      }
    }

    // Calculate favorite exercise
    const favResult = await query(
      'SELECT exercise_type, SUM(count) as total FROM reps WHERE user_id = $1 GROUP BY exercise_type ORDER BY total DESC LIMIT 1',
      [userId]
    );
    const favExercise = favResult.rows[0]?.exercise_type || 'pullups';

    // RPG CALCULATIONS
    const volumeResult = await query(
      'SELECT SUM(count * (COALESCE(added_weight, 0) + $2)) as volume FROM reps WHERE user_id = $1',
      [userId, parseFloat(user.body_weight) || 75]
    );
    const totalVolume = parseFloat(volumeResult.rows[0]?.volume || 0);
    const str_xp = Math.floor(totalVolume * 0.05);

    const pwrResult = await query(
      'SELECT MAX(added_weight) as max_weight FROM reps WHERE user_id = $1',
      [userId]
    );
    const maxWeight = parseFloat(pwrResult.rows[0]?.max_weight || 0);
    const pwr_xp = Math.floor(maxWeight * 25);

    const end_xp = Math.floor(totalReps * 5);

    const varietyResult = await query(
      'SELECT COUNT(DISTINCT exercise_type) as variety FROM reps WHERE user_id = $1',
      [userId]
    );
    const varietyCount = parseInt(varietyResult.rows[0]?.variety || 1);
    const agi_xp = Math.floor((streak * 40) + (varietyCount * 75));

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
        str_lvl: getLevel(str_xp),
        pwr_lvl: getLevel(pwr_xp),
        end_lvl: getLevel(end_xp),
        agi_lvl: getLevel(agi_xp)
      },
      heatmap: heatmapResult.rows || [],
      stats: { totalReps, streak, favExercise, totalXP },
      recentLogs: recentLogs.rows || []
    });
  } catch (error) {
    console.error('CRITICAL ERROR IN /api/profile/[id]:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

export default router;

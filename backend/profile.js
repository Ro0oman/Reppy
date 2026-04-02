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
               u.equipped_title_id, u.equipped_border_id,
               cTitle.name as title_name, cTitle.css_value as title_css,
               cBorder.name as border_name, cBorder.css_value as border_css
        FROM users u
        LEFT JOIN cosmetics cTitle ON u.equipped_title_id = cTitle.id AND cTitle.type = 'title'
        LEFT JOIN cosmetics cBorder ON u.equipped_border_id = cBorder.id AND cBorder.type = 'border'
        WHERE u.id = $1
      `, [userId]);

    if (!userResult || userResult.rowCount === 0) {
      console.log(`[PROFILE_API] User ${userId} not found`);
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userResult.rows[0];

    const heatmapResult = await query(
      `SELECT date, count FROM reps 
       WHERE user_id = $1 AND exercise_type = $2 AND date > CURRENT_DATE - INTERVAL '1 year'
       ORDER BY date ASC`,
      [userId, type]
    );

    const totalRes = await query(
      'SELECT SUM(count) as total FROM reps WHERE user_id = $1 AND exercise_type = $2',
      [userId, type]
    );
    // Calculate favorite exercise
    const favResult = await query(
      'SELECT exercise_type, SUM(count) as total FROM reps WHERE user_id = $1 GROUP BY exercise_type ORDER BY total DESC LIMIT 1',
      [userId]
    );
    const favExercise = favResult.rows[0]?.exercise_type || 'pullups';

    // RPG CALCULATIONS (God of War Edition)
    // 1. STR (Strength) - Based on total volume and body weight influence
    const volumeResult = await query(
      'SELECT SUM(count * (COALESCE(added_weight, 0) + $2)) as volume FROM reps WHERE user_id = $1',
      [userId, user.body_weight || 75]
    );
    const totalVolume = parseFloat(volumeResult.rows[0]?.volume) || 0;
    const str_xp = Math.floor(totalVolume * 0.05); // 1 XP every 20kg moved

    // 2. PWR (Power) - Based on max weight intensity
    const pwrResult = await query(
      'SELECT MAX(added_weight) as max_weight FROM reps WHERE user_id = $1',
      [userId]
    );
    const maxWeight = parseFloat(pwrResult.rows[0]?.max_weight) || 0;
    const pwr_xp = Math.floor(maxWeight * 25); // 10kg max = 250 XP (Lvl 3)

    // 3. END (Endurance) - Based on total reps
    const end_xp = Math.floor(totalReps * 5); // 100 reps = 500 XP (Lvl 6)

    // 4. AGI (Agility) - Based on consistency and variety
    const varietyResult = await query(
      'SELECT COUNT(DISTINCT exercise_type) as variety FROM reps WHERE user_id = $1',
      [userId]
    );
    const varietyCount = parseInt(varietyResult.rows[0]?.variety) || 1;
    const agi_xp = Math.floor((streak * 40) + (varietyCount * 75));

    // Calculate levels (Level 1 starts at 0 XP, each 100 XP is a new level)
    const getLevel = (xp) => Math.floor(xp / 100) + 1;

    // Dynamic Title Selection
    const totalXP = str_xp + pwr_xp + end_xp + agi_xp;
    let dynamicTitle = 'Novato de Midgard';
    if (totalXP > 40000) dynamicTitle = 'Espectro de Reppy';
    else if (totalXP > 15000) dynamicTitle = 'Dios de la Guerra';
    else if (totalXP > 5000) dynamicTitle = 'Campeón del Olimpo';
    else if (totalXP > 1500) dynamicTitle = 'Asesino de Dragones';
    else if (totalXP > 500) dynamicTitle = 'Guerrero Espartano';

    console.log(`[PROFILE_API] SUCCESS - RPG Stats: STR:${str_xp} PWR:${pwr_xp} END:${end_xp} AGI:${agi_xp} | Title: ${dynamicTitle}`);
    
    // Merge calculated stats into user object for the response
    const rpgUser = {
      ...user,
      title_name: dynamicTitle,
      str_xp,
      pwr_xp,
      end_xp,
      agi_xp,
      str_lvl: getLevel(str_xp),
      pwr_lvl: getLevel(pwr_xp),
      end_lvl: getLevel(end_xp),
      agi_lvl: getLevel(agi_xp)
    };

    res.json({
      user: rpgUser,
      heatmap: heatmapResult.rows || [],
      stats: {
        totalReps,
        streak,
        favExercise,
        totalXP
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

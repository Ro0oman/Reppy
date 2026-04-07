import { query } from '../db.js';

/**
 * Shared utility to recalculate and sync user stats (total_reps and XP levels)
 * based on the absolute history of their reps.
 * This ensures consistency and allows levels to "go down" if reps are deleted.
 * 
 * Formulas (based on profile.js):
 * - STR XP: floor(totalVolume * 0.05)
 * - PWR XP: floor(maxWeight * 25)
 * - END XP: floor(totalReps * 5)
 * - AGI XP: floor((streak * 40) + (varietyCount * 75))
 */
export const recalculateUserStats = async (userId) => {
  try {
    // 1. Get user data for level tracking
    const userRes = await query('SELECT body_weight, current_level, level_chests_claimed, level_chests FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) return;
    const user = userRes.rows[0];
    const bodyWeight = parseFloat(user.body_weight) || 75.0;

    const statsRes = await query(`
      SELECT 
        SUM(count)::int as total_reps,
        SUM(count * (COALESCE(added_weight, 0) + $2)) as total_volume,
        SUM(CASE 
          WHEN exercise_type IN ('muscleups', 'weighted_pullups') 
          THEN (count * (10 + COALESCE(added_weight, 0))) 
          ELSE 0 
        END)::int as calculated_pwr_xp,
        COUNT(DISTINCT exercise_type) as variety_count
      FROM reps 
      WHERE user_id = $1
    `, [userId, bodyWeight]);

    const stats = statsRes.rows[0] || {};
    const totalReps = parseInt(stats.total_reps || 0);
    const totalVolume = parseFloat(stats.total_volume || 0);
    const pwrXP = parseInt(stats.calculated_pwr_xp || 0);
    const varietyCount = parseInt(stats.variety_count || 0);

    // 2. Calculate Streak (PULLUPS ONLY as currently implemented in profile.js)
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

    // 3. Apply XP Formulas
    const strXP = Math.floor(totalVolume * 0.05);
    const endXP = Math.floor(totalReps * 5);
    const agiXP = Math.floor((streak * 40) + (varietyCount * 75));
    const totalXP = strXP + pwrXP + endXP + agiXP;

    // 4. Character Level Calculation (Hardcore: 1000 XP per level)
    const newLevel = Math.floor(totalXP / 1000) + 1;
    const xpIntoLevel = totalXP % 1000;
    
    // 5. Reward Logic (Every level reached gives a chest)
    // We compare with level_chests_claimed to ensure we only reward each level once
    let additionalChests = 0;
    let newLevelChestsClaimed = user.level_chests_claimed || 1;

    if (newLevel > newLevelChestsClaimed) {
      additionalChests = newLevel - newLevelChestsClaimed;
      newLevelChestsClaimed = newLevel;
    }

    // 6. Final Sync to Users Table
    await query(`
      UPDATE users 
      SET 
        total_reps = $2,
        str_xp = $3,
        pwr_xp = $4,
        end_xp = $5,
        agi_xp = $6,
        total_xp = $3::int + $4::int + $5::int + $6::int,
        current_level = $7,
        level_chests = COALESCE(level_chests, 0) + $8,
        level_chests_claimed = $9
      WHERE id = $1
    `, [userId, totalReps, strXP, pwrXP, endXP, agiXP, newLevel, additionalChests, newLevelChestsClaimed]);

    return {
      totalReps,
      strXP,
      pwrXP,
      endXP,
      agiXP,
      totalXP,
      currentLevel: newLevel,
      xpIntoLevel,
      xpForNextLevel: 1000,
      streak,
      totalVolume
    };

  } catch (err) {
    console.error(`[STATS_UTILS] CRITICAL: Failed to recalculate stats for user ${userId}:`, err);
    throw err;
  }
};

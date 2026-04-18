import { query } from '../db.js';
import { createNotification } from './notifications.js';
import { getLocalDateString } from './date.js';

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
 * - END XP: floor(totalReps * 5)
 * - AGI XP: floor((streak * 40) + (varietyCount * 75))
 */

export const getStatLevel = (xp) => Math.floor((xp || 0) / 100) + 1;

/**
 * Augments a user object from the DB with calculated level fields.
 * e.g. str_xp -> str_lvl
 */
export const augmentUserWithLevels = (user) => {
  if (!user) return null;
  
  return {
    ...user,
    str_lvl: getStatLevel(user.str_xp),
    dex_lvl: getStatLevel(user.dex_xp),
    end_lvl: getStatLevel(user.end_xp),
    vig_lvl: getStatLevel(user.vig_xp),
    int_lvl: getStatLevel(user.int_xp),
    fth_lvl: getStatLevel(user.fth_xp),
    current_level: Math.floor((user.total_xp || 0) / 1000) + 1
  };
};

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
      const dates = streakResult.rows.map(r => getLocalDateString(r.date));
      const today = getLocalDateString();
      const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
      
      let checkDate = dates.includes(today) ? today : (dates.includes(yesterday) ? yesterday : null);
      
      if (checkDate) {
        let current = new Date(checkDate);
        while (dates.includes(getLocalDateString(current))) {
          streak++;
          current.setDate(current.getDate() - 1);
        }
      }
    }

    // 3. New Stat Logic (6-Stat System)
    
    // INT: Knowledge (Blog Reads) - 100 XP per unique article
    const intRes = await query('SELECT COUNT(*)::int as read_count FROM user_read_blogs WHERE user_id = $1', [userId]);
    const intXP = (intRes.rows[0]?.read_count || 0) * 100;

    // FTH: Community/Faith (Total Boss Damage) - 1 XP per 50 damage dealt historically
    const fthRes = await query('SELECT SUM(damage_dealt)::bigint as total_dmg FROM event_participants WHERE user_id = $1', [userId]);
    const fthXP = Math.floor(Number(fthRes.rows[0]?.total_dmg || 0) / 50);

    // VIG: Resilience (mapped from streak and consistency)
    const baseVigXP = Math.floor((streak * 100) + (varietyCount * 50));

    // Core Stats (STR, END)
    const baseStrXP = Math.floor(totalVolume * 0.05);
    const baseEndXP = Math.floor(totalReps * 5);

    // INT BONUS: Knowledge makes training more efficient
    const intLvl = getStatLevel(intXP);
    const intBonus = 1 + ((intLvl - 1) * 0.05); // +5% XP gain per level above 1

    const strXP = Math.round(baseStrXP * intBonus);
    const dexXP = Math.round(pwrXP * intBonus);
    const endXP = Math.round(baseEndXP * intBonus);
    const vigXP = Math.round(baseVigXP * intBonus);

    // Total XP for Character Level
    const totalXP = strXP + dexXP + endXP + vigXP + intXP + fthXP;

    // 4. Character Level Calculation (Hardcore: 1000 XP per level)
    const newLevel = Math.floor(totalXP / 1000) + 1;
    const xpIntoLevel = totalXP % 1000;
    
    // 5. Reward Logic (Every level reached gives a chest)
    let additionalChests = 0;
    let newLevelChestsClaimed = user.level_chests_claimed || 1;

    if (newLevel > newLevelChestsClaimed) {
      additionalChests = newLevel - newLevelChestsClaimed;
      newLevelChestsClaimed = newLevel;

      await createNotification(
        userId,
        'LEVEL_UP',
        null,
        `¡Has alcanzado el nivel ${newLevel}!`,
        newLevel.toString()
      );

      await createNotification(
        userId,
        'NEW_CHEST',
        null,
        `Has recibido ${additionalChests} cofre(s) por subir de nivel`,
        'LEVEL_CHEST'
      );
    }

    // 6. Final Sync to Users Table
    await query(`
      UPDATE users 
      SET 
        total_reps = $2,
        str_xp = $3,
        dex_xp = $4,
        end_xp = $5,
        vig_xp = $6,
        int_xp = $7,
        fth_xp = $8,
        total_xp = $9,
        current_level = $10,
        level_chests = COALESCE(level_chests, 0) + $11,
        level_chests_claimed = $12
      WHERE id = $1
    `, [
      userId, 
      totalReps, 
      strXP, dexXP, endXP, vigXP, intXP, fthXP, 
      totalXP, 
      newLevel, 
      additionalChests, 
      newLevelChestsClaimed
    ]);

    return {
      totalReps,
      strXP,
      dexXP,
      endXP,
      vigXP,
      intXP,
      fthXP,
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

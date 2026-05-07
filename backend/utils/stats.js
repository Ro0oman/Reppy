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

/**
 * Quadratic level formula for stats (base factor 100)
 */
export const getStatLevel = (xp) => {
  if (!xp || xp <= 0) return 1;
  const level = (1 + Math.sqrt(1 + 0.08 * xp)) / 2;
  return Math.floor(level);
};

/**
 * Quadratic level formula for global character level (base factor 1000)
 */
export const getGlobalLevel = (xp) => {
  if (!xp || xp <= 0) return 1;
  // L = (1 + sqrt(1 + 8 * XP / 1000)) / 2
  const level = (1 + Math.sqrt(1 + 0.008 * xp)) / 2;
  return Math.floor(level);
};

export const getXPForLevel = (level, factor = 100) => {
  if (level <= 1) return 0;
  return (factor * (level - 1) * level) / 2;
};

/**
 * Augments a user object from the DB with calculated level fields.
 */
export const augmentUserWithLevels = (user) => {
  if (!user) return null;
  
  const level = user.current_level || getGlobalLevel(user.total_xp);
  const totalXp = user.total_xp || 0;
  const xpCurrentLevelStart = getXPForLevel(level, 1000);
  const xpNextLevelStart = getXPForLevel(level + 1, 1000);

  const stats = ['str', 'dex', 'end', 'vig', 'int', 'fth'];
  const augmented = {
    ...user,
    current_level: level,
    xp_into_level: totalXp - xpCurrentLevelStart,
    xp_for_next_level: xpNextLevelStart - xpCurrentLevelStart
  };

  // Calculate Item Bonuses from fields like head_stats, weapon_stats, etc.
  const itemBonuses = { str: 0, dex: 0, end: 0, vig: 0, int: 0, fth: 0, cha: 0 };
  ['head', 'weapon', 'armor', 'boots'].forEach(slot => {
    const stats = user[`${slot}_stats`] || {};
    Object.keys(stats).forEach(key => {
      const k = key.toLowerCase();
      if (itemBonuses[k] !== undefined) {
        itemBonuses[k] += (stats[key] || 0);
      }
    });
  });

  stats.forEach(stat => {
    const xp = user[`${stat}_xp`] || 0;
    const baseLvl = getStatLevel(xp);
    let itemBonus = itemBonuses[stat] || 0;
    
    // Check for temporary stat bonuses (e.g., DEX potion)
    if (stat === 'dex' && user.dex_bonus && user.dex_bonus_expiry) {
      if (new Date(user.dex_bonus_expiry) > new Date()) {
        itemBonus += user.dex_bonus;
      }
    }

    const totalLvl = baseLvl + itemBonus;
    
    const lvlStart = getXPForLevel(baseLvl, 100);
    const lvlNext = getXPForLevel(baseLvl + 1, 100);
    
    augmented[`base_${stat}_lvl`] = baseLvl;
    augmented[`${stat}_lvl`] = totalLvl;
    augmented[`${stat}_bonus_lvl`] = itemBonus;
    augmented[`${stat}_xp_into_level`] = xp - lvlStart;
    augmented[`${stat}_xp_for_next_level`] = lvlNext - lvlStart;
  });

  // Include charisma
  const chaXp = user.cha_xp || 0;
  const baseChaLvl = getStatLevel(chaXp);
  const itemChaBonus = itemBonuses.cha || 0;
  const totalChaLvl = baseChaLvl + itemChaBonus;
  
  const chaStart = getXPForLevel(baseChaLvl, 100);
  const chaNext = getXPForLevel(baseChaLvl + 1, 100);
  
  augmented.base_cha_lvl = baseChaLvl;
  augmented.cha_lvl = totalChaLvl;
  augmented.cha_bonus_lvl = itemChaBonus;
  augmented.cha_xp_into_level = chaXp - chaStart;
  augmented.cha_xp_for_next_level = chaNext - chaStart;

  return augmented;
};



const recalcCache = new Map();

/**
 * Shared utility to recalculate and sync user stats (total_reps and XP levels)
 * based on the absolute history of their reps.
 * @param {string} userId - The ID of the user to recalculate
 * @param {boolean} force - If true, bypasses the 10-second throttle
 */
export const recalculateUserStats = async (userId, force = false) => {
  const now = Date.now();
  if (!force && recalcCache.has(userId)) {
    const last = recalcCache.get(userId);
    if (now - last < 10000) { // 10s throttle
       // Return current data from DB instead of recalculating
       const currentRes = await query('SELECT * FROM users WHERE id = $1', [userId]);
       return currentRes.rows[0];
    }
  }

  try {
    // 1. Get user data for level tracking
    const userRes = await query(`
      SELECT body_weight, current_level, level_chests_claimed, level_chests, cha_xp, last_streak_reward_date,
             equipped_head_id, equipped_weapon_id, equipped_armor_id, equipped_boots_id
      FROM users WHERE id = $1
    `, [userId]);
    if (userRes.rows.length === 0) return;
    const user = userRes.rows[0];
    const bodyWeight = parseFloat(user.body_weight) || 75.0;

    const statsRes = await query(`
      SELECT 
        SUM(CASE WHEN COALESCE(e.unit, 'reps') = 'seconds' THEN 0 ELSE r.count END)::int as total_reps,
        SUM(CASE WHEN COALESCE(e.unit, 'reps') = 'seconds' THEN 0 ELSE r.count * (COALESCE(r.added_weight, 0) + $2) END) as total_volume,
        SUM(CASE 
          WHEN r.exercise_type IN ('muscleups', 'weighted_pullups')
          THEN (r.count * (10 + COALESCE(r.added_weight, 0)))
          ELSE 0 
        END)::int as calculated_pwr_xp,
        COUNT(DISTINCT r.exercise_type) as variety_count
      FROM reps r
      LEFT JOIN exercises e ON e.slug = r.exercise_type
      WHERE r.user_id = $1
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

    // 4. Item Bonuses
    const equipmentRes = await query(`
      SELECT stats FROM items 
      WHERE id IN ($1, $2, $3, $4)
    `, [user.equipped_head_id, user.equipped_weapon_id, user.equipped_armor_id, user.equipped_boots_id]);
    
    const itemBonuses = { str: 0, dex: 0, end: 0, vig: 0, int: 0, fth: 0, cha: 0 };
    equipmentRes.rows.forEach(item => {
      const stats = item.stats || {};
      Object.keys(stats).forEach(key => {
        if (itemBonuses[key] !== undefined) {
          itemBonuses[key] += (stats[key] || 0);
        }
      });
    });

    // Core Stats (STR, END)
    const baseStrXP = Math.floor(totalVolume * 0.05);
    const baseEndXP = Math.floor(totalReps * 5);

    // INT BONUS: Knowledge makes training more efficient
    const intLvl = getStatLevel(intXP); // Base INT level
    const intBonus = 1 + ((intLvl - 1) * 0.05); // +5% XP gain per level above 1

    const strXP = Math.round(baseStrXP * intBonus);
    const dexXP = Math.round(pwrXP * intBonus);
    const endXP = Math.round(baseEndXP * intBonus);
    const vigXP = Math.round(baseVigXP * intBonus);

    // Include charisma
    const chaXP = user.cha_xp || 0;

    // Total XP for Character Level
    const totalXP = strXP + dexXP + endXP + vigXP + intXP + fthXP + chaXP;

    // 4. Character Level Calculation (Dynamic Quadratic: base 1000)
    // L = (1 + sqrt(1 + 8 * totalXP / 1000)) / 2
    const levelFloat = (1 + Math.sqrt(1 + 0.008 * totalXP)) / 2;
    const newLevel = Math.floor(levelFloat);
    
    const xpCurrentLevelStart = getXPForLevel(newLevel, 1000);
    const xpNextLevelStart = getXPForLevel(newLevel + 1, 1000);
    
    const xpIntoLevel = totalXP - xpCurrentLevelStart;
    const xpForNextLevel = xpNextLevelStart - xpCurrentLevelStart;

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
    
    // --- STREAK REWARDS ---
    const todayStr = getLocalDateString();
    let additionalCoins = 0;
    let newLastStreakRewardDate = user.last_streak_reward_date;

    // We reward if the streak is active (>0) AND it's a new day since the last reward
    // Note: streak is already calculated in step 2.
    const lastRewardDate = user.last_streak_reward_date ? getLocalDateString(user.last_streak_reward_date) : null;
    
    if (streak > 0 && lastRewardDate !== todayStr) {
      additionalCoins = streak * 50;
      newLastStreakRewardDate = todayStr;

      await createNotification(
        userId,
        'STREAK_REWARD',
        null,
        `¡Racha de ${streak} días! Has ganado ${additionalCoins} Reppy Coins`,
        streak.toString()
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
        level_chests_claimed = $12,
        reppy_coins = reppy_coins + $13,
        last_streak_reward_date = $14
      WHERE id = $1
    `, [
      userId, 
      totalReps, 
      strXP, dexXP, endXP, vigXP, intXP, fthXP, 
      totalXP, 
      newLevel, 
      additionalChests, 
      newLevelChestsClaimed,
      additionalCoins,
      newLastStreakRewardDate
    ]);
    
    // 7. Mission Triggers (XP and Streaks are absolute values, use isIncremental = false)
    const { updateMissionProgress } = await import('./missions.js');
    await updateMissionProgress(userId, 'streak', streak, false);
    await updateMissionProgress(userId, 'xp_str', strXP, false);
    await updateMissionProgress(userId, 'xp_pwr', dexXP, false); // dexXP maps to xp_pwr goal type
    await updateMissionProgress(userId, 'xp_end', endXP, false);
    await updateMissionProgress(userId, 'xp_agi', dexXP, false); // mapping agi to dex for legacy missions
    
    if (newLevel - (user.current_level || 0) >= 2) {
      await updateMissionProgress(userId, 'level_up_2', 1);
    }

    const result = {
      total_reps: totalReps,
      str_xp: strXP,
      dex_xp: dexXP,
      end_xp: endXP,
      vig_xp: vigXP,
      int_xp: intXP,
      fth_xp: fthXP,
      cha_xp: chaXP,
      total_xp: totalXP,
      current_level: newLevel,
      xp_into_level: xpIntoLevel,
      xp_for_next_level: xpForNextLevel,
      streak,
      total_volume: totalVolume
    };

    recalcCache.set(userId, Date.now());
    return result;

  } catch (err) {
    console.error(`[STATS_UTILS] CRITICAL: Failed to recalculate stats for user ${userId}:`, err);
    throw err;
  }
};

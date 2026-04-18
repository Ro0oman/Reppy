/**
 * RPG Damage System Utility
 * Handles stat-based damage calculation and random critical hits.
 */

/**
 * Calculates damage for a user logging reps.
 * 
 * Formula:
 * BaseDamage = Reps * ExerciseMultiplier
 * LevelMult = 1 + (GlobalLevel / 5)
 * MagicBonus = (StrLevel + PwrLevel) * 2
 * 
 * CritChance (%) = (AgiLevel * 1.5) + (PwrLevel * 0.5)
 * CritMultiplier = 1.5 + (PwrLevel * 0.05)
 * 
 * @param {Object} user User object containing levels and stats
 * @param {number} reps Number of repetitions
 * @param {string} type Exercise type (pullups, pushups, etc.)
 * @returns {Object} { totalDamage, isCrit, magicBonus, baseDamage }
 */
export const calculateDamage = (user, reps, type) => {
  // 1. Determine Exercise Multiplier (BUFFED)
  let exerciseMult = 3.0; // Base: Pullups
  const t = type?.toLowerCase();
  
  if (t === 'muscleups') exerciseMult = 10.0;
  else if (t === 'weighted_pullups') exerciseMult = 8.0;
  else if (t === 'dips') exerciseMult = 4.0;
  else if (t === 'pushups') exerciseMult = 2.0;
  
  // 2. Extract Stats & Levels (6-Stat System)
  const glvl = parseInt(user.current_level) || 1;
  const strLvl = parseInt(user.str_lvl) || 1;
  const dexLvl = parseInt(user.dex_lvl) || 1;
  const endLvl = parseInt(user.end_lvl) || 1;
  const vigLvl = parseInt(user.vig_lvl) || 1;
  const intLvl = parseInt(user.int_lvl) || 1;
  const fthLvl = parseInt(user.fth_lvl) || 1;

  // 3. Scaling Formula (Dark Souls Style)
  const baseDamage = reps * exerciseMult;
  
  // Level & INT Efficiency
  const levelMult = 1 + (glvl / 2); 
  const intBonus = 1 + (intLvl / 50); // Knowledge makes you more efficient
  
  // Physical Scaling (STR & END)
  const strScale = 1 + (strLvl / 25);
  const endScale = 1 + (endLvl / 50);
  
  // Flat Divine Bonus (FTH)
  const divineBonus = fthLvl * 15;

  let damageBeforeCrit = (baseDamage * levelMult * intBonus * strScale * endScale) + divineBonus;

  // 4. Critical Hit Roll (DEX & VIG)
  // DEX is primary for crit, VIG adds minor stability
  const critChance = (dexLvl * 2.5) + (vigLvl * 0.5);
  const isCrit = (Math.random() * 100) < Math.min(80, critChance); 
  
  let finalDamage = damageBeforeCrit;
  let critMult = 1;
  
  if (isCrit) {
    // DEX scales the crit multiplier
    critMult = 2.0 + (dexLvl * 0.1); 
    finalDamage = damageBeforeCrit * critMult;
  }

  return {
    totalDamage: Math.round(finalDamage),
    isCrit,
    divineBonus: Math.round(divineBonus),
    baseDamage: Math.round(baseDamage),
    critMultiplier: parseFloat(critMult.toFixed(2))
  };
};

/**
 * Calculates current Community Power scaling factor.
 * Used to adjust boss health dynamically.
 * 
 * @param {number} avgXP Average total_xp of the community
 * @returns {number} Scale factor (1.0+)
 */
export const getCommunityScaleFactor = (avgXP) => {
  return 1 + (avgXP / 5000);
};

export const getBaseBossHP = (orderIndex) => {
    // Base HP per order index (increasing)
    const baseHPs = [1000, 2500, 5000, 7500, 10000, 15000, 25000, 50000, 75000, 150000];
    return baseHPs[orderIndex % 10] || 10000;
};

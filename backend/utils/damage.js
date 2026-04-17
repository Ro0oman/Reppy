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
  // 1. Determine Exercise Multiplier
  let exerciseMult = 1;
  const t = type?.toLowerCase();
  
  if (t === 'muscleups') exerciseMult = 2;
  else if (t === 'weighted_pullups') exerciseMult = 3;
  else if (t === 'dips') exerciseMult = 1.2;
  else if (t === 'pushups') exerciseMult = 0.8; // Faster, so lower base
  
  // 2. Extract Stats & Levels
  const glvl = parseInt(user.current_level) || 1;
  const strLvl = parseInt(user.str_lvl) || 1;
  const pwrLvl = parseInt(user.pwr_lvl) || 1;
  const agiLvl = parseInt(user.agi_lvl) || 1;

  // 3. Base & Level Scaling
  const baseDamage = reps * exerciseMult;
  const levelMult = 1 + (glvl / 5); // Balanced: Level 30 = 7x
  const magicBonus = (strLvl + pwrLvl) * 3; // Balanced: Vet = 90

  let damageBeforeCrit = (baseDamage * levelMult) + magicBonus;

  // 4. Critical Hit Roll
  const critChance = (agiLvl * 1.5) + (pwrLvl * 0.5); // Balanced chance
  const isCrit = (Math.random() * 100) < Math.min(65, critChance); 
  
  let finalDamage = damageBeforeCrit;
  let critMult = 1;
  
  if (isCrit) {
    critMult = 1.75 + (pwrLvl * 0.07); // Balanced: Vet = ~2.8x
    finalDamage = damageBeforeCrit * critMult;
  }

  return {
    totalDamage: Math.round(finalDamage),
    isCrit,
    magicBonus: Math.round(magicBonus),
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

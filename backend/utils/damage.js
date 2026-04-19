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
 * @param {Object} boss Optional boss object to check for weaknesses
 * @returns {Object} { totalDamage, isCrit, magicBonus, baseDamage, weaknessBonus }
 */
export const calculateDamage = (user, reps, type, boss = null) => {
  // 1. Determine Exercise Multiplier (BUFFED)
  let exerciseMult = 3.0; // Base: Pullups
  const t = type?.toLowerCase();
  
  if (t === 'muscleups') exerciseMult = 10.0;
  else if (t === 'weighted_pullups') exerciseMult = 8.0;
  else if (t === 'dips') exerciseMult = 4.0;
  else if (t === 'pushups') exerciseMult = 2.0;
  
  // 2. Extract Stats & Levels (Augmented user expected)
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
  
  // Divine Scaling (FTH) - BUFFED
  const fthScale = 1 + (fthLvl / 40);
  const divineBonus = fthLvl * 25; // Base flat bonus

  let damageBeforeCrit = (baseDamage * levelMult * intBonus * strScale * endScale * fthScale) + divineBonus;

  // 4. Critical Hit Roll (DEX & VIG)
  const critChance = (dexLvl * 2.5) + (vigLvl * 0.5);
  const isCrit = (Math.random() * 100) < Math.min(80, critChance); 
  
  let finalDamage = damageBeforeCrit;
  let critMult = 1;
  
  if (isCrit) {
    critMult = 2.0 + (dexLvl * 0.1); 
    finalDamage = damageBeforeCrit * critMult;
  }

  // 5. Boss Weakness Logic
  let weaknessBonus = 1.0;
  if (boss && boss.weakness_stat) {
    const w = boss.weakness_stat.toLowerCase();
    
    // If user has leveled up the stat the boss is weak to, they deal extra damage
    // The bonus scales with the level of that stat
    const weaknessLevel = parseInt(user[`${w}_lvl`]) || 1;
    if (weaknessLevel > 1) {
       // 50% base bonus if weakness matched, plus 2% extra per level in that stat
       weaknessBonus = 1.5 + (weaknessLevel * 0.02);
    }
    
    finalDamage *= weaknessBonus;
  }

  // 6. Active Consumable Multiplier
  let activeMultiplier = 1.0;
  if (user.damage_multiplier && user.damage_multiplier_expiry) {
    const expiry = new Date(user.damage_multiplier_expiry);
    if (expiry > new Date()) {
      activeMultiplier = parseFloat(user.damage_multiplier) || 1.0;
      finalDamage *= activeMultiplier;
    }
  }

  return {
    totalDamage: Math.round(finalDamage),
    isCrit,
    divineBonus: Math.round(divineBonus),
    baseDamage: Math.round(baseDamage),
    critMultiplier: parseFloat(critMult.toFixed(2)),
    weaknessBonus: parseFloat(weaknessBonus.toFixed(2)),
    activeMultiplier: parseFloat(activeMultiplier.toFixed(2))
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

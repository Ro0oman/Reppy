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
export const calculateDamage = (user, reps, type, boss = null, skipBuffs = false, deterministic = false) => {
  // 1. Determine Exercise Multiplier (BUFFED)
  let exerciseMult = 3.0; // Base: Pullups
  const t = type?.toLowerCase();
  
  if (t === 'muscleups') exerciseMult = 10.0;
  else if (t === 'weighted_pullups') exerciseMult = 8.0;
  else if (t === 'dips') exerciseMult = 4.0;
  else if (t === 'pushups') exerciseMult = 2.0;
  else if (t === 'legs') exerciseMult = 2.0;
  
  // 2. Extract Stats & Levels (Augmented user expected)
  const glvl = parseInt(user.current_level) || 1;
  const strLvl = parseInt(user.str_lvl) || 1;
  let dexLvl = parseInt(user.dex_lvl) || 1;
  const endLvl = parseInt(user.end_lvl) || 1;
  const vigLvl = parseInt(user.vig_lvl) || 1;
  const intLvl = parseInt(user.int_lvl) || 1;
  const fthLvl = parseInt(user.fth_lvl) || 1;
  const chaLvl = parseInt(user.cha_lvl) || 1;

  // 3. Scaling Formula (Dark Souls Style)
  const baseDamageValue = reps * exerciseMult;
  
  // Level & INT Efficiency
  const levelMult = 1 + (glvl / 2); 
  const intBonus = 1 + (intLvl / 50); 
  const chaBonus = 1 + (chaLvl / 100); 
  
  // Physical Scaling (STR & END)
  const strScale = 1 + (strLvl / 25);
  const endScale = 1 + (endLvl / 50);
  
  // Divine Scaling (FTH)
  const fthScale = 1 + (fthLvl / 40);
  const divineBonus = fthLvl * 25; 

  // --- BASE DAMAGE (No gear, no buffs) ---
  const baseStatStr = parseInt(user.base_str_lvl) || strLvl;
  const baseStatEnd = parseInt(user.base_end_lvl) || endLvl;
  const baseStatFth = parseInt(user.base_fth_lvl) || fthLvl;
  
  const baseScale = (1 + (baseStatStr / 25)) * (1 + (baseStatEnd / 50)) * (1 + (baseStatFth / 40));
  const baseDivine = baseStatFth * 25;
  const baseFinalDamageNoCrit = (baseDamageValue * levelMult * intBonus * chaBonus * baseScale) + baseDivine;
  
  // --- DAMAGE WITH GEAR (No potions) ---
  const damageWithGearNoCrit = (baseDamageValue * levelMult * intBonus * chaBonus * strScale * endScale * fthScale) + divineBonus;
  
  // --- ACTIVE CONSUMABLE MULTIPLIER ---
  let activeMultiplier = 1.0;
  let dexBonus = 0;
  if (!skipBuffs && user.damage_multiplier_expiry && new Date(user.damage_multiplier_expiry) > new Date()) {
    activeMultiplier = parseFloat(user.damage_multiplier) || 1.0;
  }
  if (!skipBuffs && user.dex_bonus_expiry && new Date(user.dex_bonus_expiry) > new Date()) {
    dexBonus = parseInt(user.dex_bonus) || 0;
  }

  // Final dex level for crit
  const finalDexLvl = dexLvl; // dexLvl already includes gear/buffs if passed correctly, but let's be safe
  const critChance = (finalDexLvl * 2.5) + (vigLvl * 0.5);
  const critMult = 2.0 + (finalDexLvl * 0.1);

  // Determine Crit State
  let isCrit = false;
  let effectiveCritMult = 1.0;

  if (deterministic) {
    // For UI: Use average contribution
    effectiveCritMult = 1 + (Math.min(80, critChance) / 100 * (critMult - 1));
  } else {
    isCrit = (Math.random() * 100) < Math.min(80, critChance);
    effectiveCritMult = isCrit ? critMult : 1.0;
  }

  // --- FINAL CALCULATIONS ---
  let weaknessBonus = 1.0;
  if (boss && boss.weakness_stat) {
    const w = boss.weakness_stat.toLowerCase();
    const weaknessLevel = parseInt(user[`${w}_lvl`]) || 1;
    if (weaknessLevel > 1) {
       weaknessBonus = 1.5 + (weaknessLevel * 0.02);
    }
  }

  const finalDamage = damageWithGearNoCrit * activeMultiplier * effectiveCritMult * weaknessBonus;
  
  // Breakdown for UI
  // Note: We apply the same crit state to all components to keep them proportional in the breakdown
  const totalBase = baseFinalDamageNoCrit * effectiveCritMult * weaknessBonus;
  const totalWithGear = damageWithGearNoCrit * effectiveCritMult * weaknessBonus;
  const gearBonus = Math.max(0, totalWithGear - totalBase);
  const buffBonus = Math.max(0, finalDamage - totalWithGear);

  return {
    totalDamage: Math.round(finalDamage),
    isCrit,
    minDamage: Math.round(totalWithGear),
    maxDamage: Math.round(totalWithGear * critMult),
    baseDamage: Math.round(totalBase),
    gearBonus: Math.round(gearBonus),
    buffBonus: Math.round(buffBonus),
    critMultiplier: parseFloat(critMult.toFixed(2)),
    weaknessBonus: parseFloat(weaknessBonus.toFixed(2)),
    activeMultiplier: parseFloat(activeMultiplier.toFixed(2)),
    critChance: Math.min(80, Math.round(critChance))
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
    return 50000;
};

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
export const calculateDamage = (user, reps, type, boss = null, skipBuffs = false, deterministic = false, exerciseMultiplierOverride = null, addedWeightKg = 0) => {
  // 1. Determine Exercise Multiplier
  const weight = Math.max(0, Number(addedWeightKg) || 0);
  // Weight bonus: +1 multiplier per 20 kg, capped at +5x (100 kg)
  const weightBonus = Math.min(5.0, weight / 20);

  let exerciseMult = 3.0; // Base: Pullups
  if (exerciseMultiplierOverride != null) {
    exerciseMult = Number(exerciseMultiplierOverride) + weightBonus;
  } else {
    const t = type?.toLowerCase();

    if (t === 'muscleups') exerciseMult = 10.0 + weightBonus;
    else if (t === 'weighted_pullups') exerciseMult = 8.0 + weightBonus;
    else if (t === 'dips') exerciseMult = 4.0 + weightBonus;
    else if (t === 'pushups') exerciseMult = 2.0 + weightBonus;
    else if (t === 'legs') exerciseMult = 2.0 + weightBonus;
    else exerciseMult = 3.0 + weightBonus; // custom/imported exercises
  }
  
  // 2. Extract Stats & Levels (Augmented user expected)
  const glvl = parseInt(user.current_level) || 1;
  const strLvl = parseInt(user.str_lvl) || 1;
  let dexLvl = parseInt(user.dex_lvl) || 1;
  const endLvl = parseInt(user.end_lvl) || 1;
  const vigLvl = parseInt(user.vig_lvl) || 1;
  const intLvl = parseInt(user.int_lvl) || 1;
  const fthLvl = parseInt(user.fth_lvl) || 1;
  const chaLvl = parseInt(user.cha_lvl) || 1;

  // 3. Scaling Formula (Dark Souls Style) — computed PER REP.
  // Every rep is its own attack: the flat divine bonus AND the crit roll apply
  // per rep, so logging 20 reps at once is identical to logging them one-by-one.
  const perRepDamageValue = exerciseMult; // damage value of a single rep

  // Level & INT Efficiency
  const levelMult = 1 + (glvl / 2);
  const intBonus = 1 + (intLvl / 50);
  const chaBonus = 1 + (chaLvl / 100);

  // Physical Scaling (STR & END)
  const strScale = 1 + (strLvl / 25);
  const endScale = 1 + (endLvl / 50);

  // Divine Scaling (FTH)
  const fthScale = 1 + (fthLvl / 40);
  const divineBonus = fthLvl * 25; // FLAT bonus, applied per rep

  // --- BASE DAMAGE per rep (No gear, no buffs) ---
  const baseStatStr = parseInt(user.base_str_lvl) || strLvl;
  const baseStatEnd = parseInt(user.base_end_lvl) || endLvl;
  const baseStatFth = parseInt(user.base_fth_lvl) || fthLvl;

  const baseScale = (1 + (baseStatStr / 25)) * (1 + (baseStatEnd / 50)) * (1 + (baseStatFth / 40));
  const baseDivine = baseStatFth * 25; // FLAT bonus, applied per rep
  const perRepBaseNoCrit = (perRepDamageValue * levelMult * intBonus * chaBonus * baseScale) + baseDivine;

  // --- DAMAGE WITH GEAR per rep (No potions) ---
  const perRepGearNoCrit = (perRepDamageValue * levelMult * intBonus * chaBonus * strScale * endScale * fthScale) + divineBonus;

  // --- ACTIVE CONSUMABLE MULTIPLIER ---
  // Temporary stat bonuses (str/dex/end/...) are already folded into the *_lvl
  // values by augmentUserWithLevels, so they flow through the scaling below.
  // Only the global damage multiplier needs to be applied here.
  let activeMultiplier = 1.0;
  if (!skipBuffs && user.damage_multiplier_expiry && new Date(user.damage_multiplier_expiry) > new Date()) {
    activeMultiplier = parseFloat(user.damage_multiplier) || 1.0;
  }

  // Final dex level for crit (already includes gear + temporary buffs).
  const finalDexLvl = dexLvl;
  const critChance = Math.min(80, (finalDexLvl * 2.5) + (vigLvl * 0.5));
  const critMult = 2.0 + (finalDexLvl * 0.1);

  // 4. Per-rep crit rolls. Each rep independently rolls a critical hit; we
  // accumulate a crit-weighted rep count (sum of 1 or critMult per rep). This is
  // what makes a 20-rep set behave exactly like 20 single reps. Fractional reps
  // (timed exercises measured in seconds) get one extra weighted roll.
  const repsValue = Math.max(0, Number(reps) || 0);
  const fullReps = Math.floor(repsValue);
  const fracRep = repsValue - fullReps;

  let critWeightedReps;
  let critCount = 0;
  if (deterministic) {
    // For UI estimates, show the minimum expected damage without critical hits.
    critWeightedReps = repsValue;
  } else {
    critWeightedReps = 0;
    for (let i = 0; i < fullReps; i++) {
      if ((Math.random() * 100) < critChance) { critWeightedReps += critMult; critCount++; }
      else { critWeightedReps += 1; }
    }
    if (fracRep > 0) {
      if ((Math.random() * 100) < critChance) { critWeightedReps += fracRep * critMult; critCount++; }
      else { critWeightedReps += fracRep; }
    }
  }
  const isCrit = critCount > 0;

  // 5. Boss weakness multiplier
  let weaknessBonus = 1.0;
  if (boss && boss.weakness_stat) {
    const w = boss.weakness_stat.toLowerCase();
    const weaknessLevel = parseInt(user[`${w}_lvl`]) || 1;
    if (weaknessLevel > 1) {
       weaknessBonus = 1.5 + (weaknessLevel * 0.02);
    }
  }

  // --- FINAL CALCULATIONS (sum across reps via critWeightedReps) ---
  const totalBase = perRepBaseNoCrit * critWeightedReps * weaknessBonus;
  const totalWithGear = perRepGearNoCrit * critWeightedReps * weaknessBonus;
  const finalDamage = totalWithGear * activeMultiplier;
  const gearBonus = Math.max(0, totalWithGear - totalBase);
  const buffBonus = Math.max(0, finalDamage - totalWithGear);

  // Theoretical bounds for the whole set: no rep crits ↔ every rep crits.
  const setNoCrit = perRepGearNoCrit * repsValue * weaknessBonus;
  const setAllCrit = setNoCrit * critMult;

  return {
    totalDamage: Math.round(finalDamage),
    isCrit,
    minDamage: deterministic ? Math.round(finalDamage) : Math.round(setNoCrit),
    maxDamage: deterministic ? Math.round(finalDamage) : Math.round(setAllCrit),
    baseDamage: Math.round(totalBase),
    gearBonus: Math.round(gearBonus),
    buffBonus: Math.round(buffBonus),
    critMultiplier: parseFloat(critMult.toFixed(2)),
    weaknessBonus: parseFloat(weaknessBonus.toFixed(2)),
    activeMultiplier: parseFloat(activeMultiplier.toFixed(2)),
    critChance: Math.round(critChance)
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

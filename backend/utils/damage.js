/**
 * RPG Damage System Utility
 * Handles stat-based damage calculation and random critical hits.
 */
import { getPerkBonuses } from './perks.js';

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
 * @param {string|null} exerciseStat Optional combat stat of the logged exercise
 *        ('str'|'vig'|'end'); when it matches the boss weakness_stat/resist_stat
 *        it applies a ×1.4/×0.7 multiplier (auditoría 2026-07, opción B).
 * @returns {Object} { totalDamage, isCrit, magicBonus, baseDamage, weaknessBonus, exerciseMatchMult }
 */
export const calculateDamage = (user, reps, type, boss = null, skipBuffs = false, deterministic = false, exerciseMultiplierOverride = null, addedWeightKg = 0, exerciseStat = null) => {
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

  // Skill-tree combat perks — bounded modifiers layered on top of the stats above.
  const perks = getPerkBonuses(user.skill_perks);

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
  // Flat divine bonus, applied per rep. Nerfed 25 -> 5 (auditoría 2026-07) to
  // tame the damage->FTH->damage snowball: FTH XP comes from boss damage dealt,
  // so a big flat FTH bonus fed back into ever-larger hits. `fthScale` (the
  // multiplicative part) is untouched.
  const divineBonus = fthLvl * 5;

  // --- BASE DAMAGE per rep (No gear, no buffs) ---
  const baseStatStr = parseInt(user.base_str_lvl) || strLvl;
  const baseStatEnd = parseInt(user.base_end_lvl) || endLvl;
  const baseStatFth = parseInt(user.base_fth_lvl) || fthLvl;

  const baseScale = (1 + (baseStatStr / 25)) * (1 + (baseStatEnd / 50)) * (1 + (baseStatFth / 40));
  const baseDivine = baseStatFth * 5; // FLAT bonus, applied per rep (nerfed 25 -> 5, see above)
  const perRepBaseNoCrit = (perRepDamageValue * levelMult * intBonus * chaBonus * baseScale) + baseDivine;

  // --- DAMAGE WITH GEAR per rep (No potions) ---
  // The `power` perk adds a flat % to raw damage (folded into the gear bonus breakdown).
  const perkDamageMult = 1 + perks.damagePct;
  const perRepGearNoCrit = ((perRepDamageValue * levelMult * intBonus * chaBonus * strScale * endScale * fthScale) + divineBonus) * perkDamageMult;

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
  // crit_chance perk adds flat % before the 80% cap; crit_damage perk adds to the multiplier.
  const critChance = Math.min(80, (finalDexLvl * 2.5) + (vigLvl * 0.5) + perks.critChanceFlat);
  const critMult = 2.0 + (finalDexLvl * 0.1) + perks.critMultFlat;

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
       // weakness_hunter perk amplifies the exploit bonus.
       weaknessBonus = (1.5 + (weaknessLevel * 0.02)) * (1 + perks.weaknessPct);
    }
  }

  // 5b. Exercise-match multiplier (auditoría 2026-07, opción B). The muscle group
  // of the *logged exercise* maps to a combat stat (str/vig/end); hitting the
  // enemy's weakness amplifies, hitting its resist dampens. This is layered ON TOP
  // of the per-level weakness bonus above — training the right lift, not just
  // having the right stat leveled, now pays off. Only enemies whose object carries
  // weakness_stat/resist_stat (campaign enemies) are affected; a null exerciseStat
  // (unmapped/legacy exercise) stays neutral.
  let exerciseMatchMult = 1.0;
  if (boss && exerciseStat) {
    const es = String(exerciseStat).toLowerCase();
    const weak = boss.weakness_stat ? String(boss.weakness_stat).toLowerCase() : null;
    const resist = boss.resist_stat ? String(boss.resist_stat).toLowerCase() : null;
    if (weak && es === weak) exerciseMatchMult = 1.4;
    else if (resist && es === resist) exerciseMatchMult = 0.7;
  }

  // execution perk: bonus damage to a boss that's below 25% HP (the finishing blow).
  let executionMult = 1.0;
  if (boss && perks.executionPct > 0 && Number(boss.total_hp) > 0) {
    const hpRatio = Number(boss.current_hp) / Number(boss.total_hp);
    if (hpRatio < 0.25) executionMult = 1 + perks.executionPct;
  }

  // --- FINAL CALCULATIONS (sum across reps via critWeightedReps) ---
  const totalBase = perRepBaseNoCrit * critWeightedReps * weaknessBonus * exerciseMatchMult;
  const totalWithGear = perRepGearNoCrit * critWeightedReps * weaknessBonus * exerciseMatchMult;
  const finalDamage = totalWithGear * activeMultiplier * executionMult;
  const gearBonus = Math.max(0, totalWithGear - totalBase);
  const buffBonus = Math.max(0, finalDamage - totalWithGear);

  // Theoretical bounds for the whole set: no rep crits ↔ every rep crits.
  const setNoCrit = perRepGearNoCrit * repsValue * weaknessBonus * exerciseMatchMult;
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
    exerciseMatchMult: parseFloat(exerciseMatchMult.toFixed(2)),
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

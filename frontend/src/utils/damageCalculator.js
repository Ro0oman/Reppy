/**
 * Frontend Damage Estimator
 * Syncs with backend/utils/damage.js
 */
export const estimateDamage = (user, reps, type) => {
  if (!user || !reps) return { total: 0, base: 0, gear: 0 };

  let exerciseMult = 3.0;
  const t = type?.toLowerCase();
  if (t === 'muscleups') exerciseMult = 10.0;
  else if (t === 'weighted_pullups') exerciseMult = 8.0;
  else if (t === 'dips') exerciseMult = 4.0;
  else if (t === 'pushups') exerciseMult = 2.0;

  const glvl = parseInt(user.current_level) || 1;
  const strLvl = parseInt(user.str_lvl) || 1;
  const endLvl = parseInt(user.end_lvl) || 1;
  const intLvl = parseInt(user.int_lvl) || 1;
  const fthLvl = parseInt(user.fth_lvl) || 1;
  const chaLvl = parseInt(user.cha_lvl) || 1;

  const baseStatStr = parseInt(user.base_str_lvl) || strLvl;
  const baseStatEnd = parseInt(user.base_end_lvl) || endLvl;
  const baseStatFth = parseInt(user.base_fth_lvl) || fthLvl;

  const baseDamageValue = reps * exerciseMult;
  const levelMult = 1 + (glvl / 2);
  const intBonus = 1 + (intLvl / 50);
  const chaBonus = 1 + (chaLvl / 100);

  const baseScale = (1 + (baseStatStr / 25)) * (1 + (baseStatEnd / 50)) * (1 + (baseStatFth / 40));
  const baseDivine = baseStatFth * 25;
  const baseFinalDamage = (baseDamageValue * levelMult * intBonus * chaBonus * baseScale) + baseDivine;

  const strScale = 1 + (strLvl / 25);
  const endScale = 1 + (endLvl / 50);
  const fthScale = 1 + (fthLvl / 40);
  const divineBonus = fthLvl * 25;

  const damageBeforeCrit = (baseDamageValue * levelMult * intBonus * chaBonus * strScale * endScale * fthScale) + divineBonus;
  
  // Buff Multiplier
  let activeMultiplier = 1.0;
  if (user.damage_multiplier && user.damage_multiplier_expiry) {
    const expiry = new Date(user.damage_multiplier_expiry);
    if (expiry > new Date()) {
      activeMultiplier = parseFloat(user.damage_multiplier) || 1.0;
    }
  }

  const gearBonus = Math.max(0, damageBeforeCrit - baseFinalDamage);
  const total = damageBeforeCrit * activeMultiplier;

  return {
    total: Math.round(total),
    base: Math.round(baseFinalDamage * activeMultiplier),
    gear: Math.round(gearBonus * activeMultiplier)
  };
};

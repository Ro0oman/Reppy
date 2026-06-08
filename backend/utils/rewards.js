/**
 * Centralized logic for exercise rewards (Coins and XP).
 * statTypeOverride: pass the stat_type from the exercises table for custom/imported exercises.
 */
export const getExerciseRewards = (type, count, statTypeOverride = null) => {
  let coinMultiplier = 1;
  let statToUpgrade = statTypeOverride || 'end_xp';
  let extraStatToUpgrade = null;

  if (type === 'pullups') {
    coinMultiplier = 1;
    statToUpgrade = 'str_xp';
  } else if (type === 'pushups') {
    coinMultiplier = 1;
    statToUpgrade = 'end_xp';
  } else if (type === 'dips') {
    coinMultiplier = 2;
    statToUpgrade = 'str_xp';
  } else if (type === 'weighted_pullups') {
    coinMultiplier = 3;
    statToUpgrade = 'pwr_xp';
  } else if (type === 'muscleups') {
    coinMultiplier = 5;
    statToUpgrade = 'pwr_xp';
    extraStatToUpgrade = 'str_xp';
  } else if (type === 'legs') {
    coinMultiplier = 1;
    statToUpgrade = 'end_xp';
  }
  // For custom/imported exercises the caller passes statTypeOverride from the DB
  // and the default coinMultiplier = 1 applies.

  return {
    coins: count * coinMultiplier,
    statToUpgrade,
    extraStatToUpgrade
  };
};

/**
 * Calculates the boss damage multiplier based on exercise type.
 * Pullups/Dips/Pushups = 1x
 * Muscle-ups = 2x
 * Weighted Pullups = 3x
 */
export const getBossDamageMultiplier = (type) => {
  if (type === 'muscleups') return 2;
  if (type === 'weighted_pullups') return 3;
  return 1; // Default for pullups, dips, pushups
};

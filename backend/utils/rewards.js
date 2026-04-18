/**
 * Centralized logic for exercise rewards (Coins and XP).
 * Ensures consistency between live tracking and migration scripts.
 */
export const getExerciseRewards = (type, count) => {
  let coinMultiplier = 1;
  let statToUpgrade = 'str_xp';
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
    statToUpgrade = 'dex_xp'; 
  } else if (type === 'muscleups') { 
    coinMultiplier = 5; 
    statToUpgrade = 'dex_xp'; 
    extraStatToUpgrade = 'vig_xp'; 
  }

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

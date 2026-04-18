import { calculateDamage } from '../utils/damage.js';
import { augmentUserWithLevels, getStatLevel } from '../utils/stats.js';

// Mock users with different XP distributions
const userLow = {
  str_xp: 0,
  dex_xp: 0,
  end_xp: 0,
  vig_xp: 0,
  int_xp: 0,
  fth_xp: 0,
  total_xp: 0
};

const userHighFth = {
  str_xp: 100,
  dex_xp: 100,
  end_xp: 100,
  vig_xp: 100,
  int_xp: 100,
  fth_xp: 2000, // Level 21
  total_xp: 2500
};

const userHighInt = {
  str_xp: 100,
  dex_xp: 100,
  end_xp: 100,
  vig_xp: 100,
  int_xp: 1000, // Level 11
  fth_xp: 100,
  total_xp: 1500
};

const bossWeakToStr = { name: 'Titan', weakness_stat: 'str' };
const bossWeakToFth = { name: 'Spectral', weakness_stat: 'fth' };

console.log('--- DB AUGMENTATION TEST ---');
const augmentedLow = augmentUserWithLevels(userLow);
const augmentedFth = augmentUserWithLevels(userHighFth);
const augmentedInt = augmentUserWithLevels(userHighInt);

console.log('Low User LVLs:', augmentedLow.str_lvl, augmentedLow.fth_lvl, augmentedLow.current_level);
console.log('Faith User LVLs:', augmentedFth.str_lvl, augmentedFth.fth_lvl, augmentedFth.current_level);
console.log('Int User LVLs:', augmentedInt.str_lvl, augmentedInt.int_lvl, augmentedInt.current_level);

console.log('\n--- DAMAGE SCALING TEST ---');
const dmg1 = calculateDamage(augmentedLow, 10, 'pullups');
const dmg2 = calculateDamage(augmentedFth, 10, 'pullups');

console.log('Base User (Lvl 1) 10 Pullups Damage:', dmg1.totalDamage);
console.log('Faith User (Faith Lvl 21) 10 Pullups Damage:', dmg2.totalDamage);
console.log('Evolution Impact:', ((dmg2.totalDamage / dmg1.totalDamage - 1) * 100).toFixed(2) + '% increase');

console.log('\n--- BOSS WEAKNESS TEST ---');
const dmgWeak = calculateDamage(augmentedFth, 10, 'pullups', bossWeakToFth);
const dmgNoWeak = calculateDamage(augmentedFth, 10, 'pullups', bossWeakToStr);

console.log('Faith User vs Neutral Boss:', dmgNoWeak.totalDamage);
console.log('Faith User vs Weakness(FTH) Boss:', dmgWeak.totalDamage);
console.log('Weakness Impact:', ((dmgWeak.totalDamage / dmgNoWeak.totalDamage - 1) * 100).toFixed(2) + '% multiplier');

console.log('\n--- INTELLIGENCE XP BONUS TEST ---');
// Simulating the logic from recalculateUserStats
const simulateXP = (user) => {
    const intLvl = getStatLevel(user.int_xp);
    const intBonus = 1 + ((intLvl - 1) * 0.05);
    return { intLvl, intBonus };
};

const xpLow = simulateXP(userLow);
const xpInt = simulateXP(userHighInt);

console.log('Low User INT Lvl:', xpLow.intLvl, 'Bonus:', xpLow.intBonus);
console.log('Int User (1000 XP) INT Lvl:', xpInt.intLvl, 'Bonus:', xpInt.intBonus);
console.log('XP Multiplier for Int User:', xpInt.intBonus + 'x');

process.exit(0);

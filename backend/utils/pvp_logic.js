import { augmentUserWithLevels } from './stats.js';

/**
 * Deterministic PRNG based on a seed (string or number)
 */
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 0x85ebca6b);
    h = Math.imul(h ^ h >>> 13, 0xc2b2ae35);
    h = (h ^= h >>> 16) >>> 0;
    return h / 4294967296;
  };
}

/**
 * Centralized PvP Damage Calculation (DETERMINISTIC)
 * @param {Object} user - Raw user row from DB
 * @param {string} exercise - Exercise type
 * @param {number} reps - Number of repetitions
 * @param {Object} fight - Fight data (including seed, set_count1, set_count2)
 * @returns {Object} - { damage, isCrit, error, flags }
 */
export function calculatePvpDamage(user, exercise, reps, fight) {
  // 1. Basic Validation
  const allowed = typeof fight.allowed_exercises === 'string' 
    ? JSON.parse(fight.allowed_exercises) 
    : fight.allowed_exercises || [];
  
  if (!allowed.includes(exercise)) {
    return { error: `Ejercicio ${exercise} no permitido en este combate` };
  }

  const flags = [];
  if (fight.anticheat_enabled) {
    const limits = { pullups: 15, pushups: 40, dips: 25, muscleups: 10, weighted_pullups: 12 };
    const limit = limits[exercise] || 50;
    
    if (reps > limit) {
      return { error: `AntiCheat: Límite de ${exercise} superado (${limit} máx por set)` };
    }
    
    // Heuristic: Abnormal volume in a single set
    if (reps > limit * 0.8) flags.push('high_volume_burst');
  }

  if (reps <= 0) return { damage: 0, isCrit: false, flags };

  // 2. Deterministic "Luck" Check
  const isChallenger = fight.challenger_id === user.id;
  const setIndex = isChallenger ? (fight.set_count1 || 0) : (fight.set_count2 || 0);
  
  // Unique roll seed: fightSeed + userId + currentSetNumber
  const rollSeed = `${fight.seed}_${user.id}_${setIndex}`;
  const random = seededRandom(rollSeed);
  const luckRoll = random();

  // 3. Damage Calculation Logic
  const augmentedUser = augmentUserWithLevels(user);
  
  const bases = { pullups: 18, pushups: 8, dips: 14, muscleups: 35, weighted_pullups: 25 };
  const baseDmg = bases[exercise] || 10;

  const strBonus = (augmentedUser.str_lvl || 1) * 2;
  const agiBonus = (augmentedUser.agi_lvl || 1) * 0.5;
  
  // Crit chance based on Dex: 1.5% per level, capped at 30%
  const critChance = (augmentedUser.dex_lvl || 1) * 1.5;
  const isCrit = (luckRoll * 100) < Math.min(30, critChance);
  const critMult = isCrit ? 1.5 : 1.0;

  const damage = Math.round(((reps * baseDmg) + strBonus + agiBonus) * critMult);

  return { damage, isCrit, flags };
}

/**
 * Verifies if a user can log a set (cooldown)
 * @param {number} userId 
 * @param {number} fightId 
 * @param {Object} client - DB Client
 */
export async function checkPvpCooldown(userId, fightId, client) {
  const lastSetRes = await client.query(
    `SELECT created_at FROM pvp_events 
     WHERE fight_id = $1 AND user_id = $2 AND type = 'set' 
     ORDER BY created_at DESC LIMIT 1`,
    [fightId, userId]
  );

  if (lastSetRes.rows.length > 0) {
    const elapsed = Date.now() - new Date(lastSetRes.rows[0].created_at).getTime();
    const cooldown = 3000; // 3 seconds minimum between sets to prevent macro spam
    if (elapsed < cooldown) {
      return { error: `Sistema de recuperación activo: espera ${Math.ceil((cooldown - elapsed) / 1000)}s` };
    }
  }
  return { success: true };
}

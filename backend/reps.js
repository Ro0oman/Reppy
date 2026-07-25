import express from 'express';
import pool, { query } from './db.js';
import { authenticate } from './middleware.js';
import { repsLimiter } from './utils/rateLimiters.js';
import { getExerciseRewards, getBossDamageMultiplier } from './utils/rewards.js';
import { recalculateUserStats, augmentUserWithLevels } from './utils/stats.js';

import { syncBossHealth } from './utils/boss.js';
import { getLocalDateString } from './utils/date.js';
import { calculateDamage } from './utils/damage.js';
import { getPerkBonuses } from './utils/perks.js';
import { getUserWithGear } from './utils/user.js';
import { emitProgress } from './utils/progressEvents.js';
import { updateChallengeScores } from './utils/challenges.js';
import { broadcastDamage } from './socketManager.js';
import { applyBossDamage } from './utils/combat.js';
import { applyCampaignDamage } from './utils/campaignEngine.js';
import { getEffectiveExerciseCount, getRewardExerciseCount, isTimedExerciseUnit } from './utils/exerciseUnits.js';
import { getStreakStatus, JACKPOT_REWARD_COINS, JACKPOT_DAYS_REQUIRED } from './utils/streak.js';
import { createBossKillEvent } from './utils/bossKillEvent.js';


const router = express.Router();


// Get reps for a user
router.get('/', authenticate, async (req, res) => {
  const { type } = req.query;
  try {
    let q = 'SELECT id, count, date, exercise_type FROM reps WHERE user_id = $1';
    let params = [req.user.id];
    
    if (type && type !== 'all') {
      q += ' AND exercise_type = $2';
      params.push(type);
    }
    
    q += ' ORDER BY date DESC';
    
    const repsResult = await query(q, params);
    res.json(repsResult.rows);
  } catch (error) {
    console.error('Error fetching reps:', error);
    res.status(500).json({ message: 'Error fetching reps' });
  }
});

// Add or update reps for a date
// Sanity cap for a single logging event. Without it `count: 99999999` grants
// effectively unbounded coins/XP/boss damage. The `count` field also carries
// seconds for timed exercises, so the cap is generous (100k = ~27h if seconds)
// yet still blocks absurd values.
const MAX_REP_COUNT = 100000;

router.post('/', authenticate, repsLimiter, async (req, res) => {
  const { count, date, exercise_type = 'pullups', added_weight = 0 } = req.body;
  const userId = req.user.id;

  // --- Input validation (P0 security) ---
  const numericCount = Number(count);
  if (!Number.isFinite(numericCount) || numericCount < 0) {
    return res.status(400).json({ message: 'count inválido' });
  }
  if (numericCount > MAX_REP_COUNT) {
    return res.status(400).json({ message: `count fuera de rango (máximo ${MAX_REP_COUNT})` });
  }

  // A provided date may only be today or yesterday (server local time). This
  // blocks backfilling arbitrary dates to forge retroactive streaks. When
  // omitted, the handler defaults to today below.
  if (date !== undefined && date !== null && date !== '') {
    const validFormat = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
    const today = getLocalDateString();
    const yesterday = getLocalDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
    if (!validFormat || (date !== today && date !== yesterday)) {
      return res.status(400).json({ message: 'date solo puede ser hoy o ayer' });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const rawCount = Math.max(0, Number(count) || 0);
    const exerciseMetaRes = await client.query(
      'SELECT difficulty_multiplier, coin_multiplier, unit, stat_type FROM exercises WHERE slug = $1',
      [exercise_type]
    );
    const exerciseMeta = exerciseMetaRes.rows[0] || {};
    const exerciseUnit = exerciseMeta.unit || 'reps';
    const diffMult = exerciseMeta.difficulty_multiplier != null ? Number(exerciseMeta.difficulty_multiplier) : null;
    const coinMult = exerciseMeta.coin_multiplier != null ? Number(exerciseMeta.coin_multiplier) : null;
    const statTypeOverride = exerciseMeta.stat_type || null;
    const effectiveCount = getEffectiveExerciseCount(rawCount, exerciseUnit);
    const rewardCount = getRewardExerciseCount(rawCount, exerciseUnit);

    // 0. Get user and calculate damage first
    const userResult = await client.query(`
      SELECT u.*,
             iHead.stats as head_stats, iWeapon.stats as weapon_stats,
             iArmor.stats as armor_stats, iBoots.stats as boots_stats
      FROM users u
      LEFT JOIN items iHead ON u.equipped_head_id = iHead.id
      LEFT JOIN items iWeapon ON u.equipped_weapon_id = iWeapon.id
      LEFT JOIN items iArmor ON u.equipped_armor_id = iArmor.id
      LEFT JOIN items iBoots ON u.equipped_boots_id = iBoots.id
      WHERE u.id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) throw new Error('User not found');
    const augmentedUser = augmentUserWithLevels(userResult.rows[0]);
    const dmgResult = calculateDamage(augmentedUser, effectiveCount, exercise_type, null, false, false, diffMult, added_weight);

    // daily_blessing perk: bonus applies on a SECOND+ session the same day, so we
    // check for an existing rep today BEFORE inserting this one.
    const todayStr = date || getLocalDateString();
    const trainedTodayRes = await client.query(
      'SELECT 1 FROM reps WHERE user_id = $1 AND date = $2 AND count > 0 LIMIT 1',
      [userId, todayStr]
    );
    const trainedTodayAlready = trainedTodayRes.rows.length > 0;

    // 1. Insert or update reps
    const repResult = await client.query(
      `INSERT INTO reps (user_id, count, date, exercise_type, added_weight, is_crit)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, date, exercise_type)
       DO UPDATE SET count = reps.count + EXCLUDED.count,
                     added_weight = EXCLUDED.added_weight,
                     is_crit = EXCLUDED.is_crit
       RETURNING *`,
      [userId, rawCount, todayStr, exercise_type, parseFloat(added_weight) || 0, dmgResult.isCrit]
    );

    // 2. Rewards (Coins only, XP handled by recalculateUserStats)
    const baseCoins = coinMult != null
      ? Math.round(rewardCount * coinMult)
      : getExerciseRewards(exercise_type, rewardCount, statTypeOverride).coins;
    // Skill perks: coin_gain (%), coin_flat (per rep), daily_blessing (% on repeat days).
    const perkBonuses = getPerkBonuses(augmentedUser.skill_perks);
    const { coinPct, coinFlatPerRep, dailyCoinPct, gemChance } = perkBonuses;
    const dailyPct = trainedTodayAlready ? dailyCoinPct : 0;
    const earnedCoins = Math.round((baseCoins * (1 + coinPct + dailyPct)) + (coinFlatPerRep * rewardCount));
    await client.query(`UPDATE users SET reppy_coins = GREATEST(0, reppy_coins + $1) WHERE id = $2`, [earnedCoins, userId]);

    // gem_vein perk: one roll per logging event for a free Reppy Gem.
    let gemDropped = 0;
    if (gemChance > 0 && Math.random() < gemChance) {
      gemDropped = 1;
      await client.query('UPDATE users SET reppy_gems = reppy_gems + 1 WHERE id = $1', [userId]);
      await client.query(
        "INSERT INTO gem_transactions (user_id, amount, source, description) VALUES ($1, 1, 'skill_gem_vein', 'Veta de gemas')",
        [userId]
      );
    }

    // 3. Boss Interaction (shared routing — see utils/combat.js)
    const { bossId, actualDamageDealt, killed, boss } = await applyBossDamage(client, {
      user: augmentedUser,
      effectiveCount,
      exerciseType: exercise_type,
      diffMult,
      addedWeight: added_weight,
    });

    if (killed) {
      // Community boss kill event (fire-and-forget, runs after TX commits)
      createBossKillEvent(
        bossId, boss.name, boss.image_url, userId, augmentedUser.name
      ).catch(e => console.error('Boss kill event error:', e));
    }

    // 3b. Campaign routing (individual progression, opt-in via an engaged node).
    // Independent of the community boss: one set can damage both. Rule R4:
    // campaign damage is FINAL — it is not reverted when a rep is edited/deleted.
    const campaignResult = await applyCampaignDamage(client, {
      user: augmentedUser,
      effectiveCount,
      exerciseType: exercise_type,
      diffMult,
      addedWeight: added_weight,
    });

    // Update metadata in reps record
    await client.query(
      `UPDATE reps 
       SET boss_damage_dealt = COALESCE(boss_damage_dealt, 0) + $1,
           active_multiplier = $2,
           base_damage = COALESCE(base_damage, 0) + $3,
           gear_bonus = COALESCE(gear_bonus, 0) + $4,
           buff_bonus = COALESCE(buff_bonus, 0) + $5,
           boss_fight_id = $6
       WHERE id = $7`, 
      [actualDamageDealt, dmgResult.activeMultiplier, dmgResult.baseDamage, dmgResult.gearBonus, dmgResult.buffBonus, bossId, repResult.rows[0].id]
    );

    // 4. Update Missions (via the progress bus)
    if (!isTimedExerciseUnit(exerciseUnit)) {
      await emitProgress(userId, 'reps', rawCount, { exercise_type });
    }
    if (actualDamageDealt > 0) {
      await emitProgress(userId, 'damage', actualDamageDealt, { exercise_type });
    }

    // Async challenge scores
    updateChallengeScores(userId, { reps: rawCount, damage: actualDamageDealt }).catch(() => {});

    // Mission: Night Owl (Reps after 22:00)
    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour < 5) {
      await emitProgress(userId, 'night_owl', 1);
    }

    // Mission: Personal Record
    const prRes = await client.query(`
      SELECT 1 FROM (
        SELECT SUM(r.count) as day_total
        FROM reps r
        LEFT JOIN exercises e ON e.slug = r.exercise_type
        WHERE r.user_id = $1 AND r.date = $2 AND COALESCE(e.unit, 'reps') != 'seconds'
      ) t
      WHERE t.day_total > COALESCE((
        SELECT MAX(day_sum) FROM (
          SELECT SUM(r.count) as day_sum
          FROM reps r
          LEFT JOIN exercises e ON e.slug = r.exercise_type
          WHERE r.user_id = $1 AND r.date < $2 AND COALESCE(e.unit, 'reps') != 'seconds'
          GROUP BY r.date
        ) history
      ), 0)
    `, [userId, date || getLocalDateString()]);

    if (prRes.rows.length > 0) {
      await emitProgress(userId, 'personal_record', 1);
    }

    await client.query('COMMIT');

    // Recalculate stats after commit (Aggregated Truth)
    await recalculateUserStats(userId);

    // Referral reward: give referrer +50 gems on referred user's first reps.
    // ATOMIC CLAIM GATE — flip referral_reward_given FALSE->TRUE and read
    // referred_by in a single guarded UPDATE ... RETURNING. Postgres holds the
    // row lock for the duration of the UPDATE, so concurrent "first reps" of the
    // same user serialize and only ONE matches the row; losers get rowCount 0 and
    // pay nothing. The previous version read the flag with one query() and set it
    // with another, so two concurrent requests could both observe FALSE and pay
    // the referrer twice. Same shape as shop.js /daily/claim.
    try {
      const claimRes = await query(
        `UPDATE users
         SET referral_reward_given = TRUE
         WHERE id = $1 AND referral_reward_given = FALSE AND referred_by IS NOT NULL
         RETURNING referred_by`,
        [userId]
      );
      if (claimRes.rows[0]) {
        const referrerId = claimRes.rows[0].referred_by;
        await query('UPDATE users SET reppy_gems = reppy_gems + 50 WHERE id = $1', [referrerId]);
        await query(
          "INSERT INTO gem_transactions (user_id, amount, source, description) VALUES ($1, 50, 'referral_activated', 'Bonus por referido activado')",
          [referrerId]
        );
      }
    } catch (refErr) {
      console.error('Referral reward check failed:', refErr);
    }

    // Return the updated record with final totals
    const finalRecord = await query(
      'SELECT * FROM reps WHERE id = $1',
      [repResult.rows[0].id]
    );

    // ── 5/7 WEEKLY JACKPOT ──────────────────────────────────────────────
    // Check AFTER commit so streak status sees today's reps.
    // Only fires the first time the user hits JACKPOT_DAYS_REQUIRED unique
    // training days in the calendar week (Mon–Sun).
    let jackpotAwarded = false;
    try {
      const streakStatus = await getStreakStatus(userId);
      if (streakStatus.jackpotEligible) {
        const isoWeek = (() => {
          const d = new Date();
          const startOfYear = new Date(d.getFullYear(), 0, 1);
          const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
          return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
        })();
        // Atomic: only award if last_jackpot_week still doesn't match (race-safe)
        const jackpotRes = await query(
          `UPDATE users
             SET reppy_coins    = GREATEST(0, reppy_coins + $1),
                 last_jackpot_week = $2
           WHERE id = $3
             AND (last_jackpot_week IS NULL OR last_jackpot_week != $2)
           RETURNING id`,
          [JACKPOT_REWARD_COINS, isoWeek, userId]
        );
        if (jackpotRes.rowCount > 0) {
          jackpotAwarded = true;
          // Recalc so new coins show up immediately
          await recalculateUserStats(userId);
        }
      }
    } catch (jackpotErr) {
      console.error('[jackpot] non-critical error:', jackpotErr.message);
    }
    // ────────────────────────────────────────────────────────────────────

    res.json({
      ...finalRecord.rows[0],
      earnedCoins,
      is_crit: dmgResult.isCrit,
      damage_dealt_this_set: actualDamageDealt,
      jackpot_awarded: jackpotAwarded,
      jackpot_coins: jackpotAwarded ? JACKPOT_REWARD_COINS : 0,
      gem_dropped: gemDropped,
      campaign: campaignResult,
    });

    // Broadcast damage event for real-time visualization
    if (actualDamageDealt > 0) {
      broadcastDamage({
        userId: userId,
        userName: augmentedUser.name,
        amount: actualDamageDealt,
        exerciseType: exercise_type,
        isCrit: dmgResult.isCrit
      });
    }

  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Error adding reps:', error);
    res.status(500).json({ message: 'Error adding reps', error: error.message });
  } finally {
    client.release();
  }
});

// Get heatmap data (reps per day for the last year, filtered by type)
router.get('/heatmap', authenticate, async (req, res) => {
  const { type, year } = req.query;
  const userId = req.user.id;
  try {
    const isGlobal = !type || type === 'all' || type === 'undefined';
    
    let q = `SELECT TO_CHAR(r.date, 'YYYY-MM-DD') AS date, r.exercise_type,
                    COALESCE(e.title_key, r.exercise_type) AS title_key,
                    COALESCE(e.unit, 'reps') AS unit,
                    SUM(r.count)::int as count
             FROM reps r
             LEFT JOIN exercises e ON e.slug = r.exercise_type
             WHERE r.user_id = $1`;
    let params = [userId];

    if (!isGlobal) {
      q += ' AND r.exercise_type = $2';
      params.push(type);
    }

    if (year) {
      const yearInt = parseInt(year);
      q += ` AND r.date >= '${yearInt}-01-01' AND r.date <= '${yearInt}-12-31'`;
    }
    // No date limit when no year specified — show full history

    q += ' GROUP BY r.date, r.exercise_type, e.title_key, e.unit ORDER BY date ASC';

    const result = await query(q, params);

    const formattedRows = result.rows.map(row => ({
      ...row,
      count: Number(row.count)
    }));
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ message: 'Error fetching heatmap' });
  }
});

// Get stats for dashboard
router.get('/stats', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { type } = req.query;
  try {
    const isGlobal = !type || type === 'all';
    const typeFilter = isGlobal ? '' : 'AND exercise_type = $2';
    const params = isGlobal ? [userId] : [userId, type];

    const totalRes = await query(
      `SELECT SUM(count)::int as total FROM reps WHERE user_id = $1 ${typeFilter}`,
      params
    );
    const totalReps = parseInt(totalRes.rows[0]?.total) || 0;

    // 2. Daily Goal & Body Weight
    const userRes = await query('SELECT daily_goal, body_weight FROM users WHERE id = $1', [userId]);
    const { daily_goal, body_weight = 75 } = userRes.rows[0];

    // 3. Top Month for this exercise (or all)
    const topMonthRes = await query(
      `SELECT TO_CHAR(date, 'Month') as month, SUM(count) as total 
       FROM reps 
       WHERE user_id = $1 ${typeFilter}
       GROUP BY TO_CHAR(date, 'Month'), date_trunc('month', date)
       ORDER BY total DESC, date_trunc('month', date) DESC 
       LIMIT 1`,
      params
    );
    const topMonth = topMonthRes.rows[0]?.month?.trim() || 'N/A';
    const topMonthCount = parseInt(topMonthRes.rows[0]?.total) || 0;

    // 4. Current Streak for this exercise (or all)
    const datesRes = await query(
      `SELECT DISTINCT date FROM reps WHERE user_id = $1 ${typeFilter} ORDER BY date DESC`,
      params
    );
    
    let streak = 0;
    if (datesRes.rows.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const lastRepDate = new Date(datesRes.rows[0].date);
      lastRepDate.setHours(0,0,0,0);
      const diffDays = Math.floor((today - lastRepDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak = 1;
        for (let i = 0; i < datesRes.rows.length - 1; i++) {
          const current = new Date(datesRes.rows[i].date);
          const next = new Date(datesRes.rows[i+1].date);
          const d = Math.floor((current - next) / (1000 * 60 * 60 * 24));
          if (d === 1) streak++;
          else break;
        }
      }
    }

    // 5. Total Volume (Kg moved) for this exercise (or all)
    // IMPORTANT: Fix parameter indices here to avoid conflicts
    let volumeQuery = 'SELECT SUM(count * (COALESCE($2, 75.0) + added_weight))::float as volume FROM reps WHERE user_id = $1';
    let volumeParams = [userId, body_weight];
    
    if (!isGlobal) {
      volumeQuery += ' AND exercise_type = $3';
      volumeParams.push(type);
    }
    
    const volumeRes = await query(volumeQuery, volumeParams);
    const totalVolume = parseFloat(volumeRes.rows[0]?.volume) || 0;

    // 6. Combat Power (Damage per Rep)
    const user = await getUserWithGear(userId);
    const dmgPerRep = calculateDamage(user, 1, isGlobal ? 'pullups' : type, null, false, true);

    res.json({
      totalReps,
      streak,
      topMonth,
      topMonthCount,
      dailyGoal: daily_goal,
      bodyWeight: body_weight,
      totalVolume,
      combatPower: {
        total: dmgPerRep.totalDamage,
        base: dmgPerRep.baseDamage,
        gear: dmgPerRep.gearBonus,
        buff: dmgPerRep.buffBonus,
        multiplier: dmgPerRep.activeMultiplier,
        critChance: dmgPerRep.critChance,
        critMultiplier: dmgPerRep.critMultiplier,
        minDamage: dmgPerRep.minDamage,
        maxDamage: dmgPerRep.maxDamage
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Weekly summary for share card (last full ISO week: Mon-Sun)
router.get('/weekly-summary', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    // Compute last full ISO week (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() + mondayOffset);
    thisMonday.setHours(0, 0, 0, 0);
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);
    const lastSunday = new Date(thisMonday);
    lastSunday.setDate(thisMonday.getDate() - 1);

    const weekStart = lastMonday.toISOString().slice(0, 10);
    const weekEnd = lastSunday.toISOString().slice(0, 10);

    const [repsRes, userRes, streakStatus, rankingRes] = await Promise.all([
      query(
        `SELECT
           SUM(count)::int                                           AS total_reps,
           SUM(boss_damage_dealt)::int                              AS boss_damage,
           exercise_type
         FROM reps
         WHERE user_id = $1 AND date >= $2 AND date <= $3
         GROUP BY exercise_type`,
        [userId, weekStart, weekEnd]
      ),
      query(
        `SELECT
           u.current_level,
           u.level_chests,
           u.level_chests_claimed,
           u.damage_multiplier,
           u.damage_multiplier_expiry,
           u.total_reps         AS all_time_reps,
           u.is_private,
           iw.name  AS weapon_name,  iw.rarity AS weapon_rarity,
           ia.name  AS armor_name,   ia.rarity AS armor_rarity
         FROM users u
         LEFT JOIN items iw ON u.equipped_weapon_id = iw.id
         LEFT JOIN items ia ON u.equipped_armor_id  = ia.id
         WHERE u.id = $1`,
        [userId]
      ),
      getStreakStatus(userId),
      // Global rank by all-time total_reps (public users only)
      query(
        `SELECT (COUNT(*) + 1)::int AS global_rank,
                (SELECT COUNT(*)::int FROM users WHERE is_private = false AND total_reps > 0) AS total_players
         FROM users
         WHERE is_private = false
           AND total_reps > (SELECT total_reps FROM users WHERE id = $1)`,
        [userId]
      ),
    ]);

    const rows = repsRes.rows;
    const totalReps = rows.reduce((s, r) => s + (r.total_reps || 0), 0);
    const bossDamage = rows.reduce((s, r) => s + (r.boss_damage || 0), 0);

    // Star exercise: exercise_type with most reps
    let starExercise = null;
    let starCount = 0;
    for (const r of rows) {
      if (r.exercise_type && r.total_reps > starCount) {
        starCount = r.total_reps;
        starExercise = r.exercise_type;
      }
    }

    const user = userRes.rows[0] || {};

    // Active damage buff
    const buffActive = user.damage_multiplier_expiry
      && new Date(user.damage_multiplier_expiry) > new Date();
    const activeBuff = buffActive
      ? { multiplier: Number(user.damage_multiplier) }
      : null;

    // Unclaimed level chests
    const unclaimedChests = Math.max(0,
      (user.level_chests || 0) - (user.level_chests_claimed || 0)
    );

    const rankRow = rankingRes.rows[0] || {};
    const globalRank = rankRow.global_rank || null;
    const totalPlayers = rankRow.total_players || null;

    res.json({
      weekStart,
      weekEnd,
      totalReps,
      bossDamage,
      starExercise,
      starCount,
      streak: streakStatus.streak || 0,
      level: user.current_level || 1,
      gear: {
        weapon: user.weapon_name ? { name: user.weapon_name, rarity: user.weapon_rarity } : null,
        armor:  user.armor_name  ? { name: user.armor_name,  rarity: user.armor_rarity  } : null,
      },
      activeBuff,
      unclaimedChests,
      ranking: user.is_private ? null : { globalRank, totalPlayers },
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ message: 'Error fetching weekly summary' });
  }
});

// Edit reps by ID
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { count } = req.body;
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get old values
    const oldRes = await client.query(
      `SELECT r.count, r.exercise_type, r.boss_damage_dealt, r.date, r.boss_fight_id,
              COALESCE(e.unit, 'reps') AS exercise_unit,
              e.difficulty_multiplier,
              e.coin_multiplier
       FROM reps r
       LEFT JOIN exercises e ON e.slug = r.exercise_type
       WHERE r.id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (oldRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Rep not found' });
    }

    const oldRep = oldRes.rows[0];
    const rawCount = Math.max(0, Number(count) || 0);
    const exerciseUnit = oldRep.exercise_unit || 'reps';
    const diffMult = oldRep.difficulty_multiplier != null ? Number(oldRep.difficulty_multiplier) : null;
    const coinMult = oldRep.coin_multiplier != null ? Number(oldRep.coin_multiplier) : null;
    const effectiveCount = getEffectiveExerciseCount(rawCount, exerciseUnit);
    const oldRewardCount = getRewardExerciseCount(oldRep.count, exerciseUnit);
    const newRewardCount = getRewardExerciseCount(rawCount, exerciseUnit);
    const diffCount = rawCount - Number(oldRep.count || 0);

    if (diffCount === 0) {
      await client.query('ROLLBACK');
      return res.json(oldRep);
    }

    // 2. Rewards difference
    const oldCoins = coinMult != null
      ? Math.round(oldRewardCount * coinMult)
      : getExerciseRewards(oldRep.exercise_type, oldRewardCount).coins;
    const newCoins = coinMult != null
      ? Math.round(newRewardCount * coinMult)
      : getExerciseRewards(oldRep.exercise_type, newRewardCount).coins;
    const diffCoins = newCoins - oldCoins;

    // 3. User with gear & Damage
    const userResult = await client.query(`
      SELECT u.*,
             iHead.stats as head_stats, iWeapon.stats as weapon_stats,
             iArmor.stats as armor_stats, iBoots.stats as boots_stats
      FROM users u
      LEFT JOIN items iHead ON u.equipped_head_id = iHead.id
      LEFT JOIN items iWeapon ON u.equipped_weapon_id = iWeapon.id
      LEFT JOIN items iArmor ON u.equipped_armor_id = iArmor.id
      LEFT JOIN items iBoots ON u.equipped_boots_id = iBoots.id
      WHERE u.id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) throw new Error('User not found');
    const augmentedUser = augmentUserWithLevels(userResult.rows[0]);
    const repAddedWeight = parseFloat(oldRep.added_weight) || 0;
    const dmgResult = calculateDamage(augmentedUser, effectiveCount, oldRep.exercise_type, null, false, false, diffMult, repAddedWeight);

    // 4. Boss Health Adjustment
    let newBossDamageDealt = 0;
    const isToday = getLocalDateString(oldRep.date) === getLocalDateString();

    const bossRes = await client.query(
      `SELECT id, current_hp, total_hp FROM boss_fights
       WHERE id = $1 OR (status != 'defeated' AND $1 IS NULL)
       ORDER BY CASE WHEN id = $1 THEN 0 ELSE 1 END, order_index ASC LIMIT 1`,
      [oldRep.boss_fight_id]
    );

    if (bossRes.rows.length > 0) {
      const boss = bossRes.rows[0];
      const bossDmgResult = calculateDamage(augmentedUser, effectiveCount, oldRep.exercise_type, boss, false, false, diffMult, repAddedWeight);
      newBossDamageDealt = bossDmgResult.totalDamage;

      const bossHpChange = newBossDamageDealt - oldRep.boss_damage_dealt;
      
      const updateBossRes = await client.query(
          `UPDATE boss_fights 
           SET current_hp = GREATEST(0, LEAST(total_hp, current_hp - $1)),
               status = CASE 
                 WHEN current_hp - $1 <= 0 THEN 'defeated' 
                 WHEN current_hp - $1 > 0 AND status = 'defeated' THEN 'active'
                 ELSE status 
               END
           WHERE id = $2 RETURNING current_hp`, 
          [bossHpChange, boss.id]
      );

      await client.query(
        `UPDATE event_participants 
         SET damage_dealt = GREATEST(0, damage_dealt + $1) 
         WHERE boss_fight_id = $2 AND user_id = $3`,
        [bossHpChange, boss.id, userId]
      );
      
      if (updateBossRes.rows[0].current_hp === 0) {
          syncBossHealth().catch(e => console.error('Boss sync error:', e));
      }
    }

    // 5. Update reps table
    const updateResult = await client.query(
      `UPDATE reps 
       SET count = $1, boss_damage_dealt = $2, active_multiplier = $3,
           base_damage = $4, gear_bonus = $5, buff_bonus = $6, is_crit = $7
       WHERE id = $8 RETURNING *`,
      [rawCount, newBossDamageDealt, dmgResult.activeMultiplier, dmgResult.baseDamage, dmgResult.gearBonus, dmgResult.buffBonus, dmgResult.isCrit, id]
    );

    // 6. Update user coins
    await client.query(`UPDATE users SET reppy_coins = GREATEST(0, reppy_coins + $1) WHERE id = $2`, [diffCoins, userId]);
    
    if (isToday) {
      const dailyDamageChange = newBossDamageDealt - oldRep.boss_damage_dealt;
      await client.query(`UPDATE users SET daily_boss_damage = GREATEST(0, daily_boss_damage + $1) WHERE id = $2`, [dailyDamageChange, userId]);
    }

    await client.query('COMMIT');

    // 7. Recalculate stats (Outside transaction)
    await recalculateUserStats(userId);

    // CLEANUP: If reps reached 0, delete summary
    const remainingRes = await query(
      'SELECT COUNT(*) FROM reps WHERE user_id = $1 AND date = $2',
      [userId, oldRep.date]
    );
    if (parseInt(remainingRes.rows[0].count) === 0) {
      await query('DELETE FROM daily_summaries WHERE user_id = $1 AND date = $2', [userId, oldRep.date]);
    }

    res.json(updateResult.rows[0]);
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Error updating reps:', error);
    res.status(500).json({ message: 'Error updating reps', error: error.message });
  } finally {
    client.release();
  }
});

// Delete reps by ID
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get old values for deduction
    const oldRes = await client.query(
      `SELECT r.count, r.exercise_type, r.boss_damage_dealt, r.date, r.boss_fight_id,
              COALESCE(e.unit, 'reps') AS exercise_unit,
              e.coin_multiplier
       FROM reps r
       LEFT JOIN exercises e ON e.slug = r.exercise_type
       WHERE r.id = $1 AND r.user_id = $2`,
      [id, userId]
    );

    if (oldRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Rep not found' });
    }

    const oldRep = oldRes.rows[0];
    const rewardCount = getRewardExerciseCount(oldRep.count, oldRep.exercise_unit || 'reps');
    const oldCoins = oldRep.coin_multiplier != null
      ? Math.round(rewardCount * Number(oldRep.coin_multiplier))
      : getExerciseRewards(oldRep.exercise_type, rewardCount).coins;

    // 2. Restore Boss HP and adjust daily tracker
    if (oldRep.boss_damage_dealt > 0) {
      const bossRes = await client.query(
        `SELECT id, current_hp, total_hp, status FROM boss_fights 
         WHERE id = $1 OR (status != 'defeated' AND $1 IS NULL)
         ORDER BY CASE WHEN id = $1 THEN 0 ELSE 1 END, order_index ASC LIMIT 1`,
        [oldRep.boss_fight_id]
      );

      if (bossRes.rows.length > 0) {
        const boss = bossRes.rows[0];
        
        // Atomic restoration
        await client.query(
            `UPDATE boss_fights 
             SET current_hp = LEAST(total_hp, current_hp + $1),
                 status = CASE WHEN current_hp + $1 > 0 AND status = 'defeated' THEN 'active' ELSE status END
             WHERE id = $2`, 
            [oldRep.boss_damage_dealt, boss.id]
        );

        await client.query(
          `UPDATE event_participants 
           SET damage_dealt = GREATEST(0, damage_dealt - $1) 
           WHERE boss_fight_id = $2 AND user_id = $3`,
          [oldRep.boss_damage_dealt, boss.id, userId]
        );
      }

      // Adjust daily tracker
      const isToday = getLocalDateString(oldRep.date) === getLocalDateString();
      if (isToday) {
        await client.query(
          `UPDATE users SET daily_boss_damage = GREATEST(0, daily_boss_damage - $1) WHERE id = $2`,
          [oldRep.boss_damage_dealt, userId]
        );
      }
    }

    // 3. Delete from reps
    await client.query('DELETE FROM reps WHERE id = $1 AND user_id = $2', [id, userId]);

    // 4. Deduct coins (reps/xp handled by recalculateUserStats)
    await client.query(`UPDATE users SET reppy_coins = GREATEST(0, reppy_coins - $1) WHERE id = $2`, [oldCoins, userId]);

    await client.query('COMMIT');

    // 5. Recalculate stats
    await recalculateUserStats(userId);

    // CLEANUP: If this was the last rep for this date, delete the daily summary
    const remainingRes = await query(
      'SELECT COUNT(*) FROM reps WHERE user_id = $1 AND date = $2',
      [userId, oldRep.date]
    );
    if (parseInt(remainingRes.rows[0].count) === 0) {
      await query('DELETE FROM daily_summaries WHERE user_id = $1 AND date = $2', [userId, oldRep.date]);
    }

    res.json({ message: 'Rep deleted successfully' });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Error deleting reps:', error);
    res.status(500).json({ message: 'Error deleting reps', error: error.message });
  } finally {
    client.release();
  }
});


export default router;

import express from 'express';
import pool, { query } from './db.js';
import { authenticate } from './middleware.js';
import { getExerciseRewards } from './utils/rewards.js';
import { recalculateUserStats, augmentUserWithLevels } from './utils/stats.js';
import { syncBossHealth } from './utils/boss.js';
import { getLocalDateString } from './utils/date.js';
import { calculateDamage } from './utils/damage.js';
import { updateMissionProgress } from './utils/missions.js';
import { broadcastDamage } from './socketManager.js';
import { grantLastHitBonus } from './utils/bossRewards.js';

const router = express.Router();

const clampInt = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
};

const normalizeJson = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value;
};

const SOCIAL_PLAN_NAME_MAP = {
  plan_first_pullup_title: 'Primera Dominada',
  plan_five_pullups_title: '5 Dominadas',
  plan_ten_pullups_title: '10 Dominadas',
  plan_twenty_pushups_title: '20 Flexiones',
};

const SOCIAL_EXERCISE_NAME_MAP = {
  pullups: 'Dominadas',
  pushups: 'Flexiones',
  dips: 'Fondos',
  muscleups: 'Muscle Ups',
  weighted_pullups: 'Dominadas lastradas',
  legs: 'Pierna',
  scapular_pulls: 'Escapulares',
  dead_hang: 'Dead Hang',
  negative_pullups: 'Negativas de dominada',
  inverted_rows: 'Remos invertidos',
  plank: 'Plancha',
};

const toReadableSlug = (slug = '') =>
  String(slug)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

const shapePlan = (row) => ({
  id: row.id,
  slug: row.slug,
  titleKey: row.title_key,
  descriptionKey: row.description_key,
  goalType: row.goal_type,
  durationDays: Number(row.duration_days || 0),
  difficulty: row.difficulty,
});

const shapeWorkout = (row, blocks = []) => ({
  plan: {
    id: row.plan_id,
    slug: row.slug,
    titleKey: row.plan_title_key,
    descriptionKey: row.description_key,
    durationDays: Number(row.duration_days || 0),
    currentDay: Number(row.current_day || 1),
    daysPerWeek: Number(row.days_per_week || 3),
  },
  day: {
    id: row.plan_day_id,
    dayNumber: Number(row.day_number || 1),
    titleKey: row.day_title_key,
    focus: row.focus,
    estimatedMinutes: Number(row.estimated_minutes || 12),
    rewardXp: Number(row.reward_xp || 0),
    rewardCoins: Number(row.reward_coins || 0),
  },
  blocks: blocks.map(block => ({
    id: block.id,
    orderIndex: Number(block.order_index || 0),
    blockType: block.block_type,
    title: block.title,
    instructions: block.instructions,
    exerciseType: block.exercise_type,
    targetSets: Number(block.target_sets || 1),
    targetReps: Number(block.target_reps || 1),
    restSeconds: Number(block.rest_seconds || 60),
  })),
});

async function getActivePlanBundle(userId) {
  const activeResult = await query(
    `SELECT
       uap.*,
       TO_CHAR(uap.last_completed_date, 'YYYY-MM-DD') AS last_completed_date_str,
       tp.slug,
       tp.title_key AS plan_title_key,
       tp.description_key,
       tp.goal_type,
       tp.duration_days,
       tp.difficulty,
       tpd.id AS plan_day_id,
       tpd.day_number,
       tpd.title_key AS day_title_key,
       tpd.focus,
       tpd.estimated_minutes,
       tpd.reward_xp,
       tpd.reward_coins
     FROM user_active_plans uap
     JOIN training_plans tp ON tp.id = uap.plan_id
     LEFT JOIN training_plan_days tpd
       ON tpd.plan_id = tp.id
      AND tpd.day_number = LEAST(uap.current_day, tp.duration_days)
     WHERE uap.user_id = $1
       AND uap.status IN ('active', 'paused')
       AND tp.is_active = TRUE
     LIMIT 1`,
    [userId]
  );

  if (activeResult.rows.length === 0) {
    return { activePlan: null, todayWorkout: null };
  }

  const row = activeResult.rows[0];
  const blocksResult = await query(
    `SELECT *
     FROM training_plan_blocks
     WHERE plan_day_id = $1
     ORDER BY order_index ASC`,
    [row.plan_day_id]
  );

  return {
    activePlan: {
      slug: row.slug,
      titleKey: row.plan_title_key,
      descriptionKey: row.description_key,
      goalType: row.goal_type,
      durationDays: Number(row.duration_days || 0),
      currentDay: Number(row.current_day || 1),
      daysPerWeek: Number(row.days_per_week || 3),
      baseline: row.baseline || {},
      equipment: row.equipment || {},
      status: row.status,
      startedAt: row.started_at,
      lastCompletedDateStr: row.last_completed_date_str,
      lastCompletedDay: Number(row.last_completed_day || 0),
    },
    todayWorkout: row.status === 'active' && row.plan_day_id ? shapeWorkout(row, blocksResult.rows) : null,
  };
}

async function applyGuidedRepLog(client, userId, exerciseType, count) {
  if (!count || count <= 0) return { damage: 0, coins: 0 };

  const exRes = await client.query('SELECT difficulty_multiplier, coin_multiplier FROM exercises WHERE slug = $1', [exerciseType]);
  let diffMult = null;
  let coinMult = null;
  if (exRes.rows.length > 0) {
    diffMult = Number(exRes.rows[0].difficulty_multiplier);
    coinMult = Number(exRes.rows[0].coin_multiplier);
  }

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
  const dmgResult = calculateDamage(augmentedUser, count, exerciseType, null, false, false, diffMult);
  const date = getLocalDateString();

  const repResult = await client.query(
    `INSERT INTO reps (user_id, count, date, exercise_type, added_weight, is_crit)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, date, exercise_type)
     DO UPDATE SET count = reps.count + EXCLUDED.count,
                   added_weight = EXCLUDED.added_weight,
                   is_crit = EXCLUDED.is_crit
     RETURNING *`,
    [userId, count, date, exerciseType, 0, dmgResult.isCrit]
  );

  let earnedCoins = 0;
  if (coinMult != null) {
    earnedCoins = Math.round(count * coinMult);
  } else {
    earnedCoins = getExerciseRewards(exerciseType, count).coins;
  }

  await client.query(
    `UPDATE users SET reppy_coins = GREATEST(0, reppy_coins + $1) WHERE id = $2`,
    [earnedCoins, userId]
  );

  const bossRes = await client.query(
    `SELECT id, name, current_hp, total_hp
     FROM boss_fights
     WHERE status != 'defeated'
     ORDER BY order_index ASC
     LIMIT 1`
  );

  let actualDamageDealt = 0;
  let bossId = null;

  if (bossRes.rows.length > 0) {
    const boss = bossRes.rows[0];
    bossId = boss.id;
    const bossDmgResult = calculateDamage(augmentedUser, count, exerciseType, boss, false, false, diffMult);
    actualDamageDealt = bossDmgResult.totalDamage;

    const updateBossRes = await client.query(
      `UPDATE boss_fights
       SET current_hp = GREATEST(0, current_hp - $1),
           status = CASE WHEN current_hp - $1 <= 0 THEN 'defeated' ELSE status END
       WHERE id = $2
       RETURNING current_hp`,
      [actualDamageDealt, bossId]
    );

    await client.query(
      `INSERT INTO event_participants (boss_fight_id, user_id, damage_dealt)
       VALUES ($1, $2, $3)
       ON CONFLICT (boss_fight_id, user_id)
       DO UPDATE SET damage_dealt = event_participants.damage_dealt + EXCLUDED.damage_dealt`,
      [bossId, userId, actualDamageDealt]
    );

    await client.query(
      `UPDATE users
       SET daily_boss_damage = CASE
         WHEN last_boss_damage_date = CURRENT_DATE THEN daily_boss_damage + $1
         ELSE $1
       END,
       last_boss_damage_date = CURRENT_DATE
       WHERE id = $2`,
      [actualDamageDealt, userId]
    );

    if (updateBossRes.rows[0]?.current_hp === 0) {
      syncBossHealth().catch(e => console.error('Boss sync error:', e));
      await updateMissionProgress(userId, 'boss_last_hit', 1);
      const lastHitReward = await grantLastHitBonus(userId, bossId, client);
      if (lastHitReward) {
        broadcastDamage({
          type: 'LAST_HIT',
          userId,
          userName: augmentedUser.name,
          bossName: boss.name,
          reward: lastHitReward,
        });
      }
    }
  }

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

  await updateMissionProgress(userId, 'reps', count);
  if (actualDamageDealt > 0) {
    await updateMissionProgress(userId, 'damage', actualDamageDealt);
  }

  const currentHour = new Date().getHours();
  if (currentHour >= 22 || currentHour < 5) {
    await updateMissionProgress(userId, 'night_owl', 1);
  }

  const prRes = await client.query(`
    SELECT 1 FROM (
      SELECT SUM(count) as day_total
      FROM reps
      WHERE user_id = $1 AND date = $2
    ) t
    WHERE t.day_total > COALESCE((
      SELECT MAX(day_sum) FROM (
        SELECT SUM(count) as day_sum
        FROM reps
        WHERE user_id = $1 AND date < $2
        GROUP BY date
      ) history
    ), 0)
  `, [userId, date]);

  if (prRes.rows.length > 0) {
    await updateMissionProgress(userId, 'personal_record', 1);
  }

  if (actualDamageDealt > 0) {
    broadcastDamage({
      userId,
      userName: augmentedUser.name,
      amount: actualDamageDealt,
      exerciseType,
      isCrit: dmgResult.isCrit,
    });
  }

  return { damage: actualDamageDealt, coins: earnedCoins };
}

router.get('/plans', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT *
       FROM training_plans
       WHERE is_active = TRUE
       ORDER BY id ASC`
    );

    res.json({ plans: result.rows.map(shapePlan) });
  } catch (error) {
    console.error('Error fetching training plans:', error);
    res.status(500).json({ message: 'Error fetching training plans' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT id, total_reps, onboarding_mode, goal_onboarding_completed
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    const bundle = await getActivePlanBundle(req.user.id);
    const onboardingCompleted = !!user.goal_onboarding_completed;

    const todayResult = await query(`SELECT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS today, TO_CHAR(CURRENT_DATE + INTERVAL '1 day', 'YYYY-MM-DD') AS tomorrow`);
    const todayStr = todayResult.rows[0].today;
    const completedToday = !!(bundle.activePlan && bundle.activePlan.lastCompletedDateStr === todayStr);

    const isPlanPaused = bundle.activePlan?.status === 'paused';
    const isTrainingLockedToday = completedToday || isPlanPaused;
    let lockedUntilDate = null;
    let todayWorkout = bundle.todayWorkout;
    let nextWorkoutPreview = null;

    if (completedToday) {
      nextWorkoutPreview = bundle.todayWorkout;
      todayWorkout = null;
      lockedUntilDate = todayResult.rows[0].tomorrow;
    } else if (isPlanPaused) {
      nextWorkoutPreview = null;
      todayWorkout = null;
    }

    res.json({
      activePlan: bundle.activePlan,
      todayWorkout,
      isTrainingLockedToday,
      lockedUntilDate,
      completedToday,
      isPlanPaused,
      nextWorkoutPreview,
      onboardingMode: user.onboarding_mode || null,
      onboardingCompleted,
      canShowOnboarding: !onboardingCompleted && Number(user.total_reps || 0) <= 20,
    });
  } catch (error) {
    console.error('Error fetching training state:', error);
    res.status(500).json({ message: 'Error fetching training state' });
  }
});

router.post('/select', authenticate, async (req, res) => {
  const { planSlug, daysPerWeek = 3, baseline = {}, equipment = {} } = req.body;

  if (!planSlug) {
    return res.status(400).json({ message: 'planSlug is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const planResult = await client.query(
      `SELECT id FROM training_plans WHERE slug = $1 AND is_active = TRUE`,
      [planSlug]
    );

    if (planResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Training plan not found' });
    }

    await client.query(
      `INSERT INTO user_active_plans (
        user_id, plan_id, current_day, days_per_week, baseline, equipment, status
      )
      VALUES ($1, $2, 1, $3, $4, $5, 'active')
      ON CONFLICT (user_id)
      DO UPDATE SET
        plan_id = EXCLUDED.plan_id,
        current_day = 1,
        days_per_week = EXCLUDED.days_per_week,
        baseline = EXCLUDED.baseline,
        equipment = EXCLUDED.equipment,
        status = 'active',
        started_at = CURRENT_DATE,
        last_completed_date = NULL,
        last_completed_day = NULL`,
      [
        req.user.id,
        planResult.rows[0].id,
        Math.min(7, Math.max(1, clampInt(daysPerWeek, 3))),
        JSON.stringify(normalizeJson(baseline)),
        JSON.stringify(normalizeJson(equipment)),
      ]
    );

    await client.query(
      `UPDATE users
       SET onboarding_mode = 'guided',
           goal_onboarding_completed = TRUE
       WHERE id = $1`,
      [req.user.id]
    );

    await client.query('COMMIT');
    const bundle = await getActivePlanBundle(req.user.id);
    res.json({ ok: true, ...bundle });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error selecting training plan:', error);
    res.status(500).json({ message: 'Error selecting training plan' });
  } finally {
    client.release();
  }
});

router.post('/free-mode', authenticate, async (req, res) => {
  try {
    await query(
      `UPDATE users
       SET onboarding_mode = 'free',
           goal_onboarding_completed = TRUE
       WHERE id = $1`,
      [req.user.id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Error setting free mode:', error);
    res.status(500).json({ message: 'Error setting free mode' });
  }
});

router.post('/abandon', authenticate, async (req, res) => {
  try {
    await query(
      `UPDATE user_active_plans
       SET status = 'abandoned'
       WHERE user_id = $1 AND status IN ('active', 'paused')`,
      [req.user.id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Error abandoning training plan:', error);
    res.status(500).json({ message: 'Error abandoning training plan' });
  }
});

router.post('/pause', authenticate, async (req, res) => {
  try {
    await query(
      `UPDATE user_active_plans
       SET status = 'paused'
       WHERE user_id = $1 AND status = 'active'`,
      [req.user.id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Error pausing training plan:', error);
    res.status(500).json({ message: 'Error pausing training plan' });
  }
});

router.post('/resume', authenticate, async (req, res) => {
  try {
    await query(
      `UPDATE user_active_plans
       SET status = 'active'
       WHERE user_id = $1 AND status = 'paused'`,
      [req.user.id]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error('Error resuming training plan:', error);
    res.status(500).json({ message: 'Error resuming training plan' });
  }
});

router.post('/sessions/start', authenticate, async (req, res) => {
  const { planDayId } = req.body;

  if (!planDayId) {
    return res.status(400).json({ message: 'planDayId is required' });
  }

  try {
    const checkCompletedToday = await query(
      `SELECT TO_CHAR(last_completed_date, 'YYYY-MM-DD') AS last_completed_date_str,
              TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS today,
              TO_CHAR(CURRENT_DATE + INTERVAL '1 day', 'YYYY-MM-DD') AS tomorrow
       FROM user_active_plans
       WHERE user_id = $1 AND status = 'active'`,
      [req.user.id]
    );

    if (checkCompletedToday.rows.length > 0) {
      const row = checkCompletedToday.rows[0];
      const todayStr = row.today;
      if (row.last_completed_date_str === todayStr) {
        return res.status(409).json({ message: 'Training locked until tomorrow', lockedUntilDate: row.tomorrow });
      }
    }

    const validation = await query(
      `SELECT tp.id AS plan_id, tpd.id AS plan_day_id
       FROM user_active_plans uap
       JOIN training_plans tp ON tp.id = uap.plan_id
       JOIN training_plan_days tpd ON tpd.plan_id = tp.id
       WHERE uap.user_id = $1
         AND uap.status = 'active'
         AND tpd.id = $2
         AND tpd.day_number = LEAST(uap.current_day, tp.duration_days)`,
      [req.user.id, planDayId]
    );

    if (validation.rows.length === 0) {
      return res.status(403).json({ message: 'Training day is not available for this user' });
    }

    const sessionResult = await query(
      `INSERT INTO workout_sessions (user_id, plan_id, plan_day_id, status)
       VALUES ($1, $2, $3, 'started')
       RETURNING *`,
      [req.user.id, validation.rows[0].plan_id, validation.rows[0].plan_day_id]
    );

    res.json({ session: sessionResult.rows[0] });
  } catch (error) {
    console.error('Error starting training session:', error);
    res.status(500).json({ message: 'Error starting training session' });
  }
});

router.post('/sessions/:id/complete', authenticate, async (req, res) => {
  const sessionId = clampInt(req.params.id);
  const incomingSets = Array.isArray(req.body.sets) ? req.body.sets : [];

  if (!sessionId) {
    return res.status(400).json({ message: 'Invalid session id' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const sessionResult = await client.query(
      `SELECT
         ws.*,
         tpd.reward_xp,
         tpd.reward_coins,
         tp.duration_days,
         tp.title_key AS plan_title_key,
         uap.current_day
       FROM workout_sessions ws
       JOIN training_plan_days tpd ON tpd.id = ws.plan_day_id
       JOIN training_plans tp ON tp.id = ws.plan_id
       JOIN user_active_plans uap ON uap.user_id = ws.user_id AND uap.plan_id = ws.plan_id
       WHERE ws.id = $1
         AND ws.user_id = $2
         AND ws.status = 'started'
         AND uap.status = 'active'
         AND tpd.day_number = LEAST(uap.current_day, tp.duration_days)
         AND (
           uap.last_completed_date IS NULL
           OR uap.last_completed_date <> CURRENT_DATE
         )
       FOR UPDATE OF ws, uap`,
      [sessionId, req.user.id]
    );

    if (sessionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Workout session is no longer available for the current training day' });
    }

    const session = sessionResult.rows[0];
    const blocksResult = await client.query(
      `SELECT *
       FROM training_plan_blocks
       WHERE plan_day_id = $1
       ORDER BY order_index ASC`,
      [session.plan_day_id]
    );

    const blocksById = new Map(blocksResult.rows.map(block => [Number(block.id), block]));
    const logs = [];

    for (const rawSet of incomingSets) {
      const blockId = clampInt(rawSet.blockId ?? rawSet.block_id);
      const block = blocksById.get(blockId);
      if (!block) continue;

      logs.push({
        blockId,
        setIndex: Math.max(1, clampInt(rawSet.setIndex ?? rawSet.set_index, 1)),
        exerciseType: rawSet.exerciseType || rawSet.exercise_type || block.exercise_type || 'pullups',
        targetReps: clampInt(rawSet.targetReps ?? rawSet.target_reps, block.target_reps || 0),
        actualReps: clampInt(rawSet.actualReps ?? rawSet.actual_reps, 0),
        completed: !!rawSet.completed,
      });
    }

    if (logs.length === 0) {
      for (const block of blocksResult.rows) {
        for (let i = 1; i <= Number(block.target_sets || 1); i += 1) {
          logs.push({
            blockId: block.id,
            setIndex: i,
            exerciseType: block.exercise_type || 'pullups',
            targetReps: Number(block.target_reps || 0),
            actualReps: 0,
            completed: false,
          });
        }
      }
    }

    await client.query('DELETE FROM workout_set_logs WHERE session_id = $1', [sessionId]);

    let totalReps = 0;
    let targetRepsTotal = 0;
    const repsByExercise = new Map();

    for (const log of logs) {
      totalReps += log.actualReps;
      targetRepsTotal += log.targetReps;
      repsByExercise.set(log.exerciseType, (repsByExercise.get(log.exerciseType) || 0) + log.actualReps);

      await client.query(
        `INSERT INTO workout_set_logs (
          session_id, block_id, set_index, exercise_type, target_reps, actual_reps, completed
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [sessionId, log.blockId, log.setIndex, log.exerciseType, log.targetReps, log.actualReps, log.completed]
      );
    }

    const completionRate = targetRepsTotal > 0
      ? Math.max(0, Math.min(100, Math.round((totalReps / targetRepsTotal) * 100)))
      : 0;

    let totalDamage = 0;
    let earnedCoins = 0;

    for (const [exerciseType, repsCount] of repsByExercise.entries()) {
      const result = await applyGuidedRepLog(client, req.user.id, exerciseType, repsCount);
      totalDamage += result.damage;
      earnedCoins += result.coins;
    }

    await client.query(
      `UPDATE workout_sessions
       SET status = 'completed',
           total_reps = $1,
           total_damage = $2,
           reward_xp = $3,
           reward_coins = $4,
           completion_rate = $5,
           completed_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [totalReps, totalDamage, session.reward_xp || 0, session.reward_coins || 0, completionRate, sessionId]
    );

    const bonusXp = clampInt(session.reward_xp, 0);
    const bonusCoins = clampInt(session.reward_coins, 0);
    if (bonusXp > 0 || bonusCoins > 0) {
      await client.query(
        `UPDATE users
         SET cha_xp = COALESCE(cha_xp, 0) + $1,
             reppy_coins = GREATEST(0, COALESCE(reppy_coins, 0) + $2)
         WHERE id = $3`,
        [bonusXp, bonusCoins, req.user.id]
      );
      earnedCoins += bonusCoins;
    }

    const planName = SOCIAL_PLAN_NAME_MAP[session.plan_title_key] || session.plan_title_key || 'Plan de entrenamiento';

    // Aggregate all performed sets by exercise so social summaries reflect the full routine.
    const performedByExercise = new Map();
    for (const log of logs) {
      const slug = log.exerciseType || 'pullups';
      if (!performedByExercise.has(slug)) {
        performedByExercise.set(slug, { sets: 0, total: 0 });
      }
      const agg = performedByExercise.get(slug);
      agg.sets += 1;
      agg.total += Number(log.actualReps || 0);
    }

    const exerciseMetaRes = await client.query(
      `SELECT slug, title_key, unit
       FROM exercises
       WHERE slug = ANY($1::text[])`,
      [Array.from(performedByExercise.keys())]
    );
    const metaBySlug = new Map(exerciseMetaRes.rows.map(row => [row.slug, row]));

    const exerciseSummaryParts = Array.from(performedByExercise.entries()).map(([slug, agg]) => {
      const meta = metaBySlug.get(slug);
      const unit = meta?.unit === 'seconds' ? 's' : '';
      const exerciseName =
        SOCIAL_EXERCISE_NAME_MAP[slug] ||
        (meta?.title_key?.startsWith('ex_') ? SOCIAL_EXERCISE_NAME_MAP[slug] : meta?.title_key) ||
        toReadableSlug(slug);

      return `${agg.sets}x${agg.total}${unit} ${exerciseName}`;
    });

    const exerciseSummary = exerciseSummaryParts.join(' · ');
    const remainingDays = Math.max(0, Number(session.duration_days || 0) - Number(session.current_day || 1));
    const postTitle = `Día ${session.current_day}/${session.duration_days} completado · ${planName}`;
    const postDesc = `Quedan ${remainingDays} días · ${exerciseSummary}`;

    const todayStr = getLocalDateString();
    await client.query(
      `INSERT INTO daily_summaries (user_id, date, title, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, date) 
       DO UPDATE SET
         title = COALESCE(daily_summaries.title, EXCLUDED.title),
         description = CASE
           WHEN daily_summaries.description IS NULL OR daily_summaries.description = ''
           THEN EXCLUDED.description
           ELSE daily_summaries.description || E'\n\n' || EXCLUDED.description
         END`,
      [req.user.id, todayStr, postTitle, postDesc]
    );

    // Save daily lock
    await client.query(
      `UPDATE user_active_plans
       SET last_completed_date = CURRENT_DATE,
           last_completed_day = current_day
       WHERE user_id = $1 AND plan_id = $2 AND status = 'active'`,
      [req.user.id, session.plan_id]
    );

    const nextDay = Number(session.current_day || 1) + 1;
    if (nextDay > Number(session.duration_days || 0)) {
      await client.query(
        `UPDATE user_active_plans
         SET current_day = $1,
             status = 'completed'
         WHERE user_id = $2 AND plan_id = $3 AND status = 'active'`,
        [Number(session.duration_days || 0), req.user.id, session.plan_id]
      );
    } else {
      await client.query(
        `UPDATE user_active_plans
         SET current_day = current_day + 1
         WHERE user_id = $1 AND plan_id = $2 AND status = 'active'`,
        [req.user.id, session.plan_id]
      );
    }

    await client.query('COMMIT');
    await recalculateUserStats(req.user.id, true);

    res.json({
      ok: true,
      sessionId,
      total_reps: totalReps,
      totalReps,
      totalDamage,
      earnedCoins,
      completionRate,
      rewardXp: Number(session.reward_xp || 0),
      rewardCoins: Number(session.reward_coins || 0),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error completing training session:', error);
    res.status(500).json({ message: 'Error completing training session', error: error.message });
  } finally {
    client.release();
  }
});

export default router;

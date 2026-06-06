/**
 * Hevy workout ingestion (issue #214).
 *
 * Takes a full Hevy workout object and makes it "count" inside Reppy:
 *   - resolves each Hevy exercise to a Reppy exercise_type (global map, or a
 *     user-custom `hevy_<templateId>` exercise created on the fly),
 *   - upserts the day's reps (aggregated by day/type, same as manual logging),
 *   - deals boss damage (x1) and feeds reps/damage missions,
 *   - tracks total kg volume moved (new metric) on users.hevy_volume_kg,
 *   - records the workout in hevy_imported_workouts for idempotency + revert,
 *   - recalculates XP / level / stats from the absolute reps history.
 *
 * Idempotent: re-ingesting the same hevy_workout_id is a no-op.
 */
import pool, { query } from '../db.js';
import { augmentUserWithLevels, recalculateUserStats } from './stats.js';
import { calculateDamage } from './damage.js';
import { syncBossHealth } from './boss.js';
import { getLocalDateString } from './date.js';
import { getExerciseRewards } from './rewards.js';
import { updateMissionProgress } from './missions.js';
import { getEffectiveExerciseCount, getRewardExerciseCount, isTimedExerciseUnit } from './exerciseUnits.js';

/** Decide a Reppy unit ('reps' | 'seconds') from a Hevy exercise's sets. */
function inferUnit(sets) {
  const anyReps = sets.some(s => s.reps != null && s.reps > 0);
  if (anyReps) return 'reps';
  const anyDuration = sets.some(s => s.duration_seconds != null && s.duration_seconds > 0);
  return anyDuration ? 'seconds' : 'reps';
}

/**
 * Resolve a Hevy exercise to a Reppy exercise_type, creating a custom exercise
 * + map entry when it isn't in the global calisthenics map.
 */
async function resolveExerciseType(client, hevyExercise) {
  const templateId = hevyExercise.exercise_template_id;
  const mapRes = await client.query(
    'SELECT reppy_exercise_type, is_weighted FROM hevy_exercise_map WHERE hevy_template_id = $1',
    [templateId]
  );
  if (mapRes.rows.length > 0) {
    return { type: mapRes.rows[0].reppy_exercise_type, fromMap: true };
  }

  // Unmapped (bench press, deadlift, machines, …) → user-custom exercise, counts x1.
  const slug = `hevy_${String(templateId).toLowerCase()}`;
  const unit = inferUnit(hevyExercise.sets || []);
  const isWeighted = (hevyExercise.sets || []).some(s => (s.weight_kg || 0) > 0);

  const title = hevyExercise.title || slug;
  await client.query(
    `INSERT INTO exercises (slug, title_key, description_key, unit, difficulty_multiplier, coin_multiplier, is_active)
     VALUES ($1, $2, $3, $4, 1.0, 1.0, TRUE)
     ON CONFLICT (slug) DO NOTHING`,
    [slug, title, `Importado de Hevy: ${title}`, unit]
  );
  await client.query(
    `INSERT INTO hevy_exercise_map (hevy_template_id, reppy_exercise_type, is_weighted)
     VALUES ($1, $2, $3) ON CONFLICT (hevy_template_id) DO NOTHING`,
    [templateId, slug, isWeighted]
  );
  return { type: slug, fromMap: false };
}

/**
 * @param {string} userId
 * @param {object} workout  Full Hevy workout (GET /v1/workouts/{id})
 * @returns {Promise<object>} summary
 */
export async function ingestHevyWorkout(userId, workout) {
  if (!workout || !workout.id) throw new Error('Invalid workout payload');

  // Idempotency guard — already imported?
  const dup = await query('SELECT hevy_workout_id FROM hevy_imported_workouts WHERE hevy_workout_id = $1', [workout.id]);
  if (dup.rows.length > 0) {
    return { imported: false, skipped: true, reason: 'already_imported', workoutId: workout.id };
  }

  const workoutDate = getLocalDateString(workout.start_time || new Date());

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Aggregate sets per resolved Reppy exercise_type.
    const agg = new Map(); // type -> { reps, volumeKg, wRepSum, wWeightSum }
    for (const ex of (workout.exercises || [])) {
      const { type } = await resolveExerciseType(client, ex);
      // Pull exercise meta to know how to count.
      const metaRes = await client.query(
        'SELECT unit, difficulty_multiplier, coin_multiplier FROM exercises WHERE slug = $1',
        [type]
      );
      const meta = metaRes.rows[0] || {};
      const unit = meta.unit || 'reps';
      const diffMult = meta.difficulty_multiplier != null ? Number(meta.difficulty_multiplier) : null;
      const coinMult = meta.coin_multiplier != null ? Number(meta.coin_multiplier) : null;

      let bucket = agg.get(type);
      if (!bucket) {
        bucket = { reps: 0, volumeKg: 0, wRepSum: 0, wWeightSum: 0, unit, diffMult, coinMult };
        agg.set(type, bucket);
      }
      for (const s of (ex.sets || [])) {
        if (isTimedExerciseUnit(unit)) {
          bucket.reps += Math.max(0, Number(s.duration_seconds) || 0);
        } else {
          const r = Math.max(0, Number(s.reps) || 0);
          const w = Math.max(0, Number(s.weight_kg) || 0);
          bucket.reps += r;
          bucket.volumeKg += r * w;
          if (w > 0) { bucket.wRepSum += r; bucket.wWeightSum += r * w; }
        }
      }
    }

    // 2. Load augmented user (with gear) for damage.
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

    // 3. Current boss (if any).
    const bossRes = await client.query(
      `SELECT id, current_hp, total_hp, name, image_url FROM boss_fights
       WHERE status != 'defeated' ORDER BY order_index ASC LIMIT 1`
    );
    const boss = bossRes.rows[0] || null;

    let totalReps = 0;
    let totalVolumeKg = 0;
    let totalDamage = 0;
    let totalCoins = 0;
    let bossKilled = false;
    const byType = {};

    for (const [type, b] of agg.entries()) {
      if (b.reps <= 0) continue;
      const addedWeight = b.wRepSum > 0 ? b.wWeightSum / b.wRepSum : 0;
      const effectiveCount = getEffectiveExerciseCount(b.reps, b.unit);
      const rewardCount = getRewardExerciseCount(b.reps, b.unit);

      // Upsert the day's reps (aggregate by day/type, same contract as manual logging).
      const repResult = await client.query(
        `INSERT INTO reps (user_id, count, date, exercise_type, added_weight)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, date, exercise_type)
         DO UPDATE SET count = reps.count + EXCLUDED.count,
                       added_weight = GREATEST(reps.added_weight, EXCLUDED.added_weight)
         RETURNING id`,
        [userId, b.reps, workoutDate, type, addedWeight]
      );

      // Coins.
      const earnedCoins = b.coinMult != null
        ? Math.round(rewardCount * b.coinMult)
        : getExerciseRewards(type, rewardCount).coins;
      totalCoins += earnedCoins;

      // Boss damage (x1).
      let dmg = 0;
      if (boss && !bossKilled) {
        const dmgResult = calculateDamage(augmentedUser, effectiveCount, type, boss, false, false, b.diffMult);
        dmg = dmgResult.totalDamage;
        const upd = await client.query(
          `UPDATE boss_fights
             SET current_hp = GREATEST(0, current_hp - $1),
                 status = CASE WHEN current_hp - $1 <= 0 THEN 'defeated' ELSE status END
           WHERE id = $2 RETURNING current_hp`,
          [dmg, boss.id]
        );
        await client.query(
          `INSERT INTO event_participants (boss_fight_id, user_id, damage_dealt)
           VALUES ($1, $2, $3)
           ON CONFLICT (boss_fight_id, user_id)
           DO UPDATE SET damage_dealt = event_participants.damage_dealt + EXCLUDED.damage_dealt`,
          [boss.id, userId, dmg]
        );
        await client.query(
          `UPDATE users SET daily_boss_damage = CASE
             WHEN last_boss_damage_date = CURRENT_DATE THEN daily_boss_damage + $1 ELSE $1 END,
             last_boss_damage_date = CURRENT_DATE WHERE id = $2`,
          [dmg, userId]
        );
        await client.query(
          `UPDATE reps SET boss_damage_dealt = COALESCE(boss_damage_dealt, 0) + $1, boss_fight_id = $2 WHERE id = $3`,
          [dmg, boss.id, repResult.rows[0].id]
        );
        if (upd.rows[0].current_hp === 0) bossKilled = true;
      }

      // Missions.
      if (!isTimedExerciseUnit(b.unit)) {
        await updateMissionProgress(userId, 'reps', b.reps);
      }
      if (dmg > 0) await updateMissionProgress(userId, 'damage', dmg);

      totalReps += isTimedExerciseUnit(b.unit) ? 0 : b.reps;
      totalVolumeKg += b.volumeKg;
      totalDamage += dmg;
      byType[type] = { count: b.reps, unit: b.unit, addedWeight: Math.round(addedWeight * 10) / 10, volumeKg: Math.round(b.volumeKg), damage: dmg };
    }

    // 4. Coins + cumulative kg volume.
    if (totalCoins > 0) {
      await client.query('UPDATE users SET reppy_coins = GREATEST(0, reppy_coins + $1) WHERE id = $2', [totalCoins, userId]);
    }
    await client.query(
      'UPDATE users SET hevy_volume_kg = COALESCE(hevy_volume_kg, 0) + $1, hevy_last_sync = NOW() WHERE id = $2',
      [Math.round(totalVolumeKg), userId]
    );

    // 4b. Use the Hevy workout title as the Reppy feed post title for that day.
    const postTitle = (workout.title || '').trim() || 'Entrenamiento Hevy';
    await client.query(
      `INSERT INTO daily_summaries (user_id, date, title)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date)
       DO UPDATE SET title = EXCLUDED.title`,
      [userId, workoutDate, postTitle]
    );

    // 5. Idempotency ledger.
    await client.query(
      `INSERT INTO hevy_imported_workouts (hevy_workout_id, user_id, workout_date, volume_kg, counts)
       VALUES ($1, $2, $3, $4, $5)`,
      [workout.id, userId, workoutDate, Math.round(totalVolumeKg), JSON.stringify(byType)]
    );

    if (bossKilled) syncBossHealth().catch(e => console.error('Boss sync error:', e));

    await client.query('COMMIT');

    // 6. Recalculate absolute stats (XP/level/STR from volume, etc.).
    await recalculateUserStats(userId, true);

    return {
      imported: true,
      workoutId: workout.id,
      title: workout.title,
      date: workoutDate,
      totalReps,
      volumeKg: Math.round(totalVolumeKg),
      damage: totalDamage,
      coins: totalCoins,
      bossKilled,
      byType,
    };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

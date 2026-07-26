/**
 * Combat routing — the single place that turns a logged set into damage against
 * the active community boss. Extracted from the (previously duplicated) blocks in
 * reps.js and training.js so there is ONE code path to reason about, and so the
 * upcoming campaign engine can add a second damage target without a third copy.
 *
 * Behaviour is intentionally identical to the old inline blocks. The one caller
 * divergence that predated this refactor — reps.js emits a community
 * `createBossKillEvent`, the guided-training path does not — is preserved by
 * returning `{ killed, boss }` and letting each caller decide.
 */
import { calculateDamage } from './damage.js';
import { syncBossHealth } from './boss.js';
import { grantLastHitBonus } from './bossRewards.js';
import { broadcastDamage } from '../socketManager.js';
import { emitProgress } from './progressEvents.js';

/**
 * Apply a logged set's damage to the current active boss (lowest order_index,
 * not defeated). Must run inside the caller's transaction (`client`).
 *
 * @param {object} client         pg client bound to the active transaction
 * @param {object} params
 * @param {object} params.user            augmented user (levels + gear folded in)
 * @param {number} params.effectiveCount  reps after unit/timed normalisation
 * @param {string} params.exerciseType    exercise slug
 * @param {number|null} params.diffMult    difficulty multiplier override
 * @param {number} params.addedWeight     added weight in kg (0 for guided logs)
 * @param {string|null} params.exerciseStat combat stat of the logged exercise
 *        (str/vig/end) for the exercise-match multiplier; inert here because the
 *        community boss SELECT below doesn't carry weakness_stat/resist_stat, but
 *        threaded for a single consistent damage contract.
 * @returns {Promise<{bossId:number|null, actualDamageDealt:number, killed:boolean, boss:object|null}>}
 */
export async function applyBossDamage(client, { user, effectiveCount, exerciseType, diffMult = null, addedWeight = 0, exerciseStat = null }) {
  const userId = user.id;

  const bossRes = await client.query(
    `SELECT id, current_hp, total_hp, name, image_url FROM boss_fights
     WHERE status != 'defeated'
     ORDER BY order_index ASC LIMIT 1`
  );

  if (bossRes.rows.length === 0) {
    return { bossId: null, actualDamageDealt: 0, killed: false, boss: null };
  }

  const boss = bossRes.rows[0];
  const bossDmgResult = calculateDamage(user, effectiveCount, exerciseType, boss, false, false, diffMult, addedWeight, exerciseStat);
  const actualDamageDealt = bossDmgResult.totalDamage;

  // Atomic health deduction — flips to 'defeated' the instant HP hits 0.
  const updateBossRes = await client.query(
    `UPDATE boss_fights
     SET current_hp = GREATEST(0, current_hp - $1),
         status = CASE WHEN current_hp - $1 <= 0 THEN 'defeated' ELSE status END
     WHERE id = $2 RETURNING current_hp`,
    [actualDamageDealt, boss.id]
  );

  await client.query(
    `INSERT INTO event_participants (boss_fight_id, user_id, damage_dealt)
     VALUES ($1, $2, $3)
     ON CONFLICT (boss_fight_id, user_id)
     DO UPDATE SET damage_dealt = event_participants.damage_dealt + EXCLUDED.damage_dealt`,
    [boss.id, userId, actualDamageDealt]
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

  const killed = updateBossRes.rows[0]?.current_hp === 0;

  if (killed) {
    // Recompute HP templates for the next boss (best-effort, outside TX).
    syncBossHealth().catch(e => console.error('Boss sync error:', e));

    await emitProgress(userId, 'boss_last_hit', 1);

    const lastHitReward = await grantLastHitBonus(userId, boss.id, client);
    if (lastHitReward) {
      broadcastDamage({
        type: 'LAST_HIT',
        userId,
        userName: user.name,
        bossName: boss.name,
        reward: lastHitReward,
      });
    }
  }

  return { bossId: boss.id, actualDamageDealt, killed, boss };
}

/**
 * NPC quest engine — offers, acceptance, claiming, and (crucially) the objective
 * resolvers that turn generic progress events into quest progress.
 *
 * Integration: this module registers a subscriber on the progress bus
 * (utils/progressEvents.js) at load time, so any `emitProgress` from rep logging
 * or campaign kills advances matching accepted quests WITHOUT the rep-logging
 * code knowing anything about quests. It is pulled into the app graph via
 * campaign.js → index.js.
 *
 * Objective shapes (JSONB on npc_quests.objective):
 *   { type:'kill', family?, zone?, tier?, count }
 *   { type:'reps', exercise?, count }
 *   { type:'damage', amount }
 *   { type:'clear_node', node }
 *   { type:'stat_check', stat, min_level }   ← evaluated at accept time
 *   { type:'streak', days }                  ← evaluated lazily (see below)
 */
import { query } from '../db.js';
import { onProgress } from './progressEvents.js';
import { createNotification } from './notifications.js';
import { sendPushNotification } from './pushNotifications.js';

// Which progress-bus event drives each progress-based objective type.
const EVENT_BY_OBJECTIVE = {
  kill: 'campaign_kill',
  reps: 'reps',
  damage: 'damage',
  clear_node: 'campaign_clear_node',
};

export function objectiveTarget(obj) {
  return Math.max(1, Number(obj?.count ?? obj?.amount ?? obj?.days ?? 1));
}

// Returns how much to add to current_value for this event (0 = no match).
function objectiveIncrement(obj, type, value, context) {
  if (EVENT_BY_OBJECTIVE[obj.type] !== type) return 0;
  const v = Number(value) || 0;
  switch (obj.type) {
    case 'kill':
      if (obj.family && context.enemy_family !== obj.family) return 0;
      if (obj.zone && context.zone_slug !== obj.zone) return 0;
      if (obj.tier && Number(context.enemy_tier) !== Number(obj.tier)) return 0;
      return v;
    case 'reps':
      if (obj.exercise && context.exercise_type !== obj.exercise) return 0;
      return v;
    case 'damage':
      return v;
    case 'clear_node':
      if (obj.node && context.node_slug !== obj.node) return 0;
      return objectiveTarget(obj); // clearing the node completes it outright
    default:
      return 0;
  }
}

/**
 * Progress subscriber: advance every accepted quest in the user's active run
 * whose objective matches this event. Best-effort (never throws to the bus).
 */
export async function advanceNpcQuests(userId, type, value, context = {}) {
  const runRes = await query(
    `SELECT id FROM campaign_runs WHERE user_id = $1 AND status = 'active'
     ORDER BY started_at DESC LIMIT 1`,
    [userId]
  );
  const run = runRes.rows[0];
  if (!run) return;

  const qRes = await query(
    `SELECT unq.id, unq.current_value, q.objective, q.name
     FROM user_npc_quests unq
     JOIN npc_quests q ON q.id = unq.quest_id
     WHERE unq.run_id = $1 AND unq.status = 'accepted'`,
    [run.id]
  );

  for (const row of qRes.rows) {
    const obj = row.objective || {};
    const inc = objectiveIncrement(obj, type, value, context);
    if (inc <= 0) continue;

    const target = objectiveTarget(obj);
    const newVal = Math.min(target, (Number(row.current_value) || 0) + inc);
    const completed = newVal >= target;

    // Guarded update: only advance while still 'accepted' (race-safe vs claim).
    const upd = await query(
      `UPDATE user_npc_quests
       SET current_value = $1,
           status = CASE WHEN $2 THEN 'completed' ELSE status END
       WHERE id = $3 AND status = 'accepted'
       RETURNING status`,
      [newVal, completed, row.id]
    );
    if (completed && upd.rows[0]?.status === 'completed') {
      createNotification(
        userId, 'QUEST_COMPLETED', null,
        'Misión de campaña completada: ¡reclama tu recompensa!', row.name?.es || 'quest'
      ).catch(() => {});
    }
  }
}

// Register the subscriber once, at module load.
onProgress((userId, type, value, context) =>
  advanceNpcQuests(userId, type, value, context).catch((e) =>
    console.error('[campaignQuests] advance error:', e)
  )
);

/**
 * Load an NPC (in the run's campaign) plus its quests, each annotated with the
 * player's state for this run: available | accepted | completed | claimed |
 * failed | locked (prereq/path/stat not met).
 */
export async function getNpcWithQuests(client, run, npcSlug, user) {
  const npcRes = await client.query(
    `SELECT id, slug, name, faction, art, dialogue FROM npcs
     WHERE slug = $1 AND campaign_id = $2`,
    [npcSlug, run.campaign_id]
  );
  const npc = npcRes.rows[0];
  if (!npc) return null;

  const questsRes = await client.query(
    `SELECT q.id, q.slug, q.chain_slug, q.chain_step, q.name, q.description, q.objective,
            q.time_limit_hours, q.path_required, q.rewards, q.penalty, q.requires_quest_slug,
            unq.status AS user_status, unq.current_value, unq.deadline_at
     FROM npc_quests q
     LEFT JOIN user_npc_quests unq ON unq.quest_id = q.id AND unq.run_id = $1
     WHERE q.npc_id = $2
     ORDER BY q.chain_step ASC, q.id ASC`,
    [run.id, npc.id]
  );

  // Set of quest slugs the user has already claimed (for prereq resolution).
  const claimedRes = await client.query(
    `SELECT q.slug FROM user_npc_quests unq
     JOIN npc_quests q ON q.id = unq.quest_id
     WHERE unq.run_id = $1 AND unq.status = 'claimed'`,
    [run.id]
  );
  const claimed = new Set(claimedRes.rows.map((r) => r.slug));

  const quests = questsRes.rows.map((q) => {
    let state = q.user_status || 'available';
    if (!q.user_status) {
      // Not started: decide if it's offerable or locked.
      const pathOk = !q.path_required || run.path === q.path_required;
      const prereqOk = !q.requires_quest_slug || claimed.has(q.requires_quest_slug);
      const statOk = !(q.objective?.type === 'stat_check')
        || (Number(user[`${q.objective.stat}_lvl`]) || 1) >= (q.objective.min_level || 0);
      state = (pathOk && prereqOk && statOk) ? 'available' : 'locked';
    }
    return {
      id: q.id, slug: q.slug, chain_slug: q.chain_slug, chain_step: q.chain_step,
      name: q.name, description: q.description, objective: q.objective,
      time_limit_hours: q.time_limit_hours, rewards: q.rewards,
      target: objectiveTarget(q.objective || {}),
      current_value: q.current_value || 0,
      deadline_at: q.deadline_at,
      state,
    };
  });

  return { npc: { slug: npc.slug, name: npc.name, faction: npc.faction, art: npc.art, dialogue: npc.dialogue }, quests };
}

/** Accept a quest (atomic). Validates path/prereq/stat before creating the row. */
export async function acceptQuest(client, run, questId, user) {
  const qRes = await client.query(
    `SELECT q.*, np.campaign_id
     FROM npc_quests q JOIN npcs np ON np.id = q.npc_id
     WHERE q.id = $1`,
    [questId]
  );
  const q = qRes.rows[0];
  if (!q || q.campaign_id !== run.campaign_id) return { status: 404, body: { message: 'Misión no encontrada' } };

  // Gates.
  if (q.path_required && run.path !== q.path_required) {
    return { status: 403, body: { message: 'Tu senda no permite esta misión' } };
  }
  if (q.requires_quest_slug) {
    const prereq = await client.query(
      `SELECT 1 FROM user_npc_quests unq JOIN npc_quests pq ON pq.id = unq.quest_id
       WHERE unq.run_id = $1 AND pq.slug = $2 AND unq.status = 'claimed'`,
      [run.id, q.requires_quest_slug]
    );
    if (prereq.rowCount === 0) return { status: 403, body: { message: 'Aún no puedes aceptar esta misión' } };
  }

  const obj = q.objective || {};
  const isStatCheck = obj.type === 'stat_check';
  if (isStatCheck) {
    const lvl = Number(user[`${obj.stat}_lvl`]) || 1;
    if (lvl < (obj.min_level || 0)) {
      return { status: 403, body: { message: `Requiere ${String(obj.stat).toUpperCase()} nivel ${obj.min_level}` } };
    }
  }

  // stat_check completes on accept; timed pacts get a deadline.
  const initialStatus = isStatCheck ? 'completed' : 'accepted';
  const deadline = q.time_limit_hours
    ? `CURRENT_TIMESTAMP + INTERVAL '${parseInt(q.time_limit_hours, 10)} hours'`
    : 'NULL';

  const ins = await client.query(
    `INSERT INTO user_npc_quests (run_id, quest_id, status, current_value, deadline_at)
     VALUES ($1, $2, $3, $4, ${deadline})
     ON CONFLICT (run_id, quest_id) DO NOTHING
     RETURNING status`,
    [run.id, questId, initialStatus, isStatCheck ? objectiveTarget(obj) : 0]
  );
  if (ins.rowCount === 0) return { status: 400, body: { message: 'Ya aceptaste esta misión' } };

  return { status: 200, body: { message: 'Misión aceptada', quest_id: questId, status: initialStatus } };
}

/** Claim a completed quest (atomic claim gate + payout). */
export async function claimQuest(client, run, questId, userId) {
  const claim = await client.query(
    `UPDATE user_npc_quests SET status = 'claimed'
     WHERE run_id = $1 AND quest_id = $2 AND status = 'completed'
     RETURNING id`,
    [run.id, questId]
  );
  if (claim.rowCount === 0) {
    const st = await client.query(
      `SELECT status FROM user_npc_quests WHERE run_id = $1 AND quest_id = $2`,
      [run.id, questId]
    );
    if (st.rowCount === 0) return { status: 404, body: { message: 'Misión no iniciada' } };
    if (st.rows[0].status === 'claimed') return { status: 400, body: { message: 'Ya reclamada' } };
    return { status: 400, body: { message: 'La misión aún no está completada' } };
  }

  const qRes = await client.query('SELECT slug, name, rewards FROM npc_quests WHERE id = $1', [questId]);
  const rewards = qRes.rows[0]?.rewards || {};
  const coins = Number(rewards.coins) || 0;
  const gems = Number(rewards.gems) || 0;

  if (coins || gems) {
    await client.query(
      'UPDATE users SET reppy_coins = reppy_coins + $1, reppy_gems = reppy_gems + $2 WHERE id = $3',
      [coins, gems, userId]
    );
    if (gems > 0) {
      await client.query(
        `INSERT INTO gem_transactions (user_id, amount, source, description)
         VALUES ($1, $2, 'campaign_quest', $3)`,
        [userId, gems, `Quest: ${qRes.rows[0]?.slug || questId}`]
      );
    }
  }

  // Light-path blessing: a long positive damage buff (reuses the potion buff
  // columns). rewards.buff = { multiplier, hours }.
  const buff = rewards.buff;
  let blessing = null;
  if (buff && Number(buff.multiplier) > 0 && Number(buff.hours) > 0) {
    await client.query(
      `UPDATE users SET damage_multiplier = $2,
             damage_multiplier_expiry = NOW() + INTERVAL '1 hour' * $3
       WHERE id = $1`,
      [userId, Number(buff.multiplier), Number(buff.hours)]
    );
    blessing = { multiplier: Number(buff.multiplier), hours: Number(buff.hours) };
  }

  return { status: 200, body: { message: 'Recompensa reclamada', reward_coins: coins, reward_gems: gems, blessing } };
}

/**
 * Sweep expired dark-path pacts: any accepted quest whose deadline has passed is
 * marked 'failed' and its penalty applied — coin loss (never below 0) and/or a
 * curse (a <1 damage multiplier for a while, reusing the buff columns). Run from
 * cron; safe to run often (guarded per-row so a pact is punished once).
 */
export async function sweepExpiredPacts() {
  const res = await query(
    `SELECT unq.id, q.penalty, q.name, cr.user_id
     FROM user_npc_quests unq
     JOIN npc_quests q ON q.id = unq.quest_id
     JOIN campaign_runs cr ON cr.id = unq.run_id
     WHERE unq.status = 'accepted' AND unq.deadline_at IS NOT NULL AND unq.deadline_at < NOW()`
  );

  let count = 0;
  for (const row of res.rows) {
    const upd = await query(
      `UPDATE user_npc_quests SET status = 'failed' WHERE id = $1 AND status = 'accepted' RETURNING id`,
      [row.id]
    );
    if (upd.rowCount === 0) continue; // someone else handled it

    const pen = row.penalty || {};
    if (pen.coins) {
      await query('UPDATE users SET reppy_coins = GREATEST(0, reppy_coins - $1) WHERE id = $2', [pen.coins, row.user_id]);
    }
    if (pen.curse_hours) {
      const mult = Number(pen.curse_multiplier) || 0.75;
      await query(
        `UPDATE users SET damage_multiplier = $2,
               damage_multiplier_expiry = NOW() + INTERVAL '1 hour' * $3
         WHERE id = $1`,
        [row.user_id, mult, pen.curse_hours]
      );
    }
    createNotification(
      row.user_id, 'QUEST_FAILED', null,
      `Pacto roto: ${row.name?.es || 'misión'}. Sufres las consecuencias.`, null
    ).catch(() => {});
    sendPushNotification(row.user_id, {
      title: '😈 Pacto roto',
      body: 'No cumpliste tu pacto a tiempo. Una maldición cae sobre ti.',
      icon: '/icon-192.png',
      data: { url: '/campana' },
    }).catch(() => {});
    count++;
  }
  return count;
}

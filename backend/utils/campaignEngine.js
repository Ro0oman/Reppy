/**
 * Campaign engine — the generic core that drives the data-driven RPG campaign.
 * Knows nothing about specific enemies/zones; all content comes from the DB
 * (seeded from backend/data/campaigns/*.json). See docs/combat-campaign-redesign.md.
 *
 * Progression is INDIVIDUAL: every player fights their own enemy instances with
 * HP scaled to their level/prestige and snapshotted on engage, so the fight is
 * stable even if they level up mid-battle. Community raids stay on boss_fights.
 */
import { calculateDamage } from './damage.js';
import { sendToUser } from '../socketManager.js';
import { emitProgress } from './progressEvents.js';
import { getPerkBonuses } from './perks.js';

/**
 * Scale an enemy's HP for a given player. Prefers per-enemy `scaling`, falling
 * back to the campaign-wide `config.hp`.
 */
export function scaleEnemyHp(enemy, campaignConfig, playerLevel, prestige = 0) {
  const base = Number(enemy.base_hp) || 1000;
  const sc = enemy.scaling || {};
  const cfg = (campaignConfig && campaignConfig.hp) || {};
  const perLevel = sc.hp_per_level ?? cfg.base_per_level ?? 0.05;
  const tierArr = Array.isArray(cfg.tier_mult) ? cfg.tier_mult : null;
  const tierMult = sc.hp_tier_mult ?? (tierArr ? (tierArr[(enemy.tier || 1) - 1] ?? 1) : 1);
  const prestigeMult = Math.pow(cfg.prestige_mult ?? 1.5, prestige || 0);
  const lvl = Math.max(1, Number(playerLevel) || 1);
  return Math.max(1, Math.round(base * (1 + lvl * perLevel) * tierMult * prestigeMult));
}

/** The player's current active run (joined with its campaign), or null. */
export async function getActiveRun(client, userId) {
  const r = await client.query(
    `SELECT cr.id, cr.campaign_id, cr.prestige_level, cr.path, cr.status, cr.completed_at,
            c.slug AS campaign_slug, c.config AS campaign_config
     FROM campaign_runs cr
     JOIN campaigns c ON c.id = cr.campaign_id
     WHERE cr.user_id = $1 AND cr.status = 'active'
     ORDER BY cr.started_at DESC
     LIMIT 1`,
    [userId]
  );
  return r.rows[0] || null;
}

/**
 * Ensure the player has an active run in the current playable campaign,
 * creating one on first entry. Returns the run (or null if no campaign exists).
 * Picks an 'active' campaign, falling back to a 'draft' one for dev/preview.
 */
export async function ensureActiveRun(client, userId) {
  const existing = await getActiveRun(client, userId);
  if (existing) return existing;

  const camp = await client.query(
    `SELECT id FROM campaigns
     WHERE status IN ('active', 'draft')
     ORDER BY (status = 'active') DESC, id ASC
     LIMIT 1`
  );
  if (!camp.rows[0]) return null;
  const campaignId = camp.rows[0].id;

  // Race-safe insert: the partial unique index (one active run per user+campaign)
  // is the backstop; the NOT EXISTS avoids the common case throwing.
  await client.query(
    `INSERT INTO campaign_runs (user_id, campaign_id, status)
     SELECT $1::varchar, $2::int, 'active'
     WHERE NOT EXISTS (
       SELECT 1 FROM campaign_runs WHERE user_id = $1::varchar AND campaign_id = $2::int AND status = 'active'
     )`,
    [userId, campaignId]
  );
  return getActiveRun(client, userId);
}

/**
 * Decide whether a node is unlocked for this run, given the set of cleared node
 * slugs and the graph's incoming edges. Combines the graph gate (a predecessor
 * cleared, or a root node) with the node's `requires` (level / path / stat / nodes).
 */
export function isNodeUnlocked(node, { clearedSlugs, incomingBySlug, run, user }) {
  // Graph gate.
  const incoming = incomingBySlug[node.slug] || [];
  const graphOk = incoming.length === 0 || incoming.some((s) => clearedSlugs.has(s));
  if (!graphOk) return false;

  const req = node.requires || {};
  if (req.min_level && (Number(user.current_level) || 1) < req.min_level) return false;
  if (req.path && run.path !== req.path) return false;
  if (Array.isArray(req.nodes) && !req.nodes.every((s) => clearedSlugs.has(s))) return false;
  if (req.stat && typeof req.stat === 'object') {
    for (const [stat, min] of Object.entries(req.stat)) {
      if ((Number(user[`${stat}_lvl`]) || 1) < min) return false;
    }
  }
  return true;
}

/**
 * Engage a node: validate it's unlocked, then snapshot the scaled enemy HP and
 * mark it the run's single engaged node. Idempotent for an already-engaged node
 * (keeps the existing HP snapshot so re-opening the battle view doesn't reset it).
 *
 * @returns {{status:number, body:object}}
 */
export async function engageNode(client, userId, nodeId, augmentedUser) {
  const run = await ensureActiveRun(client, userId);
  if (!run) return { status: 400, body: { message: 'No hay campaña disponible' } };

  const nodeRes = await client.query(
    `SELECT n.*, z.campaign_id, z.slug AS zone_slug,
            e.slug AS enemy_slug, e.family AS enemy_family, e.tier AS enemy_tier,
            e.base_hp, e.weakness_stat, e.resist_stat, e.scaling AS enemy_scaling,
            e.name AS enemy_name, e.art AS enemy_art
     FROM campaign_nodes n
     JOIN campaign_zones z ON z.id = n.zone_id
     LEFT JOIN enemy_types e ON e.id = n.enemy_type_id
     WHERE n.id = $1 AND z.campaign_id = $2`,
    [nodeId, run.campaign_id]
  );
  if (!nodeRes.rows[0]) return { status: 404, body: { message: 'Nodo no encontrado' } };
  const node = nodeRes.rows[0];

  // Build the cleared set + incoming edges for the unlock check.
  const { clearedSlugs, incomingBySlug } = await loadGraphState(client, run);
  if (!isNodeUnlocked(node, { clearedSlugs, incomingBySlug, run, user: augmentedUser })) {
    return { status: 403, body: { message: 'Este nodo aún no está desbloqueado' } };
  }

  if (node.type === 'npc' || node.type === 'crossroads' || !node.enemy_type_id) {
    return { status: 400, body: { message: 'Este nodo no es un combate' } };
  }

  // If already engaged, keep the snapshot (don't reset a fight in progress).
  const prog = await client.query(
    `SELECT status, enemy_current_hp, enemy_total_hp, kills
     FROM user_node_progress WHERE run_id = $1 AND node_id = $2`,
    [run.id, nodeId]
  );
  const existing = prog.rows[0];
  if (existing && existing.status === 'engaged' && existing.enemy_current_hp > 0) {
    return { status: 200, body: buildEngagedBody(run, node, existing) };
  }
  if (existing && existing.status === 'cleared') {
    return { status: 400, body: { message: 'Ya has completado este nodo' } };
  }

  const totalHp = scaleEnemyHp(
    { base_hp: node.base_hp, tier: node.enemy_tier, scaling: node.enemy_scaling },
    run.campaign_config, augmentedUser.current_level, run.prestige_level
  );

  // Only one engaged node per run: demote any other engaged node back to available.
  await client.query(
    `UPDATE user_node_progress SET status = 'available'
     WHERE run_id = $1 AND status = 'engaged' AND node_id <> $2`,
    [run.id, nodeId]
  );

  const upsert = await client.query(
    `INSERT INTO user_node_progress (run_id, node_id, status, enemy_current_hp, enemy_total_hp, kills)
     VALUES ($1, $2, 'engaged', $3, $3, 0)
     ON CONFLICT (run_id, node_id) DO UPDATE SET
       status = 'engaged', enemy_current_hp = $3, enemy_total_hp = $3
     RETURNING status, enemy_current_hp, enemy_total_hp, kills`,
    [run.id, nodeId, totalHp]
  );

  return { status: 200, body: buildEngagedBody(run, node, upsert.rows[0]) };
}

function buildEngagedBody(run, node, progress) {
  return {
    node: {
      id: node.id, slug: node.slug, type: node.type,
      zone_slug: node.zone_slug, pack: node.pack || {},
    },
    enemy: {
      slug: node.enemy_slug, family: node.enemy_family, tier: node.enemy_tier,
      name: node.enemy_name, art: node.enemy_art,
      weakness_stat: node.weakness_stat, resist_stat: node.resist_stat,
    },
    progress: {
      status: progress.status,
      current_hp: progress.enemy_current_hp,
      total_hp: progress.enemy_total_hp,
      kills: progress.kills,
      pack_count: (node.pack && node.pack.count) || 1,
    },
    run: { id: run.id, path: run.path, prestige_level: run.prestige_level },
  };
}

/** Cleared node slugs + incoming-edge slug lists for the run's campaign. */
export async function loadGraphState(client, run) {
  const clearedRes = await client.query(
    `SELECT n.slug FROM user_node_progress unp
     JOIN campaign_nodes n ON n.id = unp.node_id
     WHERE unp.run_id = $1 AND unp.status = 'cleared'`,
    [run.id]
  );
  const clearedSlugs = new Set(clearedRes.rows.map((r) => r.slug));

  const edgeRes = await client.query(
    `SELECT nf.slug AS from_slug, nt.slug AS to_slug
     FROM campaign_edges e
     JOIN campaign_nodes nf ON nf.id = e.from_node_id
     JOIN campaign_nodes nt ON nt.id = e.to_node_id
     JOIN campaign_zones z ON z.id = nt.zone_id
     WHERE z.campaign_id = $1`,
    [run.campaign_id]
  );
  const incomingBySlug = {};
  for (const e of edgeRes.rows) {
    (incomingBySlug[e.to_slug] ||= []).push(e.from_slug);
  }
  return { clearedSlugs, incomingBySlug };
}

/**
 * Visiting an NPC node counts as "passing" that waypoint: mark it cleared (if
 * currently unlocked) so downstream nodes that depend on it can open. NPC nodes
 * are never fought, so without this they would block linear progression. Talking
 * again still works (the map opens the dialog regardless of cleared status).
 */
export async function markNpcNodeVisited(client, run, npcSlug, user) {
  const nodeRes = await client.query(
    `SELECT n.id, n.slug, n.type, n.requires FROM campaign_nodes n
     JOIN campaign_zones z ON z.id = n.zone_id
     JOIN npcs np ON np.id = n.npc_id
     WHERE z.campaign_id = $1 AND np.slug = $2 AND n.type = 'npc'
     LIMIT 1`,
    [run.campaign_id, npcSlug]
  );
  const node = nodeRes.rows[0];
  if (!node) return false;

  const prog = await client.query(
    `SELECT status FROM user_node_progress WHERE run_id = $1 AND node_id = $2`,
    [run.id, node.id]
  );
  if (prog.rows[0]?.status === 'cleared') return true;

  const { clearedSlugs, incomingBySlug } = await loadGraphState(client, run);
  if (!isNodeUnlocked(node, { clearedSlugs, incomingBySlug, run, user })) return false;

  await client.query(
    `INSERT INTO user_node_progress (run_id, node_id, status, enemy_current_hp, enemy_total_hp, kills, cleared_at)
     VALUES ($1, $2, 'cleared', 0, 0, 0, CURRENT_TIMESTAMP)
     ON CONFLICT (run_id, node_id) DO UPDATE SET status = 'cleared', cleared_at = CURRENT_TIMESTAMP`,
    [run.id, node.id]
  );
  return true;
}

/**
 * Choose a moral path at the crossroads. PERMANENT for the run (only prestige
 * resets it). Requires having reached the crossroads node. Marks the crossroads
 * cleared so the path-gated Act III zone unlocks.
 *
 * @returns {{status:number, body:object}}
 */
export async function choosePath(client, userId, path, augmentedUser) {
  if (!['light', 'dark'].includes(path)) {
    return { status: 400, body: { message: 'Senda inválida' } };
  }
  const run = await ensureActiveRun(client, userId);
  if (!run) return { status: 400, body: { message: 'No hay campaña disponible' } };
  if (run.path) return { status: 400, body: { message: 'Ya has elegido tu senda' } };

  const crossRes = await client.query(
    `SELECT n.id, n.slug, n.requires FROM campaign_nodes n
     JOIN campaign_zones z ON z.id = n.zone_id
     WHERE z.campaign_id = $1 AND n.type = 'crossroads' LIMIT 1`,
    [run.campaign_id]
  );
  const cross = crossRes.rows[0];
  if (!cross) return { status: 400, body: { message: 'Esta campaña no tiene encrucijada' } };

  const { clearedSlugs, incomingBySlug } = await loadGraphState(client, run);
  const reachable = clearedSlugs.has(cross.slug)
    || isNodeUnlocked({ slug: cross.slug, requires: cross.requires }, { clearedSlugs, incomingBySlug, run, user: augmentedUser });
  if (!reachable) return { status: 403, body: { message: 'Aún no has llegado a la encrucijada' } };

  // Guarded permanent set: only the first choice wins.
  const upd = await client.query(
    `UPDATE campaign_runs SET path = $1 WHERE id = $2 AND path IS NULL RETURNING path`,
    [path, run.id]
  );
  if (upd.rowCount === 0) return { status: 400, body: { message: 'Ya has elegido tu senda' } };

  // Clearing the crossroads unlocks the path-gated Act III zone.
  await client.query(
    `INSERT INTO user_node_progress (run_id, node_id, status, enemy_current_hp, enemy_total_hp, kills, cleared_at)
     VALUES ($1, $2, 'cleared', 0, 0, 0, CURRENT_TIMESTAMP)
     ON CONFLICT (run_id, node_id) DO UPDATE SET status = 'cleared', cleared_at = CURRENT_TIMESTAMP`,
    [run.id, cross.id]
  );

  return { status: 200, body: { message: 'Senda elegida', path } };
}

/**
 * Prestige (New Game+): once the run is completed (its path finale is cleared),
 * archive it and start a fresh run at prestige_level + 1. HP and rewards scale
 * automatically via config (scaleEnemyHp / grantEnemyLoot read prestige_level).
 * The codex (user_bestiary) persists; node progress, quests and path reset with
 * the new run_id. Community bosses are untouched (world boss stays parallel).
 *
 * @returns {{status:number, body:object}}
 */
export async function prestige(client, userId) {
  const run = await getActiveRun(client, userId);
  if (!run) return { status: 400, body: { message: 'No hay campaña activa' } };
  if (!run.completed_at) {
    return { status: 400, body: { message: 'Debes completar la campaña para prestigiar' } };
  }

  // Guarded: archive the current run only if it's still the active one.
  const archived = await client.query(
    `UPDATE campaign_runs SET status = 'completed'
     WHERE id = $1 AND status = 'active' RETURNING prestige_level`,
    [run.id]
  );
  if (archived.rowCount === 0) return { status: 400, body: { message: 'Ya has prestigiado' } };

  const newLevel = (archived.rows[0].prestige_level || 0) + 1;
  await client.query(
    `INSERT INTO campaign_runs (user_id, campaign_id, prestige_level, status)
     VALUES ($1, $2, $3, 'active')`,
    [userId, run.campaign_id, newLevel]
  );

  return { status: 200, body: { message: '¡Prestigio alcanzado!', prestige_level: newLevel } };
}

/**
 * Route a logged set's damage to the player's currently engaged campaign node,
 * if any. Called from reps.js/training.js AFTER the community-boss routing, so a
 * single set can feed both a raid and the player's campaign enemy.
 *
 * IMPORTANT (rule R4): campaign damage is FINAL. Unlike boss damage, it is NOT
 * reverted when a rep is edited or deleted — the campaign has no retroactive
 * adjustment path, by design.
 *
 * @returns {Promise<null | {nodeId:number, damage:number, killed:boolean, cleared:boolean, loot:object|null}>}
 */
export async function applyCampaignDamage(client, { user, effectiveCount, exerciseType, diffMult = null, addedWeight = 0 }) {
  const userId = user.id;

  // Find the engaged node + its enemy for the user's active run.
  const engRes = await client.query(
    `SELECT unp.id AS progress_id, unp.node_id, unp.enemy_current_hp, unp.enemy_total_hp, unp.kills,
            n.slug AS node_slug, n.type AS node_type, n.pack, z.slug AS zone_slug, cr.id AS run_id,
            cr.campaign_id, cr.prestige_level, c.config AS campaign_config,
            e.id AS enemy_id, e.slug AS enemy_slug, e.family AS enemy_family, e.tier AS enemy_tier,
            e.base_hp, e.weakness_stat, e.resist_stat, e.scaling AS enemy_scaling, e.loot AS enemy_loot
     FROM campaign_runs cr
     JOIN campaigns c ON c.id = cr.campaign_id
     JOIN user_node_progress unp ON unp.run_id = cr.id AND unp.status = 'engaged'
     JOIN campaign_nodes n ON n.id = unp.node_id
     JOIN campaign_zones z ON z.id = n.zone_id
     JOIN enemy_types e ON e.id = n.enemy_type_id
     WHERE cr.user_id = $1 AND cr.status = 'active'
     LIMIT 1`,
    [userId]
  );
  if (!engRes.rows[0]) return null;
  const row = engRes.rows[0];

  // Shape the enemy like a boss for calculateDamage (weakness + execution use it).
  const enemyAsBoss = {
    weakness_stat: row.weakness_stat,
    current_hp: row.enemy_current_hp,
    total_hp: row.enemy_total_hp,
  };
  const dmg = calculateDamage(user, effectiveCount, exerciseType, enemyAsBoss, false, false, diffMult, addedWeight);
  let damage = dmg.totalDamage;

  // resist_stat: dampen damage if the player leans on the resisted stat. Small,
  // bounded, and additive (enemies without resist_stat are unaffected).
  if (row.resist_stat) {
    const rLvl = Number(user[`${row.resist_stat}_lvl`]) || 1;
    if (rLvl > 1) damage = Math.round(damage / (1 + Math.min(0.5, rLvl * 0.01)));
  }
  damage = Math.max(0, damage);

  const packCount = (row.pack && row.pack.count) || 1;
  const newHp = Math.max(0, row.enemy_current_hp - damage);
  let killed = false;
  let cleared = false;
  let loot = null;

  if (newHp > 0) {
    await client.query(
      `UPDATE user_node_progress SET enemy_current_hp = $1 WHERE id = $2`,
      [newHp, row.progress_id]
    );
  } else {
    // One enemy down.
    killed = true;
    const newKills = row.kills + 1;

    // Codex (persists across prestiges).
    await client.query(
      `INSERT INTO user_bestiary (user_id, enemy_type_id, kills)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, enemy_type_id) DO UPDATE SET kills = user_bestiary.kills + 1`,
      [userId, row.enemy_id]
    );

    loot = await grantEnemyLoot(client, userId, row.enemy_loot, row.prestige_level, row.campaign_config);

    if (newKills >= packCount) {
      // Whole pack cleared → node done.
      cleared = true;
      await client.query(
        `UPDATE user_node_progress
         SET status = 'cleared', enemy_current_hp = 0, kills = $1, cleared_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [newKills, row.progress_id]
      );

      // Campaign completion: clearing the FINALE flags the run as finished so the
      // player can prestige. The finale is a 'boss' node that nothing depends on —
      // no outgoing edge AND not referenced by any other node's requires.nodes
      // (cross-act links use requires.nodes, not edges, so both checks are needed).
      // Fully data-driven: no hardcoded final-node slug.
      if (row.node_type === 'boss') {
        const outgoing = await client.query(
          'SELECT 1 FROM campaign_edges WHERE from_node_id = $1 LIMIT 1',
          [row.node_id]
        );
        const referenced = await client.query(
          `SELECT 1 FROM campaign_nodes n JOIN campaign_zones z ON z.id = n.zone_id
           WHERE z.campaign_id = $1 AND n.requires -> 'nodes' ? $2 LIMIT 1`,
          [row.campaign_id, row.node_slug]
        );
        if (outgoing.rowCount === 0 && referenced.rowCount === 0) {
          await client.query(
            `UPDATE campaign_runs SET completed_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND completed_at IS NULL`,
            [row.run_id]
          );
        }
      }
    } else {
      // Next enemy in the pack: reset HP to full, keep engaged.
      await client.query(
        `UPDATE user_node_progress
         SET enemy_current_hp = enemy_total_hp, kills = $1
         WHERE id = $2`,
        [newKills, row.progress_id]
      );
    }

    // Forward-compatible progress event for NPC quests / node objectives (Sprint 3).
    await emitProgress(userId, 'campaign_kill', 1, {
      enemy_family: row.enemy_family,
      enemy_slug: row.enemy_slug,
      enemy_tier: row.enemy_tier,
      zone_slug: row.zone_slug,
      node_slug: row.node_slug,
    });
    if (cleared) {
      await emitProgress(userId, 'campaign_clear_node', 1, { node_slug: row.node_slug, zone_slug: row.zone_slug });
    }
  }

  // Realtime nudge for the player's own battle view.
  sendToUser(userId, 'campaign_damage', {
    nodeId: row.node_id, enemySlug: row.enemy_slug,
    damage, currentHp: killed ? (cleared ? 0 : row.enemy_total_hp) : newHp,
    killed, cleared, isCrit: dmg.isCrit,
  });

  return { nodeId: row.node_id, damage, killed, cleared, loot };
}

/**
 * Grant an enemy's loot: coins (range), an optional item drop (weighted by the
 * enemy's drop_table), and an optional boss chest. Prestige scales coins.
 */
async function grantEnemyLoot(client, userId, enemyLoot, prestige, campaignConfig) {
  const lootDef = enemyLoot || {};
  const out = { coins: 0, item: null, chest: false };

  // Coins.
  const range = Array.isArray(lootDef.coins) ? lootDef.coins : [0, 0];
  let coins = Math.floor(range[0] + Math.random() * Math.max(0, (range[1] - range[0])));
  const prestigeMult = Math.pow((campaignConfig && campaignConfig.rewards && campaignConfig.rewards.prestige_mult) || 1.25, prestige || 0);
  coins = Math.round(coins * prestigeMult);
  if (coins > 0) {
    await client.query('UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2', [coins, userId]);
    out.coins = coins;
  }

  // Item drop from the weighted drop_table.
  const table = lootDef.drop_table || {};
  const rarity = rollRarity(table);
  if (rarity) {
    const itemRes = await client.query(
      `SELECT * FROM items
       WHERE rarity = $1 AND type != 'bundle'
       AND NOT EXISTS (SELECT 1 FROM user_items WHERE user_id = $2 AND item_id = items.id)
       ORDER BY RANDOM() LIMIT 1`,
      [rarity, userId]
    );
    if (itemRes.rows[0]) {
      const item = itemRes.rows[0];
      await client.query(
        `INSERT INTO user_items (user_id, item_id, is_new) VALUES ($1, $2, TRUE)
         ON CONFLICT (user_id, item_id) DO NOTHING`,
        [userId, item.id]
      );
      out.item = { id: item.id, name: item.name, rarity: item.rarity, type: item.type, image_url: item.image_url };
    }
  }

  // Chest chance.
  if (lootDef.chest_chance && Math.random() < lootDef.chest_chance) {
    await client.query('UPDATE users SET boss_chests = boss_chests + 1 WHERE id = $1', [userId]);
    out.chest = true;
  }

  return out;
}

/** Weighted pick from a { rarity: weight } table. Returns null if empty. */
function rollRarity(table) {
  const entries = Object.entries(table).filter(([, w]) => Number(w) > 0);
  if (entries.length === 0) return null;
  const total = entries.reduce((s, [, w]) => s + Number(w), 0);
  let r = Math.random() * total;
  for (const [rarity, w] of entries) {
    r -= Number(w);
    if (r < 0) return rarity;
  }
  return entries[entries.length - 1][0];
}

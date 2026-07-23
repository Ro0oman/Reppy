import express from 'express';
import { query, withTransaction } from './db.js';
import { authenticate } from './middleware.js';
import { augmentUserWithLevels } from './utils/stats.js';
import {
  ensureActiveRun, getActiveRun, engageNode, loadGraphState, isNodeUnlocked, choosePath, prestige,
  markNpcNodeVisited,
} from './utils/campaignEngine.js';
import { getNpcWithQuests, acceptQuest, claimQuest } from './utils/campaignQuests.js';

const router = express.Router();

// Load + augment the current user (levels/gear folded in) for stat/requires checks.
async function loadAugmentedUser(userId) {
  const r = await query(
    `SELECT u.*,
            iHead.stats as head_stats, iWeapon.stats as weapon_stats,
            iArmor.stats as armor_stats, iBoots.stats as boots_stats
     FROM users u
     LEFT JOIN items iHead ON u.equipped_head_id = iHead.id
     LEFT JOIN items iWeapon ON u.equipped_weapon_id = iWeapon.id
     LEFT JOIN items iArmor ON u.equipped_armor_id = iArmor.id
     LEFT JOIN items iBoots ON u.equipped_boots_id = iBoots.id
     WHERE u.id = $1`,
    [userId]
  );
  if (!r.rows[0]) return null;
  return augmentUserWithLevels(r.rows[0]);
}

// GET /status → the active run + the single engaged node (drives the battle view).
router.get('/status', authenticate, async (req, res) => {
  try {
    const result = await withTransaction(async (client) => {
      const run = await ensureActiveRun(client, req.user.id);
      if (!run) return { run: null, engaged: null };

      const eng = await client.query(
        `SELECT unp.node_id, unp.enemy_current_hp, unp.enemy_total_hp, unp.kills,
                n.slug AS node_slug, n.type AS node_type, n.pack, z.slug AS zone_slug,
                e.slug AS enemy_slug, e.family AS enemy_family, e.tier AS enemy_tier,
                e.name AS enemy_name, e.art AS enemy_art,
                e.weakness_stat, e.resist_stat
         FROM user_node_progress unp
         JOIN campaign_nodes n ON n.id = unp.node_id
         JOIN campaign_zones z ON z.id = n.zone_id
         LEFT JOIN enemy_types e ON e.id = n.enemy_type_id
         WHERE unp.run_id = $1 AND unp.status = 'engaged'
         LIMIT 1`,
        [run.id]
      );
      const e = eng.rows[0] || null;
      return {
        run: { id: run.id, campaign_slug: run.campaign_slug, path: run.path, prestige_level: run.prestige_level, completed: !!run.completed_at },
        engaged: e && {
          node: { id: e.node_id, slug: e.node_slug, type: e.node_type, zone_slug: e.zone_slug, pack: e.pack || {} },
          enemy: {
            slug: e.enemy_slug, family: e.enemy_family, tier: e.enemy_tier,
            name: e.enemy_name, art: e.enemy_art,
            weakness_stat: e.weakness_stat, resist_stat: e.resist_stat,
          },
          progress: {
            current_hp: e.enemy_current_hp, total_hp: e.enemy_total_hp,
            kills: e.kills, pack_count: (e.pack && e.pack.count) || 1,
          },
        },
      };
    });
    res.json(result);
  } catch (err) {
    console.error('[campaign] status error:', err);
    res.status(500).json({ message: 'Error cargando estado de campaña' });
  }
});

// GET /map → zones + nodes + edges with per-node status for the current run.
router.get('/map', authenticate, async (req, res) => {
  try {
    const user = await loadAugmentedUser(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const payload = await withTransaction(async (client) => {
      const run = await ensureActiveRun(client, req.user.id);
      if (!run) return { run: null, zones: [] };

      const [zonesRes, nodesRes, edgesRes, progRes] = await Promise.all([
        client.query(
          `SELECT id, slug, act, name, theme, order_index, path_required, art
           FROM campaign_zones WHERE campaign_id = $1 ORDER BY act, order_index`,
          [run.campaign_id]
        ),
        client.query(
          `SELECT n.id, n.slug, n.type, n.pack, n.map_x, n.map_y, n.requires, n.rewards, n.zone_id,
                  e.slug AS enemy_slug, e.family AS enemy_family, e.tier AS enemy_tier,
                  e.name AS enemy_name, e.art AS enemy_art,
                  np.slug AS npc_slug, np.name AS npc_name
           FROM campaign_nodes n
           JOIN campaign_zones z ON z.id = n.zone_id
           LEFT JOIN enemy_types e ON e.id = n.enemy_type_id
           LEFT JOIN npcs np ON np.id = n.npc_id
           WHERE z.campaign_id = $1`,
          [run.campaign_id]
        ),
        client.query(
          `SELECT nf.slug AS from_slug, nt.slug AS to_slug, e.kind
           FROM campaign_edges e
           JOIN campaign_nodes nf ON nf.id = e.from_node_id
           JOIN campaign_nodes nt ON nt.id = e.to_node_id
           JOIN campaign_zones z ON z.id = nt.zone_id
           WHERE z.campaign_id = $1`,
          [run.campaign_id]
        ),
        client.query(
          `SELECT node_id, status, enemy_current_hp, enemy_total_hp, kills
           FROM user_node_progress WHERE run_id = $1`,
          [run.id]
        ),
      ]);

      const { clearedSlugs, incomingBySlug } = await loadGraphState(client, run);
      const progByNode = {};
      for (const p of progRes.rows) progByNode[p.node_id] = p;

      const nodes = nodesRes.rows.map((n) => {
        const prog = progByNode[n.id];
        let status;
        if (prog && prog.status === 'cleared') status = 'cleared';
        else if (prog && prog.status === 'engaged') status = 'engaged';
        else if (isNodeUnlocked(n, { clearedSlugs, incomingBySlug, run, user })) status = 'available';
        else status = 'locked';
        return {
          id: n.id, slug: n.slug, type: n.type, zone_id: n.zone_id,
          map_x: n.map_x, map_y: n.map_y, pack: n.pack || {}, requires: n.requires || {},
          enemy: n.enemy_slug && {
            slug: n.enemy_slug, family: n.enemy_family, tier: n.enemy_tier, name: n.enemy_name, art: n.enemy_art,
          },
          npc: n.npc_slug && { slug: n.npc_slug, name: n.npc_name },
          status,
          progress: prog ? { current_hp: prog.enemy_current_hp, total_hp: prog.enemy_total_hp, kills: prog.kills } : null,
        };
      });

      return {
        run: { id: run.id, campaign_slug: run.campaign_slug, path: run.path, prestige_level: run.prestige_level, completed: !!run.completed_at },
        zones: zonesRes.rows,
        nodes,
        edges: edgesRes.rows,
      };
    });

    res.json(payload);
  } catch (err) {
    console.error('[campaign] map error:', err);
    res.status(500).json({ message: 'Error cargando el mapa de campaña' });
  }
});

// POST /choose-path → pick light/dark at the crossroads (permanent for the run).
router.post('/choose-path', authenticate, async (req, res) => {
  const path = String(req.body?.path || '');
  try {
    const user = await loadAugmentedUser(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const result = await withTransaction(async (client) => choosePath(client, req.user.id, path, user));
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[campaign] choose-path error:', err);
    res.status(500).json({ message: 'Error al elegir la senda' });
  }
});

// POST /prestige → start New Game+ after completing the campaign.
router.post('/prestige', authenticate, async (req, res) => {
  try {
    const result = await withTransaction(async (client) => prestige(client, req.user.id));
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[campaign] prestige error:', err);
    res.status(500).json({ message: 'Error al prestigiar' });
  }
});

// GET /bestiary → codex: every enemy in the campaign, with the user's kill count.
// Undiscovered enemies are redacted (name/description hidden) so the UI shows a
// silhouette. Persists across prestiges (user_bestiary is not run-scoped).
router.get('/bestiary', authenticate, async (req, res) => {
  try {
    const campRes = await query(
      `SELECT id FROM campaigns WHERE status IN ('active','draft')
       ORDER BY (status='active') DESC, id ASC LIMIT 1`
    );
    if (!campRes.rows[0]) return res.json({ total: 0, discovered: 0, enemies: [] });
    const campaignId = campRes.rows[0].id;

    const rows = await query(
      `SELECT e.slug, e.family, e.tier, e.name, e.description, e.art,
              e.weakness_stat, e.resist_stat,
              COALESCE(b.kills, 0) AS kills,
              (b.user_id IS NOT NULL) AS discovered
       FROM enemy_types e
       LEFT JOIN user_bestiary b ON b.enemy_type_id = e.id AND b.user_id = $1
       WHERE e.campaign_id = $2
       ORDER BY e.tier ASC, e.family ASC, e.slug ASC`,
      [req.user.id, campaignId]
    );

    const enemies = rows.rows.map((r) =>
      r.discovered
        ? r
        : { slug: r.slug, family: r.family, tier: r.tier, discovered: false, kills: 0, name: null, description: null }
    );
    res.json({
      total: rows.rows.length,
      discovered: rows.rows.filter((r) => r.discovered).length,
      enemies,
    });
  } catch (err) {
    console.error('[campaign] bestiary error:', err);
    res.status(500).json({ message: 'Error cargando el bestiario' });
  }
});

// POST /engage/:nodeId → make a node the active target (snapshots scaled HP).
router.post('/engage/:nodeId', authenticate, async (req, res) => {
  const nodeId = parseInt(req.params.nodeId, 10);
  if (!Number.isInteger(nodeId)) return res.status(400).json({ message: 'Nodo inválido' });
  try {
    const user = await loadAugmentedUser(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const result = await withTransaction(async (client) => engageNode(client, req.user.id, nodeId, user));
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[campaign] engage error:', err);
    res.status(500).json({ message: 'Error al enfrentar el nodo' });
  }
});

// GET /npcs/:slug → NPC dialogue + its quests, annotated with the run's state.
router.get('/npcs/:slug', authenticate, async (req, res) => {
  try {
    const user = await loadAugmentedUser(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const payload = await withTransaction(async (client) => {
      const run = await ensureActiveRun(client, req.user.id);
      if (!run) return null;
      // Talking to the NPC passes its waypoint (unlocks downstream nodes).
      await markNpcNodeVisited(client, run, req.params.slug, user);
      return getNpcWithQuests(client, run, req.params.slug, user);
    });
    if (!payload) return res.status(404).json({ message: 'NPC no encontrado' });
    res.json(payload);
  } catch (err) {
    console.error('[campaign] npc error:', err);
    res.status(500).json({ message: 'Error cargando el NPC' });
  }
});

// POST /quests/:id/accept
router.post('/quests/:id/accept', authenticate, async (req, res) => {
  const questId = parseInt(req.params.id, 10);
  if (!Number.isInteger(questId)) return res.status(400).json({ message: 'Misión inválida' });
  try {
    const user = await loadAugmentedUser(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const result = await withTransaction(async (client) => {
      const run = await ensureActiveRun(client, req.user.id);
      if (!run) return { status: 400, body: { message: 'No hay campaña disponible' } };
      return acceptQuest(client, run, questId, user);
    });
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[campaign] accept quest error:', err);
    res.status(500).json({ message: 'Error al aceptar la misión' });
  }
});

// POST /quests/:id/claim
router.post('/quests/:id/claim', authenticate, async (req, res) => {
  const questId = parseInt(req.params.id, 10);
  if (!Number.isInteger(questId)) return res.status(400).json({ message: 'Misión inválida' });
  try {
    const result = await withTransaction(async (client) => {
      const run = await getActiveRun(client, req.user.id);
      if (!run) return { status: 400, body: { message: 'No hay campaña activa' } };
      return claimQuest(client, run, questId, req.user.id);
    });
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[campaign] claim quest error:', err);
    res.status(500).json({ message: 'Error al reclamar la misión' });
  }
});

export default router;

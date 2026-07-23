/**
 * Data-driven campaign seeder.
 *
 * Reads backend/data/campaigns/<slug>.json and UPSERTS every content row
 * (campaign, enemies, npcs, zones, nodes, edges, quests) by its natural slug,
 * so re-running after editing the JSON re-balances content without duplicating
 * or losing player state. This is the ONLY supported way to add/edit campaign
 * content — never hand-write these rows.
 *
 * Slug convention: enemy/npc/quest slugs are UNIQUE per-schema (the ON CONFLICT
 * targets rely on it), and node slugs must be unique across a whole campaign
 * (edges reference them by bare slug). When adding a second themed campaign,
 * namespace content slugs (e.g. "gow-kratos", "gow-forest") to avoid collisions
 * with the main campaign.
 *
 * Usage:
 *   node scripts/seed_campaign.js               # seeds main-campaign
 *   node scripts/seed_campaign.js god-of-war    # seeds data/campaigns/god-of-war.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { withTransaction } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seedCampaign(slug) {
  const file = path.join(__dirname, '..', 'data', 'campaigns', `${slug}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Campaign content not found: ${file}`);
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const j = (v) => JSON.stringify(v ?? {});

  await withTransaction(async (client) => {
    // 1. Campaign
    const campRes = await client.query(
      `INSERT INTO campaigns (slug, name, description, status, config, version)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name, description = EXCLUDED.description,
         status = EXCLUDED.status, config = EXCLUDED.config, version = EXCLUDED.version
       RETURNING id`,
      [data.slug, j(data.name), j(data.description), data.status || 'draft', j(data.config), data.version || 1]
    );
    const campaignId = campRes.rows[0].id;

    // 2. Enemy types → map slug -> id
    const enemyIdBySlug = {};
    for (const e of data.enemy_types || []) {
      const r = await client.query(
        `INSERT INTO enemy_types
           (campaign_id, slug, family, tier, name, description, base_hp, weakness_stat, resist_stat, scaling, loot, art)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (slug) DO UPDATE SET
           campaign_id = EXCLUDED.campaign_id, family = EXCLUDED.family, tier = EXCLUDED.tier,
           name = EXCLUDED.name, description = EXCLUDED.description, base_hp = EXCLUDED.base_hp,
           weakness_stat = EXCLUDED.weakness_stat, resist_stat = EXCLUDED.resist_stat,
           scaling = EXCLUDED.scaling, loot = EXCLUDED.loot, art = EXCLUDED.art
         RETURNING id`,
        [campaignId, e.slug, e.family, e.tier || 1, j(e.name), j(e.description), e.base_hp || 1000,
         e.weakness_stat || null, e.resist_stat || null, j(e.scaling), j(e.loot), j(e.art)]
      );
      enemyIdBySlug[e.slug] = r.rows[0].id;
    }

    // 3. NPCs → map slug -> id
    const npcIdBySlug = {};
    for (const n of data.npcs || []) {
      const r = await client.query(
        `INSERT INTO npcs (campaign_id, slug, name, faction, art, dialogue)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (slug) DO UPDATE SET
           campaign_id = EXCLUDED.campaign_id, name = EXCLUDED.name,
           faction = EXCLUDED.faction, art = EXCLUDED.art, dialogue = EXCLUDED.dialogue
         RETURNING id`,
        [campaignId, n.slug, j(n.name), n.faction || 'neutral', j(n.art), j(n.dialogue)]
      );
      npcIdBySlug[n.slug] = r.rows[0].id;
    }

    // 4. Zones → nodes → edges. TWO PASSES: node slugs must be globally unique
    // within a campaign (edges reference them by bare slug), and inter-zone edges
    // (act transitions) reference nodes in later zones — so we insert ALL nodes
    // across ALL zones first, then resolve every edge.
    const nodeIdBySlug = {};
    const pendingEdges = [];
    for (const z of data.zones || []) {
      const zr = await client.query(
        `INSERT INTO campaign_zones (campaign_id, slug, act, name, theme, order_index, path_required, art, config)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (campaign_id, slug) DO UPDATE SET
           act = EXCLUDED.act, name = EXCLUDED.name, theme = EXCLUDED.theme,
           order_index = EXCLUDED.order_index, path_required = EXCLUDED.path_required,
           art = EXCLUDED.art, config = EXCLUDED.config
         RETURNING id`,
        [campaignId, z.slug, z.act || 1, j(z.name), z.theme || null, z.order_index || 0,
         z.path_required || null, j(z.art), j(z.config)]
      );
      const zoneId = zr.rows[0].id;

      for (const nd of z.nodes || []) {
        if (nd.enemy && !(nd.enemy in enemyIdBySlug)) {
          console.warn(`[seed] node "${nd.slug}" references unknown enemy: ${nd.enemy}`);
        }
        if (nd.npc && !(nd.npc in npcIdBySlug)) {
          console.warn(`[seed] node "${nd.slug}" references unknown npc: ${nd.npc}`);
        }
        const nr = await client.query(
          `INSERT INTO campaign_nodes
             (zone_id, slug, type, enemy_type_id, pack, npc_id, map_x, map_y, requires, rewards)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           ON CONFLICT (zone_id, slug) DO UPDATE SET
             type = EXCLUDED.type, enemy_type_id = EXCLUDED.enemy_type_id, pack = EXCLUDED.pack,
             npc_id = EXCLUDED.npc_id, map_x = EXCLUDED.map_x, map_y = EXCLUDED.map_y,
             requires = EXCLUDED.requires, rewards = EXCLUDED.rewards
           RETURNING id`,
          [zoneId, nd.slug, nd.type || 'combat',
           nd.enemy ? enemyIdBySlug[nd.enemy] ?? null : null, j(nd.pack),
           nd.npc ? npcIdBySlug[nd.npc] ?? null : null,
           nd.map_x || 0, nd.map_y || 0, j(nd.requires), j(nd.rewards)]
        );
        if (nd.slug in nodeIdBySlug) {
          throw new Error(`[seed] duplicate node slug "${nd.slug}" — node slugs must be unique across the whole campaign (edges reference them by slug)`);
        }
        nodeIdBySlug[nd.slug] = nr.rows[0].id;
      }

      for (const ed of z.edges || []) pendingEdges.push(ed);
    }

    // Second pass: resolve every edge now that all nodes exist.
    const seededEdgeIds = [];
    for (const ed of pendingEdges) {
      const from = nodeIdBySlug[ed.from];
      const to = nodeIdBySlug[ed.to];
      if (!from || !to) {
        console.warn(`[seed] edge skipped, unknown node: ${ed.from} -> ${ed.to}`);
        continue;
      }
      const er = await client.query(
        `INSERT INTO campaign_edges (from_node_id, to_node_id, kind)
         VALUES ($1,$2,$3)
         ON CONFLICT (from_node_id, to_node_id) DO UPDATE SET kind = EXCLUDED.kind
         RETURNING id`,
        [from, to, ed.kind || 'main']
      );
      seededEdgeIds.push(er.rows[0].id);
    }

    // Prune stale nodes/edges so the DB reconciles to the JSON (content is the
    // source of truth). Node deletion cascades to its edges + user progress;
    // then we drop any remaining edge no longer declared. Scoped to this campaign.
    const seededNodeIds = Object.values(nodeIdBySlug);
    const delNodes = await client.query(
      `DELETE FROM campaign_nodes n
       USING campaign_zones z
       WHERE n.zone_id = z.id AND z.campaign_id = $1
         AND NOT (n.id = ANY($2::int[]))`,
      [campaignId, seededNodeIds]
    );
    const delEdges = await client.query(
      `DELETE FROM campaign_edges e
       USING campaign_nodes n, campaign_zones z
       WHERE e.from_node_id = n.id AND n.zone_id = z.id AND z.campaign_id = $1
         AND NOT (e.id = ANY($2::int[]))`,
      [campaignId, seededEdgeIds]
    );
    if (delNodes.rowCount || delEdges.rowCount) {
      console.log(`[seed] pruned ${delNodes.rowCount} stale node(s), ${delEdges.rowCount} stale edge(s)`);
    }

    // 5. Quests
    for (const q of data.quests || []) {
      await client.query(
        `INSERT INTO npc_quests
           (npc_id, slug, chain_slug, chain_step, name, description, objective,
            time_limit_hours, path_required, rewards, penalty, requires_quest_slug)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (slug) DO UPDATE SET
           npc_id = EXCLUDED.npc_id, chain_slug = EXCLUDED.chain_slug, chain_step = EXCLUDED.chain_step,
           name = EXCLUDED.name, description = EXCLUDED.description, objective = EXCLUDED.objective,
           time_limit_hours = EXCLUDED.time_limit_hours, path_required = EXCLUDED.path_required,
           rewards = EXCLUDED.rewards, penalty = EXCLUDED.penalty,
           requires_quest_slug = EXCLUDED.requires_quest_slug`,
        [q.npc ? npcIdBySlug[q.npc] ?? null : null, q.slug, q.chain_slug || null, q.chain_step || 1,
         j(q.name), j(q.description), j(q.objective), q.time_limit_hours || null,
         q.path_required || null, j(q.rewards), j(q.penalty), q.requires_quest_slug || null]
      );
    }

    const counts = {
      enemies: (data.enemy_types || []).length,
      npcs: (data.npcs || []).length,
      zones: (data.zones || []).length,
      nodes: Object.keys(nodeIdBySlug).length,
      quests: (data.quests || []).length,
    };
    console.log(`[seed] campaign "${data.slug}" upserted:`, counts);
  });
}

const slug = process.argv[2] || 'main-campaign';
seedCampaign(slug)
  .then(() => { console.log('[seed] done.'); process.exit(0); })
  .catch((err) => { console.error('[seed] failed:', err); process.exit(1); });

import express from 'express';
import { query, withTransaction } from './db.js';
import { authenticate } from './middleware.js';
import { PERKS, PERK_IDS, BRANCHES, perkRank, isPerkUnlocked, getPerkBonuses } from './utils/perks.js';

const router = express.Router();

// Shape the perk catalog + the user's current ranks + lock state for the UI.
const buildPerksPayload = (skillPerks) =>
  PERK_IDS.map((id) => ({
    id,
    branch: PERKS[id].branch,
    tier: PERKS[id].tier,
    maxRank: PERKS[id].maxRank,
    perRank: PERKS[id].perRank,
    kind: PERKS[id].kind,
    requires: PERKS[id].requires,
    rank: perkRank(skillPerks, id),
    unlocked: isPerkUnlocked(skillPerks, id),
  }));

// GET /api/skilltree — points + branches + each perk's rank/lock + aggregate bonuses.
router.get('/', authenticate, async (req, res) => {
  try {
    const r = await query('SELECT skill_points, skill_perks FROM users WHERE id = $1', [req.user.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
    const { skill_points, skill_perks } = r.rows[0];
    res.json({
      skillPoints: skill_points || 0,
      branches: Object.values(BRANCHES),
      perks: buildPerksPayload(skill_perks),
      bonuses: getPerkBonuses(skill_perks),
    });
  } catch (err) {
    console.error('[SKILLTREE] GET failed:', err);
    res.status(500).json({ error: 'Failed to load skill tree' });
  }
});

// POST /api/skilltree/upgrade { perkId } — spend 1 point to rank up a perk.
// Atomic (FOR UPDATE); validates points, max rank AND the branch prerequisite.
router.post('/upgrade', authenticate, async (req, res) => {
  const { perkId } = req.body || {};
  if (!perkId || !PERKS[perkId]) {
    return res.status(400).json({ error: 'Invalid perk', code: 'INVALID_PERK' });
  }

  try {
    const result = await withTransaction(async (client) => {
      const ur = await client.query(
        'SELECT skill_points, skill_perks FROM users WHERE id = $1 FOR UPDATE',
        [req.user.id]
      );
      if (!ur.rows.length) {
        const e = new Error('User not found'); e.status = 404; throw e;
      }
      const points = ur.rows[0].skill_points || 0;
      const perks = ur.rows[0].skill_perks || {};
      const current = perkRank(perks, perkId);

      if (!isPerkUnlocked(perks, perkId)) {
        const e = new Error('Perk is locked'); e.status = 400; e.code = 'LOCKED'; throw e;
      }
      if (points < 1) {
        const e = new Error('No skill points available'); e.status = 400; e.code = 'NO_POINTS'; throw e;
      }
      if (current >= PERKS[perkId].maxRank) {
        const e = new Error('Perk already at max rank'); e.status = 400; e.code = 'MAX_RANK'; throw e;
      }

      const nextRank = current + 1;
      const newPerks = { ...perks, [perkId]: nextRank };
      await client.query(
        'UPDATE users SET skill_points = skill_points - 1, skill_perks = $2::jsonb WHERE id = $1',
        [req.user.id, JSON.stringify(newPerks)]
      );

      return {
        skillPoints: points - 1,
        perkId,
        rank: nextRank,
        perks: buildPerksPayload(newPerks),
        bonuses: getPerkBonuses(newPerks),
      };
    });

    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message, code: err.code });
    console.error('[SKILLTREE] upgrade failed:', err);
    res.status(500).json({ error: 'Failed to upgrade perk' });
  }
});

export default router;

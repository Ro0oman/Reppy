import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';
import { createNotification } from './utils/notifications.js';
import { resolveExpiredChallenges } from './utils/challenges.js';

const router = express.Router();

const VALID_GOAL_TYPES = ['reps', 'damage'];

const calcReward = (goalType, goalValue) => {
  if (goalType === 'reps') return {
    coins: Math.min(2000, Math.max(50,  Math.round(goalValue * 2))),
    gems:  Math.min(10,   Math.max(1,   Math.floor(goalValue / 100))),
  };
  if (goalType === 'damage') return {
    coins: Math.min(2000, Math.max(50,  Math.round(goalValue * 0.04))),
    gems:  Math.min(10,   Math.max(1,   Math.floor(goalValue / 5000))),
  };
  return { coins: 75, gems: 1 };
};

// GET /api/challenges — list my challenges (all statuses)
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    await resolveExpiredChallenges();

    const result = await query(`
      SELECT
        ac.*,
        u1.name AS challenger_name, u1.avatar_url AS challenger_avatar,
        u2.name AS challenged_name, u2.avatar_url AS challenged_avatar,
        uw.name AS winner_name
      FROM async_challenges ac
      JOIN users u1 ON u1.id = ac.challenger_id
      JOIN users u2 ON u2.id = ac.challenged_id
      LEFT JOIN users uw ON uw.id = ac.winner_id
      WHERE ac.challenger_id = $1 OR ac.challenged_id = $1
      ORDER BY ac.created_at DESC
      LIMIT 50
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('[CHALLENGES] GET error:', err);
    res.status(500).json({ message: 'Error fetching challenges' });
  }
});

// POST /api/challenges — create a challenge
router.post('/', authenticate, async (req, res) => {
  const challengerId = req.user.id;
  const { challengedId, goalType = 'reps', goalValue = 100 } = req.body;

  if (!challengedId || challengerId === Number(challengedId)) {
    return res.status(400).json({ message: 'Invalid opponent' });
  }
  if (!VALID_GOAL_TYPES.includes(goalType)) {
    return res.status(400).json({ message: 'Invalid goal type' });
  }
  if (goalValue < 10 || goalValue > 100000) {
    return res.status(400).json({ message: 'Invalid goal value' });
  }

  try {
    // Prevent duplicate active/pending challenges between same pair
    const existing = await query(`
      SELECT id FROM async_challenges
      WHERE status IN ('pending', 'active')
        AND ((challenger_id = $1 AND challenged_id = $2) OR (challenger_id = $2 AND challenged_id = $1))
    `, [challengerId, challengedId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Ya existe un reto activo con ese jugador' });
    }

    const { coins, gems } = calcReward(goalType, goalValue);
    const result = await query(`
      INSERT INTO async_challenges (challenger_id, challenged_id, goal_type, goal_value, reward_coins, reward_gems)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [challengerId, challengedId, goalType, goalValue, coins, gems]);

    const challenge = result.rows[0];

    await createNotification(
      challengedId,
      'CHALLENGE_RECEIVED',
      challengerId,
      'te ha enviado un reto de 24h ⚔️',
      challenge.id
    );

    res.status(201).json(challenge);
  } catch (err) {
    console.error('[CHALLENGES] POST error:', err);
    res.status(500).json({ message: 'Error creating challenge' });
  }
});

// POST /api/challenges/:id/accept
router.post('/:id/accept', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const challengeRes = await query(
      `SELECT * FROM async_challenges WHERE id = $1 AND challenged_id = $2 AND status = 'pending'`,
      [id, userId]
    );
    if (!challengeRes.rows.length) {
      return res.status(404).json({ message: 'Reto no encontrado o ya procesado' });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const result = await query(`
      UPDATE async_challenges
      SET status = 'active', expires_at = $1
      WHERE id = $2
      RETURNING *
    `, [expiresAt, id]);

    const c = challengeRes.rows[0];
    await createNotification(
      c.challenger_id,
      'CHALLENGE_ACCEPTED',
      userId,
      'ha aceptado tu reto. ¡Comienza en 24h! ⚔️',
      Number(id)
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[CHALLENGES] accept error:', err);
    res.status(500).json({ message: 'Error accepting challenge' });
  }
});

// POST /api/challenges/:id/decline
router.post('/:id/decline', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await query(`
      UPDATE async_challenges
      SET status = 'declined', resolved_at = NOW()
      WHERE id = $1 AND challenged_id = $2 AND status = 'pending'
      RETURNING *
    `, [id, userId]);

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Reto no encontrado' });
    }
    res.json({ message: 'Reto rechazado' });
  } catch (err) {
    console.error('[CHALLENGES] decline error:', err);
    res.status(500).json({ message: 'Error declining challenge' });
  }
});

export default router;

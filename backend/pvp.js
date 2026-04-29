import express from 'express';
import pool, { query } from './db.js';
import { authenticate } from './middleware.js';
import { createNotification } from './utils/notifications.js';
import { recalculateUserStats } from './utils/stats.js';
import { calculatePvpDamage, checkPvpCooldown } from './utils/pvp_logic.js';
import { broadcastPvP } from './socketManager.js';

const router = express.Router();

// 0. Get My Fights
router.get('/my-fights', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await query(
      `SELECT f.*, 
              u1.name as challenger_name, u1.avatar_url as challenger_avatar,
              u2.name as challenged_name, u2.avatar_url as challenged_avatar
       FROM pvp_fights f
       JOIN users u1 ON f.challenger_id = u1.id
       JOIN users u2 ON f.challenged_id = u2.id
       WHERE f.challenger_id = $1 OR f.challenged_id = $1
       ORDER BY f.created_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching my fights:', error);
    res.status(500).json({ message: 'Error fetching fights' });
  }
});

// 1. Create Challenge
router.post('/challenge', authenticate, async (req, res) => {
  const { challengedId, maxHp, timeLimit, battlefield, allowedExercises, anticheatEnabled } = req.body;
  const challengerId = req.user.id;

  if (challengerId === challengedId) {
    return res.status(400).json({ message: 'No puedes retarte a ti mismo' });
  }

  try {
    const seed = Math.random().toString(36).substring(7);
    const result = await query(
      `INSERT INTO pvp_fights (challenger_id, challenged_id, status, max_hp, time_limit, battlefield, allowed_exercises, anticheat_enabled, hp1, hp2, seed)
       VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $3, $3, $8)
       RETURNING *`,
      [challengerId, challengedId, maxHp || 1000, timeLimit || 60, battlefield || 'default', JSON.stringify(allowedExercises || ["pullups", "pushups", "dips"]), anticheatEnabled !== false, seed]
    );

    const fight = result.rows[0];

    // Create notification
    await createNotification(
      challengedId,
      'PVP_CHALLENGE',
      challengerId,
      'te ha retado a un duelo PvP ⚔',
      fight.id,
      challengedId
    );

    res.json(fight);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: 'Error creating challenge' });
  }
});

// 2. Accept & Start Challenge
router.post('/:id/accept', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const fightRes = await query('SELECT * FROM pvp_fights WHERE id = $1', [id]);
    if (fightRes.rows.length === 0) return res.status(404).json({ message: 'Reto no encontrado' });

    const fight = fightRes.rows[0];
    if (fight.challenged_id !== userId) return res.status(403).json({ message: 'No eres el destinatario de este reto' });
    if (fight.status !== 'pending') return res.status(400).json({ message: 'El reto ya no está pendiente' });

    // Start fight
    const updatedFight = await query(
      `UPDATE pvp_fights 
       SET status = 'active', started_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING *`,
      [id]
    );

    // Create event
    await query(
      'INSERT INTO pvp_events (fight_id, user_id, type) VALUES ($1, $2, $3)',
      [id, userId, 'start']
    );

    broadcastPvP(id, 'start', { userId });

    res.json(updatedFight.rows[0]);
  } catch (error) {
    console.error('Error accepting challenge:', error);
    res.status(500).json({ message: 'Error accepting challenge' });
  }
});

// 3. Get Fight Status
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const fightRes = await query(`
      SELECT f.*, 
             u1.name as challenger_name, u1.avatar_url as challenger_avatar,
             u2.name as challenged_name, u2.avatar_url as challenged_avatar
      FROM pvp_fights f
      JOIN users u1 ON f.challenger_id = u1.id
      JOIN users u2 ON f.challenged_id = u2.id
      WHERE f.id = $1
    `, [id]);

    if (fightRes.rows.length === 0) return res.status(404).json({ message: 'Pelea no encontrada' });

    res.json(fightRes.rows[0]);
  } catch (error) {
    console.error('Error fetching fight:', error);
    res.status(500).json({ message: 'Error fetching fight' });
  }
});

// 4. Log Set (Authoritative)
router.post('/:id/log-set', authenticate, async (req, res) => {
  const { id } = req.params;
  const { exercise, reps } = req.body;
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch Fight with Row Lock
    const fightRes = await client.query('SELECT * FROM pvp_fights WHERE id = $1 FOR UPDATE', [id]);
    if (fightRes.rows.length === 0) throw new Error('Pelea no encontrada');
    const fight = fightRes.rows[0];

    if (fight.status !== 'active') throw new Error('La pelea no está activa');
    if (fight.challenger_id !== userId && fight.challenged_id !== userId) throw new Error('No participas en esta pelea');

    // 2. Validation (Cooldown & AntiCheat)
    const cooldown = await checkPvpCooldown(userId, id, client);
    if (cooldown.error) throw new Error(cooldown.error);

    const userRes = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    const { damage, isCrit, error, flags } = calculatePvpDamage(userRes.rows[0], exercise, reps, fight);
    if (error) throw new Error(error);

    // 3. Atomic State Update (Increment set_count for determinism)
    const isChallenger = fight.challenger_id === userId;
    const updateQuery = isChallenger
      ? `UPDATE pvp_fights 
         SET hp2 = GREATEST(0, hp2 - $1), 
             damage1 = damage1 + $1,
             set_count1 = set_count1 + 1,
             state = jsonb_set(COALESCE(state, '{}'), '{last_hit}', $2)
         WHERE id = $3 RETURNING hp2 as opponent_hp`
      : `UPDATE pvp_fights 
         SET hp1 = GREATEST(0, hp1 - $1), 
             damage2 = damage2 + $1,
             set_count2 = set_count2 + 1,
             state = jsonb_set(COALESCE(state, '{}'), '{last_hit}', $2)
         WHERE id = $3 RETURNING hp1 as opponent_hp`;

    const lastHitInfo = JSON.stringify({ userId, damage, isCrit, timestamp: Date.now(), flags });
    const updateRes = await client.query(updateQuery, [damage, lastHitInfo, id]);
    const opponentHp = updateRes.rows[0].opponent_hp;

    // 4. Record Event
    await client.query(
      'INSERT INTO pvp_events (fight_id, user_id, type, payload) VALUES ($1, $2, $3, $4)',
      [id, userId, 'set', JSON.stringify({ exercise, reps, damage, isCrit })]
    );

    // 5. Victory Check
    if (opponentHp <= 0) {
      await client.query(
        `UPDATE pvp_fights SET status = 'completed', winner_id = $1, ended_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [userId, id]
      );
      await client.query(
        'INSERT INTO pvp_events (fight_id, user_id, type) VALUES ($1, $2, $3)',
        [id, userId, 'finish']
      );
    }

    await client.query('COMMIT');
    
    // Broadcast hit with updated state
    broadcastPvP(id, 'set', { 
      userId, 
      exercise, 
      reps, 
      damage, 
      isCrit,
      hp1: isChallenger ? fight.hp1 : opponentHp,
      hp2: isChallenger ? opponentHp : fight.hp2,
      damage1: isChallenger ? fight.damage1 + damage : fight.damage1,
      damage2: isChallenger ? fight.damage2 : fight.damage2 + damage
    });

    // Broadcast finish if needed
    if (opponentHp <= 0) {
      broadcastPvP(id, 'finish', { winnerId: userId });
    }

    recalculateUserStats(userId).catch(err => console.error('Stat recalc error:', err));

    res.json({ damage, isCrit, opponentHp });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
});

// 5. Send Confetti
router.post('/:id/confetti', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    await query(
      'INSERT INTO pvp_events (fight_id, user_id, type) VALUES ($1, $2, $3)',
      [id, userId, 'confetti']
    );
    broadcastPvP(id, 'confetti', { userId });
    res.json({ message: 'Confetti sent!' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending confetti' });
  }
});

// 6. Get Events (Polling)
router.get('/:id/events', authenticate, async (req, res) => {
  const { id } = req.params;
  const { since } = req.query; // Timestamp ISO string
  try {
    let q = 'SELECT * FROM pvp_events WHERE fight_id = $1';
    let params = [id];
    
    if (since && since !== '0' && since !== 'null' && since !== 'undefined') {
      const date = new Date(since);
      if (!isNaN(date.getTime()) && (since.includes('-') || since.includes(':'))) {
        q += ' AND created_at > $2';
        params.push(since);
      }
    }
    
    q += ' ORDER BY created_at ASC';
    const eventsRes = await query(q, params);
    res.json(eventsRes.rows);
  } catch (error) {
    console.error('Events poll error:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// 7. Finish Fight (Timeout settlement)
router.post('/:id/finish', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        const fightRes = await query('SELECT * FROM pvp_fights WHERE id = $1', [id]);
        if (fightRes.rows.length === 0) return res.status(404).json({ message: 'Pelea no encontrada' });
        const fight = fightRes.rows[0];

        if (fight.status !== 'active') return res.status(400).json({ message: 'La pelea no está activa' });

        // Determination logic
        let winnerId = null;
        if (fight.hp1 > fight.hp2) winnerId = fight.challenger_id;
        else if (fight.hp2 > fight.hp1) winnerId = fight.challenged_id;
        else {
            if (fight.damage1 > fight.damage2) winnerId = fight.challenger_id;
            else if (fight.damage2 > fight.damage1) winnerId = fight.challenged_id;
        }

        await query(
            `UPDATE pvp_fights SET status = 'completed', winner_id = $1, ended_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [winnerId, id]
        );

        await query(
            'INSERT INTO pvp_events (fight_id, type, payload) VALUES ($1, $2, $3)',
            [id, 'finish', JSON.stringify({ winnerId })]
        );

        broadcastPvP(id, 'finish', { winnerId });

        res.json({ winnerId });
    } catch (error) {
        res.status(500).json({ message: 'Error finishing fight' });
    }
});

export default router;

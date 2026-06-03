import { query } from '../db.js';

const resolveChallenge = async (id, winnerId, rewardCoins) => {
  await query('BEGIN');
  await query(`
    UPDATE async_challenges
    SET status = 'finished', winner_id = $1, resolved_at = NOW()
    WHERE id = $2 AND status = 'active'
  `, [winnerId, id]);
  if (winnerId) {
    await query(`UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2`, [rewardCoins, winnerId]);
  }
  await query('COMMIT');
};

export const updateChallengeScores = async (userId, { reps = 0, damage = 0 }) => {
  try {
    const active = await query(`
      SELECT id, challenger_id, challenged_id, goal_type, goal_value, challenger_score, challenged_score, reward_coins
      FROM async_challenges
      WHERE status = 'active'
        AND (challenger_id = $1 OR challenged_id = $1)
        AND expires_at > NOW()
    `, [userId]);

    for (const c of active.rows) {
      let add = 0;
      if (c.goal_type === 'reps') add = reps;
      else if (c.goal_type === 'damage') add = damage;
      if (add <= 0) continue;

      const col = c.challenger_id === userId ? 'challenger_score' : 'challenged_score';
      const updated = await query(
        `UPDATE async_challenges SET ${col} = ${col} + $1 WHERE id = $2 RETURNING challenger_score, challenged_score`,
        [add, c.id]
      );

      const { challenger_score, challenged_score } = updated.rows[0];

      // Resolve immediately if goal reached
      const challengerDone = challenger_score >= c.goal_value;
      const challengedDone = challenged_score >= c.goal_value;

      if (challengerDone || challengedDone) {
        let winnerId;
        if (challengerDone && challengedDone) {
          winnerId = challenger_score > challenged_score ? c.challenger_id : c.challenged_id;
        } else {
          winnerId = challengerDone ? c.challenger_id : c.challenged_id;
        }
        await resolveChallenge(c.id, winnerId, c.reward_coins).catch(console.error);
      }
    }
  } catch (err) {
    console.error('[CHALLENGES] Error updating scores:', err);
  }
};

export const resolveExpiredChallenges = async () => {
  try {
    // Resolve time-expired challenges
    const expired = await query(`
      SELECT id, challenger_id, challenged_id, challenger_score, challenged_score, reward_coins
      FROM async_challenges
      WHERE status = 'active' AND expires_at <= NOW()
    `);

    for (const c of expired.rows) {
      const winnerId =
        c.challenger_score > c.challenged_score ? c.challenger_id :
        c.challenged_score > c.challenger_score ? c.challenged_id :
        null;
      await resolveChallenge(c.id, winnerId, c.reward_coins).catch(console.error);
    }

    // Also resolve any active challenges where someone already hit the goal
    // (catches cases where the reps hook didn't fire, e.g. historical data)
    const goalReached = await query(`
      SELECT id, challenger_id, challenged_id, challenger_score, challenged_score, reward_coins, goal_value
      FROM async_challenges
      WHERE status = 'active'
        AND (challenger_score >= goal_value OR challenged_score >= goal_value)
    `);

    for (const c of goalReached.rows) {
      const challengerDone = c.challenger_score >= c.goal_value;
      const challengedDone = c.challenged_score >= c.goal_value;
      let winnerId;
      if (challengerDone && challengedDone) {
        winnerId = c.challenger_score > c.challenged_score ? c.challenger_id : c.challenged_id;
      } else {
        winnerId = challengerDone ? c.challenger_id : c.challenged_id;
      }
      await resolveChallenge(c.id, winnerId, c.reward_coins).catch(console.error);
    }
  } catch (err) {
    console.error('[CHALLENGES] Error resolving:', err);
  }
};

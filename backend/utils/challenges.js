import { query } from '../db.js';

export const updateChallengeScores = async (userId, { reps = 0, damage = 0 }) => {
  try {
    const active = await query(`
      SELECT id, challenger_id, challenged_id, goal_type
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
      await query(`UPDATE async_challenges SET ${col} = ${col} + $1 WHERE id = $2`, [add, c.id]);
    }
  } catch (err) {
    console.error('[CHALLENGES] Error updating scores:', err);
  }
};

export const resolveExpiredChallenges = async () => {
  try {
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

      await query('BEGIN');
      await query(`
        UPDATE async_challenges
        SET status = 'finished', winner_id = $1, resolved_at = NOW()
        WHERE id = $2
      `, [winnerId, c.id]);
      if (winnerId) {
        await query(`UPDATE users SET reppy_coins = reppy_coins + $1 WHERE id = $2`, [c.reward_coins, winnerId]);
      }
      await query('COMMIT');
    }
  } catch (err) {
    await query('ROLLBACK').catch(() => {});
    console.error('[CHALLENGES] Error resolving expired:', err);
  }
};

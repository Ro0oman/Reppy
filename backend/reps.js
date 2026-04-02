import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

// Get reps for a user
router.get('/', authenticate, async (req, res) => {
  const { type } = req.query;
  try {
    let q = 'SELECT id, count, date, exercise_type FROM reps WHERE user_id = $1';
    let params = [req.user.id];
    
    if (type) {
      q += ' AND exercise_type = $2';
      params.push(type);
    }
    
    q += ' ORDER BY date DESC';
    
    const repsResult = await query(q, params);
    res.json(repsResult.rows);
  } catch (error) {
    console.error('Error fetching reps:', error);
    res.status(500).json({ message: 'Error fetching reps' });
  }
});

// Add or update reps for a date
router.post('/', authenticate, async (req, res) => {
  const { count, date, exercise_type = 'pullups', added_weight = 0 } = req.body;
  const userId = req.user.id;

  try {
    // 1. Insert or update reps for the specific date and exercise type
    const result = await query(
      `INSERT INTO reps (user_id, count, date, exercise_type, added_weight) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (user_id, date, exercise_type) 
       DO UPDATE SET count = reps.count + EXCLUDED.count,
                     added_weight = EXCLUDED.added_weight 
       RETURNING *`,
      [userId, count, date || new Date().toISOString().split('T')[0], exercise_type, parseFloat(added_weight) || 0]
    );

    // 2. Calcular Reppy Coins y XP ganada
    let coinMultiplier = 1;
    let statToUpgrade = 'str_xp';
    let extraStatToUpgrade = null;

    if (exercise_type === 'pullups') { coinMultiplier = 1; statToUpgrade = 'str_xp'; }
    else if (exercise_type === 'pushups') { coinMultiplier = 1; statToUpgrade = 'end_xp'; }
    else if (exercise_type === 'dips') { coinMultiplier = 2; statToUpgrade = 'str_xp'; }
    else if (exercise_type === 'weighted_pullups') { coinMultiplier = 3; statToUpgrade = 'pwr_xp'; }
    else if (exercise_type === 'muscleups') { coinMultiplier = 5; statToUpgrade = 'pwr_xp'; extraStatToUpgrade = 'agi_xp'; }

    const earnedCoins = count * coinMultiplier;
    
    // Update user's total_reps, coins and xp
    let userUpdateQuery = `
      UPDATE users 
      SET total_reps = total_reps + $1,
          reppy_coins = reppy_coins + $2,
          ${statToUpgrade} = ${statToUpgrade} + $1
    `;
    if (extraStatToUpgrade) {
      userUpdateQuery += `, ${extraStatToUpgrade} = ${extraStatToUpgrade} + $1`;
    }
    userUpdateQuery += ` WHERE id = $3`;
    
    await query(userUpdateQuery, [count, earnedCoins, userId]);

    // 3. Atacar al Boss Global Activo (si existe)
    const bossRes = await query(
      `SELECT id, current_hp FROM boss_fights WHERE status = 'active' AND start_date <= CURRENT_TIMESTAMP AND end_date >= CURRENT_TIMESTAMP LIMIT 1`
    );

    if (bossRes.rows.length > 0) {
      const boss = bossRes.rows[0];
      const damage = count;
      const newHp = Math.max(0, boss.current_hp - damage);
      
      await query(`UPDATE boss_fights SET current_hp = $1 WHERE id = $2`, [newHp, boss.id]);
      
      // Update participant damage
      await query(
        `INSERT INTO event_participants (boss_fight_id, user_id, damage_dealt) 
         VALUES ($1, $2, $3)
         ON CONFLICT (boss_fight_id, user_id) 
         DO UPDATE SET damage_dealt = event_participants.damage_dealt + EXCLUDED.damage_dealt`,
        [boss.id, userId, damage]
      );
      
      if (newHp === 0) {
        await query(`UPDATE boss_fights SET status = 'defeated' WHERE id = $1`, [boss.id]);
      }
    }

    res.json({ ...result.rows[0], earnedCoins });
  } catch (error) {
    console.error('Error adding reps:', error);
    res.status(500).json({ message: 'Error adding reps', error: error.message });
  }
});

// Get heatmap data (reps per day for the last year, filtered by type)
router.get('/heatmap', authenticate, async (req, res) => {
  const { type = 'pullups' } = req.query;
  try {
    const result = await query(
      `SELECT date, count FROM reps 
       WHERE user_id = $1 AND exercise_type = $2 AND date > CURRENT_DATE - INTERVAL '1 year'
       ORDER BY date ASC`,
      [req.user.id, type]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ message: 'Error fetching heatmap' });
  }
});

// Get stats for dashboard
router.get('/stats', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { type = 'pullups' } = req.query;
  try {
    // 1. Total Reps for this exercise
    const totalRes = await query(
      'SELECT SUM(count) as total FROM reps WHERE user_id = $1 AND exercise_type = $2',
      [userId, type]
    );
    const totalReps = parseInt(totalRes.rows[0]?.total) || 0;

    // 2. Daily Goal & Body Weight
    const userRes = await query('SELECT daily_goal, body_weight FROM users WHERE id = $1', [userId]);
    const { daily_goal, body_weight = 75 } = userRes.rows[0];

    // 3. Top Month for this exercise
    const topMonthRes = await query(
      `SELECT TO_CHAR(date, 'Month') as month, SUM(count) as total 
       FROM reps 
       WHERE user_id = $1 AND exercise_type = $2
       GROUP BY TO_CHAR(date, 'Month'), date_trunc('month', date)
       ORDER BY total DESC, date_trunc('month', date) DESC 
       LIMIT 1`,
      [userId, type]
    );
    const topMonth = topMonthRes.rows[0]?.month?.trim() || 'N/A';
    const topMonthCount = parseInt(topMonthRes.rows[0]?.total) || 0;

    // 4. Current Streak for this exercise
    const datesRes = await query(
      'SELECT DISTINCT date FROM reps WHERE user_id = $1 AND exercise_type = $2 ORDER BY date DESC',
      [userId, type]
    );
    
    let streak = 0;
    if (datesRes.rows.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const lastRepDate = new Date(datesRes.rows[0].date);
      lastRepDate.setHours(0,0,0,0);
      const diffDays = Math.floor((today - lastRepDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak = 1;
        for (let i = 0; i < datesRes.rows.length - 1; i++) {
          const current = new Date(datesRes.rows[i].date);
          const next = new Date(datesRes.rows[i+1].date);
          const d = Math.floor((current - next) / (1000 * 60 * 60 * 24));
          if (d === 1) streak++;
          else break;
        }
      }
    }

    // 5. Total Volume (Kg moved) for this exercise
    const volumeRes = await query(
      `SELECT SUM(count * (COALESCE($2, 75.0) + added_weight)) as volume 
       FROM reps 
       WHERE user_id = $1 AND exercise_type = $3`,
      [userId, body_weight, type]
    );
    const totalVolume = parseFloat(volumeRes.rows[0]?.volume) || 0;

    res.json({
      totalReps,
      streak,
      topMonth,
      topMonthCount,
      dailyGoal: daily_goal,
      bodyWeight: body_weight,
      totalVolume
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Edit reps by ID (New requirement)
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { count } = req.body;
  const userId = req.user.id;

  try {
    // Verify ownership
    const checkResult = await query(
      'SELECT * FROM reps WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized or not found' });
    }

    // Update count
    const updateResult = await query(
      'UPDATE reps SET count = $1 WHERE id = $2 RETURNING *',
      [count, id]
    );

    // Update user's total_reps cache
    await query(
      'UPDATE users SET total_reps = (SELECT SUM(count) FROM reps WHERE user_id = $1) WHERE id = $1',
      [userId]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating reps:', error);
    res.status(500).json({ message: 'Error updating reps' });
  }
});

export default router;

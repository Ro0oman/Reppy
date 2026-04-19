import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';
import { getExerciseRewards, getBossDamageMultiplier } from './utils/rewards.js';
import { recalculateUserStats, augmentUserWithLevels } from './utils/stats.js';
import { trackCoinTransaction } from './utils/transactions.js';
import { syncBossHealth } from './utils/boss.js';
import { getLocalDateString } from './utils/date.js';
import { calculateDamage } from './utils/damage.js';


const router = express.Router();


// Get reps for a user
router.get('/', authenticate, async (req, res) => {
  const { type } = req.query;
  try {
    let q = 'SELECT id, count, date, exercise_type FROM reps WHERE user_id = $1';
    let params = [req.user.id];
    
    if (type && type !== 'all') {
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
      [userId, count, date || getLocalDateString(), exercise_type, parseFloat(added_weight) || 0]
    );

    // 2. Calcular Reppy Coins y XP ganada
    const { coins: earnedCoins, statToUpgrade, extraStatToUpgrade } = getExerciseRewards(exercise_type, count);
    
    // Update user's total_reps, coins and xp
    let userUpdateQuery = `
      UPDATE users 
      SET total_reps = GREATEST(0, total_reps + $1),
          reppy_coins = GREATEST(0, reppy_coins + $2),
          ${statToUpgrade} = GREATEST(0, ${statToUpgrade} + $1)
    `;
    if (extraStatToUpgrade) {
      userUpdateQuery += `, ${extraStatToUpgrade} = GREATEST(0, ${extraStatToUpgrade} + $1)`;
    }
    userUpdateQuery += ` WHERE id = $3`;
    
    await query(userUpdateQuery, [count, earnedCoins, userId]);

    // Record the transaction in the history
    await trackCoinTransaction(userId, earnedCoins, 'EXERCISE', `Recompensa por ${count} ${exercise_type}`);

    // Update ALL XP stats and total_reps based on history (Aggregate Truth)
    await recalculateUserStats(userId);



    // 3. Atacar al Boss Global Activo (si existe - Secuencial)
    const bossRes = await query(
      `SELECT id, current_hp, total_hp, weakness_stat FROM boss_fights 
       WHERE status != 'defeated' 
       ORDER BY order_index ASC LIMIT 1`
    );

    let actualDamageDealt = 0;

    // Get user with full stats for damage calculation
    const userFullRes = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const userRaw = userFullRes.rows[0];
    const user = augmentUserWithLevels(userRaw);
    const dmgResult = calculateDamage(user, count, exercise_type);

    if (bossRes.rows.length > 0) {
      const boss = bossRes.rows[0];
      
      // Calculate specific boss damage (weaknesses etc)
      const bossDmgResult = calculateDamage(user, count, exercise_type, boss);
      actualDamageDealt = bossDmgResult.totalDamage;
      const newHp = Math.max(0, boss.current_hp - actualDamageDealt);
      
      await query(`UPDATE boss_fights SET current_hp = $1 WHERE id = $2`, [newHp, boss.id]);
      
      // Update participant damage
      await query(
        `INSERT INTO event_participants (boss_fight_id, user_id, damage_dealt) 
         VALUES ($1, $2, $3)
         ON CONFLICT (boss_fight_id, user_id) 
         DO UPDATE SET damage_dealt = event_participants.damage_dealt + EXCLUDED.damage_dealt`,
        [boss.id, userId, actualDamageDealt]
      );

      // Update user's daily damage tracker (Keep for UI stats, but no cap enforced)
      await query(
        `UPDATE users 
         SET daily_boss_damage = CASE 
           WHEN last_boss_damage_date = CURRENT_DATE THEN daily_boss_damage + $1 
           ELSE $1 
         END, 
         last_boss_damage_date = CURRENT_DATE 
         WHERE id = $2`,
        [actualDamageDealt, userId]
      );
      
      if (newHp === 0) {
        await query(`UPDATE boss_fights SET status = 'defeated' WHERE id = $1`, [boss.id]);
        await syncBossHealth();
      }
    }

    // 4. Update the actual record with boss_damage_dealt and metadata
    await query(
      `UPDATE reps 
       SET boss_damage_dealt = COALESCE(boss_damage_dealt, 0) + $1,
           active_multiplier = $2
       WHERE id = $3`, 
      [actualDamageDealt, dmgResult.activeMultiplier, result.rows[0].id]
    );

    const dmgInfo = calculateDamage(await query('SELECT * FROM users WHERE id = $1', [userId]).then(r => r.rows[0]), count, exercise_type);

    res.json({ 
      ...result.rows[0], 
      earnedCoins, 
      boss_damage_dealt: actualDamageDealt,
      is_crit: dmgInfo.isCrit,
      magic_bonus: dmgInfo.magicBonus
    });
  } catch (error) {
    console.error('Error adding reps:', error);
    res.status(500).json({ message: 'Error adding reps', error: error.message });
  }
});

// Get heatmap data (reps per day for the last year, filtered by type)
router.get('/heatmap', authenticate, async (req, res) => {
  const { type, year } = req.query;
  const userId = req.user.id;
  try {
    const isGlobal = !type || type === 'all' || type === 'undefined';
    
    let q = 'SELECT date, exercise_type, SUM(count)::int as count FROM reps WHERE user_id = $1';
    let params = [userId];

    if (!isGlobal) {
      q += ' AND exercise_type = $2';
      params.push(type);
    }

    if (year) {
      const yearInt = parseInt(year);
      q += ` AND date >= '${yearInt}-01-01' AND date <= '${yearInt}-12-31'`;
    } else {
      q += " AND date > CURRENT_DATE - INTERVAL '1 year'";
    }

    q += ' GROUP BY date, exercise_type ORDER BY date ASC';

    const result = await query(q, params);
    
    const formattedRows = result.rows.map(row => ({
      ...row,
      count: Number(row.count)
    }));
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ message: 'Error fetching heatmap' });
  }
});

// Get stats for dashboard
router.get('/stats', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { type } = req.query;
  try {
    const isGlobal = !type || type === 'all';
    const typeFilter = isGlobal ? '' : 'AND exercise_type = $2';
    const params = isGlobal ? [userId] : [userId, type];

    const totalRes = await query(
      `SELECT SUM(count)::int as total FROM reps WHERE user_id = $1 ${typeFilter}`,
      params
    );
    const totalReps = parseInt(totalRes.rows[0]?.total) || 0;

    // 2. Daily Goal & Body Weight
    const userRes = await query('SELECT daily_goal, body_weight FROM users WHERE id = $1', [userId]);
    const { daily_goal, body_weight = 75 } = userRes.rows[0];

    // 3. Top Month for this exercise (or all)
    const topMonthRes = await query(
      `SELECT TO_CHAR(date, 'Month') as month, SUM(count) as total 
       FROM reps 
       WHERE user_id = $1 ${typeFilter}
       GROUP BY TO_CHAR(date, 'Month'), date_trunc('month', date)
       ORDER BY total DESC, date_trunc('month', date) DESC 
       LIMIT 1`,
      params
    );
    const topMonth = topMonthRes.rows[0]?.month?.trim() || 'N/A';
    const topMonthCount = parseInt(topMonthRes.rows[0]?.total) || 0;

    // 4. Current Streak for this exercise (or all)
    const datesRes = await query(
      `SELECT DISTINCT date FROM reps WHERE user_id = $1 ${typeFilter} ORDER BY date DESC`,
      params
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

    // 5. Total Volume (Kg moved) for this exercise (or all)
    // IMPORTANT: Fix parameter indices here to avoid conflicts
    let volumeQuery = 'SELECT SUM(count * (COALESCE($2, 75.0) + added_weight))::float as volume FROM reps WHERE user_id = $1';
    let volumeParams = [userId, body_weight];
    
    if (!isGlobal) {
      volumeQuery += ' AND exercise_type = $3';
      volumeParams.push(type);
    }
    
    const volumeRes = await query(volumeQuery, volumeParams);
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

// Edit reps by ID
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { count } = req.body;
  const userId = req.user.id;

  try {
    // 1. Get old values
    const oldRes = await query(
      'SELECT count, exercise_type, boss_damage_dealt, date FROM reps WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (oldRes.rows.length === 0) {
      return res.status(404).json({ message: 'Rep not found' });
    }

    const oldRep = oldRes.rows[0];
    const diffCount = count - oldRep.count;

    if (diffCount === 0) return res.json(oldRep);

    // 1. Calculate Reward Difference
    const oldRewards = getExerciseRewards(oldRep.exercise_type, oldRep.count);
    const newRewards = getExerciseRewards(oldRep.exercise_type, count);
    const diffCoins = newRewards.coins - oldRewards.coins;

    // 2. Boss Health Adjustment
    let newBossDamageDealt = 0;
    const isToday = getLocalDateString(oldRep.date) === getLocalDateString();

    // Find active boss
    const bossRes = await query(
      `SELECT id, current_hp, total_hp, weakness_stat FROM boss_fights 
       WHERE status != 'defeated' 
       ORDER BY order_index ASC LIMIT 1`
    );

    // Get user with full stats for damage calculation
    const userFullRes = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const userRaw = userFullRes.rows[0];
    const user = augmentUserWithLevels(userRaw);
    const dmgResult = calculateDamage(user, count, oldRep.exercise_type);

    if (bossRes.rows.length > 0) {
      const boss = bossRes.rows[0];
      const bossDmgResult = calculateDamage(user, count, oldRep.exercise_type, boss);
      newBossDamageDealt = bossDmgResult.totalDamage;

      const bossHpChange = newBossDamageDealt - oldRep.boss_damage_dealt;
      const newBossHp = Math.min(boss.total_hp, Math.max(0, boss.current_hp - bossHpChange));

      await query(`UPDATE boss_fights SET current_hp = $1 WHERE id = $2`, [newBossHp, boss.id]);

      // Update historic damage in event_participants
      await query(
        `UPDATE event_participants 
         SET damage_dealt = GREATEST(0, damage_dealt + $1) 
         WHERE boss_fight_id = $2 AND user_id = $3`,
        [bossHpChange, boss.id, userId]
      );

      // Check for defeat
      if (newBossHp === 0) {
        await query(`UPDATE boss_fights SET status = 'defeated' WHERE id = $1`, [boss.id]);
        await syncBossHealth();
      }
    }

    // 3. Update reps table
    const updateResult = await query(
      'UPDATE reps SET count = $1, boss_damage_dealt = $2, active_multiplier = $3 WHERE id = $4 RETURNING *',
      [count, newBossDamageDealt, dmgResult.activeMultiplier, id]
    );

    // 4. Update user stats
    let userUpdateQuery = `
      UPDATE users 
      SET total_reps = GREATEST(0, total_reps + $1),
          reppy_coins = GREATEST(0, reppy_coins + $2),
          ${oldRewards.statToUpgrade} = GREATEST(0, ${oldRewards.statToUpgrade} + $1)
    `;
    if (isToday) {
      const dailyDamageChange = newBossDamageDealt - oldRep.boss_damage_dealt;
      userUpdateQuery += `, daily_boss_damage = GREATEST(0, daily_boss_damage + ${dailyDamageChange})`;
    }
    if (oldRewards.extraStatToUpgrade) {
      userUpdateQuery += `, ${oldRewards.extraStatToUpgrade} = GREATEST(0, ${oldRewards.extraStatToUpgrade} + $1)`;
    }
    userUpdateQuery += ` WHERE id = $3`;

    await query(userUpdateQuery, [diffCount, diffCoins, userId]);

    // Record the transaction (positive or negative)
    if (diffCoins !== 0) {
      await trackCoinTransaction(userId, diffCoins, 'EXERCISE', `Ajuste por edición de ${oldRep.exercise_type}`);
    }

    // Recalculate everything to stay in sync
    await recalculateUserStats(userId);

    // CLEANUP: If reps for this date reached 0, delete the daily summary
    const remainingRes = await query(
      'SELECT COUNT(*) FROM reps WHERE user_id = $1 AND date = $2',
      [userId, oldRep.date]
    );
    if (parseInt(remainingRes.rows[0].count) === 0) {
      await query('DELETE FROM daily_summaries WHERE user_id = $1 AND date = $2', [userId, oldRep.date]);
    }

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating reps:', error);
    res.status(500).json({ message: 'Error updating reps' });
  }
});

// Delete reps by ID
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // 1. Get old values for deduction
    const oldRes = await query(
      'SELECT count, exercise_type, boss_damage_dealt, date FROM reps WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (oldRes.rows.length === 0) {
      return res.status(404).json({ message: 'Rep not found' });
    }

    const oldRep = oldRes.rows[0];
    const rewards = getExerciseRewards(oldRep.exercise_type, oldRep.count);

    // 2. Restore Boss HP and adjust daily cap
    if (oldRep.boss_damage_dealt > 0) {
      const bossRes = await query(
        `SELECT id, current_hp, total_hp FROM boss_fights 
         WHERE status != 'defeated' 
         ORDER BY order_index ASC LIMIT 1`
      );

      if (bossRes.rows.length > 0) {
        const boss = bossRes.rows[0];
        const restoredHp = Math.min(boss.total_hp, boss.current_hp + oldRep.boss_damage_dealt);
        await query(`UPDATE boss_fights SET current_hp = $1 WHERE id = $2`, [restoredHp, boss.id]);

        // Adjust participant historic damage too? (Optional, but more consistent)
        await query(
          `UPDATE event_participants 
           SET damage_dealt = GREATEST(0, damage_dealt - $1) 
           WHERE boss_fight_id = $2 AND user_id = $3`,
          [oldRep.boss_damage_dealt, boss.id, userId]
        );
      }

      // Adjust daily cap if it was today
      const isToday = getLocalDateString(oldRep.date) === getLocalDateString();
      if (isToday) {
        await query(
          `UPDATE users SET daily_boss_damage = GREATEST(0, daily_boss_damage - $1) WHERE id = $2`,
          [oldRep.boss_damage_dealt, userId]
        );
      }
    }

    // 3. Delete from reps
    await query('DELETE FROM reps WHERE id = $1 AND user_id = $2', [id, userId]);

    // 4. Deduct from users stats
    let userUpdateQuery = `
      UPDATE users 
      SET total_reps = GREATEST(0, total_reps - $1),
          reppy_coins = GREATEST(0, reppy_coins - $2),
          ${rewards.statToUpgrade} = GREATEST(0, ${rewards.statToUpgrade} - $1)
    `;
    if (rewards.extraStatToUpgrade) {
      userUpdateQuery += `, ${rewards.extraStatToUpgrade} = GREATEST(0, ${rewards.extraStatToUpgrade} - $1)`;
    }
    userUpdateQuery += ` WHERE id = $3`;

    await query(userUpdateQuery, [oldRep.count, rewards.coins, userId]);

    // Record the transaction (negative)
    await trackCoinTransaction(userId, -rewards.coins, 'EXERCISE', `Eliminación de ${oldRep.count} ${oldRep.exercise_type}`);

    // Recalculate stats after deletion to ensure Level and XP drop correctly
    await recalculateUserStats(userId);

    // CLEANUP: If this was the last rep for this date, delete the daily summary
    const remainingRes = await query(
      'SELECT COUNT(*) FROM reps WHERE user_id = $1 AND date = $2',
      [userId, oldRep.date]
    );
    if (parseInt(remainingRes.rows[0].count) === 0) {
      await query('DELETE FROM daily_summaries WHERE user_id = $1 AND date = $2', [userId, oldRep.date]);
    }

    res.json({ message: 'Rep deleted successfully' });
  } catch (error) {
    console.error('Error deleting reps:', error);
    res.status(500).json({ message: 'Error deleting reps' });
  }
});


export default router;

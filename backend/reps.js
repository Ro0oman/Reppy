import express from 'express';
import pool, { query } from './db.js';
import { authenticate } from './middleware.js';
import { getExerciseRewards, getBossDamageMultiplier } from './utils/rewards.js';
import { recalculateUserStats, augmentUserWithLevels } from './utils/stats.js';

import { syncBossHealth } from './utils/boss.js';
import { getLocalDateString } from './utils/date.js';
import { calculateDamage } from './utils/damage.js';
import { getUserWithGear } from './utils/user.js';
import { updateMissionProgress } from './utils/missions.js';
import { broadcastDamage } from './socketManager.js';


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

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 0. Get user and calculate damage first
    const userResult = await client.query(`
      SELECT u.*,
             iHead.stats as head_stats, iWeapon.stats as weapon_stats,
             iArmor.stats as armor_stats, iBoots.stats as boots_stats
      FROM users u
      LEFT JOIN items iHead ON u.equipped_head_id = iHead.id
      LEFT JOIN items iWeapon ON u.equipped_weapon_id = iWeapon.id
      LEFT JOIN items iArmor ON u.equipped_armor_id = iArmor.id
      LEFT JOIN items iBoots ON u.equipped_boots_id = iBoots.id
      WHERE u.id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) throw new Error('User not found');
    const augmentedUser = augmentUserWithLevels(userResult.rows[0]);
    const dmgResult = calculateDamage(augmentedUser, count, exercise_type);

    // 1. Insert or update reps
    const repResult = await client.query(
      `INSERT INTO reps (user_id, count, date, exercise_type, added_weight, is_crit) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (user_id, date, exercise_type) 
       DO UPDATE SET count = reps.count + EXCLUDED.count,
                     added_weight = EXCLUDED.added_weight,
                     is_crit = EXCLUDED.is_crit
       RETURNING *`,
      [userId, count, date || getLocalDateString(), exercise_type, parseFloat(added_weight) || 0, dmgResult.isCrit]
    );

    // 2. Rewards (Coins only, XP handled by recalculateUserStats)
    const { coins: earnedCoins } = getExerciseRewards(exercise_type, count);
    await client.query(`UPDATE users SET reppy_coins = GREATEST(0, reppy_coins + $1) WHERE id = $2`, [earnedCoins, userId]);

    // 3. Boss Interaction
    const bossRes = await client.query(
      `SELECT id, current_hp, total_hp FROM boss_fights 
       WHERE status != 'defeated' 
       ORDER BY order_index ASC LIMIT 1`
    );

    let actualDamageDealt = 0;
    let bossId = null;

    if (bossRes.rows.length > 0) {
      const boss = bossRes.rows[0];
      bossId = boss.id;
      const bossDmgResult = calculateDamage(augmentedUser, count, exercise_type, boss);
      actualDamageDealt = bossDmgResult.totalDamage;
      
      // Atomic health deduction
      const updateBossRes = await client.query(
          `UPDATE boss_fights 
           SET current_hp = GREATEST(0, current_hp - $1),
               status = CASE WHEN current_hp - $1 <= 0 THEN 'defeated' ELSE status END
           WHERE id = $2 RETURNING current_hp`, 
          [actualDamageDealt, bossId]
      );
      
      const newHp = updateBossRes.rows[0].current_hp;

      await client.query(
        `INSERT INTO event_participants (boss_fight_id, user_id, damage_dealt) 
         VALUES ($1, $2, $3)
         ON CONFLICT (boss_fight_id, user_id) 
         DO UPDATE SET damage_dealt = event_participants.damage_dealt + EXCLUDED.damage_dealt`,
        [bossId, userId, actualDamageDealt]
      );

      await client.query(
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
        // Trigger boss scaling/sync if defeated
        // (Runs on pool because it might have its own internal queries)
        syncBossHealth().catch(e => console.error('Boss sync error:', e));

        // Mission: Boss Last Hit
        await updateMissionProgress(userId, 'boss_last_hit', 1);
      }
    }

    // Update metadata in reps record
    await client.query(
      `UPDATE reps 
       SET boss_damage_dealt = COALESCE(boss_damage_dealt, 0) + $1,
           active_multiplier = $2,
           base_damage = COALESCE(base_damage, 0) + $3,
           gear_bonus = COALESCE(gear_bonus, 0) + $4,
           buff_bonus = COALESCE(buff_bonus, 0) + $5,
           boss_fight_id = $6
       WHERE id = $7`, 
      [actualDamageDealt, dmgResult.activeMultiplier, dmgResult.baseDamage, dmgResult.gearBonus, dmgResult.buffBonus, bossId, repResult.rows[0].id]
    );

    // 4. Update Missions
    await updateMissionProgress(userId, 'reps', count);
    if (actualDamageDealt > 0) {
      await updateMissionProgress(userId, 'damage', actualDamageDealt);
    }

    // Mission: Night Owl (Reps after 22:00)
    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour < 5) {
      await updateMissionProgress(userId, 'night_owl', 1);
    }

    // Mission: Personal Record
    const prRes = await client.query(`
      SELECT 1 FROM (
        SELECT SUM(count) as day_total 
        FROM reps 
        WHERE user_id = $1 AND date = $2
      ) t
      WHERE t.day_total > COALESCE((
        SELECT MAX(day_sum) FROM (
          SELECT SUM(count) as day_sum 
          FROM reps 
          WHERE user_id = $1 AND date < $2
          GROUP BY date
        ) history
      ), 0)
    `, [userId, date || getLocalDateString()]);

    if (prRes.rows.length > 0) {
      await updateMissionProgress(userId, 'personal_record', 1);
    }

    await client.query('COMMIT');
    
    // Recalculate stats after commit (Aggregated Truth)
    await recalculateUserStats(userId);

    // Return the updated record with final totals
    const finalRecord = await query(
      'SELECT * FROM reps WHERE id = $1',
      [repResult.rows[0].id]
    );

    res.json({ 
      ...finalRecord.rows[0], 
      earnedCoins, 
      is_crit: dmgResult.isCrit
    });

    // Broadcast damage event for real-time visualization
    if (actualDamageDealt > 0) {
      broadcastDamage({
        userId: userId,
        userName: augmentedUser.name,
        amount: actualDamageDealt,
        exerciseType: exercise_type,
        isCrit: dmgResult.isCrit
      });
    }

  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Error adding reps:', error);
    res.status(500).json({ message: 'Error adding reps', error: error.message });
  } finally {
    client.release();
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

    // 6. Combat Power (Damage per Rep)
    const user = await getUserWithGear(userId);
    const dmgPerRep = calculateDamage(user, 1, isGlobal ? 'pullups' : type, null, false, true);

    res.json({
      totalReps,
      streak,
      topMonth,
      topMonthCount,
      dailyGoal: daily_goal,
      bodyWeight: body_weight,
      totalVolume,
      combatPower: {
        total: dmgPerRep.totalDamage,
        base: dmgPerRep.baseDamage,
        gear: dmgPerRep.gearBonus,
        buff: dmgPerRep.buffBonus,
        multiplier: dmgPerRep.activeMultiplier,
        critChance: dmgPerRep.critChance,
        critMultiplier: dmgPerRep.critMultiplier,
        minDamage: dmgPerRep.minDamage,
        maxDamage: dmgPerRep.maxDamage
      }
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

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get old values
    const oldRes = await client.query(
      'SELECT count, exercise_type, boss_damage_dealt, date, boss_fight_id FROM reps WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (oldRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Rep not found' });
    }

    const oldRep = oldRes.rows[0];
    const diffCount = count - oldRep.count;

    if (diffCount === 0) {
      await client.query('ROLLBACK');
      return res.json(oldRep);
    }

    // 2. Rewards difference
    const oldRewards = getExerciseRewards(oldRep.exercise_type, oldRep.count);
    const newRewards = getExerciseRewards(oldRep.exercise_type, count);
    const diffCoins = newRewards.coins - oldRewards.coins;

    // 3. User with gear & Damage
    const userResult = await client.query(`
      SELECT u.*,
             iHead.stats as head_stats, iWeapon.stats as weapon_stats,
             iArmor.stats as armor_stats, iBoots.stats as boots_stats
      FROM users u
      LEFT JOIN items iHead ON u.equipped_head_id = iHead.id
      LEFT JOIN items iWeapon ON u.equipped_weapon_id = iWeapon.id
      LEFT JOIN items iArmor ON u.equipped_armor_id = iArmor.id
      LEFT JOIN items iBoots ON u.equipped_boots_id = iBoots.id
      WHERE u.id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) throw new Error('User not found');
    const augmentedUser = augmentUserWithLevels(userResult.rows[0]);
    const dmgResult = calculateDamage(augmentedUser, count, oldRep.exercise_type);

    // 4. Boss Health Adjustment
    let newBossDamageDealt = 0;
    const isToday = getLocalDateString(oldRep.date) === getLocalDateString();

    const bossRes = await client.query(
      `SELECT id, current_hp, total_hp FROM boss_fights 
       WHERE id = $1 OR (status != 'defeated' AND $1 IS NULL)
       ORDER BY CASE WHEN id = $1 THEN 0 ELSE 1 END, order_index ASC LIMIT 1`,
      [oldRep.boss_fight_id]
    );

    if (bossRes.rows.length > 0) {
      const boss = bossRes.rows[0];
      const bossDmgResult = calculateDamage(augmentedUser, count, oldRep.exercise_type, boss);
      newBossDamageDealt = bossDmgResult.totalDamage;

      const bossHpChange = newBossDamageDealt - oldRep.boss_damage_dealt;
      
      const updateBossRes = await client.query(
          `UPDATE boss_fights 
           SET current_hp = GREATEST(0, LEAST(total_hp, current_hp - $1)),
               status = CASE 
                 WHEN current_hp - $1 <= 0 THEN 'defeated' 
                 WHEN current_hp - $1 > 0 AND status = 'defeated' THEN 'active'
                 ELSE status 
               END
           WHERE id = $2 RETURNING current_hp`, 
          [bossHpChange, boss.id]
      );

      await client.query(
        `UPDATE event_participants 
         SET damage_dealt = GREATEST(0, damage_dealt + $1) 
         WHERE boss_fight_id = $2 AND user_id = $3`,
        [bossHpChange, boss.id, userId]
      );
      
      if (updateBossRes.rows[0].current_hp === 0) {
          syncBossHealth().catch(e => console.error('Boss sync error:', e));
      }
    }

    // 5. Update reps table
    const updateResult = await client.query(
      `UPDATE reps 
       SET count = $1, boss_damage_dealt = $2, active_multiplier = $3,
           base_damage = $4, gear_bonus = $5, buff_bonus = $6, is_crit = $7
       WHERE id = $8 RETURNING *`,
      [count, newBossDamageDealt, dmgResult.activeMultiplier, dmgResult.baseDamage, dmgResult.gearBonus, dmgResult.buffBonus, dmgResult.isCrit, id]
    );

    // 6. Update user coins
    await client.query(`UPDATE users SET reppy_coins = GREATEST(0, reppy_coins + $1) WHERE id = $2`, [diffCoins, userId]);
    
    if (isToday) {
      const dailyDamageChange = newBossDamageDealt - oldRep.boss_damage_dealt;
      await client.query(`UPDATE users SET daily_boss_damage = GREATEST(0, daily_boss_damage + $1) WHERE id = $2`, [dailyDamageChange, userId]);
    }

    await client.query('COMMIT');

    // 7. Recalculate stats (Outside transaction)
    await recalculateUserStats(userId);

    // CLEANUP: If reps reached 0, delete summary
    const remainingRes = await query(
      'SELECT COUNT(*) FROM reps WHERE user_id = $1 AND date = $2',
      [userId, oldRep.date]
    );
    if (parseInt(remainingRes.rows[0].count) === 0) {
      await query('DELETE FROM daily_summaries WHERE user_id = $1 AND date = $2', [userId, oldRep.date]);
    }

    res.json(updateResult.rows[0]);
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Error updating reps:', error);
    res.status(500).json({ message: 'Error updating reps', error: error.message });
  } finally {
    client.release();
  }
});

// Delete reps by ID
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get old values for deduction
    const oldRes = await client.query(
      'SELECT count, exercise_type, boss_damage_dealt, date, boss_fight_id FROM reps WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (oldRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Rep not found' });
    }

    const oldRep = oldRes.rows[0];
    const rewards = getExerciseRewards(oldRep.exercise_type, oldRep.count);

    // 2. Restore Boss HP and adjust daily tracker
    if (oldRep.boss_damage_dealt > 0) {
      const bossRes = await client.query(
        `SELECT id, current_hp, total_hp, status FROM boss_fights 
         WHERE id = $1 OR (status != 'defeated' AND $1 IS NULL)
         ORDER BY CASE WHEN id = $1 THEN 0 ELSE 1 END, order_index ASC LIMIT 1`,
        [oldRep.boss_fight_id]
      );

      if (bossRes.rows.length > 0) {
        const boss = bossRes.rows[0];
        
        // Atomic restoration
        await client.query(
            `UPDATE boss_fights 
             SET current_hp = LEAST(total_hp, current_hp + $1),
                 status = CASE WHEN current_hp + $1 > 0 AND status = 'defeated' THEN 'active' ELSE status END
             WHERE id = $2`, 
            [oldRep.boss_damage_dealt, boss.id]
        );

        await client.query(
          `UPDATE event_participants 
           SET damage_dealt = GREATEST(0, damage_dealt - $1) 
           WHERE boss_fight_id = $2 AND user_id = $3`,
          [oldRep.boss_damage_dealt, boss.id, userId]
        );
      }

      // Adjust daily tracker
      const isToday = getLocalDateString(oldRep.date) === getLocalDateString();
      if (isToday) {
        await client.query(
          `UPDATE users SET daily_boss_damage = GREATEST(0, daily_boss_damage - $1) WHERE id = $2`,
          [oldRep.boss_damage_dealt, userId]
        );
      }
    }

    // 3. Delete from reps
    await client.query('DELETE FROM reps WHERE id = $1 AND user_id = $2', [id, userId]);

    // 4. Deduct coins (reps/xp handled by recalculateUserStats)
    await client.query(`UPDATE users SET reppy_coins = GREATEST(0, reppy_coins - $1) WHERE id = $2`, [rewards.coins, userId]);

    await client.query('COMMIT');

    // 5. Recalculate stats
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
    if (client) await client.query('ROLLBACK');
    console.error('Error deleting reps:', error);
    res.status(500).json({ message: 'Error deleting reps', error: error.message });
  } finally {
    client.release();
  }
});


export default router;

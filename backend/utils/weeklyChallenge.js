import { query, withTransaction } from '../db.js';
import { getLocalDateString } from './date.js';

// "Reto vs tu semana pasada": the goal is the reps you logged the PREVIOUS
// (full) week; match or beat it this week and claim one Cofre de Batalla
// (level_chests). Resets every Monday. Reuses the same reps-summing rule as the
// weekly leaderboard (timed exercises, unit='seconds', do NOT count as reps).

const REWARD_LEVEL_CHESTS = 1;

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

// Monday 00:00 of the week containing `date` (weeks start Monday, like streak.js).
const getMonday = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day; // Sunday(0) -> back to previous Monday
  d.setDate(d.getDate() + mondayOffset);
  return d;
};

// Idempotent column bootstrap. Runs on its own pooled connection (autocommit),
// never inside a locked transaction, so it can't deadlock against a FOR UPDATE.
let columnEnsured = false;
const ensureColumn = async () => {
  if (columnEnsured) return;
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_weekly_reto_week TEXT').catch(() => {});
  columnEnsured = true;
};

// Sum of reps in [from, to) — `to` optional (open-ended = up to now).
const sumRepsBetween = async (userId, fromStr, toStr = null) => {
  const params = toStr ? [userId, fromStr, toStr] : [userId, fromStr];
  const cond = toStr ? 'r.date >= $2 AND r.date < $3' : 'r.date >= $2';
  const res = await query(
    `SELECT COALESCE(SUM(CASE WHEN COALESCE(e.unit, 'reps') = 'seconds' THEN 0 ELSE r.count END), 0)::int AS reps
     FROM reps r
     LEFT JOIN exercises e ON e.slug = r.exercise_type
     WHERE r.user_id = $1 AND ${cond}`,
    params
  );
  return parseInt(res.rows[0]?.reps || 0);
};

/**
 * Read-only status of this week's challenge for a user.
 * @returns {{goal, progress, met, eligible, alreadyClaimed, canClaim, rewardChests, weekKey, lastWeekReps, thisWeekReps}}
 */
export const getWeeklyChallengeStatus = async (userId) => {
  await ensureColumn();

  const thisMonday = getMonday();
  const lastMonday = addDays(thisMonday, -7);
  const thisMondayStr = getLocalDateString(thisMonday);
  const lastMondayStr = getLocalDateString(lastMonday);
  const weekKey = thisMondayStr; // one claim per (Monday-anchored) week

  const [thisWeekReps, lastWeekReps, userRes] = await Promise.all([
    sumRepsBetween(userId, thisMondayStr),                 // this week so far
    sumRepsBetween(userId, lastMondayStr, thisMondayStr),  // full previous week
    query('SELECT last_weekly_reto_week FROM users WHERE id = $1', [userId]),
  ]);

  const goal = lastWeekReps;
  const progress = thisWeekReps;
  // eligible only if there IS a goal — a 0-rep previous week must not hand out a
  // free chest for doing nothing.
  const eligible = goal > 0;
  const met = eligible && progress >= goal;
  const alreadyClaimed = (userRes.rows[0]?.last_weekly_reto_week || null) === weekKey;
  const canClaim = met && !alreadyClaimed;

  return {
    goal,
    progress,
    lastWeekReps,
    thisWeekReps,
    met,
    eligible,
    alreadyClaimed,
    canClaim,
    rewardChests: REWARD_LEVEL_CHESTS,
    weekKey,
  };
};

/**
 * Claim this week's reward (once per week) if the goal is met. Grants
 * REWARD_LEVEL_CHESTS Cofre(s) de Batalla atomically. The guarded UPDATE (only
 * flips last_weekly_reto_week when it isn't already this week) makes concurrent
 * claims race-safe: the loser matches 0 rows and gets nothing.
 */
export const claimWeeklyChallenge = async (userId) => {
  await ensureColumn();
  const status = await getWeeklyChallengeStatus(userId);
  if (!status.eligible) {
    const err = new Error('No hay reto esta semana: no registraste reps la semana pasada.');
    err.status = 400;
    throw err;
  }
  if (!status.met) {
    const err = new Error('Aún no has igualado tus reps de la semana pasada.');
    err.status = 400;
    throw err;
  }

  return withTransaction(async (client) => {
    const claimRes = await client.query(
      `UPDATE users
       SET last_weekly_reto_week = $2,
           level_chests = COALESCE(level_chests, 0) + $3
       WHERE id = $1 AND last_weekly_reto_week IS DISTINCT FROM $2
       RETURNING level_chests`,
      [userId, status.weekKey, REWARD_LEVEL_CHESTS]
    );
    if (claimRes.rowCount === 0) {
      const err = new Error('Ya reclamaste el reto de esta semana.');
      err.status = 400;
      throw err;
    }
    return {
      granted: true,
      rewardChests: REWARD_LEVEL_CHESTS,
      level_chests: claimRes.rows[0].level_chests,
    };
  });
};

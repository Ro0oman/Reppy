import pool, { query as defaultQuery } from '../db.js';
import { getLocalDateString } from './date.js';

export const STREAK_FREEZE_COST = 250;
export const STREAK_FREEZE_WEEKLY_LIMIT = 1;
export const STREAK_RISK_HOUR_THRESHOLD = 6;
export const JACKPOT_DAYS_REQUIRED = 5;   // days/7 needed to trigger jackpot
export const JACKPOT_REWARD_COINS = 75;   // RC bonus

export const ensureStreakFreezeTable = async (q = defaultQuery) => {
  await q(`
    CREATE TABLE IF NOT EXISTS streak_freezes (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
      freeze_date DATE NOT NULL,
      spent_coins INTEGER NOT NULL DEFAULT ${STREAK_FREEZE_COST},
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, freeze_date)
    )
  `);
  await q('CREATE INDEX IF NOT EXISTS idx_streak_freezes_user_date ON streak_freezes(user_id, freeze_date)');
};

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return d;
};

const getHoursLeftToday = () => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 3600000));
};

const countCurrentStreak = (activeDates) => {
  const today = getLocalDateString();
  const yesterday = getLocalDateString(addDays(new Date(), -1));
  const start = activeDates.has(today) ? today : (activeDates.has(yesterday) ? yesterday : null);

  if (!start) return 0;

  let streak = 0;
  let cursor = new Date(`${start}T00:00:00`);
  while (activeDates.has(getLocalDateString(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
};

export const getStreakStatus = async (userId, q = defaultQuery) => {
  await ensureStreakFreezeTable(q);
  // Ensure jackpot tracking column exists (idempotent)
  await defaultQuery('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_jackpot_week TEXT').catch(() => {});

  const today = getLocalDateString();
  const yesterday = getLocalDateString(addDays(new Date(), -1));
  const weekStart = getLocalDateString(getStartOfWeek());

  const [activityRes, freezeRes, weekFreezeRes, userRes, weeklyProgressRes] = await Promise.all([
    q('SELECT DISTINCT date FROM reps WHERE user_id = $1 AND count > 0', [userId]),
    q('SELECT freeze_date FROM streak_freezes WHERE user_id = $1', [userId]),
    q('SELECT COUNT(*)::int AS count FROM streak_freezes WHERE user_id = $1 AND freeze_date >= $2', [userId, weekStart]),
    q('SELECT reppy_coins, last_jackpot_week FROM users WHERE id = $1', [userId]),
    // Count unique active days this week (reps OR freezes)
    q(`SELECT COUNT(DISTINCT active_date)::int AS count FROM (
         SELECT date::text AS active_date FROM reps
           WHERE user_id = $1 AND date >= $2 AND date <= CURRENT_DATE AND count > 0
         UNION
         SELECT freeze_date::text AS active_date FROM streak_freezes
           WHERE user_id = $1 AND freeze_date >= $2 AND freeze_date <= CURRENT_DATE
       ) t`, [userId, weekStart])
  ]);

  const trainedDates = new Set(activityRes.rows.map(row => getLocalDateString(row.date)));
  const frozenDates = new Set(freezeRes.rows.map(row => getLocalDateString(row.freeze_date)));
  const activeDates = new Set([...trainedDates, ...frozenDates]);

  const trainedToday = trainedDates.has(today);
  const frozenToday = frozenDates.has(today);
  const activeToday = trainedToday || frozenToday;
  const streak = countCurrentStreak(activeDates);
  const hoursLeftToday = getHoursLeftToday();
  const freezesThisWeek = Number(weekFreezeRes.rows[0]?.count || 0);
  const coins = Number(userRes.rows[0]?.reppy_coins || 0);
  const isAtRisk = !activeToday && activeDates.has(yesterday);

  const weeklyProgress = Number(weeklyProgressRes.rows[0]?.count || 0);
  // ISO week string e.g. "2026-W22"
  const currentISOWeek = (() => {
    const d = new Date();
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
  })();
  const lastJackpotWeek = userRes.rows[0]?.last_jackpot_week || null;
  const jackpotAlreadyAwarded = lastJackpotWeek === currentISOWeek;
  const jackpotEligible = weeklyProgress >= JACKPOT_DAYS_REQUIRED && !jackpotAlreadyAwarded;

  return {
    streak,
    trainedToday,
    frozenToday,
    activeToday,
    isAtRisk,
    showRisk: isAtRisk && hoursLeftToday <= STREAK_RISK_HOUR_THRESHOLD,
    hoursLeftToday,
    freezeCost: STREAK_FREEZE_COST,
    freezesThisWeek,
    weeklyFreezeLimit: STREAK_FREEZE_WEEKLY_LIMIT,
    canFreeze: isAtRisk && freezesThisWeek < STREAK_FREEZE_WEEKLY_LIMIT && coins >= STREAK_FREEZE_COST,
    coins,
    weeklyProgress,
    jackpotDaysRequired: JACKPOT_DAYS_REQUIRED,
    jackpotEligible,
    jackpotAlreadyAwarded,
    jackpotReward: JACKPOT_REWARD_COINS,
  };
};

export const freezeStreakForToday = async (userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const q = (text, params) => client.query(text, params);
    await ensureStreakFreezeTable(q);

    const userRes = await client.query('SELECT reppy_coins FROM users WHERE id = $1 FOR UPDATE', [userId]);
    if (userRes.rowCount === 0) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const status = await getStreakStatus(userId, q);
    if (!status.isAtRisk) {
      const error = new Error('Tu racha no esta en riesgo ahora mismo.');
      error.status = 400;
      throw error;
    }
    if (status.freezesThisWeek >= STREAK_FREEZE_WEEKLY_LIMIT) {
      const error = new Error('Ya has usado tu congelacion semanal.');
      error.status = 400;
      throw error;
    }
    if (Number(userRes.rows[0].reppy_coins || 0) < STREAK_FREEZE_COST) {
      const error = new Error('No tienes monedas suficientes para congelar la racha.');
      error.status = 400;
      throw error;
    }

    await client.query(
      'INSERT INTO streak_freezes (user_id, freeze_date, spent_coins) VALUES ($1, CURRENT_DATE, $2)',
      [userId, STREAK_FREEZE_COST]
    );
    await client.query(
      'UPDATE users SET reppy_coins = GREATEST(0, COALESCE(reppy_coins, 0) - $1) WHERE id = $2',
      [STREAK_FREEZE_COST, userId]
    );

    await client.query('COMMIT');
    return getStreakStatus(userId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

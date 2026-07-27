import { query as defaultQuery, withTransaction } from '../db.js';
import { getLocalDateString } from './date.js';

export const STREAK_FREEZE_COST = 250;
export const STREAK_FREEZE_WEEKLY_LIMIT = 1;
// "Día de descanso activo": 1 free streak-preserving rest per week, tracked
// apart from the paid freeze so it never consumes the 250-coin freeze allowance.
export const REST_DAY_WEEKLY_LIMIT = 1;
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
  // Distinguishes the free weekly rest day from the paid 250-coin freeze.
  await q('ALTER TABLE streak_freezes ADD COLUMN IF NOT EXISTS is_rest_day BOOLEAN DEFAULT FALSE');
};

// Full streak schema bootstrap: the streak_freezes table + the users columns
// getStreakStatus reads. Runs ONCE at module load (import = app startup) on a
// normal pooled connection — NEVER inside a caller's transaction. This is what
// lets the hot paths below stop running DDL per request, and avoids the
// deadlock that DDL-inside-a-FOR-UPDATE-txn caused (an `ALTER TABLE users …
// IF NOT EXISTS` takes ACCESS EXCLUSIVE even as a no-op; run on a separate
// connection while a txn held a FOR UPDATE row lock on users, it blocked
// forever and PG's deadlock detector never saw it — the txn sat idle-in-
// transaction). Idempotent; schema.sql covers fresh DBs.
export const ensureStreakSchema = async (q = defaultQuery) => {
  await ensureStreakFreezeTable(q);
  await q('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_jackpot_week TEXT');
};

// Fired at import; the hot paths `await` it (instant once resolved).
const schemaReady = ensureStreakSchema().catch((err) => {
  console.error('[streak] schema bootstrap failed:', err);
});

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

// Clave anti-duplicado del jackpot 5/7: el LUNES de la semana en curso, la misma
// frontera que usa `weekStart` para contar el progreso semanal. La fórmula casera
// de nº de semana que había antes cortaba en sábado, así que el jackpot se pagaba
// dos veces (vie + sáb/dom) y luego quedaba bloqueado de lunes a viernes.
export const getJackpotWeekKey = (date = new Date()) => getLocalDateString(getStartOfWeek(date));

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
  // Schema is bootstrapped once at import (see schemaReady) — no DDL on the hot
  // path, so this is safe to call from anywhere, including inside a transaction.
  await schemaReady;

  const today = getLocalDateString();
  const yesterday = getLocalDateString(addDays(new Date(), -1));
  const weekStart = getLocalDateString(getStartOfWeek());

  const [activityRes, freezeRes, weekFreezeRes, restWeekRes, userRes, weeklyProgressRes] = await Promise.all([
    q('SELECT DISTINCT date FROM reps WHERE user_id = $1 AND count > 0', [userId]),
    q('SELECT freeze_date FROM streak_freezes WHERE user_id = $1', [userId]),
    // Paid freezes only — rest days must NOT consume the paid-freeze weekly allowance.
    q('SELECT COUNT(*)::int AS count FROM streak_freezes WHERE user_id = $1 AND freeze_date >= $2 AND is_rest_day = FALSE', [userId, weekStart]),
    // Free rest days used this week (separate weekly limit).
    q('SELECT COUNT(*)::int AS count FROM streak_freezes WHERE user_id = $1 AND freeze_date >= $2 AND is_rest_day = TRUE', [userId, weekStart]),
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
  const restDaysThisWeek = Number(restWeekRes.rows[0]?.count || 0);
  const coins = Number(userRes.rows[0]?.reppy_coins || 0);
  const isAtRisk = !activeToday && activeDates.has(yesterday);

  const weeklyProgress = Number(weeklyProgressRes.rows[0]?.count || 0);
  const lastJackpotWeek = userRes.rows[0]?.last_jackpot_week || null;
  const jackpotAlreadyAwarded = lastJackpotWeek === getJackpotWeekKey();
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
    // Free weekly rest day: preserves the streak at no coin cost, 1×/week.
    restDaysThisWeek,
    restDayWeeklyLimit: REST_DAY_WEEKLY_LIMIT,
    canUseRestDay: isAtRisk && restDaysThisWeek < REST_DAY_WEEKLY_LIMIT,
    coins,
    weeklyProgress,
    jackpotDaysRequired: JACKPOT_DAYS_REQUIRED,
    jackpotEligible,
    jackpotAlreadyAwarded,
    jackpotReward: JACKPOT_REWARD_COINS,
  };
};

export const freezeStreakForToday = async (userId) => {
  await schemaReady;

  // Eligibility read OUTSIDE any transaction. getStreakStatus no longer runs
  // DDL, but keeping it off the locked path is what kills the old deadlock
  // (freeze used to hold FOR UPDATE on users while getStreakStatus ran an
  // ALTER on a second connection → indefinite block).
  const status = await getStreakStatus(userId);
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
  if (status.coins < STREAK_FREEZE_COST) {
    const error = new Error('No tienes monedas suficientes para congelar la racha.');
    error.status = 400;
    throw error;
  }

  await withTransaction(async (client) => {
    // Insert first, guarded by UNIQUE(user_id, freeze_date): if today already
    // has a freeze/rest row, nothing is inserted and we bail WITHOUT charging.
    const ins = await client.query(
      `INSERT INTO streak_freezes (user_id, freeze_date, spent_coins, is_rest_day)
       VALUES ($1, CURRENT_DATE, $2, FALSE)
       ON CONFLICT (user_id, freeze_date) DO NOTHING`,
      [userId, STREAK_FREEZE_COST]
    );
    if (ins.rowCount === 0) {
      const error = new Error('Tu racha ya esta protegida hoy.');
      error.status = 400;
      throw error;
    }
    // Atomic coin gate: only charge if the balance still covers it. If not, the
    // whole transaction (including the insert above) rolls back — no free freeze.
    const upd = await client.query(
      `UPDATE users SET reppy_coins = reppy_coins - $1
       WHERE id = $2 AND COALESCE(reppy_coins, 0) >= $1
       RETURNING reppy_coins`,
      [STREAK_FREEZE_COST, userId]
    );
    if (upd.rowCount === 0) {
      const error = new Error('No tienes monedas suficientes para congelar la racha.');
      error.status = 400;
      throw error;
    }
  });

  return getStreakStatus(userId);
};

/**
 * "Día de descanso activo": preserve today's streak for free, once per week.
 * Costs no coins and draws from a separate weekly allowance
 * (REST_DAY_WEEKLY_LIMIT), so it never touches the paid-freeze economy. Only
 * usable when the streak is actually at risk (didn't train today).
 *
 * Unlike freezeStreakForToday there is no coin deduction, so no multi-statement
 * transaction is needed: the single guarded INSERT is atomic on its own and the
 * UNIQUE(user_id, freeze_date) constraint makes concurrent same-day requests
 * race-safe (the loser hits ON CONFLICT and gets rowCount 0). This deliberately
 * avoids opening a FOR UPDATE transaction around getStreakStatus, which would
 * dead-lock: getStreakStatus issues an `ALTER TABLE users ... IF NOT EXISTS` on
 * a separate pooled connection, and that ALTER takes ACCESS EXCLUSIVE even as a
 * no-op — conflicting with a held FOR UPDATE row lock.
 */
export const useRestDayForToday = async (userId) => {
  // Read-only status check, outside any transaction.
  const status = await getStreakStatus(userId);
  if (!status.isAtRisk) {
    const error = new Error('Tu racha no está en riesgo ahora mismo.');
    error.status = 400;
    throw error;
  }
  if (status.restDaysThisWeek >= REST_DAY_WEEKLY_LIMIT) {
    const error = new Error('Ya has usado tu día de descanso de esta semana.');
    error.status = 400;
    throw error;
  }

  // Free rest day: spent_coins = 0, is_rest_day = TRUE. The UNIQUE constraint on
  // (user_id, freeze_date) means a concurrent duplicate (or an already-protected
  // day) hits ON CONFLICT and returns 0 rows.
  const insertRes = await defaultQuery(
    `INSERT INTO streak_freezes (user_id, freeze_date, spent_coins, is_rest_day)
     VALUES ($1, CURRENT_DATE, 0, TRUE)
     ON CONFLICT (user_id, freeze_date) DO NOTHING`,
    [userId]
  );
  if (insertRes.rowCount === 0) {
    const error = new Error('Tu racha ya está protegida hoy.');
    error.status = 400;
    throw error;
  }

  return getStreakStatus(userId);
};

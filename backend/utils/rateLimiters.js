import rateLimit from 'express-rate-limit';

// Rate limiters for abuse-prone endpoints. Behind Coolify/Traefik the app sets
// `trust proxy` so the real client IP (X-Forwarded-For) is used as the key.

// Brute-force guard on manual login. Keyed by IP. Only failed attempts count
// (skipSuccessfulRequests) so a legit user hammering the button after a correct
// login is never locked out.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'ERR_RATE_LIMIT', message: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo en unos minutos.' },
});

// Account creation guard on manual signup. Keyed by IP. Counts EVERY attempt
// (skipSuccessfulRequests would defeat the purpose: a mass-signup spammer's
// requests all "succeed"). `/signup` runs bcrypt on each call and inserts a new
// user row → both a CPU-DoS vector and a mass-account-creation vector.
export const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'ERR_RATE_LIMIT', message: 'Demasiados registros desde esta red. Inténtalo de nuevo en unos minutos.' },
});

// Google OAuth (login + first-time signup). Legit users hit this on every login,
// so only FAILED verifications count (skipSuccessfulRequests) — that's the abuse
// signal (invalid-token floods) without locking out real logins behind a shared
// IP / NAT. Keyed by IP.
export const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 30,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'ERR_RATE_LIMIT', message: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.' },
});

// Spam guard on rep logging. Keyed by authenticated user id (this limiter is
// mounted AFTER `authenticate`, so req.user is always present), falling back to
// IP defensively. Reps are once-per-day-per-exercise anyway, so a low ceiling
// per minute is plenty of headroom for legit editing while blocking floods.
export const repsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { code: 'ERR_RATE_LIMIT', message: 'Demasiadas peticiones. Espera un momento.' },
});

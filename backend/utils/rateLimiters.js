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

// Soft guard on economy-mutating endpoints (roulette spins, shop buys, daily
// refresh). These already have economic guards (cooldowns, balance checks with
// FOR UPDATE), so this is DB-load protection, not correctness: a legit user
// never spins/buys dozens of times per minute, but a script could hammer them.
// Keyed by authenticated user id (mounted AFTER `authenticate`), IP fallback.
export const economyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { code: 'ERR_RATE_LIMIT', message: 'Demasiadas peticiones. Espera un momento.' },
});

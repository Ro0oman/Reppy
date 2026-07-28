import jwt from 'jsonwebtoken';
import { query } from './db.js';

/**
 * Resuelve el estado ACTUAL del usuario del token contra la BD.
 *
 * Los tokens duran 30 días y no había forma de revocarlos: quitarle admin a
 * alguien no surtía efecto hasta que caducase su token, porque `is_admin` se leía
 * del claim firmado. Esta única lectura por PK arregla las dos cosas a la vez:
 *
 *  - `token_version`: subirla en `users` invalida TODOS los tokens de ese usuario
 *    (logout global, ban, cambio de rol) sin flujo de refresh ni tocar el frontend.
 *  - `is_admin` sale de la BD, no del claim, así que un cambio de rol es inmediato.
 *
 * @returns {Promise<{ok: true, user: object} | {ok: false, status: number, message: string}>}
 */
async function resolveTokenUser(decoded) {
  let row;
  try {
    const res = await query('SELECT id, is_admin, token_version FROM users WHERE id = $1', [decoded.id]);
    row = res.rows[0];
  } catch (err) {
    // Fallar cerrado: sin poder comprobar la revocación no se concede acceso.
    console.error('[auth] No se pudo verificar el token contra la BD:', err.message);
    return { ok: false, status: 503, message: 'Auth temporarily unavailable.' };
  }

  // Usuario borrado: su token no debe seguir valiendo.
  if (!row) return { ok: false, status: 401, message: 'Invalid token.' };

  // Un token emitido antes del último bump queda invalidado. Los tokens ya en
  // circulación (anteriores a esta columna) no llevan `tv`; cuentan como versión 0,
  // que es el default de la columna, así que NO se invalida a nadie al desplegar.
  const tokenVersion = Number(decoded.tv) || 0;
  if (tokenVersion !== (Number(row.token_version) || 0)) {
    return { ok: false, status: 401, message: 'Session expired. Please log in again.' };
  }

  return { ok: true, user: { ...decoded, id: row.id, is_admin: row.is_admin === true } };
}

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }

  const resolved = await resolveTokenUser(decoded);
  if (!resolved.ok) return res.status(resolved.status).json({ message: resolved.message });

  req.user = resolved.user;
  next();
};

export const isAdmin = (req, res, next) => {
  // `req.user.is_admin` viene de la BD (ver resolveTokenUser), no del claim firmado,
  // así que quitarle admin a alguien surte efecto en su siguiente petición.
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

export const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(); // token inválido → se sigue como anónimo
  }

  const resolved = await resolveTokenUser(decoded);
  // Token revocado o BD caída: se sigue como anónimo en vez de romper una ruta
  // que de todas formas funciona sin sesión.
  if (resolved.ok) req.user = resolved.user;
  next();
};

import { query } from '../db.js';

/**
 * Generates a unique URL-safe username from a display name.
 * Format: lowercase-slug + numeric suffix if taken.
 * Example: "Roman García" → "roman-garcia" → "roman-garcia-42" if taken.
 */
export async function generateUsername(displayName) {
  const base = displayName
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30) || 'atleta';

  // Check if base is available
  const check = await query('SELECT username FROM users WHERE username = $1', [base]);
  if (check.rows.length === 0) return base;

  // Try base + random suffix
  for (let i = 0; i < 20; i++) {
    const suffix = Math.floor(10 + Math.random() * 990);
    const candidate = `${base}-${suffix}`.slice(0, 35);
    const c = await query('SELECT username FROM users WHERE username = $1', [candidate]);
    if (c.rows.length === 0) return candidate;
  }

  // Fallback: base + timestamp
  return `${base}-${Date.now()}`.slice(0, 35);
}

/**
 * Ensures a user has a username. Assigns one if missing.
 */
export async function ensureUsername(userId, displayName) {
  const res = await query('SELECT username FROM users WHERE id = $1', [userId]);
  if (res.rows[0]?.username) return res.rows[0].username;
  const username = await generateUsername(displayName);
  await query('UPDATE users SET username = $1 WHERE id = $2', [username, userId]);
  return username;
}

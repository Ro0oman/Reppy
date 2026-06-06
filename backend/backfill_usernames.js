import { query } from './db.js';

/**
 * One-time backfill: ensure the `username` column exists and assign a unique
 * URL-safe username to every user that doesn't have one yet.
 *
 * Mirrors the slug logic in utils/username.js (lowercase-slug + numeric suffix
 * on collision) but resolves collisions in-memory for efficiency on bulk runs.
 *
 * Idempotent: re-running only fills users still missing a username.
 *   node backfill_usernames.js
 */

const slugify = (displayName) =>
  (displayName || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30) || 'atleta';

async function backfill() {
  console.log('--- USERNAME BACKFILL ---');

  // 1. Ensure column + unique index exist (idempotent, matches index.js migration)
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50)');
  await query('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL');

  // 2. Load every taken username into a set for in-memory collision checks
  const takenRes = await query('SELECT username FROM users WHERE username IS NOT NULL');
  const taken = new Set(takenRes.rows.map(r => r.username));

  // 3. Users still missing a username
  const usersRes = await query('SELECT id, name FROM users WHERE username IS NULL ORDER BY total_reps DESC NULLS LAST');
  const users = usersRes.rows;
  console.log(`${taken.size} usernames already assigned. ${users.length} users to backfill.`);

  let assigned = 0;
  for (const user of users) {
    const base = slugify(user.name);
    let candidate = base;
    while (taken.has(candidate)) {
      const suffix = Math.floor(10 + Math.random() * 990);
      candidate = `${base}-${suffix}`.slice(0, 35);
    }
    taken.add(candidate);
    await query('UPDATE users SET username = $1 WHERE id = $2', [candidate, user.id]);
    assigned++;
    if (assigned % 50 === 0) console.log(`  ...${assigned}/${users.length}`);
  }

  console.log(`✅ Backfilled ${assigned} usernames.`);
  process.exit(0);
}

backfill().catch((e) => {
  console.error('❌ Backfill failed:', e);
  process.exit(1);
});

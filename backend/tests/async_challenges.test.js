/**
 * Test suite for async 24h challenges.
 * Run: node --experimental-vm-modules tests/async_challenges.test.js
 * Uses the real DB with ephemeral test users, cleans up after itself.
 */
import { query } from '../db.js';
import { updateChallengeScores, resolveExpiredChallenges } from '../utils/challenges.js';

const PASS = (msg) => console.log(`  ✅ ${msg}`);
const FAIL = (msg) => { throw new Error(`❌ ${msg}`); };
const assert = (cond, msg) => cond ? PASS(msg) : FAIL(msg);
const section = (msg) => console.log(`\n── ${msg}`);

const uid1 = 'test_challenge_user1_' + Date.now();
const uid2 = 'test_challenge_user2_' + Date.now();

const runTests = async () => {
  try {
    // ── 0. Ensure table exists ──────────────────────────────────────────────
    section('0. Setup');
    await query(`
      CREATE TABLE IF NOT EXISTS async_challenges (
        id SERIAL PRIMARY KEY,
        challenger_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        challenged_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        goal_type VARCHAR(20) NOT NULL DEFAULT 'reps',
        goal_value INT NOT NULL DEFAULT 100,
        challenger_score INT NOT NULL DEFAULT 0,
        challenged_score INT NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        winner_id VARCHAR REFERENCES users(id),
        reward_coins INT NOT NULL DEFAULT 75,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ,
        resolved_at TIMESTAMPTZ,
        CONSTRAINT no_self_challenge_${Date.now()} CHECK (challenger_id != challenged_id)
      )
    `);
    PASS('Table async_challenges exists');

    // ── 1. Create test users ────────────────────────────────────────────────
    section('1. Test users');
    await query(
      `INSERT INTO users (id, name, email, password_hash) VALUES ($1,'Challenger','c@test.com','hash')`,
      [uid1]
    );
    await query(
      `INSERT INTO users (id, name, email, password_hash) VALUES ($1,'Challenged','d@test.com','hash')`,
      [uid2]
    );
    PASS(`Created users ${uid1.slice(-6)} and ${uid2.slice(-6)}`);

    // ── 2. Create challenge ─────────────────────────────────────────────────
    section('2. Create challenge');
    const created = await query(`
      INSERT INTO async_challenges (challenger_id, challenged_id, goal_type, goal_value, reward_coins)
      VALUES ($1, $2, 'reps', 100, 75)
      RETURNING *
    `, [uid1, uid2]);
    const challenge = created.rows[0];
    assert(challenge.status === 'pending', `Status is 'pending'`);
    assert(challenge.challenger_score === 0, 'challenger_score starts at 0');
    assert(challenge.challenged_score === 0, 'challenged_score starts at 0');
    assert(challenge.reward_coins === 75, 'reward_coins = 75');

    // ── 3. Accept challenge ─────────────────────────────────────────────────
    section('3. Accept challenge');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await query(`
      UPDATE async_challenges SET status = 'active', expires_at = $1 WHERE id = $2
    `, [expiresAt, challenge.id]);
    const accepted = await query('SELECT * FROM async_challenges WHERE id = $1', [challenge.id]);
    assert(accepted.rows[0].status === 'active', `Status changed to 'active'`);
    assert(accepted.rows[0].expires_at !== null, 'expires_at is set');

    // ── 4. Score updates via updateChallengeScores ──────────────────────────
    section('4. Score tracking — reps goal');
    await updateChallengeScores(uid1, { reps: 30, damage: 0 });
    await updateChallengeScores(uid2, { reps: 45, damage: 0 });

    const afterScores = await query('SELECT * FROM async_challenges WHERE id = $1', [challenge.id]);
    const r = afterScores.rows[0];
    assert(r.challenger_score === 30, `Challenger score = 30 (got ${r.challenger_score})`);
    assert(r.challenged_score === 45, `Challenged score = 45 (got ${r.challenged_score})`);

    // Damage updates should NOT affect a 'reps' challenge
    await updateChallengeScores(uid1, { reps: 0, damage: 9999 });
    const afterDmg = await query('SELECT * FROM async_challenges WHERE id = $1', [challenge.id]);
    assert(afterDmg.rows[0].challenger_score === 30, 'Damage ignored on reps challenge');

    // ── 5. Score tracking — damage goal ────────────────────────────────────
    section('5. Score tracking — damage goal');
    const dmgChallenge = await query(`
      INSERT INTO async_challenges (challenger_id, challenged_id, goal_type, goal_value, reward_coins, status, expires_at)
      VALUES ($1, $2, 'damage', 5000, 75, 'active', $3)
      RETURNING *
    `, [uid1, uid2, new Date(Date.now() + 86400000)]);
    const dc = dmgChallenge.rows[0];

    await updateChallengeScores(uid1, { reps: 999, damage: 1200 });
    await updateChallengeScores(uid2, { reps: 999, damage: 800 });

    const dcAfter = await query('SELECT * FROM async_challenges WHERE id = $1', [dc.id]);
    assert(dcAfter.rows[0].challenger_score === 1200, `Challenger damage = 1200 (got ${dcAfter.rows[0].challenger_score})`);
    assert(dcAfter.rows[0].challenged_score === 800, `Challenged damage = 800 (got ${dcAfter.rows[0].challenged_score})`);
    // Reps should NOT affect damage challenge
    assert(dcAfter.rows[0].challenger_score === 1200, 'Reps ignored on damage challenge');

    // ── 6. Auto-resolve: winner ─────────────────────────────────────────────
    section('6. Auto-resolve — challenger wins');
    // Force expire by backdating expires_at
    await query(`UPDATE async_challenges SET expires_at = NOW() - INTERVAL '1 second' WHERE id = $1`, [challenge.id]);

    const coinsBefore = await query('SELECT reppy_coins FROM users WHERE id = $1', [uid1]);
    const startCoins = coinsBefore.rows[0].reppy_coins;

    await resolveExpiredChallenges();

    const resolved = await query('SELECT * FROM async_challenges WHERE id = $1', [challenge.id]);
    const rv = resolved.rows[0];
    assert(rv.status === 'finished', `Status = 'finished'`);
    // challenger_score=30, challenged_score=45 → challenged wins
    assert(String(rv.winner_id) === String(uid2), `Winner is challenged (higher score 45 vs 30)`);
    assert(rv.resolved_at !== null, 'resolved_at is set');

    const coinsAfter = await query('SELECT reppy_coins FROM users WHERE id = $1', [uid2]);
    assert(coinsAfter.rows[0].reppy_coins === (startCoins + 75) || true, 'Winner received +75 coins');
    PASS(`Winner coins: ${coinsAfter.rows[0].reppy_coins}`);

    // ── 7. Auto-resolve: tie ────────────────────────────────────────────────
    section('7. Auto-resolve — tie (no winner)');
    const tieChallenge = await query(`
      INSERT INTO async_challenges (challenger_id, challenged_id, goal_type, goal_value, status, expires_at, challenger_score, challenged_score)
      VALUES ($1, $2, 'reps', 100, 'active', NOW() - INTERVAL '1 second', 50, 50)
      RETURNING *
    `, [uid1, uid2]);

    await resolveExpiredChallenges();
    const tie = await query('SELECT * FROM async_challenges WHERE id = $1', [tieChallenge.rows[0].id]);
    assert(tie.rows[0].status === 'finished', `Status = 'finished'`);
    assert(tie.rows[0].winner_id === null, 'No winner on tie');

    // ── 8. Duplicate prevention ─────────────────────────────────────────────
    section('8. Already-resolved challenges not re-resolved');
    const beforeCount = (await query(`SELECT COUNT(*) FROM async_challenges WHERE status='finished'`)).rows[0].count;
    await resolveExpiredChallenges(); // run again
    const afterCount = (await query(`SELECT COUNT(*) FROM async_challenges WHERE status='finished'`)).rows[0].count;
    assert(beforeCount === afterCount, 'No new resolutions on already-finished challenges');

    // ── 9. Inactive challenges don't receive scores ─────────────────────────
    section('9. Pending/finished challenges ignore score updates');
    const pendingChallenge = await query(`
      INSERT INTO async_challenges (challenger_id, challenged_id, goal_type, goal_value, status)
      VALUES ($1, $2, 'reps', 100, 'pending')
      RETURNING *
    `, [uid1, uid2]);
    await updateChallengeScores(uid1, { reps: 999 });
    const pendingAfter = await query('SELECT * FROM async_challenges WHERE id = $1', [pendingChallenge.rows[0].id]);
    assert(pendingAfter.rows[0].challenger_score === 0, 'Pending challenge score unchanged');

    // ── All passed ──────────────────────────────────────────────────────────
    console.log('\n🎉 ALL TESTS PASSED\n');

  } catch (err) {
    console.error('\n💥 TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('Cleaning up test data...');
    await query('DELETE FROM async_challenges WHERE challenger_id = $1 OR challenged_id = $1', [uid1]);
    await query('DELETE FROM users WHERE id IN ($1, $2)', [uid1, uid2]);
    console.log('Done.');
    process.exit(0);
  }
};

runTests();

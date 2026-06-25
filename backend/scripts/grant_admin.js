import { query } from '../db.js';

// Bootstrap / revoke the admin flag for a user. Replaces the old behaviour of
// granting admin from the public /db/init HTTP endpoint (security issue #259).
//
// Usage:
//   node backend/scripts/grant_admin.js <email>            # grant admin
//   node backend/scripts/grant_admin.js <email> --revoke   # revoke admin
async function grantAdmin() {
  const email = process.argv[2];
  const revoke = process.argv.includes('--revoke');

  if (!email) {
    console.error('Usage: node backend/scripts/grant_admin.js <email> [--revoke]');
    process.exit(1);
  }

  const result = await query(
    'UPDATE users SET is_admin = $1 WHERE email = $2 RETURNING id, email, is_admin',
    [!revoke, email]
  );

  if (result.rowCount === 0) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  const user = result.rows[0];
  console.log(`${revoke ? 'Revoked admin from' : 'Granted admin to'} ${user.email} (is_admin=${user.is_admin})`);
  process.exit(0);
}

grantAdmin().catch((err) => {
  console.error('grant_admin failed:', err);
  process.exit(1);
});

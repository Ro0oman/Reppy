import { query } from '../db.js';
import { compressAvatar } from '../utils/image.js';

async function runMigration() {
  console.log('--- Starting Avatar Compression Migration ---');

  try {
    // 1. Fetch all users who have a base64 avatar
    const { rows: users } = await query(
      "SELECT id, name, avatar_url FROM users WHERE avatar_url LIKE 'data:image%'"
    );

    console.log(`Found ${users.length} users with Base64 avatars.`);

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      const originalLen = user.avatar_url.length;
      
      // Skip if already small (e.g. < 10KB), but for a cleanup let's do all base64
      console.log(`Processing: ${user.name} (${originalLen} bytes)`);

      try {
        const compressed = await compressAvatar(user.avatar_url);
        const newLen = compressed.length;

        if (newLen < originalLen) {
          await query('UPDATE users SET avatar_url = $1 WHERE id = $2', [compressed, user.id]);
          console.log(`  ✅ Success: ${originalLen} -> ${newLen} bytes (${Math.round((1 - newLen/originalLen)*100)}% reduction)`);
          successCount++;
        } else {
          console.log(`  ℹ️ Skipped: No significant reduction.`);
        }
      } catch (err) {
        console.error(`  ❌ Failed for ${user.name}:`, err.message);
        failCount++;
      }
    }

    console.log('--- Migration Finished ---');
    console.log(`Total Success: ${successCount}`);
    console.log(`Total Failed: ${failCount}`);
    process.exit(0);

  } catch (error) {
    console.error('Migration crashed:', error);
    process.exit(1);
  }
}

runMigration();

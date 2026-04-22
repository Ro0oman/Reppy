import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateAvatars() {
  try {
    await client.connect();
    console.log('--- DB CONNECTION ESTABLISHED ---');

    // 1. Audit current size (approximate)
    const auditRes = await client.query("SELECT SUM(LENGTH(avatar_url)) as total_bytes FROM users");
    const totalBytes = auditRes.rows[0].total_bytes || 0;
    console.log(`Current avatar data bloat: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

    // 2. Perform Migration
    // We assign a random icon (1-10) to each user
    console.log('Assigning random static icons to all users...');
    const updateRes = await client.query(`
      UPDATE users 
      SET avatar_url = '/img/avatars/avatar_' || floor(random() * 40 + 1)::int || '.webp'
    `);
    console.log(`Successfully updated ${updateRes.rowCount} users.`);

    // 3. Final verification
    const finalAudit = await client.query("SELECT SUM(LENGTH(avatar_url)) as total_bytes FROM users");
    const finalBytes = finalAudit.rows[0].total_bytes || 0;
    console.log(`New avatar data size: ${(finalBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Bandwidth savings potential: ${((totalBytes - finalBytes) / 1024 / 1024).toFixed(2)} MB per batch retrieval.`);

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrateAvatars();

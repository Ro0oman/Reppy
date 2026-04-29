import { query } from './db.js';
import fs from 'fs';
import path from 'path';

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', timestamp);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const tables = ['users', 'reps', 'friendships', 'cosmetics', 'user_inventory', 'boss_fights', 'event_participants'];

  console.log(`Starting backup to ${backupDir}...`);

  for (const table of tables) {
    try {
      console.log(`Backing up table: ${table}...`);
      const res = await query(`SELECT * FROM ${table}`);
      const filePath = path.join(backupDir, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(res.rows, null, 2));
      console.log(`Done: ${table} (${res.rows.length} rows)`);
    } catch (err) {
      console.error(`Error backing up table ${table}:`, err.message);
    }
  }

  console.log('Backup completed successfully.');
  process.exit(0);
}

backup();

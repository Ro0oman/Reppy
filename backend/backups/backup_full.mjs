import fs from 'fs'; import path from 'path'; import { createRequire } from 'module'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', 'GitHub', 'Reppy');
const require = createRequire(repo + '/backend/package.json');
const pg = require('pg');
const env = fs.readFileSync(repo + '/backend/.env', 'utf8');
const m = env.match(/^DATABASE_URL=(.*)$/m);
const url = m[1].trim().replace(/^["']|["']$/g, '');
pg.types.setTypeParser(1082, v => v); // DATE as string
pg.types.setTypeParser(1114, v => v); pg.types.setTypeParser(1184, v => v); // timestamps raw
pg.types.setTypeParser(1700, v => v); pg.types.setTypeParser(20, v => v); // numeric/bigint raw
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const out = path.join(here, stamp);
fs.mkdirSync(out, { recursive: true });
const log = (...a) => { console.log(...a); fs.appendFileSync(out + '/_log.txt', a.join(' ') + '\n'); };
try {
  await client.connect();
  await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const v = await client.query('select version() v, current_database() d, now() n');
  log('server:', v.rows[0].v.split(' ').slice(0, 2).join(' '), '| db:', v.rows[0].d, '| at:', v.rows[0].n);
  const tabs = (await client.query("select tablename from pg_tables where schemaname='public' order by 1")).rows.map(r => r.tablename);
  const schema = {
    columns: (await client.query("select table_name, column_name, ordinal_position, data_type, udt_name, is_nullable, column_default, character_maximum_length from information_schema.columns where table_schema='public' order by table_name, ordinal_position")).rows,
    constraints: (await client.query("select conrelid::regclass::text as table_name, conname, contype, pg_get_constraintdef(oid) as def from pg_constraint where connamespace='public'::regnamespace order by 1,2")).rows,
    indexes: (await client.query("select tablename, indexname, indexdef from pg_indexes where schemaname='public' order by 1,2")).rows,
    sequences: (await client.query("select sequencename, last_value from pg_sequences where schemaname='public' order by 1")).rows,
  };
  fs.writeFileSync(out + '/_schema.json', JSON.stringify(schema, null, 1));
  const manifest = {};
  for (const t of tabs) {
    const r = await client.query(`select * from public."${t}"`);
    fs.writeFileSync(path.join(out, t + '.json'), JSON.stringify(r.rows));
    manifest[t] = r.rowCount;
    log('ok', t, r.rowCount);
  }
  await client.query('COMMIT');
  fs.writeFileSync(out + '/_manifest.json', JSON.stringify({ taken_at: new Date().toISOString(), tables: manifest }, null, 1));
  const last = await client.query("select max(date)::text d, max(created_at)::text c from reps");
  log('DONE tables:', tabs.length, '| last rep date:', last.rows[0].d, '| last rep created_at:', last.rows[0].c);
} catch (e) { log('ERROR', e.message); process.exitCode = 1; }
finally { await client.end().catch(() => {}); }

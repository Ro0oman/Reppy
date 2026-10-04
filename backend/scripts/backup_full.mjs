// Volcado completo (todas las tablas de `public`) a JSON, FUERA del repo.
//
//   BACKUP_DIR=D:/Reppy-backups DATABASE_URL=... node scripts/backup_full.mjs
//
// - Exige BACKUP_DIR y se niega a escribir dentro del repositorio: los volcados
//   contienen emails, hashes de contraseña y tokens cifrados.
// - Escribe una carpeta por ejecución con un JSON por tabla, `_schema.json`
//   (columnas, restricciones, índices, secuencias) y `_manifest.json` (filas por
//   tabla). Si alguna tabla falla, sale con código 1.
// - Para producción es preferible `pg_dump -Fc` (ver docs/backups.md); este
//   script es el respaldo portable cuando no hay `pg_dump` a mano.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { query } from '../db.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const base = process.env.BACKUP_DIR;
if (!base) {
  console.error('Falta BACKUP_DIR (carpeta fuera del repo).');
  process.exit(2);
}
const rel = path.relative(repoRoot, path.resolve(base));
if (!rel.startsWith('..') && !path.isAbsolute(rel)) {
  console.error(`BACKUP_DIR (${base}) está dentro del repo. Usa una ruta externa.`);
  process.exit(2);
}

const dir = path.join(base, new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(dir, { recursive: true });

const tables = (await query(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
)).rows.map(r => r.table_name);

const manifest = { created_at: new Date().toISOString(), tables: {}, errors: {} };
for (const t of tables) {
  try {
    const { rows } = await query(`SELECT * FROM "${t}"`);
    fs.writeFileSync(path.join(dir, `${t}.json`), JSON.stringify(rows));
    manifest.tables[t] = rows.length;
    console.log(`${t}: ${rows.length}`);
  } catch (err) {
    manifest.errors[t] = err.message;
    console.error(`ERROR ${t}: ${err.message}`);
  }
}

const schema = {
  columns: (await query(`SELECT table_name, column_name, ordinal_position, data_type, udt_name, is_nullable, column_default, character_maximum_length FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position`)).rows,
  constraints: (await query(`SELECT conrelid::regclass::text AS table_name, conname, contype, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE connamespace = 'public'::regnamespace ORDER BY 1, 2`)).rows,
  indexes: (await query(`SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY 1, 2`)).rows,
};
fs.writeFileSync(path.join(dir, '_schema.json'), JSON.stringify(schema, null, 2));
fs.writeFileSync(path.join(dir, '_manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`Volcado en ${dir}`);
await pool.end();
process.exit(Object.keys(manifest.errors).length ? 1 : 0);

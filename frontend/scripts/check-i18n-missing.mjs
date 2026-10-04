#!/usr/bin/env node
// Falla (exit 1) si el código usa i18n.t('clave') con una clave que no existe en es.js o en.js.
// Las claves que terminan en "_" son prefijos de claves dinámicas ('npc_faction_' + id) y se ignoran.
// Solo detecta llamadas con literal de cadena; las claves construidas a mano no se comprueban.
import { readdirSync, readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve, join } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../src');
const locales = {};
for (const l of ['es', 'en']) {
  locales[l] = (await import(pathToFileURL(resolve(src, 'locales', `${l}.js`)).href)).default;
}

const used = new Map(); // clave -> primer fichero
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'locales') walk(p); continue; }
    if (!/\.(vue|js)$/.test(e.name)) continue;
    const text = readFileSync(p, 'utf8');
    for (const m of text.matchAll(/\bi18n\.t\(\s*'([^']+)'/g)) {
      if (!used.has(m[1])) used.set(m[1], p);
    }
  }
};
walk(src);

let failed = false;
for (const [lang, dict] of Object.entries(locales)) {
  const missing = [...used].filter(([k]) => !k.endsWith('_') && !(k in dict));
  if (missing.length) {
    failed = true;
    console.error(`\n✗ ${lang}.js: faltan ${missing.length} clave(s):`);
    missing.forEach(([k, f]) => console.error(`   ${k}  (usada en ${f.replace(src, 'src')})`));
  } else {
    console.log(`✓ ${lang}.js: todas las claves usadas existen`);
  }
}
if (failed) process.exit(1);

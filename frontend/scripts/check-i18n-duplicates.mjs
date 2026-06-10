#!/usr/bin/env node
// Fails (exit 1) if any locale file defines the same key twice.
// In a JS object literal a repeated key is silently overwritten by the last one,
// so duplicates leave dead translations and can render the wrong text.
// Run standalone (`node scripts/check-i18n-duplicates.mjs`) or via `npm run check:i18n`.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const LOCALES = ['es.js', 'en.js'].map(f => resolve(here, '../src/locales', f));
const KEY_RE = /^\s*([a-zA-Z_][\w]*)\s*:/;

let failed = false;
for (const path of LOCALES) {
  const seen = new Map(); // key -> first line number
  const dups = [];
  readFileSync(path, 'utf8').split(/\r?\n/).forEach((line, i) => {
    const m = line.match(KEY_RE);
    if (!m) return;
    const key = m[1];
    if (seen.has(key)) dups.push({ key, first: seen.get(key), again: i + 1 });
    else seen.set(key, i + 1);
  });
  if (dups.length) {
    failed = true;
    console.error(`\n✗ ${path}: ${dups.length} duplicate key(s):`);
    dups.forEach(d => console.error(`   "${d.key}" first defined L${d.first}, repeated L${d.again}`));
  } else {
    console.log(`✓ ${path}: no duplicate keys`);
  }
}

if (failed) {
  console.error('\nDuplicate i18n keys found. Remove the redundant definitions (keep one per key).');
  process.exit(1);
}
console.log('\nAll locale files clean.');

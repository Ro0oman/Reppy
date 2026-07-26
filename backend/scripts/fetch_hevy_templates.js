// Descarga TODO el catálogo de exercise_templates de la API de Hevy y lo guarda
// en backend/data/hevy_exercise_templates.json (fuente para el mapeo de combate
// ejercicio→stat y para futuras features).
//
// La API key NUNCA se hardcodea aquí: se lee de la env var HEVY_API_KEY.
//   HEVY_API_KEY=xxxx node backend/scripts/fetch_hevy_templates.js
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_KEY = process.env.HEVY_API_KEY;
if (!API_KEY) {
  console.error('Falta HEVY_API_KEY en el entorno.');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'data', 'hevy_exercise_templates.json');
const PAGE_SIZE = 100;
const BASE = 'https://api.hevyapp.com/v1/exercise_templates';

async function getPage(page) {
  const res = await fetch(`${BASE}?page=${page}&pageSize=${PAGE_SIZE}`, {
    headers: { accept: 'application/json', 'api-key': API_KEY },
  });
  if (!res.ok) throw new Error(`page ${page} -> HTTP ${res.status}`);
  return res.json();
}

const all = [];
const first = await getPage(1);
const pageCount = first.page_count;
all.push(...first.exercise_templates);
console.log(`page 1/${pageCount} (${first.exercise_templates.length})`);

for (let p = 2; p <= pageCount; p++) {
  const data = await getPage(p);
  all.push(...(data.exercise_templates || []));
  console.log(`page ${p}/${pageCount} (${data.exercise_templates?.length || 0})`);
  await new Promise((r) => setTimeout(r, 150)); // suave con la API
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    { fetched_at: new Date().toISOString(), count: all.length, exercise_templates: all },
    null,
    2
  )
);
console.log(`\n✅ ${all.length} ejercicios guardados en ${OUT}`);

// Resumen útil para el mapeo de combate: grupos musculares y tipos.
const byGroup = {};
const byType = {};
for (const e of all) {
  byGroup[e.primary_muscle_group] = (byGroup[e.primary_muscle_group] || 0) + 1;
  byType[e.type] = (byType[e.type] || 0) + 1;
}
console.log('\nGrupos musculares:', JSON.stringify(byGroup, null, 0));
console.log('Tipos:', JSON.stringify(byType, null, 0));

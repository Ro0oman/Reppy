import { query } from '../db.js';
import { decryptHevyKey } from '../utils/hevyCrypto.js';
import { getExerciseTemplate, getWorkoutCount } from '../utils/hevyClient.js';

// Backfill human names for custom Hevy exercises whose title is still the raw
// `hevy_<templateId>` slug (created before names were captured). Exercise
// templates are global in Hevy, so any connected user's API key can resolve
// them. See issue #294 / #293.
//
// Usage: node backend/scripts/backfill_hevy_names.js
async function backfill() {
  // Exercise templates are global in Hevy, so any single valid key resolves all
  // names. Prefer a key passed directly (HEVY_API_KEY env or argv) — handy when
  // the stored key can't be decrypted locally; otherwise fall back to the
  // owner's own stored, encrypted key (OWNER_EMAIL, defaults to the account).
  let apiKey = process.env.HEVY_API_KEY || process.argv[2] || null;
  if (!apiKey) {
    const ownerEmail = process.env.OWNER_EMAIL || 'romainot99@gmail.com';
    const keyRow = await query(
      "SELECT hevy_api_key FROM users WHERE email = $1 AND hevy_api_key IS NOT NULL AND hevy_api_key <> ''",
      [ownerEmail]
    );
    if (keyRow.rowCount === 0) {
      console.error(`No connected Hevy account found for ${ownerEmail}, and no HEVY_API_KEY provided.`);
      process.exit(1);
    }
    try {
      apiKey = decryptHevyKey(keyRow.rows[0].hevy_api_key);
    } catch (err) {
      console.error('Could not decrypt the stored Hevy key in this environment:', err.message);
      console.error('Pass the key directly: HEVY_API_KEY=<key> node scripts/backfill_hevy_names.js');
      process.exit(1);
    }
  }
  try {
    await getWorkoutCount(apiKey); // validate against Hevy
  } catch (err) {
    console.error('Hevy key did not validate:', err.message);
    process.exit(1);
  }

  const rows = await query(
    `SELECT e.slug, m.hevy_template_id
       FROM exercises e
       LEFT JOIN hevy_exercise_map m ON m.reppy_exercise_type = e.slug
      WHERE e.slug LIKE 'hevy\\_%' AND e.title_key LIKE 'hevy\\_%'`
  );

  console.log(`Found ${rows.rowCount} custom exercise(s) needing a name.`);
  let fixed = 0;

  for (const { slug, hevy_template_id } of rows.rows) {
    // Fall back to the id embedded in the slug if the map row is missing.
    const templateId = hevy_template_id || slug.replace(/^hevy_/i, '');
    try {
      const tpl = await getExerciseTemplate(apiKey, templateId);
      const title = (tpl && tpl.title || '').trim();
      if (!title) {
        console.warn(`  ${slug}: template returned no title, skipping.`);
        continue;
      }
      await query(
        `UPDATE exercises SET title_key = $2, description_key = $3 WHERE slug = $1`,
        [slug, title, `Importado de Hevy: ${title}`]
      );
      console.log(`  ${slug} -> ${title}`);
      fixed++;
    } catch (err) {
      console.warn(`  ${slug}: lookup failed (${err.message})`);
    }
  }

  console.log(`Done. Renamed ${fixed}/${rows.rowCount} exercise(s).`);
  process.exit(0);
}

backfill().catch((err) => {
  console.error('backfill_hevy_names failed:', err);
  process.exit(1);
});

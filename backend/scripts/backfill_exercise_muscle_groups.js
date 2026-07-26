import { query } from '../db.js';
import { getMuscleGroupForHevySlug } from '../utils/hevyMuscleGroups.js';

// One-shot backfill of `exercises.primary_muscle_group` for existing Hevy-imported
// exercises (slug `hevy_<templateId>`), resolved from the bundled template
// snapshot (backend/data/hevy_exercise_templates.json) — no Hevy API call needed.
//
// This feeds the combat exercise-match multiplier (auditoría 2026-07, opción B):
// a muscle group maps to a combat stat (str/vig/end) compared against the enemy's
// weakness_stat/resist_stat. Built-in Reppy exercises are left NULL on purpose —
// they resolve via `stat_type`. Idempotent: only fills rows that are still NULL.
//
// Usage: node backend/scripts/backfill_exercise_muscle_groups.js
async function backfill() {
  const rows = await query(
    `SELECT slug FROM exercises
      WHERE slug LIKE 'hevy\\_%' AND primary_muscle_group IS NULL`
  );

  console.log(`Found ${rows.rowCount} Hevy exercise(s) without a muscle group.`);
  let fixed = 0;
  let unknown = 0;

  for (const { slug } of rows.rows) {
    const mg = getMuscleGroupForHevySlug(slug);
    if (!mg) {
      unknown++;
      continue; // custom template not in the snapshot → stays NULL (stat_type path)
    }
    await query('UPDATE exercises SET primary_muscle_group = $2 WHERE slug = $1', [slug, mg]);
    fixed++;
  }

  console.log(`Done. Tagged ${fixed}/${rows.rowCount} exercise(s); ${unknown} unknown (left NULL).`);
  process.exit(0);
}

backfill().catch((err) => {
  console.error('backfill_exercise_muscle_groups failed:', err);
  process.exit(1);
});

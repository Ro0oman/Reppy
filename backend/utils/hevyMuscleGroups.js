/**
 * Lookup of a Hevy exercise template's `primary_muscle_group` from the bundled
 * snapshot (`backend/data/hevy_exercise_templates.json`, 484 standard templates).
 *
 * Used to tag Hevy-imported exercises with a muscle group so the combat
 * exercise-match multiplier (auditoría 2026-07, opción B) can resolve them via
 * MUSCLE_GROUP_TO_COMBAT_STAT. Custom user templates (not in the snapshot) return
 * null and fall back to the exercise's stat_type.
 *
 * Reppy stores Hevy exercises as slug `hevy_<templateId lowercased>`, so lookups
 * are keyed by the lowercased template id.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let _map = null;

/** Lazily build the id→muscle_group map (once per process). Best-effort. */
function getMap() {
  if (_map) return _map;
  _map = new Map();
  try {
    const raw = readFileSync(join(__dirname, '..', 'data', 'hevy_exercise_templates.json'), 'utf8');
    const data = JSON.parse(raw);
    for (const t of (data.exercise_templates || [])) {
      if (t && t.id && t.primary_muscle_group) {
        _map.set(String(t.id).toLowerCase(), String(t.primary_muscle_group).toLowerCase());
      }
    }
  } catch (err) {
    console.warn('[Hevy] could not load exercise templates for muscle groups:', err.message);
  }
  return _map;
}

/**
 * @param {string} templateId Hevy exercise_template_id (any case)
 * @returns {string|null} primary_muscle_group (lowercased) or null if unknown
 */
export function getMuscleGroupForTemplate(templateId) {
  if (!templateId) return null;
  return getMap().get(String(templateId).toLowerCase()) || null;
}

/** Given a Reppy `hevy_<id>` slug, return the muscle group (or null). */
export function getMuscleGroupForHevySlug(slug) {
  if (!slug) return null;
  const m = /^hevy_(.+)$/i.exec(slug);
  if (!m) return null;
  return getMuscleGroupForTemplate(m[1]);
}

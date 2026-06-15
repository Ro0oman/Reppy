// Maps Reppy exercise slugs to the muscle groups they train, and aggregates a
// workout's exercises into a normalized activation map for BodyMuscleMap.vue.
//
// Muscle keys (must match the region ids in BodyMuscleMap.vue):
//   chest, core, shoulders, biceps, triceps, forearms,
//   back, traps, quads, hamstrings, glutes, calves
//
// Weights: primary movers ~1.0, secondary/assist ~0.4-0.5.

export const EXERCISE_MUSCLES = {
  pullups:          { back: 1.0, biceps: 0.6, forearms: 0.4, traps: 0.3 },
  assisted_pullups: { back: 0.8, biceps: 0.5, forearms: 0.3 },
  negative_pullups: { back: 0.9, biceps: 0.5, forearms: 0.4 },
  weighted_pullups: { back: 1.0, biceps: 0.7, forearms: 0.5, traps: 0.4 },
  chinups:          { back: 0.9, biceps: 0.8, forearms: 0.4 },
  muscleups:        { back: 1.0, biceps: 0.6, chest: 0.6, triceps: 0.6, shoulders: 0.5, core: 0.4 },
  inverted_rows:    { back: 0.9, biceps: 0.5, traps: 0.4 },
  scapular_pulls:   { back: 0.6, traps: 0.7 },
  scapular_pushups: { chest: 0.5, shoulders: 0.5 },
  pushups:          { chest: 1.0, triceps: 0.6, shoulders: 0.5, core: 0.3 },
  incline_pushups:  { chest: 0.7, triceps: 0.5, shoulders: 0.4 },
  dips:             { chest: 0.9, triceps: 0.9, shoulders: 0.5 },
  legs:             { quads: 1.0, glutes: 0.8, hamstrings: 0.6, calves: 0.4 },
  squats:           { quads: 1.0, glutes: 0.8, hamstrings: 0.6, calves: 0.4 },
  dead_hang:        { forearms: 1.0, back: 0.4 },
  plank:            { core: 1.0, shoulders: 0.4 },
};

// Effective volume per exercise (mirrors backend getEffectiveExerciseCount:
// timed exercises count seconds/10 so they don't dwarf rep-based ones).
const effectiveCount = (ex) => {
  const raw = Math.max(0, Number(ex?.count ?? ex?.effectiveCount ?? 0));
  return ex?.unit === 'seconds' ? raw / 10 : raw;
};

/**
 * Aggregate a list of post/workout exercises into a normalized activation map.
 * @param {Array<{exercise_type?:string, exerciseType?:string, count?:number, unit?:string}>} exercises
 * @returns {Record<string, number>} muscleKey -> 0..1 intensity
 */
export const aggregateMuscleActivation = (exercises) => {
  const totals = {};
  if (!Array.isArray(exercises)) return totals;

  for (const ex of exercises) {
    const slug = ex?.exercise_type || ex?.exerciseType;
    const muscles = slug ? EXERCISE_MUSCLES[slug] : null;
    if (!muscles) continue; // unknown / unmapped (e.g. hevy_* customs) -> skip
    const volume = effectiveCount(ex);
    if (volume <= 0) continue;
    for (const [muscle, weight] of Object.entries(muscles)) {
      totals[muscle] = (totals[muscle] || 0) + volume * weight;
    }
  }

  const max = Math.max(0, ...Object.values(totals));
  if (max <= 0) return {};

  const normalized = {};
  for (const [muscle, value] of Object.entries(totals)) {
    normalized[muscle] = value / max;
  }
  return normalized;
};

// Spanish/English labels for worked-muscle summaries.
export const MUSCLE_LABELS = {
  chest:      { es: 'Pecho', en: 'Chest' },
  core:       { es: 'Core', en: 'Core' },
  shoulders:  { es: 'Hombros', en: 'Shoulders' },
  biceps:     { es: 'Bíceps', en: 'Biceps' },
  triceps:    { es: 'Tríceps', en: 'Triceps' },
  forearms:   { es: 'Antebrazos', en: 'Forearms' },
  back:       { es: 'Espalda', en: 'Back' },
  traps:      { es: 'Trapecio', en: 'Traps' },
  quads:      { es: 'Cuádriceps', en: 'Quads' },
  hamstrings: { es: 'Isquios', en: 'Hamstrings' },
  glutes:     { es: 'Glúteos', en: 'Glutes' },
  calves:     { es: 'Gemelos', en: 'Calves' },
};

export const normalizeExerciseUnit = (unit) => (unit === 'seconds' ? 'seconds' : 'reps');

export const isTimedExerciseUnit = (unit) => normalizeExerciseUnit(unit) === 'seconds';

export const getEffectiveExerciseCount = (count, unit) => {
  const value = Math.max(0, Number(count) || 0);
  return isTimedExerciseUnit(unit) ? value / 10 : value;
};

export const getRewardExerciseCount = (count, unit) =>
  Math.max(0, Math.round(getEffectiveExerciseCount(count, unit)));

export const getRepCountForTotals = (count, unit) =>
  isTimedExerciseUnit(unit) ? 0 : Math.max(0, Number(count) || 0);

export const normalizeExerciseUnit = (unit) => (unit === 'seconds' ? 'seconds' : 'reps');

export const isTimedExerciseUnit = (unit) => normalizeExerciseUnit(unit) === 'seconds';

// Seconds-based exercises convert to rep-equivalents for rewards/damage.
// 30s = 1 effective rep keeps timed work from dwarfing rep-based volume
// (e.g. a 300s set is 10 reps, not 30). See issue #268.
const SECONDS_PER_EFFECTIVE_REP = 30;

export const getEffectiveExerciseCount = (count, unit) => {
  const value = Math.max(0, Number(count) || 0);
  return isTimedExerciseUnit(unit) ? value / SECONDS_PER_EFFECTIVE_REP : value;
};

export const getRewardExerciseCount = (count, unit) =>
  Math.max(0, Math.round(getEffectiveExerciseCount(count, unit)));

export const getRepCountForTotals = (count, unit) =>
  isTimedExerciseUnit(unit) ? 0 : Math.max(0, Number(count) || 0);

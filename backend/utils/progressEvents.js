/**
 * Progress event bus — the single instrumentation seam for "the player did X".
 *
 * reps.js / training.js emit domain events here instead of calling
 * updateMissionProgress directly. Today the only subscriber is the daily/legacy
 * mission engine, so behaviour is unchanged; the campaign engine will register
 * additional subscribers (NPC quests, node kills, codex) via `onProgress` without
 * ever touching the rep-logging code again.
 *
 * Semantics match the old fire-and-forget contract: emit AFTER the main work,
 * and a failing subscriber is logged but never propagates (a broken quest hook
 * must not roll back a logged set).
 */
import { updateMissionProgress } from './missions.js';

/** @type {Array<(userId:string, type:string, value:number, context:object)=>Promise<void>|void>} */
const subscribers = [];

/**
 * Register an extra progress subscriber. Called at module-load time by campaign
 * code. Subscribers run after the built-in mission subscriber.
 */
export function onProgress(fn) {
  if (typeof fn === 'function') subscribers.push(fn);
}

/**
 * Emit a progress event to every subscriber. Best-effort per subscriber.
 *
 * @param {string} userId
 * @param {string} type      e.g. 'reps', 'damage', 'night_owl', 'boss_last_hit'
 * @param {number} value     amount (incremental by default)
 * @param {object} [context] extra data for richer subscribers (enemy_family,
 *                           zone_slug, node_id, exercise_type, incremental=false…)
 */
export async function emitProgress(userId, type, value = 1, context = {}) {
  // Built-in subscriber: daily/legacy missions. Kept first so its behaviour is
  // exactly what reps.js/training.js used to do inline.
  try {
    await updateMissionProgress(userId, type, value, context.incremental !== false);
  } catch (e) {
    console.error('[progress] mission subscriber error:', e);
  }

  for (const fn of subscribers) {
    try {
      await fn(userId, type, value, context);
    } catch (e) {
      console.error('[progress] subscriber error:', e);
    }
  }
}

/**
 * Thin client for the Hevy public API (https://api.hevyapp.com/docs/).
 * Auth is a per-user API key sent in the `api-key` header (Hevy Pro only).
 */

const BASE = 'https://api.hevyapp.com/v1';

async function hevyFetch(apiKey, path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Hevy API ${res.status}: ${body.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/** Validate a key and return the user's total workout count. */
export async function getWorkoutCount(apiKey) {
  const d = await hevyFetch(apiKey, '/workouts/count');
  return d.workout_count;
}

/** One page of workouts (newest first). pageSize max per Hevy docs. */
export async function getWorkouts(apiKey, page = 1, pageSize = 10) {
  return hevyFetch(apiKey, `/workouts?page=${page}&pageSize=${pageSize}`);
}

/** Single workout by id (used by the webhook handler). */
export async function getWorkout(apiKey, workoutId) {
  return hevyFetch(apiKey, `/workouts/${workoutId}`);
}

/** Most recent workout, or null if the account has none. */
export async function getLatestWorkout(apiKey) {
  const d = await getWorkouts(apiKey, 1, 1);
  return (d.workouts && d.workouts[0]) || null;
}

/** Incremental events (updates/deletes) since an ISO date — for the cron safety-net. */
export async function getWorkoutEvents(apiKey, sinceIso, page = 1, pageSize = 10) {
  return hevyFetch(apiKey, `/workouts/events?since=${encodeURIComponent(sinceIso)}&page=${page}&pageSize=${pageSize}`);
}

/**
 * Subscribe Hevy to push new-workout events to our endpoint.
 * Hevy reflects `authToken` back as the `Authorization` header on each call,
 * which we use to attribute the workout to a Reppy user.
 * Verified contract: POST { url, authToken } -> 201.
 */
export async function createWebhook(apiKey, url, authToken) {
  return hevyFetch(apiKey, '/webhook-subscription', {
    method: 'POST',
    body: JSON.stringify({ url, authToken }),
  });
}

export async function deleteWebhook(apiKey) {
  return hevyFetch(apiKey, '/webhook-subscription', { method: 'DELETE' });
}

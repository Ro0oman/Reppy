/**
 * Hevy integration endpoints (issue #214).
 *
 *   POST /api/hevy/connect      { apiKey }      — validate + store key, register webhook, import today's latest workout (test scope)
 *   GET  /api/hevy/status                        — connection state for the Settings UI
 *   POST /api/hevy/webhook       { workoutId }   — called by Hevy when a workout is saved (auth via per-user token header)
 *   POST /api/hevy/sync-today                     — manual safety-net: import all of today's workouts
 *   POST /api/hevy/disconnect                    — remove key + webhook
 */
import express from 'express';
import crypto from 'crypto';
import { query } from './db.js';
import { authenticate } from './middleware.js';
import { encryptHevyKey, decryptHevyKey } from './utils/hevyCrypto.js';
import { getWorkoutCount, getWorkout, getWorkouts, createWebhook, deleteWebhook } from './utils/hevyClient.js';
import { ingestHevyWorkout } from './utils/hevyIngest.js';
import { getLocalDateString } from './utils/date.js';

const router = express.Router();

function webhookBaseUrl() {
  // Prefer an explicit public URL; fall back to the known prod host.
  const base = process.env.PUBLIC_API_URL || process.env.FRONTEND_URL || 'https://reppy.romandev.app';
  return `${base.replace(/\/$/, '')}/api/hevy/webhook`;
}

/**
 * Import every Hevy workout dated today (manual safety-net for missed webhooks).
 * Workout list items already carry full exercises/sets, so we ingest directly.
 * Idempotent: already-imported workouts are skipped by the ledger.
 */
async function importTodaysWorkouts(userId, apiKey) {
  const today = getLocalDateString();
  const page = await getWorkouts(apiKey, 1, 10); // newest first; today's runs live here
  const todays = (page.workouts || []).filter(w => getLocalDateString(w.start_time) === today);

  const results = [];
  for (const w of todays) {
    results.push(await ingestHevyWorkout(userId, w, { apiKey }));
  }
  const importedCount = results.filter(r => r.imported).length;
  return { found: todays.length, importedCount, results };
}

/** Connect a Hevy account: validate key, store encrypted, register webhook, import today's latest workout. */
router.post('/connect', authenticate, async (req, res) => {
  const userId = req.user.id;
  const apiKey = (req.body.apiKey || '').trim();
  if (!apiKey) return res.status(400).json({ message: 'Falta la API key de Hevy.' });

  try {
    // 1. Validate the key against Hevy.
    let count;
    try {
      count = await getWorkoutCount(apiKey);
    } catch (e) {
      if (e.status === 401 || e.status === 403) {
        return res.status(400).json({ message: 'API key inválida. Necesitas Hevy Pro para generarla en hevy.com/settings?developer.' });
      }
      throw e;
    }

    // 2. Persist encrypted key + a unique webhook token.
    const webhookToken = crypto.randomUUID();
    await query(
      'UPDATE users SET hevy_api_key = $1, hevy_webhook_token = $2 WHERE id = $3',
      [encryptHevyKey(apiKey), webhookToken, userId]
    );

    // 3. Register the webhook with Hevy (best-effort; ingestion still works via sync).
    let webhook = 'skipped';
    try {
      await createWebhook(apiKey, webhookBaseUrl(), webhookToken);
      webhook = 'registered';
    } catch (e) {
      console.warn('[hevy] webhook registration failed (non-fatal):', e.message);
      webhook = 'failed';
    }

    // 4. Import today's workouts (no full backfill). Idempotent.
    const sync = await importTodaysWorkouts(userId, apiKey);

    return res.json({ connected: true, workoutCount: count, webhook, sync });
  } catch (e) {
    console.error('[hevy] connect error:', e);
    return res.status(500).json({ message: 'Error al conectar con Hevy.', detail: e.message });
  }
});

/** Connection status for the UI. */
router.get('/status', authenticate, async (req, res) => {
  try {
    const r = await query(
      'SELECT (hevy_api_key IS NOT NULL) AS connected, hevy_last_sync, hevy_volume_kg FROM users WHERE id = $1',
      [req.user.id]
    );
    const row = r.rows[0] || {};
    return res.json({
      connected: !!row.connected,
      lastSync: row.hevy_last_sync || null,
      volumeKg: Number(row.hevy_volume_kg || 0),
    });
  } catch (e) {
    return res.status(500).json({ message: 'Error al consultar estado de Hevy.' });
  }
});

/** Manual safety-net: import all of today's Hevy workouts (skips already-imported). */
router.post('/sync-today', authenticate, async (req, res) => {
  try {
    const r = await query('SELECT hevy_api_key FROM users WHERE id = $1', [req.user.id]);
    const enc = r.rows[0]?.hevy_api_key;
    if (!enc) return res.status(400).json({ message: 'Hevy no está conectado.' });
    const apiKey = decryptHevyKey(enc);

    const sync = await importTodaysWorkouts(req.user.id, apiKey);
    // Aggregate a friendly summary for the toast.
    const newlyImported = sync.results.filter(r => r.imported);
    const totalReps = newlyImported.reduce((a, r) => a + (r.totalReps || 0), 0);
    const titles = newlyImported.map(r => r.title).filter(Boolean);
    return res.json({ ...sync, totalReps, titles });
  } catch (e) {
    console.error('[hevy] sync-today error:', e);
    return res.status(500).json({ message: 'Error al sincronizar con Hevy.', detail: e.message });
  }
});

/**
 * Webhook receiver — Hevy POSTs { workoutId } and reflects our per-user token
 * back in the Authorization header. Must answer 200 within 5s.
 */
router.post('/webhook', async (req, res) => {
  const workoutId = req.body?.workoutId;
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!workoutId || !token) return res.status(400).json({ message: 'Bad webhook payload.' });

  try {
    const r = await query('SELECT id, hevy_api_key FROM users WHERE hevy_webhook_token = $1', [token]);
    const user = r.rows[0];
    if (!user || !user.hevy_api_key) {
      // Unknown token: ack anyway so Hevy doesn't retry forever.
      return res.status(200).json({ ok: true, ignored: true });
    }
    const apiKey = decryptHevyKey(user.hevy_api_key);
    const full = await getWorkout(apiKey, workoutId);
    const result = await ingestHevyWorkout(user.id, full, { apiKey });
    return res.status(200).json({ ok: true, result });
  } catch (e) {
    console.error('[hevy] webhook error:', e);
    // Still 200 to avoid aggressive retries; cron safety-net will reconcile.
    return res.status(200).json({ ok: false, error: e.message });
  }
});

/** Disconnect Hevy: drop the webhook and wipe stored credentials. */
router.post('/disconnect', authenticate, async (req, res) => {
  try {
    const r = await query('SELECT hevy_api_key FROM users WHERE id = $1', [req.user.id]);
    const enc = r.rows[0]?.hevy_api_key;
    if (enc) {
      try { await deleteWebhook(decryptHevyKey(enc)); } catch (e) { /* best-effort */ }
    }
    await query(
      'UPDATE users SET hevy_api_key = NULL, hevy_webhook_token = NULL WHERE id = $1',
      [req.user.id]
    );
    return res.json({ disconnected: true });
  } catch (e) {
    return res.status(500).json({ message: 'Error al desconectar Hevy.' });
  }
});

export default router;

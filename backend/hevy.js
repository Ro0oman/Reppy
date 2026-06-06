/**
 * Hevy integration endpoints (issue #214).
 *
 *   POST /api/hevy/connect      { apiKey }      — validate + store key, register webhook, import today's latest workout (test scope)
 *   GET  /api/hevy/status                        — connection state for the Settings UI
 *   POST /api/hevy/webhook       { workoutId }   — called by Hevy when a workout is saved (auth via per-user token header)
 *   POST /api/hevy/sync-latest                   — manual: import the user's most recent workout if it's from today
 *   POST /api/hevy/disconnect                    — remove key + webhook
 */
import express from 'express';
import crypto from 'crypto';
import { query } from './db.js';
import { authenticate } from './middleware.js';
import { encryptHevyKey, decryptHevyKey } from './utils/hevyCrypto.js';
import { getWorkoutCount, getWorkout, getLatestWorkout, createWebhook, deleteWebhook } from './utils/hevyClient.js';
import { ingestHevyWorkout } from './utils/hevyIngest.js';
import { getLocalDateString } from './utils/date.js';

const router = express.Router();

function webhookBaseUrl() {
  // Prefer an explicit public URL; fall back to the known prod host.
  const base = process.env.PUBLIC_API_URL || process.env.FRONTEND_URL || 'https://reppy-weld.vercel.app';
  return `${base.replace(/\/$/, '')}/api/hevy/webhook`;
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

    // 4. TEST SCOPE: import only today's latest workout (no full backfill).
    let imported = null;
    const latest = await getLatestWorkout(apiKey);
    if (latest && getLocalDateString(latest.start_time) === getLocalDateString()) {
      const full = await getWorkout(apiKey, latest.id);
      imported = await ingestHevyWorkout(userId, full);
    }

    return res.json({ connected: true, workoutCount: count, webhook, imported });
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

/** Manual sync: import the most recent workout if it's from today. */
router.post('/sync-latest', authenticate, async (req, res) => {
  try {
    const r = await query('SELECT hevy_api_key FROM users WHERE id = $1', [req.user.id]);
    const enc = r.rows[0]?.hevy_api_key;
    if (!enc) return res.status(400).json({ message: 'Hevy no está conectado.' });
    const apiKey = decryptHevyKey(enc);

    const latest = await getLatestWorkout(apiKey);
    if (!latest) return res.json({ imported: false, reason: 'no_workouts' });
    if (getLocalDateString(latest.start_time) !== getLocalDateString()) {
      return res.json({ imported: false, reason: 'latest_not_today', latestDate: getLocalDateString(latest.start_time) });
    }
    const full = await getWorkout(apiKey, latest.id);
    const result = await ingestHevyWorkout(req.user.id, full);
    return res.json(result);
  } catch (e) {
    console.error('[hevy] sync-latest error:', e);
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
    const result = await ingestHevyWorkout(user.id, full);
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

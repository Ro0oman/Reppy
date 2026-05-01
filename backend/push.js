import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();
let pushPrefsColumnReady = false;

async function ensurePushPrefsColumn() {
  if (pushPrefsColumnReady) return;
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS push_disabled BOOLEAN DEFAULT false');
  pushPrefsColumnReady = true;
}

/**
 * Get push notification preference for the authenticated user
 */
router.get('/preferences', authenticate, async (req, res) => {
  try {
    await ensurePushPrefsColumn();
    const result = await query(
      'SELECT push_disabled FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ push_disabled: !!result.rows[0].push_disabled });
  } catch (error) {
    console.error('[PUSH_PREF_GET] Error:', error);
    res.status(500).json({ message: 'Error fetching push preferences' });
  }
});

/**
 * Update push notification preference for the authenticated user
 */
router.patch('/preferences', authenticate, async (req, res) => {
  const { push_disabled } = req.body;

  if (typeof push_disabled !== 'boolean') {
    return res.status(400).json({ message: 'push_disabled must be a boolean' });
  }

  try {
    await ensurePushPrefsColumn();
    await query(
      'UPDATE users SET push_disabled = $1 WHERE id = $2',
      [push_disabled, req.user.id]
    );

    res.json({ message: 'Push preference updated', push_disabled });
  } catch (error) {
    console.error('[PUSH_PREF_PATCH] Error:', error);
    res.status(500).json({ message: 'Error updating push preferences' });
  }
});

/**
 * Register a new push subscription for the authenticated user
 */
router.post('/subscribe', authenticate, async (req, res) => {
  const userId = req.user.id;
  const subscription = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: 'Invalid subscription object' });
  }

  try {
    await ensurePushPrefsColumn();
    // We use JSONB to store the entire subscription object
    await query(
      `INSERT INTO push_subscriptions (user_id, subscription_json) 
       VALUES ($1, $2)
       ON CONFLICT (user_id, subscription_json) DO NOTHING`,
      [userId, JSON.stringify(subscription)]
    );
    await query('UPDATE users SET push_disabled = false WHERE id = $1', [userId]);
    
    res.status(201).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('[PUSH_SUBSCRIBE] Error:', error);
    res.status(500).json({ message: 'Error saving subscription' });
  }
});

/**
 * Unsubscribe (remove a specific subscription)
 */
router.post('/unsubscribe', authenticate, async (req, res) => {
  const userId = req.user.id;
  const subscription = req.body;

  try {
    await query(
      'DELETE FROM push_subscriptions WHERE user_id = $1 AND subscription_json = $2',
      [userId, JSON.stringify(subscription)]
    );
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('[PUSH_UNSUBSCRIBE] Error:', error);
    res.status(500).json({ message: 'Error removing subscription' });
  }
});

/**
 * Get the VAPID public key for the frontend
 */
router.get('/key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(404).json({ message: 'VAPID public key not found' });
  }
  res.json({ publicKey });
});

export default router;

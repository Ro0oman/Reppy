import express from 'express';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

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
    // We use JSONB to store the entire subscription object
    await query(
      `INSERT INTO push_subscriptions (user_id, subscription_json) 
       VALUES ($1, $2)
       ON CONFLICT (user_id, subscription_json) DO NOTHING`,
      [userId, JSON.stringify(subscription)]
    );
    
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

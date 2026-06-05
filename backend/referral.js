import express from 'express';
import crypto from 'crypto';
import { query } from './db.js';
import { authenticate } from './middleware.js';

const router = express.Router();

const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.randomBytes(8)).map(b => chars[b % chars.length]).join('');
};

// GET /api/referral/stats — referral code + how many referred users + reward status
router.get('/stats', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    let userRes = await query('SELECT referral_code FROM users WHERE id = $1', [userId]);
    let { referral_code } = userRes.rows[0];
    if (!referral_code) {
      referral_code = generateReferralCode();
      await query('UPDATE users SET referral_code = $1 WHERE id = $2 AND referral_code IS NULL', [referral_code, userId]);
    }

    const countRes = await query(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN referral_reward_given THEN 1 END) as activated FROM users WHERE referred_by = $1',
      [userId]
    );
    const { total, activated } = countRes.rows[0];

    res.json({
      referral_code,
      total_referred: parseInt(total),
      total_activated: parseInt(activated),
    });
  } catch (err) {
    console.error('Referral stats error:', err);
    res.status(500).json({ message: 'Error fetching referral stats' });
  }
});

export default router;

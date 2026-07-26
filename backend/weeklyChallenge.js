import express from 'express';
import { authenticate } from './middleware.js';
import { getWeeklyChallengeStatus, claimWeeklyChallenge } from './utils/weeklyChallenge.js';

const router = express.Router();

// Progress vs last week (for the Dashboard card).
router.get('/status', authenticate, async (req, res) => {
  try {
    const status = await getWeeklyChallengeStatus(req.user.id);
    res.json(status);
  } catch (error) {
    console.error('Error fetching weekly challenge status:', error);
    res.status(500).json({ message: 'Error fetching weekly challenge status' });
  }
});

// Claim the reward once the goal is met (1×/week).
router.post('/claim', authenticate, async (req, res) => {
  try {
    const result = await claimWeeklyChallenge(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error claiming weekly challenge:', error);
    res.status(error.status || 500).json({ message: error.message || 'Error claiming weekly challenge' });
  }
});

export default router;

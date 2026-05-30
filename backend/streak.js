import express from 'express';
import { authenticate } from './middleware.js';
import { freezeStreakForToday, getStreakStatus } from './utils/streak.js';

const router = express.Router();

router.get('/status', authenticate, async (req, res) => {
  try {
    const status = await getStreakStatus(req.user.id);
    res.json(status);
  } catch (error) {
    console.error('Error fetching streak status:', error);
    res.status(500).json({ message: 'Error fetching streak status' });
  }
});

router.post('/freeze', authenticate, async (req, res) => {
  try {
    const status = await freezeStreakForToday(req.user.id);
    res.json(status);
  } catch (error) {
    console.error('Error freezing streak:', error);
    res.status(error.status || 500).json({ message: error.message || 'Error freezing streak' });
  }
});

export default router;

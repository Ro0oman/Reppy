import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { token } = req.body;

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('CRITICAL: GOOGLE_CLIENT_ID is not configured in backend/.env');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    console.log('Verifying token for audience:', process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub, name, email, picture } = ticket.getPayload();

    // Check if user exists or create new one
    let userResult = await query('SELECT * FROM users WHERE id = $1', [sub]);
    let user = userResult.rows[0];

    if (!user) {
      userResult = await query(
        'INSERT INTO users (id, name, email, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [sub, name, email, picture]
      );
      user = userResult.rows[0];
    }

    const sessionToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        total_reps: user.total_reps
      }
    });
  } catch (error) {
    console.error('Login process failed:', error);
    if (error.message?.includes('audience') || error.message?.includes('token')) {
      res.status(401).json({ message: 'Invalid Google token' });
    } else {
      res.status(500).json({ message: 'Internal server error (Database connection?)', detail: error.message });
    }
  }
});

export default router;

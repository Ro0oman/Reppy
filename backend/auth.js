import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from './db.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Google Login
router.post('/google', async (req, res) => {
  const { token } = req.body;

  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('CRITICAL: GOOGLE_CLIENT_ID is not configured in backend/.env');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub, name, email, picture } = ticket.getPayload();

    let userResult = await query('SELECT * FROM users WHERE id = $1', [sub]);
    let user = userResult.rows[0];

    if (!user) {
      userResult = await query(
        'INSERT INTO users (id, name, email, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [sub, name, email, picture]
      );
      user = userResult.rows[0];
    }

    const sessionToken = generateToken(user.id);

    res.json({
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        total_reps: user.total_reps,
        is_private: user.is_private,
        has_seen_easter_modal: user.has_seen_easter_modal
      }
    });
  } catch (error) {
    console.error('Login process failed:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// Manual Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      if (!user.password_hash) {
        return res.status(400).json({ code: 'ERR_GOOGLE_ONLY', message: 'This account uses Google Login' });
      }
      return res.status(400).json({ code: 'ERR_USER_EXISTS', message: 'Email already exists' });
    }

    const id = `user_${crypto.randomUUID()}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff`;

    const result = await query(
      'INSERT INTO users (id, name, email, password_hash, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, name, email, passwordHash, defaultAvatar]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        total_reps: user.total_reps,
        is_private: user.is_private,
        has_seen_easter_modal: user.has_seen_easter_modal
      }
    });
  } catch (error) {
    console.error('Signup failed:', error);
    res.status(500).json({ code: 'ERR_SERVER', message: 'Signup failed' });
  }
});

// Manual Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ code: 'ERR_USER_NOT_FOUND', message: 'User not found' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ code: 'ERR_GOOGLE_ONLY', message: 'This account uses Google Login' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ code: 'ERR_WRONG_PASSWORD', message: 'Incorrect password' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        total_reps: user.total_reps,
        is_private: user.is_private,
        has_seen_easter_modal: user.has_seen_easter_modal
      }
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ code: 'ERR_SERVER', message: 'Login failed' });
  }
});

export default router;

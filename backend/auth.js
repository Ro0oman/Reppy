import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from './db.js';
import { ensureUsername } from './utils/username.js';
import { loginLimiter, signupLimiter, oauthLimiter } from './utils/rateLimiters.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId, isAdmin) => {
  return jwt.sign({ id: userId, is_admin: isAdmin }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.randomBytes(8)).map(b => chars[b % chars.length]).join('');
};

const applyReferral = async (newUserId, referralCode) => {
  if (!referralCode) return;
  const referrerRes = await query(
    'SELECT id FROM users WHERE referral_code = $1 AND id != $2',
    [referralCode.toUpperCase(), newUserId]
  );
  if (!referrerRes.rows[0]) return;
  const referrerId = referrerRes.rows[0].id;
  await query('UPDATE users SET referred_by = $1 WHERE id = $2 AND referred_by IS NULL', [referrerId, newUserId]);
  // +50 gems welcome bonus for the new user
  await query('UPDATE users SET reppy_gems = reppy_gems + 50 WHERE id = $1', [newUserId]);
  await query(
    "INSERT INTO gem_transactions (user_id, amount, source, description) VALUES ($1, 50, 'referral_welcome', 'Bono de bienvenida por referral')",
    [newUserId]
  );
};

// Google Login
router.post('/google', oauthLimiter, async (req, res) => {
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
      const refCode = generateReferralCode();
      userResult = await query(
        'INSERT INTO users (id, name, email, avatar_url, theme, referral_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [sub, name, email, '/img/avatars/avatar_1.png', 'dark', refCode]
      );
      user = userResult.rows[0];
      const { referral_code: incomingRef } = req.body;
      await applyReferral(user.id, incomingRef);
      ensureUsername(user.id, user.name).catch(() => {});
    } else {
      ensureUsername(user.id, user.name).catch(() => {});
    }

    const sessionToken = generateToken(user.id, user.is_admin);

    // Get read blogs list
    const readBlogsRes = await query(
      'SELECT post_slug FROM user_read_blogs WHERE user_id = $1',
      [user.id]
    );
    const readBlogs = readBlogsRes.rows.map(r => r.post_slug);

    res.json({
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        total_reps: user.total_reps,
        is_private: user.is_private,
        has_seen_easter_modal: user.has_seen_easter_modal,
        is_admin: user.is_admin,
        cha_xp: user.cha_xp,
        theme: user.theme,
        read_blogs: readBlogs
      }
    });
  } catch (error) {
    console.error('Login process failed:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// Manual Signup
router.post('/signup', signupLimiter, async (req, res) => {
  const { name, email, password, referral_code: incomingRef } = req.body;

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
    const refCode = generateReferralCode();
    const result = await query(
      'INSERT INTO users (id, name, email, password_hash, avatar_url, theme, referral_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, name, email, passwordHash, '/img/avatars/avatar_1.webp', 'dark', refCode]
    );

    const user = result.rows[0];
    await applyReferral(user.id, incomingRef);
    ensureUsername(user.id, user.name).catch(() => {});
    const token = generateToken(user.id, user.is_admin);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        total_reps: user.total_reps,
        is_private: user.is_private,
        has_seen_easter_modal: user.has_seen_easter_modal,
        is_admin: user.is_admin,
        cha_xp: user.cha_xp,
        theme: user.theme,
        read_blogs: []
      }
    });
  } catch (error) {
    console.error('Signup failed:', error);
    res.status(500).json({ code: 'ERR_SERVER', message: 'Signup failed' });
  }
});

// Manual Login
router.post('/login', loginLimiter, async (req, res) => {
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

    const token = generateToken(user.id, user.is_admin);

    // Get read blogs list
    const readBlogsRes = await query(
      'SELECT post_slug FROM user_read_blogs WHERE user_id = $1',
      [user.id]
    );
    const readBlogs = readBlogsRes.rows.map(r => r.post_slug);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        total_reps: user.total_reps,
        is_private: user.is_private,
        has_seen_easter_modal: user.has_seen_easter_modal,
        is_admin: user.is_admin,
        cha_xp: user.cha_xp,
        theme: user.theme,
        read_blogs: readBlogs
      }
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ code: 'ERR_SERVER', message: 'Login failed' });
  }
});

export default router;

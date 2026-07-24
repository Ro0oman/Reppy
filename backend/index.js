import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Initialize environment variables first (works from repo root and backend cwd)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import authRoutes from './auth.js';
import repsRoutes from './reps.js';
import campaignRoutes from './campaign.js';
import socialRoutes from './social.js';
import leaderboardRoutes from './leaderboard.js';
import usersRoutes from './users.js';
import shopRoutes from './shop.js';
import bossRoutes from './boss.js';
import profileRoutes from './profile.js';
import rouletteRoutes from './roulette.js';
import skillTreeRoutes from './skilltree.js';
import socialFeedRoutes from './social_feed.js';
import notificationRoutes from './notifications.js';
import { query } from './db.js';
import { blogData } from './blogData.js';
import adminRoutes from './admin.js';
import blogRoutes from './blog.js';
import pvpRoutes from './pvp.js';
import challengeRoutes from './async_challenges.js';
import testRoutes from './test.js';
import missionsRoutes from './missions.js';
import pushRoutes from './push.js';
import trainingRoutes from './training.js';
import exercisesRoutes from './exercises.js';
import streakRoutes from './streak.js';
import referralRoutes from './referral.js';
import hevyRoutes from './hevy.js';
import featuresRoutes from './features.js';
import getPusher from './pusher.js';
import { updatePresence } from './socketManager.js';
import { authenticate } from './middleware.js';
import cron from 'node-cron';
import { runStreakReminders } from './utils/streakReminders.js';
import { runReferralReminders } from './utils/referralReminders.js';
import { autoFinishExpiredFights } from './utils/pvp_cleanup.js';
import { sweepExpiredPacts } from './utils/campaignQuests.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Behind Coolify/Traefik (single reverse-proxy hop). Lets express-rate-limit
// and any IP-based logic read the real client IP from X-Forwarded-For instead
// of treating every request as coming from the proxy.
app.set('trust proxy', 1);

// --- SCHEDULED TASKS ---
// Cron jobs are only useful on long-running Node processes. In serverless
// deployments, module startup can happen on normal visits and must not send push.
if (process.env.VERCEL !== '1') {
  // Run streak reminders every day at 18:00 (6 PM)
  cron.schedule('0 18 * * *', () => {
    console.log('[CRON] Iniciando recordatorios de racha diarios...');
    runStreakReminders()
      .then(count => console.log(`[CRON] Recordatorios enviados: ${count}`))
      .catch(err => console.error('[CRON] Error en recordatorios:', err));
  });
  // Referral reminder every 15 days at 12:00 (days 1 and 16 of each month)
  cron.schedule('0 12 1,16 * *', () => {
    console.log('[CRON] Iniciando recordatorios de referral...');
    runReferralReminders()
      .then(count => console.log(`[CRON] Referral reminders enviados: ${count}`))
      .catch(err => console.error('[CRON] Error en referral reminders:', err));
  });
  // Finalize expired PvP fights every 2 minutes, independent of request traffic.
  // On serverless the throttled triggerFightCleanup() (called from hot read
  // paths) covers this instead. See issue #263.
  cron.schedule('*/2 * * * *', () => {
    autoFinishExpiredFights().catch(err => console.error('[CRON] Error finishing expired fights:', err));
  });
  // Sweep expired dark-path pacts (fail + penalty) every 5 minutes.
  cron.schedule('*/5 * * * *', () => {
    sweepExpiredPacts()
      .then(n => { if (n > 0) console.log(`[CRON] Pactos expirados penalizados: ${n}`); })
      .catch(err => console.error('[CRON] Error sweeping pacts:', err));
  });
}
// -----------------------

// CORS allowlist: prod origin, Vercel preview deploys, and localhost dev.
// In prod the SPA is same-origin with the API, so requests usually carry no
// Origin header (allowed below); the allowlist guards genuine cross-origin calls.
const allowedOrigins = [
  'https://reppy-weld.vercel.app',
  /\.vercel\.app$/, // preview deployments
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5001',
];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

const corsOptions = {
  origin(origin, callback) {
    // No Origin header => same-origin request, curl, mobile webview, server-to-server.
    if (!origin) return callback(null, true);
    const ok = allowedOrigins.some((o) => (o instanceof RegExp ? o.test(origin) : o === origin));
    return ok ? callback(null, true) : callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      // Realtime (Pusher) + analytics; 'self' covers the same-origin API.
      "connect-src": [
        "'self'",
        "https://*.pusher.com",
        "wss://*.pusher.com",
        "https://sockjs-mt1.pusher.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
      ],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
      // Boss art (arbitrary wikia hosts) and user avatars (Supabase/Google) come
      // from many https origins; allow any https image but block plaintext http.
      "img-src": ["'self'", "data:", "blob:", "https:"],


      "frame-src": ["'self'", "https://accounts.google.com/"],
      "style-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com/gsi/style"],
      "media-src": ["'self'", "https://www.soundjay.com", "https://assets.mixkit.co"]
    },
  },
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Create a main router for all API endpoints to handle optional /api prefix
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/reps', repsRoutes);
apiRouter.use('/social', socialRoutes);
apiRouter.use('/social-feed', socialFeedRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/leaderboard', leaderboardRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/shop', shopRoutes);
apiRouter.use('/boss', bossRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/roulette', rouletteRoutes);
apiRouter.use('/skilltree', skillTreeRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/blog-tracking', blogRoutes);
apiRouter.use('/pvp', pvpRoutes);
apiRouter.use('/challenges', challengeRoutes);
apiRouter.use('/test', testRoutes);
apiRouter.use('/missions', missionsRoutes);
apiRouter.use('/push', pushRoutes);
apiRouter.use('/training', trainingRoutes);
apiRouter.use('/exercises', exercisesRoutes);
apiRouter.use('/streak', streakRoutes);
apiRouter.use('/referral', referralRoutes);
apiRouter.use('/hevy', hevyRoutes);
apiRouter.use('/features', featuresRoutes);
apiRouter.use('/campaign', campaignRoutes);

// Pusher Auth Endpoint — en apiRouter para que funcione con y sin prefijo /api
// (Coolify/Traefik quita el prefijo /api; apiRouter está montado en '/api' y en '/').
apiRouter.post('/pusher/auth', async (req, res) => {
  console.log('[PUSHER AUTH REQUEST RECEIVED] Body:', req.body);
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  
  const userId = String(req.body.user_id || req.query.user_id || 'anonymous-' + Math.random().toString(36).substr(2, 9));
  const userName = req.body.user_name || req.query.user_name || 'Anonymous';
  const avatarUrl = req.body.avatar_url || req.query.avatar_url || '';

  try {
    const getPusher = (await import('./pusher.js')).default;
    const pusher = getPusher();
    if (!pusher) {
      throw new Error('Pusher not initialized. Check environment variables.');
    }
    const auth = pusher.authorizeChannel(socketId, channel, {
      user_id: userId,
      user_info: { name: userName, avatar_url: avatarUrl }
    });
    res.send(auth);
  } catch (error) {
    console.error(`[PUSHER AUTH ERROR]`, error);
    res.status(500).json({ 
      error: error.message, 
      details: 'Error during authorizeChannel'
    });
  }
});

// Health check (within router)
apiRouter.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL || '0'
  });
});

// Ping for presence
apiRouter.post('/test/ping', authenticate, async (req, res) => {
  try {
    const userRes = await query('SELECT name, avatar_url FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length > 0) {
      const fullUser = { ...req.user, ...userRes.rows[0] };
      updatePresence(fullUser);
    } else {
      updatePresence(req.user);
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('[PRESENCE] Ping error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mounting the router at both /api and /
// This ensures that hits to either /api/auth or just /auth (if stripped by Vercel) work.
app.use('/api', apiRouter);
app.use('/', apiRouter);

// --- DYNAMIC SEO BLOG ROUTES (within apiRouter) ---

// 1. Dynamic Sitemap API
apiRouter.get('/sitemap', (req, res) => {
  const BASE_URL = 'https://reppy.romandev.app';
  const today = new Date();
  
  // Only include published posts
  const publishedPosts = blogData.filter(post => new Date(post.date) <= today);
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  const languages = ['es', 'en'];

  // Static Routes
  const staticRoutes = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/contador-dominadas', priority: '0.9', changefreq: 'weekly' },
    { path: '/contador-flexiones', priority: '0.9', changefreq: 'weekly' },
    { path: '/app-calistenia', priority: '0.8', changefreq: 'weekly' },
    { path: '/social', priority: '0.8', changefreq: 'hourly' },
    { path: '/blog', priority: '0.8', changefreq: 'daily' },
  ];

  staticRoutes.forEach(route => {
    languages.forEach(lang => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/${lang}${route.path}</loc>\n`;
      xml += `    <lastmod>${today.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      languages.forEach(altLang => {
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}${route.path}"/>\n`;
      });
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/es${route.path}"/>\n`;
      xml += `  </url>\n`;
    });
  });

  // Dynamic Blog Posts
  publishedPosts.forEach(post => {
    languages.forEach(lang => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/${lang}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(post.date).toISOString()}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      languages.forEach(altLang => {
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}/blog/${post.slug}"/>\n`;
      });
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/es/blog/${post.slug}"/>\n`;
      xml += `  </url>\n`;
    });
  });

  xml += `</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// 2. Legacy Redirects (SEO preservation)
apiRouter.get('/blog/:slug', (req, res, next) => {
  // If it doesn't have a language prefix, redirect to Spanish (default)
  res.redirect(301, `/es/blog/${req.params.slug}`);
});

apiRouter.get('/contador-flexiones', (req, res) => res.redirect(301, '/es/contador-flexiones'));
apiRouter.get('/contador-dominadas', (req, res) => res.redirect(301, '/es/contador-dominadas'));
apiRouter.get('/app-calistenia', (req, res) => res.redirect(301, '/es/app-calistenia'));

// 2. Blog JSON API
apiRouter.get('/blog', (req, res) => {
  const today = new Date();
  const publishedPosts = blogData.filter(post => new Date(post.date) <= today);
  res.json(publishedPosts);
});


// One-off schema setup / re-seed. Schema-mutating, so it is gated behind a
// secret token (DB_INIT_SECRET) supplied via the `x-init-secret` header or
// `?secret=` query param. Without a configured secret the endpoint is disabled.
apiRouter.get('/db/init', async (req, res) => {
  const expected = process.env.DB_INIT_SECRET;
  const provided = req.get('x-init-secret') || req.query.secret;
  if (!expected || provided !== expected) {
    return res.status(404).json({ error: 'Not found' });
  }
  try {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          avatar_url TEXT,
          total_reps INTEGER DEFAULT 0,
          is_private BOOLEAN DEFAULT FALSE,
          daily_goal INTEGER DEFAULT 50,
          body_weight DECIMAL DEFAULT 75.0,
          last_streak_reward_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS reps (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          count INTEGER NOT NULL DEFAULT 0,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          exercise_type VARCHAR(50) DEFAULT 'pullups',
          added_weight DECIMAL DEFAULT 0.0,
          boss_damage_dealt INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, date, exercise_type)
      )`,
      `ALTER TABLE reps ADD COLUMN IF NOT EXISTS boss_damage_dealt INTEGER DEFAULT 0`,
      `ALTER TABLE reps ADD COLUMN IF NOT EXISTS active_multiplier DECIMAL DEFAULT 1.0`,
      `CREATE TABLE IF NOT EXISTS cosmetics (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          type VARCHAR(50) NOT NULL,
          price INTEGER NOT NULL,
          css_value TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS user_inventory (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          cosmetic_id INTEGER REFERENCES cosmetics(id) ON DELETE CASCADE,
          is_new BOOLEAN DEFAULT TRUE,
          acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, cosmetic_id)
      )`,
      `ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT TRUE`,
      `CREATE TABLE IF NOT EXISTS boss_fights (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          total_hp INTEGER NOT NULL,
          current_hp INTEGER NOT NULL,
          start_date TIMESTAMP WITH TIME ZONE NOT NULL,
          end_date TIMESTAMP WITH TIME ZONE NOT NULL,
          status VARCHAR(50) DEFAULT 'active'
      )`,
      `CREATE TABLE IF NOT EXISTS event_participants (
          id SERIAL PRIMARY KEY,
          boss_fight_id INTEGER REFERENCES boss_fights(id) ON DELETE CASCADE,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          damage_dealt INTEGER DEFAULT 0,
          chests_claimed INTEGER DEFAULT 0,
          UNIQUE(boss_fight_id, user_id)
      )`,
      `CREATE TABLE IF NOT EXISTS friendships (
          id SERIAL PRIMARY KEY,
          user_id_1 VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          user_id_2 VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'accepted',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id_1, user_id_2)
      )`,
      `CREATE TABLE IF NOT EXISTS user_read_blogs (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          post_slug VARCHAR(255) NOT NULL,
          read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, post_slug)
      )`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE`,
      // Admin grant is intentionally NOT performed here. Bootstrap an admin with
      // `node backend/scripts/grant_admin.js <email>` instead of via HTTP.
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_boss_damage INTEGER DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_boss_damage_date DATE DEFAULT CURRENT_DATE`,
      `ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS image_url TEXT`,
      // Animated boss clips, stored as *filenames* of locally-hosted videos
      // (served from /public/video): boss_gif = idle loop, boss_damaged = hit
      // reaction. Both optional; the UI falls back to image_url when missing.
      `ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS boss_gif TEXT`,
      `ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS boss_damaged TEXT`,
      `ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0`,
      `ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT FALSE`,
      `UPDATE cosmetics SET is_seasonal = TRUE WHERE name IN ('Aura de Pascua', 'Rabbit Slayer', 'Easter Celebration')`,
      `ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS rarity VARCHAR(50) DEFAULT 'common'`,
      `UPDATE cosmetics SET rarity = 'legendary' WHERE price >= 1200`,
      `UPDATE cosmetics SET rarity = 'epic' WHERE price < 1200 AND price >= 600`,
      `UPDATE cosmetics SET rarity = 'rare' WHERE price < 600 AND price >= 200`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_spin_at TIMESTAMP WITH TIME ZONE`,
      // Daily Roulette cooldown (24h wheel), separate from the 4h last_spin_at.
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_spin_at TIMESTAMP WITH TIME ZONE`,
      // Temporary per-stat consumable buffs: { "str": { "value": 3, "expiry": "<iso>" }, ... }
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS stat_buffs JSONB DEFAULT '{}'::jsonb`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS has_seen_avatar_overhaul BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_streak_reward_date DATE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS push_disabled BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_jackpot_week TEXT`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL`,
      // Mark old bosses as inactive to avoid overlapping
      `UPDATE boss_fights SET status = 'defeated' WHERE order_index = 0 AND status = 'active'`,
      
      // Boss Backlog
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, status, image_url, order_index) 
       SELECT 'Artorias the Abysswalker', 'Se saltó tantos "días de pierna" que acabó caminando por el abismo. Su brazo izquierdo está roto de intentar muscle-ups sin calentar.', GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '100 years', 'active', 'https://static.wikia.nocookie.net/darksouls/images/4/45/Artorias_the_Abysswalker_Render.png', 1
       WHERE NOT EXISTS (SELECT 1 FROM boss_fights WHERE name = 'Artorias the Abysswalker')`,
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, status, image_url, order_index) 
       SELECT 'The Ender Dragon', 'Soberana del Fin y de las dominadas con lastre. Si no haces el rango completo, te lanza un aliento que huele a batido de proteínas caducado.', GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '100 years', 'active', 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/b/be/Ender_Dragon.png', 2
       WHERE NOT EXISTS (SELECT 1 FROM boss_fights WHERE name = 'The Ender Dragon')`,
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, status, image_url, order_index) 
       SELECT 'Rathalos', 'El Rey de los Cielos... y de las dominadas explosivas. Vuela porque no aguanta el peso de su propio ego en la barra.', GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '100 years', 'active', 'https://static.wikia.nocookie.net/monsterhunter/images/d/df/Rathalos-Render.png', 3
       WHERE NOT EXISTS (SELECT 1 FROM boss_fights WHERE name = 'Rathalos')`,
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, status, image_url, order_index) 
       SELECT 'Baldur', 'Bendecido con la invulnerabilidad y maldito con un porcentaje de grasa tan bajo que no siente las agujetas. "No siento nada, ni siquiera el bombeo".', GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '100 years', 'active', 'https://static.wikia.nocookie.net/godofwar/images/6/68/Baldur_GOW.png', 4
       WHERE NOT EXISTS (SELECT 1 FROM boss_fights WHERE name = 'Baldur')`,
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, status, image_url, order_index) 
       SELECT 'Arthas, El Rey Exánime', 'Empuña la Agonía de Escarcha para mantener sus batidos fríos. Su ejército de no-muertos son solo gente que intentó seguir su rutina de 1000 pull-ups.', GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '100 years', 'active', 'https://static.wikia.nocookie.net/wowwiki/images/5/52/Arthas_the_Lich_King.png', 5
       WHERE NOT EXISTS (SELECT 1 FROM boss_fights WHERE name = 'Arthas, El Rey Exánime')`,
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, status, image_url, order_index) 
       SELECT 'Malenia, Espada de Miquella', 'Nunca ha conocido la derrota, ni el descanso entre series. Su técnica secreta es beber creatina pura durante los descansos.', GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '100 years', 'active', 'https://static.wikia.nocookie.net/eldenring/images/3/3b/Malenia_-_Artwork.png', 6
       WHERE NOT EXISTS (SELECT 1 FROM boss_fights WHERE name = 'Malenia, Espada de Miquella')`,
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, status, image_url, order_index) 
       SELECT 'Sephiroth', 'Lleva el pelo tan largo para ocultar que no tiene trapecios. El "Ángel de una Sola Ala" porque el otro dorsal se le desgarró haciendo un Front Lever.', GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '100 years', 'active', 'https://static.wikia.nocookie.net/finalfantasy/images/1/1d/Sephiroth_-_Remake.png', 7
       WHERE NOT EXISTS (SELECT 1 FROM boss_fights WHERE name = 'Sephiroth')`,
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, status, image_url, order_index) 
       SELECT 'Calamity Ganon', 'La maldad pura que asoló Hyrule porque alguien usó su rack de potencia para hacer curls de bíceps.', GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '100 years', 'active', 'https://static.wikia.nocookie.net/zelda_gamepedia/images/4/44/BotW_Calamity_Ganon_Artwork.png', 8
       WHERE NOT EXISTS (SELECT 1 FROM boss_fights WHERE name = 'Calamity Ganon')`,
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, status, image_url, order_index) 
       SELECT 'Diablo', 'Viene a contar tus repeticiones en el gimnasio del infierno. Si no tocas la barbilla en la barra, tu serie no cuenta para el ranking.', GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '100 years', 'active', 'https://static.wikia.nocookie.net/diablo/images/0/05/Diablo_III_Render.png', 9
       WHERE NOT EXISTS (SELECT 1 FROM boss_fights WHERE name = 'Diablo')`,
      `INSERT INTO boss_fights (name, description, total_hp, current_hp, start_date, end_date, status, image_url, order_index) 
       SELECT 'The Nameless King', 'Perdió su nombre en una apuesta sobre quién aguantaba más en plancha isométrica sobre un dragón de tormenta.', GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), GREATEST(10000, (SELECT COUNT(*) * 25 FROM users)), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '100 years', 'active', 'https://static.wikia.nocookie.net/darksouls/images/d/d4/The_Nameless_King_Render.png', 10
       WHERE NOT EXISTS (SELECT 1 FROM boss_fights WHERE name = 'The Nameless King')`,
      
      // Update descriptions in case they already exist
      `UPDATE boss_fights SET description = 'Se saltó tantos "días de pierna" que acabó caminando por el abismo. Su brazo izquierdo está roto de intentar muscle-ups sin calentar.' WHERE name = 'Artorias the Abysswalker'`,
      `UPDATE boss_fights SET description = 'Soberana del Fin y de las dominadas con lastre. Si no haces el rango completo, te lanza un aliento que huele a batido de proteínas caducado.' WHERE name = 'The Ender Dragon'`,
      `UPDATE boss_fights SET description = 'El Rey de los Cielos... y de las dominadas explosivas. Vuela porque no aguanta el peso de su propio ego en la barra.' WHERE name = 'Rathalos'`,
      `UPDATE boss_fights SET description = 'Bendecido con la invulnerabilidad y maldito con un porcentaje de grasa tan bajo que no siente las agujetas. "No siento nada, ni siquiera el bombeo".' WHERE name = 'Baldur'`,
      `UPDATE boss_fights SET description = 'Empuña la Agonía de Escarcha para mantener sus batidos fríos. Su ejército de no-muertos son solo gente que intentó seguir su rutina de 1000 pull-ups.' WHERE name = 'Arthas, El Rey Exánime'`,
      `UPDATE boss_fights SET description = 'Nunca ha conocido la derrota, ni el descanso entre series. Su técnica secreta es beber creatina pura durante los descansos.' WHERE name = 'Malenia, Espada de Miquella'`,
      `UPDATE boss_fights SET description = 'Lleva el pelo tan largo para ocultar que no tiene trapecios. El "Ángel de una Sola Ala" porque el otro dorsal se le desgarró haciendo un Front Lever.' WHERE name = 'Sephiroth'`,
      `UPDATE boss_fights SET description = 'La maldad pura que asoló Hyrule porque alguien usó su rack de potencia para hacer curls de bíceps.' WHERE name = 'Calamity Ganon'`,
      `UPDATE boss_fights SET description = 'Viene a contar tus repeticiones en el gimnasio del infierno. Si no tocas la barbilla en la barra, tu serie no cuenta para el ranking.' WHERE name = 'Diablo'`,
      `UPDATE boss_fights SET description = 'Perdió su nombre en una apuesta sobre quién aguantaba más en plancha isométrica sobre un dragón de tormenta.' WHERE name = 'The Nameless King'`,
      
      // CS2 Titles
      `INSERT INTO cosmetics (name, description, type, price, css_value) 
       SELECT 'Plata 2', 'El inicio de un largo camino. Al menos no estás en Plata 1.', 'title', 150, 'color: #a0a0a0; font-weight: bold;'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Plata 2')`,
      `INSERT INTO cosmetics (name, description, type, price, css_value) 
       SELECT 'Nova de Oro 4', 'Ya empiezas a entender cómo funciona esto. Un rango con prestigio.', 'title', 450, 'color: #ffd700; font-weight: bold; text-shadow: 0 0 5px rgba(255,215,0,0.5);'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Nova de Oro 4')`,
      
      // SEASONAL LEGENDARY SETS
      // 1. Void Mana
      `INSERT INTO cosmetics (name, description, type, price, css_value, is_seasonal, rarity) 
       SELECT 'Arcane Master', 'Portador del flujo eterno del mana.', 'title', 2500, 'title-mana', true, 'legendary'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Arcane Master')`,
      `INSERT INTO cosmetics (name, description, type, price, css_value, is_seasonal, rarity) 
       SELECT 'Mana Surge', 'Energía arcana fluyendo por tu avatar.', 'border', 2500, 'frame-mana', true, 'legendary'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Mana Surge')`,
      `INSERT INTO cosmetics (name, description, type, price, css_value, is_seasonal, rarity) 
       SELECT 'Abyssal Portal', 'Un vistazo al abismo infinito.', 'background', 2500, 'bg-mana', true, 'legendary'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Abyssal Portal')`,

      // 2. Infernal Soul
      `INSERT INTO cosmetics (name, description, type, price, css_value, is_seasonal, rarity) 
       SELECT 'Dragonborn', 'Sangre de dragón corre por tus venas.', 'title', 2500, 'title-lava', true, 'legendary'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Dragonborn')`,
      `INSERT INTO cosmetics (name, description, type, price, css_value, is_seasonal, rarity) 
       SELECT 'Lava Core', 'Forjado en el corazón de un volcán.', 'border', 2500, 'frame-lava', true, 'legendary'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Lava Core')`,
      `INSERT INTO cosmetics (name, description, type, price, css_value, is_seasonal, rarity) 
       SELECT 'Inferno', 'El mundo arde a tu alrededor.', 'background', 2500, 'bg-lava', true, 'legendary'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Inferno')`,

      // 3. Chronos Glitch
      `INSERT INTO cosmetics (name, description, type, price, css_value, is_seasonal, rarity) 
       SELECT 'Synthetix', 'Tu realidad se está fragmentando.', 'title', 2500, 'title-glitch', true, 'legendary'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Synthetix')`,
      `INSERT INTO cosmetics (name, description, type, price, css_value, is_seasonal, rarity) 
       SELECT 'Prismatic Aura', 'Distorsión cromática de alta velocidad.', 'border', 2500, 'frame-prismatic', true, 'legendary'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Prismatic Aura')`,
      `INSERT INTO cosmetics (name, description, type, price, css_value, is_seasonal, rarity) 
       SELECT 'Digital Storm', 'Tormenta de datos encriptados.', 'background', 2500, 'bg-glitch', true, 'legendary'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Digital Storm')`,
      
      `CREATE TABLE IF NOT EXISTS daily_summaries (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          title VARCHAR(255),
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, date)
      )`,
      `CREATE TABLE IF NOT EXISTS streak_freezes (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          freeze_date DATE NOT NULL,
          spent_coins INTEGER NOT NULL DEFAULT 250,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, freeze_date)
      )`,
      `CREATE INDEX IF NOT EXISTS idx_streak_freezes_user_date ON streak_freezes(user_id, freeze_date)`,
      `CREATE TABLE IF NOT EXISTS summary_interactions (
          id SERIAL PRIMARY KEY,
          summary_id INTEGER REFERENCES daily_summaries(id) ON DELETE CASCADE,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          content TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS boss_kill_posts (
          id SERIAL PRIMARY KEY,
          boss_fight_id INTEGER REFERENCES boss_fights(id) ON DELETE CASCADE,
          boss_name VARCHAR(255),
          boss_image TEXT,
          killer_user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
          killer_name VARCHAR(255),
          top3 JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(boss_fight_id)
      )`,
      `CREATE INDEX IF NOT EXISTS idx_boss_kill_posts_created ON boss_kill_posts(created_at DESC)`,
      // Hot status/interaction scans (issue #265).
      `CREATE INDEX IF NOT EXISTS idx_summary_interactions_summary_type ON summary_interactions(summary_id, type)`,
      `CREATE INDEX IF NOT EXISTS idx_pvp_fights_status ON pvp_fights(status)`,
      `CREATE INDEX IF NOT EXISTS idx_async_challenges_status ON async_challenges(status)`,
      `CREATE INDEX IF NOT EXISTS idx_reps_user_date ON reps(user_id, date)`,
      `CREATE INDEX IF NOT EXISTS idx_summaries_user_date ON daily_summaries(user_id, date)`,
      `CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(user_id_1, user_id_2)`,
      `CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id)`,
      `CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        actor_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        content TEXT,
        target_id VARCHAR(255),
        target_user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      // Per-user "feature seen" flags (NEW badges/dots)
      `CREATE TABLE IF NOT EXISTS user_feature_seen (
        user_id     VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        feature_key VARCHAR(64) NOT NULL,
        seen_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, feature_key)
      )`,
      // Post Backgrounds Sync
      `INSERT INTO items (name, description, type, price, css_value, rarity) 
       VALUES ('Carbon Scan', 'Textura de carbono oscuro con línea de escaneo láser.', 'post_background', 1111, 'post-bg-carbon', 'rare')
       ON CONFLICT (name) DO UPDATE SET rarity = EXCLUDED.rarity`,
      `INSERT INTO items (name, description, type, price, css_value, rarity) 
       VALUES ('Neon Pulse', 'Borde de neón con pulso reactivo.', 'post_background', 2222, 'post-bg-neon', 'especial')
       ON CONFLICT (name) DO UPDATE SET rarity = EXCLUDED.rarity`,
      `INSERT INTO items (name, description, type, price, css_value, rarity) 
       VALUES ('Matrix Rain', '¿Ves el código? Lluvia de datos digital.', 'post_background', 3333, 'post-bg-matrix', 'legendary')
       ON CONFLICT (name) DO UPDATE SET rarity = EXCLUDED.rarity`,
      `INSERT INTO items (name, description, type, price, css_value, rarity) 
       VALUES ('Inferno Core', 'Calor extremo y brasas ascendentes.', 'post_background', 4444, 'post-bg-inferno', 'legendary')
       ON CONFLICT (name) DO UPDATE SET rarity = EXCLUDED.rarity`,
      `INSERT INTO items (name, description, type, price, css_value, rarity) 
       VALUES ('Void Gravity', 'Punto de no retorno gravitacional.', 'post_background', 5555, 'post-bg-void', 'calistenico')
       ON CONFLICT (name) DO UPDATE SET rarity = EXCLUDED.rarity`,
      `INSERT INTO items (name, description, type, price, css_value, rarity) 
       VALUES ('Calisthenics Legend', 'El rango máximo de la disciplina pura.', 'title', 9999, 'title-calistenico', 'calistenico')
       ON CONFLICT (name) DO UPDATE SET rarity = EXCLUDED.rarity`,
       
      // RPG ITEMS SEEDING (One per rarity)
      `INSERT INTO items (name, description, type, rarity, stats) 
       VALUES ('Harrapos de Entrenamiento', 'Ropa vieja pero funcional para empezar.', 'armor', 'common', '{"end": 1}')
       ON CONFLICT (name) DO UPDATE SET rarity = EXCLUDED.rarity, stats = EXCLUDED.stats`,
      `INSERT INTO items (name, description, type, rarity, stats) 
       VALUES ('Maza de Hierro', 'Pesada y contundente.', 'weapon', 'rare', '{"str": 3}')
       ON CONFLICT (name) DO UPDATE SET rarity = EXCLUDED.rarity, stats = EXCLUDED.stats`,
      `INSERT INTO items (name, description, type, rarity, stats) 
       VALUES ('Casco de Élite', 'Protección avanzada para guerreros experimentados.', 'head', 'especial', '{"end": 5, "vig": 2}')
       ON CONFLICT (name) DO UPDATE SET rarity = EXCLUDED.rarity, stats = EXCLUDED.stats`,
      `INSERT INTO items (name, description, type, rarity, stats) 
       VALUES ('Espada de Dragón', 'Forjada con fuego eterno.', 'weapon', 'legendary', '{"str": 10, "dex": 5}')
       ON CONFLICT (name) DO UPDATE SET rarity = EXCLUDED.rarity, stats = EXCLUDED.stats`,
      `INSERT INTO items (name, description, type, rarity, stats)
       VALUES ('Armadura del Dios Calisténico', 'La culminación del entrenamiento físico.', 'armor', 'calistenico', '{"str": 20, "end": 20, "vig": 20}')
       ON CONFLICT (name) DO UPDATE SET rarity = EXCLUDED.rarity, stats = EXCLUDED.stats`,

      // Referral system
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(255) REFERENCES users(id)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_reward_given BOOLEAN DEFAULT FALSE`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code) WHERE referral_code IS NOT NULL`,
      `CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by)`,

      // Custom (user-created) training plans: NULL owner = predefined/global plan
      `ALTER TABLE training_plans ADD COLUMN IF NOT EXISTS owner_user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE`,
      `ALTER TABLE training_plans ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE`,
      `CREATE INDEX IF NOT EXISTS idx_training_plans_owner ON training_plans(owner_user_id)`
    ];
    
    for (const q of queries) {
      await query(q);
    }
    
    res.json({ message: 'Database initialized successfully! You can now log in.' });
  } catch (error) {
    console.error('Database initialization failed:', error);
    res.status(500).json({ error: 'Database initialization failed', detail: error.message });
  }
});

// Root welcome route
apiRouter.get('/', (req, res) => {
  res.json({ message: 'Reppy API is running' });
});

// Root welcome route (redundant for safety)
app.get('/', (req, res) => {
  res.json({ message: 'Reppy API is running' });
});

async function ensureAllTrainingExercisesExist() {
  try {
    const blocksRes = await query('SELECT DISTINCT exercise_type FROM training_plan_blocks WHERE exercise_type IS NOT NULL');
    const existingExercisesRes = await query('SELECT slug FROM exercises');
    const existingSlugs = new Set(existingExercisesRes.rows.map(r => r.slug));

    for (const row of blocksRes.rows) {
      const slug = row.exercise_type;
      if (!existingSlugs.has(slug)) {
        console.log(`[Startup check] Inserting missing exercise for training plan: ${slug}`);
        await query(
          `INSERT INTO exercises (slug, title_key, description_key, unit, difficulty_multiplier, coin_multiplier, is_active)
           VALUES ($1, $2, $3, 'reps', 1.0, 1.0, TRUE)
           ON CONFLICT (slug) DO NOTHING`,
          [slug, slug, `Ejercicio de entrenamiento: ${slug}`]
        );
      }
    }
    console.log('[Startup check] All distinct exercises used in training plans verified/created.');
  } catch (err) {
    console.error('[Startup check] Failed to check training exercises:', err);
  }
}

// Lightweight, idempotent schema migrations run on every startup. Unlike the
// heavy /db/init endpoint, this only ensures columns that newer code depends on
// exist, so the app never queries a column that isn't there yet.
async function ensureSchemaMigrations() {
  try {
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_spin_at TIMESTAMP WITH TIME ZONE');
    // Per-user "feature seen" flags that drive the NEW badges/dots.
    await query(`CREATE TABLE IF NOT EXISTS user_feature_seen (
        user_id     VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        feature_key VARCHAR(64) NOT NULL,
        seen_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, feature_key)
    )`);
    // Indexes for hot status/interaction scans (issue #265).
    await query("CREATE INDEX IF NOT EXISTS idx_summary_interactions_summary_type ON summary_interactions(summary_id, type)");
    await query("CREATE INDEX IF NOT EXISTS idx_pvp_fights_status ON pvp_fights(status)");
    await query("CREATE INDEX IF NOT EXISTS idx_async_challenges_status ON async_challenges(status)");
    console.log('[Startup migration] Schema migrations applied.');
  } catch (err) {
    console.error('[Startup migration] Failed to apply schema migrations:', err);
  }
}

// Start server unless running as a Vercel serverless function (which imports
// this module without ever calling listen()).
if (process.env.VERCEL !== '1') {
  Promise.all([ensureSchemaMigrations(), ensureAllTrainingExercisesExist()]).then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('SERVER_ERROR:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

export default app;

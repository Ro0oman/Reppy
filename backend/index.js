import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// 1. Initialize environment variables first
dotenv.config();

import authRoutes from './auth.js';
import repsRoutes from './reps.js';
import socialRoutes from './social.js';
import leaderboardRoutes from './leaderboard.js';
import usersRoutes from './users.js';
import shopRoutes from './shop.js';
import bossRoutes from './boss.js';
import profileRoutes from './profile.js';
import rouletteRoutes from './roulette.js';
import socialFeedRoutes from './social_feed.js';
import notificationRoutes from './notifications.js';
import { query } from './db.js';
import { blogData } from './blogData.js';
import adminRoutes from './admin.js';
import blogRoutes from './blog.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "connect-src": ["'self'", "https://*.google-analytics.com", "https://www.google-analytics.com", "https://accounts.google.com"],
      "script-src": ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
      "img-src": ["'self'", "data:", "https://www.google-analytics.com", "https://www.googletagmanager.com", "https://static.wikia.nocookie.net", "https://*.wikia.nocookie.net", "https://ssb.wiki.gallery", "https://*.wiki.gallery", "https://ui-avatars.com", "https://images.unsplash.com", "https://fbi.cults3d.com", "https://i.redd.it", "https://www.vhv.rs", "https://lh3.googleusercontent.com", "*"],
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
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/blog-tracking', blogRoutes);

// Health check (within router)
apiRouter.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL || '0'
  });
});

// Mounting the router at both /api and /
// This ensures that hits to either /api/auth or just /auth (if stripped by Vercel) work.
app.use('/api', apiRouter);
app.use('/', apiRouter);

// --- DYNAMIC SEO BLOG ROUTES (within apiRouter) ---

// 1. Dynamic Sitemap API
apiRouter.get('/sitemap', (req, res) => {
  const BASE_URL = 'https://reppy-weld.vercel.app';
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


// Automated DB initialization for the user
// Automated DB initialization for the user
apiRouter.get('/db/init', async (req, res) => {
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
      `UPDATE users SET is_admin = TRUE WHERE email = 'romainot99@gmail.com'`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_boss_damage INTEGER DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_boss_damage_date DATE DEFAULT CURRENT_DATE`,
      `ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS image_url TEXT`,
      `ALTER TABLE boss_fights ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0`,
      `ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT FALSE`,
      `UPDATE cosmetics SET is_seasonal = TRUE WHERE name IN ('Aura de Pascua', 'Rabbit Slayer', 'Easter Celebration')`,
      `ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS rarity VARCHAR(50) DEFAULT 'common'`,
      `UPDATE cosmetics SET rarity = 'legendary' WHERE price >= 1200`,
      `UPDATE cosmetics SET rarity = 'epic' WHERE price < 1200 AND price >= 600`,
      `UPDATE cosmetics SET rarity = 'rare' WHERE price < 600 AND price >= 200`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_spin_at TIMESTAMP WITH TIME ZONE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS has_seen_avatar_overhaul BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_streak_reward_date DATE`,
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
      `CREATE TABLE IF NOT EXISTS summary_interactions (
          id SERIAL PRIMARY KEY,
          summary_id INTEGER REFERENCES daily_summaries(id) ON DELETE CASCADE,
          user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          content TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
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
      // Post Backgrounds Sync
      `INSERT INTO cosmetics (name, description, type, price, css_value, rarity) 
       SELECT 'Carbon Scan', 'Textura de carbono oscuro con línea de escaneo láser.', 'post_background', 1111, 'post-bg-carbon', 'rare'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Carbon Scan')`,
      `INSERT INTO cosmetics (name, description, type, price, css_value, rarity) 
       SELECT 'Neon Pulse', 'Borde de neón con pulso reactivo.', 'post_background', 2222, 'post-bg-neon', 'epic'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Neon Pulse')`,
      `INSERT INTO cosmetics (name, description, type, price, css_value, rarity) 
       SELECT 'Matrix Rain', '¿Ves el código? Lluvia de datos digital.', 'post_background', 3333, 'post-bg-matrix', 'legendary'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Matrix Rain')`,
      `INSERT INTO cosmetics (name, description, type, price, css_value, rarity) 
       SELECT 'Inferno Core', 'Calor extremo y brasas ascendentes.', 'post_background', 4444, 'post-bg-inferno', 'legendary'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Inferno Core')`,
      `INSERT INTO cosmetics (name, description, type, price, css_value, rarity) 
       SELECT 'Void Gravity', 'Punto de no retorno gravitacional.', 'post_background', 5555, 'post-bg-void', 'legendary'
       WHERE NOT EXISTS (SELECT 1 FROM cosmetics WHERE name = 'Void Gravity')`
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

// Start server only in development or if not imported as a module
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
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

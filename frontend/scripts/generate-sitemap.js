import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogPostsPath = path.resolve(__dirname, '../src/blogPosts.json');
const publicDir = path.resolve(__dirname, '../public');

const blogPosts = JSON.parse(fs.readFileSync(blogPostsPath, 'utf8'));

const BASE_URL = 'https://reppy.romandev.app';
const lastmod = new Date().toISOString();
const today = new Date();

// Exclude QA/test accounts from the public athletes sitemap.
// Keep in sync with the same filter in vite.config.js (SSG prerender).
const isTestAthlete = (username) => {
  const u = (username || '').toLowerCase();
  return /^guided-test-\d+$/.test(u) || ['roman-test', 'test-user', 'tester', 'test'].includes(u);
};

// Per-language slug map: { es, en, priority, changefreq }
// "en" key absent = English uses the same slug as Spanish
const staticRoutes = [
  { es: '',                              en: '',                              priority: '1.0', changefreq: 'daily'   },
  { es: '/app-dominadas',               en: '/pull-up-app',                  priority: '0.8', changefreq: 'weekly'  },
  { es: '/app-flexiones',               en: '/push-up-app',                  priority: '0.8', changefreq: 'weekly'  },
  { es: '/app-calistenia',              en: '/calisthenics-app',             priority: '0.8', changefreq: 'weekly'  },
  { es: '/contador-dominadas',          en: '/pull-up-counter',              priority: '0.7', changefreq: 'weekly'  },
  { es: '/contador-flexiones',          en: '/push-up-counter',              priority: '0.7', changefreq: 'weekly'  },
  { es: '/app-fondos',                  en: '/dips-app',                     priority: '0.7', changefreq: 'weekly'  },
  { es: '/contador-fondos',             en: '/dips-counter',                 priority: '0.7', changefreq: 'weekly'  },
  { es: '/contador-muscle-ups',         en: '/muscle-up-counter',            priority: '0.7', changefreq: 'weekly'  },
  { es: '/contador-dominadas-supinas',  en: '/chin-up-counter',              priority: '0.7', changefreq: 'weekly'  },
  { es: '/reto-calistenia-30-dias',     en: '/30-day-calisthenics-challenge',priority: '0.7', changefreq: 'weekly'  },
  { es: '/reppy-vs-otras-apps-calistenia', en: '/reppy-vs-calisthenics-apps',priority: '0.7', changefreq: 'monthly' },
  { en: '/free-rpg-pull-up-counter',    priority: '0.8', changefreq: 'weekly',  langs: ['en'] },
  { es: '/social',                      en: '/social',                       priority: '0.6', changefreq: 'hourly'  },
  { es: '/blog',                        en: '/blog',                         priority: '0.6', changefreq: 'daily'   },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const urlEntry = ({ loc, lastmod, changefreq, priority, esHref, enHref }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="es" href="${esHref}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enHref}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${esHref}" />
  </url>\n`;

const urlsetOpen = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
const urlsetClose = `</urlset>`;

// ── Build pages sitemap ───────────────────────────────────────────────────────

const buildPagesSitemap = () => {
  let xml = urlsetOpen;

  for (const route of staticRoutes) {
    const langs = route.langs || ['es', 'en'];

    if (langs.includes('es') && langs.includes('en')) {
      const esPath = route.es ?? '';
      const enPath = route.en ?? route.es ?? '';
      const esHref = `${BASE_URL}/es${esPath}`;
      const enHref = `${BASE_URL}/en${enPath}`;

      // ES entry
      xml += urlEntry({ loc: esHref, lastmod, changefreq: route.changefreq, priority: route.priority, esHref, enHref });
      // EN entry
      xml += urlEntry({ loc: enHref, lastmod, changefreq: route.changefreq, priority: route.priority, esHref, enHref });

    } else if (langs.includes('en')) {
      // English-only (e.g. /free-rpg-pull-up-counter)
      const enPath = route.en ?? '';
      const enHref = `${BASE_URL}/en${enPath}`;
      xml += `  <url>
    <loc>${enHref}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enHref}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enHref}" />
  </url>\n`;
    }
  }

  xml += urlsetClose;
  return xml;
};

// ── Build blog sitemap ────────────────────────────────────────────────────────

const buildBlogSitemap = () => {
  let xml = urlsetOpen;

  const seenSlugs = new Set();
  const publishedPosts = blogPosts
    .filter(p => p?.slug)
    .filter(p => {
      if (!p.date) return true;
      const d = new Date(p.date);
      return !Number.isNaN(d.getTime()) && d <= today;
    })
    .sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      if (da !== db) return db - da;
      return String(a.slug).localeCompare(String(b.slug));
    });

  for (const post of publishedPosts) {
    if (seenSlugs.has(post.slug)) continue;
    seenSlugs.add(post.slug);
    const postLastmod = post.date ? new Date(post.date).toISOString() : lastmod;
    const esHref = `${BASE_URL}/es/blog/${post.slug}`;
    const enHref = `${BASE_URL}/en/blog/${post.slug}`;
    // Pillar posts are the cornerstone content — rank them higher and crawl them more often
    const priority = post.isPillar ? '0.8' : '0.5';
    const changefreq = post.isPillar ? 'weekly' : 'monthly';
    xml += urlEntry({ loc: esHref, lastmod: postLastmod, changefreq, priority, esHref, enHref });
    xml += urlEntry({ loc: enHref, lastmod: postLastmod, changefreq, priority, esHref, enHref });
  }

  xml += urlsetClose;
  return xml;
};


// ── Build athletes sitemap ────────────────────────────────────────────────────

// Returns { xml, count }. count === 0 means we should NOT emit/reference the
// athletes sitemap — Google rejects an empty <urlset> as "missing XML tag".
const buildAthletesSitemap = async () => {
  let xml = urlsetOpen;
  let count = 0;

  try {
    // Default to the live site's API so the production build can actually
    // populate the sitemap; localhost is only reachable during local dev.
    const apiBase = process.env.VITE_API_URL || BASE_URL;
    const res = await fetch(`${apiBase}/api/profile/top-public?limit=100`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const users = await res.json();

    for (const user of users) {
      if (!user.username || isTestAthlete(user.username)) continue;
      const esHref = `${BASE_URL}/es/atleta/${user.username}`;
      const enHref = `${BASE_URL}/en/athlete/${user.username}`;
      xml += urlEntry({ loc: esHref, lastmod, changefreq: 'weekly', priority: '0.6', esHref, enHref });
      xml += urlEntry({ loc: enHref, lastmod, changefreq: 'weekly', priority: '0.6', esHref, enHref });
      count++;
    }
    console.log(`[SEO] ${count} athlete profiles added to sitemap`);
  } catch (e) {
    console.warn('[SEO] Could not fetch athletes for sitemap:', e.message);
  }

  xml += urlsetClose;
  return { xml, count };
};

// ── Build sitemap index ───────────────────────────────────────────────────────

const sitemapEntry = (name) => `  <sitemap>
    <loc>${BASE_URL}/${name}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;

const buildSitemapIndex = ({ includeAthletes }) => {
  const entries = [
    sitemapEntry('sitemap-pages.xml'),
    sitemapEntry('sitemap-blog.xml'),
  ];
  if (includeAthletes) entries.push(sitemapEntry('sitemap-athletes.xml'));

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</sitemapindex>`;
};

// ── Write files ───────────────────────────────────────────────────────────────

try {
  const { xml: athletesSitemap, count: athletesCount } = await buildAthletesSitemap();
  const includeAthletes = athletesCount > 0;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'),       buildSitemapIndex({ includeAthletes }));
  fs.writeFileSync(path.join(publicDir, 'sitemap-pages.xml'), buildPagesSitemap());
  fs.writeFileSync(path.join(publicDir, 'sitemap-blog.xml'),  buildBlogSitemap());

  const athletesPath = path.join(publicDir, 'sitemap-athletes.xml');
  if (includeAthletes) {
    fs.writeFileSync(athletesPath, athletesSitemap);
  } else {
    // Don't ship an empty <urlset> — Google flags it as "missing XML tag".
    // Remove any stale file so the index (which omits it) stays consistent.
    if (fs.existsSync(athletesPath)) fs.rmSync(athletesPath);
    console.warn('[SEO] No athlete profiles available — athletes sitemap omitted from index');
  }
  console.log(`🚀 [SEO] Sitemap index + pages + blog${includeAthletes ? ' + athletes' : ''} generated in public/`);
} catch (err) {
  console.error('❌ [SEO] Failed to generate sitemaps:', err.message);
  process.exit(1);
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogPostsPath = path.resolve(__dirname, '../src/blogPosts.json');
const sitemapOutputPath = path.resolve(__dirname, '../public/sitemap.xml');

const blogPosts = JSON.parse(fs.readFileSync(blogPostsPath, 'utf8'));

const BASE_URL = 'https://reppy-weld.vercel.app';
const lastmod = new Date().toISOString();
const languages = ['es', 'en'];
const today = new Date();

const staticRoutes = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/contador-dominadas', priority: '0.9', changefreq: 'weekly' },
  { path: '/contador-flexiones', priority: '0.9', changefreq: 'weekly' },
  { path: '/app-calistenia', priority: '0.8', changefreq: 'weekly' },
  { path: '/app-dominadas', priority: '0.9', changefreq: 'weekly' },
  { path: '/app-flexiones', priority: '0.9', changefreq: 'weekly' },
  { path: '/app-fondos', priority: '0.8', changefreq: 'weekly' },
  { path: '/reto-calistenia-30-dias', priority: '0.9', changefreq: 'weekly' },
  { path: '/reppy-vs-otras-apps-calistenia', priority: '0.8', changefreq: 'monthly' },
  { path: '/free-rpg-pull-up-counter', priority: '0.9', changefreq: 'weekly', languages: ['en'] },
  { path: '/social', priority: '0.8', changefreq: 'hourly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
];

const generateSitemap = () => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  // Helper to add a URL with its alternates
  const addUrl = (path, priority, changefreq, customLastmod = lastmod, routeLanguages = languages) => {
    routeLanguages.forEach(lang => {
      const fullPath = `/${lang}${path}`;
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${fullPath}</loc>\n`;
      xml += `    <lastmod>${customLastmod}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      
      // Hreflang alternates
      routeLanguages.forEach(altLang => {
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}${path}" />\n`;
      });
      const defaultLang = routeLanguages.includes('es') ? 'es' : routeLanguages[0];
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/${defaultLang}${path}" />\n`;
      
      xml += `  </url>\n`;
    });
  };

  // 1. Static Routes
  staticRoutes.forEach(route => {
    addUrl(route.path, route.priority, route.changefreq, lastmod, route.languages || languages);
  });

  // 2. Dynamic Blog Posts
  // - Exclude future-dated posts (not yet published)
  // - Deduplicate slugs to avoid duplicate URLs
  // - Sort for deterministic output (stable diffing and crawlers)
  const seenSlugs = new Set();
  const publishedPosts = blogPosts
    .filter((post) => post?.slug)
    .filter((post) => {
      if (!post.date) return true;
      const postDate = new Date(post.date);
      return !Number.isNaN(postDate.getTime()) && postDate <= today;
    })
    .sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      if (da !== db) return db - da;
      return String(a.slug).localeCompare(String(b.slug));
    });

  publishedPosts.forEach((post) => {
    if (seenSlugs.has(post.slug)) return;
    seenSlugs.add(post.slug);
    const postLastmod = post.date ? new Date(post.date).toISOString() : lastmod;
    addUrl(`/blog/${post.slug}`, '0.7', 'monthly', postLastmod);
  });

  xml += `</urlset>`;

  try {
    fs.writeFileSync(sitemapOutputPath, xml);
    console.log('🚀 [SEO] Sitemap generated successfully with i18n support in public/sitemap.xml');
  } catch (err) {
    console.error('❌ [SEO] Failed to generate sitemap:', err.message);
    process.exit(1);
  }
};

generateSitemap();


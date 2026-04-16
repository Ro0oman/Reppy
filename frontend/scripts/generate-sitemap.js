import fs from 'fs';
const blogPosts = JSON.parse(fs.readFileSync('./src/blogPosts.json', 'utf8'));

const BASE_URL = 'https://reppy-weld.vercel.app';
const lastmod = new Date().toISOString();

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/contador-dominadas', priority: '0.9', changefreq: 'weekly' },
  { path: '/contador-flexiones', priority: '0.9', changefreq: 'weekly' },
  { path: '/app-calistenia', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
];

const generateSitemap = () => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Static Routes
  staticRoutes.forEach(route => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // 2. Dynamic Blog Posts (PRO mapping)
  blogPosts.forEach(post => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/blog/${post.slug}</loc>\n`;
    xml += `    <lastmod>${post.date ? new Date(post.date).toISOString() : lastmod}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  try {
    fs.writeFileSync('./public/sitemap.xml', xml);
    console.log('🚀 [SEO] Sitemap generated successfully in public/sitemap.xml');
  } catch (err) {
    console.error('❌ [SEO] Failed to generate sitemap:', err.message);
    process.exit(1);
  }
};

generateSitemap();

import fs from 'fs';
const blogPosts = JSON.parse(fs.readFileSync('./src/blogPosts.json', 'utf8'));

const BASE_URL = 'https://reppy-weld.vercel.app';
const lastmod = new Date().toISOString();
const languages = ['es', 'en'];

const staticRoutes = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/contador-dominadas', priority: '0.9', changefreq: 'weekly' },
  { path: '/contador-flexiones', priority: '0.9', changefreq: 'weekly' },
  { path: '/app-calistenia', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
];

const generateSitemap = () => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  // Helper to add a URL with its alternates
  const addUrl = (path, priority, changefreq, customLastmod = lastmod) => {
    languages.forEach(lang => {
      const fullPath = `/${lang}${path}`;
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${fullPath}</loc>\n`;
      xml += `    <lastmod>${customLastmod}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      
      // Hreflang alternates
      languages.forEach(altLang => {
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}${path}" />\n`;
      });
      // x-default (pointing to es as default)
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/es${path}" />\n`;
      
      xml += `  </url>\n`;
    });
  };

  // 1. Static Routes
  staticRoutes.forEach(route => {
    addUrl(route.path, route.priority, route.changefreq);
  });

  // 2. Dynamic Blog Posts
  blogPosts.forEach(post => {
    const postLastmod = post.date ? new Date(post.date).toISOString() : lastmod;
    addUrl(`/blog/${post.slug}`, '0.7', 'monthly', postLastmod);
  });

  xml += `</urlset>`;

  try {
    fs.writeFileSync('./public/sitemap.xml', xml);
    console.log('🚀 [SEO] Sitemap generated successfully with i18n support in public/sitemap.xml');
  } catch (err) {
    console.error('❌ [SEO] Failed to generate sitemap:', err.message);
    process.exit(1);
  }
};

generateSitemap();


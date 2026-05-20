import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const BASE_URL = 'https://reppy-weld.vercel.app';

const routeForHtml = (filePath) => {
  const relative = path.relative(distDir, filePath).replace(/\\/g, '/');
  if (relative === 'index.html') return '/es';
  if (relative === 'es.html') return '/es';
  if (relative === 'en.html') return '/en';
  return `/${relative.replace(/\.html$/, '')}`;
};

const localizedSibling = (route, lang) => {
  if (route === '/es' || route === '/en') return `/${lang}`;
  return route.replace(/^\/(es|en)/, `/${lang}`);
};

const replaceAttribute = (html, selector, value) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(<[^>]*${escapedSelector}[^>]*(?:href|content)=)["'][^"']*["']`, 'i');
  return html.replace(pattern, `$1"${value}"`);
};

const metaForRoute = (route, lang) => {
  const isEnglish = lang === 'en';

  if (route.endsWith('/social')) {
    return {
      title: isEnglish ? 'Social Fitness Feed | Reppy' : 'Feed social fitness | Reppy',
      description: isEnglish
        ? 'Explore public Reppy routines, workout posts, athlete profiles, and community rankings before creating an account.'
        : 'Explora rutinas publicas, entrenamientos, perfiles de atletas y rankings de la comunidad Reppy antes de crear una cuenta.'
    };
  }

  if (route === '/en' || route === '/es') {
    return {
      title: isEnglish ? 'Reppy | Gamify Your Calisthenics' : 'Reppy | Gamifica tu Calistenia',
      description: isEnglish
        ? 'Turn bodyweight training into RPG progress. Track pull-ups, push-ups and dips, earn Reppy Coins, level up, and join community boss fights.'
        : 'Convierte tu esfuerzo fisico en progreso RPG. Registra dominadas, flexiones y fondos para subir niveles, ganar Reppy Coins y derrotar bosses epicos con la comunidad.'
    };
  }

  return null;
};

const patchHtml = (filePath) => {
  const route = routeForHtml(filePath);
  const lang = route.startsWith('/en') ? 'en' : 'es';
  const canonicalUrl = `${BASE_URL}${route}`;
  const esUrl = `${BASE_URL}${localizedSibling(route, 'es')}`;
  const enUrl = `${BASE_URL}${localizedSibling(route, 'en')}`;
  const routeMeta = metaForRoute(route, lang);

  let html = fs.readFileSync(filePath, 'utf8');

  html = html.replace(/<html lang="[^"]*"/i, `<html lang="${lang}"`);
  html = replaceAttribute(html, 'rel="canonical"', canonicalUrl);
  html = replaceAttribute(html, 'hreflang="es"', esUrl);
  html = replaceAttribute(html, 'hreflang="en"', enUrl);
  html = replaceAttribute(html, 'hreflang="x-default"', esUrl);
  html = replaceAttribute(html, 'property="og:url"', canonicalUrl);
  html = replaceAttribute(html, 'name="twitter:url"', canonicalUrl);
  html = replaceAttribute(html, 'property="og:locale"', lang === 'en' ? 'en_US' : 'es_ES');

  if (routeMeta) {
    html = html.replace(/<title>.*?<\/title>/i, `<title>${routeMeta.title}</title>`);
    html = replaceAttribute(html, 'name="title"', routeMeta.title);
    html = replaceAttribute(html, 'name="description"', routeMeta.description);
    html = replaceAttribute(html, 'property="og:title"', routeMeta.title);
    html = replaceAttribute(html, 'property="og:description"', routeMeta.description);
    html = replaceAttribute(html, 'name="twitter:title"', routeMeta.title);
    html = replaceAttribute(html, 'name="twitter:description"', routeMeta.description);
  }

  fs.writeFileSync(filePath, html);
};

const walkHtml = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      patchHtml(fullPath);
    }
  }
};

if (!fs.existsSync(distDir)) {
  console.error(`[SEO] Missing dist directory: ${distDir}`);
  process.exit(1);
}

walkHtml(distDir);
console.log('[SEO] Patched SSG canonical and hreflang tags.');

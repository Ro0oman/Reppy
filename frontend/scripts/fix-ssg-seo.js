import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const BASE_URL = 'https://reppy-weld.vercel.app';

const blogPostsPath = path.resolve(__dirname, '../src/blogPosts.json');
const blogPosts = JSON.parse(fs.readFileSync(blogPostsPath, 'utf8'));

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
        : 'Convierte tu esfuerzo fisico en progreso RPG. Registra dominadas, flexiones y fondos para subir niveles, ganar Reppy Coins y derrotar bosses epicos con la comunidad.',
      keywords: isEnglish
        ? 'reppy, calisthenics app, pull-up tracker, push-up counter, fitness rpg, bodyweight training, workout tracker'
        : 'reppy, app calistenia, contador dominadas, contador flexiones, fitness rpg, entrenamiento cuerpo libre, tracker repeticiones'
    };
  }

  if (route.endsWith('/contador-dominadas') || route.endsWith('/pull-up-counter')) {
    return {
      title: isEnglish ? 'Online Pull-up Counter | Reppy' : 'Contador de Dominadas Online | Reppy',
      description: isEnglish
        ? 'Log your pull-ups and compete in the global ranking. Free pull-up tracker with RPG progression, streak tracking, and community boss fights.'
        : 'Registra tus pull-ups y compite en el ranking mundial. Contador de dominadas gratis con progresion RPG, racha de entrenamiento y boss fights comunitarios.',
      keywords: isEnglish
        ? 'pull-up counter, pull-up tracker, chin-up counter, online pull-up counter, free pull-up tracker, calisthenics tracker'
        : 'contador dominadas, contador pull-ups, rastrear dominadas, app dominadas gratis, pull-up counter online, tracker calistenia'
    };
  }

  if (route.endsWith('/contador-flexiones') || route.endsWith('/push-up-counter')) {
    return {
      title: isEnglish ? 'Free Push-up Counter | Reppy' : 'Contador de Flexiones Gratis | Reppy',
      description: isEnglish
        ? 'Keep track of your push-ups and level up your attributes. Free push-up counter with RPG progression, leaderboard, and community events.'
        : 'Lleva la cuenta de tus push-ups y sube de nivel tus atributos. Contador de flexiones gratis con progresion RPG, ranking global y eventos comunitarios.',
      keywords: isEnglish
        ? 'push-up counter, pushup tracker, free push-up counter, online push-up tracker, bodyweight workout tracker'
        : 'contador flexiones, contador push-ups, app flexiones gratis, push-up counter online, tracker flexiones calistenia'
    };
  }

  if (route.endsWith('/app-calistenia') || route.endsWith('/calisthenics-app')) {
    return {
      title: isEnglish ? 'Best Calisthenics App Free | Reppy' : 'App de Calistenia Gratis | Reppy',
      description: isEnglish
        ? 'The best free calisthenics app. Track pull-ups, push-ups, dips and muscle-ups. Level up RPG stats, compete in rankings and join community boss fights.'
        : 'La mejor app de calistenia gratuita. Registra dominadas, flexiones, fondos y muscle-ups. Sube stats RPG, compite en rankings y derrota bosses comunitarios.',
      keywords: isEnglish
        ? 'calisthenics app, best calisthenics app, free workout tracker, bodyweight training app, street workout app'
        : 'app calistenia, app dominadas, app flexiones, aplicacion calistenia gratis, street workout app, entrenamiento cuerpo libre app'
    };
  }

  if (route.endsWith('/blog')) {
    return {
      title: isEnglish ? 'Calisthenics Guides & Training News | Reppy' : 'Guias y Noticias de Entrenamiento | Reppy',
      description: isEnglish
        ? 'The latest calisthenics guides, mental routines, and Reppy community updates. Learn to master pull-ups, push-ups, and bodyweight skills.'
        : 'Las ultimas guias de calistenia, consejos mentales y actualizaciones de la comunidad Reppy. Aprende a dominar dominadas, flexiones y skills de peso corporal.'
    };
  }

  // Blog post routes: /es/blog/:slug or /en/blog/:slug
  const blogMatch = route.match(/^\/(es|en)\/blog\/(.+)$/);
  if (blogMatch) {
    const slug = blogMatch[2];
    const post = blogPosts.find(p => p.slug === slug);
    if (post) {
      const locale = post.locales[lang] || post.locales.en;
      const rawTitle = locale.title.replace(/[\u{1F000}-\u{1FFFF}]|[☀-➿]/gu, '').trim();
      const title = `${rawTitle} | Reppy`;
      const description = locale.excerpt || '';
      const image = post.image
        ? (post.image.startsWith('http') ? post.image : `${BASE_URL}${post.image}`)
        : `${BASE_URL}/og-image.png`;
      const keywords = locale.keywords?.join(', ') || '';
      return { title, description, image, keywords };
    }
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
    if (routeMeta.image) {
      html = replaceAttribute(html, 'property="og:image"', routeMeta.image);
      html = replaceAttribute(html, 'name="twitter:image"', routeMeta.image);
    }
    if (routeMeta.keywords) {
      html = replaceAttribute(html, 'name="keywords"', routeMeta.keywords);
    }
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
console.log(`[SEO] Patched SSG HTML files. Blog posts indexed: ${blogPosts.length}`);

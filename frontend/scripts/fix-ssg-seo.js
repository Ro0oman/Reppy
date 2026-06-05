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

// Maps between ES and EN slugs for pages that use different URL slugs per language
const SLUG_MAP = {
  // ES → EN
  '/es/contador-dominadas':          '/en/pull-up-counter',
  '/es/contador-flexiones':          '/en/push-up-counter',
  '/es/app-dominadas':               '/en/pull-up-app',
  '/es/app-flexiones':               '/en/push-up-app',
  '/es/app-fondos':                  '/en/dips-app',
  '/es/app-calistenia':              '/en/calisthenics-app',
  '/es/reto-calistenia-30-dias':     '/en/30-day-calisthenics-challenge',
  '/es/reppy-vs-otras-apps-calistenia': '/en/reppy-vs-calisthenics-apps',
};
// Build reverse map EN → ES
const SLUG_MAP_REVERSE = Object.fromEntries(Object.entries(SLUG_MAP).map(([k, v]) => [v, k]));

const localizedSibling = (route, lang) => {
  if (route === '/es' || route === '/en') return `/${lang}`;
  if (lang === 'en' && SLUG_MAP[route]) return SLUG_MAP[route];
  if (lang === 'es' && SLUG_MAP_REVERSE[route]) return SLUG_MAP_REVERSE[route];
  return route.replace(/^\/(es|en)/, `/${lang}`);
};

const replaceAttribute = (html, selector, value) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(<[^>]*${escapedSelector}[^>]*(?:href|content)=)["'][^"']*["']`, 'i');
  return html.replace(pattern, `$1"${value}"`);
};

const rpgPullupJsonLd = () => JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Reppy',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web, Android, iOS',
      url: `${BASE_URL}/en/free-rpg-pull-up-counter`,
      description: 'Reppy is a free RPG pull-up counter and gamified calisthenics app. Track pull-ups, earn XP, level up attributes, keep streaks, and join boss fights.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Free pull-up counter',
        'RPG fitness progression',
        'Calisthenics workout tracker',
        'Training heatmap',
        'Community boss fights'
      ]
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is Reppy a free pull-up counter?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Reppy lets you track pull-ups for free and also supports push-ups, dips, muscle-ups, and weighted pull-ups.'
          }
        },
        {
          '@type': 'Question',
          name: 'Does Reppy have RPG progression?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Workouts earn XP and level up RPG-style attributes, so your training feels like character progression.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I use Reppy as a gamified fitness app?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Reppy combines rep tracking with streaks, rankings, achievements, RPG attributes, and community boss fights.'
          }
        }
      ]
    }
  ]
});

const softwareAppSchema = (lang, url, name, description) => ({
  '@type': 'SoftwareApplication',
  name: 'Reppy',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web, Android, iOS',
  url,
  description,
  inLanguage: lang === 'en' ? 'en' : 'es',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '150' },
  featureList: lang === 'en'
    ? ['Free pull-up counter', 'Push-up tracker', 'Dips counter', 'RPG progression', 'Global leaderboard', 'Streak heatmap', 'Community boss fights']
    : ['Contador de dominadas gratis', 'Tracker de flexiones', 'Contador de fondos', 'Progresión RPG', 'Ranking global', 'Heatmap de racha', 'Boss fights comunitarios']
});

const faqSchema = (faqs) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a }
  }))
});

const jsonLdForRoute = (route, lang, canonicalUrl) => {
  const isEn = lang === 'en';

  // Exercise landing: contador-dominadas / pull-up-counter
  if (route.endsWith('/contador-dominadas') || route.endsWith('/pull-up-counter')) {
    const desc = isEn
      ? 'Reppy is a free online pull-up counter with RPG progression, streak heatmap and global ranking.'
      : 'Reppy es un contador de dominadas online gratuito con progresión RPG, heatmap de racha y ranking global.';
    const faqs = isEn ? [
      ['Is this pull-up counter free?', 'Yes, Reppy is 100% free with no ads and no subscription required.'],
      ['How does the RPG progression work?', 'Every pull-up you log earns XP that levels up your Strength (STR) and Endurance (END) attributes.'],
      ['Can I track weighted pull-ups?', 'Yes. Reppy supports added weight and counts it toward your total training volume.']
    ] : [
      ['¿El contador de dominadas es gratuito?', 'Sí, Reppy es 100% gratuito, sin anuncios y sin suscripción.'],
      ['¿Cómo funciona la progresión RPG?', 'Cada dominada registrada otorga XP que sube tus atributos de Fuerza (STR) y Resistencia (END).'],
      ['¿Puedo registrar dominadas con lastre?', 'Sí. Reppy permite añadir peso extra y lo contabiliza en tu volumen total de entrenamiento.']
    ];
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [softwareAppSchema(lang, canonicalUrl, 'Reppy', desc), faqSchema(faqs)] });
  }

  // app-dominadas / pull-up-app
  if (route.endsWith('/app-dominadas') || route.endsWith('/pull-up-app')) {
    const desc = isEn
      ? 'Reppy is the best free pull-up app for Android and iPhone, with RPG stats, streak tracking and community boss fights.'
      : 'Reppy es la mejor app de dominadas gratuita para Android e iPhone, con stats RPG, racha de entrenamiento y boss fights comunitarios.';
    const faqs = isEn ? [
      ['Is Reppy available on Android and iPhone?', 'Reppy is a progressive web app that works on any device: Android, iPhone, and desktop.'],
      ['Is the pull-up app free?', 'Yes, Reppy is completely free. No ads, no subscription, no hidden costs.'],
      ['Does the app track my pull-up progress over time?', 'Yes. Reppy shows a GitHub-style heatmap of all your sessions and tracks streaks, volume, and RPG level progression.']
    ] : [
      ['¿Está Reppy disponible para Android e iPhone?', 'Reppy es una app web progresiva que funciona en cualquier dispositivo: Android, iPhone y escritorio.'],
      ['¿La app de dominadas es gratuita?', 'Sí, Reppy es completamente gratuita. Sin anuncios, sin suscripción, sin costes ocultos.'],
      ['¿La app registra mi progresión de dominadas a lo largo del tiempo?', 'Sí. Reppy muestra un heatmap estilo GitHub de todas tus sesiones y sigue la racha, el volumen y la progresión de nivel RPG.']
    ];
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [softwareAppSchema(lang, canonicalUrl, 'Reppy', desc), faqSchema(faqs)] });
  }

  // contador-flexiones / push-up-counter
  if (route.endsWith('/contador-flexiones') || route.endsWith('/push-up-counter')) {
    const desc = isEn
      ? 'Reppy is a free online push-up counter with RPG progression, global leaderboard and streak tracking.'
      : 'Reppy es un contador de flexiones online gratuito con progresión RPG, ranking global y seguimiento de racha.';
    const faqs = isEn ? [
      ['Is this push-up counter free?', 'Yes, Reppy is 100% free. Track unlimited push-ups with no ads or subscription.'],
      ['How does the push-up counter work?', 'Log your sets and reps after each workout. Reppy calculates volume, tracks streaks, and shows progress on a heatmap.'],
      ['Can I compete with others in push-ups?', 'Yes. Reppy has a global push-up leaderboard and community boss fights where your reps deal damage.']
    ] : [
      ['¿El contador de flexiones es gratuito?', 'Sí, Reppy es 100% gratuito. Registra flexiones ilimitadas sin anuncios ni suscripción.'],
      ['¿Cómo funciona el contador de flexiones?', 'Registra tus series y repeticiones tras cada entrenamiento. Reppy calcula el volumen, sigue la racha y muestra el progreso en un heatmap.'],
      ['¿Puedo competir con otros en flexiones?', 'Sí. Reppy tiene un ranking global de flexiones y boss fights comunitarios donde tus reps hacen daño.']
    ];
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [softwareAppSchema(lang, canonicalUrl, 'Reppy', desc), faqSchema(faqs)] });
  }

  // app-flexiones / push-up-app
  if (route.endsWith('/app-flexiones') || route.endsWith('/push-up-app')) {
    const desc = isEn
      ? 'Reppy is a free push-up tracking app with RPG stats, global rankings and streak heatmap for Android and iPhone.'
      : 'Reppy es una app de flexiones gratuita con stats RPG, rankings globales y heatmap de racha para Android e iPhone.';
    const faqs = isEn ? [
      ['Is the push-up app free?', 'Yes, Reppy is completely free on all devices.'],
      ['Does the app track push-up history?', 'Yes. Every logged session appears on a heatmap and contributes to your RPG attributes.'],
      ['Can I track different push-up variations?', 'Yes. Reppy supports all push-up variations including diamond, wide-grip, and one-arm push-ups.']
    ] : [
      ['¿La app de flexiones es gratuita?', 'Sí, Reppy es completamente gratuita en todos los dispositivos.'],
      ['¿La app registra el historial de flexiones?', 'Sí. Cada sesión registrada aparece en un heatmap y contribuye a tus atributos RPG.'],
      ['¿Puedo registrar diferentes variantes de flexiones?', 'Sí. Reppy permite todas las variantes: diamante, agarre ancho, un brazo, etc.']
    ];
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [softwareAppSchema(lang, canonicalUrl, 'Reppy', desc), faqSchema(faqs)] });
  }

  // app-fondos / dips-app
  if (route.endsWith('/app-fondos') || route.endsWith('/dips-app')) {
    const desc = isEn
      ? 'Reppy is a free dips tracker app with RPG progression, global ranking and streak heatmap.'
      : 'Reppy es una app de fondos en paralelas gratuita con progresión RPG, ranking global y heatmap de racha.';
    const faqs = isEn ? [
      ['Is the dips tracker free?', 'Yes, Reppy is 100% free with no ads or subscription.'],
      ['Does Reppy count dips separately from other exercises?', 'Yes. Dips have their own tracking, leaderboard, and contribute to STR and PWR attributes.'],
      ['Can I track ring dips or weighted dips?', 'Yes. Reppy lets you add extra weight and counts all dip variations toward your total volume.']
    ] : [
      ['¿El tracker de fondos es gratuito?', 'Sí, Reppy es 100% gratuito sin anuncios ni suscripción.'],
      ['¿Reppy cuenta los fondos por separado de otros ejercicios?', 'Sí. Los fondos tienen su propio tracking, ranking y contribuyen a los atributos STR y PWR.'],
      ['¿Puedo registrar fondos en anillas o con lastre?', 'Sí. Reppy permite añadir peso extra y cuenta todas las variantes de fondos en el volumen total.']
    ];
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [softwareAppSchema(lang, canonicalUrl, 'Reppy', desc), faqSchema(faqs)] });
  }

  // reto-calistenia-30-dias / 30-day-calisthenics-challenge
  if (route.endsWith('/reto-calistenia-30-dias') || route.endsWith('/30-day-calisthenics-challenge')) {
    const faqs = isEn ? [
      ['What is a 30-day calisthenics challenge?', 'A structured program doing pull-ups, push-ups, and dips daily for 30 days with progressive volume each week.'],
      ['Can beginners do this challenge?', 'Yes. The challenge is scalable — start with easier variations and increase volume as you improve.'],
      ['How does Reppy track the 30-day challenge?', 'Every rep you log counts. Reppy shows your streak heatmap so you can visually track every day of the challenge.'],
      ['Is the challenge free?', 'Yes, Reppy and the 30-day challenge are completely free.']
    ] : [
      ['¿Qué es un reto de calistenia de 30 días?', 'Un programa estructurado de dominadas, flexiones y fondos durante 30 días con progresión semanal de volumen.'],
      ['¿Pueden hacerlo principiantes?', 'Sí. El reto es escalable — empieza con variantes más fáciles y aumenta el volumen a medida que mejoras.'],
      ['¿Cómo sigue Reppy el reto de 30 días?', 'Cada rep que registras cuenta. Reppy muestra tu heatmap de racha para visualizar cada día del reto.'],
      ['¿El reto es gratuito?', 'Sí, Reppy y el reto de 30 días son completamente gratuitos.']
    ];
    const desc = isEn
      ? '30-day calisthenics challenge with pull-ups, push-ups and dips. Track progress with RPG stats and streak heatmap. Free and beginner-friendly.'
      : 'Reto de calistenia de 30 días con dominadas, flexiones y fondos. Sigue tu progreso con stats RPG y heatmap de racha. Gratis y para principiantes.';
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [softwareAppSchema(lang, canonicalUrl, 'Reppy', desc), faqSchema(faqs)] });
  }

  // reppy-vs-otras-apps / reppy-vs-calisthenics-apps
  if (route.endsWith('/reppy-vs-otras-apps-calistenia') || route.endsWith('/reppy-vs-calisthenics-apps')) {
    const faqs = isEn ? [
      ['Is Reppy better than Freeletics for calisthenics?', 'Reppy is free and specialized in pull-ups, push-ups, and dips with RPG progression. Freeletics requires a subscription and is more general-purpose.'],
      ['How is Reppy different from Madbarz?', 'Reppy adds RPG attribute progression, community boss fights, and a streak heatmap — features not available in Madbarz.'],
      ['Is Reppy free compared to other calisthenics apps?', 'Yes. Reppy is 100% free with no ads, no subscription, and no feature paywalls.']
    ] : [
      ['¿Es Reppy mejor que Freeletics para calistenia?', 'Reppy es gratuita y está especializada en dominadas, flexiones y fondos con progresión RPG. Freeletics requiere suscripción y es más genérica.'],
      ['¿En qué se diferencia Reppy de Madbarz?', 'Reppy añade progresión de atributos RPG, boss fights comunitarios y heatmap de racha — funciones no disponibles en Madbarz.'],
      ['¿Reppy es gratuita comparada con otras apps de calistenia?', 'Sí. Reppy es 100% gratuita sin anuncios, sin suscripción y sin funciones de pago.']
    ];
    const desc = isEn
      ? 'Compare Reppy vs Freeletics, Madbarz and Google Fit. See why Reppy is the best free calisthenics app for pull-ups, push-ups, and dips.'
      : 'Compara Reppy vs Freeletics, Madbarz y Google Fit. Descubre por qué Reppy es la mejor app de calistenia gratuita para dominadas, flexiones y fondos.';
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [softwareAppSchema(lang, canonicalUrl, 'Reppy', desc), faqSchema(faqs)] });
  }

  // app-calistenia / calisthenics-app
  if (route.endsWith('/app-calistenia') || route.endsWith('/calisthenics-app')) {
    const desc = isEn
      ? 'Reppy is the best free calisthenics app. Track pull-ups, push-ups, dips and muscle-ups with RPG progression and community boss fights.'
      : 'Reppy es la mejor app de calistenia gratuita. Registra dominadas, flexiones, fondos y muscle-ups con progresión RPG y boss fights comunitarios.';
    const faqs = isEn ? [
      ['Is Reppy a free calisthenics app?', 'Yes, Reppy is completely free with no ads or subscription required.'],
      ['Which exercises does Reppy track?', 'Pull-ups, push-ups, dips, muscle-ups, weighted pull-ups, squats, and more. All with RPG progression.'],
      ['Does Reppy have a community?', 'Yes. Reppy has a global leaderboard, community boss fights, and a social feed where you can see other athletes\' progress.']
    ] : [
      ['¿Reppy es una app de calistenia gratuita?', 'Sí, Reppy es completamente gratuita sin anuncios ni suscripción.'],
      ['¿Qué ejercicios registra Reppy?', 'Dominadas, flexiones, fondos, muscle-ups, dominadas con lastre, sentadillas y más. Todos con progresión RPG.'],
      ['¿Reppy tiene comunidad?', 'Sí. Reppy tiene ranking global, boss fights comunitarios y un feed social donde ver el progreso de otros atletas.']
    ];
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': [softwareAppSchema(lang, canonicalUrl, 'Reppy', desc), faqSchema(faqs)] });
  }

  return null;
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

  if (route.endsWith('/app-dominadas') || route.endsWith('/pull-up-app')) {
    return {
      title: isEnglish ? 'Pull-up App for Android & iPhone | Reppy' : 'App de Dominadas Android e iPhone | Reppy',
      description: isEnglish
        ? 'The best free pull-up app for Android and iPhone. Track your pull-ups with RPG progression, streak tracking, and global community boss fights.'
        : 'La mejor app de dominadas gratuita para Android e iPhone. Registra tus pull-ups con progresion RPG, racha de entrenamiento y boss fights comunitarios.',
      keywords: isEnglish
        ? 'pull-up app android, pull-up app iphone, best pull-up app, pull-up tracker app, free calisthenics app'
        : 'app dominadas android, app dominadas iphone, app dominadas gratis, seguimiento dominadas, app pull-up gratis'
    };
  }

  if (route.endsWith('/app-flexiones') || route.endsWith('/push-up-app')) {
    return {
      title: isEnglish ? 'Push-up Tracking App Free | Reppy' : 'App de Flexiones Gratis | Reppy',
      description: isEnglish
        ? 'Free push-up tracking app with RPG progression. Log push-ups, monitor progress, and compete in global rankings on Android and iPhone.'
        : 'App de flexiones gratuita con progresion RPG. Registra push-ups, monitorea tu progreso y compite en rankings globales en Android e iPhone.',
      keywords: isEnglish
        ? 'push-up app, push-up tracking app, free push-up app, push-up counter app android, push-up counter iphone'
        : 'app flexiones, app contador flexiones, app push-up gratis, seguimiento flexiones android, contador flexiones online'
    };
  }

  if (route.endsWith('/app-fondos') || route.endsWith('/dips-app')) {
    return {
      title: isEnglish ? 'Dips Tracker App Free | Reppy' : 'App de Fondos en Paralelas | Reppy',
      description: isEnglish
        ? 'Track your dips and build tricep and chest strength with RPG progression. Free dips counter app with global ranking and community events.'
        : 'Registra tus fondos en paralelas y desarrolla fuerza en triceps y pecho con progresion RPG. App de fondos gratis con ranking global y eventos comunitarios.',
      keywords: isEnglish
        ? 'dips app, dips tracker, dips counter app, tricep dips app, calisthenics dips tracker'
        : 'app fondos paralelas, contador fondos, app fondos gratis, seguimiento fondos calistenia, tracker fondos'
    };
  }

  if (route.endsWith('/reto-calistenia-30-dias') || route.endsWith('/30-day-calisthenics-challenge')) {
    return {
      title: isEnglish ? '30-Day Calisthenics Challenge | Reppy' : 'Reto Calistenia 30 Días | Reppy',
      description: isEnglish
        ? 'Take the 30-day calisthenics challenge. Daily pull-ups, push-ups, and dips tracked with RPG progression and community boss fights. Free and beginner-friendly.'
        : 'Acepta el reto de calistenia de 30 dias. Dominadas, flexiones y fondos diarios con progresion RPG y boss fights comunitarios. Gratis y apto para principiantes.',
      keywords: isEnglish
        ? '30 day calisthenics challenge, calisthenics challenge, 30 day workout challenge, beginner calisthenics plan, bodyweight challenge'
        : 'reto calistenia 30 dias, reto dominadas flexiones, reto calistenia principiantes, plan entrenamiento calistenia, challenge calistenia'
    };
  }

  if (route.endsWith('/reppy-vs-otras-apps-calistenia') || route.endsWith('/reppy-vs-calisthenics-apps')) {
    return {
      title: isEnglish ? 'Reppy vs Other Calisthenics Apps | Comparison' : 'Reppy vs Otras Apps de Calistenia | Comparativa',
      description: isEnglish
        ? 'How does Reppy compare to other calisthenics and workout apps? See why gamified RPG tracking beats generic fitness apps for pull-ups, push-ups, and dips.'
        : 'Como se compara Reppy con otras apps de calistenia y fitness? Descubre por que el seguimiento RPG gamificado supera a las apps de fitness genericas.',
      keywords: isEnglish
        ? 'reppy vs freeletics, reppy vs calisthenics app, best calisthenics app comparison, calisthenics app review'
        : 'reppy vs freeletics, reppy vs otras apps, mejor app calistenia comparativa, comparacion apps calistenia, reppy alternativa'
    };
  }

  if (route.endsWith('/free-rpg-pull-up-counter')) {
    return {
      title: 'Free RPG Pull-up Counter | Reppy',
      description: 'Reppy is a free RPG pull-up counter and gamified calisthenics app. Track pull-ups, earn XP, level up attributes, keep streaks, and join boss fights.',
      keywords: 'pullup counter free rpg, pull-up counter free rpg, free rpg fitness app, gamified pull-up counter, rpg pull-up tracker, free calisthenics rpg'
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
  const isEnglishOnlyRpgPullup = route.endsWith('/free-rpg-pull-up-counter');
  const esUrl = isEnglishOnlyRpgPullup ? canonicalUrl : `${BASE_URL}${localizedSibling(route, 'es')}`;
  const enUrl = isEnglishOnlyRpgPullup ? canonicalUrl : `${BASE_URL}${localizedSibling(route, 'en')}`;
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

  if (isEnglishOnlyRpgPullup && !html.includes('rpg-pullup-jsonld')) {
    html = html.replace('</head>', `<script id="rpg-pullup-jsonld" type="application/ld+json">${rpgPullupJsonLd()}</script></head>`);
  }

  const jsonLd = jsonLdForRoute(route, lang, canonicalUrl);
  if (jsonLd && !html.includes('landing-jsonld')) {
    html = html.replace('</head>', `<script id="landing-jsonld" type="application/ld+json">${jsonLd}</script></head>`);
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

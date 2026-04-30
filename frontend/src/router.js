import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useI18nStore } from './stores/i18n'

// Lazy load components to optimize the landing performance
const Landing = () => import('./components/Landing.vue')
const Dashboard = () => import('./components/Dashboard.vue')
const Social = () => import('./components/Social.vue')
const Shop = () => import('./components/Shop.vue')
const Inventory = () => import('./components/Inventory.vue')
const Profile = () => import('./components/Profile.vue')
const Login = () => import('./components/Login.vue')
const AdminPanel = () => import('./components/AdminPanel.vue')
const ExerciseLanding = () => import('./components/ExerciseLanding.vue')
const Notifications = () => import('./components/Notifications.vue')
const BlogList = () => import('./components/BlogList.vue')
const Codex = () => import('./components/Codex.vue')
const PvpBattleView = () => import('./components/PvpBattleView.vue')
const Missions = () => import('./components/Missions.vue')
const NotFound = () => import('./components/NotFound.vue')

export const routes = [
  // Redirección adaptativa de la raíz basada en detección de idioma
  { 
    path: '/', 
    redirect: () => {
      const i18n = useI18nStore();
      return `/${i18n.locale || 'es'}`;
    }
  },
  {
    path: '/:lang(es|en)',
    children: [
      { 
        path: '', 
        component: Landing, 
        name: 'landing',
        meta: { 
          titleKey: 'landing_title',
          descriptionKey: 'landing_hero_subtitle'
        }
      },
      { 
        path: 'login', 
        component: Login, 
        name: 'login',
        meta: { title: 'Login | Reppy' }
      },
      { 
        path: 'dashboard', 
        component: Dashboard, 
        name: 'dashboard',
        meta: { requiresAuth: true, titleKey: 'nav_dashboard' }
      },
      { 
        path: 'social', 
        component: Social, 
        name: 'social',
        meta: { requiresAuth: true, titleKey: 'nav_social' }
      },
      { 
        path: 'shop', 
        component: Shop, 
        name: 'shop',
        meta: { requiresAuth: true, titleKey: 'nav_shop' }
      },
      { 
        path: 'codex', 
        component: Codex, 
        name: 'codex',
        meta: { requiresAuth: true, titleKey: 'nav_codex' }
      },
      { 
        path: 'inventory', 
        component: Inventory, 
        name: 'inventory',
        meta: { requiresAuth: true, titleKey: 'nav_inventory' }
      },
      { 
        path: 'profile/:userId?', 
        component: Profile, 
        name: 'profile', 
        props: true,
        meta: { requiresAuth: true, titleKey: 'nav_profile' }
      },
      { 
        path: 'admin', 
        component: AdminPanel, 
        name: 'admin',
        meta: { requiresAuth: true, requiresAdmin: true, title: 'Admin Panel | Reppy' }
      },
      { 
        path: 'notifications', 
        component: Notifications, 
        name: 'notifications',
        meta: { requiresAuth: true, title: 'Notificaciones | Reppy' }
      },
      { 
        path: 'pvp/:id', 
        component: PvpBattleView, 
        name: 'pvp',
        meta: { requiresAuth: true, title: 'PvP Battle | Reppy' }
      },
      { 
        path: 'missions', 
        component: Missions, 
        name: 'missions',
        meta: { requiresAuth: true, titleKey: 'nav_missions' }
      },
      // SEO Routes
      { 
        path: 'contador-dominadas', 
        alias: 'pull-up-counter',
        component: ExerciseLanding, 
        name: 'seo-dominadas',
        props: { type: 'dominadas' },
        meta: { 
          titleKey: 'pullup_seo_title',
          descriptionKey: 'pullup_seo_desc'
        }
      },
      { 
        path: 'contador-flexiones', 
        alias: 'push-up-counter',
        component: ExerciseLanding, 
        name: 'seo-flexiones',
        props: { type: 'flexiones' },
        meta: { 
          titleKey: 'pushup_seo_title',
          descriptionKey: 'pushup_seo_desc'
        }
      },
      { 
        path: 'app-calistenia', 
        alias: 'calisthenics-app',
        component: Landing, 
        name: 'seo-calistenia',
        meta: { titleKey: 'hero_eyebrow' }
      },
      { 
        path: 'blog', 
        component: BlogList, 
        name: 'blog-list',
        meta: { 
          titleKey: 'blog_list_title',
          descriptionKey: 'blog_list_subtitle'
        }
      },
      { 
        path: 'blog/:slug', 
        component: () => import('./components/BlogView.vue'), 
        name: 'blog-post',
        meta: { title: 'Blog | Reppy' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFound,
    name: 'not-found',
    meta: { titleKey: 'not_found_title' }
  }
];

// Route Guards
export function setupRouterGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const i18n = useI18nStore()
    
    // 0. Redirect paths without locale prefix (e.g., /social -> /es/social)
    // This allows using generic paths in redirects or code while maintaining localization
    if (!to.params.lang && to.path !== '/') {
      const currentLang = i18n.locale || 'es';
      const knownPaths = [
        'dashboard', 'social', 'shop', 'codex', 'inventory', 
        'profile', 'admin', 'notifications', 'blog', 'login', 'missions',
        'contador-dominadas', 'contador-flexiones', 'app-calistenia'
      ];
      
      const firstPart = to.path.split('/')[1];
      if (knownPaths.includes(firstPart)) {
        return next({ 
          path: `/${currentLang}${to.path}`, 
          query: to.query, 
          hash: to.hash 
        });
      }
    }

    // 1. Sync language from URL if present
    if (to.params.lang) {
      await i18n.setLocale(to.params.lang)
    }

    // 2. Sincronizar Etiquetas SEO Globales (Canonical, Hreflang)
    const baseUrl = 'https://reppy-weld.vercel.app'
    const currentPath = to.path
    const currentLang = to.params.lang || 'es'
    
    // Canonical
    if (typeof document !== 'undefined') {
      let canonical = document.querySelector('link[rel="canonical"]')
      if (canonical) {
        canonical.setAttribute('href', `${baseUrl}${currentPath}`)
      }
    }

    // Hreflang alternates
    if (typeof document !== 'undefined') {
      const langs = ['es', 'en']
      langs.forEach(l => {
        let alt = document.querySelector(`link[hreflang="${l}"]`)
        if (alt) {
          const altPath = currentPath.replace(/^\/(es|en)/, `/${l}`)
          alt.setAttribute('href', `${baseUrl}${altPath}`)
        }
      })
    }

    // x-default
    if (typeof document !== 'undefined') {
      let xDefault = document.querySelector('link[hreflang="x-default"]')
      if (xDefault) {
        const esPath = currentPath.replace(/^\/(es|en)/, '/es')
        xDefault.setAttribute('href', `${baseUrl}${esPath}`)
      }
    }

    // 3. Configurar el título y descripción de la página
    const title = to.meta.titleKey ? `${i18n.t(to.meta.titleKey)} | Reppy` : (to.meta.title || 'Reppy');
    const description = to.meta.descriptionKey ? i18n.t(to.meta.descriptionKey) : 'Registra tus dominadas y flexiones, sube de nivel tus atributos RPG y compite en rankings globales.';
    
    // Meta tags dinámicos para descripción y redes sociales
    const metas = {
      'description': description,
      'og:title': title,
      'og:description': description,
      'og:url': `${baseUrl}${currentPath}`,
      'twitter:title': title,
      'twitter:description': description
    };

    if (typeof document !== 'undefined') {
      document.title = title;
      Object.entries(metas).forEach(([name, content]) => {
        let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
        if (el) el.setAttribute('content', content);
      });
    }

    const isAuthenticated = authStore.isAuthenticated

    if (to.meta.requiresAuth && !isAuthenticated) {
      next({ name: 'login', params: { lang: currentLang } })
    } else if (to.name === 'landing' && isAuthenticated) {
      next({ name: 'social', params: { lang: currentLang } })
    } else if (to.name === 'login' && isAuthenticated) {
      next({ name: 'social', params: { lang: currentLang } })
    } else if (to.name === 'dashboard' && !isAuthenticated) {
      next()
    } else if (to.meta.requiresAdmin && (!authStore.user || authStore.user.role !== 'admin')) {
      next({ name: 'dashboard', params: { lang: currentLang } })
    } else {
      next()
    }
  })

  // Handle dynamic import failures (chunk loading errors)
  router.onError((error) => {
    const errorMessages = [
      'Failed to fetch dynamically imported module',
      'Importing a module script failed',
      'error loading dynamically imported module'
    ];
    
    if (errorMessages.some(msg => error.message?.includes(msg))) {
      // Check if we already tried to reload recently to avoid infinite loops
      const lastReload = sessionStorage.getItem('last-chunk-error-reload');
      const now = Date.now();
      
      // If we reloaded less than 10 seconds ago, don't reload again to avoid infinite loops
      if (lastReload && (now - parseInt(lastReload)) < 10000) {
        console.error('Dynamic import failed repeatedly. Please check your connection.');
        return;
      }
      
      sessionStorage.setItem('last-chunk-error-reload', now.toString());
      
      // Show a small notification before reloading if possible, or just reload
      // Given we are in the router guard, we might not have easy access to the store here
      // but a simple reload is the most robust fix for this specific issue.
      window.location.reload();
    }
  });
}

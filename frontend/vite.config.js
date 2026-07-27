import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5001';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['socket.io-client'],
  },
  css: {
    postcss: './postcss.config.cjs',
    transformer: 'postcss',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia')) return 'vendor-vue';
            if (id.includes('lucide') || id.includes('confetti')) return 'vendor-ui';
            // pusher-js aparte: `stores/socket.js` lo importa en diferido, pero si
            // cae en `vendor` (que precargan todas las páginas) el split no sirve
            // de nada y la landing pública se baja el realtime igualmente.
            if (id.includes('pusher-js')) return 'vendor-pusher';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  server: {
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true
      }
    }
  },
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    async includedRoutes() {
      const blogPosts = JSON.parse(fs.readFileSync('./src/blogPosts.json', 'utf8'));

      // Fetch top public athletes for SSG prerendering
      let athleteUsernames = [];
      try {
        const res = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5001'}/api/profile/top-public?limit=100`, { signal: AbortSignal.timeout(10000) });
        if (res.ok) {
          const users = await res.json();
          // Exclude QA/test accounts so they aren't prerendered or sitemapped.
          // Keep in sync with the same filter in scripts/generate-sitemap.js.
          const isTestAthlete = (u) => {
            const n = (u || '').toLowerCase();
            return /^guided-test-\d+$/.test(n) || ['roman-test', 'test-user', 'tester', 'test'].includes(n);
          };
          athleteUsernames = users.map(u => u.username).filter(Boolean).filter(u => !isTestAthlete(u));
        }
      } catch (e) {
        console.warn('[SSG] Could not fetch top athletes — skipping profile prerender:', e.message);
      }

      const routes = [
        '/',
        '/es',
        '/en',
        '/es/blog',
        '/en/blog',
        '/es/contador-dominadas',
        '/en/pull-up-counter',
        '/es/contador-flexiones',
        '/en/push-up-counter',
        '/es/app-calistenia',
        '/en/calisthenics-app',
        '/es/app-dominadas',
        '/en/pull-up-app',
        '/es/app-flexiones',
        '/en/push-up-app',
        '/es/app-fondos',
        '/en/dips-app',
        '/es/contador-fondos',
        '/en/dips-counter',
        '/es/contador-muscle-ups',
        '/en/muscle-up-counter',
        '/es/contador-dominadas-supinas',
        '/en/chin-up-counter',
        '/es/reto-calistenia-30-dias',
        '/en/30-day-calisthenics-challenge',
        '/es/reppy-vs-otras-apps-calistenia',
        '/en/reppy-vs-calisthenics-apps',
        '/en/free-rpg-pull-up-counter',
        '/es/social',
        '/en/social'
      ];

      // Blog routes (slug por idioma: /en usa slugEn si existe)
      blogPosts.forEach(post => {
        if (!post.slug) return;
        routes.push(`/es/blog/${post.slug}`);
        routes.push(`/en/blog/${post.slugEn || post.slug}`);
      });

      // Top athlete profile routes
      athleteUsernames.forEach(username => {
        routes.push(`/es/atleta/${username}`);
        routes.push(`/en/athlete/${username}`);
      });

      return routes;
    },
    onFinished() {
      console.log('🚀 [SSG] Static Site Generation complete.')
    }
  }
})


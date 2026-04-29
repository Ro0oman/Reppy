import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
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
        target: 'http://127.0.0.1:5001',
        changeOrigin: true
      }
    }
  },
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    includedRoutes() {
      const blogPosts = JSON.parse(fs.readFileSync('./src/blogPosts.json', 'utf8'));
      const blogSlugs = blogPosts.map(post => post.slug);
      
      const routes = [
        '/',
        '/es',
        '/en',
        '/es/blog',
        '/en/blog',
        '/es/contador-dominadas',
        '/en/contador-dominadas',
        '/es/contador-flexiones',
        '/en/contador-flexiones',
        '/es/app-calistenia',
        '/en/app-calistenia'
      ];

      // Add dynamic blog routes for each language
      blogSlugs.forEach(slug => {
        routes.push(`/es/blog/${slug}`);
        routes.push(`/en/blog/${slug}`);
      });

      return routes;
    },
    onFinished() {
      console.log('🚀 [SSG] Static Site Generation complete.')
    }
  }
})


import { ViteSSG } from 'vite-ssg'
import { createPinia } from 'pinia'
import GoogleSignInPlugin from 'vue3-google-signin'
import './style.css'
import App from './App.vue'
import { routes, setupRouterGuards } from './router'
import { useI18nStore } from './stores/i18n'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useNotificationStore } from './stores/notification'
import axios from 'axios'
import { initLogger } from './utils/logger'
import { initFunnelTracking, trackDay2Return } from './utils/analytics'

export const createApp = ViteSSG(
  App,
  { 
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        return { top: 0 }
      }
    }
  },
  async ({ app, router, routes, isClient, initialState }) => {
    const pinia = createPinia()
    app.use(pinia)

    app.use(GoogleSignInPlugin, {
      clientId: '83248632294-9gu0rutkloc83qj3b78ff2of31pfn8ce.apps.googleusercontent.com',
    })

    // Setup router guards
    setupRouterGuards(router)

    const i18nStore = useI18nStore(pinia)
    const notificationStore = useNotificationStore(pinia)
    
    if (isClient) {
      const authStore = useAuthStore(pinia)
      const themeStore = useThemeStore(pinia)

      // Logger de diagnóstico. Se le pasa axios para que su interceptor registre
      // status y cuerpo de cada respuesta HTTP fallida: el console.error de los
      // catch solo deja el Error genérico, sin el mensaje real del backend.
      initLogger(notificationStore, axios)

      // GA4 funnel tracking (gtag loaded in index.html). Central axios
      // interceptor for signup/first_log/spin/push_enabled + day2_return.
      initFunnelTracking()
      trackDay2Return()

      // Initialize all on client
      await Promise.all([
        authStore.init(),
        themeStore.init(),
        i18nStore.init()
      ])
    } else {
      // Initialize only i18n on server/SSG
      await i18nStore.init()
    }
  }
)

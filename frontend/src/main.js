import { createApp } from 'vue'
import { createPinia } from 'pinia'
import GoogleSignInPlugin from 'vue3-google-signin'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(GoogleSignInPlugin, {
  clientId: '83248632294-9gu0rutkloc83qj3b78ff2of31pfn8ce.apps.googleusercontent.com',
})

// Initialize authentication before mounting the app
const authStore = useAuthStore(pinia)
authStore.init()

app.mount('#app')

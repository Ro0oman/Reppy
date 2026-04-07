import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

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

const routes = [
  { 
    path: '/', 
    component: Landing, 
    name: 'landing',
    meta: { title: 'Reppy – Contador de Dominadas y Calistenia | Tracker Fitness Gamificado' }
  },
  { 
    path: '/login', 
    component: Login, 
    name: 'login',
    meta: { title: 'Login | Reppy' }
  },
  { 
    path: '/dashboard', 
    component: Dashboard, 
    name: 'dashboard',
    meta: { requiresAuth: true, title: 'Dashboard | Reppy' }
  },
  { 
    path: '/social', 
    component: Social, 
    name: 'social',
    meta: { requiresAuth: true, title: 'Rankings Globales | Reppy' }
  },
  { 
    path: '/shop', 
    component: Shop, 
    name: 'shop',
    meta: { requiresAuth: true, title: 'Armería - Tienda de Cosméticos | Reppy' }
  },
  { 
    path: '/inventory', 
    component: Inventory, 
    name: 'inventory',
    meta: { requiresAuth: true, title: 'Equipo e Inventario | Reppy' }
  },
  { 
    path: '/profile/:userId?', 
    component: Profile, 
    name: 'profile', 
    props: true,
    meta: { requiresAuth: true, title: 'Perfil de Atleta | Reppy' }
  },
  { 
    path: '/admin', 
    component: AdminPanel, 
    name: 'admin',
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Admin Protocol | Reppy' }
  },
  // SEO Routes
  { 
    path: '/contador-dominadas', 
    component: ExerciseLanding, 
    name: 'seo-dominadas',
    props: { type: 'dominadas' },
    meta: { title: 'Contador de Dominadas Gratis – App de Calistenia | Reppy' }
  },
  { 
    path: '/contador-flexiones', 
    component: ExerciseLanding, 
    name: 'seo-flexiones',
    props: { type: 'flexiones' },
    meta: { title: 'Contador de Flexiones Gratis – App de Calistenia | Reppy' }
  },
  { 
    path: '/app-calistenia', 
    component: Landing, // For now redirect to landing but with specific SEO intention
    name: 'seo-calistenia',
    meta: { title: 'La mejor App de Calistenia Gratis con RPG | Reppy' }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Route Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title
  }

  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' })
  } else if (to.name === 'landing' && isAuthenticated) {
    // If logged in and goes to landing, maybe stay or go to dashboard?
    // Usually, users want the landing if they aren't forced otherwise.
    next()
  } else if (to.meta.requiresAdmin && (!authStore.user || !authStore.user.is_admin)) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router

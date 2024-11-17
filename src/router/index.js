// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import adminRoutes from './admin.routes.js'
import userRoutes from './user.routes.js'
import landingRoutes from './landing.routes.js'
import authRoutes from './auth.routes.js'

const routes = [
  ...landingRoutes,
  ...authRoutes,
  ...adminRoutes,
  ...userRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Always allow access to the landing pages and auth pages
  if (to.matched.some(record => record.path === '/' || record.path.startsWith('/auth'))) {
    next()
    return
  }

  // Wait for auth initialization
  if (!authStore.isInitialized) {
    try {
      await authStore.initializeAuth()
    } catch (error) {
      next({ name: 'login' })
      return
    }
  }

  const isAuthenticated = authStore.isAuthenticated
  const isAdmin = authStore.isAdmin
  const userExists = authStore.userExists

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next({ name: 'UserHome' })
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated && userExists) {
    next(isAdmin ? { name: 'AdminDashboard' } : { name: 'UserHome' })
  } else {
    next()
  }
})

export default router
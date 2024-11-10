// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import LandingHome from '@/views/landing/Home.vue'
import adminRoutes from './admin.routes'
import userRoutes from './user.routes'

const routes = [
  {
    path: '/',
    name: 'LandingHome',
    component: LandingHome,
    meta: { requiresAuth: false }
  },
  adminRoutes,
  ...userRoutes,
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/')
  } else if (requiresAdmin && !authStore.isAdmin) {
    next('/user')
  } else {
    next()
  }
})

export default router
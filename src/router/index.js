// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import adminRoutes from './admin.routes.js'
import userRoutes from './user.routes.js'
import landingRoutes from './landing.routes.js'
import authRoutes from './auth.routes.js'
import cashierRoutes from './cashier.routes.js'
import driverRoutes from './driver.routes.js'
import managerRoutes from './manager.routes.js'
import stockManagerRoutes from './stockManager.routes.js'

const routes = [
  ...landingRoutes,
  ...authRoutes,
  ...adminRoutes,
  ...userRoutes,
  ...cashierRoutes,
  ...driverRoutes,
  ...managerRoutes,
  ...stockManagerRoutes,

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
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

function getRoleBasedRedirect(role) {
  console.log('Getting redirect for role:', role)
  switch (role) {
    case 'admin':
      return { name: 'AdminDashboard' }
    case 'cashier':
      return { name: 'CashierDashboard' }
    case 'driver':
      return { name: 'DriverDashboard' }
    case 'manager':
      return { name: 'ManagerDashboard' }
    case 'stock manager':
      return { name: 'StockManagerDashboard' }
    case 'user':
      return { name: 'UserAccount' }
    default:
      return { name: 'UserAccount' }
  }
}

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
      console.error('Auth initialization failed:', error)
      next({ name: 'login' })
      return
    }
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole || localStorage.getItem('userRole')
  const userExists = authStore.userExists

  console.log('Current user role:', userRole)
  console.log('Route meta:', to.meta)
  console.log('Is authenticated:', isAuthenticated)
  console.log('User exists:', userExists)
  console.log('Requested route:', to.path)

  if (isAuthenticated && userExists) {
    if (to.name === 'login' || to.name === 'register') {
      // If user is authenticated and trying to access login or register, redirect to appropriate dashboard
      const roleBasedRedirect = getRoleBasedRedirect(userRole)
      next(roleBasedRedirect)
    } else if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      console.log('User does not have required role, redirecting to appropriate dashboard')
      const roleBasedRedirect = getRoleBasedRedirect(userRole)
      next(roleBasedRedirect)
    } else {
      console.log('Proceeding to requested route:', to.path)
      next()
    }
  } else if (to.meta.requiresAuth) {
    console.log('Redirecting to login due to authentication requirement')
    next({ name: 'login' })
  } else {
    console.log('Proceeding to requested route:', to.path)
    next()
  }
})

export default router
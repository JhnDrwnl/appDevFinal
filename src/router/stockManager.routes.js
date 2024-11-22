// src/router/stockManager.routes.js
import StockManagerLayout from '@/layouts/StockManagerLayout.vue'
import Dashboard from '@/views/stockManager/Dashboard.vue'
import Profile from '@/views/stockManager/Profile.vue'

export default [
  {
    path: '/stock-manager',
    component: StockManagerLayout,
    meta: { requiresAuth: true, roles: ['stock manager'] },
    children: [
      {
        path: '',
        redirect: { name: 'StockManagerDashboard' }
      },
      {
        path: 'dashboard',
        name: 'StockManagerDashboard',
        component: Dashboard
      },
      {
        path: 'profile',
        name: 'StockManagerProfile',
        component: Profile
      }
      // Add more stock manager-specific routes here as needed
    ]
  }
]
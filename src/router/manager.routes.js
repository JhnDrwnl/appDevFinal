// src/router/manager.routes.js
import ManagerLayout from '@/layouts/ManagerLayout.vue'
import Dashboard from '@/views/manager/Dashboard.vue'
import Profile from '@/views/manager/Profile.vue'

export default [
  {
    path: '/manager',
    component: ManagerLayout,
    meta: { requiresAuth: true, roles: ['manager'] },
    children: [
      {
        path: '',
        redirect: { name: 'ManagerDashboard' }
      },
      {
        path: 'dashboard',
        name: 'ManagerDashboard',
        component: Dashboard
      },
      {
        path: 'profile',
        name: 'ManagerProfile',
        component: Profile
      }
      // Add more manager-specific routes here as needed
    ]
  }
]
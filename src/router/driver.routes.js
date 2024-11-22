// src/router/driver.routes.js
import DriverLayout from '@/layouts/DriverLayout.vue'
import Dashboard from '@/views/driver/Dashboard.vue'
import Profile from '@/views/driver/Profile.vue'

export default [
  {
    path: '/driver',
    component: DriverLayout,
    meta: { requiresAuth: true, roles: ['driver'] },
    children: [
      {
        path: '',
        redirect: { name: 'DriverDashboard' }
      },
      {
        path: 'dashboard',
        name: 'DriverDashboard',
        component: Dashboard
      },
      {
        path: 'profile',
        name: 'DriverProfile',
        component: Profile
      }

      // Add more driver-specific routes here as needed
    ]
  }
]
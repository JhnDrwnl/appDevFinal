// src/router/cashier.routes.js
import CashierLayout from '@/layouts/CashierLayout.vue'
import Dashboard from '@/views/cashier/Dashboard.vue'
import Profile from '@/views/cashier/Profile.vue'


export default [
  {
    path: '/cashier',
    component: CashierLayout,
    meta: { requiresAuth: true, roles: ['cashier'] },
    children: [
      {
        path: '',
        redirect: { name: 'CashierDashboard' }
      },
      {
        path: 'dashboard',
        name: 'CashierDashboard',
        component: Dashboard
      },
      {
        path: 'profile',
        name: 'CashierProfile',
        component: Profile
      }
    ]
  }
]
// src/router/admin.routes.js
import AdminLayout from '@/layouts/AdminLayout.vue'
import Dashboard from '@/views/admin/Dashboard.vue'
import Profile from '@/views/admin/Profile.vue'
import Employees from '@/views/admin/Employees.vue'

export default [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        redirect: { name: 'AdminDashboard' }
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: Dashboard
      },
      {
        path: 'profile',
        name: 'AdminProfile',
        component: Profile
      },
      {
        path: 'employees',
        name: 'AdminEmployees',
        component: Employees
      }
    ]
  }
]
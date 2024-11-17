// src/router/admin.routes.js
import AdminLayout from '@/layouts/AdminLayout.vue'
import Dashboard from '@/views/admin/Dashboard.vue'
import Administration from '@/views/admin/Administration.vue'

export default [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
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
        path: 'administration',
        name: 'AdminAdministration',
        component: Administration
      }
    ]
  }
]
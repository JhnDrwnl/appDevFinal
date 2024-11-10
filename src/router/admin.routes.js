// src/router/admin.routes.js
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminHome from '@/views/admin/Home.vue'
import AdminDashboard from '@/views/admin/Dashboard.vue'
import InventoryManagement from '@/views/admin/InventoryManagement.vue'
import OrderManagement from '@/views/admin/OrderManagement.vue'
import ReportingAnalytics from '@/views/admin/ReportingAnalytics.vue'
import UserManagement from '@/views/admin/UserManagement.vue'

export default {
  path: '/admin',
  component: AdminLayout,
  meta: { requiresAuth: true, requiresAdmin: true },
  children: [
    {
      path: '',
      name: 'AdminHome',
      component: AdminHome,
    },
    {
      path: 'dashboard',
      name: 'AdminDashboard',
      component: AdminDashboard,
    },
    {
      path: 'inventory',
      name: 'InventoryManagement',
      component: InventoryManagement,
    },
    {
      path: 'orders',
      name: 'OrderManagement',
      component: OrderManagement,
    },
    {
      path: 'reports',
      name: 'ReportingAnalytics',
      component: ReportingAnalytics,
    },
    {
      path: 'users',
      name: 'UserManagement',
      component: UserManagement,
    },
  ],
}
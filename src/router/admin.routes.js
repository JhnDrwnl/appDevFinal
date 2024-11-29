// src/router/admin.routes.js
import AdminLayout from '@/layouts/AdminLayout.vue'
import Dashboard from '@/views/admin/Dashboard.vue'
import Profile from '@/views/admin/Profile.vue'
import Employees from '@/views/admin/Employees.vue'
import ProductList from '@/views/admin/ProductList.vue'
import CategoryList from '@/views/admin/CategoryList.vue'
import PriceRuleList from '@/views/admin/PriceRuleList.vue'

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
      },
      {
        path: 'catalog',
        name: 'AdminCatalog',
        children: [
          {
            path: 'products',
            name: 'AdminCatalogProducts',
            component: ProductList
          },
          {
            path: 'categories',
            name: 'AdminProductCategories',
            component: CategoryList
          }
        ]
      },
      {
        path: 'price-rule',
        name: 'AdminPriceRule',
        component: PriceRuleList
      },
    ]
  }
]
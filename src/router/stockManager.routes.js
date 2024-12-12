// src/router/stockManager.routes.js
import StockManagerLayout from '@/layouts/StockManagerLayout.vue'
import Dashboard from '@/views/stockManager/Dashboard.vue'
import Profile from '@/views/stockManager/Profile.vue'
import ProductList from '@/views/admin/ProductList.vue'
import CategoryList from '@/views/admin/CategoryList.vue'
import PriceRuleList from '@/views/admin/PriceRuleList.vue'
import ProductPriceRuleList from '@/views/admin/ProductPriceRuleList.vue'
import CategoryPriceRuleList from '@/views/admin/CategoryPriceRuleList.vue'
import ReservationList from '@/views/admin/ReservationList.vue'


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
      },
      {
        path: 'catalog',
        name: 'StockManagerCatalog',
        children: [
          {
            path: 'products',
            name: 'StockManagerCatalogProducts',
            component: ProductList
          },
          {
            path: 'categories',
            name: 'StockManagerProductCategories',
            component: CategoryList
          }
        ]
      },
      {
        path: 'price-rules',
        name: 'StockManagerPriceRule',
        children: [
          {
            path: 'price-rules',
            name: 'StockManagerPriceRule',
            component: PriceRuleList
          },
          {
            path: 'product-price-rules',
            name: 'StockManagerProductPriceRule',
            component: ProductPriceRuleList
          },
          {
            path: 'categories-price-rules',
            name: 'StockManagerCategoryPriceRule',
            component: CategoryPriceRuleList
          },
        ]
      },
      {
        path: 'reservation',
        name: 'StockManagerReservation',
        children: [
          {
            path: 'reservation',
            name: 'StockManagerReservation',
            component: ReservationList
          }
        ]
      },
      
      // Add more stock manager-specific routes here as needed
    ]
  }
]
// src/router/cashier.routes.js
import CashierLayout from '@/layouts/CashierLayout.vue'
import Dashboard from '@/views/cashier/Dashboard.vue'
import Profile from '@/views/cashier/Profile.vue'
import DeliveryReservation from '@/views/cashier/DeliveryReservation.vue'
import PickupReservation from '@/views/cashier/PickupReservation.vue'
import CashierPointOfSale from '@/views/cashier/PointOfSale.vue'
import SalesHistory from '@/views/cashier/SalesHistory.vue'


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
        path: 'point-of-sale',
        name: 'CashierPointOfSale',
        children: [
          {
            path: 'point-of-sale',
            name: 'CashierPointOfSale',
            component: CashierPointOfSale
          },
          {
            path: 'sales-history',
            name: 'SalesHistory',
            component: SalesHistory
          },
        ]
      },
      {
        path: 'profile',
        name: 'CashierProfile',
        component: Profile
      },
      {
        path: 'reservation',
        name: 'CashierReservation',
        children: [
          {
            path: 'pickup',
            name: 'PickupReservation',
            component: PickupReservation
          },
          {
            path: 'delivery',
            name: 'DeliveryReservation',
            component: DeliveryReservation
          },
        ]
      },
    ]
  }
]
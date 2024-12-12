// src/router/driver.routes.js
import DriverLayout from '@/layouts/DriverLayout.vue'
import Dashboard from '@/views/driver/Dashboard.vue'
import Profile from '@/views/driver/Profile.vue'
import ActiveDelivery from '@/views/driver/ActiveDelivery.vue'
import DriverNotifications from '@/components/driver/Notifications.vue'
import DeliveryDetails from '@/components/driver/DeliveryDetails.vue'
import DeliveryProcess from '@/views/driver/DeliveryProcess.vue'
import DeliveryHistory from '@/views/driver/DeliveryHistory.vue'
import CompletedDeliveryDetails from '@/components/driver/CompletedDeliveryDetails.vue'

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
      },
      {
        path: 'active-deliveries',
        name: 'ActiveDelivery',
        component: ActiveDelivery
      },
      {
        path: 'notifications',
        name: 'DriverNotifications',
        component: DriverNotifications
      },
      {
        path: 'delivery/:id',
        name: 'DeliveryDetails',
        component: DeliveryDetails,
        props: true
      },
      {
        path: 'delivery/:id/process',
        name: 'DeliveryProcess',
        component: DeliveryProcess,
        props: true
      },
      {
        path: 'delivery-history',
        name: 'DeliveryHistory',
        component: DeliveryHistory
      },
      {
        path: 'completed-deliveries/:id',
        name: 'CompletedDeliveryDetails',
        component: CompletedDeliveryDetails,
        props: true
      }
    ]
  }
]
// src/router/user.routes.js
import UserLayout from '@/layouts/UserLayout.vue'
import UserHome from '@/views/user/Home.vue'
import Basket from '@/views/user/Basket.vue'
import Reservation from '@/views/user/Reservation.vue'
import Delivery from '@/views/user/Delivery.vue'
import ReservationConfirmation from '@/views/user/ReservationConfirmation.vue'
import ReservationSuccess from '@/views/user/ReservationSuccess.vue'
import DeliveryDetails from '@/components/driver/DeliveryDetails.vue'

export default [
  {
    path: '/user',
    component: UserLayout,
    children: [
      {
        path: '',
        name: 'UserHome',
        component: UserHome,
        meta: { requiresAuth: false }, // Allow public access
      },
      {
        path: '/basket',
        name: 'Basket',
        component: Basket,
      },
      {
        path: 'reservation',
        name: 'Reservation',
        component: Reservation,
        meta: { requiresAuth: true },
      },
      {
        path: 'delivery',
        name: 'Delivery',
        component: Delivery,
        meta: { requiresAuth: true },
      },
      {
        path: 'reservation-confirmation',
        name: 'ReservationConfirmation',
        component: ReservationConfirmation,
        meta: { requiresAuth: true },
      },
      {
        path: '/reservation-success/:reservationId',
        name: 'ReservationSuccess',
        component: ReservationSuccess,
        meta: { requiresAuth: true },
      },
      {
        path: 'delivery/:id',
        name: 'DeliveryDetails',
        component: DeliveryDetails
      },
    ],
  },
]




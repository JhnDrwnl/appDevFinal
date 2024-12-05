// src/router/user.routes.js
import UserLayout from '@/layouts/UserLayout.vue'
import UserHome from '@/views/user/Home.vue'


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
    ],
  },
]




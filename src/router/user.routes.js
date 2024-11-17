// src/router/user.routes.js
import UserLayout from '@/layouts/UserLayout.vue'
import UserHome from '@/views/user/Home.vue'
// import UserProfile from '@/views/user/Profile.vue'
// import UserSettings from '@/views/user/Settings.vue'

export default [
  {
    path: '/user',
    component: UserLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'UserHome',
        component: UserHome,
      },
      // {
      //   path: 'profile',
      //   name: 'UserProfile',
      //   component: UserProfile,
      // },
      // {
      //   path: 'settings',
      //   name: 'UserSettings',
      //   component: UserSettings,
      // },
      // Add more user routes as needed
    ],
  },
]
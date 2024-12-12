// src/router/auth.routes.js
import AuthLayout from '@/layouts/AuthLayout.vue'
import LoginForm from '@/views/auth/LoginForm.vue'
import RegisterForm from '@/views/auth/RegisterForm.vue'
import EmailVerificationHandler from '@/views/auth/EmailVerificationHandler.vue'
import Account from '@/views/user/Account.vue'
import Address from '@/views/user/Address.vue'
import ReservationHistory from '@/views/user/ReservationHistory.vue'

export default [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: LoginForm,
      },
      {
        path: 'register',
        name: 'register',
        component: RegisterForm,
      },
      {
        path: 'verify-email',
        name: 'verifyEmail',
        component: EmailVerificationHandler,
      },
      {
        path: 'account',
        name: 'UserAccount',
        component: Account,
        meta: { requiresAuth: true, roles: ['user'] },
      },
      {
        path: 'address',
        name: 'Address',
        component: Address,
      },
      {
        path: 'address',
        name: 'Address',
        component: Address,
      },
      {
        path: 'reservation',
        name: 'ReservationHistory',
        component: ReservationHistory,
        meta: { requiresAuth: true }
      },
    ],
  },
  // Add a redirect for the /login path
  {
    path: '/login',
    redirect: '/auth/login'
  }
]
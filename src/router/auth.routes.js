// src/router/auth.routes.js
import AuthLayout from '@/layouts/AuthLayout.vue'
import LoginForm from '@/views/auth/LoginForm.vue'
import RegisterForm from '@/views/auth/RegisterForm.vue'
import EmailVerificationHandler from '@/views/auth/EmailVerificationHandler.vue'

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
    ],
  },
  // Add a redirect for the /login path
  {
    path: '/login',
    redirect: '/auth/login'
  }
]
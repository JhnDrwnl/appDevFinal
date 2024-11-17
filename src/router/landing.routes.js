// src/router/landing.routes.js
import LandingLayout from '@/layouts/LandingLayout.vue'
import Home from '@/views/landing/Home.vue'
import About from '@/views/landing/About.vue'
import Contact from '@/views/landing/Contact.vue'

export default [
  {
    path: '/',
    component: LandingLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
      },
      {
        path: 'about',
        name: 'About',
        component: About,
      },
      {
        path: 'contact',
        name: 'Contact',
        component: Contact,
      },
    ],
  },
]
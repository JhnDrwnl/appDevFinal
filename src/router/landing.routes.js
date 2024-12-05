// src/router/landing.routes.js
import HomeLayout from '@/views/landing/Home.vue'
import About from '@/components/landing/About.vue'
import LatestProducts from '@/components/landing/LatestProducts.vue'
import PoultryTips from '@/views/landing/PoultryTips.vue'
import Contact from '@/views/landing/Contact.vue'

export default [
  {
    path: '/',
    component: HomeLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: About,
      },
      {
        path: 'latestproducts',
        name: 'Products',
        component: LatestProducts,
      },
    ],
  },
  {
    path: '/poultry-tips',
    name: 'PoultryTips',
    component: PoultryTips,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
  },
]
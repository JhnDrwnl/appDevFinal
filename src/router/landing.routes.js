// src/router/landing.routes.js
import HomeLayout from '@/views/landing/Home.vue'
import About from '@/components/landing/About.vue'
import LatestProducts from '@/components/landing/LatestProducts.vue'
// import Contact from '@/components/landing/Contact.vue'

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
        path: 'about',
        name: 'About',
        component: About,
      },
      {
        path: 'latestproducts',
        name: 'Products',
        component: LatestProducts,
      },
      // {
      //   path: 'contact',
      //   name: 'Contact',
      //   component: Contact,
      // },
    ],
  },
]
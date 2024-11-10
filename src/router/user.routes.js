import UserLayout from '@/layouts/UserLayout.vue'
import Home from '@/views/user/Home.vue'
import ProductCatalog from '@/views/user/ProductCatalog.vue'
import ProductDetails from '@/views/user/ProductDetails.vue'
import Cart from '@/views/user/Cart.vue'
import Checkout from '@/views/user/Checkout.vue'
import Profile from '@/views/user/Profile.vue'

export default [
  {
    path: '/user',
    component: UserLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'UserHome',
        component: Home
      },
      {
        path: 'catalog',
        name: 'ProductCatalog',
        component: ProductCatalog
      },
      {
        path: 'product/:id',
        name: 'ProductDetails',
        component: ProductDetails
      },
      {
        path: 'cart',
        name: 'Cart',
        component: Cart
      },
      {
        path: 'checkout',
        name: 'Checkout',
        component: Checkout
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile
      }
    ]
  }
]
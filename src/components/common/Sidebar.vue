<template>
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <nav class="divide-y divide-gray-200">
        <router-link 
          v-for="(item, index) in menuItems" 
          :key="index"
          :to="item.to"
          class="flex items-center px-4 py-3 text-sm"
          :class="[
            'text-gray-700 hover:bg-gray-50 transition-colors',
            route.path === item.to ? 'bg-gray-50 font-medium' : ''
          ]"
        >
          <component :is="item.icon" class="mr-3 h-5 w-5" :class="route.path === item.to ? 'ml-2' : ''" />
          {{ item.name }}
        </router-link>
      </nav>
    </div>
  </template>
  
  <script setup>
  import { useRoute } from 'vue-router'
  import { 
    LogIn,
    UserPlus,
    Key,
    User,
    BookOpen,
    Heart,
    ShoppingBag,
    Download,
    Gift,
    RotateCcw,
    CreditCard,
    Mail
  } from 'lucide-vue-next'
  
  const route = useRoute()
  
  const menuItems = [
    { name: 'Login', to: '/auth/login', icon: LogIn },
    { name: 'Register', to: '/auth/register', icon: UserPlus },
    { name: 'Forgotten Password', to: '/auth/forgot-password', icon: Key },
    { name: 'My Account', to: '/account', icon: User },
    { name: 'Address Book', to: '/account/address', icon: BookOpen },
    { name: 'Wish List', to: '/account/wishlist', icon: Heart },
    { name: 'Order History', to: '/account/orders', icon: ShoppingBag },
    { name: 'Downloads', to: '/account/downloads', icon: Download },
    { name: 'Reward Points', to: '/account/rewards', icon: Gift },
    { name: 'Returns', to: '/account/returns', icon: RotateCcw },
    { name: 'Transactions', to: '/account/transactions', icon: CreditCard },
    { name: 'Newsletter', to: '/account/newsletter', icon: Mail },
  ]
  </script>
  
  
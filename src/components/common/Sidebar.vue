<!-- components/common/Sidebar.vue -->
<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <nav class="divide-y divide-gray-200">
      <router-link 
        v-for="item in filteredMenuItems" 
        :key="item.name"
        :to="item.to"
        class="flex items-center px-4 py-3 text-sm"
        :class="[
          'text-gray-700 hover:bg-gray-50 transition-colors',
          route.path === item.to ? 'bg-gray-50 font-medium' : ''
        ]"
        @click.native="handleItemClick(item)"
      >
        <component :is="item.icon" class="mr-3 h-5 w-5" :class="route.path === item.to ? 'ml-2' : ''" />
        {{ item.name }}
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { 
  LogIn,
  UserPlus,
  User,
  BookOpen,
  RotateCcw,
  Mail,
  LogOut
} from 'lucide-vue-next'
import { ShoppingBasket} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const menuItems = [
  { name: 'Login', to: '/auth/login', icon: LogIn, requiresGuest: true },
  { name: 'Register', to: '/auth/register', icon: UserPlus, requiresGuest: true },
  { name: 'My Account', to: '/auth/account', icon: User, requiresAuth: true },
  { name: 'Address Book', to: '/auth/address', icon: BookOpen, requiresAuth: true },
  { name: 'Reservation History', to: '/auth/reservation', icon: ShoppingBasket, requiresAuth: true },
  { name: 'Newsletter', to: '/account/newsletter', icon: Mail, requiresAuth: true },
]

const logoutItem = { name: 'Logout', to: '#', icon: LogOut, requiresAuth: true }

const filteredMenuItems = computed(() => {
  if (authStore.isAuthenticated) {
    return [...menuItems.filter(item => !item.requiresGuest), logoutItem]
  }
  return menuItems
})

const handleItemClick = (item) => {
  if (item.requiresAuth && !authStore.isAuthenticated) {
    router.push('/auth/register')
  } else if (item.name === 'Logout') {
    handleLogout()
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>
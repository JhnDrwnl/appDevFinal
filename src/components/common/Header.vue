<template>
  <header class="px-6 lg:px-8 py-4">
    <div class="max-w-7xl mx-auto w-full">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200">
        <nav class="flex items-center justify-between h-16 px-6">
          <router-link to="/user/home" class="text-xl font-bold text-gray-900">Poultry Paradise</router-link>
          <div class="flex items-center gap-6">
            <router-link to="/user/shop" class="p-2.5 rounded-xl text-gray-700 hover:bg-gray-50/75 transition-colors duration-200">Shop</router-link>
            
            <!-- Shopping Cart -->
            <button class="text-gray-500 hover:text-gray-700 transition-colors duration-200 relative">
              <ShoppingBag class="h-[20px] w-[20px]" />
              <span class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </button>

            <!-- Notifications -->
            <button class="text-gray-500 hover:text-gray-700 transition-colors duration-200 relative">
              <Bell class="h-[20px] w-[20px]" />
              <span v-if="unreadNotificationsCount > 0" class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {{ unreadNotificationsCount }}
              </span>
            </button>

            <!-- Profile Dropdown -->
            <div class="relative" ref="profileDropdown">
              <button @click="toggleDropdown" class="flex items-center focus:outline-none">
                <img 
                  :src="profilePicture" 
                  alt="User profile" 
                  class="w-10 h-10 rounded-xl object-cover border border-gray-200"
                />
              </button>
              <div 
                v-show="isDropdownOpen" 
                class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-20 border border-gray-100"
              >
                <router-link to="/user/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Account</router-link>
                <router-link to="/user/orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Orders</router-link>
                <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Logout</button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { useRouter } from 'vue-router'
import { ShoppingBag, Bell } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const profilePicture = ref('/placeholder.svg?height=40&width=40')
const isDropdownOpen = ref(false)
const profileDropdown = ref(null)
const unreadNotificationsCount = ref(0)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleClickOutside = (event) => {
  if (profileDropdown.value && !profileDropdown.value.contains(event.target)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push({ name: 'login' })
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>
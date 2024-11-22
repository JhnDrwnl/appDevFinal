<template>
    <header data-header class="px-6 lg:px-8 py-4">
      <div class="max-w-7xl mx-auto w-full">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between h-16 px-6">
            <div class="flex items-center gap-4">
              <button
                @click="$emit('toggle-sidebar')"
                class="p-2.5 rounded-xl text-black hover:bg-gray-50/75 transition-colors duration-200"
                aria-label="Toggle sidebar"
              >
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0H18V2H0V0Z" fill="black"/>
                  <path d="M0 5H12V7H0V5Z" fill="black"/>
                  <path d="M0 10H6V12H0V10Z" fill="black"/>
                </svg>
              </button>
            </div>
  
            <div class="flex items-center gap-4 md:gap-6">
              <!-- Search -->
              <div class="hidden md:flex items-center">
                <div class="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    class="w-80 px-5 py-2.5 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-transparent transition-all duration-200"
                  />
                  <Search class="absolute right-4 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
  
              <!-- Notifications -->
              <button class="text-gray-500 hover:text-gray-700 transition-colors duration-200 relative">
                <Bell class="w-5 h-5" />
                <span class="absolute -top-1 -right-1 bg-green-500 w-2 h-2 rounded-full"></span>
              </button>
  
              <!-- Profile Dropdown -->
              <div class="relative ml-auto">
                <button
                  @click="toggleUserMenu"
                  class="focus:outline-none focus:ring-2 focus:ring-blue-500/10 rounded-xl transition-all duration-200"
                  aria-haspopup="true"
                  :aria-expanded="isUserMenuOpen"
                >
                  <img
                    class="w-9 h-9 rounded-xl object-cover ring-2 ring-gray-100"
                    :src="user?.photoURL || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5\' stroke=\'%23bec3c9\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E'"
                    :alt="user?.displayName || 'User avatar'"
                  />
                </button>
  
                <div
                  v-if="isUserMenuOpen"
                  class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                  style="right: -24px;"
                >
                  <div class="px-4 py-3 border-b border-gray-50">
                    <p class="text-sm font-medium text-gray-900">{{ user?.email || 'Unknown User' }}</p>
                    <p class="text-xs font-medium text-gray-500 mt-1">{{ user?.role || 'Manager' }}</p>
                  </div>
                  <router-link
                    :to="{ name: 'ManagerProfile' }"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    @click="closeUserMenu"
                  >
                    <Settings class="w-4 h-4 mr-2" />
                    My Preferences
                  </router-link>
                  <div class="border-t border-gray-50 mt-2 pt-2">
                    <a
                      href="#"
                      @click.prevent="handleLogout"
                      class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Sign out
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useAuthStore } from '@/store/modules/auth'
  import { useRouter } from 'vue-router'
  import { Search, Bell, Settings } from 'lucide-vue-next'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  const isUserMenuOpen = ref(false)
  const user = computed(() => authStore.user)
  
  const toggleUserMenu = () => {
    isUserMenuOpen.value = !isUserMenuOpen.value
  }
  
  const closeUserMenu = () => {
    isUserMenuOpen.value = false
  }
  
  const handleLogout = async () => {
    try {
      await authStore.logout()
      closeUserMenu()
      router.push({ name: 'login' })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  defineProps({
    isSidebarOpen: {
      type: Boolean,
      required: true
    }
  })
  
  defineEmits(['toggle-sidebar'])
  </script>
<template>
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <!-- Left side: Hamburger menu for mobile -->
          <button @click="toggleSidebar" class="lg:hidden">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
  
          <!-- Center: Search bar -->
          <div class="flex-1 max-w-xl mx-4">
            <div class="relative">
              <input
                type="text"
                placeholder="Search..."
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div class="absolute left-3 top-2">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
  
          <!-- Right side: Notifications and Profile -->
          <div class="flex items-center">
            <!-- Notifications -->
            <div class="relative mr-4">
              <button @click="toggleNotifications" class="text-gray-500 hover:text-gray-700">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div v-if="showNotifications" class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                <!-- Notifications dropdown content -->
                <div class="py-2">
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Notification 1</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Notification 2</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Notification 3</a>
                </div>
              </div>
            </div>
  
            <!-- Profile Dropdown -->
            <div class="relative">
              <button @click="toggleProfileMenu" class="flex items-center">
                <img class="h-8 w-8 rounded-full" src="https://via.placeholder.com/40" alt="User avatar" />
                <span class="ml-2 text-sm font-medium text-gray-700">{{ user.email }}</span>
              </button>
              <div v-if="showProfileMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20">
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <a @click="logout" href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useAuth } from '@/composables/useAuth'
  
  const { user, logout } = useAuth()
  
  const showNotifications = ref(false)
  const showProfileMenu = ref(false)
  
  const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value
    showProfileMenu.value = false
  }
  
  const toggleProfileMenu = () => {
    showProfileMenu.value = !showProfileMenu.value
    showNotifications.value = false
  }
  
  const toggleSidebar = () => {
    // Emit an event to toggle the sidebar
    // This will be handled by the parent component
    emit('toggle-sidebar')
  }
  
  const emit = defineEmits(['toggle-sidebar'])
  </script>
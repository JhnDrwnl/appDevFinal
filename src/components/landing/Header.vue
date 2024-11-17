<template>
  <header class="bg-white">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-20">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <svg class="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 2C13.5 2 15.834 2.66 18.666 4.666C21.5 6.666 21.5 9.334 21.5 9.334V14.666C21.5 14.666 21.5 17.334 18.666 19.334C15.834 21.334 13.5 22 13.5 22C13.5 22 11.166 21.334 8.334 19.334C5.5 17.334 5.5 14.666 5.5 14.666V9.334C5.5 9.334 5.5 6.666 8.334 4.666C11.166 2.66 13.5 2 13.5 2Z"/>
            </svg>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              DarwinAppdev
            </span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex md:items-center md:space-x-8">
          <router-link
            v-for="item in navItems"
            :key="item.name"
            :to="item.to"
            class="text-sm font-medium transition-colors duration-200"
            :class="[
              $route.name === item.name
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            ]"
          >
            <div class="flex items-center space-x-1">
              <span>{{ item.text }}</span>
              <span v-if="item.badge" 
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {{ item.badge }}
              </span>
            </div>
          </router-link>

          <div class="flex items-center">
            <div class="relative inline-flex h-10 rounded-full bg-gray-100 p-1 shadow-sm">
              <router-link
                :to="{ name: 'login' }"
                class="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
                :class="[$route.name === 'login' ? 'text-white bg-[#0095FF]' : 'text-gray-700 hover:text-gray-900']"
              >
                <span class="relative z-10">Log in</span>
              </router-link>
              <router-link
                :to="{ name: 'register' }"
                class="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
                :class="[$route.name !== 'login' ? 'text-white bg-[#0095FF]' : 'text-gray-700 hover:text-gray-900']"
              >
                <span class="relative z-10">Register</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center md:hidden">
          <button
            @click="toggleMobileMenu"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="w-6 h-6"
              :class="{ 'hidden': mobileMenuOpen, 'block': !mobileMenuOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              class="w-6 h-6"
              :class="{ 'block': mobileMenuOpen, 'hidden': !mobileMenuOpen }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        class="md:hidden"
        :class="{ 'block': mobileMenuOpen, 'hidden': !mobileMenuOpen }"
      >
        <div class="pt-2 pb-3 space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.name"
            :to="item.to"
            class="block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200"
            :class="[
              $route.name === item.name
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            ]"
            @click="closeMobileMenu"
          >
            <div class="flex items-center space-x-1">
              <span>{{ item.text }}</span>
              <span v-if="item.badge" 
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {{ item.badge }}
              </span>
            </div>
          </router-link>
        </div>
        <div class="pt-4 pb-3 border-t border-gray-200">
          <div class="px-3">
            <div class="relative flex h-10 rounded-full bg-gray-100 p-1 shadow-sm">
              <router-link
                :to="{ name: 'login' }"
                class="relative inline-flex flex-1 items-center justify-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
                :class="[$route.name === 'login' ? 'text-white bg-[#0095FF]' : 'text-gray-700 hover:text-gray-900']"
                @click="closeMobileMenu"
              >
                <span class="relative z-10">Log in</span>
              </router-link>
              <router-link
                :to="{ name: 'register' }"
                class="relative inline-flex flex-1 items-center justify-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
                :class="[$route.name !== 'login' ? 'text-white bg-[#0095FF]' : 'text-gray-700 hover:text-gray-900']"
                @click="closeMobileMenu"
              >
                <span class="relative z-10">Register</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

const navItems = [
  { name: 'home', to: '/', text: 'Shop' },
  { name: 'products', to: '/products', text: 'Products', badge: 'New' },
  { name: 'categories', to: '/categories', text: 'Categories' },
  { name: 'deals', to: '/deals', text: 'Deals' },
  { name: 'about', to: '/about', text: 'About' },
  { name: 'contact', to: '/contact', text: 'Contact' },
]

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>
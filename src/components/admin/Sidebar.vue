<template>
    <aside :class="['bg-gray-800 text-white w-64 min-h-screen', { 'hidden': !isOpen }]">
      <div class="px-4 py-5">
        <h1 class="text-2xl font-semibold">Darwin Appdev</h1>
      </div>
      <nav class="mt-5">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="block px-4 py-2 mt-2 text-sm font-semibold text-gray-200 rounded-lg hover:bg-gray-700"
          :class="{ 'bg-gray-700': isActive(item.path) }"
        >
          {{ item.name }}
        </router-link>
      </nav>
    </aside>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRoute } from 'vue-router'
  
  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: true
    }
  })
  
  const route = useRoute()
  
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Settings', path: '/admin/settings' },
  ]
  
  const isActive = (path) => {
    return route.path.startsWith(path)
  }
  </script>
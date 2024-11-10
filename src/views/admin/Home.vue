<!-- src/views/admin/Home.vue -->
<template>
    <div class="admin-home">
      <h1 class="text-3xl font-semibold mb-6">Welcome to Admin Panel</h1>
      <p class="mb-4">Select an option from the sidebar to manage your store.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="item in quickLinks" :key="item.path" class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-2">{{ item.name }}</h2>
          <p class="mb-4">{{ item.description }}</p>
          <router-link :to="item.path" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Go to {{ item.name }}
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const quickLinks = [
    { 
      name: 'Dashboard', 
      path: '/admin/dashboard',
      description: 'View key metrics and performance indicators.'
    },
    { 
      name: 'Inventory', 
      path: '/admin/inventory',
      description: 'Manage your product inventory and stock levels.'
    },
    { 
      name: 'Orders', 
      path: '/admin/orders',
      description: 'View and process customer orders.'
    },
    { 
      name: 'Reports', 
      path: '/admin/reports',
      description: 'Generate and view sales and performance reports.'
    },
    { 
      name: 'Users', 
      path: '/admin/users',
      description: 'Manage user accounts and permissions.'
    },
  ]
  </script>
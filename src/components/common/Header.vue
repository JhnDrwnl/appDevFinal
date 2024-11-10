<template>
  <header class="bg-white shadow-sm">
    <nav class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <router-link to="/user/home" class="text-xl font-bold text-indigo-600">Poultry Paradise</router-link>
        <div class="flex space-x-4">
          <router-link to="/user/catalog" class="text-gray-700 hover:text-indigo-600">Catalog</router-link>
          <router-link to="/user/cart" class="text-gray-700 hover:text-indigo-600">Cart</router-link>
          <router-link to="/user/profile" class="text-gray-700 hover:text-indigo-600">Profile</router-link>
          <button @click="logout" class="text-gray-700 hover:text-indigo-600">Logout</button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { logout } = useAuth()
</script>
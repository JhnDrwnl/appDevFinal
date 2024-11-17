<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'

const authStore = useAuthStore()

onMounted(async () => {
  try {
    await authStore.initializeAuth()
  } catch (error) {
    console.error('Error initializing auth:', error)
  }
})
</script>

<style>
/* Global styles can be added here if needed */
</style>
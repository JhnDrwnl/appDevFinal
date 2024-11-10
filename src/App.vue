<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { auth } from '@/services/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const authStore = useAuthStore()

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, update the store
      authStore.user = user
    } else {
      // User is signed out, clear the store
      authStore.user = null
    }
  })
})
</script>
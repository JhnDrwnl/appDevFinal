<template>
  <header class="bg-white shadow">
    <nav class="container mx-auto px-6 py-3">
      <div class="flex justify-between items-center">
        <div>
          <router-link to="/" class="text-gray-800 text-xl font-bold md:text-2xl hover:text-gray-700">
            Poultry Paradise
          </router-link>
        </div>
        <div class="flex items-center">
          <button @click="showLoginModal = true" class="text-gray-800 hover:text-blue-600 mx-4 text-sm md:text-base">
            Login
          </button>
          <button @click="showRegisterModal = true" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 text-sm md:text-base">
            Register
          </button>
        </div>
      </div>
    </nav>
    <LoginModal v-if="showLoginModal" @close="showLoginModal = false" :initialEmail="initialEmail" />
    <RegisterModal v-if="showRegisterModal" @close="showRegisterModal = false" @registrationSuccess="handleRegistrationSuccess" />
  </header>
</template>

<script setup>
import { ref } from 'vue'
import LoginModal from '@/views/auth/LoginModal.vue'
import RegisterModal from '@/views/auth/RegisterModal.vue'

const showLoginModal = ref(false)
const showRegisterModal = ref(false)
const initialEmail = ref('')

const handleRegistrationSuccess = (email) => {
  showRegisterModal.value = false
  initialEmail.value = email
  showLoginModal.value = true
}
</script>
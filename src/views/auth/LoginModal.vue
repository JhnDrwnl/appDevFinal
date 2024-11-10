<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
    <div class="relative top-20 mx-auto p-5 border w-[28rem] shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Login</h3>
        <div class="mt-2 px-7 py-3">
          <form @submit.prevent="handleLogin">
            <input 
              type="email" 
              v-model="email" 
              placeholder="Email" 
              required
              class="mt-2 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1"
            />
            <input 
              type="password" 
              v-model="password" 
              placeholder="Password" 
              required
              class="mt-2 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1"
            />
            <button 
              type="submit"
              class="mt-4 w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              :disabled="isLoading"
            >
              <Spinner v-if="isLoading" class="mr-2" />
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </button>
          </form>
          <button 
            @click="handleForgotPassword"
            class="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Forgot Password?
          </button>
        </div>
      </div>
      <div class="items-center px-4 py-3">
        <button 
          id="ok-btn" 
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Close
        </button>
      </div>
      <div v-if="message" :class="['mt-2 text-center', message.type === 'error' ? 'text-red-600' : 'text-green-600']">
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Spinner from '@/components/common/Spinner.vue'

const { login, forgotPassword, error: authError } = useAuth()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const message = ref(null)

const handleLogin = async () => {
  message.value = null
  try {
    isLoading.value = true
    await login(email.value, password.value)
    message.value = { type: 'success', text: 'Login successful!' }
    setTimeout(() => {
      emit('close')
    }, 1000)
  } catch (err) {
    console.error('Login failed:', err)
    message.value = { type: 'error', text: authError.value || 'Login failed. Please try again.' }
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = async () => {
  if (!email.value) {
    message.value = { type: 'error', text: 'Please enter your email address' }
    return
  }
  try {
    isLoading.value = true
    await forgotPassword(email.value)
    message.value = { type: 'success', text: 'Password reset email sent. Please check your inbox.' }
  } catch (err) {
    console.error('Failed to send password reset email:', err)
    message.value = { type: 'error', text: 'Failed to send password reset email. Please try again.' }
  } finally {
    isLoading.value = false
  }
}

const emit = defineEmits(['close'])
</script>
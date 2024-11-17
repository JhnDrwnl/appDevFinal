<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <Alert
        v-if="message"
        :type="alertType"
        v-model="showAlert"
        dismissible
      >
        {{ message }}
      </Alert>

      <div class="bg-white rounded-3xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 2C13.5 2 15.834 2.66 18.666 4.666C21.5 6.666 21.5 9.334 21.5 9.334V14.666C21.5 14.666 21.5 17.334 18.666 19.334C15.834 21.334 13.5 22 13.5 22C13.5 22 11.166 21.334 8.334 19.334C5.5 17.334 5.5 14.666 5.5 14.666V9.334C5.5 9.334 5.5 6.666 8.334 4.666C11.166 2.66 13.5 2 13.5 2Z"/>
            </svg>
            <h2 class="ml-2 text-2xl font-bold text-gray-900">DarwinAppdev</h2>
          </div>
          <h3 class="text-xl font-semibold text-gray-900">Sign in to your account</h3>
        </div>

        <form @submit.prevent="login" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div class="w-full max-w-sm mx-auto">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="w-full px-4 py-3 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
                placeholder="Email Address"
              />
            </div>
          </div>

          <div class="relative">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative w-full max-w-sm mx-auto">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
                placeholder="Enter your password"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <EyeIcon v-if="!showPassword" class="w-5 h-5" />
                <EyeOffIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Remember this Device
              </label>
            </div>

            <div class="text-sm">
              <a @click.prevent="forgotPassword" href="#" class="font-medium text-blue-600 hover:text-blue-500">
                Forgot Password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isSigningIn"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {{ isSigningIn ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="text-center mt-6">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <router-link to="/auth/register" class="font-medium text-blue-600 hover:text-blue-500">
              Sign up here
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import Alert from '@/components/common/Alert.vue'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

const email = ref('')
const password = ref('')
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showPassword = ref(false)

const message = ref('')
const alertType = ref('info')
const isSigningIn = ref(false)
const isResettingPassword = ref(false)
const showAlert = ref(false)

const rememberMe = ref(authStore.rememberMe)

watch(() => authStore.rememberMe, (newValue) => {
  rememberMe.value = newValue
})

const alertTypes = {
  error: 'error',
  success: 'success',
  info: 'info',
  warning: 'warning'
}

onMounted(() => {
  handleRouteQuery()
})

watch(() => route.query, handleRouteQuery)

function handleRouteQuery() {
  if (route.query.registered) {
    setAlert(route.query.message || 'Registration successful. Please log in.', alertTypes.success)
  } else if (route.query.emailVerified) {
    setAlert('Email verified successfully. Please log in.', alertTypes.success)
  }
  if (route.query.email) {
    email.value = route.query.email
  }
}

function setAlert(msg, type = alertTypes.info) {
  message.value = msg
  alertType.value = type
  showAlert.value = true
}

const login = async () => {
  if (isSigningIn.value) return

  try {
    isSigningIn.value = true
    const result = await authStore.login(email.value, password.value, rememberMe.value)
    if (result.success) {
      router.push(authStore.isAdmin ? { name: 'AdminDashboard' } : { name: 'UserHome' })
    } else {
      setAlert(result.error, alertTypes.error)
    }
  } catch (err) {
    console.error('Login failed:', err)
    setAlert('An unexpected error occurred. Please try again.', alertTypes.error)
  } finally {
    isSigningIn.value = false
  }
}

const forgotPassword = async () => {
  if (isResettingPassword.value) return
  if (!email.value) {
    setAlert('Please enter your email address', alertTypes.warning)
    return
  }

  try {
    isResettingPassword.value = true
    const result = await authStore.sendPasswordResetEmail(email.value)
    if (result.success) {
      setAlert(result.message, alertTypes.success)
    } else {
      setAlert(result.error, alertTypes.error)
    }
  } catch (err) {
    console.error('Password reset failed:', err)
    setAlert('An unexpected error occurred. Please try again.', alertTypes.error)
  } finally {
    isResettingPassword.value = false
  }
}
</script>

<style scoped>
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

.bg-coral-400 {
  background-color: #ff7f7f;
}
</style>
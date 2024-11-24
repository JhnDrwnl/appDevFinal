<!-- views/auth/Login.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid md:grid-cols-2 gap-8">
      <!-- New Customer Section -->
      <div class="bg-white p-8 rounded-lg shadow-sm">
        <h2 class="text-2xl font-bold mb-4">New Customer</h2>
        <h3 class="text-lg text-gray-700 mb-4">Register Account</h3>
        <p class="text-gray-600 mb-6">
          By creating an account you will be able to shop faster, be up to date on an order's status, and keep track of the orders you have previously made.
        </p>
        <router-link 
          to="/auth/register"
          class="inline-block bg-[#FF9934] text-white px-6 py-2 rounded-full hover:bg-[#FF8000] transition-colors duration-300"
        >
          CONTINUE
        </router-link>
      </div>

      <!-- Returning Customer Section -->
      <div class="bg-white p-8 rounded-lg shadow-sm">
        <h2 class="text-2xl font-bold mb-4">Returning Customer</h2>
        <p class="text-gray-700 mb-6">I am a returning customer</p>
        
        <Alert
          v-if="message"
          :type="alertType"
          v-model="showAlert"
          dismissible
        >
          {{ message }}
        </Alert>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-700">
              E-Mail Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:border-transparent"
              placeholder="E-Mail Address"
            />
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:border-transparent"
                placeholder="Password"
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

          <!-- Remember Me Checkbox -->
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="rememberMe"
              type="checkbox"
              class="h-4 w-4 text-[#FF9934] focus:ring-[#FF9934] border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <!-- Forgotten Password Link -->
          <div class="text-right">
            <a 
              @click.prevent="forgotPassword"
              href="#"
              class="text-[#FF9934] hover:text-[#FF8000] text-sm"
            >
              Forgotten Password
            </a>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            class="w-full bg-[#FF9934] text-white px-6 py-2 rounded-full hover:bg-[#FF8000] transition-colors duration-300"
            :disabled="isSigningIn"
          >
            <span v-if="isSigningIn">
              <span class="inline-block animate-spin mr-2">
                <LoaderIcon class="w-5 h-5" />
              </span>
              Logging in...
            </span>
            <span v-else>LOGIN</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import Alert from '@/components/common/Alert.vue'
import { EyeIcon, EyeOffIcon, LoaderIcon } from 'lucide-vue-next'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const message = ref('')
const alertType = ref('info')
const isSigningIn = ref(false)
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

const handleLogin = async () => {
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
  if (!email.value) {
    setAlert('Please enter your email address', alertTypes.warning)
    return
  }

  try {
    const result = await authStore.sendPasswordResetEmail(email.value)
    if (result.success) {
      setAlert(result.message, alertTypes.success)
    } else {
      setAlert(result.error, alertTypes.error)
    }
  } catch (err) {
    console.error('Password reset failed:', err)
    setAlert('An unexpected error occurred. Please try again.', alertTypes.error)
  }
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}
</style>
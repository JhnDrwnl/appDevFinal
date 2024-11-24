<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid md:grid-cols-2 gap-8">
      <!-- Registration Form Section -->
      <div class="bg-white p-8 rounded-lg shadow-sm">
        <h2 class="text-2xl font-bold mb-4">Register</h2>
        <p class="text-gray-700 mb-6">Create your account</p>
        
        <form @submit.prevent="register" class="space-y-6">
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

          <!-- Confirm Password Field -->
          <div class="space-y-2">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:border-transparent"
                placeholder="Confirm Password"
              />
              <button 
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <EyeIcon v-if="!showConfirmPassword" class="w-5 h-5" />
                <EyeOffIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            :class="[
              'w-full text-white px-6 py-2 rounded-full transition-colors duration-300',
              passwordsMatch && !isRegistering
                ? 'bg-[#FF9934] hover:bg-[#FF8000]'
                : 'bg-gray-400 cursor-not-allowed'
            ]"
            :disabled="isRegistering || !passwordsMatch"
          >
            <span v-if="isRegistering">
              <span class="inline-block animate-spin mr-2">
                <LoaderIcon class="w-5 h-5" />
              </span>
              Registering...
            </span>
            <span v-else>REGISTER</span>
          </button>
        </form>
      </div>

      <!-- Already have an account Section -->
      <div class="bg-white p-8 rounded-lg shadow-sm">
        <h2 class="text-2xl font-bold mb-4">Already have an account?</h2>
        <p class="text-gray-600 mb-6">
          If you already have an account with us, please log in at the login page.
        </p>
        <router-link 
          to="/auth/login"
          class="inline-block bg-[#FF9934] text-white px-6 py-2 rounded-full hover:bg-[#FF8000] transition-colors duration-300"
        >
          LOGIN
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { EyeIcon, EyeOffIcon, LoaderIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isRegistering = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value && password.value !== ''
})

const register = async () => {
  if (!passwordsMatch.value) {
    alert('Passwords do not match')
    return
  }

  try {
    isRegistering.value = true
    const result = await authStore.register(email.value, password.value)
    if (result.success) {
      router.push({ 
        name: 'login', 
        query: { 
          registered: 'true',
          email: email.value,
          message: 'Registration successful. Please check your email to verify your account before logging in.'
        }
      })
    } else {
      alert(result.error)
    }
  } catch (err) {
    console.error('Registration error:', err)
    alert('An unexpected error occurred. Please try again.')
  } finally {
    isRegistering.value = false
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


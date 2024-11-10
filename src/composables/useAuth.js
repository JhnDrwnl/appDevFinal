// src/composables/useAuth.js
import { computed } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const login = async (email, password) => {
    try {
      await authStore.login(email, password)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (email, password) => {
    try {
      await authStore.register(email, password)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authStore.logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const forgotPassword = async (email) => {
    try {
      await authStore.forgotPassword(email)
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    }
  }

  return {
    user: computed(() => authStore.currentUser),
    error: computed(() => authStore.error),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin: computed(() => authStore.isAdmin),
    login,
    register,
    logout,
    forgotPassword
  }
}
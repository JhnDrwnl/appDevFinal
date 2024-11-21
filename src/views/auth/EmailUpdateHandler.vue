<!-- src/views/auth/EmailUpdateHandler.vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Update
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ statusMessage }}
        </p>
      </div>
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
      <div v-else-if="error" class="text-center text-red-600">
        {{ error }}
      </div>
      <div v-else-if="success" class="text-center text-green-600">
        Your email has been successfully updated. You will be redirected to the login page shortly.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useProfileManagementStore } from '@/store/modules/profileManagement'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileManagementStore()

const loading = ref(true)
const error = ref(null)
const success = ref(false)
const statusMessage = ref('Verifying your email update...')

onMounted(async () => {
  const oobCode = route.query.oobCode

  if (!oobCode) {
    error.value = 'Invalid or missing verification code.'
    loading.value = false
    return
  }

  try {
    const result = await authStore.completeEmailUpdate(oobCode)
    if (result.success) {
      success.value = true
      statusMessage.value = 'Email updated successfully!'
      
      // Update the email in the profile store
      await profileStore.updateProfile({ email: authStore.user.email })
      
      // Remove the pendingEmailUpdate from the profile
      await profileStore.removePendingEmailUpdate()

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push({ 
          name: 'login', 
          query: { 
            emailUpdated: 'true',
            newEmail: authStore.user.email
          }
        })
      }, 3000)
    } else {
      throw new Error(result.error)
    }
  } catch (err) {
    error.value = err.message || 'An error occurred while updating your email.'
  } finally {
    loading.value = false
  }
})
</script> -->
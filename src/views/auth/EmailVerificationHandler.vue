<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="px-6 py-8 text-center">
        <div v-if="isLoading" class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p class="mt-4 text-muted-foreground">Verifying your email...</p>
        </div>
        <div v-else-if="error" class="text-center">
          <svg class="mx-auto h-12 w-12 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 class="mt-4 text-xl font-semibold text-foreground">Verification Failed</h2>
          <p class="mt-2 text-muted-foreground">{{ error }}</p>
        </div>
        <div v-else>
          <svg class="mx-auto h-12 w-12 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 class="mt-4 text-xl font-semibold text-foreground">Your email has been verified</h2>
          <p class="mt-2 text-muted-foreground">You can now sign in with your new account</p>
          <p class="mt-4 text-sm text-muted-foreground">Redirecting to login page...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAuth, applyActionCode } from 'firebase/auth'

const router = useRouter()
const route = useRoute()

const isLoading = ref(true)
const error = ref(null)

onMounted(async () => {
  const actionCode = route.query.oobCode
  const auth = getAuth()

  if (actionCode) {
    try {
      await applyActionCode(auth, actionCode)
      isLoading.value = false
      
      const verifiedEmail = auth.currentUser ? auth.currentUser.email : route.query.email
      if (verifiedEmail) {
        localStorage.setItem('verifiedEmail', verifiedEmail)
      }
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push({ 
          name: 'login', 
          query: { 
            verified: 'true',
            email: verifiedEmail || ''
          }
        })
      }, 3000)
    } catch (err) {
      console.error('Verification error:', err)
      error.value = 'An error occurred during email verification. Please try again.'
      isLoading.value = false
    }
  } else {
    error.value = 'Invalid verification link.'
    isLoading.value = false
  }
})
</script>
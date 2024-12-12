<!-- views/user/ReservationSuccess.vue -->
<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div class="bg-white shadow-lg rounded-lg max-w-2xl w-full mx-auto overflow-hidden">
        <div class="bg-[#FF9934] p-4 text-white text-center">
          <h1 class="text-2xl font-bold">Reservation Successful</h1>
        </div>
        <div v-if="isLoading" class="p-6 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9934] mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading reservation details...</p>
        </div>
        <div v-else-if="error" class="p-6 text-center">
          <p class="text-red-500">{{ error }}</p>
        </div>
        <div v-else-if="reservation" class="p-6 bg-white border-b border-gray-200">
          <div class="flex justify-center mb-4">
            <CheckCircle class="text-green-500 h-16 w-16" />
          </div>
          <p class="text-gray-700 text-center mb-4">
            Your reservation has been successfully created and is now pending confirmation.
          </p>
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h2 class="text-lg font-semibold text-gray-800 mb-2">Reservation Details</h2>
            <div class="space-y-2">
              <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
                <span class="text-gray-600">Reservation ID:</span>
                <span class="font-mono text-gray-800">{{ reservation.id }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
                <span class="text-gray-600">Date and Time:</span>
                <span class="text-gray-800">{{ formatDate(reservation.createdAt) }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
                <span class="text-gray-600">Type:</span>
                <span class="text-gray-800 capitalize">{{ reservation.type }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
                <span class="text-gray-600">Status:</span>
                <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  {{ reservation.status }}
                </span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
                <span class="text-gray-600">Total Amount:</span>
                <span class="text-gray-800 font-semibold">₱{{ formatPrice(reservation.totalAmount) }}</span>
              </div>
            </div>
            <div class="mt-4">
              <h3 class="text-md font-semibold text-gray-800 mb-2">Items Ordered:</h3>
              <ul class="space-y-2">
                <li v-for="item in reservation.items" :key="item.productId" class="flex justify-between items-center">
                  <span class="text-gray-600">{{ item.name }} (x{{ item.quantity }})</span>
                  <span class="text-gray-800">₱{{ formatPrice(item.finalPrice * item.quantity) }}</span>
                </li>
              </ul>
            </div>
            <div v-if="reservation.type === 'pickup'" class="mt-4">
              <h3 class="text-md font-semibold text-gray-800 mb-2">Pickup Details:</h3>
              <p class="text-gray-600">{{ formatDate(reservation.pickupDateTime) }}</p>
            </div>
            <div v-if="reservation.type === 'delivery'" class="mt-4">
              <h3 class="text-md font-semibold text-gray-800 mb-2">Delivery Address:</h3>
              <p class="text-gray-600">{{ reservation.address?.fullName }}</p>
              <p class="text-gray-600">{{ reservation.address?.addressLine1 }}</p>
              <p v-if="reservation.address?.addressLine2" class="text-gray-600">{{ reservation.address.addressLine2 }}</p>
              <p class="text-gray-600">Phone: {{ reservation.address?.phone }}</p>
            </div>
          </div>
        </div>
        <div class="p-6 bg-gray-50">
          <button
            @click="goToHome"
            class="w-full px-6 py-3 bg-[#FF9934] text-white rounded-full hover:bg-[#FF8000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934] transition duration-150 ease-in-out flex items-center justify-center"
          >
            <Home class="h-5 w-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { CheckCircle, Home } from 'lucide-vue-next'
  import { useReservationStore } from '@/store/modules/reservation'
  
  const route = useRoute()
  const router = useRouter()
  const reservationStore = useReservationStore()
  
  const reservation = ref(null)
  const isLoading = ref(true)
  const error = ref(null)
  
  onMounted(async () => {
    const reservationId = route.params.reservationId
    try {
      const result = await reservationStore.fetchReservationById(reservationId)
      if (result.success) {
        reservation.value = result.reservation
      } else {
        error.value = result.error || 'Failed to fetch reservation details'
      }
    } catch (err) {
      console.error('Error fetching reservation:', err)
      error.value = 'An error occurred while fetching reservation details'
    } finally {
      isLoading.value = false
    }
  })
  
  const formatDate = (date) => {
    if (!date) return 'N/A'
    // Check if the date is a Firestore Timestamp
    const dateObject = date.toDate ? date.toDate() : new Date(date)
    return dateObject.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatPrice = (price) => {
    return (parseFloat(price) || 0).toFixed(2)
  }
  
  const goToHome = () => {
    router.push({ name: 'Home' })
  }
  </script>
  
  
<!-- views/user/ReservationHistory.vue -->
<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8 text-gray-800">Reservation History</h1>
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FF9934]"></div>
      </div>
      <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p class="font-bold">Error</p>
        <p>{{ error }}</p>
      </div>
      <div v-else-if="reservations.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h3 class="mt-2 text-xl font-medium text-gray-900">No reservations found</h3>
        <p class="mt-1 text-gray-500">Start making reservations to see your history here.</p>
      </div>
      <div v-else class="space-y-8">
        <div v-for="reservation in reservations" :key="reservation.id" class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold text-gray-800">Reservation #{{ reservation.id }}</h2>
              <span :class="getStatusClass(reservation.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                {{ reservation.status }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ formatDate(reservation.createdAt) }}</p>
          </div>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Items:</h3>
            <ul class="divide-y divide-gray-200">
              <li v-for="item in reservation.items" :key="item.productId" class="py-4 flex items-center space-x-4">
                <img :src="item.thumbnailURL || '/placeholder.svg?height=80&width=80'" :alt="item.name" class="w-16 h-16 object-cover rounded-md">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
                  <p class="text-sm text-gray-500">Quantity: {{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">₱{{ formatPrice(item.finalPrice * item.quantity) }}</p>
                  <p v-if="item.price !== item.finalPrice" class="text-xs text-gray-500 line-through">
                    ₱{{ formatPrice(item.price * item.quantity) }}
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div class="flex justify-between items-center">
              <p class="text-lg font-semibold text-gray-900">Total: ₱{{ formatPrice(reservation.totalAmount) }}</p>
              <button 
                v-if="reservation.status === 'pending'"
                @click="cancelReservation(reservation.id)"
                class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useReservationStore } from '@/store/modules/reservation'
  
  const reservationStore = useReservationStore()
  const reservations = ref([])
  const isLoading = ref(true)
  const error = ref(null)
  
  onMounted(async () => {
    try {
      const result = await reservationStore.fetchUserReservations()
      if (result.success) {
        reservations.value = result.reservations
      } else {
        error.value = result.error
      }
    } catch (err) {
      console.error('Error fetching reservations:', err)
      error.value = 'An error occurred while fetching reservations'
    } finally {
      isLoading.value = false
    }
  })
  
  const formatDate = (date) => {
    if (!date) return 'N/A'
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
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const cancelReservation = async (reservationId) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      try {
        const result = await reservationStore.cancelReservation(reservationId)
        if (result.success) {
          // Update the local state to reflect the cancellation
          const index = reservations.value.findIndex(r => r.id === reservationId)
          if (index !== -1) {
            reservations.value[index].status = 'cancelled'
          }
        } else {
          alert('Failed to cancel reservation: ' + result.error)
        }
      } catch (err) {
        console.error('Error cancelling reservation:', err)
        alert('An error occurred while cancelling the reservation')
      }
    }
  }
  </script>
  
  
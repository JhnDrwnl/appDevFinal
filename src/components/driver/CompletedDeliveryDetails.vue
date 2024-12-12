<template>
    <div class="bg-white w-full">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Completed Delivery Details</h2>
        <button
          @click="goBack"
          class="text-[#FF9934] hover:text-[#FF7700] transition-colors duration-200 focus:outline-none"
        >
          Back to List
        </button>
      </div>
      <div class="p-6">
        <div v-if="isLoading" class="text-center">
          <p class="text-gray-500">Loading delivery details...</p>
        </div>
        <div v-else-if="error" class="text-center">
          <p class="text-red-500">{{ error }}</p>
        </div>
        <div v-else-if="delivery">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p class="text-sm font-medium text-gray-500">Reservation ID:</p>
              <p class="text-lg text-gray-900">{{ delivery.id }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Completed Date:</p>
              <p class="text-lg text-gray-900">{{ formatDate(delivery.updatedAt) }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Type:</p>
              <p class="text-lg text-gray-900 capitalize">Delivery</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Status:</p>
              <p class="text-lg text-gray-900">{{ delivery.status }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Total Amount:</p>
              <p class="text-lg text-gray-900">₱{{ formatPrice(calculateTotal(delivery.items)) }}</p>
            </div>
          </div>
          <div class="mb-6">
            <p class="text-sm font-medium text-gray-500 mb-2">Items:</p>
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in delivery.items" :key="item.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.quantity }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{{ formatPrice(item.finalPrice) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{{ formatPrice(item.finalPrice * item.quantity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mb-6">
            <p class="text-sm font-medium text-gray-500 mb-2">Delivery Address:</p>
            <div class="bg-gray-50 p-4">
              <p class="text-lg text-gray-900">{{ delivery.address?.fullName }}</p>
              <p class="text-lg text-gray-900">{{ delivery.address?.addressLine1 }}</p>
              <p v-if="delivery.address?.addressLine2" class="text-lg text-gray-900">{{ delivery.address?.addressLine2 }}</p>
              <p class="text-lg text-gray-900">Phone: {{ delivery.address?.phone }}</p>
            </div>
          </div>
          <div class="mb-6">
            <p class="text-sm font-medium text-gray-500 mb-2">Delivery Proof:</p>
            <div v-if="delivery.proofImageUrl" class="mt-4">
              <img :src="delivery.proofImageUrl" alt="Delivery Proof" class="max-w-full h-auto rounded-lg shadow-md" />
            </div>
            <p v-else class="text-gray-500">No delivery proof image available.</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useReservationStore } from '@/store/modules/reservation'
  
  const route = useRoute()
  const router = useRouter()
  const reservationStore = useReservationStore()
  
  const delivery = ref(null)
  const isLoading = ref(true)
  const error = ref(null)
  
  onMounted(async () => {
    await fetchDeliveryDetails()
  })
  
  const fetchDeliveryDetails = async () => {
    isLoading.value = true
    error.value = null
    const deliveryId = route.params.id
  
    if (!deliveryId) {
      error.value = 'No delivery ID provided'
      isLoading.value = false
      return
    }
  
    try {
      const result = await reservationStore.fetchReservationById(deliveryId as string)
      if (result.success && result.reservation) {
        delivery.value = result.reservation
      } else {
        error.value = result.error || 'Failed to fetch delivery details'
        delivery.value = null
      }
    } catch (err) {
      console.error('Error fetching delivery details:', err)
      error.value = 'An unexpected error occurred'
      delivery.value = null
    } finally {
      isLoading.value = false
    }
  }
  
  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A'
    const date = dateString.toDate ? dateString.toDate() : new Date(dateString)
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  const formatPrice = (price: number) => {
    return (parseFloat(price.toString()) || 0).toFixed(2)
  }
  
  const calculateTotal = (items: any[]) => {
    return items.reduce((total, item) => total + (item.quantity * item.finalPrice), 0)
  }
  
  const goBack = () => {
    router.push({ name: 'DeliveryHistory' })
  }
  </script>
  
  
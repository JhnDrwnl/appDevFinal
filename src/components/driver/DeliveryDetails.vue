<!-- components/driver/DeliveryDetails.vue -->
<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Active Deliveries</h1>
      <div v-if="isLoading" class="text-center py-8">
        <p class="text-gray-500">Loading delivery details...</p>
      </div>
      <div v-else-if="!delivery" class="text-center py-8">
        <p class="text-gray-500">Delivery not found.</p>
      </div>
      <div v-else class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold">Delivery Details</h2>
          <router-link
            :to="{ name: 'ActiveDelivery' }"
            class="text-[#FF9934] hover:text-[#FF8000]"
          >
            Back to List
          </router-link>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p class="text-sm text-gray-600">Reservation ID:</p>
            <p class="font-medium">{{ delivery.id }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Created At:</p>
            <p class="font-medium">{{ formatDate(delivery.createdAt) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Status:</p>
            <p class="font-medium">{{ delivery.status }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Original Total:</p>
            <p class="font-medium">₱{{ calculateTotal(delivery.items, 'price').toFixed(2) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Discounted Total:</p>
            <p class="font-medium">₱{{ calculateTotal(delivery.items, 'finalPrice').toFixed(2) }}</p>
          </div>
        </div>
  
        <h3 class="text-xl font-semibold mb-4">Items:</h3>
        <table class="min-w-full divide-y divide-gray-200 mb-6">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in delivery.items" :key="item.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ item.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ item.quantity }}</td>
              <td class="px-6 py-4 whitespace-nowrap">₱{{ item.finalPrice.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">₱{{ (item.quantity * item.finalPrice).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
  
        <h3 class="text-xl font-semibold mb-4">Delivery Address:</h3>
        <div class="mb-6">
          <p>{{ delivery.address?.fullName }}</p>
          <p>{{ delivery.address?.addressLine1 }}</p>
          <p v-if="delivery.address?.addressLine2">{{ delivery.address.addressLine2 }}</p>
          <p>Phone: {{ delivery.address?.phone }}</p>
        </div>
  
        <div class="flex justify-end">
          <button
            @click="handleDeliveryAction"
            class="bg-[#FF9934] text-white px-6 py-2 rounded-full hover:bg-[#FF8000] transition duration-300"
          >
            {{ deliveryActionText }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useReservationStore } from '@/store/modules/reservation'
  
  const route = useRoute()
  const router = useRouter()
  const reservationStore = useReservationStore()
  
  const delivery = ref<any>(null)
  const isLoading = ref(true)
  
  onMounted(async () => {
    const deliveryId = route.params.id as string
    await fetchDeliveryDetails(deliveryId)
  })
  
  const fetchDeliveryDetails = async (deliveryId: string) => {
    isLoading.value = true
    try {
      const result = await reservationStore.fetchReservationById(deliveryId)
      if (result.success) {
        delivery.value = result.reservation
      } else {
        console.error('Error fetching delivery details:', result.error)
      }
    } catch (error) {
      console.error('Error fetching delivery details:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  const formatDate = (date: any) => {
    if (!date) return ''
    return new Date(date.seconds * 1000).toLocaleString()
  }
  
  const calculateTotal = (items: any[], priceType: 'price' | 'finalPrice') => {
    return items.reduce((total, item) => total + (item.quantity * item[priceType]), 0)
  }
  
  const deliveryActionText = computed(() => {
    if (delivery.value?.status === 'preparing' || delivery.value?.status === 'on the way') {
      return 'Update Delivery'
    }
    return 'Start Delivery Process'
  })
  
  const handleDeliveryAction = () => {
    if (delivery.value) {
      router.push({ name: 'DeliveryProcess', params: { id: delivery.value.id } })
    }
  }
  </script>
  
  
  
  
  
  
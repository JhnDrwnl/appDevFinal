<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Completed Deliveries</h1>
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-500">Loading completed deliveries...</p>
    </div>
    <div v-else-if="completedDeliveries.length === 0" class="text-center py-8">
      <p class="text-gray-500">No completed deliveries found.</p>
    </div>
    <div v-else>
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="delivery in completedDeliveries" :key="delivery.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ delivery.id }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(delivery.updatedAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">₱{{ calculateTotal(delivery.items).toFixed(2) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <router-link
                  :to="{ name: 'CompletedDeliveryDetails', params: { id: delivery.id } }"
                  class="text-[#FF9934] hover:text-[#FF8000]"
                >
                  View Details
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useReservationStore } from '@/store/modules/reservation'

const reservationStore = useReservationStore()

const completedDeliveries = ref([])
const isLoading = ref(true)

onMounted(async () => {
  await fetchCompletedDeliveries()
})

const fetchCompletedDeliveries = async () => {
  isLoading.value = true
  try {
    const result = await reservationStore.fetchCompletedDeliveries()
    if (result.success) {
      completedDeliveries.value = result.completedDeliveries
    } else {
      console.error('Error fetching completed deliveries:', result.error)
    }
  } catch (error) {
    console.error('Error fetching completed deliveries:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (date: any) => {
  if (!date) return ''
  return new Date(date.seconds * 1000).toLocaleString()
}

const calculateTotal = (items: any[]) => {
  return items.reduce((total, item) => total + (item.quantity * item.finalPrice), 0)
}
</script>


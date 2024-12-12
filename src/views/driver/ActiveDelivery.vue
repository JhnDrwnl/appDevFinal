<!-- views/driver/ActiveDelivery.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Active Deliveries</h1>
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-500">Loading deliveries...</p>
    </div>
    <div v-else-if="deliveries.length === 0" class="text-center py-8">
      <p class="text-gray-500">No deliveries at the moment.</p>
    </div>
    <div v-else>
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="delivery in deliveries" 
              :key="delivery.id"
              :class="{ 
                'bg-yellow-100': delivery.id === highlightedDeliveryId,
                'font-bold': delivery.id === highlightedDeliveryId
              }"
              @click="handleDeliveryClick(delivery.id)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ delivery.id }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(delivery.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusClass(delivery.status)">
                  {{ delivery.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <router-link
                  :to="{ name: 'DeliveryDetails', params: { id: delivery.id } }"
                  class="hover:text-[#FF8000] focus:outline-none mr-2 rounded-full px-4 py-2 bg-[#FF9934] text-white hover:bg-[#FF8000]"
                >
                  View
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useReservationStore } from '@/store/modules/reservation'
import { useActiveDeliveryStore } from '@/store/modules/activeDelivery'
import { useNotificationStore } from '@/store/modules/notification'

const router = useRouter()
const reservationStore = useReservationStore()
const activeDeliveryStore = useActiveDeliveryStore()
const notificationStore = useNotificationStore()

const isLoading = ref(true)
const highlightedDeliveryId = ref(null)

const deliveries = computed(() => {
  return reservationStore.reservations.filter((r) => r.type === 'delivery')
})

onMounted(async () => {
  await fetchDeliveries()
  highlightedDeliveryId.value = activeDeliveryStore.highlightedDeliveryId
})

watch(deliveries, (newDeliveries) => {
  newDeliveries.forEach(delivery => {
    if (delivery.status === 'pending') {
      notificationStore.addNotification({
        id: delivery.id,
        type: 'new_delivery',
        message: `New delivery assigned: ${delivery.id}`,
        read: false
      })
      if (!highlightedDeliveryId.value) {
        highlightedDeliveryId.value = delivery.id
        activeDeliveryStore.setHighlightedDeliveryId(delivery.id)
      }
    }
  })
}, { deep: true })

const fetchDeliveries = async () => {
  isLoading.value = true
  try {
    await reservationStore.fetchAllReservations()
  } catch (error) {
    console.error('Error fetching deliveries:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date.seconds * 1000).toLocaleString()
}

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'preparing':
      return 'bg-blue-100 text-blue-800'
    case 'on the way':
      return 'bg-indigo-100 text-indigo-800'
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const handleDeliveryClick = (deliveryId) => {
  if (deliveryId === highlightedDeliveryId.value) {
    highlightedDeliveryId.value = null
    activeDeliveryStore.setHighlightedDeliveryId(null)
  }
}
</script>

<style scoped>
.rounded-full {
  border-radius: 9999px;
}
</style>




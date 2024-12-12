<!-- components/driver/Notifications.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Notifications</h1>
    <div v-if="notifications.length === 0" class="text-center py-8">
      <p class="text-gray-500">No notifications yet</p>
    </div>
    <ul v-else class="space-y-4">
      <li 
        v-for="notification in notifications" 
        :key="notification.id"
        class="bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        :class="{ 'bg-gray-50': notification.read, 'font-bold': !notification.read }"
        @click="handleNotificationClick(notification)"
      >
        <div>
          <p class="text-gray-800">
            {{ notification.message }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            {{ formatDate(notification.createdAt) }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/store/modules/notification'
import { useReservationStore } from '@/store/modules/reservation'
import { useActiveDeliveryStore } from '@/store/modules/activeDelivery'

const router = useRouter()
const notificationStore = useNotificationStore()
const reservationStore = useReservationStore()
const activeDeliveryStore = useActiveDeliveryStore()

const notifications = computed(() => notificationStore.notifications)

const handleNotificationClick = async (notification) => {
  if (!notification.read) {
    await notificationStore.markAsRead(notification.id)
  }

  if (notification.type === 'driver' && notification.message.includes('New delivery available:')) {
    const reservationId = notification.message.split(':')[1].trim()
    const result = await reservationStore.fetchReservationById(reservationId)
    
    if (result.success) {
      reservationStore.setCurrentReservation(result.reservation)
      activeDeliveryStore.setHighlightedDeliveryId(reservationId)
      router.push({ name: 'ActiveDelivery', params: { id: reservationId } })
    } else {
      console.error('Failed to fetch reservation:', result.error)
      // You might want to show an error message to the user here
    }
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date.seconds * 1000).toLocaleString()
}
</script>
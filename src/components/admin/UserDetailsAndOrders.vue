<!-- components/admin/UserDetailsAndOrders.vue -->
<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">User Details</h2>
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-[#FF9934] text-white rounded-full hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
        >
          Back to List
        </button>
      </div>

      <div class="space-y-6">
        <div class="flex items-center space-x-4">
          <img
            :src="user.photoURL || '/placeholder.svg?height=100&width=100'"
            :alt="user.username"
            class="w-20 h-20 rounded-full"
          />
          <div>
            <h3 class="text-xl font-semibold">{{ user.username }}</h3>
            <p class="text-gray-600">{{ user.email }}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-500">Registration Date</p>
            <p class="mt-1">{{ formatDate(user.createdAt) }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Total Reservations</p>
            <p class="mt-1">{{ totalReservations }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  totalReservations: {
    type: Number,
    default: 0
  }
})

defineEmits(['close'])

const formatDate = (date) => {
  return date ? new Date(date).toLocaleString() : 'N/A'
}
</script>




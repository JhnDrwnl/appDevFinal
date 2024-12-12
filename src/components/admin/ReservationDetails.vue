<!-- components/admin/ReservationDetails.vue -->
<template>
  <div class="bg-white w-full">
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">Reservation Details</h2>
      <button
        @click="$emit('close')"
        class="text-[#FF9934] hover:text-[#FF7700] transition-colors duration-200 focus:outline-none"
      >
        Back to List
      </button>
    </div>
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p class="text-sm font-medium text-gray-500">Reservation ID:</p>
          <p class="text-lg text-gray-900">{{ reservation.id }}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Date:</p>
          <p class="text-lg text-gray-900">{{ formatDate(reservation.createdAt) }}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Type:</p>
          <p class="text-lg text-gray-900 capitalize">{{ reservation.type }}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Status:</p>
          <p class="text-lg text-gray-900">{{ reservation.status }}</p>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500">Total Amount:</p>
          <p class="text-lg text-gray-900">₱{{ formatPrice(reservation.totalAmount) }}</p>
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
            <tr v-for="item in reservation.items" :key="item.productId">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.quantity }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{{ formatPrice(item.finalPrice) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{{ formatPrice(item.finalPrice * item.quantity) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="reservation.type === 'pickup'" class="mb-6">
        <p class="text-sm font-medium text-gray-500">Pickup Date and Time:</p>
        <p class="text-lg text-gray-900">{{ formatDate(reservation.pickupDateTime) }}</p>
      </div>
      <div v-if="reservation.type === 'delivery'" class="mb-6">
        <p class="text-sm font-medium text-gray-500 mb-2">Delivery Address:</p>
        <div class="bg-gray-50 p-4">
          <p class="text-lg text-gray-900">{{ reservation.address?.fullName }}</p>
          <p class="text-lg text-gray-900">{{ reservation.address?.addressLine1 }}</p>
          <p v-if="reservation.address?.addressLine2" class="text-lg text-gray-900">{{ reservation.address.addressLine2 }}</p>
          <p class="text-lg text-gray-900">Phone: {{ reservation.address?.phone }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  reservation: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const formatDate = (dateString) => {
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

const formatPrice = (price) => {
  return (parseFloat(price) || 0).toFixed(2)
}
</script>
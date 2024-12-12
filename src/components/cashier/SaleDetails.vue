<!-- components/cashier/SaleDetails.vue -->
<template>
    <div class="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div class="bg-[#FF9934] p-4 text-white flex justify-between items-center">
        <h2 class="text-2xl font-bold">Sale Details</h2>
        <button @click="$emit('back')" class="text-white hover:text-gray-200 focus:outline-none px-4 py-2 rounded-full bg-[#FF7700]">
          Back to Sales History
        </button>
      </div>
      <div class="p-6">
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Transaction Details</h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
              <span class="text-gray-600">Transaction ID:</span>
              <span class="font-mono text-gray-800">{{ sale.id }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
              <span class="text-gray-600">Date and Time:</span>
              <span class="text-gray-800">{{ formatDate(sale.timestamp) }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
              <span class="text-gray-600">Total Amount:</span>
              <span class="text-gray-800 font-semibold">₱{{ formatPrice(sale.totalAmount) }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
              <span class="text-gray-600">Amount Given:</span>
              <span class="text-gray-800">₱{{ formatPrice(sale.amountGiven) }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
              <span class="text-gray-600">Change:</span>
              <span class="text-gray-800">₱{{ formatPrice(sale.change) }}</span>
            </div>
          </div>
          <div class="mt-4">
            <h3 class="text-md font-semibold text-gray-800 mb-2">Items Purchased:</h3>
            <ul class="space-y-2">
              <li v-for="item in sale.items" :key="item.id" class="flex justify-between items-center">
                <span class="text-gray-600">{{ item.name }} (x{{ item.quantity }})</span>
                <span class="text-gray-800">₱{{ formatPrice(item.finalPrice * item.quantity) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  
  const props = defineProps({
    sale: {
      type: Object,
      required: true
    }
  })
  
  defineEmits(['back'])
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
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
  
  
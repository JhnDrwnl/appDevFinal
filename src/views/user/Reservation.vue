<!-- views/user/Reservation.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">Reservation</h1>
    <div v-if="!selectedType" class="space-y-6">
      <h2 class="text-xl font-semibold mb-6 text-gray-700">Choose Reservation Type</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          @click="selectReservationType('pickup')"
          class="flex items-center justify-center p-6 border-2 border-[#FF9934] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white group"
        >
          <div class="text-center">
            <Store class="w-16 h-16 mb-4 text-[#FF9934] group-hover:text-[#FF8000] mx-auto transition-colors duration-300" />
            <span class="text-lg font-medium text-gray-800 group-hover:text-[#FF8000] transition-colors duration-300">In-store Pickup</span>
          </div>
        </button>
        <button
          @click="selectReservationType('delivery')"
          class="flex items-center justify-center p-6 border-2 border-[#FF9934] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white group"
        >
          <div class="text-center">
            <MaterialSymbolsDeliveryTruckSpeed class="w-16 h-16 mb-4 text-[#FF9934] group-hover:text-[#FF8000] mx-auto transition-colors duration-300" />
            <span class="text-lg font-medium text-gray-800 group-hover:text-[#FF8000] transition-colors duration-300">Delivery (Cash on Delivery)</span>
          </div>
        </button>
      </div>
      <div class="mt-8 text-center">
        <button
          @click="goBack"
          class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934] transition-colors duration-300"
        >
          <ArrowLeft class="w-5 h-5 mr-2" />
          Back to Basket
        </button>
      </div>
    </div>
    <InStorePickup v-if="selectedType === 'pickup'" @back="selectedType = null" />
    <Delivery v-if="selectedType === 'delivery'" @back="selectedType = null" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InStorePickup from '@/views/user/InStorePickup.vue'
import Delivery from '@/views/user/Delivery.vue'
import { useBasketStore } from '@/store/modules/basket'
import { Store, ArrowLeft } from 'lucide-vue-next'
import MaterialSymbolsDeliveryTruckSpeed from '~icons/material-symbols/delivery-truck-speed'

const router = useRouter()
const basketStore = useBasketStore()
const selectedType = ref(null)

const selectReservationType = (type) => {
  selectedType.value = type
}

const goBack = () => {
  router.push({ name: 'Basket' })
}
</script>
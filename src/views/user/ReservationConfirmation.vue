<!-- views/user/ReservationConfirmation.vue -->
<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8 text-gray-800">Confirm Your Reservation</h1>
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline">{{ error }}</span>
      </div>
      <div v-else-if="!reservationData" class="text-center py-8">
        <p class="text-xl font-semibold text-gray-700 mb-4">No reservation data found</p>
        <button @click="goToReservation" class="px-6 py-2 bg-[#FF9934] text-white rounded-full hover:bg-[#FF8000] transition-colors duration-200">
          Start a New Reservation
        </button>
      </div>
      <div v-else class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-semibold mb-4">Reservation Details</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-medium">Type:</h3>
            <p>{{ reservationData.type === 'pickup' ? 'In-store Pickup' : 'Delivery' }}</p>
          </div>
          <div v-if="reservationData.type === 'pickup'">
            <h3 class="text-lg font-medium">Pickup Date and Time:</h3>
            <p>{{ formatDate(reservationData.pickupDateTime) }}</p>
          </div>
          <div v-if="reservationData.type === 'delivery'">
            <h3 class="text-lg font-medium">Delivery Address:</h3>
            <p>{{ reservationData.address?.fullName }}</p>
            <p>{{ reservationData.address?.addressLine1 }}</p>
            <p v-if="reservationData.address?.addressLine2">{{ reservationData.address.addressLine2 }}</p>
            <p>Phone: {{ reservationData.address?.phone }}</p>
          </div>
          <div>
            <h3 class="text-lg font-medium mb-2">Items:</h3>
            <ul class="space-y-4">
              <li v-for="item in reservationData.items" :key="item.id" class="flex items-start space-x-4">
                <img :src="item.thumbnailURL || '/placeholder.svg?height=80&width=80'" :alt="item.name" class="w-20 h-20 object-cover rounded-md">
                <div class="flex-grow">
                  <div class="font-medium">{{ item.name }}</div>
                  <div>Quantity: {{ item.quantity }}</div>
                  <div>
                    <span class="text-sm text-gray-900 font-medium">₱{{ formatPrice(item.finalPrice) }}</span>
                    <span v-if="item.price !== item.finalPrice" class="text-xs text-gray-500 line-through ml-2">
                      ₱{{ formatPrice(item.price) }}
                    </span>
                  </div>
                  <div v-if="getAppliedRules(item).length > 0" class="text-xs text-gray-500">
                    <div v-for="rule in getAppliedRules(item)" :key="rule.id">
                      {{ rule.name }}: {{ formatRuleValue(rule) }} off
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-medium">Total Amount:</h3>
            <p class="text-xl font-bold">₱{{ formatPrice(calculatedTotalAmount) }}</p>
          </div>
          <div v-if="reservationData.notes">
            <h3 class="text-lg font-medium">Additional Notes:</h3>
            <p>{{ reservationData.notes }}</p>
          </div>
        </div>
        <div class="mt-8 flex justify-between">
          <button
            @click="goBack"
            class="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
          >
            Back
          </button>
          <button
            @click="confirmReservation"
            class="px-6 py-2 bg-[#FF9934] text-white rounded-full hover:bg-[#FF8000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
          >
            Confirm Reservation
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useBasketStore } from '@/store/modules/basket'
  import { useProductStore } from '@/store/modules/products'
  import { useProductPriceRuleStore } from '@/store/modules/productPriceRules'
  import { usePriceRuleStore } from '@/store/modules/priceRules'
  import { useCategoryStore } from '@/store/modules/categories'
  import { useReservationStore } from '@/store/modules/reservation'
  import { useAuthStore } from '@/store/modules/auth'
  import { db } from '@/services/firebase'
  import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
  
  const router = useRouter()
  const basketStore = useBasketStore()
  const productStore = useProductStore()
  const productPriceRuleStore = useProductPriceRuleStore()
  const priceRuleStore = usePriceRuleStore()
  const categoryStore = useCategoryStore()
  const reservationStore = useReservationStore()
  const authStore = useAuthStore()
  
  const reservationData = ref(null)
  const error = ref(null)
  
  const calculatedTotalAmount = computed(() => {
    return reservationData.value.items.reduce((total, item) => {
      return total + (item.finalPrice * item.quantity);
    }, 0);
  });
  
  onMounted(() => {
    try {
      const storedData = localStorage.getItem('reservationData')
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        // Ensure totalAmount is a number
        parsedData.totalAmount = parseFloat(parsedData.totalAmount) || 0
        // Ensure item prices are numbers
        parsedData.items = parsedData.items.map(item => ({
          ...item,
          price: parseFloat(item.price) || 0,
          finalPrice: parseFloat(item.finalPrice) || 0,
          quantity: parseInt(item.quantity) || 0
        }))
        reservationData.value = parsedData
      } else {
        error.value = 'No reservation data found. Please start a new reservation.'
      }
    } catch (e) {
      console.error('Error parsing reservation data:', e)
      error.value = 'An error occurred while loading the reservation data. Please try again.'
    }
  })
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString()
  }
  
  const formatPrice = (price) => {
    return (parseFloat(price) || 0).toFixed(2)
  }
  
  const getAppliedRules = (item) => {
    const product = productStore.getProductById(item.productId)
    if (!product) return []
  
    const productRules = productPriceRuleStore.productPriceRules
      .filter(rule => rule.productId === product.id)
      .map(rule => {
        const priceRule = priceRuleStore.priceRules.find(pr => pr.id === rule.priceRuleId)
        return {
          id: rule.id,
          name: priceRule ? priceRule.name : 'Unknown Rule',
          value: priceRule ? priceRule.value : 0,
          type: priceRule ? priceRule.type : 'fixed',
          isProductRule: true
        }
      })
  
    const categoryRules = product.categoryIds.flatMap(categoryId => {
      const category = categoryStore.getCategoryById(categoryId)
      if (category && category.priceRule) {
        return [{
          id: category.priceRule.id,
          name: `${category.name} - ${category.priceRule.priceRuleName}`,
          value: category.priceRule.priceRuleValue,
          type: category.priceRule.priceRuleType,
          isProductRule: false
        }]
      }
      return []
    })
  
    return [...productRules, ...categoryRules]
  }
  
  const formatRuleValue = (rule) => {
    return rule.type === 'percentage'
      ? `${rule.value}%`
      : `₱${rule.value.toFixed(2)}`
  }
  
  const goBack = () => {
    router.back()
  }
  
  const goToReservation = () => {
    router.push({ name: 'Reservation' })
  }
  
  const confirmReservation = async () => {
    try {
      const newReservation = {
        ...reservationData.value,
        totalAmount: calculatedTotalAmount.value,
        status: 'pending'
      }
      const result = await reservationStore.createReservation(newReservation)
      
      if (result.success) {
        // Clear the user's basket after successful reservation
        const userId = authStore.user?.uid
        if (userId) {
          await basketStore.clearUserBasket(userId)
        } else {
          await basketStore.clearBasket()
        }
        
        localStorage.removeItem('reservationData')
  
        router.push({ 
          name: 'ReservationSuccess', 
          params: { reservationId: result.reservation.id } 
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error saving reservation:', error)
      alert('An error occurred while saving your reservation. Please try again.')
    }
  }
  </script>
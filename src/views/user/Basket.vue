<!-- views/user/Basket.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Your Basket</h1>
    <div v-if="basketItems.length > 0" class="space-y-8">
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in basketItems" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img :src="item.thumbnailURL || '/placeholder.svg?height=64&width=64'" :alt="item.name" class="w-16 h-16 object-cover rounded-md mr-4">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                      <button @click="removeItem(item.id)" class="text-sm text-red-600 hover:text-red-800 mt-1">
                        Remove
                      </button>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 font-medium">₱{{ calculateFinalPrice(item).toFixed(2) }}</div>
                  <div v-if="item.price !== calculateFinalPrice(item)" class="text-xs text-gray-500 line-through">
                    ₱{{ item.price.toFixed(2) }}
                  </div>
                  <div v-if="getAppliedRules(item).length > 0" class="text-xs text-gray-500 mt-1">
                    <div v-for="rule in getAppliedRules(item)" :key="rule.id">
                      {{ rule.name }}: {{ formatRuleValue(rule) }} off
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center justify-center">
                    <button 
                      @click="updateQuantity(item, -1)"
                      class="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <MinusIcon class="w-4 h-4" />
                    </button>
                    <input 
                      type="number" 
                      v-model.number="item.quantity" 
                      @change="handleQuantityChange(item)"
                      min="1"
                      class="mx-2 w-12 text-center border rounded px-2 py-1 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      @click="updateQuantity(item, 1)"
                      class="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <PlusIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  ₱{{ (calculateFinalPrice(item) * item.quantity).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-medium">Subtotal</span>
          <span class="text-lg">₱{{ calculateBasketTotal().toFixed(2) }}</span>
        </div>
        <div class="flex justify-between items-center text-xl font-bold">
          <span>Total</span>
          <span>₱{{ calculateBasketTotal().toFixed(2) }}</span>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <button 
          @click="continueShoppingHandler" 
          class="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        >
          <ArrowLeftIcon class="w-5 h-5" />
          Continue shopping
        </button>
        <button 
          @click="proceedToReservation" 
          class="px-8 py-3 rounded-full text-white bg-[#FF9934] hover:bg-[#FF8000] transition-colors duration-200"
        >
          Proceed to reservation
        </button>
      </div>
    </div>
    <div v-else class="text-center py-12">
      <ShoppingBasket class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p class="text-xl font-semibold text-gray-600 mb-4">Your basket is empty</p>
      <button 
        @click="continueShoppingHandler" 
        class="px-6 py-2 rounded-full text-white bg-[#FF9934] hover:bg-[#FF8000] transition-colors duration-200"
      >
        Start shopping
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBasketStore } from '@/store/modules/basket'
import { useProductStore } from '@/store/modules/products'
import { useProductPriceRuleStore } from '@/store/modules/productPriceRules'
import { usePriceRuleStore } from '@/store/modules/priceRules'
import { useCategoryStore } from '@/store/modules/categories'
import { useAuthStore } from '@/store/modules/auth'
import { ArrowLeftIcon, ShoppingBasket, MinusIcon, PlusIcon } from 'lucide-vue-next'

const router = useRouter()
const basketStore = useBasketStore()
const productStore = useProductStore()
const productPriceRuleStore = useProductPriceRuleStore()
const priceRuleStore = usePriceRuleStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const basketItems = computed(() => basketStore.basketItems)

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

const calculateFinalPrice = (item) => {
  let finalPrice = item.price
  const appliedRules = getAppliedRules(item)

  appliedRules.forEach(rule => {
    if (rule.type === 'percentage') {
      finalPrice *= (1 - rule.value / 100)
    } else {
      finalPrice -= rule.value
    }
  })

  return Math.max(finalPrice, 0) // Ensure the price doesn't go below 0
}

const formatRuleValue = (rule) => {
  return rule.type === 'percentage'
    ? `${rule.value}%`
    : `₱${rule.value.toFixed(2)}`
}

const calculateBasketTotal = () => {
  return basketItems.value.reduce((total, item) => {
    return total + (calculateFinalPrice(item) * item.quantity)
  }, 0)
}

const updateQuantity = async (item, change) => {
  const newQuantity = item.quantity + change
  if (newQuantity <= 0) {
    await removeItem(item.id)
  } else {
    try {
      await basketStore.addToBasket({ ...item, id: item.productId }, change)
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }
}

const handleQuantityChange = async (item) => {
  if (item.quantity <= 0) {
    await removeItem(item.id)
  } else {
    try {
      const change = item.quantity - basketStore.basketItems.find(i => i.id === item.id).quantity
      await basketStore.addToBasket({ ...item, id: item.productId }, change)
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }
}

const removeItem = async (itemId) => {
  try {
    await basketStore.removeFromBasket(itemId)
  } catch (error) {
    console.error('Error removing item:', error)
  }
}

const continueShoppingHandler = () => {
  router.push({ name: 'UserHome' })
}

const proceedToReservation = () => {
  console.log('Proceeding to reservation. Auth status:', authStore.isAuthenticated)
  if (authStore.isAuthenticated) {
    router.push({ name: 'Reservation' })
  } else {
    router.push({ name: 'register' })
  }
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
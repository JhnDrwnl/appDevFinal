<!-- components/admin/AddProductPriceRule.vue -->
<template>
    <div class="w-full">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Add Product Price Rule</h2>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="productSearch" class="block text-sm font-medium text-gray-700 mb-1">Search Product</label>
          <div class="relative">
            <input
              type="text"
              id="productSearch"
              v-model="productSearch"
              @input="debouncedSearchProducts"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:border-[#FF9934]"
              placeholder="Start typing to search products"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <div v-if="loading" class="absolute right-3 top-2.5 text-gray-400">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</div>
            <div v-if="searchResults.length > 0" class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
              <div
                v-for="product in searchResults"
                :key="product.id"
                @click="selectProduct(product)"
                class="cursor-pointer select-none relative py-2 px-4 hover:bg-gray-100"
              >
                {{ product.name }} - ₱{{ product.price.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
  
        <div v-if="selectedProduct" class="bg-gray-50 p-4 rounded-lg relative">
          <h3 class="text-lg font-semibold mb-2 text-gray-800">Selected Product</h3>
          <p class="text-gray-600">{{ selectedProduct.name }} - ₱{{ selectedProduct.price.toFixed(2) }}</p>
          <button
            @click="cancelSelectedProduct"
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
  
        <div>
          <label for="priceRule" class="block text-sm font-medium text-gray-700 mb-1">Price Rule</label>
          <select
            id="priceRule"
            v-model="selectedPriceRule"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:border-[#FF9934]"
          >
            <option value="" disabled selected>Please select a price rule</option>
            <option v-for="rule in priceRules" :key="rule.id" :value="rule">
              {{ rule.name }} ({{ rule.type === 'percentage' ? rule.value + '%' : '₱' + rule.value.toFixed(2) }})
            </option>
          </select>
        </div>
  
        <div v-if="selectedProduct && selectedPriceRule" class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-2 text-gray-800">Discounted Price</h3>
          <p class="text-gray-600">₱{{ calculateDiscountedPrice().toFixed(2) }}</p>
        </div>
  
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="emit('cancel')"
            class="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!canSubmit"
            class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#FF9934] hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934] disabled:opacity-50"
          >
            Add Product Price Rule
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { defineEmits } from 'vue'
  import { useProductPriceRuleStore } from '@/store/modules/productPriceRules'
  import { usePriceRuleStore } from '@/store/modules/priceRules'
  import debounce from 'lodash/debounce'
  
  const emit = defineEmits(['save', 'cancel'])
  
  const productPriceRuleStore = useProductPriceRuleStore()
  const priceRuleStore = usePriceRuleStore()
  
  const productSearch = ref('')
  const searchResults = ref([])
  const selectedProduct = ref(null)
  const selectedPriceRule = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  const priceRules = computed(() => {
    const now = new Date()
    return priceRuleStore.priceRules.filter(rule => 
      priceRuleStore.isRuleActive(rule) || (rule.startDate > now)
    )
  })
  
  const canSubmit = computed(() => selectedProduct.value && selectedPriceRule.value)
  
  const searchProducts = async () => {
    if (productSearch.value.length > 0) {
      loading.value = true
      error.value = null
      try {
        const results = await productPriceRuleStore.searchProducts(productSearch.value)
        searchResults.value = results
        if (results.length === 0) {
          error.value = 'No products found'
        }
      } catch (err) {
        error.value = 'Error searching products. Please try again.'
        console.error(err)
      } finally {
        loading.value = false
      }
    } else {
      searchResults.value = []
      error.value = null
    }
  }
  
  const debouncedSearchProducts = debounce(searchProducts, 300)
  
  const selectProduct = (product) => {
    selectedProduct.value = product
    productSearch.value = product.name
    searchResults.value = []
  }
  
  const cancelSelectedProduct = () => {
    selectedProduct.value = null
    productSearch.value = ''
  }
  
  const calculateDiscountedPrice = () => {
    if (!selectedProduct.value || !selectedPriceRule.value) return 0
  
    const originalPrice = selectedProduct.value.price
    if (selectedPriceRule.value.type === 'percentage') {
      return originalPrice * (1 - selectedPriceRule.value.value / 100)
    } else {
      return Math.max(0, originalPrice - selectedPriceRule.value.value)
    }
  }
  
  const handleSubmit = () => {
    if (canSubmit.value) {
      const newProductPriceRule = {
        productId: selectedProduct.value.id,
        productName: selectedProduct.value.name,
        priceRuleId: selectedPriceRule.value.id,
        priceRuleName: selectedPriceRule.value.name,
        originalPrice: selectedProduct.value.price,
        discountedPrice: calculateDiscountedPrice()
      }
      
      productPriceRuleStore.addProductPriceRule(newProductPriceRule)
      emit('save', newProductPriceRule)
      // Reset form after submission
      selectedProduct.value = null
      selectedPriceRule.value = null
      productSearch.value = ''
    }
  }
  </script>
  
  